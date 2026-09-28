import { type CellKey, NEIGHBOR_OFFSETS, coordinateOf, keyOf } from "./cell.js";

/**
 * A coordinate's neighbor-count tally, once every live cell has voted, is
 * exactly its number of live neighbors — including for dead coordinates,
 * since only live cells cast votes. That single tally is enough to decide
 * both Life rules in one pass: count === 3 means alive next generation
 * (survives or is born); count === 2 means alive only if it already was.
 */
export function step(liveCells: ReadonlySet<CellKey>): Set<CellKey> {
  const neighborCounts = new Map<CellKey, number>();

  for (const key of liveCells) {
    const { x, y } = coordinateOf(key);
    for (const [dx, dy] of NEIGHBOR_OFFSETS) {
      const neighborKey = keyOf(x + dx, y + dy);
      neighborCounts.set(neighborKey, (neighborCounts.get(neighborKey) ?? 0) + 1);
    }
  }

  const nextGeneration = new Set<CellKey>();
  for (const [key, count] of neighborCounts) {
    if (count === 3 || (count === 2 && liveCells.has(key))) {
      nextGeneration.add(key);
    }
  }

  return nextGeneration;
}

/** Runs `generations` ticks of the simulation and returns the final board. */
export function run(liveCells: ReadonlySet<CellKey>, generations: number): Set<CellKey> {
  let board = new Set(liveCells);
  for (let i = 0; i < generations; i++) {
    board = step(board);
  }
  return board;
}
