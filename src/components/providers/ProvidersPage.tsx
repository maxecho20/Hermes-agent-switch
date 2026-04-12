import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight, CheckCircle2, AlertCircle, RefreshCw, Key,
  Settings2, Save, Trash2, BookmarkPlus, Edit3
} from 'lucide-react';
import {
  api, type ModelConfig, type ProviderPreset, type ProviderSwitchRequest,
  type ApiKeyInfo, type SavedProfile
} from '../../lib/api';

export function ProvidersPage() {
  const { t } = useTranslation();
  const [currentModel, setCurrentModel] = useState<ModelConfig | null>(null);
  const [presets, setPresets] = useState<ProviderPreset[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ProviderPreset | null>(null);
  const [formData, setFormData] = useState({
    name: '', model: '', base_url: '', api_key: '', provider_type: '',
    icon_letter: '', color: '',
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [model, presetsData, keysData, profiles] = await Promise.all([
        api.getCurrentModel().catch(() => null),
        api.getProviderPresets(),
        api.getConfiguredApiKeys().catch(() => []),
        api.getSavedProfiles().catch(() => []),
      ]);
      setCurrentModel(model);
      setPresets(presetsData);
      setApiKeys(keysData);
      setSavedProfiles(profiles);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Open form from a preset (new profile)
  const handleFromPreset = (preset: ProviderPreset) => {
    setSelectedPreset(preset);
    setEditingProfile(null);
    setFormData({
      name: preset.name,
      model: preset.default_model,
      base_url: preset.default_base_url,
      api_key: '',
      provider_type: preset.provider_type,
      icon_letter: preset.icon_letter,
      color: preset.color,
    });
    setShowForm(true);
  };

  // Open form to edit current active config
  const handleEditCurrent = () => {
    if (!currentModel) return;
    const matchPreset = presets.find(p => isCurrentProvider(p));
    setSelectedPreset(matchPreset || null);
    setEditingProfile('__current__');
    setFormData({
      name: matchPreset?.name || currentModel.provider,
      model: currentModel.model,
      base_url: currentModel.base_url,
      api_key: '',
      provider_type: currentModel.provider,
      icon_letter: matchPreset?.icon_letter || currentModel.provider.charAt(0).toUpperCase(),
      color: matchPreset?.color || '#7c3aed',
    });
    setShowForm(true);
  };

  // Quick switch (use default preset values)
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

  // Submit form: save profile + switch
  const handleSubmitForm = async (saveOnly: boolean) => {
    if (switching) return;
    setSwitching('form');
    setStatusMessage(null);

    try {
      const profile: SavedProfile = {
        id: editingProfile === '__current__' ? '' : (editingProfile || ''),
        name: formData.name || selectedPreset?.name || 'Untitled',
        provider_type: formData.provider_type || selectedPreset?.provider_type || 'custom',
        model: formData.model || selectedPreset?.default_model || '',
        base_url: formData.base_url || selectedPreset?.default_base_url || '',
        api_key: formData.api_key,
        icon_letter: formData.icon_letter || selectedPreset?.icon_letter || 'P',
        color: formData.color || selectedPreset?.color || '#7c3aed',
        created_at: '',
        updated_at: '',
      };

      // Always save the profile
      await api.saveProfile(profile);

      if (!saveOnly) {
        // Also switch to this provider
        const request: ProviderSwitchRequest = {
          provider_type: profile.provider_type,
          model: profile.model,
          base_url: profile.base_url,
          api_key: profile.api_key,
        };
        const result = await api.switchProvider(request);
        setStatusMessage({ type: 'success', text: `已保存并切换: ${result}` });
      } else {
        setStatusMessage({ type: 'success', text: `Profile "${profile.name}" 已保存` });
      }

      setShowForm(false);
      setSelectedPreset(null);
      setEditingProfile(null);
      await loadData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: String(err) });
    } finally {
      setSwitching(null);
    }
  };

  // Switch to saved profile
  const handleSwitchToProfile = async (profile: SavedProfile) => {
    if (switching) return;
    setSwitching(profile.id);
    setStatusMessage(null);
    try {
      const result = await api.switchToProfile(profile.id);
      setStatusMessage({ type: 'success', text: result });
      await loadData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: String(err) });
    } finally {
      setSwitching(null);
    }
  };

  // Delete profile
  const handleDeleteProfile = async (profileId: string) => {
    try {
      await api.deleteProfile(profileId);
      await loadData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: String(err) });
    }
  };

  const isCurrentProvider = (preset: ProviderPreset) => {
    if (!currentModel) return false;
    return (
      currentModel.provider === preset.provider_type ||
      currentModel.base_url.includes(preset.default_base_url.split('/')[2] || '___')
    );
  };

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
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('providers.title')}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">管理 Hermes Agent 的 LLM 供应商配置</p>
        </div>
        <button id="btn-refresh" className="btn-ghost text-xs" onClick={loadData}>
          <RefreshCw className="w-3.5 h-3.5" /> 刷新
        </button>
      </div>

      {/* Current Provider Banner — now with Edit button */}
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
              <span className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                {currentModel.base_url}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
              <Key className="w-3 h-3" />
              <span className="font-mono">{currentModel.api_key_masked}</span>
            </div>
            <button
              className="btn-ghost text-[11px] px-2 py-1 h-auto"
              onClick={handleEditCurrent}
            >
              <Edit3 className="w-3 h-3" />
              编辑
            </button>
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
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {statusMessage.text}
        </div>
      )}

      {/* API Keys badges */}
      {apiKeys.length > 0 && (
        <div className="mx-6 mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">已配置 Keys:</span>
          {apiKeys.map((key) => (
            <span key={key.key_name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/15">
              <CheckCircle2 className="w-2.5 h-2.5" /> {key.display_name}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-3">
        {/* Saved Profiles Section */}
        {savedProfiles.length > 0 && (
          <div className="mb-4">
            <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-2">
              已保存的配置 ({savedProfiles.length})
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {savedProfiles.map((profile) => (
                <div key={profile.id} className="group rounded-lg border border-emerald-500/15 bg-emerald-500/3 px-3 py-2.5 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${profile.color}, ${profile.color}cc)` }}>
                        {profile.icon_letter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground">{profile.name}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">已保存</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          {profile.model} · {profile.base_url.split('/')[2]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="btn-primary text-[11px] px-2.5 py-1 h-auto"
                        onClick={() => handleSwitchToProfile(profile)}
                        disabled={!!switching}
                      >
                        {switching === profile.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <>切换 <ChevronRight className="w-3 h-3" /></>}
                      </button>
                      <button
                        className="btn-ghost text-[11px] px-1.5 py-1 h-auto text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteProfile(profile.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Presets Section */}
        <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-2">
          可用供应商预设 ({presets.length})
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {presets.map((preset) => {
            const isCurrent = isCurrentProvider(preset);
            const isSwitching = switching === preset.id;
            return (
              <div key={preset.id} className={`group rounded-lg border transition-all duration-200 px-3 py-2.5 ${
                isCurrent ? 'border-primary/30 bg-primary/5' : 'border-border/20 bg-card/30 hover:border-border/40 hover:bg-card/60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm"
                      style={{
                        background: isCurrent ? `linear-gradient(135deg, ${preset.color}, ${preset.color}cc)` : undefined,
                        backgroundColor: isCurrent ? undefined : 'hsl(var(--secondary))',
                        color: isCurrent ? 'white' : 'hsl(var(--secondary-foreground))',
                      }}>
                      {preset.icon_letter}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">{preset.name}</span>
                        {isCurrent && <span className="badge-success text-[9px]">{t('providers.current')}</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {preset.description}
                        {preset.default_model && <span className="text-muted-foreground/50 ml-1.5 font-mono">· {preset.default_model}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn-ghost text-[11px] px-2 py-1 h-auto" onClick={() => handleFromPreset(preset)} disabled={!!switching}>
                      <BookmarkPlus className="w-3 h-3" /> 保存配置
                    </button>
                    {!isCurrent && (
                      <button className="btn-primary text-[11px] px-2.5 py-1 h-auto" onClick={() => handleQuickSwitch(preset)} disabled={!!switching}>
                        {isSwitching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <>{t('providers.switch')} <ChevronRight className="w-3 h-3" /></>}
                      </button>
                    )}
                    {isCurrent && (
                      <button className="btn-ghost text-[11px] px-2 py-1 h-auto" onClick={handleEditCurrent}>
                        <Edit3 className="w-3 h-3" /> 编辑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Form for Save/Switch */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="glass-card w-[500px] p-6 mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                style={{ background: `linear-gradient(135deg, ${formData.color || '#7c3aed'}, ${formData.color || '#7c3aed'}cc)` }}>
                {formData.icon_letter || 'P'}
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  {editingProfile === '__current__' ? '编辑当前供应商' : editingProfile ? '编辑 Profile' : '保存新供应商 Profile'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedPreset?.description || '自定义供应商配置'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Profile 名称</label>
                <input type="text" className="input-field text-sm" value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="如：智谱 GLM 公司版" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Model</label>
                  <input type="text" className="input-field text-sm" value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder={selectedPreset?.default_model || 'model-name'} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Provider Type</label>
                  <input type="text" className="input-field text-sm" value={formData.provider_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, provider_type: e.target.value }))}
                    placeholder="custom" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Base URL</label>
                <input type="text" className="input-field text-sm" value={formData.base_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
                  placeholder={selectedPreset?.default_base_url || 'https://...'} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  API Key
                  {selectedPreset?.env_key && <span className="text-[10px] text-muted-foreground ml-2">({selectedPreset.env_key})</span>}
                </label>
                <input type="password" className="input-field text-sm" value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="留空则保留现有 Key" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button className="btn-ghost text-sm" onClick={() => { setShowForm(false); setSelectedPreset(null); setEditingProfile(null); }}>
                {t('common.cancel')}
              </button>
              <button className="btn-secondary text-sm" onClick={() => handleSubmitForm(true)} disabled={!!switching}>
                <Save className="w-3.5 h-3.5" /> 仅保存
              </button>
              <button className="btn-primary text-sm" onClick={() => handleSubmitForm(false)} disabled={!!switching}>
                {switching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>
                  <Save className="w-3.5 h-3.5" /> 保存并切换
                </>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
