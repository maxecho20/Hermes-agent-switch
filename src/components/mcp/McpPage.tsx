import { useState, useEffect } from 'react';
import { Network, Plus, Server, Globe, RefreshCw, Power, PowerOff } from 'lucide-react';
import { api, type McpServerConfig } from '../../lib/api';

export function McpPage() {
  const [servers, setServers] = useState<McpServerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServers = async () => {
    setLoading(true);
    try {
      const data = await api.getMcpServers();
      setServers(data);
      setError(null);
    } catch (err) {
      setError(String(err));
      setServers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServers(); }, []);

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
          <h2 className="text-xl font-bold text-foreground">MCP 服务器管理</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            管理 Hermes Agent 的 Model Context Protocol 服务器
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={loadServers}>
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button id="btn-add-mcp" className="btn-primary">
            <Plus className="w-4 h-4" />
            添加 MCP 服务器
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {error && (
          <div className="p-4 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        {servers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Network className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">暂无 MCP 服务器配置</p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              在 config.yaml 的 mcp_servers 段中添加配置
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
              已配置的 MCP 服务器 ({servers.length})
            </div>
            {servers.map((server, index) => (
              <div key={index} className="glass-card p-4 group hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      server.server_type === 'stdio'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {server.server_type === 'stdio' ? (
                        <Server className="w-5 h-5" />
                      ) : (
                        <Globe className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{server.name}</span>
                        <span className={`badge ${
                          server.server_type === 'stdio' ? 'badge-primary' : 'badge-success'
                        }`}>
                          {server.server_type}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {server.command
                          ? `${server.command} ${server.args.join(' ')}`
                          : server.url || '—'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {Object.keys(server.env).length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {Object.keys(server.env).length} env vars
                      </span>
                    )}
                    <button className="btn-ghost p-2">
                      {server.enabled ? (
                        <Power className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <PowerOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
