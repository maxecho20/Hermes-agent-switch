import { useState, useEffect } from 'react';
import { Network, Plus, Server, Globe, RefreshCw, Power, PowerOff, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { api, type McpServerConfig } from '../../lib/api';

const MCP_TEMPLATES = [
  {
    name: 'filesystem',
    label: 'File System',
    description: '文件系统读写能力',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
  },
  {
    name: 'brave-search',
    label: 'Brave Search',
    description: '网页搜索能力',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    envHint: 'BRAVE_API_KEY',
  },
  {
    name: 'github',
    label: 'GitHub',
    description: 'GitHub 仓库管理',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    envHint: 'GITHUB_PERSONAL_ACCESS_TOKEN',
  },
  {
    name: 'fetch',
    label: 'Fetch',
    description: '拉取网页内容',
    command: 'uvx',
    args: ['mcp-server-fetch'],
  },
  {
    name: 'sqlite',
    label: 'SQLite',
    description: 'SQLite 数据库操作',
    command: 'uvx',
    args: ['mcp-server-sqlite', '--db-path', '/path/to/db.sqlite'],
  },
];

export function McpPage() {
  const [servers, setServers] = useState<McpServerConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

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

  const copyTemplateYaml = (template: typeof MCP_TEMPLATES[0]) => {
    const envSection = template.envHint
      ? `\n      env:\n        ${template.envHint}: "your-key-here"`
      : '';
    const yaml = `mcp_servers:
    ${template.name}:
      command: ${template.command}
      args: [${template.args.map(a => `"${a}"`).join(', ')}]${envSection}`;

    navigator.clipboard.writeText(yaml).then(() => {
      setCopiedTemplate(template.name);
      setTimeout(() => setCopiedTemplate(null), 2000);
    });
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div>
          <h2 className="text-xl font-bold text-foreground">MCP 服务器管理</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            管理 Hermes Agent 的 Model Context Protocol 服务器
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-xs" onClick={loadServers}>
            <RefreshCw className="w-3.5 h-3.5" />
            刷新
          </button>
          <button
            id="btn-add-mcp"
            className="btn-primary text-xs"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Plus className="w-3.5 h-3.5" />
            添加 MCP 服务器
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {error && (
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs mb-3">
            ⚠️ {error}
          </div>
        )}

        {/* Templates section */}
        {showTemplates && (
          <div className="mb-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">
                MCP 服务器模板
              </span>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowTemplates(false)}
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {MCP_TEMPLATES.map((template) => (
                <div
                  key={template.name}
                  className="glass-card p-3 flex items-center justify-between hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{template.label}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {template.description}
                        <span className="ml-1.5 font-mono text-muted-foreground/50">
                          {template.command} {template.args[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-ghost text-xs px-2 py-1 h-auto"
                    onClick={() => copyTemplateYaml(template)}
                  >
                    {copiedTemplate === template.name ? (
                      <><Check className="w-3 h-3 text-emerald-400" /> 已复制</>
                    ) : (
                      <><Copy className="w-3 h-3" /> 复制 YAML</>
                    )}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 p-2 rounded-lg bg-card/50 border border-border/20 text-[11px] text-muted-foreground">
              💡 复制模板后，粘贴到「配置」→「config.yaml」中保存即可生效
            </div>
          </div>
        )}

        {servers.length === 0 && !showTemplates ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Network className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-sm">暂无 MCP 服务器配置</p>
            <p className="text-muted-foreground/60 text-xs mt-1 mb-4">
              在 config.yaml 的 mcp_servers 段中添加配置
            </p>
            <button
              className="btn-ghost text-xs"
              onClick={() => setShowTemplates(true)}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              查看可用模板
            </button>
          </div>
        ) : servers.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-2">
              已配置的 MCP 服务器 ({servers.length})
            </div>
            {servers.map((server, index) => (
              <div key={index} className="glass-card p-3 group hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      server.server_type === 'stdio'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-green-500/10 text-green-400'
                    }`}>
                      {server.server_type === 'stdio' ? (
                        <Server className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{server.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          server.server_type === 'stdio'
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                          {server.server_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                        {server.command
                          ? `${server.command} ${server.args.join(' ')}`
                          : server.url || '—'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {Object.keys(server.env).length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {Object.keys(server.env).length} env vars
                      </span>
                    )}
                    <button className="btn-ghost p-1.5 h-auto">
                      {server.enabled ? (
                        <Power className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
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
