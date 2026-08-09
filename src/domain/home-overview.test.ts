import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateConsolidatedKpis,
  calculateRankings,
  formatDateLong,
  formatQuarterName,
} from "./home-overview.ts";
import type { StudentItem } from "./student-monitoring.ts";
import type { ProductionRow } from "./production.ts";

test("formats long date and quarter name correctly", () => {
  const d = new Date("2026-08-09T12:00:00Z");
  assert.equal(formatQuarterName(d), "3º Tri 2026");
  assert.ok(formatDateLong(d).length > 5);
});

test("calculates consolidated KPIs and phase distribution", () => {
  const students: StudentItem[] = [
    { id: "1", nome: "Ana", atencao: true, perfil: { inicio: "2026-07-01" } },
    { id: "2", nome: "Bruno", atencao: false, perfil: { inicio: "2026-01-01" } },
  ];
  const rows: ProductionRow[] = [
    { estagiario_id: "1", tri_ref: "2026-Q3", meta: 0, producao: 0, ref_item: "cred_INSS", valor: 5000 },
    { estagiario_id: "1", tri_ref: "2026-Q3", meta: 0, producao: 0, ref_item: "out_Seguros", valor: 10 },
  ];

  const kpis = calculateConsolidatedKpis(students, rows);
  assert.equal(kpis.totalStudents, 2);
  assert.equal(kpis.attentionCount, 1);
  assert.equal(kpis.totalCreditAmount, 5000);
  assert.equal(kpis.totalProductsAmount, 10);
  assert.equal(kpis.phaseCounts.iniciante, 1);
  assert.equal(kpis.phaseCounts.avancado, 1);
});

test("calculates rankings and assigns positions correctly", () => {
  const students: StudentItem[] = [
    { id: "1", nome: "Ana", perfil: { agencia: "0001" } },
    { id: "2", nome: "Bruno", perfil: { agencia: "0002" } },
  ];
  const rows: ProductionRow[] = [
    { estagiario_id: "1", tri_ref: "2026-Q3", meta: 0, producao: 0, ref_item: "cred_INSS", valor: 10000 },
    { estagiario_id: "2", tri_ref: "2026-Q3", meta: 0, producao: 0, ref_item: "cred_INSS", valor: 50000 },
  ];

  const rankByCredit = calculateRankings(students, rows, "credito");
  assert.equal(rankByCredit[0].studentName, "Bruno");
  assert.equal(rankByCredit[0].position, 1);
  assert.equal(rankByCredit[1].studentName, "Ana");
  assert.equal(rankByCredit[1].position, 2);
});
