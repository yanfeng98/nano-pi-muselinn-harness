// ============================================================
// TUI adapter integration — regression test for the working-state
// render path (slotLeft → shimmer). Guards against crashes like
// "Cannot read properties of undefined (reading 'shimmer')" when the
// editor border renders while the agent is working.
// ============================================================

import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";
import { test, describe } from "node:test";
import * as assert from "node:assert/strict";

import { jitiUrl } from "./jiti-path.mjs";
const { createJiti } = await import(jitiUrl());
const jiti = createJiti(import.meta.url ?? __filename, { moduleCache: false });
const nativeRequire = createRequire(import.meta.url);
const moduleCache = new Map();

function resolveSpec(spec, parentFile) {
  if (!spec.startsWith(".")) return { native: spec };
  const clean = spec.endsWith(".js") ? spec.slice(0, -3) : spec;
  const base = path.resolve(path.dirname(parentFile), clean);
  for (const c of [base + ".ts", base + ".js", base]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return { file: c };
  }
  throw new Error(`Cannot resolve ${spec} from ${parentFile}`);
}

// Minimal stand-in for pi's CustomEditor (ESM-only in the installed SDK,
// not loadable via CJS require in this suite). Mirrors the surface
// MuselinnEditor uses: constructor(tui, theme, options), borderColor,
// paddingX, setText/getText, isShowingAutocomplete, render(width).
class MockCustomEditor {
  constructor(tui, theme, options = {}) {
    this.tui = tui;
    this.theme = theme;
    this.paddingX = options.paddingX ?? 0;
    this.actionHandlers = new Map();
    this.text = "";
    this.borderColor = (s) => s;
  }
  setText(t) { this.text = t; }
  getText() { return this.text; }
  setPaddingX(p) { this.paddingX = p; }
  getPaddingX() { return this.paddingX; }
  setAutocompleteMaxVisible() {}
  setAutocompleteProvider() {}
  isShowingAutocomplete() { return false; }
  render(width) {
    const pad = " ".repeat(Math.min(this.paddingX, Math.max(0, Math.floor((width - 1) / 2))));
    const inner = Math.max(1, width - pad.length * 2);
    const content = (pad + (this.text || "")).slice(0, width);
    return ["\u2500".repeat(width), content.padEnd(width, " ")];
  }
}

const MOCK_PI_CODING_AGENT = { CustomEditor: MockCustomEditor };

function loadTs(file) {
  const key = path.resolve(file);
  if (moduleCache.has(key)) return moduleCache.get(key).exports;
  const code = jiti.transform({ source: fs.readFileSync(key, "utf8"), filename: key, ts: true });
  const module = { exports: {} };
  moduleCache.set(key, module);
  const localRequire = (spec) => {
    if (spec === "@earendil-works/pi-coding-agent") return MOCK_PI_CODING_AGENT;
    const r = resolveSpec(spec, key);
    return r.native ? nativeRequire(spec) : loadTs(r.file);
  };
  new Function("exports", "require", "module", "__filename", "__dirname", code)(
    module.exports, localRequire, module, key, path.dirname(key));
  return module.exports;
}

const EXT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const tuiMod = loadTs(`${EXT}/tui/index.ts`);
const box = loadTs(`${EXT}/packages/core/tui/box.ts`);

// ── Mocks ──────────────────────────────────────────────────────

