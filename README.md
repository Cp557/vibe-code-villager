# Vibe Code Villager

A tiny desktop companion that watches your [Claude Code](https://claude.ai/code) session and brings it to life with pixel art.

Your villager idles at the town center, grabs a pickaxe and walks to the gold mine when you send a prompt, mines while Claude works, and hauls gold back home when the task finishes. It alternates between gold mining and wood chopping for variety.

Built with Tauri, React, PixiJS, and vibes.

## How It Works

The app uses [Claude Code hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) to detect what Claude is doing. When you submit a prompt or Claude finishes a task, a hook fires a quick HTTP request to the app running on `localhost:3456`. The villager reacts accordingly.

```
You send a prompt          ──>  Hook fires  ──>  Villager walks to resource site and starts working
                                                  (if already out, drops off first, then heads back out)
Claude finishes            ──>  Hook fires  ──>  Villager hauls resources back to town
Escape during a tool use   ──>  Hook fires  ──>  Villager returns home early
Escape during planning     ──>               ──>  Villager stays at the site until your next prompt,
                                                  then drops off and heads to the next site
Waiting for input          ──>                   Villager idles at village
```

## Setup

### 1. Install and run the app

```bash
git clone https://github.com/Cp557/vibe-code-villager.git
cd vibe-code-villager
npm install
npm run tauri dev
```

### 2. Add hooks to your Claude Code config

Open (or create) `~/.claude/settings.json` and add the following:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:3456/hook/prompt-submit",
            "timeout": 5,
            "async": true
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:3456/hook/stop",
            "timeout": 5,
            "async": true
          }
        ]
      }
    ],
    "PostToolUseFailure": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST -H \"Content-Type: application/json\" -d @- http://localhost:3456/hook/tool-failure",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

- **`UserPromptSubmit`** — fires when you send a prompt; villager heads to work. If the villager is still out from a previous task, it returns home to drop off first, then heads back out
- **`Stop`** — fires when Claude finishes normally; villager returns home
- **`PostToolUseFailure`** — fires when a tool is cancelled by Escape; the app checks `is_interrupt` in the payload and sends the villager home. Note: pressing Escape during Claude's planning phase (before any tool runs) doesn't trigger this hook, so the villager stays at the site until you send your next prompt

> If you already have other hooks configured, merge these entries into your existing `hooks` object.

### 3. Download assets

Get the free [Tiny Swords](https://pixelfrog-assets.itch.io/tiny-swords) pack from itch.io and place the `Tiny Swords (Free Pack)` folder inside `public/`.

### 4. Use Claude Code as normal

Open Claude Code in your terminal and start prompting. The villager will react in real time.

## Tech Stack

- **Tauri 2** - Desktop app framework (Rust backend)
- **React 19** + TypeScript - UI
- **PixiJS 8** - 2D sprite rendering and animation
- **Zustand** - State management

## Sprite Assets

All pixel art is from the [Tiny Swords](https://pixelfrog-assets.itch.io/tiny-swords) asset pack by Pixel Frog.

## License

MIT
