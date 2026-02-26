import { Application, extend } from "@pixi/react";
import { Container, Graphics, Text, Sprite, TilingSprite, AnimatedSprite } from "pixi.js";
import { useState, useEffect, useRef } from "react";
import { TilemapRenderer } from "./tilemap/TilemapRenderer";
import { PawnSprite } from "./PawnSprite";
import { useVillagerStore, MINE_PATHS, TREE_PATHS } from "../stores/villagerStore";
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from "./tilemap/mapData";

extend({ Container, Graphics, Text, Sprite, TilingSprite, AnimatedSprite });

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

export function GameCanvas() {
  const { width, height } = useWindowSize();
  const villagerOffset = useVillagerStore((state) => state.offset);
  const villagerState = useVillagerStore((state) => state.state);
  const targetOffset = useVillagerStore((state) => state.targetOffset);
  const currentMine = useVillagerStore((state) => state.currentMine);
  const currentTree = useVillagerStore((state) => state.currentTree);
  const facingDirection = useVillagerStore((state) => state.facingDirection);
  const updatePosition = useVillagerStore((state) => state.updatePosition);
  const lastTimeRef = useRef(Date.now());

  // Tilemap dimensions
  const mapPixelW = MAP_COLS * TILE_SIZE;
  const mapPixelH = MAP_ROWS * TILE_SIZE;

  // Scale the tilemap to fit the screen with padding
  const padding = 0.85;
  const scaleX = (width * padding) / mapPixelW;
  const scaleY = (height * padding) / mapPixelH;
  const mapScale = Math.min(scaleX, scaleY);

  // Center the map in the window
  const mapX = (width - mapPixelW * mapScale) / 2;
  const mapY = (height - mapPixelH * mapScale) / 2;

  // Use map scale for elements too
  const scale = mapScale;

  // Individual element scales (relative to base scale)
  const villagerScale = scale * 0.5;

  // Center of the map in screen coords
  const centerX = mapX + (mapPixelW * mapScale) / 2;
  const centerY = mapY + (mapPixelH * mapScale) / 2;

  // Animation loop
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      updatePosition(delta, scale);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [updatePosition, scale]);

  // Convert offset to screen position (center + offset * scale)
  const villagerX = centerX + villagerOffset.x * scale;
  const villagerY = centerY + villagerOffset.y * scale;

  // Determine facing direction based on movement or work state
  const getFacingLeft = () => {
    // Use mine-specific facing when mining
    if (villagerState === "mining" && currentMine) {
      return MINE_PATHS[currentMine].facingLeft;
    }

    // Use tree-specific facing when chopping
    if (villagerState === "chopping" && currentTree) {
      return TREE_PATHS[currentTree].facingLeft;
    }

    // Use facing direction from store (set during movement)
    return facingDirection === "left";
  };
  const facingLeft = getFacingLeft();

  return (
    <Application
      background={0x3a8a8a}
      resizeTo={window}
      roundPixels={true}
      antialias={false}
    >
      <TilemapRenderer x={mapX} y={mapY} scale={mapScale} />
      <PawnSprite
        x={villagerX}
        y={villagerY}
        scale={villagerScale}
        state={villagerState}
        facingLeft={facingLeft}
      />
    </Application>
  );
}
