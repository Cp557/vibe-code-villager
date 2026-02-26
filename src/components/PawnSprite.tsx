import { extend } from "@pixi/react";
import { AnimatedSprite, Assets, Texture, Rectangle } from "pixi.js";
import { useState, useEffect, useRef } from "react";
import { VillagerState } from "../stores/villagerStore";

extend({ AnimatedSprite });

const FRAME_WIDTH = 192;
const FRAME_HEIGHT = 192;
const ANIMATION_SPEED = 0.14;

interface PawnSpriteProps {
  x: number;
  y: number;
  scale: number;
  onClick?: () => void;
  state?: VillagerState;
  facingLeft?: boolean;
}

export function PawnSprite({
  x,
  y,
  scale,
  onClick,
  state = "idle",
  facingLeft = false
}: PawnSpriteProps) {
  const [animations, setAnimations] = useState<Record<string, Texture[]>>({});
  const spriteRef = useRef<AnimatedSprite>(null);

  // Load all animations
  useEffect(() => {
    const loadFrames = async () => {
      const basePath = `/tiny_swords/Units`;
      const loadedAnimations: Record<string, Texture[]> = {};

      const animationConfigs = [
        { key: "idle", file: "Pawn_Idle.png", frames: 8 },
        { key: "runPickaxe", file: "Pawn_Run Pickaxe.png", frames: 6 },
        { key: "runGold", file: "Pawn_Run Gold.png", frames: 6 },
        { key: "mining", file: "Pawn_Interact Pickaxe.png", frames: 6 },
        { key: "runAxe", file: "Pawn_Run Axe.png", frames: 6 },
        { key: "runWood", file: "Pawn_Run Wood.png", frames: 6 },
        { key: "chopping", file: "Pawn_Interact Axe.png", frames: 6 },
      ];

      for (const config of animationConfigs) {
        const texture = await Assets.load(`${basePath}/${config.file}`);
        const textures: Texture[] = [];
        for (let i = 0; i < config.frames; i++) {
          const frame = new Rectangle(i * FRAME_WIDTH, 0, FRAME_WIDTH, FRAME_HEIGHT);
          textures.push(new Texture({ source: texture.source, frame }));
        }
        loadedAnimations[config.key] = textures;
      }

      setAnimations(loadedAnimations);
    };

    loadFrames();
  }, []);

  // Get frames for current state
  const getFramesForState = () => {
    switch (state) {
      case "walking_to_mine": return animations.runPickaxe || [];
      case "mining": return animations.mining || [];
      case "returning_gold": return animations.runGold || [];
      case "walking_to_tree": return animations.runAxe || [];
      case "chopping": return animations.chopping || [];
      case "returning_wood": return animations.runWood || [];
      default: return animations.idle || [];
    }
  };

  const isMoving = state === "walking_to_mine" || state === "walking_to_tree" ||
                   state === "returning_gold" || state === "returning_wood";

  // Switch animation and play
  useEffect(() => {
    if (spriteRef.current) {
      const frames = getFramesForState();
      if (frames.length > 0) {
        spriteRef.current.textures = frames;
        spriteRef.current.play();
      }
    }
  }, [state, animations]);

  const currentFrames = getFramesForState();
  if (currentFrames.length === 0) return null;

  return (
    <pixiAnimatedSprite
      ref={spriteRef}
      textures={currentFrames}
      x={x}
      y={y}
      anchor={0.5}
      scale={{ x: facingLeft ? -scale : scale, y: scale }}
      animationSpeed={isMoving ? 0.2 : ANIMATION_SPEED}
      eventMode="static"
      cursor="pointer"
      onPointerTap={onClick}
    />
  );
}
