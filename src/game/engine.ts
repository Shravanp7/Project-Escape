// PROJECT ESCAPE — "Drift" puzzle.
// A ship floats in space. Space has no friction: once moving, it keeps gliding.
// When it is still, the black hole (bottom row) pulls it down one cell per tick.
// You place modules to steer it into the escape portal.

export type ModType = "thruster" | "shield" | "comms";
type SpriteType = ModType | "reactor" | "solar" | "conduit";
export type Cell = SpriteType | "rock" | null;
export type Vec = [number, number];

/** 0 = up, 1 = right, 2 = down, 3 = left */
export const DIRS: Vec[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];
export const DIR_NAMES = ["UP", "RIGHT", "DOWN", "LEFT"];

export const MODS: Record<ModType, { name: string; cost: number; desc: string }> = {
  thruster: { name: "Thruster", cost: 2, desc: "Touching the ship with its flame pointing away, it pushes the ship forward. Facing any other way, the ship can't move at all. Click it to turn it." },
  shield: { name: "Anchor", cost: 3, desc: "Glowing face toward the ship: it holds the ship still. Facing any other way, it shoves the ship one square the way it points." },
  comms: { name: "Bumper", cost: 1, desc: "Its padded face bounces the ship back. If the ship hits any other side, it can't move at all until you turn the bumper." },
};

export const SIZE = 7;
/** the bottom row is the black hole's event horizon */
export const HORIZON_Y = SIZE - 1;

export interface Level {
  name: string;
  brief: string;
  budget: number;
  time: number; // seconds of flight before the black hole wins
  ship: Vec;
  portal: Vec;
  rocks: Vec[];
}

// Every level is checked by a solver (engine.test.ts): budget must cover the cheapest solution.
// Coins start at 6 and grow by 4 per mission; the clock starts at 30s and grows by 20s per mission.
// Cheapest solver-found solutions cost 2 / 3 / 3 / 3 / 6 coins (thrusters fire with flame away; bumpers bounce only off the pad; wrong-facing anchors shove).
export const LEVELS: Level[] = [
  { name: "Training", brief: "Put a thruster on the left of the ship, then press Launch.", budget: 6, time: 30, ship: [1, 2], portal: [5, 2], rocks: [] },
  { name: "Cold Start", brief: "Only one route works. Plan your burns.", budget: 10, time: 50, ship: [5, 2], portal: [1, 3], rocks: [[0, 5], [1, 0], [6, 4], [4, 0], [5, 3]] },
  { name: "Ricochet", brief: "Two burns. Timing is everything.", budget: 14, time: 70, ship: [2, 4], portal: [5, 3], rocks: [[5, 2], [3, 1], [6, 1], [2, 2]] },
  { name: "High Orbit", brief: "Climb against the pull, then cross the void.", budget: 18, time: 90, ship: [1, 3], portal: [5, 0], rocks: [[6, 4], [0, 3], [1, 5], [4, 3]] },
  { name: "Gravity Well", brief: "Three burns, one solution. Think ahead.", budget: 22, time: 110, ship: [4, 4], portal: [0, 2], rocks: [[3, 2], [2, 4], [0, 1], [5, 3], [1, 5]] },
];

export function makeGrid(level: Level): Cell[][] {
  const g: Cell[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  level.rocks.forEach(([x, y]) => (g[y]![x] = "rock"));
  return g;
}
export const makeDirs = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(1) as number[]);

const isMod = (c: Cell): c is ModType => c === "thruster" || c === "shield" || c === "comms";
export function facesShip(dirs: number[][], x: number, y: number, ship: Vec) {
  const direction = DIRS[dirs[y]?.[x] ?? 1];
  return !!direction && x + direction[0] === ship[0] && y + direction[1] === ship[1];
}
const N4: Vec[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function neighbours(g: Cell[][], [sx, sy]: Vec) {
  return N4.map(([dx, dy]) => ({ x: sx + dx, y: sy + dy, c: g[sy + dy]?.[sx + dx] ?? null })).filter((n) => isMod(n.c));
}

/** A thruster clipped onto an anchor or bumper spins that module one step clockwise. */
export function spinAttached(g: Cell[][], dirs: number[][]): number[][] {
  const next = dirs.map((row) => row.slice());
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const c = g[y]?.[x];
    if (c !== "shield" && c !== "comms") continue;
    if (N4.some(([dx, dy]) => g[y + dy]?.[x + dx] === "thruster")) next[y]![x] = ((dirs[y]?.[x] ?? 0) + 1) % 4;
  }
  return next;
}

