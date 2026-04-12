import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, CheckCircle2, AlertCircle, RefreshCw, Key, Settings2 } from 'lucide-react';
import { api, type ModelConfig, type ProviderPreset, type ProviderSwitchRequest, type ApiKeyInfo } from '../../lib/api';

export function ProvidersPage() {
  const { t } = useTranslation();
  const [currentModel, setCurrentModel] = useState<ModelConfig | null>(null);
  const [presets, setPresets] = useState<ProviderPreset[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ProviderPreset | null>(null);
  const [formData, setFormData] = useState({ model: '', base_url: '', api_key: '' });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [model, presetsData, keysData] = await Promise.all([
        api.getCurrentModel().catch(() => null),
        api.getProviderPresets(),
        api.getConfiguredApiKeys().catch(() => []),
      ]);
      setCurrentModel(model);
      setPresets(presetsData);
      setApiKeys(keysData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSwitch = (preset: ProviderPreset) => {
    setSelectedPreset(preset);
    setFormData({
      model: preset.default_model,
      base_url: preset.default_base_url,
      api_key: '',
    });
    setShowAddForm(true);
  };

  const handleQuickSwitch = async (preset: ProviderPreset) => {
    if (switching) return;
    setSwitching(preset.id);
    setStatusMessage(null);

    try {
      const request: ProviderSwitchRequest = {
        provider_type: preset.provider_type,
        model: preset.default_model,
        base_url: preset.default_base_url,
        api_key: '',
      };
      const result = await api.switchProvider(request);
      setStatusMessage({ type: 'success', text: result });
      await loadData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: String(err) });
    } finally {
      setSwitching(null);
    }
  };

  const handleSubmitSwitch = async () => {
    if (!selectedPreset || switching) return;
    setSwitching(selectedPreset.id);
    setStatusMessage(null);

    try {
      const request: ProviderSwitchRequest = {
        provider_type: selectedPreset.provider_type,
        model: formData.model || selectedPreset.default_model,
        base_url: formData.base_url || selectedPreset.default_base_url,
        api_key: formData.api_key,
      };
      const result = await api.switchProvider(request);
      setStatusMessage({ type: 'success', text: result });
      setShowAddForm(false);
      setSelectedPreset(null);
      await loadData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: String(err) });
    } finally {
      setSwitching(null);
    }
  };

  const isCurrentProvider = (preset: ProviderPreset) => {
    if (!currentModel) return false;
    return (
      currentModel.provider === preset.provider_type ||
      currentModel.base_url.includes(preset.default_base_url.split('/')[2] || '___')
    );
  };

  // Find the matching preset for the current provider
  const activePreset = presets.find(p => isCurrentProvider(p));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Compact Header with inline current status */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('providers.title')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              管理 Hermes Agent 的 LLM 供应商配置
            </p>
          </div>
        </div>
        <button id="btn-refresh" className="btn-ghost text-xs" onClick={loadData}>
          <RefreshCw className="w-3.5 h-3.5" />
          刷新
        </button>
      </div>

      {/* Compact Current Provider Banner */}
      {currentModel && (
        <div className="mx-6 mt-3 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/8 to-indigo-500/8 border border-primary/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-md"
              style={{
                background: activePreset
                  ? `linear-gradient(135deg, ${activePreset.color}, ${activePreset.color}cc)`
                  : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))',
              }}
            >
              {activePreset?.icon_letter || currentModel.provider.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-foreground">
                {activePreset?.name || currentModel.provider}
              </span>
              <span className="badge-success text-[10px]">Active</span>
              <code className="text-xs text-muted-foreground font-mono">{currentModel.model}</code>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px]">
                {currentModel.base_url}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Key className="w-3 h-3" />
            <span className="font-mono">{currentModel.api_key_masked}</span>
          </div>
        </div>
      )}

      {/* Status message */}
      {statusMessage && (
        <div className={`mx-6 mt-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-fade-in ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Configured API Keys Section */}
      {apiKeys.length > 0 && (
        <div className="mx-6 mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">已配置的 Keys:</span>
          {apiKeys.map((key) => (
            <span
              key={key.key_name}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/15"
            >
              <CheckCircle2 className="w-2.5 h-2.5" />
              {key.display_name}
            </span>
          ))}
        </div>
      )}

      {/* Provider list */}
      <div className="flex-1 overflow-y-auto px-6 py-3">
        <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-2">
          可用供应商预设 ({presets.length})
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {presets.map((preset) => {
            const isCurrent = isCurrentProvider(preset);
            const isSwitching = switching === preset.id;

            return (
              <div
                key={preset.id}
                className={`group rounded-lg border transition-all duration-200 px-3 py-2.5 ${
                  isCurrent
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/20 bg-card/30 hover:border-border/40 hover:bg-card/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                      style={{
                        background: isCurrent
                          ? `linear-gradient(135deg, ${preset.color}, ${preset.color}cc)`
                          : undefined,
                        backgroundColor: isCurrent ? undefined : 'hsl(var(--secondary))',
                        color: isCurrent ? 'white' : 'hsl(var(--secondary-foreground))',
                      }}
                    >
                      {preset.icon_letter}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{preset.name}</span>
                        {isCurrent && <span className="badge-success text-[9px]">{t('providers.current')}</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {preset.description}
                        {preset.default_model && (
                          <span className="text-muted-foreground/50 ml-1.5 font-mono">
                            · {preset.default_model}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isCurrent && (
                      <>
                        <button
                          className="btn-ghost text-[11px] px-2 py-1 h-auto"
                          onClick={() => handleSwitch(preset)}
                          disabled={!!switching}
                        >
                          <Settings2 className="w-3 h-3" />
                          配置
                        </button>
                        <button
                          className="btn-primary text-[11px] px-2.5 py-1 h-auto"
                          onClick={() => handleQuickSwitch(preset)}
                          disabled={!!switching}
                        >
                          {isSwitching ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              {t('providers.switch')}
                              <ChevronRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Switch Configuration Modal */}
      {showAddForm && selectedPreset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-card w-[480px] p-6 mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                style={{ background: `linear-gradient(135deg, ${selectedPreset.color}, ${selectedPreset.color}cc)` }}
              >
                {selectedPreset.icon_letter}
              </div>
              <div>
                <h3 className="font-bold text-foreground">切换到 {selectedPreset.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedPreset.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Model</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder={selectedPreset.default_model}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Base URL</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  value={formData.base_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
                  placeholder={selectedPreset.default_base_url}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  API Key
                  {selectedPreset.env_key && (
                    <span className="text-[10px] text-muted-foreground ml-2">
                      ({selectedPreset.env_key})
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  className="input-field text-sm"
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="留空则保留现有 Key"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                className="btn-ghost text-sm"
                onClick={() => { setShowAddForm(false); setSelectedPreset(null); }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn-primary text-sm"
                onClick={handleSubmitSwitch}
                disabled={!!switching}
              >
                {switching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>确认切换</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
