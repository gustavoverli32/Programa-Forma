import test from "node:test";
import assert from "node:assert/strict";
import {
  filterAppointments,
  formatDeadlineStatus,
  TRILHAS_FULL_DATA,
  type AppointmentItem,
} from "./program.ts";

test("contains all 3 trilhas phases with complete topic metadata", () => {
  assert.ok(TRILHAS_FULL_DATA.iniciante);
  assert.ok(TRILHAS_FULL_DATA.intermediario);
  assert.ok(TRILHAS_FULL_DATA.avancado);
  assert.equal(TRILHAS_FULL_DATA.iniciante.topicos.length, 3);
  assert.equal(TRILHAS_FULL_DATA.intermediario.topicos.length, 3);
  assert.equal(TRILHAS_FULL_DATA.avancado.topicos.length, 2);
});

test("filters appointments by phase and type", () => {
  const items: AppointmentItem[] = [
    { id: "1", titulo: "Aula 1", fase: "fase1", tipo: "aula", data: "2026-08-10" },
    { id: "2", titulo: "Workshop", fase: "fase2", tipo: "workshop", data: "2026-08-12" },
  ];

  const filteredFase1 = filterAppointments(items, "fase1", "todos");
  assert.equal(filteredFase1.length, 1);
  assert.equal(filteredFase1[0].id, "1");

  const filteredWorkshop = filterAppointments(items, "todos", "workshop");
  assert.equal(filteredWorkshop.length, 1);
  assert.equal(filteredWorkshop[0].id, "2");
});

test("calculates deadline status accurately", () => {
  const now = new Date("2026-08-10T12:00:00Z");

  const future = formatDeadlineStatus("2026-08-15T12:00:00Z", now);
  assert.equal(future.daysRemaining, 5);
  assert.equal(future.statusColor, "#166534");

  const warning = formatDeadlineStatus("2026-08-11T12:00:00Z", now);
  assert.equal(warning.daysRemaining, 1);
  assert.equal(warning.statusColor, "#D97706");

  const expired = formatDeadlineStatus("2026-08-01T12:00:00Z", now);
  assert.ok(expired.daysRemaining < 0);
  assert.equal(expired.statusColor, "#DC2626");
});
