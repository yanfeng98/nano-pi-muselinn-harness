---
layout: default
title: pi-muselinn-harness
---

<div class="hero reveal">
  <img class="hero-logo" src="assets/img/logo-animated.svg" alt="MuseLinn logo — dots igniting into an M">
  <h1><span data-l="en">Pi skips sub-agents and plan mode.<br><em>This harness builds them.</em></span><span data-l="zh">Pi 刻意不做子代理和计划模式。<br><em>这个 harness 把它们全部补上。</em></span></h1>
  <p class="sub"><span data-l="en">Kimi Code-style agent orchestration for the <a href="https://pi.dev">Pi coding agent</a> —<br>swarm, goal, plan, permission, ask, task, cron, todo, hooks, skills, and a boxed-editor TUI, in one coherent package.</span><span data-l="zh">为 <a href="https://pi.dev">Pi coding agent</a> 打造的 Kimi Code 风格编排套件 —<br>Swarm、Goal、Plan、Permission、Ask、Task、Cron、Todo、Hooks、Skills 与闭合框编辑器,一个包全部集成。</span></p>
  <div class="installbar">
    <span><span class="prompt">$</span>pi install npm:pi-muselinn-harness</span>
    <span class="hint">npm</span>
  </div>
</div>

<div class="split" id="split">
  <div class="split-term">
    <div class="demo-term" id="demo-term">
      <div class="termtitle" id="demo-title">swarm · live</div>
      <div id="demo-body"><span class="scroll-cue"><span class="prompt">$</span>scroll to continue<span class="cue-caret">▍</span></span></div>
    </div>
  </div>
  <div class="split-sections">
    <section class="split-section" data-scene="swarm">
      <h3><span data-l="en">⬒ <em>Swarm</em> — real parallelism</span><span data-l="zh">⬒ <em>Swarm</em> — 真正的并行</span></h3>
      <p data-l="en">Concurrent subagents with a live braille-grid TUI. Real <code>max_concurrency</code> worker pool, progressive launch, 30-min timeouts, two-step <code>/cancel</code>, <code>/resume</code>, and a three-pane task browser (<code>ctrl+shift+t</code>).</p>
      <p data-l="zh">盲文网格实时展示并行子代理。真实 <code>max_concurrency</code> worker 池、渐进投放、30 分钟超时、两步 <code>/cancel</code>、<code>/resume</code>,以及三栏任务浏览器(<code>ctrl+shift+t</code>)。</p>
    </section>
    <section class="split-section" data-scene="goal">
      <h3><span data-l="en">◎ <em>Goal</em> — finish what you start</span><span data-l="zh">◎ <em>Goal</em> — 有始有终</span></h3>
      <p data-l="en"><code>/goal</code> lifecycle with budgets (turns / tokens / wall-clock), a 3-turn blocked circuit breaker, a completion-criterion gate, FIFO queue, and session persistence.</p>
      <p data-l="zh"><code>/goal</code> 目标生命周期:预算(轮次/token/墙钟)、连续 3 轮阻断熔断、完成判据门禁、FIFO 队列、会话级持久化。</p>
    </section>
    <section class="split-section" data-scene="plan">
      <h3><span data-l="en">✎ <em>Plan</em> — read-only first</span><span data-l="zh">✎ <em>Plan</em> — 先谋后动</span></h3>
      <p data-l="en">The LLM explores and writes a plan; execution waits for your approval. Kimi Code permission model — bash follows normal permission mode (auto/yolo/manual), only Write/Edit (outside plan file), TaskStop, Cron are blocked. Plan file accepts exact path, <code>local://</code> basename, and resolved absolute path. <code>plan</code> badge on the editor border while active.</p>
      <p data-l="zh">LLM 先探索代码库、写计划,审批后才执行。Kimi Code 权限模型——bash 走正常 permission mode（auto/yolo/manual），只拦截 Write/Edit（非 plan 文件）、TaskStop、Cron。Plan 文件支持精确路径、<code>local://</code> 文件名、解析绝对路径三种匹配。激活时编辑器上边框显示 <code>plan</code> 徽标。</p>
    </section>
    <section class="split-section" data-scene="permission">
      <h3><span data-l="en">⛨ <em>Permission</em> — safety before speed</span><span data-l="zh">⛨ <em>Permission</em> — 安全先于效率</span></h3>
      <p data-l="en">An 18-level policy chain across <code>auto</code> / <code>yolo</code> / <code>manual</code>. Destructive commands always ask; <code>.env</code> / <code>id_rsa</code> never pass — even in auto mode. Plus background tasks and cron. The startup mode is declarative: an optional <code>"defaultMode"</code> in <code>permissions.json</code> (<code>~/.pi/agent/</code> global or <code>.pi/</code> project) sets it for fresh sessions.</p>
      <p data-l="zh">18 级策略链,贯穿 <code>auto</code> / <code>yolo</code> / <code>manual</code>。破坏性命令每次必问,<code>.env</code> / <code>id_rsa</code> 永不放行——auto 模式也不例外。另有后台任务与 cron 定时。启动模式可声明式配置:在 <code>permissions.json</code>（全局 <code>~/.pi/agent/</code> 或项目 <code>.pi/</code>）中写入可选的 <code>"defaultMode"</code>,新会话即从该模式开始。</p>
    </section>
    <section class="split-section" data-scene="hooks">
      <h3><span data-l="en">⚡ <em>Hooks</em> — every lifecycle event</span><span data-l="zh">⚡ <em>Hooks</em> — 全生命周期事件</span></h3>
      <p data-l="en">Kimi Code-aligned <code>[[hooks]]</code> engine: 16 events, blockable <code>PreToolUse</code> / <code>Stop</code> / <code>UserPromptSubmit</code>, exit-code semantics, fail-open. Skills scanned across seven scopes, collision-free.</p>
      <p data-l="zh">对齐 Kimi Code 的 <code>[[hooks]]</code> 引擎:16 个事件、可阻断的 <code>PreToolUse</code> / <code>Stop</code> / <code>UserPromptSubmit</code>、退出码语义、fail-open。Skills 七级作用域扫描,零冲突。</p>
    </section>
    <section class="split-section" data-scene="tui">
      <h3><span data-l="en">▭ <em>TUI</em> — the boxed editor</span><span data-l="zh">▭ <em>TUI</em> — 闭合框编辑器</span></h3>
      <p data-l="en">Kimi-style closed box (<code>╭─╮ │ ╰─╯</code>) with spinner and working state in the top border, three styles, hot-switch with <code>/tui</code>, and a render timing probe.</p>
      <p data-l="zh">Kimi 式闭合框(<code>╭─╮ │ ╰─╯</code>),上边框嵌入 spinner 与工作状态,三种样式,<code>/tui</code> 热切换,内置渲染耗时探针。</p>
    </section>
  </div>
