import { extend } from "@pixi/react";
import {
  Container,
  Sprite,
  AnimatedSprite,
  Assets,
  Texture,
  Rectangle,
  TilingSprite,
  SCALE_MODES,
} from "pixi.js";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  TILE_SIZE,
  SHEET_TILE_SIZE,
  MAP_COLS,
  MAP_ROWS,
  tileToColRow,
  flatLayer,
  elevLayer,
  foamLayer,
  shadowLayer,
  decorLayer,
  FOAM_FRAME_WIDTH,
  FOAM_FRAME_HEIGHT,
  FOAM_FRAME_COUNT,
  DECORATION_CONFIG,
  DecorationConfig,
} from "./mapData";

extend({ Container, Sprite, AnimatedSprite, TilingSprite });

const TILESET_PATH = "/tiny_swords/Terrain/Tileset";
const SHADOW_SIZE = 128;

interface TilemapRendererProps {
  x: number;
  y: number;
  scale: number;
}

interface TileDraw {
  texture: Texture;
  x: number;
  y: number;
  key: string;
}

interface FoamDraw {
  textures: Texture[];
  x: number;
  y: number;
  key: string;
}

interface DecorationDraw {
  textures: Texture[];
  x: number;
  y: number;
  scale: number;
  key: string;
  animated: boolean;
  flipX: boolean;
}

// Scale ratio for oversized sprites (shadow, foam) to match halved tile grid
const SCALE_RATIO = TILE_SIZE / SHEET_TILE_SIZE; // 0.5
const SCALED_SHADOW = SHADOW_SIZE * SCALE_RATIO; // 64
const SCALED_FOAM_W = FOAM_FRAME_WIDTH * SCALE_RATIO; // 96
const SCALED_FOAM_H = FOAM_FRAME_HEIGHT * SCALE_RATIO; // 96

function FoamSprite({ textures, x, y }: { textures: Texture[]; x: number; y: number }) {
  const ref = useRef<AnimatedSprite>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.animationSpeed = 0.15;
      ref.current.play();
    }
  }, [textures]);

  return <pixiAnimatedSprite ref={ref} textures={textures} x={x} y={y} scale={SCALE_RATIO} />;
}

function DecorationAnimSprite({
  textures,
  x,
  y,
  scale,
  flipX,
}: {
  textures: Texture[];
  x: number;
  y: number;
  scale: number;
  flipX: boolean;
}) {
  const ref = useRef<AnimatedSprite>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.animationSpeed = 0.1;
      ref.current.play();
    }
  }, [textures]);

  const spriteScale = flipX ? { x: -scale, y: scale } : scale;

  return (
    <pixiAnimatedSprite
      ref={ref}
      textures={textures}
      x={x}
      y={y}
      scale={spriteScale}
      anchor={0}
    />
  );
}

/** Extract animation frames from a spritesheet */
function extractAnimationFrames(
  source: Texture,
  config: DecorationConfig
): Texture[] {
  const frames: Texture[] = [];
  const frameCount = config.frameCount || 1;

  for (let i = 0; i < frameCount; i++) {
    frames.push(
      new Texture({
        source: source.source,
        frame: new Rectangle(
          i * config.frameWidth,
          0,
          config.frameWidth,
          config.frameHeight
        ),
      })
    );
  }

  return frames;
}

/** Calculate appropriate scale for decoration sprites */
function calculateDecorationScale(config: DecorationConfig): number {
  // Use custom scale if provided
  if (config.scale !== undefined) {
    return config.scale;
  }

  // Use SCALE_RATIO (0.5) as base for consistency with tile system
  return SCALE_RATIO;
}

/** Extract a 64x64 tile from a spritesheet by tile number (1-54) */
function makeTileTexture(source: Texture["source"], tileNum: number): Texture {
  const { col, row } = tileToColRow(tileNum);
  return new Texture({
    source,
    frame: new Rectangle(
      col * SHEET_TILE_SIZE,
      row * SHEET_TILE_SIZE,
      SHEET_TILE_SIZE,
      SHEET_TILE_SIZE
    ),
  });
}

/** Build tile draw list from a layer using a given spritesheet source */
function buildTileLayer(
  source: Texture["source"],
  layer: number[][],
  prefix: string
): TileDraw[] {
  const tiles: TileDraw[] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const tileNum = layer[row][col];
      if (tileNum === 0) continue;
      tiles.push({
        texture: makeTileTexture(source, tileNum),
        x: col * TILE_SIZE,
        y: row * TILE_SIZE,
        key: `${prefix}-${col}-${row}`,
      });
    }
  }
  return tiles;
}

/** Build shadow draw list from a binary layer */
function buildShadowLayer(
  shadowTex: Texture,
  layer: number[][],
  prefix: string
): TileDraw[] {
  const tiles: TileDraw[] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (layer[row][col] === 0) continue;
      tiles.push({
        texture: shadowTex,
        x: col * TILE_SIZE - TILE_SIZE,
        y: row * TILE_SIZE - TILE_SIZE,
        key: `${prefix}-${col}-${row}`,
      });
    }
  }
  return tiles;
}

