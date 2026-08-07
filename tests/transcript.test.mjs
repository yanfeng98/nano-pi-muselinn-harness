// transcript wire.jsonl helpers unit tests (pure, no pi runtime).
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
const {
  transcriptEventToLine,
  transcriptPathFor,
  appendTranscriptLine,
  formatTranscriptLine,
} = await import("../packages/core/swarm/transcript.ts");

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) pass++;
  else { fail++; console.log(`FAIL: ${name} ${extra}`); }
}

// ── 1. transcriptEventToLine ─────────────────────────────────
const userEvt = {
  type: "message_end",
  message: { role: "user", content: [{ type: "text", text: "list the files" }] },
};
const userLine = transcriptEventToLine(userEvt);
check("user message_end -> line", userLine !== null);
const parsedUser = JSON.parse(userLine);
check("user line: role user", parsedUser.role === "user");
check("user line: has text part", parsedUser.parts.some((p) => p.type === "text" && p.text === "list the files"));
check("user line: has t timestamp", typeof parsedUser.t === "number");

const asstEvt = {
  type: "message_end",
  message: {
    role: "assistant",
    content: [
      { type: "text", text: "Let me look" },
      { type: "toolCall", toolCallId: "call_1", name: "read", args: { path: "/secret" } },
    ],
    stopReason: "tool_use",
    usage: { input: 10, output: 5 },
  },
};
const asstLine = transcriptEventToLine(asstEvt);
const parsedAsst = JSON.parse(asstLine);
check("assistant line: role assistant", parsedAsst.role === "assistant");
check("assistant line: toolCall part with name", parsedAsst.parts.some((p) => p.type === "toolCall" && p.name === "read"));
check("assistant line: NO args on toolCall", !JSON.stringify(parsedAsst.parts).includes("args"));
check("assistant line: stopReason kept", parsedAsst.stopReason === "tool_use");
check("assistant line: usage kept", parsedAsst.usage && parsedAsst.usage.input === 10);

const toolEvt = {
  type: "message_end",
  message: { role: "tool", content: [{ type: "text", text: "ok" }] },
};
check("tool message_end -> line", transcriptEventToLine(toolEvt) !== null);

const startEvt = { type: "message_start", message: { role: "assistant", content: [] } };
check("message_start -> null", transcriptEventToLine(startEvt) === null);
check("no event -> null", transcriptEventToLine(undefined) === null);
check("null -> null", transcriptEventToLine(null) === null);
check("unrelated event -> null", transcriptEventToLine({ type: "notice", text: "x" }) === null);
check("system role -> null", transcriptEventToLine({ type: "message_end", message: { role: "system", content: [] } }) === null);

// ── 2. transcriptPathFor ─────────────────────────────────────
check("path: sanitizes task id", transcriptPathFor("/x", "a/b c") === "/x/agents/a_b_c/wire.jsonl");
check("path: keeps safe chars", transcriptPathFor("/x", "task-1_2") === "/x/agents/task-1_2/wire.jsonl");

// ── 3. appendTranscriptLine ──────────────────────────────────
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "transcript-test-"));
const file = path.join(dir, "deep", "nested", "wire.jsonl");
appendTranscriptLine(file, JSON.stringify({ t: 1, role: "user", parts: [{ type: "text", text: "a" }] }));
appendTranscriptLine(file, JSON.stringify({ t: 2, role: "assistant", parts: [] }));
check("append: created parent dirs", fs.existsSync(file));
const raw = fs.readFileSync(file, "utf8").trim().split("\n");
check("append: two lines written", raw.length === 2);
check("append: both lines parse", raw.every((l) => { try { JSON.parse(l); return true; } catch { return false; } }));
check("append: swallows errors", (() => {
  // Parent path component is a regular file → mkdir/append must throw internally
  // but appendTranscriptLine must not propagate it.
  const blocker = path.join(dir, "blocker.txt");
  fs.writeFileSync(blocker, "x");
  appendTranscriptLine(path.join(blocker, "wire.jsonl"), "boom");
  return true;
})());

// ── 4. formatTranscriptLine ──────────────────────────────────
const t1 = Date.now();
const f1 = formatTranscriptLine(JSON.stringify({ t: t1, role: "user", parts: [{ type: "text", text: "hello world" }] }));
check("format: user line prefix", f1.startsWith("[") && f1.includes("] user: hello world"));
check("format: HH:MM:SS shape", /^\[\d{2}:\d{2}:\d{2}\]/.test(f1));

const f2 = formatTranscriptLine(JSON.stringify({
  t: t1,
  role: "assistant",
  parts: [
    { type: "text", text: "checking" },
    { type: "toolCall", name: "bash" },
  ],
}));
check("format: assistant tool line", f2.includes("] assistant → tool: bash"));

const f3 = formatTranscriptLine("not json at all");
check("format: corrupt line verbatim", f3 === "not json at all");

const f4 = formatTranscriptLine(JSON.stringify({ t: t1, role: "assistant", parts: [{ type: "text", text: "done" }] }));
check("format: assistant text line", f4.includes("] assistant: done"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
