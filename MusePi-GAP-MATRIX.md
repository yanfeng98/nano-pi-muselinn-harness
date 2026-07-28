# MusePi 差距矩阵

> 四维对比：Pi 上游 v0.82.0 · OMP v17.1 · Kimi Code (main) · Grok Build
> 生成日期：2026-07-24 · 最后更新：2026-07-28（v0.2.14 开发中）

---

## 图例

| 符号 | 含义 |
|------|------|
| ✅ | 完全支持 |
| ⚠️ | 部分支持 / 有限支持 |
| ❌ | 不支持 |
| — | 不适用 |

---

## 一、Agent 核心能力

| 能力 | Pi | OMP | Kimi Code | Grok Build | MusePi | 在 MusePi 的位置 |
|------|----|-----|-----------|------------|--------|-----------------|
| Agent loop | ✅ | ✅ fork | ✅ 自研 | ✅ Rust | ✅ pin upstream | `packages/coding-agent` |
| Swarm 子代理 | ❌ | ✅ | ✅ | ❌ | ✅ | `@musepi/core/swarm` |
| Goal 目标系统 | ⚠️ 扩展 | ✅ | ✅ | ❌ | ✅ | `@musepi/core/goal` |
| Plan 规划模式 | ❌ | ✅ | ✅ | ❌ | ✅ | `@musepi/core/plan` |
| Permission 权限 | ⚠️ 基础 | ✅ | ✅ | ✅ | ✅ | `@musepi/core/permission` |
| 模型角色路由 | ❌ | ✅ | ⚠️ 继承制 | ✅ | ✅ | `@musepi/core/model-roles` |
| 动态工具选择 | ⚠️ 协议 | ✅ | ✅ deferred | ❌ | ✅ | `@musepi/core/tool-select` |
| 嵌套子代理 | ❌ | ✅ | ❌ | ❌ | ❌ 明确关闭 | 安全策略决定 |
| 后台任务 | ❌ | ✅ | ✅ | ✅ | ✅ | `@musepi/core/task` |
| Cron 定时 | ❌ | ✅ | ✅ | ❌ | ✅ | `@musepi/core/task/cron` |

## 二、TUI / 渲染

| 能力 | Pi | OMP | Kimi Code | Grok Build | MusePi | 在 MusePi 的位置 |
|------|----|-----|-----------|------------|--------|-----------------|
| 闭合框编辑器 | ❌ | ✅ | ✅ | ✅ | ✅ | `boxed-editor.ts`（默认） |
| Alt-screen 全屏 | ❌ | ✅ | ⚠️ container swap | ✅ Rust | ⚠️ container swap | `interactive-mode.ts` |
| SGR 鼠标支持 | ❌ | ✅ | ❌ | ✅ | ✅ | `5e7d98eb` |
| 问候/设置向导 | ❌ | ✅ | ✅ | ✅ | ✅ | `setup-wizard` |
| 主题预设 | ⚠️ 基础 | ✅ | ✅ | ✅ | ✅ 6 预设 + shimmer | `1f78e26e` |
| 颜色盲模式 | ❌ | ❌ | ❌ | ❌ | ✅ | `1f78e26e` |
| 分组设置面板 | ❌ | ✅ | ✅ | ✅ | ✅ 42 项/9 组 | `config/schema.ts` |
| 全屏任务浏览器 | ❌ | ✅ | ✅ | ❌ | ✅ | `fullscreen/task-browser.ts` |
| Agent 仪表盘 | ❌ | ✅ | ✅ | ❌ | ✅ | `agent-dashboard.ts` |
| Ctrl+R 历史搜索 | ❌ | ✅ | ❌ | ❌ | ✅ | `8a413295` |

## 三、编辑与代码智能

| 能力 | Pi | OMP | Kimi Code | Grok Build | MusePi | 在 MusePi 的位置 |
|------|----|-----|-----------|------------|--------|-----------------|
| Hashline 编辑 | ❌ | ✅ | ❌ | ❌ | ✅ | `@musepi/core/hashline` |
| LSP 懒加载 | ❌ | ✅ | ❌ | ❌ | ✅ | `@musepi/core/lsp` |
| LSP 写后诊断 | ❌ | ✅ | ❌ | ❌ | ✅ | `lsp/deferred.ts` |
| DAP 调试器 | ❌ | ✅ 28 ops | ❌ | ❌ | ❌ | P2 候选 |
| AST 操作 | ❌ | ✅ tree-sitter | ❌ | ❌ | ❌ | 依赖 Rust 层 |
| Clustered diff | ❌ | ✅ | ✅ | ✅ | ✅ | `tui/diff-preview.ts` |
| 流式规则注入 | ❌ | ✅ | ❌ | ❌ | ✅ | `stream-rules/` |

## 四、MCP / 扩展生态

| 能力 | Pi | OMP | Kimi Code | Grok Build | MusePi | 在 MusePi 的位置 |
|------|----|-----|-----------|------------|--------|-----------------|
| MCP 服务器 | ❌ | ✅ | ✅ | ✅ | ✅ | `@musepi/core/mcp` |
| Pi 扩展兼容 | ✅ | ❌ | ❌ | ❌ | ✅ | `compat.loadPiExtensions` |
| 插件清单 | ❌ | ✅ | ✅ | ✅ | ✅ | `plugin/manifest.ts` |
| Hooks 引擎 | ❌ | ✅ | ✅ `[[hooks]]` | ✅ | ✅ | `@musepi/core/hooks` |
| Skills 7 范围 | ❌ | ✅ | ✅ 4 范围 | ✅ | ✅ | `@musepi/core/skills` |
| Agent 定义文件 | ❌ | ✅ | ✅ AGENTS.md | ✅ | ✅ | `agents/types.ts` |
| ACP 协议 | ⚠️ 基础 | ✅ 深度 | ❌ | ✅ 深度 | ✅ v1.3.0 SDK | `acp-mode.ts` |

