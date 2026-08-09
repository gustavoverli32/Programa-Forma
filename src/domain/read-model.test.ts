import assert from "node:assert/strict";
import test from "node:test";
import {
  isStudentAssignedToManager,
  privateStudent,
  publicStudent,
  sanitizeProjectTexts,
  type StudentReadRow,
} from "./read-model.ts";

const student: StudentReadRow = {
  id: "student-1",
  nome: "Pessoa Teste",
  meses: ["Pendente"],
  obs: "anotacao privada",
  atencao: true,
  perfil: {
    agencia: "0001",
    inicio: "2026-01-01",
    certificacao: "CPA-10",
    funcional: "123456789",
    ga_funcional: "111111111",
    gga_funcional: "222222222",
    ultima_verificacao_producao: "2026-08-07",
  },
  trilha_checks: { iniciante_0: [true] },
  gestor_funcional: "333333333",
  created_at: "2026-01-01T00:00:00Z",
};

test("public projection removes private student fields", () => {
  const result = publicStudent(student);
  assert.equal(result.obs, "");
  assert.equal(result.atencao, false);
  assert.deepEqual(result.trilha_checks, {});
  assert.deepEqual(result.perfil, {
    agencia: "0001",
    inicio: "2026-01-01",
    certificacao: "CPA-10",
  });
  assert.equal("gestor_funcional" in result, false);
  assert.equal("senha_hash" in result, false);
});

test("private projection never includes password hashes", () => {
  const result = privateStudent(student);
  assert.equal(result.obs, "anotacao privada");
  assert.equal("senha_hash" in result, false);
});

test("recognizes GA, GGA, and legacy manager assignments", () => {
  assert.equal(isStudentAssignedToManager(student, "111111111"), true);
  assert.equal(isStudentAssignedToManager(student, "222222222"), true);
  assert.equal(isStudentAssignedToManager(student, "333333333"), true);
  assert.equal(isStudentAssignedToManager(student, "999999999"), false);
});

test("replaces forbidden target terminology in project copy", () => {
  assert.deepEqual(
    sanitizeProjectTexts({
      title: "Meta atingida",
      body: "Acompanhe metas e META semanal.",
    }),
    {
      title: "Alvo atingido",
      body: "Acompanhe alvos e ALVO semanal.",
    },
  );
});
