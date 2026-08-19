import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const html = readFileSync("src/legacy/source.html", "utf8");
const app = readFileSync("assets/js/app.js", "utf8");
const deployedApp = readFileSync("public/legacy/app.js", "utf8");
const bootstrap = readFileSync("src/app/api/data/bootstrap/route.ts", "utf8");

test("publica no Next.js o mesmo runtime legado validado pelos testes", () => {
  assert.equal(deployedApp, app);
});

test("oferece arquivamento no perfil e histórico por seis meses", () => {
  assert.match(html, /id="btnArchiveStudent"/);
  assert.match(html, /id="archivedStudentsSection"/);
  assert.match(html, /id="archivedStudentsSection"[^>]*display\s*:\s*none/);
  assert.match(html, /histórico continuará disponível por 6 meses/i);
  assert.match(app, /archiveStudent\(/);
  assert.match(html, /Tem certeza de que deseja arquivar\?/);
  assert.match(html, /id="archiveStudentName"/);
  assert.match(app, /archiveButton\.dataset\.studentId\s*=\s*String\(e\.id\)/);
  assert.match(app, /overlay\.dataset\.studentId\s*=\s*String\(student\.id\)/);
  assert.match(app, /btnArchiveStudent[\s\S]*?event\.preventDefault\(\)[\s\S]*?event\.stopPropagation\(\)/);
  assert.ok(app.indexOf("target.id === 'btnArchiveStudent'") < app.indexOf("onNextuberReady(function(){"));
  assert.match(app, /getElementById\(['"]cadList['"]\)\.querySelectorAll\(['"]\.cad-list-btn:not\(\.cad-del-btn\)['"]\)/);
  assert.match(app, /section\.style\.display\s*=\s*editor\s*\?\s*['"]block['"]\s*:\s*['"]none['"]/);
  assert.match(bootstrap, /archivedStudents\s*=\s*\[\]/);
  assert.match(bootstrap, /readableStudentIds\s*=\s*new Set\(\s*activeRows/);
});

test("inclui configuracoes entre as permissoes conhecidas do gestor", () => {
  assert.match(html, /id="permConfiguracoes"/);
  assert.match(app, /perms\.configuracoes/);
  assert.match(app, /p\.configuracoes/);
  assert.match(app, /podeVerConfiguracoes\s*=\s*p\.configuracoes\s*===\s*true/);
  assert.match(app, /data-page="configuracoes"[\s\S]*?podeVerConfiguracoes\s*\?\s*['"]['"]\s*:\s*['"]none['"]/);
  assert.ok(app.indexOf("target.id === 'btnSalvarPermissoes'") < app.indexOf("onNextuberReady(function(){"));
  assert.match(app, /Permissões salvas com sucesso!/);
});

test("o navegador nao envia contexto de estagiarios para a rota da IA", () => {
  const sendBlock = app.slice(app.indexOf("async function aiSendMessage"), app.indexOf("function initAIListeners"));
  assert.doesNotMatch(sendBlock, /contexto\s*:/);
});
