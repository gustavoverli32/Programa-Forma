const REASONS = ["Promovido", "Desligado", "Outro"] as const;

export function parseArchiveReason(value: unknown) {
  if (!value || typeof value !== "object") {
    throw new Error("Informe o motivo do arquivamento.");
  }
  const reason = String((value as Record<string, unknown>).reason ?? "").trim();
  if (!REASONS.includes(reason as (typeof REASONS)[number])) {
    throw new Error("Motivo de arquivamento invalido.");
  }
  return reason;
}

export function archiveExpiryDate(archivedAt: Date) {
  const year = archivedAt.getUTCFullYear();
  const month = archivedAt.getUTCMonth();
  const day = archivedAt.getUTCDate();
  const targetMonthStart = new Date(
    Date.UTC(year, month + 6, 1, archivedAt.getUTCHours(), archivedAt.getUTCMinutes(), archivedAt.getUTCSeconds()),
  );
  const lastTargetDay = new Date(
    Date.UTC(targetMonthStart.getUTCFullYear(), targetMonthStart.getUTCMonth() + 1, 0),
  ).getUTCDate();
  targetMonthStart.setUTCDate(Math.min(day, lastTargetDay));
  return targetMonthStart;
}
