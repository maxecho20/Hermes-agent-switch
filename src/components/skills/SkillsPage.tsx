import { useState, useEffect } from 'react';
import { Zap, RefreshCw, FolderOpen, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';

export function SkillsPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const data = await api.getSkillsList();
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSkills(); }, []);

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
          <h2 className="text-xl font-bold text-foreground">技能管理</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            浏览和管理 Hermes Agent 的技能库
          </p>
        </div>
        <button className="btn-ghost" onClick={loadSkills}>
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {/* Skills list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Zap className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">暂无技能</p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              技能文件位于 ~/.hermes/skills/ 目录
            </p>
          </div>
        ) : (
          <>
            <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
              已安装技能 ({skills.length})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {skills.map((skill, index) => {
                const isDir = skill.endsWith('/');
                const displayName = isDir ? skill.slice(0, -1) : skill.replace(/\.(md|txt)$/, '');

                return (
                  <div
                    key={index}
                    className="glass-card p-3 flex items-center gap-3 hover:border-primary/30 transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDir ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {isDir ? (
                        <FolderOpen className="w-4 h-4" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {displayName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isDir ? '目录' : '技能文件'}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
