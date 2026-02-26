export const TILE_SIZE = 32;
export const MAP_COLS = 24;
export const MAP_ROWS = 16;

// Spritesheet source tiles are 64x64, scaled to TILE_SIZE for rendering
export const SHEET_TILE_SIZE = 64;

// Both tilemap PNGs are 576x384 = 9 cols x 6 rows of 64x64
export const SHEET_COLS = 9;

export function tileToColRow(n: number): { col: number; row: number } {
  return { col: (n - 1) % SHEET_COLS, row: Math.floor((n - 1) / SHEET_COLS) };
}

// Layer 1: Water Foam (1 = place foam, 0 = empty)
// Foam sprites are 192x192; markers placed at top-left of each original 64px cell
export const foamLayer: number[][] = [
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,1, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,1, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 1,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 1,0],
  [0,1, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 1,0],
  [0,0, 1,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,1, 0,0],
  [0,0, 0,1, 0,0, 0,0, 0,0, 0,0, 1,1, 0,0, 0,0, 0,0, 0,1, 0,0],
  [0,1, 1,0, 0,0, 0,0, 0,0, 0,1, 0,0, 1,0, 0,0, 0,0, 0,1, 0,0],
  [0,1, 0,0, 0,0, 0,0, 0,0, 1,0, 0,0, 1,0, 0,0, 0,0, 0,0, 1,0],
  [0,1, 0,0, 0,0, 0,0, 0,1, 1,0, 0,0, 0,1, 0,0, 0,0, 0,0, 1,0],
  [0,1, 1,0, 0,0, 0,0, 1,0, 0,0, 0,0, 0,1, 0,0, 0,0, 0,0, 1,0],
  [0,0, 0,1, 0,1, 1,1, 0,0, 0,0, 0,0, 0,1, 1,0, 0,0, 0,0, 1,0],
  [0,0, 0,1, 1,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,1, 1,1, 1,1, 1,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
];

