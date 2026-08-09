import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanEmployeeCode,
  validateManagerRegistrationInput,
  validateStudentRegistrationInput,
} from "./registration.ts";

test("normalizes employee functional code to 9 digits", () => {
  assert.equal(cleanEmployeeCode("123.456.789-0"), "123456789");
  assert.equal(cleanEmployeeCode("000111222333"), "000111222");
  assert.equal(cleanEmployeeCode(null), "");
});

test("validates student registration input", () => {
  const invalid = validateStudentRegistrationInput({
    nome: "Jo",
    funcional: "123",
    agencia: "",
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.nome);
  assert.ok(invalid.errors.funcional);
  assert.ok(invalid.errors.agencia);

  const valid = validateStudentRegistrationInput({
    nome: "Lucas Silva",
    funcional: "123456789",
    agencia: "0001",
    ga_funcional: "987654321",
  });
  assert.equal(valid.valid, true);
  assert.equal(Object.keys(valid.errors).length, 0);
});

test("validates manager registration input", () => {
  const invalid = validateManagerRegistrationInput({
    nome: "",
    funcional: "abc",
    tipo_gestor: undefined,
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.nome);
  assert.ok(invalid.errors.funcional);
  assert.ok(invalid.errors.tipo_gestor);

  const valid = validateManagerRegistrationInput({
    nome: "Mariana Costa",
    funcional: "111222333",
    tipo_gestor: "gga",
  });
  assert.equal(valid.valid, true);
});
