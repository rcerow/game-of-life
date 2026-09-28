import { type CellKey, NEIGHBOR_OFFSETS, coordinateOf, keyOf } from "./cell.js";

/**
 * Advances the board one generation by tallying neighbors of live cells.
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
