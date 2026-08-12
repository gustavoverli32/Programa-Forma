import { getProgramPhaseKey, getStudentProfile, type StudentItem } from "./student-monitoring.ts";
import type { ProductionRow } from "./production.ts";

export type HomeKpis = {
  totalStudents: number;
  totalCreditAmount: number;
  totalProductsAmount: number;
  attentionCount: number;
  phaseCounts: {
    iniciante: number;
    intermediario: number;
    avancado: number;
  };
};

export type RankingItem = {
  position: number;
  studentId: string;
  studentName: string;
  agency: string;
  functional: string;
  scoreOrValue: number;
  formattedValue: string;
};

export function formatDateLong(d = new Date()): string {
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatQuarterName(d = new Date()): string {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${q}º Tri ${d.getFullYear()}`;
}

export function calculateConsolidatedKpis(
  students: StudentItem[],
  productionRows: ProductionRow[] = [],
): HomeKpis {
  let attentionCount = 0;
  const phaseCounts = { iniciante: 0, intermediario: 0, avancado: 0 };

  students.forEach((s) => {
    if (s.atencao) attentionCount++;
    const prof = getStudentProfile(s);
    const phaseKey = getProgramPhaseKey(prof.inicio, prof.trilha_manual);
    phaseCounts[phaseKey]++;
  });

  let totalCreditAmount = 0;
  let totalProductsAmount = 0;

  productionRows.forEach((row) => {
    const refItem = typeof row.ref_item === "string" ? row.ref_item : "";
    const valor = typeof row.valor === "number" ? row.valor : 0;
    const isCredit = ["cred_INSS", "cred_OP", "cred_EP", "cred_Crediario"].includes(refItem);
    if (isCredit) {
      totalCreditAmount += valor;
    } else {
      totalProductsAmount += valor;
    }
  });

  return {
    totalStudents: students.length,
    totalCreditAmount,
    totalProductsAmount,
    attentionCount,
    phaseCounts,
  };
}

export function calculateRankings(
  students: StudentItem[],
  productionRows: ProductionRow[],
  filterKey = "nota",
): RankingItem[] {
  const totalsByStudent: Record<string, { credit: number; products: number; itemValues: Record<string, number> }> = {};

  students.forEach((s) => {
    totalsByStudent[s.id] = { credit: 0, products: 0, itemValues: {} };
  });

  productionRows.forEach((row) => {
    const studentId = String(row.estagiario_id ?? "");
    if (!studentId) return;

    if (!totalsByStudent[studentId]) {
      totalsByStudent[studentId] = { credit: 0, products: 0, itemValues: {} };
    }
    const target = totalsByStudent[studentId];
    const refItem = typeof row.ref_item === "string" ? row.ref_item : "";
    const valor = typeof row.valor === "number" ? row.valor : 0;

    if (refItem) {
      target.itemValues[refItem] = (target.itemValues[refItem] || 0) + valor;

      if (refItem.startsWith("cred_")) {
        target.credit += valor;
      } else if (refItem.startsWith("out_")) {
        target.products += valor;
      }
    }
  });

  const ranked = students.map((student) => {
    const prof = getStudentProfile(student);
    const totals = totalsByStudent[student.id] || { credit: 0, products: 0, itemValues: {} };
    let scoreOrValue = 0;
    let formattedValue = "0";

    if (filterKey === "nota") {
      scoreOrValue = (totals.credit / 10000) * 0.6 + (totals.products / 100) * 0.4;
      formattedValue = `${scoreOrValue.toFixed(1)} pts`;
    } else if (filterKey === "credito") {
      scoreOrValue = totals.credit;
      formattedValue = `R$ ${totals.credit.toLocaleString("pt-BR")}`;
    } else if (filterKey === "produtos") {
      const segVal = totals.itemValues["out_Seguros"] || 0;
      const picVal = totals.itemValues["out_PIC"] || 0;
      scoreOrValue = segVal + picVal;
      formattedValue = `${scoreOrValue.toLocaleString("pt-BR")} un`;
    } else if (filterKey === "engajamento_total" || filterKey === "engajamento") {
      const combVal = totals.itemValues["out_Combinaqui"] || 0;
      const engVal = totals.itemValues["out_Engajamento"] || totals.itemValues["out_Capitalização"] || 0;
      scoreOrValue = combVal + engVal;
      formattedValue = `${scoreOrValue.toLocaleString("pt-BR")} un`;
    } else if (totals.itemValues[filterKey] !== undefined) {
      scoreOrValue = totals.itemValues[filterKey];
      const isCreditItem = filterKey.startsWith("cred_");
      formattedValue = isCreditItem
        ? `R$ ${scoreOrValue.toLocaleString("pt-BR")}`
        : `${scoreOrValue.toLocaleString("pt-BR")} un`;
    }

    return {
      studentId: student.id,
      studentName: student.nome,
      agency: prof.agencia || "Sem agência",
      functional: prof.funcional || "—",
      scoreOrValue,
      formattedValue,
    };
  });

  ranked.sort((a, b) => b.scoreOrValue - a.scoreOrValue || a.studentName.localeCompare(b.studentName, "pt-BR"));

  return ranked.map((item, idx) => ({
    ...item,
    position: idx + 1,
  }));
}
