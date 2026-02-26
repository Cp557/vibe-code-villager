import { create } from "zustand";

export type VillagerState =
  | "idle"
  | "walking_to_mine"
  | "mining"
  | "walking_to_tree"
  | "chopping"
  | "returning_gold"
  | "returning_wood";

export type MineLocation = "mine21" | "mine22";
export type TreeLocation = "tree1" | "tree2";
export type FacingDirection = "left" | "right";

// Positions are stored as pixel offsets from center (will be scaled by GameCanvas)
interface Offset {
  x: number;
  y: number;
}

interface Waypoint {
  x: number;
  y: number;
}

interface MinePath {
  waypoints: Waypoint[];
  facingLeft: boolean;
}

interface TreePath {
  waypoints: Waypoint[];
  facingLeft: boolean;
}

interface VillagerStore {
  state: VillagerState;
  offset: Offset;           // Current position as offset from center
  targetOffset: Offset | null;

  // Pathfinding state
  currentPath: Waypoint[];
  currentWaypointIndex: number;
  currentMine: MineLocation | null;
  currentTree: TreeLocation | null;
  facingDirection: FacingDirection;
  lastMineSelected: MineLocation | null;
  lastTreeSelected: TreeLocation | null;
  shouldReturnOnArrival: boolean;
  returnTimer: number; // countdown in seconds; when > 0, auto-return home on expiry
  pendingTask: "gold" | "tree" | null; // task queued while villager was still out

  // Actions triggered by buttons
  goToGold: () => void;
  goToTree: () => void;
  returnHome: () => void;
  queueTask: (task: "gold" | "tree") => void;

  // Called by animation loop
  updatePosition: (delta: number, scale: number) => void;
}

// Base offsets from center (in pixels at scale=1, will be multiplied by actual scale)
const OFFSETS = {
  home: { x: 0, y: -112 },       // In front of house (moved 1 grid right, 1 grid down)
  mine21: { x: -224, y: 128 },   // Gold mine 21 (flat layer, lower-left)
  mine22: { x: 192, y: -96 },    // Gold mine 22 (flat layer, upper-right)
  stairs37: { x: -288, y: 64 },  // Left stairs (row 9, col 3)
  stairs40: { x: 224, y: 32 },   // Right stairs (row 9, col 19)
  tree: { x: 160, y: 40 },       // Right side, where pawn chops (villager position)
};

// Separate offsets for resource sprites (don't move with villager)
const GOLD_MINE_OFFSET = { x: -220, y: 30 };
const TREE_OFFSET = { x: 200, y: 0 };

const MOVE_SPEED = 150; // Pixels per second (at scale=1)

// Tree path configurations with waypoints
// tree1: Tree9  at decorLayer[2][5]  (1-based row=3, col=6)  → tile offset (-224,-192), trunk at (-192,-96)
// tree2: Tree11 at decorLayer[0][14] (1-based row=1, col=15) → tile offset (64,-256),  base  at (96,-164)
const TREE_PATHS: Record<TreeLocation, TreePath> = {
  tree1: {
    waypoints: [
      { x: -96, y: -104 },   // Move left and slightly up from home
      { x: -144, y: -91 }    // Arrive at trunk of Tree9 (last move leftward → face left)
    ],
    facingLeft: true
  },
  tree2: {
    waypoints: [
      { x: 48, y: -140 },    // Move right and up from home
      { x: 90, y: -190 }     // Arrive at base of Tree11 (last move rightward → face right)
    ],
    facingLeft: false
  }
};

// Mine path configurations with waypoints
const MINE_PATHS: Record<MineLocation, MinePath> = {
  mine21: {
    waypoints: [
      { x: -288, y: 56 },      // Diagonal to left stairs (slightly higher)
      { x: -310, y: 90 },      // Continue diagonal down-left (stay on angle longer)
      { x: -221, y: 152 }      // Go directly to mine (forms V shape)
    ],
    facingLeft: false          // Face RIGHT when mining
  },
  mine22: {
    waypoints: [
      { x: 224, y: 38 },       // Diagonal to right stairs (slightly lower)
      { x: 288, y: 72 },       // 2 blocks right and down (diagonal descent)
      { x: 285, y: -72 }       // Go straight up to mining position
    ],
    facingLeft: true           // Face LEFT when mining
  }
};

