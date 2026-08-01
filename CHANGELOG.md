# Changelog

All notable changes to pi-muselinn-harness, in reverse chronological order.

## 0.9.14

**Startup fix:**
- `session_start` model catalog refresh is now fire-and-forget instead of
  awaited — a stalled catalog fetch (no signal/timeout) previously blocked the
  TUI input loop right after the interface rendered. Matches pi core's own
  background refresh behavior in `main.ts`.

**Docs & site:**
- README restructured for new users (what-is-this table, quick start) and the
  11 versions of release notes moved to a dedicated `CHANGELOG.md`; Pages
  home reworked with a quick-start section and a changelog page.
- Pages demo terminal now simulates the actual Pi + harness TUI: quiet-startup
  header, loaded-resources block, braille swarm grid widget, `╭╮│╰╯` boxed
  editor with spinner + model in the border, and the status-bar badges
  (permission mode / swarm / goal / agent count).

## 0.9.13

**Plan mode Kimi Code full alignment:**
- Plan injection rewritten to match Kimi Code's `plan-mode.ts` wording (full + sparse variants).
- `enter_plan_mode`, `exit_plan_mode`, and plan-file writes auto-approved (skip permission chain).
- Per-tool deny messages: TaskStop, CronCreate, CronDelete get specific reasons in plan mode.
- `isPlanFilePath()` shared helper for consistent plan-file path matching.
- Plan approval panel shows full file content (removed 500-char truncation).

**Permission dialog UX:**
- "Deny with reason" input: Esc now returns to the 4 options instead of ending the flow.
- Looped dialog matches the plan approval panel's Revise pattern.

**Subagent profile system:**
- New `packages/core/profile/` with CODER / EXPLORE / PLAN profiles.
- Tool permissions aligned with Kimi Code YAML definitions (bash in explore, no write in plan).
- Profiles injected via `buildProfileTools()` + `createSubagentResourceLoader()`.

**Preview box fix:**
- Trimmed Markdown trailing whitespace so box borders don't exceed terminal width.
- Accounted for pi-tui `Text` component's `paddingX=1` in stacked layout.

