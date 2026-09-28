/** Coordinates use bigint to preserve the full signed 64-bit range. */
export interface Coordinate {
  readonly x: bigint;
  readonly y: bigint;
}

/** Canonical string representation used for Set/Map identity. */
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
