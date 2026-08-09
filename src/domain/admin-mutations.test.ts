import assert from "node:assert/strict";
import test from "node:test";
import {
  parseAppointment,
  parseLegacySetting,
  parseManagerAdmin,
  parseMeeting,
  parseStudentMutation,
} from "./admin-mutations.ts";

test("sanitizes a complete student mutation", () => {
  const student = parseStudentMutation({
    name: " Ana Silva ",
    months: Array(6).fill("Pendente"),
    notes: "Acompanhamento",
    attention: true,
    profile: { funcional: "123456789", agencia: "3185", inicio: "2026-08-01" },
    trailChecks: { iniciante_0: [true, false] },
  });
  assert.equal(student.name, "Ana Silva");
  assert.equal(student.attention, true);
});

test("blocks invalid manager permissions and accepts known fields", () => {
  const manager = parseManagerAdmin({
    permissions: { trilhas: true, ranking: false, todos_estagiarios: true, admin: true },
    managerType: "gga",
    password: "1234",
  });
  assert.deepEqual(manager.permissions, {
    trilhas: true,
    ranking: false,
    todos_estagiarios: true,
  });
});

test("accepts only known legacy settings", () => {
  assert.deepEqual(parseLegacySetting({ key: "timeline", value: [true, false, false, false, false, false] }), {
    key: "timeline",
    value: [true, false, false, false, false, false],
  });
  assert.throws(() => parseLegacySetting({ key: "service_role", value: "secret" }));
});

test("rejects appointments with invalid student ids", () => {
  assert.throws(() =>
    parseAppointment({
      title: "Aula",
      date: "2026-08-10",
      presence: [{ studentId: "invalid", present: true }],
    }),
  );
});

test("accepts a valid appointment and normalizes presence", () => {
  const appointment = parseAppointment({
    title: "Aula de produtos",
    date: "2026-08-08",
    type: "aula",
    targetPhase: "todos",
    description: "Conteudo da aula",
    presence: [
      { studentId: "123e4567-e89b-42d3-a456-426614174000", present: true },
    ],
  });
  assert.equal(appointment.title, "Aula de produtos");
  assert.deepEqual(appointment.presence, [
    { estagiario_id: "123e4567-e89b-42d3-a456-426614174000", presente: true },
  ]);
});

test("rejects external appointment file urls", () => {
  assert.throws(
    () =>
      parseAppointment({
        title: "Aula",
        date: "2026-08-08",
        type: "aula",
        targetPhase: "todos",
        fileUrl: "https://example.com/arquivo.pdf",
        presence: [],
      }),
    /Endereco do arquivo invalido/,
  );
});

test("validates meeting dates instead of accepting impossible dates", () => {
  assert.throws(
    () => parseMeeting({ title: "Encontro", date: "2026-02-30", description: "" }),
    /Data invalida/,
  );
});
