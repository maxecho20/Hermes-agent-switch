import { useState, useEffect } from 'react';
import { Brain, Save, RefreshCw, FileText, User, Sparkles } from 'lucide-react';
import { api, type MemoryContent } from '../../lib/api';

export function MemoryPage() {
  const [memory, setMemory] = useState<MemoryContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'memory' | 'user' | 'soul'>('memory');
  const [editedContent, setEditedContent] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadMemory = async () => {
    setLoading(true);
    try {
      const data = await api.getMemoryContent();
      setMemory(data);
      setEditedContent(data.memory_md);
    } catch (err) {
      console.error('Failed to load memory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMemory(); }, []);

  useEffect(() => {
    if (!memory) return;
    switch (activeTab) {
      case 'memory': setEditedContent(memory.memory_md); break;
      case 'user': setEditedContent(memory.user_md); break;
      case 'soul': setEditedContent(memory.soul_md); break;
    }
  }, [activeTab, memory]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const result = await api.saveMemoryContent(activeTab, editedContent);
      setStatusMessage({ type: 'success', text: result });
      // Update local state
      if (memory) {
        const updated = { ...memory };
        switch (activeTab) {
          case 'memory': updated.memory_md = editedContent; break;
          case 'user': updated.user_md = editedContent; break;
          case 'soul': updated.soul_md = editedContent; break;
        }
        setMemory(updated);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: String(err) });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'memory' as const, label: 'MEMORY.md', icon: Brain, color: 'text-purple-400' },
    { key: 'user' as const, label: 'USER.md', icon: User, color: 'text-blue-400' },
    { key: 'soul' as const, label: 'SOUL.md', icon: Sparkles, color: 'text-amber-400' },
  ];

  const charLimit = activeTab === 'memory' ? memory?.memory_char_limit || 2200 : memory?.user_char_limit || 1375;
  const charCount = editedContent.length;
  const charPercent = Math.round((charCount / charLimit) * 100);

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
          <h2 className="text-xl font-bold text-foreground">记忆编辑器</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            编辑 Hermes Agent 的持久记忆文件
          </p>
        </div>
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

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon className={`w-4 h-4 ${activeTab === tab.key ? tab.color : ''}`} />
              {tab.label}
            </button>
          );
        })}
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
        <textarea
          className="flex-1 w-full bg-card/50 border border-border rounded-lg p-4 text-sm text-foreground font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring/30"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder={`编辑 ${tabs.find(t => t.key === activeTab)?.label}...`}
        />

        {/* Char count */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span>{charCount} / {charLimit} 字符</span>
          </div>
          <div className="w-32 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                charPercent > 90 ? 'bg-red-500' : charPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(charPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
