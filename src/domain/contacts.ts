import { localYmd } from "./production-deadline.ts";

export type ContactDay = {
  dayIndex: number;
  value: number;
};

export type ContactsBatchInput = {
  studentId: string;
  weekRef: string;
  dailyTarget: number;
  days: ContactDay[];
};

const STUDENT_ID_PATTERN = /^[a-zA-Z0-9-]{1,128}$/;
const WEEK_PATTERN = /^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/;
const MAX_CONTACTS = 9_999;

function isContactValue(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_CONTACTS
  );
}

export function getIsoWeekRef(now = new Date()) {
  const ymd = localYmd(now);
  const date = new Date(`${ymd}T12:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const year = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1, 12));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function parseContactsBatchInput(
  body: unknown,
  now = new Date(),
): ContactsBatchInput {
  if (!body || typeof body !== "object") throw new Error("Dados de contatos invalidos.");
  const candidate = body as Record<string, unknown>;
  const studentId = String(candidate.studentId ?? "");
  const weekRef = String(candidate.weekRef ?? "");

  if (!STUDENT_ID_PATTERN.test(studentId)) throw new Error("Estagiario invalido.");
  if (!WEEK_PATTERN.test(weekRef) || weekRef > getIsoWeekRef(now)) {
    throw new Error("Semana invalida.");
  }
  if (!isContactValue(candidate.dailyTarget)) throw new Error("Alvo diario invalido.");
  if (!Array.isArray(candidate.days) || candidate.days.length !== 5) {
    throw new Error("Informe os cinco dias uteis.");
  }

  const days = new Map<number, ContactDay>();
  for (const rawDay of candidate.days) {
    if (!rawDay || typeof rawDay !== "object") throw new Error("Contato diario invalido.");
    const day = rawDay as Record<string, unknown>;
    if (
      typeof day.dayIndex !== "number" ||
      !Number.isInteger(day.dayIndex) ||
      day.dayIndex < 0 ||
      day.dayIndex > 4 ||
      !isContactValue(day.value)
    ) {
      throw new Error("Contato diario invalido.");
    }
    days.set(day.dayIndex, { dayIndex: day.dayIndex, value: day.value });
  }
  if (days.size !== 5) throw new Error("Informe os cinco dias uteis.");

  return {
    studentId,
    weekRef,
    dailyTarget: candidate.dailyTarget,
    days: [...days.values()].sort((a, b) => a.dayIndex - b.dayIndex),
  };
}
