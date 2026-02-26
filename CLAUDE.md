# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Vibe Coding Villager** - A fun companion app that visualizes Claude Code's activity in real-time using Age of Empires 2-style pixel art.

### Core Concept (v1)

User runs Claude Code in their terminal as normal. This app runs alongside and shows a villager that:
- **Idle at village** → When Claude is waiting for input
- **Walks to mine** → When user submits a prompt
- **Mining with pickaxe** → While Claude is actively working (reading, editing, running commands)
- **Runs back with gold** → When Claude completes a task

### How It Works

The app uses **Claude Code hooks** to detect activity state. Hooks are configured in the user's `.claude/settings.json` and fire shell commands that signal this app.

**Key hook events:**
| Event | Triggers |
|-------|----------|
| `UserPromptSubmit` | User sends prompt → start working |
| `PreToolUse` / `PostToolUse` | Tool calls → still working |
| `Stop` | Claude finished → task complete |
| `Notification` (idle_prompt) | Claude idle → back at village |

**Communication:** Hooks signal the Tauri app via localhost HTTP/WebSocket. The app should auto-configure hooks on first launch.

### Sprite Assets

**Villager animations** (`public/tiny_swords/Units/`):
- `Pawn_Idle.png` - Idle at village
- `Pawn_Run Pickaxe.png` - Running to gold mine (carrying pickaxe)
- `Pawn_Run Axe.png` - Running to trees (carrying axe)
- `Pawn_Interact Pickaxe.png` - Mining gold
- `Pawn_Interact Axe.png` - Chopping wood
- `Pawn_Run Gold.png` - Running back with gold
- `Pawn_Run Wood.png` - Running back with wood

**Resource sites** (alternate between gold mining and wood chopping for variety):
- Gold: `public/tiny_swords/Terrain/Resources/Gold/Gold Stones/`
- Trees: `public/tiny_swords/Terrain/Resources/Wood/Trees/`

## Development Commands

```bash
Do not run any 'npm run ...' commands, I will run these myself.
```

## Architecture

**Frontend Stack:** React 19 + TypeScript + Vite + PixiJS 8 (via @pixi/react)

**Desktop:** Tauri 2 (Rust backend in `src-tauri/`)

### Key Directories

- `src/components/` - React components for the game canvas and UI
- `src/stores/` - Zustand state management
- `src/types/` - TypeScript type definitions
- `public/tiny_swords/` - Sprite assets for units and buildings

### State Management

Uses Zustand (`src/stores/`). For v1, needs a simple state machine:
- `idle` → villager at village
- `walking_to_mine` → villager moving to work area
- `working` → mining animation
- `returning` → running back with gold

Positions use normalized coordinates (0-1) that convert to screen coordinates. Movement uses frame-delta animation.

### PixiJS Integration

Components use `@pixi/react` with the pattern:
```tsx
import { extend } from "@pixi/react";
extend({ Container, Graphics, Sprite, AnimatedSprite });
// Then use <pixiSprite>, <pixiGraphics>, etc.
```

Sprites are loaded from `public/tiny_swords/Units/{Color} Units/Pawn/` with spritesheet frame extraction using `Texture` and `Rectangle`.

### Core Components

- **GameCanvas** - Main PixiJS Application container, handles animation loop
- **PawnSprite** - Handles spritesheet animation (idle/run/mining states)
- **TownCenter** - Village building (home base)
- **GoldMine** - Work area where villager mines (to be added)

### Tauri Backend

The Rust backend (`src-tauri/src/lib.rs`) needs to:
1. Run a localhost HTTP or WebSocket server to receive hook signals
2. Emit events to the frontend when Claude's state changes
3. Provide commands to auto-configure Claude Code hooks on first launch
