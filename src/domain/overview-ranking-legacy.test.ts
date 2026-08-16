import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const sourceHtml = readFileSync(resolve(projectRoot, "src/legacy/source.html"), "utf8");
const sourceApp = readFileSync(resolve(projectRoot, "assets/js/app.js"), "utf8");
const runtimeApp = readFileSync(resolve(projectRoot, "public/legacy/app.js"), "utf8");

test("places the learning-path distribution card at the end of the overview", () => {
  const rankingPosition = sourceHtml.indexOf('id="cardRanking"');
  const learningPathPosition = sourceHtml.indexOf('id="overviewTrilhaCard"');

  assert.ok(rankingPosition >= 0);
  assert.ok(learningPathPosition > rankingPosition);
});

test("keeps credit and target percentage as the general ranking filters", () => {
  assert.match(sourceHtml, /value="credito"/);
  assert.match(sourceHtml, /value="percentual_alvo"/);
  assert.doesNotMatch(sourceHtml, /value="produtos"/);
  assert.doesNotMatch(sourceHtml, /value="engajamento_total"/);
});

test("opens the existing student profile from a ranking name", () => {
  assert.match(sourceApp, /class="ranking-student-link"/);
  assert.match(sourceApp, /openPanelById\(this\.dataset\.rankingEid\)/);
  assert.match(sourceApp, /function getPercentualAlvoRanking\(e, tri\)/);
});

test("keeps the active ranking implementation synchronized", () => {
  const getRankingSection = (content: string) =>
    content.slice(
      content.indexOf("function getPercentualAlvoRanking"),
      content.indexOf("async function salvarSnapshot"),
    );

  assert.equal(getRankingSection(runtimeApp), getRankingSection(sourceApp));
});

test("edits student registration data directly from the profile panel", () => {
  assert.match(sourceHtml, /id="btnEditarInfoEstagiario"/);
  assert.match(sourceHtml, /id="pInfoEditor"/);
  assert.match(sourceApp, /async function savePanelInfo\(\)/);
  assert.match(sourceApp, /await saveEstagiario\(current\)/);
  assert.equal(runtimeApp.includes("async function savePanelInfo()"), true);
});

test("filters managers by name or employee code in registration", () => {
  assert.match(sourceHtml, /id="gestorBusca"/);
  assert.match(sourceApp, /function normalizeGestorBusca\(value\)/);
  assert.match(sourceApp, /normalizeGestorBusca\(g\.nome\)\.includes\(searchTerm\)/);
  assert.match(sourceApp, /normalizeGestorBusca\(g\.funcional\)\.includes\(searchTerm\)/);
  assert.equal(runtimeApp.includes("function normalizeGestorBusca(value)"), true);
});
