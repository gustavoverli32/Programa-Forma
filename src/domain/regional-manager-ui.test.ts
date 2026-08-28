import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const sourceHtml = readFileSync("src/legacy/source.html", "utf8");
const sourceApp = readFileSync("assets/js/app.js", "utf8");
const appointmentRoute = readFileSync("src/app/api/appointments/[id]/route.ts", "utf8");

test("exposes Gerente Regional in the permission dialog", () => {
  assert.match(sourceHtml, /id="tipoLiderRegional"/);
  assert.match(sourceHtml, /Gerente Regional/);
  assert.match(sourceApp, /tipoLiderRegional/);
});

test("keeps the regional manager restricted to their linked regional", () => {
  assert.match(sourceApp, /function isGerenteRegional\(\)/);
  assert.match(sourceApp, /getRegionalDoGerenteRegional/);
  assert.match(sourceApp, /if\(isRegionalManager\)/);
  assert.match(appointmentRoute, /manager\.tipo_gestor !== "lider_regional"/);
});
