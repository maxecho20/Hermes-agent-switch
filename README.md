# Hermes Agent Switch

Hermes Agent Switch 是一个跨平台桌面应用，专门用于为 [Hermes Agent] 提供图形化的配置、状态与资源管理。

它通过可视化界面安全地读取并原子性写入 `~/.hermes/` 目录下的核心配置文件，让用户无需手动编辑终端命令或 YAML 文件，即可直观、安全地管理底层代理的配置。

---

## 🔒 隐私与安全声明 (重要)

本项目**绝对不会**收集、上传或泄露您的任何敏感信息：
1. **完全本地化**：所有的数据处理仅在您的本机运行，Rust 后端直接读写您本机的 `~/.hermes/` 目录。
2. **私钥隔离**：大模型的 API Key（如 OpenAI、Anthropic、智谱 GLM、DeepSeek 等），以及网关账号信息（如飞书、微信、Telegram Token），全部存储在您本地的 `~/.hermes/.env` 及 `config.yaml` 文件中。
3. **Github 防泄漏**：本项目的 `.gitignore` 已严格过滤 `.env` 等包含私密配置的文件，确保敏感信息绝对不会被推送到 GitHub 代码库。

---

## 🌟 核心特性

- **多供应商配置与 Profile 持久化** 
  - 支持将供应商（包括 Model, Base URL, API Key 等）保存为独立的 Profile 预设，随时一键切回，解决每次切换都需要重新输入配置的痛点。
  - 内置丰富的优质预设阵容，包含 OpenAI, Anthropic, Google Gemini 以及优质国产大模型：**DeepSeek**、**智谱 GLM (提供分别针对国内外网络环境的中国端与国际端线路)**、**Kimi** 等。
- **环境隔离与原子写入**
  - 所有写入操作（特别是 `config.yaml` 或各类 `.md` 文件）均采用原子写入机制（先写 `.tmp` 再重命名覆盖）。
  - 每次切换自动在 `~/.hermes/hermes-switch-backups` 创建带时间戳的完整备份，杜绝配置丢失。
- **MCP (Model Context Protocol) 模块管理**
  - 图形化展示已启用的 MCP 服务器。
  - 内置 5 大实用 MCP 模板（Filesystem、Brave Search、GitHub、Fetch、SQLite），提供一键复制配置功能。
- **应用监控与终端配置**
  - 实时监控 Hermes Agent 是否就绪及各配置文件读取状态。
  - 图形化修改运行时终端后端（Local、Docker、SSH 等），智能适配工作目录配置。
- **记忆与核心设定管理**
  - 集成文本模式一键编辑用户的 `MEMORY.md`, `SOUL.md`, `USER.md` 等身份和记忆设置。
- **极致的视觉交互体验**
  - 基于 React 19 和 Vanilla CSS 打造动态、细腻的磨砂玻璃 UI（深色模式）。响应敏捷，符合现代美学。

---

## 🚀 重新启动与运行指南

如果在您关闭了应用后需要重新启动：

1. **进入启动目录**  
   打开终端，输入以下命令进入应用目录：
   ```bash
   cd /path/to/HermesSwitch
   ```
2. **执行启动命令**  
   运行 Tauri 开发服务器重新唤起桌面窗口：
   ```bash
   pnpm tauri dev
   ```
   *注意：如果偶尔遇到端口被占用的情况，可以把正在运行进程先彻底关掉（例如通过 `lsof -ti :1420 | xargs kill -9` 终止后台进程），然后再试。*

---

## 🛠️ 技术栈

*   **前端**: React 19 + TypeScript + Vite + Lucide React (图标)
*   **后端**:  Rust + Tauri 2.0 
*   **样式体系**: Vanilla CSS (极简 Tailwind 混用) + CSS 变量实现主题及动画。

---

## 📦 打包发布 (构建生产版)

当需要将 Hermes Agent Switch 构建为独立的 `.app` 或 `.exe` 时请执行：

```bash
# 推荐先清理一次旧的构建缓存
pnpm tauri build
```

构建产物将放置在 `src-tauri/target/release/bundle/` 中。

---

## 📄 License

MIT License
