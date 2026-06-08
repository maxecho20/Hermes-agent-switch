import { useState } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Server, Key, Zap } from 'lucide-react';
import { api } from '../../lib/api';

interface SetupWizardProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'provider' | 'complete';

const QUICK_PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: '支持 200+ 模型，一个 API Key 走遍所有主流模型',
    envKey: 'OPENROUTER_API_KEY',
    keyUrl: 'https://openrouter.ai/keys',
    color: '#6366f1',
    letter: 'O',
    recommended: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: '直连 Claude API，适合已有 Anthropic 账户的用户',
    envKey: 'ANTHROPIC_API_KEY',
    keyUrl: 'https://console.anthropic.com/keys',
    color: '#d4a574',
    letter: 'A',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google AI Studio，新用户有免费额度',
    envKey: 'GOOGLE_API_KEY',
    keyUrl: 'https://aistudio.google.com/apikey',
    color: '#4285f4',
    letter: 'G',
  },
  {
    id: 'nous',
    name: 'Nous Portal',
    description: '由 Hermes 官方提供，快速上手无需申请 Key',
    envKey: 'NOUS_API_KEY',
    keyUrl: 'https://portal.nousresearch.com',
    color: '#10b981',
    letter: 'N',
  },
];

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedProvider, setSelectedProvider] = useState<string>('openrouter');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProviderInfo = QUICK_PROVIDERS.find(p => p.id === selectedProvider);

  const handleSaveProvider = async () => {
    if (!apiKey.trim()) {
      setError('请输入 API Key');
      return;
    }
    setError(null);
    setSaving(true);

    try {
      await api.switchProvider({
        provider_type: selectedProvider,
        model: '',
        base_url: '',
        api_key: apiKey.trim(),
      });
      setStep('complete');
    } catch (err) {
      setError(typeof err === 'string' ? err : '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    setStep('complete');
  };

  if (step === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background px-8 animate-fade-in">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            安装成功 🎉
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Hermes Agent 已安装完毕。现在配置一个 AI Provider，让 Hermes 立即开始工作。
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3 mb-8">
          {[
            { icon: Key, text: '配置 AI Provider API Key' },
            { icon: Server, text: '选择 Terminal 后端（推荐本地）' },
            { icon: Zap, text: '完成！即可使用 hermes 命令' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 flex-shrink-0">
                <item.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              {item.text}
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <button
            onClick={() => setStep('provider')}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-all"
          >
            开始配置
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleSkip}
            className="w-full py-2.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            跳过，稍后配置
          </button>
        </div>
      </div>
    );
  }

  if (step === 'provider') {
    return (
      <div className="flex flex-col h-full bg-background animate-fade-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/30">
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => setStep('welcome')} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-foreground">选择 AI Provider</h2>
          </div>
          <p className="text-xs text-muted-foreground ml-6">选择一个 Provider 并输入 API Key 完成配置</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* Provider Selection */}
          <div className="grid grid-cols-1 gap-2">
            {QUICK_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  selectedProvider === provider.id
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/30 hover:border-border/60 hover:bg-secondary/30'
                }`}
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: provider.color }}
                >
                  {provider.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{provider.name}</span>
                    {provider.recommended && (
                      <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">推荐</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{provider.description}</p>
                </div>
                {selectedProvider === provider.id && (
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* API Key Input */}
          {selectedProviderInfo && (
            <div className="space-y-2 mt-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {selectedProviderInfo.envKey}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`输入 ${selectedProviderInfo.name} API Key`}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border/40 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 font-mono"
                />
              </div>
              <a
                href={selectedProviderInfo.keyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                → 前往获取 {selectedProviderInfo.name} API Key
              </a>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-2.5 px-4 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-xl text-sm transition-colors"
          >
            跳过
          </button>
          <button
            onClick={handleSaveProvider}
            disabled={saving || !apiKey.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-medium text-sm transition-all"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                保存中...
              </>
            ) : (
              <>
                保存并继续
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Complete step
  return (
    <div className="flex flex-col items-center justify-center h-full bg-background px-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">一切就绪！</h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          Hermes Agent 已配置完成。在终端运行 <code className="text-primary font-mono">hermes</code> 开始对话，
          或使用 HermesSwitch 随时管理你的配置。
        </p>
      </div>

      <div className="w-full max-w-sm glass-card p-4 mb-8">
        <p className="text-xs text-muted-foreground/60 font-mono mb-2"># 在终端中运行</p>
        <code className="text-sm text-primary font-mono">hermes</code>
      </div>

      <button
        onClick={onComplete}
        className="flex items-center justify-center gap-2 w-full max-w-sm py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary/20"
      >
        进入 HermesSwitch
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
