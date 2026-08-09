import assert from "node:assert/strict";
import test from "node:test";
import type { ProductionRow } from "./production.ts";
import {
  currentQuarterMonthIndex,
  itemMonthTotal,
  monthEntries,
  monthTotal,
  parseAmount,
  productionRef,
  productionValues,
  quarterCreditTotal,
  quarterMonths,
  targetForQuarter,
  weekTotal,
} from "./production-view.ts";

const atSaoPauloNoon = (ymd: string) => new Date(`${ymd}T15:00:00Z`);

test("maps the selected quarter and its current month", () => {
  const now = atSaoPauloNoon("2026-08-09");
  assert.deepEqual(quarterMonths("2026-Q3"), ["Jul", "Ago", "Set"]);
  assert.equal(currentQuarterMonthIndex("2026-Q3", now), 2);
  assert.equal(currentQuarterMonthIndex("2026-Q2", now), 3);
  assert.equal(currentQuarterMonthIndex("2026-Q4", now), 1);
});

test("builds all 45 entries for a five-week month", () => {
  const now = atSaoPauloNoon("2026-08-09");
  const values = {
    [productionRef("2026-Q3", 2, 5, "MOD", 0)]: 125,
    [productionRef("2026-Q3", 2, 5, "OUT", 4)]: 7,
  };
  const entries = monthEntries(values, "2026-Q3", 2, now);

  assert.equal(entries.length, 45);
  assert.deepEqual(entries.at(-9), {
    ref: "2026-Q3-M2-S5-MOD0",
    value: 125,
  });
  assert.deepEqual(entries.at(-1), {
    ref: "2026-Q3-M2-S5-OUT4",
    value: 7,
  });
});

test("calculates weekly, monthly and quarterly credit totals", () => {
  const now = atSaoPauloNoon("2026-08-09");
  const values = {
    "2026-Q3-M2-S1-MOD0": 100,
    "2026-Q3-M2-S1-MOD1": 50,
    "2026-Q3-M2-S2-MOD0": 25,
  };

  assert.equal(weekTotal(values, "2026-Q3", 2, 1, "MOD"), 150);
  assert.equal(itemMonthTotal(values, "2026-Q3", 2, "MOD", 0, now), 125);
  assert.equal(monthTotal(values, "2026-Q3", 2, "MOD", now), 175);
  assert.equal(quarterCreditTotal(values, [], "2026-Q3", now), 175);
});

test("preserves aggregate production and target from legacy records", () => {
  const rows: ProductionRow[] = [
    {
      estagiario_id: "student-1",
      tri_ref: "2026-Q3",
      meta: 1000,
      producao: 700,
    },
  ];
  const values = productionValues(rows);

  assert.equal(targetForQuarter(rows, "2026-Q3"), 1000);
  assert.equal(
    quarterCreditTotal(values, rows, "2026-Q3", atSaoPauloNoon("2026-08-09")),
    700,
  );
  assert.equal(parseAmount("R$ 1.234"), 1234);
});
