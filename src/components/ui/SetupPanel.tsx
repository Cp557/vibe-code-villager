import { useState, useEffect } from "react";

// Tauri invoke is only available inside the Tauri app, not in browser dev mode
async function tauriInvoke<T>(command: string): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command);
}

function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

export function SetupPanel() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    checkHooks();
  }, []);

  const checkHooks = async () => {
    if (!isTauri()) {
      setIsConfigured(false);
      return;
    }
    try {
      const configured = await tauriInvoke<boolean>("check_hooks_configured");
      setIsConfigured(configured);
    } catch (error) {
      console.error("Failed to check hooks:", error);
      setIsConfigured(false);
    }
  };

  const handleSetupHooks = async () => {
    if (!isTauri()) {
      setMessage("Setup only works in the Tauri desktop app. Use manual setup below.");
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await tauriInvoke<string>("setup_hooks");
      setMessage(result);
      setIsConfigured(true);
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveHooks = async () => {
    if (!isTauri()) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await tauriInvoke<string>("remove_hooks");
      setMessage(result);
      setIsConfigured(false);
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="setup-panel">
      <div className="setup-content">
        <h3>Claude Code Hooks</h3>
        {isConfigured === true ? (
          <>
            <p className="setup-status connected">Connected</p>
            <button
              onClick={handleRemoveHooks}
              disabled={isLoading}
              className="setup-button remove"
            >
              {isLoading ? "Removing..." : "Remove Hooks"}
            </button>
          </>
        ) : (
          <>
            <p>Set up hooks to visualize Claude Code activity.</p>
            <button
              onClick={handleSetupHooks}
              disabled={isLoading}
              className="setup-button"
            >
              {isLoading ? "Setting up..." : "Setup Hooks"}
            </button>
          </>
        )}
        {message && <p className="setup-message">{message}</p>}
        <details className="manual-setup">
          <summary>Manual setup</summary>
          <p>Add <code>"hooks"</code> to your <code>~/.claude/settings.json</code>:</p>
          <pre>{`"hooks": {
  "UserPromptSubmit": [{
    "hooks": [{
      "type": "command",
      "command": "curl -s -X POST http://localhost:3456/hook/prompt-submit",
      "timeout": 5, "async": true
    }]
  }],
  "Stop": [{
    "hooks": [{
      "type": "command",
      "command": "curl -s -X POST http://localhost:3456/hook/stop",
      "timeout": 5, "async": true
    }]
  }]
}`}</pre>
        </details>
      </div>
    </div>
  );
}
