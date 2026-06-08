import { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, Lock } from 'lucide-react';
import { api, type FullConfig } from '../../lib/api';

export function ConfigPage() {
  const [config, setConfig] = useState<FullConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'yaml' | 'env'>('yaml');
  const [editedContent, setEditedContent] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await api.getFullConfig();
      setConfig(data);
      setEditedContent(data.yaml_content);
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, []);

  useEffect(() => {
    if (!config) return;
    setEditedContent(activeTab === 'yaml' ? config.yaml_content : config.env_content);
  }, [activeTab, config]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const result = await api.saveConfigFile(activeTab, editedContent);
      setStatusMessage({ type: 'success', text: result });
      // Update local state
      if (config) {
        const updated = { ...config };
        if (activeTab === 'yaml') updated.yaml_content = editedContent;
        else updated.env_content = editedContent;
        setConfig(updated);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: String(err) });
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-xl font-bold text-foreground">配置编辑器</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            直接编辑 config.yaml 和 .env 文件（高级用户）
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost" onClick={loadConfig}>
            <RefreshCw className="w-4 h-4" />
            重新加载
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            保存
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-4">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'yaml'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          onClick={() => setActiveTab('yaml')}
        >
          <FileText className="w-4 h-4" />
          config.yaml
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'env'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          onClick={() => setActiveTab('env')}
        >
          <Lock className="w-4 h-4" />
          .env
        </button>
      </div>

      {/* Status */}
      {statusMessage && (
        <div className={`mx-6 mt-3 p-3 rounded-lg text-sm ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-red-500/10 text-red-400'
        }`}>
          {statusMessage.text}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 px-6 py-4 flex flex-col min-h-0">
        {activeTab === 'env' && (
          <div className="mb-2 p-2 rounded-lg bg-amber-500/10 text-amber-400 text-xs flex items-center gap-2">
            <Lock className="w-3 h-3" />
            注意：.env 文件可能包含 API Keys 等敏感信息，请谨慎编辑
          </div>
        )}
        <textarea
          className="flex-1 w-full bg-card/50 border border-border rounded-lg p-4 text-sm text-foreground font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/30 leading-relaxed"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder={`编辑 ${activeTab === 'yaml' ? 'config.yaml' : '.env'}...`}
          spellCheck={false}
        />

        {/* File info */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{editedContent.split('\n').length} 行</span>
          <span>{editedContent.length} 字符</span>
        </div>
      </div>
    </div>
  );
}