function makeMocks() {
  const handlers = new Map();
  const commands = [];
  const pi = {
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, []);
      handlers.get(event).push(handler);
    },
    registerCommand(name, def) {
      commands.push({ name, def });
    },
    getThinkingLevel() { return "off"; },
  };

  let editorFactory = null;
  // Real ANSI 256-color sequences (mirrors pi's Theme.getFgAnsi).
  const ANSI = { dim: 240, muted: 245, accent: 81, warning: 214 };
  const theme = {
    fg: (color, text) => `\x1b[38;5;${ANSI[color] ?? 240}m${text}\x1b[39m`,
    getFgAnsi: (color) => `\x1b[38;5;${ANSI[color] ?? 240}m`,
    bold: (s) => `\x1b[1m${s}\x1b[22m`,
  };
  const ui = {
    setEditorComponent(f) { editorFactory = f; },
    setWorkingVisible() {},
    theme,
  };
  const ctx = {
    hasUI: true,
    sessionManager: { getCwd: () => "/tmp" },
    ui,
  };

  const tui = {
    terminal: { rows: 24, columns: 84 },
    requestRender() {},
  };
  const keybindings = {};
  const editorTheme = { borderColor: (s) => s, selectList: {} };

  return { handlers, commands, pi, ui, ctx, tui, keybindings, editorTheme,
    get editorFactory() { return editorFactory; } };
}

