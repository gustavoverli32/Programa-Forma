import assert from "node:assert/strict";
import test from "node:test";
import { buildAssistantResultsContext } from "./assistant-context.ts";

test("agrega resultados e ranking de seguro mais sorte no trimestre", () => {
  const context = buildAssistantResultsContext(
    [
      { id: "a", nome: "Ana" },
      { id: "b", nome: "Bia" },
    ],
    [
      { estagiario_id: "a", tri_ref: "2026-Q3", meta: 1000, producao: 300 },
      { estagiario_id: "a", tri_ref: "2026-Q3-M2-S1-OUT0", meta: 0, producao: 8 },
      { estagiario_id: "a", tri_ref: "2026-Q3-M2-S1-OUT1", meta: 0, producao: 3 },
      { estagiario_id: "b", tri_ref: "2026-Q3-M2-S1-OUT0", meta: 0, producao: 4 },
      { estagiario_id: "b", tri_ref: "2026-Q3-M2-S1-OUT1", meta: 0, producao: 2 },
    ],
    new Date("2026-08-18T12:00:00-03:00"),
  );

  assert.equal(context.estagiarios[0].seguro_mais_sorte, 11);
  assert.deepEqual(context.rankings.seguro_mais_sorte[0], { nome: "Ana", valor: 11 });
});

test("nao mistura producao de outro trimestre", () => {
  const context = buildAssistantResultsContext(
    [{ id: "a", nome: "Ana" }],
    [
      { estagiario_id: "a", tri_ref: "2026-Q2-M2-S1-OUT0", meta: 0, producao: 99 },
      { estagiario_id: "a", tri_ref: "2026-Q3-M2-S1-OUT0", meta: 0, producao: 5 },
    ],
    new Date("2026-08-18T12:00:00-03:00"),
  );
  assert.equal(context.estagiarios[0].seguro_mais_sorte, 5);
});
