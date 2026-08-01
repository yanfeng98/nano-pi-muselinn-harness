// ============================================================
// Shimmer — sweep animation engine tests (pure)
// ============================================================

import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";

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

function loadTs(file) {
  const key = path.resolve(file);
  if (moduleCache.has(key)) return moduleCache.get(key).exports;
  const code = jiti.transform({ source: fs.readFileSync(key, "utf8"), filename: key, ts: true });
  const module = { exports: {} };
  moduleCache.set(key, module);
  const localRequire = (spec) => {
    const r = resolveSpec(spec, key);
    return r.native ? nativeRequire(spec) : loadTs(r.file);
  };
  new Function("exports", "require", "module", "__filename", "__dirname", code)(
    module.exports, localRequire, module, key, path.dirname(key));
  return module.exports;
}

const EXT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const shimmer = loadTs(`${EXT}/packages/core/tui/shimmer.ts`);

/** Deterministic resolver: color name → real ANSI 256-color sequence. */
const COLOR_ANSI = { dim: 1, muted: 2, accent: 3, warning: 4 };
const resolver = { fgAnsi: (color) => `\x1b[38;5;${COLOR_ANSI[color] ?? 0}m` };
const STRIP = /\x1b\[[0-9;]*m/g;
const strip = (s) => s.replace(STRIP, "");

const t0 = 1_000_000_000; // fixed wall-clock base for determinism

describe("shimmer: disabled mode", () => {
  test("paints entire text in mid tier, no per-char animation", () => {
    const out = shimmer.shimmerText("Working...", resolver, "disabled", t0);
    assert.equal(out, "\x1b[38;5;2mWorking...\x1b[39m");
  });

  test("empty text -> empty string", () => {
    assert.equal(shimmer.shimmerText("", resolver, "disabled", t0), "");
  });
});

describe("shimmer: classic mode", () => {
  test("all three tiers appear as the band sweeps (crest = bold accent)", () => {
    const text = "This is a moderately long working message for the sweep";
    let sawHigh = false, sawMid = false, sawLow = false, sawReset = false;
    for (let dt = 0; dt < 1000; dt += 33) {
      const out = shimmer.shimmerText(text, resolver, "classic", t0 + dt);
      if (out.includes("\x1b[1m\x1b[38;5;3m")) sawHigh = true;
      if (out.includes("\x1b[38;5;2m")) sawMid = true;
      if (out.includes("\x1b[38;5;1m")) sawLow = true;
      if (out.endsWith("\x1b[39m")) sawReset = true;
      // Every frame paints each char exactly once.
      assert.equal(strip(out), text);
    }
    assert.ok(sawHigh, "crest (bold+accent) appears during the sweep");
    assert.ok(sawMid, "mid tier appears during the sweep");
    assert.ok(sawLow, "dim low tier appears during the sweep");
    assert.ok(sawReset, "every frame closes with FG reset");
  });

  test("band position advances with wall-clock (smoothness: not frame-counted)", () => {
    const text = "Working on a long task...";
    // 20 cells/s → 300ms later the band moved ~6 cells.
    const a = shimmer.shimmerText(text, resolver, "classic", t0);
    const b = shimmer.shimmerText(text, resolver, "classic", t0 + 300);
    assert.notEqual(a, b, "same text at different wall-clock times differs");
    // A frame late by 33ms still lands between the two (monotonic sweep).
    const c = shimmer.shimmerText(text, resolver, "classic", t0 + 150);
    assert.notEqual(a, c);
    assert.notEqual(b, c);
  });

  test("long messages move no more than 1 cell per 30fps frame (constant velocity)", () => {
    // At 20 cells/s and a 33ms frame the position delta is ≤ 1. Compare the
    // crest index between two frames: it must advance by ≤1 (or wrap).
    const text = "This is a deliberately long working message to test velocity";
    const pos = (time) => {
      const out = shimmer.shimmerText(text, resolver, "classic", time);
      // Find the first accent-marked run start via the marker escape.
      return out.indexOf("\x1b[38;5;3m");
    };
    const delta = Math.abs(pos(t0 + 33) - pos(t0));
    assert.ok(delta <= 1, `crest moved ${delta} cells in one 30fps frame`);
  });
});

describe("shimmer: kitt mode", () => {
  test("bright head + trail exist; low tier elsewhere", () => {
    const text = "This is a moderately long working message for the sweep";
    let sawHead = false, sawTrail = false, sawLow = false;
    for (let dt = 0; dt < 1000; dt += 33) {
      const out = shimmer.shimmerText(text, resolver, "kitt", t0 + dt);
      if (out.includes("\x1b[1m\x1b[38;5;3m")) sawHead = true;
      if (out.includes("\x1b[38;5;2m")) sawTrail = true;
      if (out.includes("\x1b[38;5;1m")) sawLow = true;
      assert.equal(strip(out), text, "kitt frames paint every char exactly once");
    }
    assert.ok(sawHead, "bright head (bold+accent) appears");
    assert.ok(sawTrail, "mid-tier trail appears");
    assert.ok(sawLow, "dim low tier appears");
  });

  test("head is a single cell and keeps moving (wall-clock driven)", () => {
    const text = "Some message text here";
    const headAt = (time) => shimmer.shimmerText(text, resolver, "kitt", time).indexOf("\x1b[38;5;3m");
    const positions = [0, 100, 200, 300, 400].map((dt) => headAt(t0 + dt));
    const distinct = new Set(positions);
    assert.ok(distinct.size >= 3, `head moved across samples (positions ${positions})`);
    // Head stays within the text (indexOf -1 would mean no crest at all).
    assert.ok(positions.every((p) => p >= 0), "head always visible on the text");
  });
});

describe("shimmer: multi-segment", () => {
  test("segments keep their own palettes (deterministic via disabled mode)", () => {
    const out = shimmer.shimmerSegments(
      [
        { text: "Working", palette: { low: "dim", mid: "muted", high: "accent", bold: true } },
        { text: " [hint]", palette: { low: "dim", mid: "dim", high: "muted" } },
      ],
      resolver,
      "disabled",
      t0,
    );
    // Disabled paints each segment in its own mid tier.
    assert.equal(out, "\x1b[38;5;2mWorking\x1b[39m\x1b[38;5;1m [hint]\x1b[39m");
  });

  test("segments animate as one continuous string (classic)", () => {
    const text = "Working [hint]";
    const out = shimmer.shimmerSegments(
      [
        { text: "Working", palette: { low: "dim", mid: "muted", high: "accent", bold: true } },
        { text: " [hint]", palette: { low: "dim", mid: "dim", high: "muted" } },
      ],
      resolver,
      "classic",
      t0 + 400,
    );
    assert.equal(strip(out), text);
    assert.ok(out.includes("\x1b[38;5;3m") || out.includes("\x1b[38;5;2m"),
      "at least one tier active while animating");
  });

  test("surrogate pairs stay atomic (emoji not split mid-pair)", () => {
    const out = shimmer.shimmerText("Work ⚡🔥 done", resolver, "classic", t0);
    const stripped = strip(out);
    assert.equal(stripped, "Work ⚡🔥 done");
    // No lone high surrogate in the output.
    assert.ok(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(stripped));
  });
});
