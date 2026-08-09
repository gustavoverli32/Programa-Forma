import test from "node:test";
import assert from "node:assert/strict";
import {
  createChatMessage,
  sanitizeAssistantText,
  SUGGESTED_QUESTIONS,
} from "./assistant.ts";

test("creates structured chat messages with unique ids and timestamps", () => {
  const msg = createChatMessage("user", "Olá IA!");
  assert.equal(msg.role, "user");
  assert.equal(msg.content, "Olá IA!");
  assert.ok(msg.id.startsWith("msg_"));
  assert.ok(msg.timestamp.length >= 4);
});

test("sanitizes assistant output and converts newlines to line breaks", () => {
  const unsafe = "<script>alert('xss')</script>\nLinha 2";
  const sanitized = sanitizeAssistantText(unsafe);

  assert.equal(sanitized.includes("<script>"), false);
  assert.equal(sanitized.includes("&lt;script&gt;"), true);
  assert.equal(sanitized.includes("<br>"), true);
});

test("provides suggested prompt questions for quick interaction", () => {
  assert.ok(Array.isArray(SUGGESTED_QUESTIONS));
  assert.ok(SUGGESTED_QUESTIONS.length >= 3);
  assert.ok(SUGGESTED_QUESTIONS[0].includes("estagiários"));
});
