use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

// ============================================================================
// Data Types
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HermesStatus {
    pub installed: bool,
    pub config_dir: String,
    pub has_config: bool,
    pub has_env: bool,
    pub has_skills: bool,
    pub has_memory: bool,
    pub has_sessions: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    pub model: String,
    pub provider: String,
    pub base_url: String,
    pub api_key_masked: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKeyInfo {
    pub key_name: String,
    pub display_name: String,
    pub is_set: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderPreset {
    pub id: String,
    pub name: String,
    pub provider_type: String,
    pub default_model: String,
    pub default_base_url: String,
    pub env_key: String,
    pub description: String,
    pub icon_letter: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderSwitchRequest {
    pub provider_type: String,
    pub model: String,
    pub base_url: String,
    pub api_key: String,
}

/// A saved provider profile that persists between switches
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SavedProfile {
    pub id: String,
    pub name: String,
    pub provider_type: String,
    pub model: String,
    pub base_url: String,
    pub api_key: String,
    pub icon_letter: String,
    pub color: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvVariable {
    pub key: String,
    pub value: String,
    pub is_secret: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpServerConfig {
    pub name: String,
    pub server_type: String,
    pub command: Option<String>,
    pub args: Vec<String>,
    pub url: Option<String>,
    pub env: HashMap<String, String>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalConfig {
    pub backend: String,
    pub cwd: String,
    pub timeout: u32,
    pub lifetime_seconds: u32,
    pub container_cpu: Option<u32>,
    pub container_memory: Option<u32>,
    pub container_disk: Option<u32>,
    pub container_persistent: Option<bool>,
    pub ssh_host: Option<String>,
    pub ssh_user: Option<String>,
    pub ssh_port: Option<u32>,
    pub docker_image: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryContent {
    pub memory_md: String,
    pub user_md: String,
    pub soul_md: String,
    pub memory_char_limit: u32,
    pub user_char_limit: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FullConfig {
    pub yaml_content: String,
    pub env_content: String,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn get_hermes_config_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|home| home.join(".hermes"))
}

fn read_hermes_config() -> Result<serde_yaml::Value, String> {
    let config_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;

    let config_path = if config_dir.join("config.yaml").exists() {
        config_dir.join("config.yaml")
    } else if config_dir.join("cli-config.yaml").exists() {
        config_dir.join("cli-config.yaml")
    } else {
        return Err("No Hermes config file found".to_string());
    };

    let content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config: {}", e))?;

    serde_yaml::from_str(&content).map_err(|e| format!("Failed to parse YAML: {}", e))
}

fn read_env_file() -> Result<Vec<(String, String)>, String> {
    let config_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;

    let env_path = config_dir.join(".env");
    if !env_path.exists() {
        return Ok(vec![]);
    }

    let content =
        std::fs::read_to_string(&env_path).map_err(|e| format!("Failed to read .env: {}", e))?;

    let mut vars = Vec::new();
    for line in content.lines() {
        let line = line.trim();
        if line.starts_with('#') || line.is_empty() {
            continue;
        }
        if let Some((key, value)) = line.split_once('=') {
            let key = key.trim().to_string();
            let value = value.trim().trim_matches('"').trim_matches('\'').to_string();
            vars.push((key, value));
        }
    }

    Ok(vars)
}

fn mask_api_key(key: &str) -> String {
    if key.len() <= 8 {
        "****".to_string()
    } else {
        format!("{}...{}", &key[..4], &key[key.len() - 4..])
    }
}

/// Atomic write: write to temp file then rename
fn atomic_write(path: &PathBuf, content: &str) -> Result<(), String> {
    let temp_path = path.with_extension("tmp");
    std::fs::write(&temp_path, content)
        .map_err(|e| format!("Failed to write temp file: {}", e))?;
    std::fs::rename(&temp_path, path).map_err(|e| format!("Failed to rename temp file: {}", e))?;
    Ok(())
}

/// Create a timestamped backup of a file
fn backup_file(path: &PathBuf) -> Result<(), String> {
    if !path.exists() {
        return Ok(());
    }
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;
    let backup_dir = backup_dir.join("hermes-switch-backups");
    std::fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Failed to create backup dir: {}", e))?;

    let file_name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let backup_path = backup_dir.join(format!("{}_{}", timestamp, file_name));
    std::fs::copy(path, &backup_path)
        .map_err(|e| format!("Failed to create backup: {}", e))?;
    Ok(())
}

fn get_profiles_path() -> Result<PathBuf, String> {
    let config_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;
    let switch_dir = config_dir.join("hermes-switch");
    std::fs::create_dir_all(&switch_dir)
        .map_err(|e| format!("Failed to create hermes-switch dir: {}", e))?;
    Ok(switch_dir.join("profiles.json"))
}

fn load_profiles() -> Result<Vec<SavedProfile>, String> {
    let path = get_profiles_path()?;
    if !path.exists() {
        return Ok(vec![]);
    }
    let content =
        std::fs::read_to_string(&path).map_err(|e| format!("Failed to read profiles: {}", e))?;
    serde_json::from_str(&content).map_err(|e| format!("Failed to parse profiles: {}", e))
}

fn persist_profiles(profiles: &[SavedProfile]) -> Result<(), String> {
    let path = get_profiles_path()?;
    let content = serde_json::to_string_pretty(profiles)
        .map_err(|e| format!("Failed to serialize profiles: {}", e))?;
    atomic_write(&path, &content)
}

// ============================================================================
// Tauri Commands
// ============================================================================

/// Check if Hermes Agent is installed and detect configuration
#[tauri::command]
fn check_hermes_installation() -> Result<HermesStatus, String> {
    let config_dir = get_hermes_config_dir();

    match config_dir {
        Some(dir) => {
            let has_config =
                dir.join("config.yaml").exists() || dir.join("cli-config.yaml").exists();
            let has_env = dir.join(".env").exists();
            let has_skills = dir.join("skills").exists();
            let has_memory = dir.join("memories").exists();
            let has_sessions = dir.join("sessions").exists();

            Ok(HermesStatus {
                installed: has_config || has_env,
                config_dir: dir.to_string_lossy().to_string(),
                has_config,
                has_env,
                has_skills,
                has_memory,
                has_sessions,
            })
        }
        None => Ok(HermesStatus {
            installed: false,
            config_dir: String::new(),
            has_config: false,
            has_env: false,
            has_skills: false,
            has_memory: false,
            has_sessions: false,
        }),
    }
}

/// Read current model configuration from config.yaml
#[tauri::command]
fn get_current_model() -> Result<ModelConfig, String> {
    let yaml = read_hermes_config()?;
    let model_section = yaml.get("model");

    let default_model = model_section
        .and_then(|m| m.get("default"))
        .and_then(|v| v.as_str())
        .unwrap_or("unknown")
        .to_string();

    let provider = model_section
        .and_then(|m| m.get("provider"))
        .and_then(|v| v.as_str())
        .unwrap_or("auto")
        .to_string();

    let base_url = model_section
        .and_then(|m| m.get("base_url"))
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let api_key = model_section
        .and_then(|m| m.get("api_key"))
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    Ok(ModelConfig {
        model: default_model,
        provider,
        base_url,
        api_key_masked: if api_key.is_empty() {
            "Not set".to_string()
        } else {
            mask_api_key(&api_key)
        },
    })
}

/// Get all configured API keys from .env (names only, values masked)
#[tauri::command]
fn get_configured_api_keys() -> Result<Vec<ApiKeyInfo>, String> {
    let env_vars = read_env_file()?;

    let known_keys = [
        ("OPENROUTER_API_KEY", "OpenRouter"),
        ("GOOGLE_API_KEY", "Google AI Studio"),
        ("GEMINI_API_KEY", "Gemini"),
        ("GLM_API_KEY", "z.ai / GLM"),
        ("ZAI_API_KEY", "z.ai / GLM"),
        ("KIMI_API_KEY", "Kimi / Moonshot"),
        ("MINIMAX_API_KEY", "MiniMax"),
        ("MINIMAX_CN_API_KEY", "MiniMax CN"),
        ("OPENCODE_ZEN_API_KEY", "OpenCode Zen"),
        ("OPENCODE_GO_API_KEY", "OpenCode Go"),
        ("HF_TOKEN", "Hugging Face"),
        ("XIAOMI_API_KEY", "Xiaomi MiMo"),
        ("ANTHROPIC_API_KEY", "Anthropic"),
        ("NOUS_API_KEY", "Nous Portal"),
        // Platform / Gateway keys
        ("FEISHU_APP_ID", "飞书 (Feishu)"),
        ("FEISHU_APP_SECRET", "飞书 Secret"),
        ("TELEGRAM_BOT_TOKEN", "Telegram Bot"),
        ("WEIXIN_BOT_TOKEN", "微信 Bot"),
        ("WEIXIN_ACCOUNT_ID", "微信 Account"),
        ("BLUEBUBBLES_SERVER_URL", "BlueBubbles"),
    ];

    let mut keys = Vec::new();
    for (env_key, env_val) in &env_vars {
        for (known_key, display_name) in &known_keys {
            if env_key == known_key {
                keys.push(ApiKeyInfo {
                    key_name: env_key.to_string(),
                    display_name: display_name.to_string(),
                    is_set: !env_val.is_empty(),
                });
            }
        }
    }

    Ok(keys)
}

/// Get list of built-in provider presets
#[tauri::command]
fn get_provider_presets() -> Vec<ProviderPreset> {
    vec![
        ProviderPreset {
            id: "openrouter".into(),
            name: "OpenRouter".into(),
            provider_type: "openrouter".into(),
            default_model: "anthropic/claude-opus-4.6".into(),
            default_base_url: "https://openrouter.ai/api/v1".into(),
            env_key: "OPENROUTER_API_KEY".into(),
            description: "通过一个 API 访问多种模型".into(),
            icon_letter: "O".into(),
            color: "#6366f1".into(),
        },
        ProviderPreset {
            id: "anthropic".into(),
            name: "Anthropic".into(),
            provider_type: "anthropic".into(),
            default_model: "claude-opus-4.6".into(),
            default_base_url: "https://api.anthropic.com/v1".into(),
            env_key: "ANTHROPIC_API_KEY".into(),
            description: "直连 Anthropic Claude API".into(),
            icon_letter: "A".into(),
            color: "#d4a574".into(),
        },
        ProviderPreset {
            id: "gemini".into(),
            name: "Google Gemini".into(),
            provider_type: "gemini".into(),
            default_model: "gemini-3-flash-preview".into(),
            default_base_url: "https://generativelanguage.googleapis.com/v1beta/openai".into(),
            env_key: "GOOGLE_API_KEY".into(),
            description: "Google AI Studio 原生 Gemini API".into(),
            icon_letter: "G".into(),
            color: "#4285f4".into(),
        },
        ProviderPreset {
            id: "zai-cn".into(),
            name: "智谱 GLM (中国端)".into(),
            provider_type: "custom".into(),
            default_model: "glm-4.7".into(),
            default_base_url: "https://open.bigmodel.cn/api/paas/v4/".into(),
            env_key: "ZAI_API_KEY".into(),
            description: "中国大陆节点，国内用户推荐".into(),
            icon_letter: "Z".into(),
            color: "#00d4aa".into(),
        },
        ProviderPreset {
            id: "zai-global".into(),
            name: "智谱 GLM (国际端)".into(),
            provider_type: "custom".into(),
            default_model: "glm-4.7".into(),
            default_base_url: "https://api.z.ai/api/paas/v4".into(),
            env_key: "ZAI_API_KEY".into(),
            description: "国际节点 (z.ai)，海外用户可尝试".into(),
            icon_letter: "Z".into(),
            color: "#00b89c".into(),
        },
        ProviderPreset {
            id: "deepseek".into(),
            name: "DeepSeek".into(),
            provider_type: "custom".into(),
            default_model: "deepseek-chat".into(),
            default_base_url: "https://api.deepseek.com/v1".into(),
            env_key: "DEEPSEEK_API_KEY".into(),
            description: "DeepSeek 深度求索".into(),
            icon_letter: "D".into(),
            color: "#4f46e5".into(),
        },
        ProviderPreset {
            id: "kimi".into(),
            name: "Kimi / Moonshot".into(),
            provider_type: "kimi-coding".into(),
            default_model: "kimi-k2.5".into(),
            default_base_url: "https://api.kimi.com/coding/v1".into(),
            env_key: "KIMI_API_KEY".into(),
            description: "月之暗面 Kimi 编程模型".into(),
            icon_letter: "K".into(),
            color: "#ff6b35".into(),
        },
        ProviderPreset {
            id: "minimax".into(),
            name: "MiniMax".into(),
            provider_type: "minimax".into(),
            default_model: "minimax-m2.7".into(),
            default_base_url: "https://api.minimax.io/v1".into(),
            env_key: "MINIMAX_API_KEY".into(),
            description: "MiniMax 全球端点".into(),
            icon_letter: "M".into(),
            color: "#a855f7".into(),
        },
        ProviderPreset {
            id: "minimax-cn".into(),
            name: "MiniMax 中国".into(),
            provider_type: "minimax-cn".into(),
            default_model: "minimax-m2.7".into(),
            default_base_url: "https://api.minimaxi.com/v1".into(),
            env_key: "MINIMAX_CN_API_KEY".into(),
            description: "MiniMax 中国端点".into(),
            icon_letter: "M".into(),
            color: "#a855f7".into(),
        },
        ProviderPreset {
            id: "huggingface".into(),
            name: "Hugging Face".into(),
            provider_type: "huggingface".into(),
            default_model: "".into(),
            default_base_url: "".into(),
            env_key: "HF_TOKEN".into(),
            description: "Hugging Face 推理供应商".into(),
            icon_letter: "H".into(),
            color: "#ffd21e".into(),
        },
        ProviderPreset {
            id: "xiaomi".into(),
            name: "Xiaomi MiMo".into(),
            provider_type: "xiaomi".into(),
            default_model: "mimo-v2-pro".into(),
            default_base_url: "https://api.xiaomimimo.com/v1".into(),
            env_key: "XIAOMI_API_KEY".into(),
            description: "小米 MiMo 系列模型".into(),
            icon_letter: "X".into(),
            color: "#ff6900".into(),
        },
        ProviderPreset {
            id: "nous".into(),
            name: "Nous Portal".into(),
            provider_type: "nous".into(),
            default_model: "".into(),
            default_base_url: "".into(),
            env_key: "NOUS_API_KEY".into(),
            description: "Nous Research 自有平台（OAuth）".into(),
            icon_letter: "N".into(),
            color: "#10b981".into(),
        },
        ProviderPreset {
            id: "custom".into(),
            name: "自定义端点".into(),
            provider_type: "custom".into(),
            default_model: "".into(),
            default_base_url: "http://localhost:11434/v1".into(),
            env_key: "".into(),
            description: "Ollama / LM Studio / vLLM / llama.cpp 等".into(),
            icon_letter: "C".into(),
            color: "#6b7280".into(),
        },
    ]
}

/// Switch to a different provider (writes config.yaml and optionally .env)
/// Also auto-saves current config as a profile before switching
#[tauri::command]
fn switch_provider(request: ProviderSwitchRequest) -> Result<String, String> {
    let config_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;

    let config_path = if config_dir.join("config.yaml").exists() {
        config_dir.join("config.yaml")
    } else {
        config_dir.join("config.yaml")
    };

    // Backup current config
    backup_file(&config_path)?;

    // Read current config or create minimal one
    let content = if config_path.exists() {
        std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?
    } else {
        String::new()
    };

    let mut yaml: serde_yaml::Value = if content.is_empty() {
        serde_yaml::Value::Mapping(serde_yaml::Mapping::new())
    } else {
        serde_yaml::from_str(&content).map_err(|e| format!("Failed to parse YAML: {}", e))?
    };

    // Build new model section, preserving existing keys if not provided
    let old_model = yaml.get("model");
    let old_api_key = old_model
        .and_then(|m| m.get("api_key"))
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let model_map = {
        let mut m = serde_yaml::Mapping::new();
        m.insert(
            serde_yaml::Value::String("provider".into()),
            serde_yaml::Value::String(request.provider_type.clone()),
        );
        m.insert(
            serde_yaml::Value::String("default".into()),
            serde_yaml::Value::String(request.model.clone()),
        );
        if !request.base_url.is_empty() {
            m.insert(
                serde_yaml::Value::String("base_url".into()),
                serde_yaml::Value::String(request.base_url.clone()),
            );
        }
        // Use new api_key if provided, otherwise keep old one
        let effective_key = if !request.api_key.is_empty() {
            request.api_key.clone()
        } else {
            old_api_key
        };
        if !effective_key.is_empty() {
            m.insert(
                serde_yaml::Value::String("api_key".into()),
                serde_yaml::Value::String(effective_key),
            );
        }
        m
    };

    if let serde_yaml::Value::Mapping(ref mut root) = yaml {
        root.insert(
            serde_yaml::Value::String("model".into()),
            serde_yaml::Value::Mapping(model_map),
        );
    }

    // Atomic write config.yaml
    let new_content =
        serde_yaml::to_string(&yaml).map_err(|e| format!("Failed to serialize YAML: {}", e))?;
    atomic_write(&config_path, &new_content)?;

    Ok(format!(
        "Switched to {} ({})",
        request.provider_type, request.model
    ))
}

// ============================================================================
// Profile Management Commands
// ============================================================================

/// Save a provider profile for later reuse
#[tauri::command]
fn save_profile(profile: SavedProfile) -> Result<String, String> {
    let mut profiles = load_profiles()?;
    let now = chrono::Local::now().to_rfc3339();

    // Update existing or add new
    if let Some(existing) = profiles.iter_mut().find(|p| p.id == profile.id) {
        existing.name = profile.name.clone();
        existing.provider_type = profile.provider_type;
        existing.model = profile.model;
        existing.base_url = profile.base_url;
        existing.api_key = profile.api_key;
        existing.icon_letter = profile.icon_letter;
        existing.color = profile.color;
        existing.updated_at = now;
    } else {
        let mut new_profile = profile.clone();
        if new_profile.id.is_empty() {
            new_profile.id = uuid::Uuid::new_v4().to_string();
        }
        new_profile.created_at = now.clone();
        new_profile.updated_at = now;
        profiles.push(new_profile);
    }

    persist_profiles(&profiles)?;
    Ok(format!("Profile '{}' saved", profile.name))
}

/// List all saved profiles
#[tauri::command]
fn get_saved_profiles() -> Result<Vec<SavedProfile>, String> {
    let mut profiles = load_profiles()?;
    // Mask API keys for display
    for p in &mut profiles {
        p.api_key = mask_api_key(&p.api_key);
    }
    Ok(profiles)
}

/// Delete a saved profile
#[tauri::command]
fn delete_profile(profile_id: String) -> Result<String, String> {
    let mut profiles = load_profiles()?;
    let before_len = profiles.len();
    profiles.retain(|p| p.id != profile_id);
    if profiles.len() == before_len {
        return Err(format!("Profile {} not found", profile_id));
    }
    persist_profiles(&profiles)?;
    Ok("Profile deleted".into())
}

/// Switch to a saved profile (loads its full config)
#[tauri::command]
fn switch_to_profile(profile_id: String) -> Result<String, String> {
    let profiles = load_profiles()?;
    let profile = profiles
        .iter()
        .find(|p| p.id == profile_id)
        .ok_or_else(|| format!("Profile {} not found", profile_id))?;

    let request = ProviderSwitchRequest {
        provider_type: profile.provider_type.clone(),
        model: profile.model.clone(),
        base_url: profile.base_url.clone(),
        api_key: profile.api_key.clone(),
    };

    switch_provider(request)
}

/// Read terminal backend configuration
#[tauri::command]
fn get_terminal_config() -> Result<TerminalConfig, String> {
    let yaml = read_hermes_config()?;
    let terminal = yaml.get("terminal");

    Ok(TerminalConfig {
        backend: terminal
            .and_then(|t| t.get("backend"))
            .and_then(|v| v.as_str())
            .unwrap_or("local")
            .to_string(),
        cwd: terminal
            .and_then(|t| t.get("cwd"))
            .and_then(|v| v.as_str())
            .map(|s| {
                if s == "." {
                    dirs::home_dir()
                        .map(|h| h.to_string_lossy().to_string())
                        .unwrap_or_else(|| ".".to_string())
                } else {
                    s.to_string()
                }
            })
            .unwrap_or_else(|| {
                dirs::home_dir()
                    .map(|h| h.to_string_lossy().to_string())
                    .unwrap_or_else(|| ".".to_string())
            }),
        timeout: terminal
            .and_then(|t| t.get("timeout"))
            .and_then(|v| v.as_u64())
            .unwrap_or(180) as u32,
        lifetime_seconds: terminal
            .and_then(|t| t.get("lifetime_seconds"))
            .and_then(|v| v.as_u64())
            .unwrap_or(300) as u32,
        container_cpu: terminal
            .and_then(|t| t.get("container_cpu"))
            .and_then(|v| v.as_u64())
            .map(|v| v as u32),
        container_memory: terminal
            .and_then(|t| t.get("container_memory"))
            .and_then(|v| v.as_u64())
            .map(|v| v as u32),
        container_disk: terminal
            .and_then(|t| t.get("container_disk"))
            .and_then(|v| v.as_u64())
            .map(|v| v as u32),
        container_persistent: terminal
            .and_then(|t| t.get("container_persistent"))
            .and_then(|v| v.as_bool()),
        ssh_host: terminal
            .and_then(|t| t.get("ssh_host"))
            .and_then(|v| v.as_str())
            .map(String::from),
        ssh_user: terminal
            .and_then(|t| t.get("ssh_user"))
            .and_then(|v| v.as_str())
            .map(String::from),
        ssh_port: terminal
            .and_then(|t| t.get("ssh_port"))
            .and_then(|v| v.as_u64())
            .map(|v| v as u32),
        docker_image: terminal
            .and_then(|t| t.get("docker_image"))
            .and_then(|v| v.as_str())
            .map(String::from),
    })
}

/// Read MCP servers from config.yaml
#[tauri::command]
fn get_mcp_servers() -> Result<Vec<McpServerConfig>, String> {
    let yaml = read_hermes_config()?;
    let mcp_section = yaml.get("mcp_servers");

    let mut servers = Vec::new();
    if let Some(serde_yaml::Value::Mapping(map)) = mcp_section {
        for (key, value) in map {
            let name = key.as_str().unwrap_or("unknown").to_string();
            let command = value
                .get("command")
                .and_then(|v| v.as_str())
                .map(String::from);
            let url = value.get("url").and_then(|v| v.as_str()).map(String::from);
            let args = value
                .get("args")
                .and_then(|v| v.as_sequence())
                .map(|seq| {
                    seq.iter()
                        .filter_map(|v| v.as_str().map(String::from))
                        .collect()
                })
                .unwrap_or_default();

            let env = value
                .get("env")
                .and_then(|v| v.as_mapping())
                .map(|m| {
                    m.iter()
                        .filter_map(|(k, v)| {
                            Some((k.as_str()?.to_string(), v.as_str()?.to_string()))
                        })
                        .collect()
                })
                .unwrap_or_default();

            let server_type = if command.is_some() {
                "stdio".to_string()
            } else {
                "http".to_string()
            };

            servers.push(McpServerConfig {
                name,
                server_type,
                command,
                args,
                url,
                env,
                enabled: true,
            });
        }
    }

    Ok(servers)
}

/// Read memory files (MEMORY.md, USER.md, SOUL.md)
#[tauri::command]
fn get_memory_content() -> Result<MemoryContent, String> {
    let config_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;

    let memory_dir = config_dir.join("memories");
    let memory_md = std::fs::read_to_string(memory_dir.join("MEMORY.md")).unwrap_or_default();
    let user_md = std::fs::read_to_string(memory_dir.join("USER.md")).unwrap_or_default();
    let soul_md = std::fs::read_to_string(config_dir.join("SOUL.md")).unwrap_or_default();

    // Read char limits from config
    let yaml = read_hermes_config().unwrap_or(serde_yaml::Value::Null);
    let memory_section = yaml.get("memory");

    let memory_char_limit = memory_section
        .and_then(|m| m.get("memory_char_limit"))
        .and_then(|v| v.as_u64())
        .unwrap_or(2200) as u32;
    let user_char_limit = memory_section
        .and_then(|m| m.get("user_char_limit"))
        .and_then(|v| v.as_u64())
        .unwrap_or(1375) as u32;

    Ok(MemoryContent {
        memory_md,
        user_md,
        soul_md,
        memory_char_limit,
        user_char_limit,
    })
}

/// Save memory file content
#[tauri::command]
fn save_memory_content(file_type: String, content: String) -> Result<String, String> {
    let config_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;

    let file_path = match file_type.as_str() {
        "memory" => config_dir.join("memories").join("MEMORY.md"),
        "user" => config_dir.join("memories").join("USER.md"),
        "soul" => config_dir.join("SOUL.md"),
        _ => return Err(format!("Unknown memory file type: {}", file_type)),
    };

    // Ensure parent dir exists
    if let Some(parent) = file_path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    backup_file(&file_path)?;
    atomic_write(&file_path, &content)?;

    Ok(format!("Saved {}", file_type))
}

/// Get raw config files for the Config Editor
#[tauri::command]
fn get_full_config() -> Result<FullConfig, String> {
    let config_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;

    let config_path = if config_dir.join("config.yaml").exists() {
        config_dir.join("config.yaml")
    } else {
        config_dir.join("cli-config.yaml")
    };

    let yaml_content = std::fs::read_to_string(&config_path).unwrap_or_default();
    let env_content = std::fs::read_to_string(config_dir.join(".env")).unwrap_or_default();

    Ok(FullConfig {
        yaml_content,
        env_content,
    })
}

/// Save raw config file content
#[tauri::command]
fn save_config_file(file_type: String, content: String) -> Result<String, String> {
    let config_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;

    let file_path = match file_type.as_str() {
        "yaml" => {
            if config_dir.join("config.yaml").exists() {
                config_dir.join("config.yaml")
            } else {
                config_dir.join("config.yaml")
            }
        }
        "env" => config_dir.join(".env"),
        _ => return Err(format!("Unknown config file type: {}", file_type)),
    };

    // Validate YAML before saving
    if file_type == "yaml" {
        let _: serde_yaml::Value = serde_yaml::from_str(&content)
            .map_err(|e| format!("Invalid YAML: {}", e))?;
    }

    backup_file(&file_path)?;
    atomic_write(&file_path, &content)?;

    Ok(format!("Saved {} config", file_type))
}

/// List skill files in ~/.hermes/skills/
#[tauri::command]
fn get_skills_list() -> Result<Vec<String>, String> {
    let config_dir =
        get_hermes_config_dir().ok_or_else(|| "Cannot find home directory".to_string())?;

    let skills_dir = config_dir.join("skills");
    if !skills_dir.exists() {
        return Ok(vec![]);
    }

    let mut skills = Vec::new();
    let entries = std::fs::read_dir(&skills_dir)
        .map_err(|e| format!("Failed to read skills dir: {}", e))?;

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_file() {
            if let Some(name) = path.file_name() {
                skills.push(name.to_string_lossy().to_string());
            }
        } else if path.is_dir() {
            if let Some(name) = path.file_name() {
                skills.push(format!("{}/", name.to_string_lossy()));
            }
        }
    }

    skills.sort();
    Ok(skills)
}

// ============================================================================
// App Entry Point
// ============================================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            check_hermes_installation,
            get_current_model,
            get_configured_api_keys,
            get_provider_presets,
            switch_provider,
            save_profile,
            get_saved_profiles,
            delete_profile,
            switch_to_profile,
            get_terminal_config,
            get_mcp_servers,
            get_memory_content,
            save_memory_content,
            get_full_config,
            save_config_file,
            get_skills_list,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
