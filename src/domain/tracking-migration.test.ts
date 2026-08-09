import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const projectRoot = process.cwd();
const nextApplication = "public/legacy/app.js";

test("Next.js runtime delegates authentication and production to protected bridges", () => {
  const source = readFileSync(`${projectRoot}/${nextApplication}`, "utf8");

  assert.equal(source.includes("var PWD"), false);
  assert.equal(source.includes("window.nextuberReads.bootstrap()"), true);
  assert.equal(source.includes("window.nextuberAuth.loginTutor"), true);
  assert.equal(source.includes("window.nextuberAuth.loginManager"), true);
  assert.equal(source.includes("window.nextuberTracking.open"), true);
  assert.equal(source.includes("window.nextuberProduction.verifyToday"), true);
});

test("React production panel keeps the required save confirmation", () => {
  const source = readFileSync(
    `${projectRoot}/src/components/tracking/ProductionTrackingIsland.tsx`,
    "utf8",
  );

  assert.equal(source.includes("Dados salvos"), true);
  assert.equal(source.includes("quantityWeeksInMonth"), true);
  assert.equal(source.includes("nextuberProductionBridge.saveBatch"), true);
});

test("bootstrap limits production rows to readable students", () => {
  const source = readFileSync(
    `${projectRoot}/src/app/api/data/bootstrap/route.ts`,
    "utf8",
  );

  assert.equal(source.includes("readableStudentIds.has(row.estagiario_id)"), true);
});
