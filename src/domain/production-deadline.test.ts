import assert from "node:assert/strict";
import test from "node:test";
import {
  getCurrentProductionDeadline,
  getProductionUpdateStatus,
  getWeekStartYmd,
  markProductionVerified,
  quantityWeeksInMonth,
} from "./production-deadline.ts";

const atSaoPauloNoon = (ymd: string) => new Date(`${ymd}T15:00:00Z`);

test("uses Friday as the weekly deadline", () => {
  assert.equal(getCurrentProductionDeadline({}, atSaoPauloNoon("2026-08-03")), "2026-08-07");
  assert.equal(getCurrentProductionDeadline({}, atSaoPauloNoon("2026-08-08")), "2026-08-07");
  assert.equal(getCurrentProductionDeadline({}, atSaoPauloNoon("2026-08-09")), "2026-08-07");
});

test("uses a manual date only in the matching week", () => {
  const config = {
    prazo_producao_manual: "2026-08-06",
    prazo_producao_manual_semana: "2026-08-03",
  };
  assert.equal(getWeekStartYmd(atSaoPauloNoon("2026-08-05")), "2026-08-03");
  assert.equal(getCurrentProductionDeadline(config, atSaoPauloNoon("2026-08-05")), "2026-08-06");
  assert.equal(getCurrentProductionDeadline(config, atSaoPauloNoon("2026-08-10")), "2026-08-14");
});

test("keeps the alert until the current deadline is confirmed", () => {
  const monday = atSaoPauloNoon("2026-08-03");
  assert.equal(getProductionUpdateStatus({}, {}, monday), "alerta");
  assert.equal(
    getProductionUpdateStatus(
      { producao_verificada_prazo: "2026-07-31" },
      {},
      monday,
    ),
    "alerta",
  );
  assert.equal(
    getProductionUpdateStatus(
      { producao_verificada_prazo: "2026-08-07" },
      {},
      monday,
    ),
    "ok",
  );
  assert.equal(getProductionUpdateStatus({}, {}, atSaoPauloNoon("2026-08-07")), "atrasado");
});

test("does not clear an expired cycle", () => {
  const result = markProductionVerified({}, {}, atSaoPauloNoon("2026-08-08"));
  assert.equal(result.confirmed, false);
  assert.equal(result.profile.ultima_atualizacao_prod, "2026-08-08");
  assert.equal(result.profile.producao_verificada_prazo, undefined);
});

test("preserves four historical weeks and enables five for current/future months", () => {
  const now = atSaoPauloNoon("2026-08-08");
  assert.equal(quantityWeeksInMonth("2026-Q2", 3, now), 4);
  assert.equal(quantityWeeksInMonth("2026-Q3", 2, now), 5);
  assert.equal(quantityWeeksInMonth("2026-Q4", 1, now), 5);
});
