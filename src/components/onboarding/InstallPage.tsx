import { useState, useEffect, useRef } from 'react';
import { Terminal, CheckCircle2, Loader2, Wifi } from 'lucide-react';
import { api, type InstallProgress } from '../../lib/api';
import { listen } from '@tauri-apps/api/event';

interface InstallPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

type LogLine = { text: string; type: 'info' | 'success' | 'error' | 'system' };

export function InstallPage({ onSuccess, onBack }: InstallPageProps) {
  const [installing, setInstalling] = useState(false);
  const [done, setDone] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logLines, setLogLines] = useState<LogLine[]>([
    { text: '准备好开始安装 Hermes Agent...', type: 'system' },
    { text: '安装将通过官方脚本完成，需要网络连接', type: 'info' },
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logLines]);

  const appendLog = (text: string, type: LogLine['type'] = 'info') => {
    setLogLines(prev => [...prev, { text, type }]);
  };

  const startInstall = async () => {
    setInstalling(true);
    appendLog('▶ 启动安装程序...', 'system');

    // Listen to Tauri install-progress events
    const unlisten = await listen<InstallProgress>('install-progress', (event) => {
      const { message, done: isDone, success: isSuccess } = event.payload;
      const type = isDone && !isSuccess ? 'error' : isDone ? 'success' : 'info';
      appendLog(message, type);

      if (isDone) {
        setDone(true);
        setSuccess(isSuccess);
        setInstalling(false);
        if (isSuccess) {
          appendLog('✓ 安装完成！Hermes Agent 已就绪。', 'success');
          setTimeout(() => onSuccess(), 2000);
        }
      }
    });

    try {
      const output = await api.installHermesAgent();
      // Parse and display output lines
      const lines = output.split('\n').filter(l => l.trim());
      lines.forEach(line => {
        if (line.includes('✓') || line.includes('Success') || line.toLowerCase().includes('installed')) {
          appendLog(line, 'success');
        } else if (line.includes('✗') || line.toLowerCase().includes('error') || line.toLowerCase().includes('failed')) {
          appendLog(line, 'error');
        } else if (line.trim()) {
          appendLog(line, 'info');
        }
      });
    } catch (err) {
      const errMsg = typeof err === 'string' ? err : '安装失败，请检查网络连接后重试';
      appendLog(`✗ ${errMsg}`, 'error');
      setDone(true);
      setSuccess(false);
      setInstalling(false);
    } finally {
      unlisten();
    }
  };

  const getLogColor = (type: LogLine['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      case 'system': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/30">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <Terminal className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">安装 Hermes Agent</h2>
          <p className="text-xs text-muted-foreground">通过官方安装脚本自动安装</p>
        </div>
      </div>

      {/* Network Notice */}
      <div className="mx-6 mt-4 flex items-center gap-2 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-muted-foreground">
        <Wifi className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        需要网络连接，安装约 1~3 分钟。安装完成后即可离线使用配置管理功能。
      </div>

      {/* Terminal Log Window */}
      <div className="flex-1 mx-6 my-4 bg-black/60 rounded-xl border border-border/20 overflow-hidden flex flex-col font-mono text-xs">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/10 bg-black/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-muted-foreground/50 text-xs ml-2">hermes-install</span>
          {installing && (
            <Loader2 className="w-3 h-3 text-primary animate-spin ml-auto" />
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {logLines.map((line, i) => (
            <div key={i} className={`leading-relaxed ${getLogColor(line.type)}`}>
              {line.type === 'system' ? (
                <span><span className="text-primary/60">$</span> {line.text}</span>
              ) : (
                <span className="pl-4">{line.text}</span>
              )}
            </div>
          ))}
          {installing && (
            <div className="flex items-center gap-2 text-primary pl-4 mt-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>安装中...</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Progress Indicator */}
      {installing && (
        <div className="mx-6 mb-3">
          <div className="w-full h-1 bg-border/30 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 pb-6 flex gap-3">
        {!installing && !done && (
          <>
            <button
              onClick={onBack}
              className="flex-1 py-2.5 px-4 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-xl text-sm transition-colors"
            >
              返回
            </button>
            <button
              onClick={startInstall}
              className="flex-2 flex-grow py-2.5 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-primary/20"
            >
              开始安装
            </button>
          </>
        )}

        {done && !success && (
          <>
            <button
              onClick={onBack}
              className="flex-1 py-2.5 px-4 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-xl text-sm transition-colors"
            >
              返回
            </button>
            <button
              onClick={startInstall}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-colors"
            >
              重试
            </button>
          </>
        )}

        {done && success && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            安装成功！正在进入配置向导...
          </div>
        )}

        {installing && (
          <div className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary/50 rounded-xl text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            安装中，请勿关闭窗口...
          </div>
        )}
      </div>
    </div>
  );
}
