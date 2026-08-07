// promptWithSteering unit tests (pure, no pi runtime).
const { promptWithSteering } = await import("../packages/core/swarm/steering.ts");

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) pass++;
  else { fail++; console.log(`FAIL: ${name} ${extra}`); }
}

// Mock session faithful to pi 0.83.0 semantics (agent-session.ts:602-608):
// steer() messages queue while a run is in flight; a *fresh* prompt()
// delivers the queue head as its user message (removing it from
// state.steering). The initial prompt therefore never consumes the queue.
// `drainOnPrompt: false` simulates a queue that never empties (e.g. the
// session re-queues or steer() keeps arriving faster than drain).
function makeMock(initialQueue, { drainOnPrompt = true } = {}) {
  const mock = { steering: [...initialQueue], calls: [] };
  const session = {
    prompt: async (text) => {
      mock.calls.push(text);
      if (drainOnPrompt && mock.calls.length > 1) mock.steering.shift();
    },
    get state() { return { steering: mock.steering }; },
  };
  return { mock, session };
}

// ── 1. empty queue: single initial prompt ────────────────────
{
  const { mock, session } = makeMock([]);
  await promptWithSteering(session, "initial", { source: "extension" });
  check("empty queue: one call", mock.calls.length === 1);
  check("empty queue: initial text", mock.calls[0] === "initial");
}

// ── 2. queue with two entries: drained in order ──────────────
{
  const { mock, session } = makeMock(["m1", "m2"]);
  await promptWithSteering(session, "initial", { source: "extension" });
  check("queue 2: call order", JSON.stringify(mock.calls) === JSON.stringify(["initial", "m1", "m2"]));
}

// ── 3. maxRounds exceeded → throws ───────────────────────────
{
  const { mock, session } = makeMock(["stuck"], { drainOnPrompt: false });
  let threw = false;
  try {
    await promptWithSteering(session, "initial", { maxRounds: 1, source: "extension" });
  } catch (e) {
    threw = /steering loop exceeded max rounds/.test(e.message);
  }
  check("maxRounds: throws on stuck queue", threw);
}

// ── 4. no state surface → single prompt (fallback) ───────────
{
  const calls = [];
  const session = {
    prompt: async (text) => { calls.push(text); },
    // no `state` at all
  };
  await promptWithSteering(session, "initial", { source: "extension" });
  check("no state: single call", calls.length === 1 && calls[0] === "initial");
}

// ── 5. default maxRounds is 10 ───────────────────────────────
{
  const { mock, session } = makeMock(Array(20).fill("x"), { drainOnPrompt: false });
  let threw = false;
  try {
    await promptWithSteering(session, "initial", { source: "extension" });
  } catch (e) {
    threw = /max rounds \(10\)/.test(e.message);
  }
  check("default maxRounds 10", threw);
  // 1 initial + (maxRounds - 1) drain prompts before the throw
  check("default maxRounds: 10 prompts", mock.calls.length === 10);
}

// ── 6. source option is forwarded ────────────────────────────
{
  const seen = [];
  const session = {
    prompt: async (_text, opts) => { seen.push(opts?.source); },
    get state() { return { steering: [] }; },
  };
  await promptWithSteering(session, "initial", { source: "my-source" });
  check("source forwarded", seen.length === 1 && seen[0] === "my-source");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
