import { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, Globe, RefreshCw, FolderOpen, CheckCircle2 } from 'lucide-react';
import { api, type HermesStatus } from '../../lib/api';

export function SettingsPage() {
  const [hermesStatus, setHermesStatus] = useState<HermesStatus | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const status = await api.checkHermesInstallation();
      setHermesStatus(status);
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    const isDark = newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
        <div>
          <h2 className="text-xl font-bold text-foreground">设置</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            应用偏好设置和 Hermes Agent 状态
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Hermes Agent Status */}
        {hermesStatus && (
          <div>
            <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
              Hermes Agent 状态
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${
                  hermesStatus.installed ? 'bg-emerald-500 animate-pulse-slow' : 'bg-red-500'
                }`} />
                <span className="font-semibold text-foreground">
                  {hermesStatus.installed ? '已安装' : '未检测到'}
                </span>
              </div>

              {hermesStatus.installed && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">配置目录</span>
                    <code className="ml-auto font-mono text-xs text-foreground">{hermesStatus.config_dir}</code>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[
                      { label: 'config.yaml', ok: hermesStatus.has_config },
                      { label: '.env', ok: hermesStatus.has_env },
                      { label: 'skills/', ok: hermesStatus.has_skills },
                      { label: 'memories/', ok: hermesStatus.has_memory },
                      { label: 'sessions/', ok: hermesStatus.has_sessions },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${
                          item.ok ? 'text-emerald-400' : 'text-muted-foreground/30'
                        }`} />
                        <span className={item.ok ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Theme */}
        <div>
          <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
            外观
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">主题</span>
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                {[
                  { key: 'light' as const, icon: Sun, label: '浅色' },
                  { key: 'dark' as const, icon: Moon, label: '深色' },
                  { key: 'system' as const, icon: Monitor, label: '跟随系统' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        theme === item.key
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleThemeChange(item.key)}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Language */}
        <div>
          <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
            语言
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">界面语言</span>
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                {[
                  { key: 'zh' as const, label: '中文' },
                  { key: 'en' as const, label: 'English' },
                ].map((item) => (
                  <button
                    key={item.key}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      language === item.key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setLanguage(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div>
          <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
            关于
          </div>
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">版本</span>
              <span className="text-foreground font-mono">v0.1.0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">技术栈</span>
              <span className="text-foreground">Tauri 2 + React + Rust</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
