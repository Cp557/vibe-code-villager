import { extend } from "@pixi/react";
import { TilingSprite, Assets, Texture, Rectangle } from "pixi.js";
import { useState, useEffect } from "react";

extend({ TilingSprite });

// Tile size and position in tilemap
const TILE_SIZE = 64;
const TILE_X = 1; // Column 2 (0-indexed)
const TILE_Y = 1; // Row 2 (0-indexed)

interface GrassBackgroundProps {
  width: number;
  height: number;
}

export function GrassBackground({ width, height }: GrassBackgroundProps) {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    const loadTile = async () => {
      const tilemap = await Assets.load("/tiny_swords/Terrain/Tileset/Tilemap_color2.png");

      // Extract the specific 64x64 tile
      const frame = new Rectangle(
        TILE_X * TILE_SIZE,
        TILE_Y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
      const tileTexture = new Texture({ source: tilemap.source, frame });
      setTexture(tileTexture);
    };

    loadTile();
  }, []);

  if (!texture) return null;

  return (
    <pixiTilingSprite
      texture={texture}
      width={width}
      height={height}
      x={0}
      y={0}
    />
  );
}
