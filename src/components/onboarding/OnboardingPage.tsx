import { useState, useEffect } from 'react';
import { Zap, CheckCircle2, AlertCircle, Download, ArrowRight, Terminal } from 'lucide-react';
import { api, type HermesCLIStatus } from '../../lib/api';

interface OnboardingPageProps {
  onInstalled: () => void;
}

export function OnboardingPage({ onInstalled }: OnboardingPageProps) {
  const [cliStatus, setCliStatus] = useState<HermesCLIStatus | null>(null);
  const [wslMissing, setWslMissing] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkInstallation();
  }, []);

  const checkInstallation = async () => {
    setChecking(true);
    setWslMissing(false);
    try {
      const status = await api.checkHermesInstallation();
      setCliStatus({
        available: status.cli_available,
        version: status.cli_version,
        path: null,
      });

      if (status.config_dir === 'WSL_NOT_FOUND') {
        setWslMissing(true);
      } else if (status.cli_available && status.installed) {
        // Already installed, proceed to main app
        setTimeout(() => onInstalled(), 800);
      }
    } catch {
      setCliStatus({ available: false, version: null, path: null });
    } finally {
      setChecking(false);
    }
  };

  const isInstalled = cliStatus?.available === true;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-background px-8 animate-fade-in">
      {/* Logo / Hero */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mx-auto mb-6 shadow-lg shadow-primary/10">
          <Zap className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Hermes Switch
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
          Hermes Agent 的图形化配置管理中心<br />
          一键切换 AI Provider、管理 API Keys、配置 MCP 和记忆
        </p>
      </div>

      {/* Status Card */}
      <div className="w-full max-w-md glass-card p-6 mb-6">
        {checking ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">正在检测 Hermes Agent 安装状态...</span>
          </div>
        ) : wslMissing ? (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-foreground">未检测到 WSL2 运行环境</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                在 Windows 平台运行 Hermes Agent，需要首先开启并安装 **WSL2 (Windows Linux 子系统)** 虚拟机。
              </p>
            </div>
          </div>
        ) : isInstalled ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Hermes Agent 已安装</p>
              {cliStatus?.version && (
                <p className="text-xs text-muted-foreground mt-0.5">{cliStatus.version}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">未检测到 Hermes Agent</p>
              <p className="text-xs text-muted-foreground mt-1">
                需要安装 Hermes Agent 才能使用 HermesSwitch 的所有功能。
                安装过程全自动，无需手动操作终端。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Feature / Guide List */}
      {wslMissing && !checking && (
        <div className="w-full max-w-md mb-8 p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-3">
          <p className="text-xs text-red-400 uppercase font-semibold tracking-wider">Windows 用户配置指引</p>
          <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <p>1. 请以 **管理员权限** 打开 PowerShell 或者是命令提示符（CMD）。</p>
            <p>2. 输入并运行以下命令，以自动启用 WSL 和安装默认 Linux 发行版：</p>
            <div className="bg-black/20 p-2.5 rounded font-mono text-primary text-xs select-all text-center">
              wsl --install
            </div>
            <p>3. 安装完成后，请 **重启您的电脑**，并完成 Ubuntu 初始化用户名和密码设置。</p>
            <p>4. 重新打开本软件，即可进行一键部署安装。</p>
          </div>
        </div>
      )}

      {!wslMissing && !isInstalled && !checking && (
        <div className="w-full max-w-md mb-8">
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-3">安装将自动完成</p>
          <div className="space-y-2">
            {[
              '安装 uv 包管理器（如未安装）',
              '安装 Hermes Agent 及所有依赖',
              '配置 hermes 命令到 PATH',
              '初始化 ~/.hermes/ 配置目录',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!checking && (
        <div className="w-full max-w-md flex flex-col gap-3">
          {wslMissing ? (
            <a
              href="https://learn.microsoft.com/zh-cn/windows/wsl/install"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 text-center"
            >
              阅读微软官方 WSL2 安装指南
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          ) : !isInstalled ? (
            <>
              <a
                href="/install"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('navigate-to-install'));
                }}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                一键安装 Hermes Agent
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
              <button
                onClick={onInstalled}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-xl text-sm transition-colors"
              >
                <Terminal className="w-4 h-4" />
                跳过（我已手动安装）
              </button>
            </>
          ) : (
            <button
              onClick={onInstalled}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-all duration-200"
            >
              进入 HermesSwitch
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground/50 text-center">
        {wslMissing ? '启用 WSL2 并重启电脑后才能继续' : '安装需要网络连接，约 1~3 分钟完成'}
      </p>
    </div>
  );
}
