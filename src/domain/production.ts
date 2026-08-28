export type ProductionEntry = {
  ref: string;
  value: number;
};

export type ProductionBatchInput = {
  studentId: string;
  quarterRef: string;
  target: number;
  productTargets?: number[];
  entries: ProductionEntry[];
};

// A confirmação semanal representa que o gestor revisou e salvou a produção.
// Um lançamento com valor zero ainda é uma atualização válida: não houve resultado,
// mas a tabela foi conferida. A edição de alvos não envia entries e não confirma.
export function hasProductionEntries(input: Pick<ProductionBatchInput, "entries">) {
  return input.entries.length > 0;
}

export type ProductionRow = {
  estagiario_id: string | number | null;
  tri_ref: string;
  meta: number | string | null;
  producao: number | string | null;
  [key: string]: unknown;
};

const QUARTER_PATTERN = /^\d{4}-Q[1-4]$/;
const STUDENT_ID_PATTERN = /^[a-zA-Z0-9-]{1,128}$/;
const MAX_VALUE = 1_000_000_000_000;
const MAX_ENTRIES = 160;

function isValidValue(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= MAX_VALUE
  );
}

export function isProductionRef(ref: string, quarterRef: string) {
  const escapedQuarter = quarterRef.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^${escapedQuarter}-M[1-3]-S[1-5](?:-MOD[0-3]|-OUT[0-4])?$`,
  ).test(ref);
}

export function parseProductionBatchInput(body: unknown): ProductionBatchInput {
  if (!body || typeof body !== "object") throw new Error("Dados de producao invalidos.");
  const candidate = body as Record<string, unknown>;
  const studentId = String(candidate.studentId ?? "");
  const quarterRef = String(candidate.quarterRef ?? "");
  const target = candidate.target;
  const rawProductTargets = candidate.productTargets;
  const rawEntries = candidate.entries;

  if (!STUDENT_ID_PATTERN.test(studentId)) throw new Error("Estagiario invalido.");
  if (!QUARTER_PATTERN.test(quarterRef)) throw new Error("Trimestre invalido.");
  if (!isValidValue(target)) throw new Error("Alvo invalido.");
  if (
    rawProductTargets !== undefined &&
    (!Array.isArray(rawProductTargets) ||
      rawProductTargets.length !== 5 ||
      rawProductTargets.some((value) => !isValidValue(value)))
  ) {
    throw new Error("Metas de produtos invalidas.");
  }
  if (!Array.isArray(rawEntries) || rawEntries.length > MAX_ENTRIES) {
    throw new Error("Lista de producao invalida.");
  }

  const entries = new Map<string, ProductionEntry>();
  for (const rawEntry of rawEntries) {
    if (!rawEntry || typeof rawEntry !== "object") {
      throw new Error("Item de producao invalido.");
    }
    const entry = rawEntry as Record<string, unknown>;
    const ref = String(entry.ref ?? "");
    if (!isProductionRef(ref, quarterRef) || !isValidValue(entry.value)) {
      throw new Error("Item de producao invalido.");
    }
    entries.set(ref, { ref, value: entry.value });
  }

  return {
    studentId,
    quarterRef,
    target,
    productTargets: rawProductTargets as number[] | undefined,
    entries: [...entries.values()],
  };
}

function numberValue(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function summarizeProduction(
  rows: ProductionRow[],
  quarterRef: string,
  target: number,
) {
  let credit = 0;
  let legacyWeeklyCredit = 0;
  let products = 0;
  let legacyQuarterTotal = 0;
  let hasCreditRows = false;
  let hasLegacyWeeklyRows = false;

  for (const row of rows) {
    if (row.tri_ref === quarterRef) {
      legacyQuarterTotal = numberValue(row.producao);
    } else if (row.tri_ref.startsWith(`${quarterRef}-`) && row.tri_ref.includes("-MOD")) {
      hasCreditRows = true;
      credit += numberValue(row.producao);
    } else if (row.tri_ref.startsWith(`${quarterRef}-`) && row.tri_ref.includes("-OUT")) {
      products += numberValue(row.producao);
    } else if (/\-M[1-3]\-S[1-5]$/.test(row.tri_ref)) {
      hasLegacyWeeklyRows = true;
      legacyWeeklyCredit += numberValue(row.producao);
    }
  }

  if (!hasCreditRows) credit = hasLegacyWeeklyRows ? legacyWeeklyCredit : legacyQuarterTotal;
  const creditScore = Math.round(Math.min(target > 0 ? credit / target : 0, 1) * 60) / 10;
  const productsTarget = target * 0.2;
  const productsScore =
    Math.round(Math.min(productsTarget > 0 ? products / productsTarget : 0, 1) * 40) /
    10;

  return {
    credit,
    products,
    total: credit + products,
    creditScore,
    productsScore,
    score: Math.min(Math.round((creditScore + productsScore) * 10) / 10, 10),
  };
}
