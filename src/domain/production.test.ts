import assert from "node:assert/strict";
import test from "node:test";
import {
  hasProductionEntries,
  parseProductionBatchInput,
  summarizeProduction,
} from "./production.ts";

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

test("validates the five quarterly product targets", () => {
  const parsed = parseProductionBatchInput({
    studentId: "123",
    quarterRef: "2026-Q3",
    target: 1000,
    productTargets: [10, 20, 30, 40, 50],
    entries: [],
  });
  assert.deepEqual(parsed.productTargets, [10, 20, 30, 40, 50]);

  assert.throws(
    () =>
      parseProductionBatchInput({
        studentId: "123",
        quarterRef: "2026-Q3",
        target: 1000,
        productTargets: [10, 20],
        entries: [],
      }),
    /Metas de produtos invalidas/,
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

test("treats any saved production field as a weekly update, including zero", () => {
  assert.equal(
    hasProductionEntries({ entries: [{ ref: "2026-Q3-M2-S1-MOD0", value: 150 }] }),
    true,
  );
  assert.equal(
    hasProductionEntries({ entries: [{ ref: "2026-Q3-M2-S1-OUT0", value: 0 }] }),
    true,
  );
  assert.equal(hasProductionEntries({ entries: [] }), false);
});