/** A thruster's direction is where its flame points; it pushes only when the flame points away from the ship. */
export function thrusterPushes(dirs: number[][], x: number, y: number, ship: Vec) {
  const flame = DIRS[dirs[y]?.[x] ?? 1];
  return !!flame && x - ship[0] === flame[0] && y - ship[1] === flame[1];
}

export type StepResult = { ship: Vec; vel: Vec; event: "move" | "blocked" | "held" | "stalled" | "portal" | "blackhole" | "overload" };

/** One tick of the simulation. Rules are applied in this order. */
export function step(g: Cell[][], dirs: number[][], level: Level, ship: Vec, vel: Vec): StepResult {
  const [sx, sy] = ship;
  const adj = neighbours(g, ship);
  // 1. Overload: three or more modules touching the ship tear it apart
  if (adj.length >= 3) return { ship, vel: [0, 0], event: "overload" };
  // 2. Only an anchor's illuminated face holds the ship.
  if (adj.some((n) => n.c === "shield" && facesShip(dirs, n.x, n.y, ship))) return { ship, vel: [0, 0], event: "held" };

  let v: Vec = vel;
  // 3. A touching thruster must have its flame pointing straight away from the ship, like an engine.
  //    Facing any other way it jams the ship in place: no drift, no black-hole pull, until it is turned.
  const thrusters = adj.filter((n) => n.c === "thruster");
  if (thrusters.some((n) => !thrusterPushes(dirs, n.x, n.y, ship))) return { ship, vel: [0, 0], event: "stalled" };
  if (thrusters.length) v = thrusters.reduce<Vec>((a, n) => [a[0] + (sx - n.x), a[1] + (sy - n.y)], [0, 0]);
  // 4. A touching anchor facing the wrong way shoves the ship one square the way it points, then the ship stops.
  //    Pointing straight away from the ship it would shove the ship into itself, so the ship is jammed instead.
  const anchor = thrusters.length ? undefined : adj.find((n) => n.c === "shield");
  let shoved = false;
  if (anchor) {
    const push = DIRS[dirs[anchor.y]?.[anchor.x] ?? 1]!;
    if (anchor.x - sx === push[0] && anchor.y - sy === push[1]) return { ship, vel: [0, 0], event: "stalled" };
    v = push; shoved = true;
  }
  // 5. Not moving at all? The black hole pulls it down
  if (v[0] === 0 && v[1] === 0) v = [0, 1];
  v = Math.abs(v[0]) > Math.abs(v[1]) ? [Math.sign(v[0]), 0] : [0, Math.sign(v[1])];

  const nx = sx + v[0], ny = sy + v[1];
  if (nx === level.portal[0] && ny === level.portal[1]) return { ship: [nx, ny], vel: v, event: "portal" };
  if (ny >= HORIZON_Y && nx >= 0 && nx < SIZE) return { ship: [nx, ny], vel: v, event: "blackhole" };
  // A shove that runs into anything (wall, rock, module) just jams the ship against it.
  if (shoved && (nx < 0 || nx >= SIZE || ny < 0 || g[ny]?.[nx])) return { ship, vel: [0, 0], event: "stalled" };
  // 6. Bumpers: hitting the padded face bounces the ship straight back. Hitting any other side jams it:
  //    the ship keeps pressing into the bumper (so the black hole can't pull it) until the pad is turned to face it.
  if (g[ny]?.[nx] === "comms") {
    if (facesShip(dirs, nx, ny, ship)) return { ship, vel: [-v[0] || 0, -v[1] || 0], event: "blocked" };
    return { ship, vel: v, event: "stalled" };
  }
  if (nx < 0 || nx >= SIZE || ny < 0 || g[ny]?.[nx]) return { ship, vel: [0, 0], event: "blocked" };
  return { ship: [nx, ny], vel: shoved ? [0, 0] : v, event: "move" };
}

/** Run a full flight with no mid-flight changes. */
export function simulate(g: Cell[][], dirs: number[][], level: Level, max = 60) {
  let s: Vec = level.ship, v: Vec = [0, 0], d = dirs;
  for (let i = 0; i < max; i++) {
    const r = step(g, d, level, s, v);
    if (r.event === "portal" || r.event === "blackhole" || r.event === "overload") return r.event;
    if (r.event === "held" || r.event === "stalled") return "stuck";
    s = r.ship; v = r.vel;
    d = spinAttached(g, d);
  }
  return "stuck";
}

/** Removing restores the full purchase cost; rotating is free. */
export const refund = (m: ModType) => MODS[m].cost;
