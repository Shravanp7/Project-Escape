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
  comms: { name: "Bumper", cost: 1, desc: "The padded face stops the ship; the other sides bounce it back." },
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
// Cheapest solver-found solutions cost 3 / 8 / 8 / 8 / 9 coins (2 modules on Training, 3 on every later mission) (thrusters fire with flame away; bumpers bounce only off the pad; wrong-facing anchors shove).
export const LEVELS: Level[] = [
  { name: "Training", brief: "One push is not enough. Find the bounce.", budget: 6, time: 30, ship: [5, 2], portal: [3, 4], rocks: [[6, 4], [6, 1], [5, 1]] },
  { name: "Cold Start", brief: "Three modules, one route. Plan every move.", budget: 10, time: 50, ship: [0, 1], portal: [5, 5], rocks: [[0, 4], [0, 0], [5, 0], [5, 2]] },
  { name: "Ricochet", brief: "The portal hides behind the rocks. Go around.", budget: 14, time: 70, ship: [0, 3], portal: [5, 4], rocks: [[5, 2], [5, 3], [6, 2], [0, 0]] },
  { name: "High Orbit", brief: "Climb against the pull, then cross the void.", budget: 18, time: 90, ship: [6, 1], portal: [1, 3], rocks: [[5, 2], [6, 3], [1, 0], [0, 4], [1, 1]] },
  { name: "Gravity Well", brief: "Walk the ship along the edge of the abyss.", budget: 22, time: 110, ship: [6, 3], portal: [3, 3], rocks: [[3, 4], [3, 1], [2, 2], [0, 0]] },
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
  // 6. Bumpers: the padded face stops the ship; the other sides bounce it straight back.
  if (g[ny]?.[nx] === "comms" && !facesShip(dirs, nx, ny, ship)) {
    return { ship, vel: [-v[0] || 0, -v[1] || 0], event: "blocked" };
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

/** Removing credits back half the purchase cost; rotating is free. */
export const refund = (m: ModType) => MODS[m].cost / 2;