**Misc:**
- Replaced `theme.fg("info", ...)` with `theme.fg("accent", ...)` ("info" color didn't exist).
- `hasAnyPreviewOption()`: "n note" hint only shows when an option has a preview.
- Questionnaire arrow-key tab switching uses `matchesKey()` (Kitty protocol compatible).
- All 19 test suites green.

## 0.9.12

- Made `resources_discover` handler async and added timing.
- Wrapped `restoreTodos`, `bindTodoSession`, `refreshWidget`, and `loadPlugins` in try/catch.
- Removed unused `VisibleTodos` / `selectVisibleTodos` dead code (78 lines).
- Cleaned up MusePi fork references from README and docs.

## 0.9.11

- **Swarm report includes subagent output** — model sees what each subagent
  produced (Kimi Code parity).
- **Tool policy gate** — disabled tools blocked before permission chain.
- **Plan mode Kimi Code alignment** — bash no longer blocked in plan mode;
  only Write/Edit (outside plan file), TaskStop, Cron mutations blocked.
- All 12 test suites green

## 0.9.10

- **Ask dialog `n` note always visible** — Footer shows `· n note` unconditionally; any option can carry a note (OMP parity).
- All 12 test suites green

## 0.9.3–0.9.8

**Integration & consistency fixes:**
- Widget API fixed: `ctx.widget()` → `ctx.ui.setWidget("todo", content)`, empty list clears widget instead of showing "(empty)" clutter
- `/todo` subcommands aligned with oh-my-pi: `view` → `export`, added `copy`, `edit`, bare `/todo` prints Markdown
- Every `/todo` subcommand produces status feedback via `ctx.showStatus`
- Removed redundant `/todo help` / `?` (command registry provides discoverability)
- `clearTodoSession` now wired to `session_end` event (was imported but never called)
- `require()` → ES `import` for `swarmState` (require silently failed in bundled ESM runtime — subagent matching finally works)
- All 12 test suites green at every commit

## 0.9.1

**Bug fixes:**
- Fixed `add_notes` case in `applyEntry` — no longer falls through into `update_details` (all add_notes calls rejected with "Missing details value")
- Fixed stray `completed: number` in function body that blocked module parsing
- `todoMatchesAnyDescription` now correctly checks shorter string against longer one for substring matching
- All 94 TODO tests green, full suite 12/12

## 0.9.0

**TODO Phase Model — phased task planning with reminders built in.**

The todo system is rewritten with an oh-my-pi-style phase model (`TodoPhase`):
per-task status (`pending`/`in_progress`/`completed`/`abandoned`), 7 ops
(`init`/`start`/`done`/`drop`/`rm`/`append`/`view`), and auto-promote of the
first task on phase init. The widget renders a roman-numeral phase tree
(`Ⅰ. Scanner · 2/4`) with collapse/expand.

**Reminder system:** When the agent stops with incomplete todos, a
`<system-reminder>` injects the task list into the next turn (max 3
reminders, debounced).

**Markdown round-trip:** `/todo export/import` serializes and restores phases
as Markdown for sharing and persistence between sessions.

**Plan Mode — Kimi Code permission model alignment.**

Plan mode no longer maintains its own bash command whitelist. Instead, bash
follows the normal permission mode (auto/yolo/manual) — the same design as
Kimi Code. Only the following are blocked during planning:
- **Write/Edit** to files outside the active plan file
- **TaskStop** (would abort background work during planning)
- **CronCreate / CronDelete** (would mutate scheduled work)

The plan file path is matched by exact path, `local://` scheme basename, and
resolved absolute path under the session's `plans/` directory — all three paths
accepted.

This eliminates the root cause of "stuck in plan mode" where common commands
like `cd` were blocked by the bash whitelist, and plan file writes using the
`local://` scheme were rejected.

**Plan mode bash permission model:**

| Before (0.8.2) | After (0.9.0) |
|---|---|
| Static regex whitelist (~35 commands) | No bash restriction — follows permission mode |
| `cd` not in whitelist → blocked | `cd`, `git push`, `npm install` all allowed (permission mode decides) |
| `local://` plan writes rejected (path mismatch) | `local://` basename matched against active plan file |
| Deny-by-default for unmatched commands | Allow-by-default, permission chain controls |

## 0.8.2

**Custom Agent Files** — Define agent profiles as Markdown files with YAML frontmatter:
```markdown
---
name: my-coder
description: Custom coding agent with restricted tools
tools:
  - Read
  - Grep
  - Edit
  - Bash
disallowedTools:
  - Bash
---
You are a specialized coding agent.
${base_prompt}
```
Place them in `.pi/agents/`, `.kimi-code/agents/`, or `.agents/agents/` (project or user scope).
Use `agent_file_list` to browse, and pass `agent_file="my-coder"` to `agent` or `agent_swarm`.

**Tool Gating** — Three-layer tool policy integrated into the permission chain.
Agent profiles can restrict which tools a subagent may use; the policy is enforced
at the `tool_call` event level, before the 18-level permission chain.

**Agent Lifecycle Events** — `agent.created` / `agent.disposed` events tracked
per subagent. Active agent count shown in the status bar (`[3 agents running]`).

**Permission Mode Rework (kimi-code aligned):**
- **Auto** — truly automatic: no dialogs for any tool (including destructive/sensitive).
  `AskUserQuestion` is disabled. `ExitPlanMode` auto-approves with a warning.
- **YOLO** — fast but still safe: destructive commands, `.env` access, `.git` paths
  still require approval. `AskUserQuestion` is allowed. `ExitPlanMode` shows review.
- **Manual** — full 18-level policy chain with fallback-ask.

**Plan Mode improvements:**
- `task_stop` / `cron_create` / `cron_delete` blocked during planning
- Sparse/full injection reminders (less prompt bloat on long planning sessions)
- Auto-mode ExitPlanMode warns "user has NOT explicitly approved"

## 0.7.8

- **Task module reliability fixes** — the two root causes behind broken background tasks on pi ≥ 0.81:
  - `run_background` died at spawn (`task_output` empty, `block:true` returned instantly): the subagent resource loader omitted `LoadExtensionsResult.runtime`, which pi 0.81's `ExtensionRunner.bindCore` requires — `createAgentSession` threw and every background task failed immediately. The loader now includes the runtime when the SDK provides it (still 0.80-compatible)
  - `task_list` crashed with no arguments while `active_only:true` worked: restored persisted entries carry the task text as `description` (or not at all), and the list formatter called `prompt.slice()` on `undefined`. Restore now maps `description` → `prompt` and defaults missing prompts; `task_output` also surfaces `[task failed: <error>]` for tasks that died before producing output
- **Plan persistence dedup** — `PlanManager.persist()` skips appends identical to the last persisted state (observed: 5 identical `muselinn_plan` entries within 25 s), and restore seeds the dedup baseline so a no-change persist doesn't re-append
- **Tests** — new `task.test.mjs` suite (16 checks) + plan dedup regression cases; 19 suites / 580 assertions, all green

## 0.7.7

- **Plan mode fixes** — the bash read-only gate now understands `rtk`-wrapped commands (pi-rtk-optimizer rewrites commands in place) and Windows `dir`; **Revise** keeps the same plan object instead of trapping you or losing work; review timeout raised 60 s → 600 s; a stale persisted plan with no file on disk deactivates cleanly instead of trapping the session; the `plan` badge now also follows tool-driven plan mode
- **Goal fixes** — footer badge counters (`turns` / tokens / wall-clock) restore monotonically, so they never flicker backwards; completed goals leave a tombstone entry and can't be resurrected with stale counters; `update_goal` docs now state the `verified=true` rule explicitly (required to complete a goal with a declared criterion)
- **Ask dialog robustness** — scrolling window for long option lists, answer deduplication, and background-question support, on top of the tabbed multi-question dialog (multi-select + free-text Other)
- **CI/CD** — GitHub Actions test matrix (ubuntu + windows × node 22/24) on every push/PR

## 0.7.4

- **`ask_user_question` tool** — native interactive question dialog with numbered options, shared with the approval flow
- **`todo_list` tool + inline panel** — session-shared todo with collapse policy (replaces external rpiv-todo)
- **Approval panel** — per-tool titles, number-key selection, reject-with-reason (manual permission tier)
- **Swarm permission gating** — shared permission manager; `/mode` broadcasts to all subagents
- **Editor anchoring** — input anchored after slash-menu closes (render-edge detection)
- **`toolResultTruncation`** — oversized tool results persisted to disk with preview + `output_path`
- **Subagent resume guard** — ownership/idle validation before resuming
- **`fetch_url` tool** — no-auth URL fetching (replaces external dependency)
- **Plugin manifest** — six-piece package metadata set


![Closed-box editor with streaming state in the top border](https://muselinn.github.io/pi-muselinn-harness/assets/img/pi-boxed-editor.png)
