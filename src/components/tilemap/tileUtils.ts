import { Texture, Rectangle, TextureSource } from "pixi.js";
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from "./mapData";

// ── Tile positions in the 8×4 spritesheet grid ──────────────────────
//
// Each tilemap_colorN.png is 512×256 (8 cols × 4 rows of 64×64 tiles).
// LEFT HALF (cols 0-3) = Flat Ground, RIGHT HALF (cols 4-7) = Elevated Ground.
//
// Within each half, it's a 3+1 layout:
//   Cols 0-2 (or 4-6): Standard 9-patch tiles
//   Col 3 (or 7):      Special tiles (inner corners, solo, etc.)
//
// FLAT GROUND (left half):
//   1=TL(0,0)  2=T(1,0)  3=TR(2,0)  | 13=InnerNW+SE(3,0)
//   4=L(0,1)   5=C(1,1)  6=R(2,1)   | 14=InnerNE+SW(3,1)
//   7=BL(0,2)  8=B(1,2)  9=BR(2,2)  | 15=???(3,2)
//  10=StL(0,3) 11=StC(1,3) 12=StR(2,3) | 16=Solo(3,3)
//
// ELEVATED GROUND (right half):
//   Rows 0-1: Elevated grass surface (same 3+1 pattern)
//   Row 2: Cliff top (grass-to-stone transition)
//   Row 3: Cliff face (stone)

// 9-patch for flat ground (cols 0-2, rows 0-2)
const FLAT = {
  TL: { col: 0, row: 0 },
  T:  { col: 1, row: 0 },
  TR: { col: 2, row: 0 },
  L:  { col: 0, row: 1 },
  C:  { col: 1, row: 1 },
  R:  { col: 2, row: 1 },
  BL: { col: 0, row: 2 },
  B:  { col: 1, row: 2 },
  BR: { col: 2, row: 2 },
};

// Special flat ground tiles (col 3)
const FLAT_SPECIAL = {
  INNER_NW_SE: { col: 3, row: 0 }, // tile 13: concave corners NW + SE
  INNER_NE_SW: { col: 3, row: 1 }, // tile 14: concave corners NE + SW
  SOLO:        { col: 3, row: 3 }, // tile 16: 1×1 island (all borders)
};

// 9-patch for elevated grass surface (cols 4-6, rows 0-1)
const ELEV = {
  TL: { col: 4, row: 0 },
  T:  { col: 5, row: 0 },
  TR: { col: 6, row: 0 },
  L:  { col: 4, row: 1 },
  C:  { col: 5, row: 1 },
  R:  { col: 6, row: 1 },
};

// Cliff tiles (cols 4-6, rows 2-3)
const CLIFF = {
  TOP_L: { col: 4, row: 2 },
  TOP_C: { col: 5, row: 2 },
  TOP_R: { col: 6, row: 2 },
  BOT_L: { col: 4, row: 3 },
  BOT_C: { col: 5, row: 3 },
  BOT_R: { col: 6, row: 3 },
};

export { FLAT, FLAT_SPECIAL, ELEV, CLIFF };

// ── Helpers ──────────────────────────────────────────────────────────

export function extractTile(
  source: TextureSource,
  col: number,
  row: number
): Texture {
  return new Texture({
    source,
    frame: new Rectangle(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE),
  });
}

export function getLevelMask(hm: number[][], level: number): boolean[][] {
  return hm.map((r) => r.map((cell) => cell >= level));
}

function solid(mask: boolean[][], x: number, y: number): boolean {
  if (y < 0 || y >= MAP_ROWS || x < 0 || x >= MAP_COLS) return false;
  return mask[y][x];
}

// ── Auto-tiler: 9-patch tile selection ──────────────────────────────

type TilePos = { col: number; row: number };

export function pickFlatTile(mask: boolean[][], x: number, y: number): TilePos {
  const n = solid(mask, x, y - 1);
  const s = solid(mask, x, y + 1);
  const w = solid(mask, x - 1, y);
  const e = solid(mask, x + 1, y);

  // Outer corners (2 adjacent cardinals)
  if (!n && !w &&  s &&  e) return FLAT.TL;
  if (!n &&  w &&  s && !e) return FLAT.TR;
  if ( n && !w && !s &&  e) return FLAT.BL;
  if ( n &&  w && !s && !e) return FLAT.BR;

  // Edges (1 cardinal missing)
  if (!n &&  w &&  s &&  e) return FLAT.T;
  if ( n &&  w && !s &&  e) return FLAT.B;
  if ( n && !w &&  s &&  e) return FLAT.L;
  if ( n &&  w &&  s && !e) return FLAT.R;

  // Narrow strips / peninsulas (only 1 cardinal)
  if (!n && !w &&  s && !e) return FLAT.TL;
  if (!n && !w && !s &&  e) return FLAT.BL;
  if ( n && !w && !s && !e) return FLAT.BR;
  if (!n &&  w && !s && !e) return FLAT.TR;

  // Isolated or opposite pairs → center
  return FLAT.C;
}