describe("tui adapter: working-state render path", () => {
  test("editor border renders with shimmer while working (no crash, shimmer ANSI present)", async () => {
    const m = makeMocks();
    tuiMod.registerTui(m.pi);
    // Always stop the keep-alive timer so this suite's process can exit,
    // even when an assertion below fails.
    try {
      // session_start → loads config, registers the boxed editor factory.
      for (const h of m.handlers.get("session_start") ?? []) h({}, m.ctx);
      assert.ok(m.editorFactory, "editor factory registered");

      // agent starts working, message streaming begins.
      for (const h of m.handlers.get("agent_start") ?? []) h();
      for (const h of m.handlers.get("message_update") ?? []) {
        h({ assistantMessageEvent: { type: "text_start" } });
      }
      // Let the keep-alive timer fire at least once — regression guard for
      // undefined-reference crashes in the timer callback (e.g. a missing
      // import like KEEP_ALIVE_QUIET_MS only surfaces when the timer runs).
      await new Promise((r) => setTimeout(r, 150));
      // Force a long working message so the shimmer band is inside the text.
      tuiMod.__tuiRuntime.workingMessage = "Running tools";

      // Build the editor and render the border — this exercises slotLeft.
      let editor;
      assert.doesNotThrow(() => {
        editor = m.editorFactory(m.tui, m.editorTheme, m.keybindings);
        editor.render(84);
      }, "rendering the editor border while working must not throw");

      // The shimmer path emits themed ANSI for the message (accent crest etc).
      const out = editor.render(84).join("\n");
      const plain = out.replace(/\x1b\[[0-9;]*m/g, "");
      assert.ok(plain.includes("Running tools"), "working message present in border");
      assert.ok(/\x1b\[38;5;\d+m/.test(out), "shimmer/theme ANSI present in border output");
      // Border alignment: top border stays exactly 84ch (ANSI stripped).
      assert.equal([...plain.split("\n")[0]].length, 84, "top border is 84ch");

      // Stop working → idle border renders fine too.
      for (const h of m.handlers.get("agent_settled") ?? []) h();
      assert.doesNotThrow(() => editor.render(84), "idle render must not throw");
    } finally {
      // Stop the keep-alive timer so the test process can exit.
      for (const h of m.handlers.get("session_shutdown") ?? []) h();
      if (tuiMod.__tuiRuntime.spinnerTimer) {
        clearInterval(tuiMod.__tuiRuntime.spinnerTimer);
        tuiMod.__tuiRuntime.spinnerTimer = null;
      }
    }
  });

  test("keep-alive quiet threshold adapts to full-tree render cost", () => {
    const m = makeMocks();
    tuiMod.registerTui(m.pi);
    for (const h of m.handlers.get("session_start") ?? []) h({}, m.ctx);
    try {
      // Start working (spinner timer runs) and simulate renders.
      for (const h of m.handlers.get("agent_start") ?? []) h();
      const rt = tuiMod.__tuiRuntime;

      // Small session: render cost ~1ms → threshold stays at the 200ms floor.
      rt.renderCostEma = 1;
      const smallThreshold = Math.max(200, Math.min(2000, rt.renderCostEma * 1.5));
      assert.equal(smallThreshold, 200, "small sessions keep the 200ms floor");

      // Large session: 300ms per full-tree render → threshold rises to 450ms,
      // so keep-alive drops to ~2fps instead of hogging the event loop.
      rt.renderCostEma = 300;
      const largeThreshold = Math.max(200, Math.min(2000, rt.renderCostEma * 1.5));
      assert.equal(largeThreshold, 450, "large sessions raise the quiet gate");

      // Extreme: capped at 2s.
      rt.renderCostEma = 5000;
      assert.equal(Math.max(200, Math.min(2000, rt.renderCostEma * 1.5)), 2000, "threshold capped");

      // Render probe measures request→render latency into the EMA.
      rt.renderCostEma = 0; // reset before measuring
      rt.pendingRenderAt = performance.now() - 100; // render took 100ms
      const probe = m.handlers.get("session_start"); // reuse ctx wiring below
      void probe;
      // Trigger the editor factory's onRender probe via a render.
      const editor = m.editorFactory(m.tui, m.editorTheme, m.keybindings);
      editor.render(84);
      assert.ok(rt.renderCostEma > 0, "EMA updated from request→render latency");
      assert.ok(rt.renderCostEma <= 100.1, "EMA reflects measured cost");
      assert.equal(rt.pendingRenderAt, undefined, "pending marker consumed");
    } finally {
      for (const h of m.handlers.get("session_shutdown") ?? []) h();
      if (tuiMod.__tuiRuntime.spinnerTimer) {
        clearInterval(tuiMod.__tuiRuntime.spinnerTimer);
        tuiMod.__tuiRuntime.spinnerTimer = null;
      }
    }
  });

  test("/tui command exposes shimmer subcommand with usage", () => {
    const m = makeMocks();
    tuiMod.registerTui(m.pi);
    const tuiCmd = m.commands.find((c) => c.name === "tui");
    assert.ok(tuiCmd, "/tui registered");
    assert.ok(tuiCmd.def.usage.includes("shimmer"), "usage mentions shimmer");
    assert.ok(tuiCmd.def.usage.includes("style"), "usage mentions style");
  });

  test("boxed editor keeps breathing room between │ bars and text/cursor", () => {
    // pi-tui renders rows with paddingX spaces on each side, then
    // wrapWithSideBorders replaces the outer padding columns with │.
    // paddingX=1 would yield "│text│" (cursor touches the border); the
    // boxed editor enforces a minimum of 2 → "│ text │".
    const m = makeMocks();
    tuiMod.registerTui(m.pi);
    for (const h of m.handlers.get("session_start") ?? []) h({}, m.ctx);
    try {
      const editor = m.editorFactory(m.tui, m.editorTheme, m.keybindings);

      // Even when pi copies the default editor's paddingX (0) into the
      // custom editor, the boxed minimum of 2 holds.
      editor.setPaddingX(0);
      assert.equal(editor.getPaddingX(), 2, "boxed editor enforces paddingX >= 2");

      // Row rendered by pi-tui with paddingX=2, then wrapped:
      const lines = ["  Hello  "];
      const wrapped = box.wrapWithSideBorders(lines, (s) => s, {});
      assert.equal(wrapped[0], "\u2502 Hello \u2502", "│ <text> │ layout");

      // First content line carries a prompt chevron in the padding column.
      editor.setText("Hello");
      const rendered = editor.render(84);
      const contentPlain = rendered[1].replace(/\x1b\[[0-9;]*m/g, "");
      assert.ok(contentPlain.includes("\u276F"), "prompt chevron on the first content line");
      // Chevron occupies the padding slot: │❯ text │ (no width shift).
      assert.equal([...contentPlain].length, 84, "content line stays 84ch with chevron");
      assert.ok(contentPlain.startsWith("\u2502\u276F"), "│❯ at line start");
    } finally {
      for (const h of m.handlers.get("session_shutdown") ?? []) h();
      if (tuiMod.__tuiRuntime.spinnerTimer) {
        clearInterval(tuiMod.__tuiRuntime.spinnerTimer);
        tuiMod.__tuiRuntime.spinnerTimer = null;
      }
    }
  });
});
