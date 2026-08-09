import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const projectRoot = process.cwd();

test("mobile drawer follows the dynamic iOS viewport and safe area", () => {
  for (const path of ["src/app/legacy.css", "assets/css/app.css"]) {
    const source = readFileSync(`${projectRoot}/${path}`, "utf8");
    assert.equal(source.includes("height:100dvh"), true);
    assert.equal(source.includes("min-height:0;overflow-y:auto"), true);
    assert.equal(source.includes("env(safe-area-inset-bottom)"), true);
  }
});

test("opening the drawer locks background scrolling in both runtimes", () => {
  for (const path of ["public/legacy/app.js", "assets/js/app.js"]) {
    const source = readFileSync(`${projectRoot}/${path}`, "utf8");
    assert.equal(source.includes("classList.add('drawer-is-open')"), true);
    assert.equal(source.includes("classList.remove('drawer-is-open')"), true);
  }
});