export function pickElevTile(mask: boolean[][], x: number, y: number): TilePos {
  const n = solid(mask, x, y - 1);
  const s = solid(mask, x, y + 1);
  const w = solid(mask, x - 1, y);
  const e = solid(mask, x + 1, y);

  if (!n && !w &&  s &&  e) return ELEV.TL;
  if (!n &&  w &&  s && !e) return ELEV.TR;
  if ( n && !w && !s &&  e) return ELEV.TL;
  if ( n &&  w && !s && !e) return ELEV.TR;

  if (!n &&  w &&  s &&  e) return ELEV.T;
  if ( n &&  w && !s &&  e) return ELEV.C;
  if ( n && !w &&  s &&  e) return ELEV.L;
  if ( n &&  w &&  s && !e) return ELEV.R;

  if (!n && !w &&  s && !e) return ELEV.TL;
  if (!n && !w && !s &&  e) return ELEV.TL;
  if ( n && !w && !s && !e) return ELEV.TR;
  if (!n &&  w && !s && !e) return ELEV.TR;

  return ELEV.C;
}

// ── Inner corner detection ──────────────────────────────────────────
// Inner corners occur when all 4 cardinals are solid but a diagonal is empty.
// Tile 13 (col 3, row 0) has NW + SE bush decorations.
// Tile 14 (col 3, row 1) has NE + SW bush decorations.
// We overlay these on top of center tiles.

export type InnerCorner = "NW" | "NE" | "SW" | "SE";

export function getInnerCorners(
  mask: boolean[][],
  x: number,
  y: number
): InnerCorner[] {
  const n = solid(mask, x, y - 1);
  const s = solid(mask, x, y + 1);
  const w = solid(mask, x - 1, y);
  const e = solid(mask, x + 1, y);

  if (!n || !s || !w || !e) return [];

  const corners: InnerCorner[] = [];
  if (!solid(mask, x - 1, y - 1)) corners.push("NW");
  if (!solid(mask, x + 1, y - 1)) corners.push("NE");
  if (!solid(mask, x - 1, y + 1)) corners.push("SW");
  if (!solid(mask, x + 1, y + 1)) corners.push("SE");
  return corners;
}

// Returns the tile position for an inner corner overlay
export function getInnerCornerTile(corner: InnerCorner): TilePos {
  // Tile 13 covers NW and SE, tile 14 covers NE and SW
  if (corner === "NW" || corner === "SE") return FLAT_SPECIAL.INNER_NW_SE;
  return FLAT_SPECIAL.INNER_NE_SW;
}

// ── Cliff placement ─────────────────────────────────────────────────

export interface CliffPlacement {
  col: number;
  row: number;
  gridX: number;
  gridY: number;
}

export function getCliffPlacements(
  mask: boolean[][],
  x: number,
  y: number
): CliffPlacement[] {
  const placements: CliffPlacement[] = [];
  if (solid(mask, x, y + 1)) return placements;

  const isLeftEdge = !solid(mask, x - 1, y);
  const isRightEdge = !solid(mask, x + 1, y);

  // Cliff top (row 2) at y+1
  let topTile = CLIFF.TOP_C;
  if (isLeftEdge) topTile = CLIFF.TOP_L;
  else if (isRightEdge) topTile = CLIFF.TOP_R;
  placements.push({ col: topTile.col, row: topTile.row, gridX: x, gridY: y + 1 });

  // Cliff face (row 3) at y+2
  let botTile = CLIFF.BOT_C;
  if (isLeftEdge) botTile = CLIFF.BOT_L;
  else if (isRightEdge) botTile = CLIFF.BOT_R;
  placements.push({ col: botTile.col, row: botTile.row, gridX: x, gridY: y + 2 });

  return placements;
}

// ── Constants ───────────────────────────────────────────────────────

export const SHADOW_SIZE = 128;
export const FOAM_FRAME_WIDTH = 192;
export const FOAM_FRAME_HEIGHT = 192;
export const FOAM_FRAME_COUNT = 16;
