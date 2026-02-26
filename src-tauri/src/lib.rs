use serde::Serialize;
use std::fs;
use std::io::Read;
use std::thread;
use tauri::{AppHandle, Emitter};
use tiny_http::{Response, Server};

const HOOK_SERVER_PORT: u16 = 3456;

// Marker to identify our hooks in settings.json
const HOOK_MARKER: &str = "claude-commander";

#[derive(Debug, Serialize, Clone)]
struct ClaudeEvent {
    event_type: String,
}

// Start HTTP server to receive hook events from Claude Code
fn start_hook_server(app_handle: AppHandle) {
    thread::spawn(move || {
        let server = Server::http(format!("127.0.0.1:{}", HOOK_SERVER_PORT))
            .expect("Failed to start hook server");

        println!("Hook server listening on port {}", HOOK_SERVER_PORT);

        for mut request in server.incoming_requests() {
            let url = request.url().to_string();

            let event_type: Option<String> = match url.as_str() {
                "/hook/prompt-submit" => Some("prompt_submit".to_string()),
                "/hook/stop" => Some("stop".to_string()),
                "/hook/tool-failure" => {
                    // Read body and only emit if is_interrupt is true
                    let mut body = String::new();
                    let _ = request.as_reader().read_to_string(&mut body);
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&body) {
                        if json
                            .get("is_interrupt")
                            .and_then(|v| v.as_bool())
                            .unwrap_or(false)
                        {
                            Some("interrupt".to_string())
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                }
                _ => None,
            };

            if let Some(event) = event_type {
                println!("Received hook event: {}", event);
                let claude_event = ClaudeEvent { event_type: event };
                let _ = app_handle.emit("claude-event", claude_event);
            }

            let _ = request.respond(Response::from_string("ok"));
        }
    });
}

// Get the path to Claude's global settings.json
fn get_claude_settings_path() -> Option<std::path::PathBuf> {
    dirs::home_dir().map(|home| home.join(".claude").join("settings.json"))
}

// Build an async hook entry (fire-and-forget, doesn't block Claude Code)
fn make_hook_entry(command: &str) -> serde_json::Value {
    serde_json::json!({
        "hooks": [
            {
                "type": "command",
                "command": command,
                "timeout": 5,
                "async": true
            }
        ]
    })
}

// Build a sync hook entry (needs to read stdin before responding)
fn make_hook_entry_sync(command: &str) -> serde_json::Value {
    serde_json::json!({
        "hooks": [
            {
                "type": "command",
                "command": command,
                "timeout": 5
            }
        ]
    })
}

// Check if our hooks are already configured by looking for our marker comment
fn has_our_hooks(hooks_array: &serde_json::Value) -> bool {
    if let Some(arr) = hooks_array.as_array() {
        for entry in arr {
            if let Some(inner_hooks) = entry.get("hooks") {
                if let Some(inner_arr) = inner_hooks.as_array() {
                    for hook in inner_arr {
                        if let Some(cmd) = hook.get("command").and_then(|c| c.as_str()) {
                            if cmd.contains(HOOK_MARKER) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    false
}

// Check if hooks are already configured
#[tauri::command]
fn check_hooks_configured() -> Result<bool, String> {
    let settings_path = get_claude_settings_path()
        .ok_or_else(|| "Could not find home directory".to_string())?;

    if !settings_path.exists() {
        return Ok(false);
    }

    let content = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings: {}", e))?;

    let settings: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;

    // Check any hook event for our marker
    if let Some(hooks) = settings.get("hooks") {
        for event_name in &["UserPromptSubmit", "Stop", "PostToolUseFailure"] {
            if let Some(event_hooks) = hooks.get(*event_name) {
                if has_our_hooks(event_hooks) {
                    return Ok(true);
                }
            }
        }
    }

    Ok(false)
}

// Setup hooks in Claude's settings.json (safely merges with existing hooks)
#[tauri::command]
fn setup_hooks() -> Result<String, String> {
    let settings_path = get_claude_settings_path()
        .ok_or_else(|| "Could not find home directory".to_string())?;

    // Ensure .claude directory exists
    if let Some(parent) = settings_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create .claude directory: {}", e))?;
    }

    // Read existing settings or create new
    let mut settings: serde_json::Value = if settings_path.exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings: {}", e))?
    } else {
        serde_json::json!({})
    };

    // Our hook commands (use URL path to identify event type, marker in comment)
    let our_hooks: Vec<(&str, serde_json::Value)> = vec![
        (
            "UserPromptSubmit",
            make_hook_entry(&format!(
                "curl -s -X POST http://localhost:{}/hook/prompt-submit # {}",
                HOOK_SERVER_PORT, HOOK_MARKER
            )),
        ),
        (
            "Stop",
            make_hook_entry(&format!(
                "curl -s -X POST http://localhost:{}/hook/stop # {}",
                HOOK_SERVER_PORT, HOOK_MARKER
            )),
        ),
        (
            // Interrupt detection: fires when a tool is cancelled by Escape, pipes stdin for is_interrupt check
            "PostToolUseFailure",
            make_hook_entry_sync(&format!(
                "curl -s -X POST -H \"Content-Type: application/json\" -d @- http://localhost:{}/hook/tool-failure # {}",
                HOOK_SERVER_PORT, HOOK_MARKER
            )),
        ),
    ];

    // Ensure hooks object exists
    if settings.get("hooks").is_none() {
        settings
            .as_object_mut()
            .unwrap()
            .insert("hooks".to_string(), serde_json::json!({}));
    }

    let hooks_obj = settings
        .get_mut("hooks")
        .unwrap()
        .as_object_mut()
        .ok_or("hooks is not an object")?;

    for (event_name, hook_entry) in &our_hooks {
        if let Some(existing) = hooks_obj.get_mut(*event_name) {
            // Event already has hooks - check if ours is already there
            if !has_our_hooks(existing) {
                // Append our hook entry to the existing array
                if let Some(arr) = existing.as_array_mut() {
                    arr.push(hook_entry.clone());
                }
            }
        } else {
            // Event doesn't exist yet - create it with our hook
            hooks_obj.insert(event_name.to_string(), serde_json::json!([hook_entry]));
        }
    }

    // Write settings back
    let content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&settings_path, &content)
        .map_err(|e| format!("Failed to write settings: {}", e))?;

    Ok(format!("Hooks configured at {}", settings_path.display()))
}

// Remove our hooks from settings.json
#[tauri::command]
fn remove_hooks() -> Result<String, String> {
    let settings_path = get_claude_settings_path()
        .ok_or_else(|| "Could not find home directory".to_string())?;

    if !settings_path.exists() {
        return Ok("No settings file found".to_string());
    }

    let content = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings: {}", e))?;

    let mut settings: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;

    if let Some(hooks_obj) = settings.get_mut("hooks").and_then(|h| h.as_object_mut()) {
        // Include Notification and PreToolUse to clean up any previously installed incorrect hooks
        for event_name in &["UserPromptSubmit", "Stop", "Notification", "PreToolUse", "PostToolUseFailure"] {
            if let Some(event_hooks) = hooks_obj.get_mut(*event_name) {
                if let Some(arr) = event_hooks.as_array_mut() {
                    arr.retain(|entry| {
                        // Keep entries that don't contain our marker
                        if let Some(inner_hooks) = entry.get("hooks") {
                            if let Some(inner_arr) = inner_hooks.as_array() {
                                return !inner_arr.iter().any(|hook| {
                                    hook.get("command")
                                        .and_then(|c| c.as_str())
                                        .map(|s| s.contains(HOOK_MARKER))
                                        .unwrap_or(false)
                                });
                            }
                        }
                        true
                    });
                }
            }
        }

        // Clean up empty event arrays
        let empty_events: Vec<String> = hooks_obj
            .iter()
            .filter(|(_, v)| v.as_array().map(|a| a.is_empty()).unwrap_or(false))
            .map(|(k, _)| k.clone())
            .collect();
        for key in empty_events {
            hooks_obj.remove(&key);
        }
    }

    let content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&settings_path, &content)
        .map_err(|e| format!("Failed to write settings: {}", e))?;

    Ok("Hooks removed successfully".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            check_hooks_configured,
            setup_hooks,
            remove_hooks
        ])
        .setup(|app| {
            // Start the hook server when app launches
            start_hook_server(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
