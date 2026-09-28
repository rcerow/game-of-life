/**
 * A live cell's coordinate on the (conceptually) unbounded, signed 64-bit
 * integer plane. bigint is used throughout so coordinates near the edges of
 * the int64 range (and the arithmetic on their neighbors) never overflow or
 * lose precision the way `number` would past 2^53.
 */
export interface Coordinate {
  readonly x: bigint;
  readonly y: bigint;
}

/**
 * Cells are keyed by a string so they can live in a Set/Map. Template
 * literals stringify bigints exactly (no precision loss), which is why this
 * is safe even at the extremes of the int64 range.
 */
export type CellKey = string;

export function keyOf(x: bigint, y: bigint): CellKey {
  return `${x},${y}`;
}

export function coordinateOf(key: CellKey): Coordinate {
  const commaIndex = key.indexOf(",");
  const x = BigInt(key.slice(0, commaIndex));
  const y = BigInt(key.slice(commaIndex + 1));
  return { x, y };
}

export const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [bigint, bigint]> = [
  [-1n, -1n],
  [-1n, 0n],
  [-1n, 1n],
  [0n, -1n],
  [0n, 1n],
  [1n, -1n],
  [1n, 0n],
  [1n, 1n],
];
