import assert from "node:assert/strict";
import test from "node:test";
import { parseProductionBatchInput, summarizeProduction } from "./production.ts";

test("validates and deduplicates production entries", () => {
  const parsed = parseProductionBatchInput({
    studentId: "123",
    quarterRef: "2026-Q3",
    target: 100,
    entries: [
      { ref: "2026-Q3-M2-S1-MOD0", value: 10 },
      { ref: "2026-Q3-M2-S1-MOD0", value: 20 },
    ],
  });
  assert.deepEqual(parsed.entries, [{ ref: "2026-Q3-M2-S1-MOD0", value: 20 }]);
});

test("rejects references outside the selected quarter", () => {
  assert.throws(
    () =>
      parseProductionBatchInput({
        studentId: "123",
        quarterRef: "2026-Q3",
        target: 100,
        entries: [{ ref: "2026-Q2-M2-S1-MOD0", value: 10 }],
      }),
    /Item de producao invalido/,
  );
});

test("calculates the existing 6 plus 4 score composition", () => {
  const summary = summarizeProduction(
    [
      { estagiario_id: 1, tri_ref: "2026-Q3-M1-S1-MOD0", meta: 0, producao: 80 },
      { estagiario_id: 1, tri_ref: "2026-Q3-M1-S1-OUT0", meta: 0, producao: 10 },
    ],
    "2026-Q3",
    100,
  );
  assert.equal(summary.creditScore, 4.8);
  assert.equal(summary.productsScore, 2);
  assert.equal(summary.score, 6.8);
  assert.equal(summary.total, 90);
});

test("allows production to be cleared to zero", () => {
  const summary = summarizeProduction(
    [
      { estagiario_id: 1, tri_ref: "2026-Q3", meta: 100, producao: 80 },
      { estagiario_id: 1, tri_ref: "2026-Q3-M1-S1-MOD0", meta: 0, producao: 0 },
    ],
    "2026-Q3",
    100,
  );
  assert.equal(summary.credit, 0);
  assert.equal(summary.score, 0);
});
