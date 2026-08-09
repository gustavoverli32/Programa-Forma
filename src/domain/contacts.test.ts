import assert from "node:assert/strict";
import test from "node:test";
import { getIsoWeekRef, parseContactsBatchInput } from "./contacts.ts";

const noonInSaoPaulo = (ymd: string) => new Date(`${ymd}T15:00:00Z`);

test("calculates ISO weeks at year boundaries", () => {
  assert.equal(getIsoWeekRef(noonInSaoPaulo("2026-01-01")), "2026-W01");
  assert.equal(getIsoWeekRef(noonInSaoPaulo("2027-01-01")), "2026-W53");
});

test("accepts exactly five unique business days", () => {
  const parsed = parseContactsBatchInput(
    {
      studentId: "student-1",
      weekRef: "2026-W32",
      dailyTarget: 20,
      days: [0, 1, 2, 3, 4].map((dayIndex) => ({ dayIndex, value: dayIndex + 1 })),
    },
    noonInSaoPaulo("2026-08-08"),
  );
  assert.equal(parsed.days.length, 5);
  assert.equal(parsed.days[4].value, 5);
});

test("blocks future weeks and duplicated days", () => {
  assert.throws(
    () =>
      parseContactsBatchInput(
        {
          studentId: "student-1",
          weekRef: "2026-W33",
          dailyTarget: 20,
          days: [0, 1, 2, 3, 4].map((dayIndex) => ({ dayIndex, value: 1 })),
        },
        noonInSaoPaulo("2026-08-08"),
      ),
    /Semana invalida/,
  );

  assert.throws(
    () =>
      parseContactsBatchInput(
        {
          studentId: "student-1",
          weekRef: "2026-W32",
          dailyTarget: 20,
          days: [0, 1, 2, 3, 3].map((dayIndex) => ({ dayIndex, value: 1 })),
        },
        noonInSaoPaulo("2026-08-08"),
      ),
    /cinco dias uteis/,
  );
});
