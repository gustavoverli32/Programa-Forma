import assert from "node:assert/strict";
import test from "node:test";
import {
  didTrailChecklistChange,
  getPendingMonthlyChecklistStudents,
  isMonthlyChecklistWindow,
  wasChecklistUpdatedThisMonth,
} from "./monthly-checklist.ts";

test("detects a real checklist change without depending on object key order", () => {
  assert.equal(
    didTrailChecklistChange(
      { iniciante_1: [false], iniciante_0: [true, false] },
      { iniciante_0: [true, false], iniciante_1: [false] },
    ),
    false,
  );
  assert.equal(
    didTrailChecklistChange(
      { iniciante_0: [true, false] },
      { iniciante_0: [true, true] },
    ),
    true,
  );
});

test("opens the monthly checklist window only in the final seven days", () => {
  assert.equal(isMonthlyChecklistWindow(new Date("2026-08-24T12:00:00-03:00")), false);
  assert.equal(isMonthlyChecklistWindow(new Date("2026-08-25T12:00:00-03:00")), true);
  assert.equal(isMonthlyChecklistWindow(new Date("2026-02-22T12:00:00-03:00")), true);
});

test("recognizes a checklist update made in the current Sao Paulo month", () => {
  const now = new Date("2026-08-30T12:00:00-03:00");
  assert.equal(wasChecklistUpdatedThisMonth("2026-08-02T10:00:00Z", now), true);
  assert.equal(wasChecklistUpdatedThisMonth("2026-07-31T23:00:00Z", now), false);
  assert.equal(wasChecklistUpdatedThisMonth(null, now), false);
});

test("returns only directly assigned GA students still pending", () => {
  const students = [
    { id: "1", nome: "Ana", perfil: { ga_funcional: "123456789" } },
    {
      id: "2",
      nome: "Bia",
      perfil: {
        ga_funcional: "123456789",
        ultima_atualizacao_checklist_trilha: "2026-08-26T15:00:00Z",
      },
    },
    { id: "3", nome: "Caio", perfil: { ga_funcional: "987654321" } },
  ];
  const pending = getPendingMonthlyChecklistStudents(
    students,
    { funcional: "123456789", tipo_gestor: "ga" },
    true,
    new Date("2026-08-29T12:00:00-03:00"),
  );
  assert.deepEqual(pending.map((student) => student.id), ["1"]);
});

test("uses the direct GGA link and obeys the enabled setting", () => {
  const students = [
    { id: "1", nome: "Ana", perfil: { gga_funcional: "111222333" } },
    { id: "2", nome: "Bia", perfil: { gga_funcional: "999888777" } },
  ];
  const manager = { funcional: "111222333", tipo_gestor: "gga" };
  const now = new Date("2026-08-31T12:00:00-03:00");
  assert.deepEqual(
    getPendingMonthlyChecklistStudents(students, manager, true, now).map(
      (student) => student.id,
    ),
    ["1"],
  );
  assert.deepEqual(getPendingMonthlyChecklistStudents(students, manager, false, now), []);
});
