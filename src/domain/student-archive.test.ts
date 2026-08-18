import assert from "node:assert/strict";
import test from "node:test";
import { archiveExpiryDate, parseArchiveReason } from "./student-archive.ts";

test("mantem o arquivado por seis meses de calendario", () => {
  assert.equal(
    archiveExpiryDate(new Date("2026-08-18T15:00:00Z")).toISOString(),
    "2027-02-18T15:00:00.000Z",
  );
  assert.equal(
    archiveExpiryDate(new Date("2026-08-31T15:00:00Z")).toISOString(),
    "2027-02-28T15:00:00.000Z",
  );
});

test("aceita apenas motivos conhecidos", () => {
  assert.equal(parseArchiveReason({ reason: "Promovido" }), "Promovido");
  assert.throws(() => parseArchiveReason({ reason: "Apagar agora" }));
});
