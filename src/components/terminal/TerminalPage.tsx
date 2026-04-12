import { useState, useEffect } from 'react';
import { Terminal, RefreshCw, Server, Cloud, Box, Monitor, Cpu, HardDrive, MemoryStick, Clock } from 'lucide-react';
import { api, type TerminalConfig } from '../../lib/api';

const backends = [
  { id: 'local', label: 'Local', icon: Monitor, description: '本地终端执行' },
  { id: 'docker', label: 'Docker', icon: Box, description: 'Docker 容器执行' },
  { id: 'ssh', label: 'SSH', icon: Server, description: '远程 SSH 服务器' },
  { id: 'modal', label: 'Modal', icon: Cloud, description: 'Modal 云端执行' },
  { id: 'singularity', label: 'Singularity', icon: Box, description: 'Singularity 容器' },
  { id: 'daytona', label: 'Daytona', icon: Cloud, description: 'Daytona 云开发环境' },
];

export function TerminalPage() {
  const [config, setConfig] = useState<TerminalConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await api.getTerminalConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load terminal config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, []);

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
          <h2 className="text-xl font-bold text-foreground">终端后端管理</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            切换 Hermes Agent 的终端执行后端
          </p>
        </div>
        <button className="btn-ghost" onClick={loadConfig}>
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Backend selector */}
        <div>
          <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
            执行后端
          </div>
          <div className="grid grid-cols-3 gap-2">
            {backends.map((backend) => {
              const Icon = backend.icon;
              const isActive = config?.backend === backend.id;
              return (
                <div
                  key={backend.id}
                  className={`glass-card p-3 flex items-center gap-3 cursor-pointer transition-all ${
                    isActive ? 'active border-primary/50' : 'hover:border-primary/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {backend.label}
                      {isActive && <span className="badge-success text-[10px]">当前</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{backend.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current configuration */}
        {config && (
          <div>
            <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
              当前配置
            </div>
            <div className="glass-card p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">工作目录</span>
                  <span className="text-sm font-mono text-foreground ml-auto">{config.cwd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">超时</span>
                  <span className="text-sm font-mono text-foreground ml-auto">{config.timeout}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">生命周期</span>
                  <span className="text-sm font-mono text-foreground ml-auto">{config.lifetime_seconds}s</span>
                </div>
              </div>

              {/* Container resources */}
              {(config.container_cpu || config.container_memory || config.container_disk) && (
                <>
                  <div className="border-t border-border/30 pt-3">
                    <div className="text-xs text-muted-foreground mb-2">容器资源</div>
                    <div className="grid grid-cols-3 gap-3">
                      {config.container_cpu && (
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">{config.container_cpu} cores</span>
                        </div>
                      )}
                      {config.container_memory && (
                        <div className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4 text-green-400" />
                          <span className="text-sm">{config.container_memory} MB</span>
                        </div>
                      )}
                      {config.container_disk && (
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-amber-400" />
                          <span className="text-sm">{config.container_disk} MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* SSH config */}
              {config.ssh_host && (
                <div className="border-t border-border/30 pt-3">
                  <div className="text-xs text-muted-foreground mb-2">SSH 配置</div>
                  <div className="text-sm font-mono text-foreground">
                    {config.ssh_user || 'root'}@{config.ssh_host}:{config.ssh_port || 22}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
