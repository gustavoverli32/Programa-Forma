import type { ProductionEntry, ProductionRow } from "./production.ts";
import { quantityWeeksInMonth } from "./production-deadline.ts";

export const CREDIT_MODALITIES = ["INSS", "OP", "EP", "Creditário"] as const;
export const OTHER_PRODUCTS = [
  "Seguros",
  "PIC",
  "Combinaqui",
  "Capitalização",
  "Consórcio",
] as const;

export const CREDIT_COLORS = ["#2563EB", "#16A34A", "#F59E0B", "#8B5CF6"] as const;
export const OTHER_PRODUCT_COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#EC4899",
  "#14B8A6",
] as const;

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function currentQuarterRef(now = new Date()) {
  return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
}

export function recentQuarterRefs(now = new Date(), quantity = 6) {
  const result: string[] = [];
  let year = now.getFullYear();
  let quarter = Math.floor(now.getMonth() / 3) + 1;
  for (let index = 0; index < quantity; index += 1) {
    result.push(`${year}-Q${quarter}`);
    quarter -= 1;
    if (quarter < 1) {
      quarter = 4;
      year -= 1;
    }
  }
  return result;
}

export function formatQuarter(quarterRef: string) {
  const [year, quarter] = quarterRef.split("-Q");
  return year && quarter ? `${quarter}º Tri ${year}` : "—";
}

export function quarterMonths(quarterRef: string) {
  const quarter = Number(quarterRef.split("-Q")[1]);
  const start = Number.isInteger(quarter) ? (quarter - 1) * 3 : 0;
  return MONTH_NAMES.slice(start, start + 3);
}

export function currentQuarterMonthIndex(quarterRef: string, now = new Date()) {
  const quarter = Number(quarterRef.split("-Q")[1]);
  if (!Number.isInteger(quarter)) return 1;
  const start = (quarter - 1) * 3;
  const current = now.getMonth();
  if (current < start) return 1;
  if (current >= start + 3) return 3;
  return current - start + 1;
}

export function formatAmount(value: number) {
  return value > 0 ? value.toLocaleString("pt-BR") : "";
}

export function parseAmount(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function numberValue(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function productionValues(rows: ProductionRow[]) {
  return Object.fromEntries(rows.map((row) => [row.tri_ref, numberValue(row.producao)]));
}

export function targetForQuarter(rows: ProductionRow[], quarterRef: string) {
  const aggregate = rows.find((row) => row.tri_ref === quarterRef);
  return numberValue(aggregate?.meta);
}

export function productionRef(
  quarterRef: string,
  monthIndex: number,
  weekIndex: number,
  kind: "MOD" | "OUT",
  itemIndex: number,
) {
  return `${quarterRef}-M${monthIndex}-S${weekIndex}-${kind}${itemIndex}`;
}

export function valueAt(values: Record<string, number>, ref: string) {
  return numberValue(values[ref]);
}

export function itemMonthTotal(
  values: Record<string, number>,
  quarterRef: string,
  monthIndex: number,
  kind: "MOD" | "OUT",
  itemIndex: number,
  now = new Date(),
) {
  let total = 0;
  for (let week = 1; week <= quantityWeeksInMonth(quarterRef, monthIndex, now); week += 1) {
    total += valueAt(values, productionRef(quarterRef, monthIndex, week, kind, itemIndex));
  }
  return total;
}

export function weekTotal(
  values: Record<string, number>,
  quarterRef: string,
  monthIndex: number,
  weekIndex: number,
  kind: "MOD" | "OUT",
) {
  const quantity = kind === "MOD" ? CREDIT_MODALITIES.length : OTHER_PRODUCTS.length;
  let total = 0;
  for (let item = 0; item < quantity; item += 1) {
    total += valueAt(values, productionRef(quarterRef, monthIndex, weekIndex, kind, item));
  }
  return total;
}

export function monthTotal(
  values: Record<string, number>,
  quarterRef: string,
  monthIndex: number,
  kind: "MOD" | "OUT",
  now = new Date(),
) {
  const quantity = kind === "MOD" ? CREDIT_MODALITIES.length : OTHER_PRODUCTS.length;
  let total = 0;
  for (let item = 0; item < quantity; item += 1) {
    total += itemMonthTotal(values, quarterRef, monthIndex, kind, item, now);
  }
  return total;
}

export function itemQuarterTotal(
  values: Record<string, number>,
  quarterRef: string,
  kind: "MOD" | "OUT",
  itemIndex: number,
  now = new Date(),
) {
  return [1, 2, 3].reduce(
    (total, month) => total + itemMonthTotal(values, quarterRef, month, kind, itemIndex, now),
    0,
  );
}

export function quarterCreditTotal(
  values: Record<string, number>,
  rows: ProductionRow[],
  quarterRef: string,
  now = new Date(),
) {
  const modalityTotal = CREDIT_MODALITIES.reduce(
    (total, _item, index) => total + itemQuarterTotal(values, quarterRef, "MOD", index, now),
    0,
  );
  if (modalityTotal > 0) return modalityTotal;

  let legacyWeekly = 0;
  for (let month = 1; month <= 3; month += 1) {
    for (let week = 1; week <= quantityWeeksInMonth(quarterRef, month, now); week += 1) {
      legacyWeekly += valueAt(values, `${quarterRef}-M${month}-S${week}`);
    }
  }
  if (legacyWeekly > 0) return legacyWeekly;
  return numberValue(rows.find((row) => row.tri_ref === quarterRef)?.producao);
}

export function monthEntries(
  values: Record<string, number>,
  quarterRef: string,
  monthIndex: number,
  now = new Date(),
) {
  const entries: ProductionEntry[] = [];
  const weeks = quantityWeeksInMonth(quarterRef, monthIndex, now);
  for (let week = 1; week <= weeks; week += 1) {
    CREDIT_MODALITIES.forEach((_item, itemIndex) => {
      const ref = productionRef(quarterRef, monthIndex, week, "MOD", itemIndex);
      entries.push({ ref, value: valueAt(values, ref) });
    });
    OTHER_PRODUCTS.forEach((_item, itemIndex) => {
      const ref = productionRef(quarterRef, monthIndex, week, "OUT", itemIndex);
      entries.push({ ref, value: valueAt(values, ref) });
    });
  }
  return entries;
}

export function resultTone(percent: number) {
  if (percent >= 85) return { color: "#16A34A", background: "#DCFCE7" };
  if (percent >= 50) return { color: "#EC7000", background: "#FFF3E8" };
  return { color: "#DC2626", background: "#FEE2E2" };
}