</div>

<h2><span data-l="en">Quick start</span><span data-l="zh">快速开始</span></h2>
<div class="roadmap-grid">
<div class="card reveal" markdown="1">
### <span data-l="en">Install</span><span data-l="zh">安装</span>
<span data-l="en">One command, zero companion extensions. Restart pi and you're done.</span><span data-l="zh">一条命令，无需任何伴随扩展。重启 pi 即可。</span>

```bash
pi install npm:pi-muselinn-harness
```

<span data-l="en">Or from source: <code>pi install git:github.com/MuseLinn/pi-muselinn-harness</code></span><span data-l="zh">或源码安装：<code>pi install git:github.com/MuseLinn/pi-muselinn-harness</code></span>
</div>
<div class="card reveal" markdown="1">
### <span data-l="en">Try it</span><span data-l="zh">体验</span>
<span data-l="en">Everything is a slash command or a model-callable tool — no config files to learn first.</span><span data-l="zh">一切都是 slash 命令或模型可调用工具——无需先学习任何配置文件。</span>

```
/swarm on                                # parallel sub-agents
/goal Refactor the auth module           # budget-tracked goal
/todo init "Phase 1: scanner"            # phased task plan
/plan                                    # read-only plan mode
/tui style plain|boxed|compact           # switch editor chrome
```
</div>
<div class="card reveal" markdown="1">
### <span data-l="en">Docs</span><span data-l="zh">文档</span>
<span data-l="en">Full feature walkthroughs, command/tool references, architecture, and tests live in the README (EN / 中).</span><span data-l="zh">完整功能说明、命令/工具参考、架构与测试详见 README（EN / 中）。</span>

