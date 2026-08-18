import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync("src/legacy/source.html", "utf8");
const app = readFileSync("assets/js/app.js", "utf8");
const bootstrap = readFileSync("src/app/api/data/bootstrap/route.ts", "utf8");

test("oferece arquivamento no perfil e histórico por seis meses", () => {
  assert.match(html, /id="btnArchiveStudent"/);
  assert.match(html, /id="archivedStudentsSection"/);
  assert.match(html, /id="archivedStudentsSection"[^>]*display\s*:\s*none/);
  assert.match(html, /histórico continuará disponível por 6 meses/i);
  assert.match(app, /archiveStudent\(/);
  assert.match(app, /section\.style\.display\s*=\s*editor\s*\?\s*['"]block['"]\s*:\s*['"]none['"]/);
  assert.match(bootstrap, /archivedStudents\s*=\s*\[\]/);
  assert.match(bootstrap, /readableStudentIds\s*=\s*new Set\(\s*activeRows/);
});

test("inclui configuracoes entre as permissoes conhecidas do gestor", () => {
  assert.match(html, /id="permConfiguracoes"/);
  assert.match(app, /perms\.configuracoes/);
  assert.match(app, /p\.configuracoes/);
});

test("o navegador nao envia contexto de estagiarios para a rota da IA", () => {
  const sendBlock = app.slice(app.indexOf("async function aiSendMessage"), app.indexOf("function initAIListeners"));
  assert.doesNotMatch(sendBlock, /contexto\s*:/);
});
