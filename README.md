# Hermes Agent Switch

![Hermes Switch](https://img.shields.io/badge/Tauri-2.0-blue) ![React](https://img.shields.io/badge/React-19-blue) ![Rust](https://img.shields.io/badge/Rust-1.94-orange)

Hermes Agent Switch 是专为 [Hermes Agent](https://github.com/maxecho/hermes-agent) 打造的跨平台桌面图形化配置管理工具。它的设计灵感来源于 CC Switch，旨在让用户无需手动编辑终端命令或复杂的 Yaml 文件，即可直观、原子化地管理底层代理的配置。

## ✨ 核心特性

- **🛡️ 安全隐私优先**
  - 完全本地运行，所有配置解析、写入（包含 API Key 等机密数据）均发生在你的本地硬盘，无任何云端遥测与上传。
  - **原子写入机制 & 自动备份**：任何配置变动都会自动将旧的配置备份至 `~/.hermes/hermes-switch-backups/` 中，以防意外覆盖导致数据丢失。

- **🤖 强大的提供商管理 (Provider Manager)**
  - 原生支持 16+ LLM 服务商预设，包括：OpenRouter, Google Gemini, Anthropic, 智谱 GLM, 月之暗面 Kimi, MiniMax, 甚至自定义本地大模型等。
  - 一键切换当前底层模型。自动修改位于 `~/.hermes/config.yaml` 的模型层。

- **🧩 完整生态图形化**
  - **终端后端**: 可视化选择 Hermes Agent 是在 Local, Docker, SSH 还是 Modal 中运行。
  - **MCP 管理**: 图形化展现你的 Model Context Protocol 服务器列表（分析 stdio / http）。
  - **持久记忆编辑器**: 内置对 `MEMORY.md`, `USER.md` 和 `SOUL.md` 的编辑器，提供清晰的字数额度进度条。
  - **高级配置双向同步**: 想要深入硬核修改的极客也可直接修改 `config.yaml` 或 `.env` 的裸文本，自带验证体系。

## 🚀 技术栈

- 🖥️ **前端**: React 19 + TypeScript + TailwindCSS v3 + shadcn/ui 风格
- ⚙️ **后端**: Tauri 2.0 (Rust) 提供高性能底层读写
- 💾 **机制**: 直接读取操作 `~/.hermes/` 下的文件，作为完全无侵入的图形外壳。

## 🛠️ 安装与运行

### 环境准备

确保你电脑上已安装:
- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Rust & Cargo](https://rustup.rs/)

### 开发环境启动

1. 把仓库克隆到本地，然后进入目录：
```bash
git clone https://github.com/maxecho20/Hermes-agent-switch.git
cd Hermes-agent-switch
```

2. 安装前端依赖：
```bash
pnpm install
```

3. 启动 Tauri 开发服务器：
```bash
pnpm tauri dev
```
首次启动时，Rust 后端编译可能需要几分钟，请耐心等待直到桌面窗口出现。

## 🔐 隐私说明

本项目的设计初衷是提供完全在**本地终端**执行的外壳。Hermes Switch 不会将你的配置或者任何密钥上传到代码仓库或其他远程服务器中。

- 你的 `API Keys` 只存放于系统的 `~/.hermes/.env` 里，通过 Rust 接口安全读写。
- 请**不要**将个人的 `~/.hermes` 文件夹直接推送到任何公开的 Github 仓库中。

## 🗺️ 项目状态

当前产品处于 Alpha 阶段 (Phase 1 & 2 Completed)：
- [x] 成功配置独立应用的 React + Tauri UI 开发基础架构
- [x] 深入集成了 `ConfigParser` 模块，完成提供商和所有设置的读写、切换与备份
- [ ] 系统托盘模式
- [ ] SQLite 核心配置与消息会话可视化管理
- [ ] 网关联调可视化管理 (Discord/Telegram 等)