// Layer 2: Flat Ground (Tilemap_color3.png tile numbers 1-54)
export const flatLayer: number[][] = [
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0,11,11,11,11,11,11,11,11,11,11,0,0,0,0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0,11,11,11,11,11,11,11,11,11,11,0,0,0,0, 0, 0, 2, 3, 0, 0, 0],
  [ 0, 0, 0, 0,11,11,11,11,11,11,11,11,11,11,0,0,0,0, 0, 0, 11, 12, 0, 0],
  [ 0, 0, 0, 0,11,11,11,11,11,11,11,11,11,11,11,11,11,11, 11, 11, 11, 11, 3, 0],
  [ 0, 0, 0, 0,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11, 12, 0],
  [ 0, 0, 0,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11, 21, 0],
  [ 0, 0, 0 ,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,12, 0, 0],
  [ 0, 0, 0,10,11,11,11,11,11,11,11, 12, 0, 0, 10,11,11,11,11,11,11,12, 0, 0],
  [ 0, 1, 2, 11,11,11,11,11,11,11,11, 21, 0, 0, 10,11,11,11,11,11,11,12, 0, 0],
  [ 0, 10,11,11,11,11,11,11,11,11,12, 0, 0, 0, 19,11,11,11,11,11,11,11, 3, 0],
  [ 0, 10,11,11,11,11,11,11,11,20,21, 0, 0, 0, 0,10,11,11,11,11,11,11, 12, 0],
  [ 0, 19,20,11,11,11,11,11,21, 0, 0, 0, 0, 0, 0,10,11,11,11,11,11,11, 12, 0],
  [ 0, 0,0,10,11,20,20, 21, 0, 0, 0, 0, 0, 0, 0,19,20,11,11,11,11,11, 12, 0],
  [ 0, 0, 0, 19, 21, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0,0,19, 20, 20, 20, 20, 21, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Layer 3: Shadow (1 = place shadow, 0 = empty)
// Shadow texture is 128x128; markers placed at top-left of each original 64px cell
export const shadowLayer: number[][] = [
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 1,1, 1,1, 1,1, 1,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 1,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 1,0, 0,0, 0,0, 0,0],
  [0,0, 0,1, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 1,0, 0,0, 0,1, 1,1, 0,0, 0,0, 0,0, 1,0, 0,0, 0,0],
  [0,0, 0,0,1,0, 0,0, 1,0, 0,0, 0,0, 1,1, 0,0, 1,0, 0,0, 0,0],
  [0,0, 0,1, 0,0, 0,1, 1,0, 0,0, 0,0, 0,0, 1,0, 0,1, 0,0, 0,0],
  [0,0, 0,0, 1,1, 1,0, 0,0, 0,0, 0,0, 0,0, 1,1, 1,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
];

// Layer 4: Elevated Ground (Tilemap_color1.png tile numbers 1-54)
export const elevLayer: number[][] = [
  [ 0, 0, 0, 0, 0, 0, 6, 7, 7, 7, 7, 7, 7, 7,7,7,7, 7, 7, 7, 8, 0, 0, 0],
  [ 0, 0, 6, 7, 7, 7,16,16,16,16,16,16,16,16,16,16,16,16,16, 16, 16, 8, 0],
  [ 0, 0,15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16, 8, 0],
  [ 0, 6,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,25,25,25,25,25, 26, 0, 0],
  [ 0, 15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,17, 43,43,43,43,43,44, 0, 0],
  [ 0, 24,16,16,16,16,16,16,16,16,16,16,16,16,16,16, 17, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 42,24,25,16,16,16,16,16,16,16,16,16,16,16,16, 17, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 42, 43,15,16,16,16,16,25,25,25,25,25,16,16, 16, 7, 8, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0,15,16,16,16,17,43,43,43,43,43,24,16,16, 16, 17, 0, 0, 0, 0, 0],
  [ 0, 0, 0,37,16,16,16,25,26, 0, 0, 0, 0, 0, 42,43,15, 16, 16, 40, 0, 0, 0, 0],
  [ 0, 0, 0,46,24,25,26,43,44, 0, 0, 0, 0, 0, 0, 0,24, 25, 26, 49, 0, 0, 0, 0],
  [ 0, 0, 0, 0,43,43,44, 0, 0, 0, 0, 0, 0, 0, 0, 0, 42, 43, 44, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Water Foam spritesheet: 3072x192 = 16 frames of 192x192
export const FOAM_FRAME_WIDTH = 192;
export const FOAM_FRAME_HEIGHT = 192;
export const FOAM_FRAME_COUNT = 16;

// Layer 5: Decorations (bushes, rocks, trees, etc.)
// Numbers map to specific decoration assets via DECORATION_MAP
export const decorLayer: number[][] = [
  [0,0, 9,0, 9,0, 0,0, 0,0, 0,0, 0,0, 11,0, 11,0, 11,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,25, 0,0, 0,0, 0,0, 0,12, 0,12, 0,12, 0,0, 0,0],
  [0,9, 0,9, 0,9, 0,0, 0,0, 0,0, 23,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 26,4, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,22, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
[0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 4,5, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,3, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 15,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,4, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,21, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,16, 0,0, 0,0, 0,0, 0,3, 0,7, 0,0],
  [0,14, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
  [0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0],
];

// Decoration configuration
export interface DecorationConfig {
  path: string;
  animated: boolean;
  frameWidth: number;
  frameHeight: number;
  frameCount?: number; // only for animated
  scale?: number; // optional custom scale
  flipX?: boolean; // flip horizontally (around y-axis)
}

export const DECORATION_CONFIG: Record<number, DecorationConfig> = {
  // Bushes (1-4) - Animated, 8 frames horizontal
  1: {
    path: 'tiny_swords/Terrain/Decorations/Bushes/Bushe1.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 8
  },
  2: {
    path: 'tiny_swords/Terrain/Decorations/Bushes/Bushe2.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 8
  },
  3: {
    path: 'tiny_swords/Terrain/Decorations/Bushes/Bushe3.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 8
  },
  4: {
    path: 'tiny_swords/Terrain/Decorations/Bushes/Bushe4.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 8
  },

  // Rocks (5-8) - Static
  5: {
    path: 'tiny_swords/Terrain/Decorations/Rocks/Rock1.png',
    animated: false,
    frameWidth: 64,
    frameHeight: 64
  },
  6: {
    path: 'tiny_swords/Terrain/Decorations/Rocks/Rock2.png',
    animated: false,
    frameWidth: 64,
    frameHeight: 64
  },
  7: {
    path: 'tiny_swords/Terrain/Decorations/Rocks/Rock3.png',
    animated: false,
    frameWidth: 64,
    frameHeight: 64
  },
  8: {
    path: 'tiny_swords/Terrain/Decorations/Rocks/Rock4.png',
    animated: false,
    frameWidth: 64,
    frameHeight: 64
  },

  // Trees (9-12) - Animated, 8 frames horizontal
  9: {
    path: 'tiny_swords/Terrain/Resources/Wood/Trees/Tree1.png',
    animated: true,
    frameWidth: 192,
    frameHeight: 256,
    frameCount: 8
  },
  10: {
    path: 'tiny_swords/Terrain/Resources/Wood/Trees/Tree2.png',
    animated: true,
    frameWidth: 192,
    frameHeight: 256,
    frameCount: 8
  },
  11: {
    path: 'tiny_swords/Terrain/Resources/Wood/Trees/Tree3.png',
    animated: true,
    frameWidth: 192,
    frameHeight: 192,
    frameCount: 8
  },
  12: {
    path: 'tiny_swords/Terrain/Resources/Wood/Trees/Tree4.png',
    animated: true,
    frameWidth: 192,
    frameHeight: 192,
    frameCount: 8
  },

  // Water Rocks (13-16) - Animated, 16 frames horizontal
  13: {
    path: 'tiny_swords/Terrain/Decorations/Rocks in the Water/Water Rocks_01.png',
    animated: true,
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 16
  },
  14: {
    path: 'tiny_swords/Terrain/Decorations/Rocks in the Water/Water Rocks_02.png',
    animated: true,
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 16
  },
  15: {
    path: 'tiny_swords/Terrain/Decorations/Rocks in the Water/Water Rocks_03.png',
    animated: true,
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 16
  },
  16: {
    path: 'tiny_swords/Terrain/Decorations/Rocks in the Water/Water Rocks_04.png',
    animated: true,
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 16
  },

  // Gold Highlights (17-22) - Animated, 6 frames horizontal
  17: {
    path: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 1_Highlight.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 6
  },
  18: {
    path: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 2_Highlight.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 6
  },
  19: {
    path: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 3_Highlight.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 6
  },
  20: {
    path: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 4_Highlight.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 6
  },
  21: {
    path: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 5_Highlight.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 6
  },
  22: {
    path: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 6_Highlight.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 6
  },

  // Buildings (23) - Static
  23: {
    path: 'tiny_swords/Buildings/House2.png',
    animated: false,
    frameWidth: 128,
    frameHeight: 192,
    flipX: true
  },

  // Easter egg (24) - Animated, 3 frames horizontal
  24: {
    path: 'tiny_swords/Terrain/Decorations/Rubber Duck/Rubber duck.png',
    animated: true,
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 3
  },

  // Sheep (25) - Animated, 6 frames horizontal
  25: {
    path: 'tiny_swords/Terrain/Resources/Meat/Sheep/Sheep_Grass.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 6
  },

  // Sheep flipped (26) - Same as 25 but mirrored around Y axis
  26: {
    path: 'tiny_swords/Terrain/Resources/Meat/Sheep/Sheep_Grass.png',
    animated: true,
    frameWidth: 128,
    frameHeight: 128,
    frameCount: 6,
    flipX: true
  },
};

// Legacy decoration asset mapping (kept for backwards compatibility)
// Maps decoration layer numbers to their corresponding asset file paths
export const DECORATION_MAP: Record<number, string> = {
  // Bushes (1-4)
  1: 'tiny_swords/Terrain/Decorations/Bushes/Bushe1.png',
  2: 'tiny_swords/Terrain/Decorations/Bushes/Bushe2.png',
  3: 'tiny_swords/Terrain/Decorations/Bushes/Bushe3.png',
  4: 'tiny_swords/Terrain/Decorations/Bushes/Bushe4.png',

  // Rocks (5-8)
  5: 'tiny_swords/Terrain/Decorations/Rocks/Rock1.png',
  6: 'tiny_swords/Terrain/Decorations/Rocks/Rock2.png',
  7: 'tiny_swords/Terrain/Decorations/Rocks/Rock3.png',
  8: 'tiny_swords/Terrain/Decorations/Rocks/Rock4.png',

  // Trees (9-12)
  9: 'tiny_swords/Terrain/Resources/Wood/Trees/Tree1.png',
  10: 'tiny_swords/Terrain/Resources/Wood/Trees/Tree2.png',
  11: 'tiny_swords/Terrain/Resources/Wood/Trees/Tree3.png',
  12: 'tiny_swords/Terrain/Resources/Wood/Trees/Tree4.png',

  // Water Rocks (13-16)
  13: 'tiny_swords/Terrain/Decorations/Rocks in the Water/Water Rocks_01.png',
  14: 'tiny_swords/Terrain/Decorations/Rocks in the Water/Water Rocks_02.png',
  15: 'tiny_swords/Terrain/Decorations/Rocks in the Water/Water Rocks_03.png',
  16: 'tiny_swords/Terrain/Decorations/Rocks in the Water/Water Rocks_04.png',

  // Gold Stones (17-22)
  17: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 1_Highlight.png',
  18: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 2_Highlight.png',
  19: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 3_Highlight.png',
  20: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 4_Highlight.png',
  21: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 5_Highlight.png',
  22: 'tiny_swords/Terrain/Resources/Gold/Gold Stones/Gold Stone 6_Highlight.png',

  // Buildings (23)
  23: 'tiny_swords/Buildings/House2.png',

  // Easter egg (24)
  24: 'tiny_swords/Terrain/Decorations/Rubber Duck/Rubber duck.png',

  // Sheep (25)
  25: 'tiny_swords/Terrain/Resources/Meat/Sheep/Sheep_Grass.png',

  // Sheep flipped (26)
  26: 'tiny_swords/Terrain/Resources/Meat/Sheep/Sheep_Grass.png',
};