- [README (EN)](https://github.com/MuseLinn/pi-muselinn-harness/blob/main/README.md)
- [README (中文)](https://github.com/MuseLinn/pi-muselinn-harness/blob/main/README.zh-CN.md)
- [Changelog](changelog.html) · [Self-hosting](self-hosting.html)
</div>
</div>

<h2><span data-l="en">New in 0.9.18</span><span data-l="zh">0.9.18 新功能</span></h2>
<div class="roadmap-grid">
<div class="card reveal" markdown="1">
### <span data-l="en">Persistent startup permission mode</span><span data-l="zh">可持久化的启动权限模式</span>
<span data-l="en">Set <code>"defaultMode": "auto" | "yolo" | "manual"</code> in <code>permissions.json</code> (global <code>~/.pi/agent/</code> or project <code>.pi/</code>, global wins on conflict) and every fresh session starts there — no more interactive <code>/mode</code> on each new session. Sessions with a recorded <code>/mode</code> history still restore the last used mode; <code>defaultMode</code> is the starting point for fresh sessions. Thanks @jason-in-hub for the contribution!</span><span data-l="zh">在 <code>permissions.json</code>（全局 <code>~/.pi/agent/</code> 或项目 <code>.pi/</code>，冲突时全局优先）写入 <code>"defaultMode": "auto" | "yolo" | "manual"</code>，每个新会话都从该模式开始——不再需要每次手动 <code>/mode</code>。记录过 <code>/mode</code> 历史的会话仍恢复上次使用的模式；<code>defaultMode</code> 是新会话的起点。感谢 @jason-in-hub 的贡献！</span>
</div>
</div>
<h2><span data-l="en">Previously</span><span data-l="zh">历史版本</span></h2>

<p><span data-l="en">All earlier release notes live on the</span><span data-l="zh">更早的版本记录全部位于</span> <a href="changelog.html"><span data-l="en">changelog page</span><span data-l="zh">更新日志页</span></a> <span data-l="en">— generated from CHANGELOG.md, so it always matches the latest release.</span><span data-l="zh">— 由 CHANGELOG.md 自动生成,与最新发布始终保持一致。</span></p>

<h2><span data-l="en">Commands</span><span data-l="zh">命令</span></h2>

```
/swarm on|off        /cancel      /resume       /tasks (ctrl+shift+t)
/goal <objective>    /goal pause|resume|cancel|replace|budget|queue
/todo                /plan [on|off|clear] /mode        /tui style plain|boxed|compact
```

<span data-l="en">All commands support Tab completion for subcommands and arguments.</span><span data-l="zh">所有命令均支持 Tab 子命令/参数补全。</span>

<h2><span data-l="en">Links</span><span data-l="zh">链接</span></h2>

- [GitHub](https://github.com/MuseLinn/pi-muselinn-harness) · [npm](https://www.npmjs.com/package/pi-muselinn-harness) · [pi.dev catalog](https://pi.dev/packages/pi-muselinn-harness)
- [English README](https://github.com/MuseLinn/pi-muselinn-harness/blob/main/README.md) · [中文文档](https://github.com/MuseLinn/pi-muselinn-harness/blob/main/README.zh-CN.md)
- License: MIT
