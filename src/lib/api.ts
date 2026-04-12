import { invoke } from '@tauri-apps/api/core';

// ============================================================================
// Types (matching Rust structs)
// ============================================================================

export interface HermesStatus {
  installed: boolean;
  config_dir: string;
  has_config: boolean;
  has_env: boolean;
  has_skills: boolean;
  has_memory: boolean;
  has_sessions: boolean;
}

export interface ModelConfig {
  model: string;
  provider: string;
  base_url: string;
  api_key_masked: string;
}

export interface ApiKeyInfo {
  key_name: string;
  display_name: string;
  is_set: boolean;
}

export interface ProviderPreset {
  id: string;
  name: string;
  provider_type: string;
  default_model: string;
  default_base_url: string;
  env_key: string;
  description: string;
  icon_letter: string;
  color: string;
}

export interface ProviderSwitchRequest {
  provider_type: string;
  model: string;
  base_url: string;
  api_key: string;
}

export interface McpServerConfig {
  name: string;
  server_type: string;
  command: string | null;
  args: string[];
  url: string | null;
  env: Record<string, string>;
  enabled: boolean;
}

export interface TerminalConfig {
  backend: string;
  cwd: string;
  timeout: number;
  lifetime_seconds: number;
  container_cpu: number | null;
  container_memory: number | null;
  container_disk: number | null;
  container_persistent: boolean | null;
  ssh_host: string | null;
  ssh_user: string | null;
  ssh_port: number | null;
  docker_image: string | null;
}

export interface MemoryContent {
  memory_md: string;
  user_md: string;
  soul_md: string;
  memory_char_limit: number;
  user_char_limit: number;
}

export interface FullConfig {
  yaml_content: string;
  env_content: string;
}

// ============================================================================
// API Functions
// ============================================================================

export const api = {
  checkHermesInstallation: () =>
    invoke<HermesStatus>('check_hermes_installation'),

  getCurrentModel: () =>
    invoke<ModelConfig>('get_current_model'),

  getConfiguredApiKeys: () =>
    invoke<ApiKeyInfo[]>('get_configured_api_keys'),

  getProviderPresets: () =>
    invoke<ProviderPreset[]>('get_provider_presets'),

  switchProvider: (request: ProviderSwitchRequest) =>
    invoke<string>('switch_provider', { request }),

  getTerminalConfig: () =>
    invoke<TerminalConfig>('get_terminal_config'),

  getMcpServers: () =>
    invoke<McpServerConfig[]>('get_mcp_servers'),

  getMemoryContent: () =>
    invoke<MemoryContent>('get_memory_content'),

  saveMemoryContent: (fileType: string, content: string) =>
    invoke<string>('save_memory_content', { fileType, content }),

  getFullConfig: () =>
    invoke<FullConfig>('get_full_config'),

  saveConfigFile: (fileType: string, content: string) =>
    invoke<string>('save_config_file', { fileType, content }),

  getSkillsList: () =>
    invoke<string[]>('get_skills_list'),
};
