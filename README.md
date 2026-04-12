# Hermes Agent Switch

![Hermes Switch](https://img.shields.io/badge/Tauri-2.0-blue) ![React](https://img.shields.io/badge/React-19-blue) ![Rust](https://img.shields.io/badge/Rust-1.94-orange) ![License](https://img.shields.io/badge/License-MIT-green)

<p align="center">
  <strong>专为 Hermes Agent 打造的跨平台桌面图形化配置管理工具</strong>
</p>

Hermes Agent Switch 的设计灵感来源于 [CC Switch](https://github.com/farion1231/cc-switch)，旨在让用户无需手动编辑终端命令或 YAML 文件，即可直观、安全地管理底层代理的配置。

---

## ✨ 核心特性

### 🛡️ 安全隐私优先
- **完全本地运行**：所有配置解析、写入（包含 API Key 等机密数据）均发生在你的本地硬盘，无任何云端遥测与上传。
- **原子写入 + 自动备份**：任何配置变动都会自动将旧配置备份至 `~/.hermes/hermes-switch-backups/`，防止意外覆盖导致数据丢失。

### 🤖 供应商管理 (Provider Manager)
- 原生支持 **11+ LLM 服务商**预设：OpenRouter、Google Gemini、Anthropic、智谱 GLM、月之暗面 Kimi、MiniMax、Hugging Face、小米 MiMo、自定义端点等。
- **一键切换**当前底层模型，自动修改 `~/.hermes/config.yaml` 的 model 段。
- **配置弹窗模式**：可在切换时自定义 Model、Base URL 和 API Key。

### 🧩 完整生态图形化
| 模块 | 功能 |
|------|------|
| **终端后端** | 可视化选择 Local / Docker / SSH / Modal / Singularity / Daytona |
| **MCP 管理** | 图形化展示 Model Context Protocol 服务器列表（stdio / http） |
| **技能管理** | 浏览 `~/.hermes/skills/` 下的已安装技能库 |
| **记忆编辑器** | 编辑 `MEMORY.md`、`USER.md`、`SOUL.md`，带字数进度条 |
| **配置编辑器** | 直接编辑 `config.yaml` 和 `.env` 裸文本，自带 YAML 验证 |
| **设置面板** | Hermes Agent 安装状态检测、主题切换、语言切换 |

---

## 🚀 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19 + TypeScript + TailwindCSS 3 |
| **后端** | Tauri 2.0 (Rust) — 高性能本地文件读写 |
| **机制** | 直接读取操作 `~/.hermes/` 下的文件，作为完全无侵入的图形外壳 |

---

## 🛠️ 安装与运行

### 环境准备

确保你的电脑已安装以下工具：

| 工具 | 安装方式 |
|------|----------|
| [Node.js](https://nodejs.org/) (v18+) | 官网下载或 `brew install node` |
| [pnpm](https://pnpm.io/) | `npm install -g pnpm` |
| [Rust & Cargo](https://rustup.rs/) | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |

### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/maxecho20/Hermes-agent-switch.git

# 2. 进入项目目录
cd Hermes-agent-switch

# 3. 安装前端依赖
pnpm install

# 4. 启动开发服务器（桌面窗口会自动弹出）
pnpm tauri dev
```

> **⚠️ 首次启动说明**：首次运行 `pnpm tauri dev` 时，Rust 后端需要编译约 300+ 个 crate 依赖，可能需要 **3-5 分钟**。后续启动通常只需 **1-2 秒**。

### 常见启动问题

**Q: 报错 `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND: No package.json`**

这说明你不在正确的项目目录内。请确保终端已经 `cd` 到 `Hermes-agent-switch` 或 `HermesSwitch` 子文件夹中：

```bash
cd Hermes-agent-switch   # 或者 cd HermesSwitch
pnpm tauri dev
```

**Q: 端口 1420 被占用？**

```bash
# 先杀掉占用端口的进程
lsof -ti :1420 | xargs kill -9
# 然后重新启动
pnpm tauri dev
```

**Q: 如何在关闭窗口后重新启动？**

直接在项目目录下运行：
```bash
pnpm tauri dev
```
Tauri 会自动启动 Vite 前端开发服务器 + Rust 后端，并弹出桌面窗口。

---

## 📁 项目结构

```
Hermes-agent-switch/
├── src/                              # React 前端源码
│   ├── components/
│   │   ├── providers/ProvidersPage.tsx   # 供应商管理（核心）
│   │   ├── mcp/McpPage.tsx              # MCP 服务器管理
│   │   ├── skills/SkillsPage.tsx        # 技能列表
│   │   ├── terminal/TerminalPage.tsx     # 终端后端管理
│   │   ├── memory/MemoryPage.tsx         # 记忆编辑器
│   │   ├── config/ConfigPage.tsx         # 配置编辑器
│   │   ├── settings/SettingsPage.tsx     # 设置面板
│   │   └── layout/Sidebar.tsx           # 侧边栏导航
│   ├── lib/
│   │   ├── api.ts                       # Tauri 后端 API 调用层
│   │   ├── i18n.ts                      # 国际化（中/英文）
│   │   └── utils.ts                     # 工具函数
│   ├── App.tsx                          # 主应用 + 路由
│   ├── main.tsx                         # 入口文件
│   └── index.css                        # 全局样式 + CSS 变量
├── src-tauri/                         # Rust 后端源码
│   ├── src/lib.rs                       # 12 个 Tauri 命令
│   ├── Cargo.toml                       # Rust 依赖
│   └── tauri.conf.json                  # Tauri 窗口配置
├── package.json                       # Node.js 依赖
├── tailwind.config.cjs                # TailwindCSS 配置
└── README.md                          # 本文档
```

---

## 🔐 隐私与安全

> **本项目的设计初衷是提供完全在本地终端执行的图形外壳。**

- 你的 `API Keys` 只存放于系统的 `~/.hermes/.env` 和 `~/.hermes/config.yaml` 中，通过 Rust 接口安全读写。
- Hermes Switch **不会**将任何配置或密钥上传到代码仓库或远程服务器。
- `.gitignore` 已配置为阻止 `.env` 等敏感文件被意外提交。
- 请**不要**将个人的 `~/.hermes/` 文件夹直接推送到任何公开的 GitHub 仓库。

---

## 🗺️ 开发路线图

### ✅ Phase 1 — 基础框架（已完成）
- [x] Tauri 2 + React 19 + Rust 项目脚手架
- [x] TailwindCSS 3 深色主题 + 玻璃态设计系统
- [x] 侧边栏导航（9 个页面）
- [x] 国际化框架（中/英文切换）

### ✅ Phase 2 — 核心功能（已完成）
- [x] Rust 后端：12 个 Tauri 命令（读取/写入 config.yaml、.env、skills、memory 等）
- [x] 供应商管理：一键切换 + 配置弹窗 + 原子写入 + 自动备份
- [x] MCP 管理：解析并展示 MCP 服务器配置
- [x] 技能管理：浏览技能目录列表
- [x] 终端后端：可视化 6 种执行后端配置
- [x] 记忆编辑器：编辑 MEMORY.md / USER.md / SOUL.md
- [x] 配置编辑器：直接编辑 config.yaml / .env（带 YAML 验证）
- [x] 设置面板：安装检测 + 主题/语言切换

### 🚧 Phase 3 — 增强与优化（进行中）
- [ ] 修复供应商列表滚动显示问题
- [ ] 完善 .env 中多种 API Key 格式的识别
- [ ] 终端后端的可视化切换功能
- [ ] MCP 服务器的添加/编辑/删除功能
- [ ] 系统托盘 + 快捷键切换

### 📋 Phase 4 — 高级功能
- [ ] 网关管理（Telegram / Discord / Slack / 飞书 / 微信 等）
- [ ] 会话历史浏览器（读取 sessions/ 下的 JSONL 文件）
- [ ] SQLite 配置持久化
- [ ] 配置文件实时监控（文件系统 Watcher）
- [ ] 打包为 .dmg / .exe / .AppImage 发布

---

## 📄 License

MIT License