/** Build decoration draw list from decorLayer */
async function buildDecorationLayer(
  layer: number[][],
  prefix: string
): Promise<DecorationDraw[]> {
  // Step 1: Find which decoration IDs are actually used
  const usedIds = new Set<number>();
  for (const row of layer) {
    for (const id of row) {
      if (id > 0) usedIds.add(id);
    }
  }

  // Step 2: Load all required assets in parallel
  const assetMap = new Map<number, Texture>();
  await Promise.all(
    Array.from(usedIds).map(async (id) => {
      const config = DECORATION_CONFIG[id];
      const texture = await Assets.load(config.path);
      texture.source.scaleMode = "nearest";
      assetMap.set(id, texture);
    })
  );

  // Step 3: Build decoration draw list
  const decorations: DecorationDraw[] = [];
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const id = layer[row][col];
      if (id === 0) continue;

      const config = DECORATION_CONFIG[id];
      const texture = assetMap.get(id)!;
      const textures = config.animated
        ? extractAnimationFrames(texture, config)
        : [texture];

      decorations.push({
        textures,
        x: col * TILE_SIZE,
        y: row * TILE_SIZE,
        scale: calculateDecorationScale(config),
        key: `${prefix}-${col}-${row}`,
        animated: config.animated,
        flipX: config.flipX || false,
      });
    }
  }

  return decorations;
}

export function TilemapRenderer({ x, y, scale }: TilemapRendererProps) {
  const [waterTex, setWaterTex] = useState<Texture | null>(null);
  const [flatTiles, setFlatTiles] = useState<TileDraw[]>([]);
  const [elevTiles, setElevTiles] = useState<TileDraw[]>([]);
  const [shadowTiles, setShadowTiles] = useState<TileDraw[]>([]);
  const [foamSprites, setFoamSprites] = useState<FoamDraw[]>([]);
  const [decorations, setDecorations] = useState<DecorationDraw[]>([]);

  const build = useCallback(async () => {
    const [waterBg, flatSheet, elevSheet, foamSheet, shadowTex] = await Promise.all([
      Assets.load(`${TILESET_PATH}/Water Background color.png`),
      Assets.load(`${TILESET_PATH}/Tilemap_color3.png`),
      Assets.load(`${TILESET_PATH}/Tilemap_color1.png`),
      Assets.load(`${TILESET_PATH}/Water Foam.png`),
      Assets.load(`${TILESET_PATH}/Shadow.png`),
    ]);

    // Set nearest-neighbor scaling to prevent sub-pixel gaps
    flatSheet.source.scaleMode = "nearest";
    elevSheet.source.scaleMode = "nearest";
    foamSheet.source.scaleMode = "nearest";
    shadowTex.source.scaleMode = "nearest";
    waterBg.source.scaleMode = "nearest";

    setWaterTex(waterBg);

    // Build tile layers (64x64 source tiles, rendered at TILE_SIZE)
    setFlatTiles(buildTileLayer(flatSheet.source, flatLayer, "flat"));
    setElevTiles(buildTileLayer(elevSheet.source, elevLayer, "elev"));

    // Build shadow layer
    setShadowTiles(buildShadowLayer(shadowTex, shadowLayer, "shadow"));

    // Build foam animation frames (layer 1)
    const foamFrames: Texture[] = [];
    for (let i = 0; i < FOAM_FRAME_COUNT; i++) {
      foamFrames.push(
        new Texture({
          source: foamSheet.source,
          frame: new Rectangle(i * FOAM_FRAME_WIDTH, 0, FOAM_FRAME_WIDTH, FOAM_FRAME_HEIGHT),
        })
      );
    }

    const foams: FoamDraw[] = [];
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (foamLayer[row][col] === 0) continue;
        foams.push({
          textures: foamFrames,
          x: col * TILE_SIZE - TILE_SIZE,
          y: row * TILE_SIZE - TILE_SIZE,
          key: `foam-${col}-${row}`,
        });
      }
    }
    setFoamSprites(foams);

    // Build decoration layer
    const decorDraw = await buildDecorationLayer(decorLayer, "decor");
    setDecorations(decorDraw);
  }, []);

  useEffect(() => {
    build();
  }, [build]);

  const mapW = MAP_COLS * TILE_SIZE;
  const mapH = MAP_ROWS * TILE_SIZE;

  return (
    <pixiContainer x={Math.round(x)} y={Math.round(y)} scale={scale} roundPixels={true}>
      {/* Layer 0: Water background */}
      {waterTex && (
        <pixiTilingSprite texture={waterTex} width={mapW} height={mapH} />
      )}

      {/* Layer 1: Water foam */}
      {foamSprites.map((f) => (
        <FoamSprite key={f.key} textures={f.textures} x={f.x} y={f.y} />
      ))}

      {/* Layer 2: Flat ground (color3) */}
      {flatTiles.map((t) => (
        <pixiSprite key={t.key} texture={t.texture} x={t.x} y={t.y} width={TILE_SIZE} height={TILE_SIZE} />
      ))}

      {/* Layer 3: Shadow */}
      {shadowTiles.map((t) => (
        <pixiSprite key={t.key} texture={t.texture} x={t.x} y={t.y} scale={SCALE_RATIO} />
      ))}

      {/* Layer 4: Elevated ground (color1) */}
      {elevTiles.map((t) => (
        <pixiSprite key={t.key} texture={t.texture} x={t.x} y={t.y} width={TILE_SIZE} height={TILE_SIZE} />
      ))}

      {/* Layer 5: Decorations */}
      {decorations.map((d) => {
        const spriteScale = d.flipX ? { x: -d.scale, y: d.scale } : d.scale;
        return d.animated ? (
          <DecorationAnimSprite
            key={d.key}
            textures={d.textures}
            x={d.x}
            y={d.y}
            scale={d.scale}
            flipX={d.flipX}
          />
        ) : (
          <pixiSprite
            key={d.key}
            texture={d.textures[0]}
            x={d.x}
            y={d.y}
            scale={spriteScale}
          />
        );
      })}
    </pixiContainer>
  );
}
