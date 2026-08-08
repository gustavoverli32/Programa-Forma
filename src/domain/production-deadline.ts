export const PRODUCTION_TIME_ZONE = "America/Sao_Paulo";

export type ProductionConfig = {
  prazo_producao_manual?: unknown;
  prazo_producao_manual_semana?: unknown;
};

export type ProductionProfile = Record<string, unknown> & {
  ultima_atualizacao_prod?: string;
  producao_verificada_prazo?: string;
};

export type ProductionUpdateStatus = "ok" | "alerta" | "atrasado";

const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const QUARTER_PATTERN = /^(\d{4})-Q([1-4])$/;

export function isYmd(value: unknown): value is string {
  if (typeof value !== "string" || !YMD_PATTERN.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function localYmd(
  date = new Date(),
  timeZone = PRODUCTION_TIME_ZONE,
) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function addDays(ymd: string, amount: number) {
  const date = new Date(`${ymd}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function weekday(ymd: string) {
  return new Date(`${ymd}T12:00:00Z`).getUTCDay();
}

export function getWeekStartYmd(now = new Date()) {
  const today = localYmd(now);
  const day = weekday(today);
  return addDays(today, day === 0 ? -6 : 1 - day);
}

export function getDefaultProductionDeadline(now = new Date()) {
  const today = localYmd(now);
  const day = weekday(today);
  return addDays(today, day === 0 ? -2 : 5 - day);
}

export function getCurrentProductionDeadline(
  config: ProductionConfig | null | undefined,
  now = new Date(),
) {
  const currentWeek = getWeekStartYmd(now);
  if (
    isYmd(config?.prazo_producao_manual) &&
    config?.prazo_producao_manual_semana === currentWeek
  ) {
    return config.prazo_producao_manual;
  }
  return getDefaultProductionDeadline(now);
}

export function getProductionUpdateStatus(
  profile: ProductionProfile | null | undefined,
  config: ProductionConfig | null | undefined,
  now = new Date(),
): ProductionUpdateStatus {
  const deadline = getCurrentProductionDeadline(config, now);
  if (profile?.producao_verificada_prazo === deadline) return "ok";
  return localYmd(now) >= deadline ? "atrasado" : "alerta";
}

export function markProductionVerified(
  profile: ProductionProfile | null | undefined,
  config: ProductionConfig | null | undefined,
  now = new Date(),
) {
  const deadline = getCurrentProductionDeadline(config, now);
  const today = localYmd(now);
  const nextProfile: ProductionProfile = {
    ...(profile ?? {}),
    ultima_atualizacao_prod: today,
  };
  const confirmed = today <= deadline;
  if (confirmed) nextProfile.producao_verificada_prazo = deadline;
  return { profile: nextProfile, confirmed, deadline, today };
}

export function quantityWeeksInMonth(
  quarterRef: string,
  monthIndex: number,
  now = new Date(),
) {
  const match = QUARTER_PATTERN.exec(quarterRef);
  if (!match || !Number.isInteger(monthIndex) || monthIndex < 1 || monthIndex > 3) {
    return 4;
  }

  const year = Number(match[1]);
  const quarter = Number(match[2]);
  const month = (quarter - 1) * 3 + monthIndex;
  const today = localYmd(now);
  const currentYear = Number(today.slice(0, 4));
  const currentMonth = Number(today.slice(5, 7));

  if (year * 12 + month < currentYear * 12 + currentMonth) return 4;
  return Math.ceil(new Date(Date.UTC(year, month, 0)).getUTCDate() / 7);
}