export const useVillagerStore = create<VillagerStore>()((set, get) => ({
  state: "idle",
  offset: OFFSETS.home,
  targetOffset: null,
  currentPath: [],
  currentWaypointIndex: 0,
  currentMine: null,
  currentTree: null,
  facingDirection: "right",
  lastMineSelected: null,
  lastTreeSelected: null,
  shouldReturnOnArrival: false,
  returnTimer: 0,
  pendingTask: null,

  goToGold: () => {
    const { state, lastMineSelected } = get();
    if (state === "idle") {
      // Alternate between mines
      const selectedMine: MineLocation = lastMineSelected === "mine21" ? "mine22" : "mine21";
      const path = MINE_PATHS[selectedMine];

      set({
        state: "walking_to_mine",
        currentMine: selectedMine,
        lastMineSelected: selectedMine,
        currentPath: path.waypoints,
        currentWaypointIndex: 0,
        targetOffset: path.waypoints[0]
      });
    }
  },

  goToTree: () => {
    const { state, lastTreeSelected } = get();
    if (state === "idle") {
      const selectedTree: TreeLocation = lastTreeSelected === "tree1" ? "tree2" : "tree1";
      const path = TREE_PATHS[selectedTree];

      set({
        state: "walking_to_tree",
        currentMine: null,
        currentTree: selectedTree,
        lastTreeSelected: selectedTree,
        currentPath: path.waypoints,
        currentWaypointIndex: 0,
        targetOffset: path.waypoints[0]
      });
    }
  },

  queueTask: (task) => {
    set({ pendingTask: task });
  },

  returnHome: () => {
    const { state, currentMine, currentTree } = get();
    if (state === "mining" && currentMine) {
      // Reverse the outbound path to return home
      const outboundPath = MINE_PATHS[currentMine].waypoints;
      const returnPath = [...outboundPath].reverse();
      returnPath.push(OFFSETS.home);

      set({
        state: "returning_gold",
        currentPath: returnPath,
        currentWaypointIndex: 0,
        targetOffset: returnPath[0]
      });
    } else if (state === "chopping" && currentTree) {
      // Reverse the outbound path to return home
      const outboundPath = TREE_PATHS[currentTree].waypoints;
      const returnPath = [...outboundPath].reverse();
      returnPath.push(OFFSETS.home);

      set({
        state: "returning_wood",
        currentPath: returnPath,
        currentWaypointIndex: 0,
        targetOffset: returnPath[0]
      });
    } else if (state === "walking_to_mine" || state === "walking_to_tree") {
      // Still en route — finish the journey first, then immediately return
      set({ shouldReturnOnArrival: true });
    }
  },

  updatePosition: (delta, scale) => {
    const { offset, currentPath, currentWaypointIndex, state, returnTimer, currentMine, currentTree } = get();

    // Quick-return timer: villager animates at the resource for a beat, then heads home
    if (returnTimer > 0) {
      const newTimer = returnTimer - delta;
      if (newTimer <= 0) {
        const isMine = state === "mining";
        const outboundPath = isMine
          ? MINE_PATHS[currentMine!].waypoints
          : TREE_PATHS[currentTree!].waypoints;
        const returnPath = [...outboundPath].reverse();
        returnPath.push(OFFSETS.home);
        set({
          returnTimer: 0,
          state: isMine ? "returning_gold" : "returning_wood",
          currentPath: returnPath,
          currentWaypointIndex: 0,
          targetOffset: returnPath[0]
        });
      } else {
        set({ returnTimer: newTimer });
      }
      return;
    }

    // No path to follow
    if (currentPath.length === 0 || currentWaypointIndex >= currentPath.length) {
      return;
    }

    const targetWaypoint = currentPath[currentWaypointIndex];
    const dx = targetWaypoint.x - offset.x;
    const dy = targetWaypoint.y - offset.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Arrived at current waypoint
    if (distance < 5) {
      if (currentWaypointIndex === currentPath.length - 1) {
        // Reached final destination
        const { shouldReturnOnArrival, currentMine, currentTree, pendingTask, lastMineSelected, lastTreeSelected } = get();

        const nextState = state === "walking_to_mine" ? "mining" :
                          state === "walking_to_tree" ? "chopping" : "idle";

        if (nextState === "idle" && pendingTask !== null) {
          // Arrived home with a queued task — head straight back out
          if (pendingTask === "gold") {
            const selectedMine: MineLocation = lastMineSelected === "mine21" ? "mine22" : "mine21";
            const path = MINE_PATHS[selectedMine];
            set({
              offset: targetWaypoint,
              currentPath: path.waypoints,
              currentWaypointIndex: 0,
              targetOffset: path.waypoints[0],
              state: "walking_to_mine",
              currentMine: selectedMine,
              lastMineSelected: selectedMine,
              currentTree: null,
              pendingTask: null,
            });
          } else {
            const selectedTree: TreeLocation = lastTreeSelected === "tree1" ? "tree2" : "tree1";
            const path = TREE_PATHS[selectedTree];
            set({
              offset: targetWaypoint,
              currentPath: path.waypoints,
              currentWaypointIndex: 0,
              targetOffset: path.waypoints[0],
              state: "walking_to_tree",
              currentTree: selectedTree,
              lastTreeSelected: selectedTree,
              currentMine: null,
              pendingTask: null,
            });
          }
        } else {
          set({
            offset: targetWaypoint,
            currentPath: [],
            currentWaypointIndex: 0,
            targetOffset: null,
            state: nextState,
            // If a quick-return was requested, start a timer so they animate at least once
            ...(shouldReturnOnArrival && (nextState === "mining" || nextState === "chopping")
              ? { shouldReturnOnArrival: false, returnTimer: 0.8 }
              : {})
          });
        }
      } else {
        // Advance to next waypoint
        set({
          offset: targetWaypoint,
          currentWaypointIndex: currentWaypointIndex + 1,
          targetOffset: currentPath[currentWaypointIndex + 1]
        });
      }
      return;
    }

    // Move towards current waypoint
    const moveDistance = MOVE_SPEED * delta;
    const ratio = Math.min(moveDistance / distance, 1);

    // Determine facing direction
    let newFacing: FacingDirection;
    if (state === "returning_gold" && currentMine === "mine22") {
      // Always face left when returning from mine22 (path goes right then down then left)
      newFacing = "left";
    } else if (dx !== 0) {
      // Horizontal movement
      newFacing = dx < 0 ? "left" : "right";
    } else {
      newFacing = get().facingDirection; // Keep current facing
    }

    set({
      offset: {
        x: offset.x + dx * ratio,
        y: offset.y + dy * ratio,
      },
      facingDirection: newFacing
    });
  },
}));

export { OFFSETS, GOLD_MINE_OFFSET, TREE_OFFSET, MINE_PATHS, TREE_PATHS };