## 五、记忆与状态

| 能力 | Pi | OMP | Kimi Code | Grok Build | MusePi | 在 MusePi 的位置 |
|------|----|-----|-----------|------------|--------|-----------------|
| 记忆系统 | ❌ | ✅ Hindsight | ❌ | ❌ | ✅ BM25 Markdown | `@musepi/core/memory` |
| Snapcompact | ❌ | ✅ 同源 | ❌ | ❌ | ✅ | `@musepi/core/snapcompact` |
| Checkpoint/rewind | ❌ | ✅ | ❌ | ❌ | ❌ | P3 候选 |
| /undo | ❌ | ✅ | ✅ | ❌ | ✅ | `undo.ts` |
| /btw 旁注 | ❌ | ✅ | ✅ | ❌ | ✅ | `btw.ts` |

## 六、工具层

| 能力 | Pi | OMP | Kimi Code | Grok Build | MusePi | 在 MusePi 的位置 |
|------|----|-----|-----------|------------|--------|-----------------|
| Web search | ⚠️ 扩展 | ✅ 25 引擎 | ✅ | ✅ | ✅ OMP 移植 | `2b0cf77e` |
| Browser | ❌ | ✅ Puppeteer | ❌ | ✅ Rust | ❌ | P2 候选 |
| GitHub 协议 | ❌ | ✅ gh:// | ❌ | ❌ | ❌ | P1 候选 |
| Eval 内核 | ❌ | ✅ Py+JS | ❌ | ❌ | ❌ | 明确不做 |
| SSH | ❌ | ✅ | ❌ | ❌ | ❌ | 低优先级 |
| 外聚会话导入 | ❌ | ✅ | ❌ | ❌ | ✅ 3 格式 | `24e713ef` |
| 原生 shell | ❌ | ✅ Rust brush | ❌ | ✅ Rust | ❌ 系统 bash | 明确不做 |
| 原生 grep/glob | ❌ | ✅ Rust | ❌ | ✅ Rust | ❌ 系统工具 | 明确不做 |
| 文件读取提取 | ⚠️ 基础 | ✅ tree-sitter | ✅ | ✅ | ⚠️ 基础 | 可改进 |

## 七、网络与协作

| 能力 | Pi | OMP | Kimi Code | Grok Build | MusePi | 在 MusePi 的位置 |
|------|----|-----|-----------|------------|--------|-----------------|
| ACP 协议 | ⚠️ | ✅ 深度 | ❌ | ✅ 深度 | ✅ v1.3.0 SDK | `acp-mode.ts` |
| /collab 协作 | ❌ | ✅ relay+QR | ❌ | ❌ | ❌ | 远期评估 |
| 多凭证管理 | ❌ | ✅ round-robin | ✅ | ✅ | ✅ SQLite+broker | `9283bcdd` |
| Auth broker | ❌ | ❌ | ❌ | ❌ | ✅ AES-GCM | `auth-broker/` |
| 桌面通知 | ❌ | ✅ | ❌ | ❌ | ✅ OSC 9 | `notify.ts` |

---

## 八、综合排名：MusePi 下一步优先差距

| 排名 | 差距 | 来源 | 工作量 | 当前版本 | 说明 |
|------|------|------|--------|---------|------|
| **P0** | Extension 更新通道品牌化 | Pi 上游 | 低 | ⚠️ v0.2.14 未修 | `musepi update --extensions` 文案混入 pi 品牌 |
| **P0** | 上游 v0.82.0 cherry-pick 审核 | Pi 上游 | 低-中 | ⚠️ v0.2.14 未审 | SQLite 存储、llama.cpp 等跳过项的 re-eval |
| **P1** | Internal URLs 扩展（skill:// agent:// conflict://） | OMP | 中 | ✅ pr:// issue:// | 从 2 种扩展到 14 种 |
| **P1** | Scrapers 扩展（80+ 缺失） | OMP | 中 | ✅ 7/80 | arXiv/GitHub/npm/PyPI/crates/SO/Wikipedia |
| **P1** | Settings Tab 图标 | OMP | 低 | ⚠️ 无 icon | 每个 Tab 加 theme symbol |
| **P2** | Browser 工具 | OMP/Grok | 中 | ❌ | Puppeteer CDP + stealth |
| **P2** | Magic keywords | OMP | 低 | ❌ | ultrathink/orchestrate/workflowz |
| **P2** | Hashline 文档/教程 | OMP | 低 | ⚠️ 代码就位 | 用户文档缺失 |
| **P2** | DAP 调试器基础 | OMP | 高 | ❌ | lldb/gdb/debugpy 集成 |
| **P2** | Autoresearch | OMP | 中 | ❌ | depth-research 模式 |
| **P3** | 向量记忆升级 | OMP | 中 | ⚠️ BM25 | BM25 → SQLite 向量 |
| **P3** | /collab 协作 | OMP | 高 | ❌ | relay + QR 基础设施 |
| — | Rust 原生层 | OMP/Grok | 极高 | ❌ | 明确不做 |
| — | Eval 双内核 | OMP | 高 | ❌ | 明确不做 |
| — | 嵌套子代理 | Kimi | — | ❌ | 明确不做 |
| — | Alt-screen 主界面 | Grok | — | ⚠️ container swap | 明确不做 |
