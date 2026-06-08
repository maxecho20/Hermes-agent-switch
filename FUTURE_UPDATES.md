# HermesSwitch — 未来优化计划

> 本文档记录已规划但暂未实施的优化项目，按优先级排列。

---

## 🔐 macOS 代码签名（中等优先级）

**背景**：当前打包的 .app 未签名，macOS Gatekeeper 会弹出"未知开发者"警告，用户需右键→打开绕过。

**目标**：申请 Apple Developer 账号并配置签名证书，消除安全警告，提升用户信任度。

**实施步骤**：
1. 申请 [Apple Developer Program](https://developer.apple.com/programs/)（$99/年）
2. 在 GitHub Secrets 配置：
   - `APPLE_CERTIFICATE`（Base64 编码的 .p12 证书）
   - `APPLE_CERTIFICATE_PASSWORD`（证书密码）
   - `APPLE_SIGNING_IDENTITY`（证书 ID，如 `Developer ID Application: Your Name (XXXXXXXXXX)`）
   - `APPLE_ID`（Apple ID 邮箱）
   - `APPLE_PASSWORD`（App-specific password）
   - `APPLE_TEAM_ID`（Team ID）
3. 更新 `src-tauri/tauri.conf.json`：
   ```json
   {
     "bundle": {
       "macOS": {
         "signingIdentity": "Developer ID Application: Your Name (XXXXXXXXXX)",
         "providerShortName": "XXXXXXXXXX"
       }
     }
   }
   ```
4. 更新 `.github/workflows/build-macos.yml` 添加 notarize 步骤

---

## 🪟 Windows 版本（低优先级）

**背景**：Hermes Agent 官方不支持 Windows 原生，仅支持 WSL2。

**目标**：HermesSwitch 在 Windows 上运行，自动检测 WSL2 并引导安装，通过 WSL2 bridge 执行 hermes。

**实施步骤**：
1. 在 `lib.rs` 中添加 Windows 平台检测
2. 若无 WSL2：显示引导界面（含 WSL2 安装链接）
3. 若有 WSL2：通过 `wsl -e hermes --version` 检测 hermes
4. 安装逻辑：通过 WSL2 执行 curl 安装脚本
5. `.github/workflows/build-windows.yml`：打包 `.msi` 安装包

---

## 🐧 Linux 版本（低优先级）

**背景**：Linux 与 macOS 安装逻辑基本相同，差异主要在发行版包格式。

**目标**：提供 `.AppImage`（通用）和 `.deb`（Debian/Ubuntu）安装包。

**实施步骤**：
1. 复用 macOS 安装逻辑（curl 官方安装脚本）
2. 更新 `.github/workflows/build-macos.yml` 为多平台版本
3. 测试主流发行版：Ubuntu 22.04、Fedora 40、Arch Linux

---

## 🔄 多平台统一 CI/CD（低优先级）

在 Windows 和 Linux 适配完成后，整合为单一 GitHub Actions workflow：

```yaml
# 单次触发，同时构建三平台
strategy:
  matrix:
    include:
      - os: macos-latest
        target: universal-apple-darwin
        artifact: HermesSwitch-macOS-universal.dmg
      - os: windows-latest
        target: x86_64-pc-windows-msvc
        artifact: HermesSwitch-Windows-x64.msi
      - os: ubuntu-latest
        target: x86_64-unknown-linux-gnu
        artifact: HermesSwitch-Linux-x64.AppImage
```

---

## 📊 遥测与更新检查（可选）

- 应用内"检查更新"按钮，比较本地版本与 GitHub Releases 最新版
- 可选的匿名使用统计（Provider 使用分布，无任何个人信息）

---

*最后更新：2026.6.8*
