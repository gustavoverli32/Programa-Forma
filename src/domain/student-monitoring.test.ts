import test from "node:test";
import assert from "node:assert/strict";
import {
  calcDaysInProgram,
  filterAndSortStudents,
  formatDaysInProgram,
  formatWhatsAppUrl,
  getProgramPhaseKey,
  isProductionUpdatePending,
  type StudentItem,
} from "./student-monitoring.ts";

test("calculates days in program accurately", () => {
  const now = new Date("2026-06-15T12:00:00Z");
  assert.equal(calcDaysInProgram("2026-06-05T12:00:00Z", now), 10);
  assert.equal(calcDaysInProgram("2026-05-16T12:00:00Z", now), 30);
  assert.equal(calcDaysInProgram(null, now), 0);
});

test("determines program phase key based on days or override", () => {
  const now = new Date("2026-06-15T12:00:00Z");
  assert.equal(getProgramPhaseKey("2026-05-01", null, now), "iniciante");
  assert.equal(getProgramPhaseKey(null, "avancado", now), "avancado");
});

test("formats days in program into months/days label", () => {
  const now = new Date("2026-06-15T12:00:00Z");
  assert.equal(formatDaysInProgram("2026-06-05T12:00:00Z", now), "10 dias");
  assert.equal(formatDaysInProgram("2026-04-15T12:00:00Z", now), "2 meses (61 dias)");
});

test("formats whatsapp URL with country code and message", () => {
  assert.equal(
    formatWhatsAppUrl("11999998888", "Lucas"),
    "https://wa.me/5511999998888?text=Ol%C3%A1%2C%20Lucas!%20Tudo%20bem%3F",
  );
  assert.equal(formatWhatsAppUrl(null), null);
});

test("detects production update pending after 7 days", () => {
  const now = new Date("2026-06-15T12:00:00Z");
  assert.equal(isProductionUpdatePending("2026-06-10T12:00:00Z", now), false);
  assert.equal(isProductionUpdatePending("2026-06-01T12:00:00Z", now), true);
  assert.equal(isProductionUpdatePending(null, now), true);
});

test("filters and sorts students by name, agency, cert, and score", () => {
  const mockStudents: StudentItem[] = [
    {
      id: "1",
      nome: "Bruno Silva",
      perfil: { agencia: "0001 - Centro", certificacao: "CPA-10", funcional: "F123" },
    },
    {
      id: "2",
      nome: "Ana Souza",
      perfil: { agencia: "0002 - Jardins", certificacao: "C-PRO R", funcional: "F456" },
    },
    {
      id: "3",
      nome: "Carlos Lima",
      perfil: { agencia: "0001 - Centro", certificacao: "Sem certificação", funcional: "F789" },
    },
  ];

  const scores = { "1": 7.5, "2": 9.0, "3": 5.0 };

  const byName = filterAndSortStudents(mockStudents, { sort: "nome" }, scores);
  assert.deepEqual(
    byName.map((s) => s.nome),
    ["Ana Souza", "Bruno Silva", "Carlos Lima"],
  );

  const byHighestScore = filterAndSortStudents(mockStudents, { sort: "maior_nota" }, scores);
  assert.deepEqual(
    byHighestScore.map((s) => s.nome),
    ["Ana Souza", "Bruno Silva", "Carlos Lima"],
  );

  const byAgency = filterAndSortStudents(mockStudents, { agency: "0001 - Centro" }, scores);
  assert.deepEqual(
    byAgency.map((s) => s.nome),
    ["Bruno Silva", "Carlos Lima"],
  );

  const searchCert = filterAndSortStudents(mockStudents, { cert: "CPA" }, scores);
  assert.deepEqual(
    searchCert.map((s) => s.nome),
    ["Bruno Silva"],
  );
});
