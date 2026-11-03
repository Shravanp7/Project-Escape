import { describe, expect, it } from "vitest";
import { LEVELS, MODS, makeDirs, makeGrid, refund, simulate, spinAttached, step, type Cell, type ModType } from "./engine";

type Mod = [number, number, Cell, number];
const build = (li: number, mods: Mod[]) => {
  const g = makeGrid(LEVELS[li]!), d = makeDirs();
  mods.forEach(([x, y, k, dir]) => { g[y]![x] = k; d[y]![x] = dir; });
  return { g, d };
};

/** Solver-verified cheapest solutions (brute force over every placement). */
const SOLUTIONS: Mod[][] = [
  [[0, 2, "thruster", 3]],
  [[6, 2, "thruster", 1], [1, 1, "thruster", 0]],
  [[2, 5, "comms", 0], [1, 3, "thruster", 3]],
  [[0, 4, "thruster", 3], [5, 5, "comms", 0]],
  [[4, 5, "comms", 0], [5, 1, "thruster", 1], [2, 3, "thruster", 1], [0, 5, "comms", 0]],
];
const costOf = (mods: Mod[]) => mods.reduce((s, m) => s + MODS[m[2] as ModType].cost, 0);

describe("drift rules", () => {
  it("ends with Gravity Well after five missions, without Free Drift", () => {
    expect(LEVELS.length).toBe(5);
    expect(LEVELS.at(-1)?.name).toBe("Gravity Well");
    expect(LEVELS.some((level) => level.name === "Free Drift")).toBe(false);
  });
  it.each([["thruster", 2], ["shield", 3], ["comms", 1]] as const)("removing %s restores its full %i-coin cost", (module, price) => {
    expect(price - price + refund(module)).toBe(price);
    expect(refund(module)).toBe(price);
  });
  it.each([0, 1, 2, 3])("anchor direction %i holds only its facing square", (dir) => {
    const vectors = [[0, -1], [1, 0], [0, 1], [-1, 0]] as const;
    const vector = vectors[dir];
    if (!vector) throw new Error("missing direction");
    const { g, d } = build(0, [[3, 3, "shield", dir]]);
    expect(step(g, d, LEVELS[0]!, [3 + vector[0], 3 + vector[1]], [1, 0]).event).toBe("held");
    expect(step(g, d, LEVELS[0]!, [3 - vector[0], 3 - vector[1]], [1, 0]).event).not.toBe("held");
  });
  it("a sideways anchor shoves the ship one square the way it points, then the ship stops", () => {
    const { g, d } = build(0, [[3, 4, "shield", 1]]); // below the ship, pointing right
    const r = step(g, d, LEVELS[0]!, [3, 3], [0, 0]);
    expect(r.event).toBe("move");
    expect(r.ship).toEqual([4, 3]);
    expect(r.vel).toEqual([0, 0]);
  });
  it("an anchor pointing straight away from the ship jams it instead of letting it fall", () => {
    const { g, d } = build(0, [[3, 4, "shield", 2]]); // below the ship, pointing down
    const r = step(g, d, LEVELS[0]!, [3, 3], [0, 0]);
    expect(r.event).toBe("stalled");
    expect(r.ship).toEqual([3, 3]);
  });
  it.each([0, 1, 2, 3])("bumper direction %i bounces the ship off its padded face", (dir) => {
    const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][dir]!;
    const { g, d } = build(0, [[3, 3, "comms", dir]]);
    const bounced = step(g, d, LEVELS[0]!, [3 + dx!, 3 + dy!], [-dx! || 0, -dy! || 0]);
    expect(bounced.ship).toEqual([3 + dx!, 3 + dy!]);
    expect(bounced.vel).toEqual([dx, dy]);
    expect(bounced.event).toBe("blocked");
  });
  it.each([0, 1, 2, 3])("bumper direction %i freezes a ship that hits its back", (dir) => {
    const [dx, dy] = [[0, -1], [1, 0], [0, 1], [-1, 0]][dir]!;
    const { g, d } = build(0, [[3, 3, "comms", dir]]);
    const r = step(g, d, LEVELS[0]!, [3 - dx!, 3 - dy!], [dx!, dy!]);
    expect(r.event).toBe("stalled");
    expect(r.ship).toEqual([3 - dx!, 3 - dy!]);
  });
  it("a ship jammed on a bumper's side stays put instead of falling", () => {
    const { g, d } = build(0, [[3, 4, "comms", 1]]);
    let ship: [number, number] = [3, 3], vel: [number, number] = [0, 0];
    for (let i = 0; i < 3; i++) {
      const r = step(g, d, LEVELS[0]!, ship, [0, 0]);
      expect(r.event).toBe("stalled");
      ship = r.ship; vel = r.vel;
      const again = step(g, d, LEVELS[0]!, ship, vel);
      expect(again.event).toBe("stalled");
      expect(again.ship).toEqual([3, 3]);
    }
  });
  it("a still ship falls into the black hole", () => {
    const { g, d } = build(2, []);
    expect(simulate(g, d, LEVELS[2]!)).toBe("blackhole");
  });
  it("a thruster with its flame pointing away from the ship pushes it forward", () => {
    const away = build(1, [[6, 2, "thruster", 1]]);
    expect(step(away.g, away.d, LEVELS[1]!, [5, 2], [0, 0]).ship).toEqual([4, 2]);
  });
  it.each([0, 1, 2])("a touching thruster facing direction %i freezes the ship in place", (dir) => {
    const { g, d } = build(0, [[0, 2, "thruster", dir]]);
    const r = step(g, d, LEVELS[0]!, [1, 2], [1, 0]);
    expect(r.event).toBe("stalled");
    expect(r.ship).toEqual([1, 2]);
    expect(r.vel).toEqual([0, 0]);
  });
  it("a wrongly facing thruster stops the black hole pulling the ship down", () => {
    const { g, d } = build(0, [[0, 2, "thruster", 0]]);
    expect(simulate(g, d, LEVELS[0]!)).toBe("stuck");
  });
  it("three modules touching the ship overload it", () => {
    const { g, d } = build(1, [[6, 2, "comms", 1], [4, 2, "comms", 1], [5, 1, "comms", 1]]);
    expect(simulate(g, d, LEVELS[1]!)).toBe("overload");
  });
  it("coins start at 6 and grow by 4 each mission", () => {
    expect(LEVELS.map((level) => level.budget)).toEqual([6, 10, 14, 18, 22]);
  });
  it("the clock starts at 30s and grows by 20s each mission", () => {
    expect(LEVELS.map((level) => level.time)).toEqual([30, 50, 70, 90, 110]);
  });
  it("every mission is solvable within its budget", () => {
    SOLUTIONS.forEach((mods, li) => {
      const { g, d } = build(li, mods);
      expect(costOf(mods)).toBeLessThanOrEqual(LEVELS[li]!.budget);
      expect(simulate(g, d, LEVELS[li]!)).toBe("portal");
    });
  });
  it("recorded solutions cost exactly the cheapest the solver found", () => {
    expect(SOLUTIONS.map(costOf)).toEqual([2, 4, 3, 3, 6]);
  });
  it("a thruster clipped onto a bumper turns it one step clockwise", () => {
    const { g, d } = build(0, [[3, 3, "comms", 0], [4, 3, "thruster", 1]]);
    expect(spinAttached(g, d)[3]?.[3]).toBe(1);
  });
  it("a module with no thruster next to it keeps its facing", () => {
    const { g, d } = build(0, [[3, 3, "shield", 0]]);
    expect(spinAttached(g, d)[3]?.[3]).toBe(0);
  });
});

import { step as stepRule, LEVELS as L2, SIZE as S2 } from "./engine";
it("thruster with exhaust pointing away still pushes the ship forward", () => {
  const g = Array.from({ length: S2 }, () => Array(S2).fill(null));
  const dirs = Array.from({ length: S2 }, () => Array(S2).fill(0));
  g[2]![0] = "thruster"; dirs[2]![0] = 3; // left-facing exhaust, ship at [1,2]
  const r = stepRule(g, dirs, L2[0]!, [1, 2], [0, 0]);
  expect(r.ship).toEqual([2, 2]);
});
