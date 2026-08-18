import {
  CREDIT_MODALITIES,
  OTHER_PRODUCTS,
  currentQuarterRef,
  itemQuarterTotal,
  productionValues,
  productTargetsForQuarter,
  quarterCreditTotal,
  targetForQuarter,
} from "./production-view.ts";
import type { ProductionRow } from "./production.ts";

type AssistantStudent = {
  id: string;
  nome: string;
  perfil?: unknown;
  atencao?: boolean | null;
  arquivado_em?: string | null;
  excluir_em?: string | null;
  motivo_arquivamento?: string | null;
};

function recordValue(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function buildAssistantResultsContext(
  students: AssistantStudent[],
  productionRows: ProductionRow[],
  now = new Date(),
) {
  const quarterRef = currentQuarterRef(now);
  const formatted = students.map((student) => {
    const profile = recordValue(student.perfil);
    const rows = productionRows.filter(
      (row) => String(row.estagiario_id) === String(student.id),
    );
    const values = productionValues(rows);
    const credit = Object.fromEntries(
      CREDIT_MODALITIES.map((name, index) => [
        name,
        itemQuarterTotal(values, quarterRef, "MOD", index, now),
      ]),
    );
    const products = Object.fromEntries(
      OTHER_PRODUCTS.map((name, index) => [
        name,
        itemQuarterTotal(values, quarterRef, "OUT", index, now),
      ]),
    );
    const productTargets = productTargetsForQuarter(rows, quarterRef);
    const seguros = Number(products.Seguros || 0);
    const pic = Number(products.PIC || 0);

    return {
      id: student.id,
      nome: student.nome,
      status: student.arquivado_em ? "arquivado" : "ativo",
      arquivado_em: student.arquivado_em ?? null,
      excluir_em: student.excluir_em ?? null,
      motivo_arquivamento: student.motivo_arquivamento ?? null,
      agencia: profile.agencia ?? null,
      funcional: profile.funcional ?? null,
      trimestre: quarterRef,
      alvo_credito: targetForQuarter(rows, quarterRef),
      producao_credito_total: quarterCreditTotal(values, rows, quarterRef, now),
      producao_credito: credit,
      producao_produtos: products,
      alvos_produtos: Object.fromEntries(
        OTHER_PRODUCTS.map((name, index) => [name, productTargets[index] || 0]),
      ),
      seguro_mais_sorte: seguros + pic,
      sinalizacao_atencao: student.atencao === true,
    };
  });

  const rankings = {
    credito_total: [...formatted]
      .sort((a, b) => b.producao_credito_total - a.producao_credito_total)
      .map((item) => ({ nome: item.nome, valor: item.producao_credito_total })),
    seguro_mais_sorte: [...formatted]
      .sort((a, b) => b.seguro_mais_sorte - a.seguro_mais_sorte)
      .map((item) => ({ nome: item.nome, valor: item.seguro_mais_sorte })),
  };

  return {
    data_atual: now.toISOString().slice(0, 10),
    trimestre_atual: quarterRef,
    total_estagiarios: formatted.length,
    glossario: {
      seguro_mais_sorte: "Soma de Seguros + PIC (capitalizacao)",
      equilibrio: "Soma de INSS + OP + EP + Creditiario",
    },
    rankings,
    estagiarios: formatted,
  };
}
