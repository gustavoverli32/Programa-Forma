const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

type StudentForMonthlyChecklist = {
  id: string;
  nome: string;
  gestor_funcional?: string | null;
  perfil?: unknown;
};

type ManagerForMonthlyChecklist = {
  funcional?: string | null;
  tipo_gestor?: string | null;
};

function profileRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stableJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableJson(item)]),
    );
  }
  return value;
}

export function didTrailChecklistChange(current: unknown, next: unknown) {
  return JSON.stringify(stableJson(current ?? {})) !== JSON.stringify(stableJson(next ?? {}));
}

function saoPauloYearMonth(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SAO_PAULO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function isMonthlyChecklistWindow(now = new Date()) {
  const { year, month, day } = saoPauloYearMonth(now);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day >= lastDay - 6;
}

export function wasChecklistUpdatedThisMonth(
  value: unknown,
  now = new Date(),
) {
  if (typeof value !== "string" || !value.trim()) return false;
  const current = saoPauloYearMonth(now);
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (ymd) {
    return Number(ymd[1]) === current.year && Number(ymd[2]) === current.month;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const updated = saoPauloYearMonth(parsed);
  return updated.year === current.year && updated.month === current.month;
}

export function isStudentDirectlyAssigned(
  student: StudentForMonthlyChecklist,
  manager: ManagerForMonthlyChecklist,
) {
  const employeeCode = String(manager.funcional ?? "");
  const managerType = String(manager.tipo_gestor ?? "").toLowerCase();
  if (!employeeCode || !["ga", "gga"].includes(managerType)) return false;
  const profile = profileRecord(student.perfil);
  if (managerType === "gga") {
    return String(profile.gga_funcional ?? "") === employeeCode;
  }
  return (
    String(profile.ga_funcional ?? "") === employeeCode ||
    String(student.gestor_funcional ?? "") === employeeCode
  );
}

export function getPendingMonthlyChecklistStudents(
  students: StudentForMonthlyChecklist[],
  manager: ManagerForMonthlyChecklist,
  enabled = true,
  now = new Date(),
) {
  if (!enabled || !isMonthlyChecklistWindow(now)) return [];
  return students.filter((student) => {
    if (!isStudentDirectlyAssigned(student, manager)) return false;
    const profile = profileRecord(student.perfil);
    return !wasChecklistUpdatedThisMonth(
      profile.ultima_atualizacao_checklist_trilha,
      now,
    );
  });
}
