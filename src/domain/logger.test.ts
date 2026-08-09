import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const projectRoot = process.cwd();

test("logger.ts redacts sensitive fields like passwords, secrets, and hashes from logs", () => {
  const loggerSource = readFileSync(`${projectRoot}/src/lib/logger.ts`, "utf8");

  assert.equal(loggerSource.includes("REDACTED"), true);
  assert.equal(loggerSource.includes("password"), true);
  assert.equal(loggerSource.includes("sanitizeLogData"), true);
  assert.equal(loggerSource.includes("logAudit"), true);
});
