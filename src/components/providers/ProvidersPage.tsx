import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronRight, CheckCircle2, AlertCircle, RefreshCw, Key } from 'lucide-react';
import { api, type ModelConfig, type ProviderPreset, type ProviderSwitchRequest } from '../../lib/api';

export function ProvidersPage() {
  const { t } = useTranslation();
  const [currentModel, setCurrentModel] = useState<ModelConfig | null>(null);
  const [presets, setPresets] = useState<ProviderPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ProviderPreset | null>(null);
  const [formData, setFormData] = useState({ model: '', base_url: '', api_key: '' });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [model, presetsData] = await Promise.all([
        api.getCurrentModel().catch(() => null),
        api.getProviderPresets(),
      ]);
      setCurrentModel(model);
      setPresets(presetsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSwitch = async (preset: ProviderPreset) => {
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
        api_key: '', // Keep existing key
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header with live status */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('providers.title')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            管理 Hermes Agent 的 LLM 供应商配置
          </p>
        </div>
        <button
          id="btn-refresh"
          className="btn-ghost"
          onClick={loadData}
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {/* Current Provider Card */}
      {currentModel && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white text-lg font-bold">
                  {currentModel.provider.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-lg">当前供应商</span>
                  <span className="badge-success">Active</span>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5 space-x-3">
                  <span>
                    Provider: <code className="text-primary font-mono text-xs">{currentModel.provider}</code>
                  </span>
                  <span>
                    Model: <code className="text-foreground font-mono text-xs">{currentModel.model}</code>
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {currentModel.base_url && (
                <div className="font-mono">{currentModel.base_url}</div>
              )}
              <div className="mt-1 flex items-center gap-1.5 justify-end">
                <Key className="w-3 h-3" />
                <span>{currentModel.api_key_masked}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status message */}
      {statusMessage && (
        <div className={`mx-6 mt-3 p-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in ${
          statusMessage.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Provider list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
          可用供应商预设 ({presets.length})
        </div>
        <div className="grid grid-cols-1 gap-2">
          {presets.map((preset) => {
            const isCurrent = isCurrentProvider(preset);
            const isSwitching = switching === preset.id;

            return (
              <div
                key={preset.id}
                className={`provider-card group ${isCurrent ? 'active' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-md"
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
                        <span className="font-semibold text-foreground">{preset.name}</span>
                        {isCurrent && <span className="badge-success">{t('providers.current')}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {preset.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {preset.default_model && (
                      <span className="text-xs text-muted-foreground font-mono mr-2">
                        {preset.default_model}
                      </span>
                    )}
                    {!isCurrent && (
                      <>
                        <button
                          className="btn-ghost text-xs px-2 py-1"
                          onClick={() => handleSwitch(preset)}
                          disabled={!!switching}
                        >
                          配置
                        </button>
                        <button
                          className="btn-primary text-xs px-3 py-1.5"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-card w-[480px] p-6 mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: selectedPreset.color }}
              >
                {selectedPreset.icon_letter}
              </div>
              <div>
                <h3 className="font-bold text-foreground">切换到 {selectedPreset.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedPreset.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Model</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder={selectedPreset.default_model}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Base URL</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.base_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
                  placeholder={selectedPreset.default_base_url}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  API Key
                  {selectedPreset.env_key && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({selectedPreset.env_key})
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="留空则保留现有 Key"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                className="btn-ghost"
                onClick={() => { setShowAddForm(false); setSelectedPreset(null); }}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn-primary"
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
