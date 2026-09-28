import { type CellKey, coordinateOf } from "./cell.js";

/** Sorted by (x, y) so output is deterministic regardless of Set iteration order. */
export function serializeLife106(cells: ReadonlySet<CellKey>): string {
  const coordinates = [...cells].map(coordinateOf);
  coordinates.sort((a, b) => {
    if (a.x !== b.x) return a.x < b.x ? -1 : 1;
    if (a.y !== b.y) return a.y < b.y ? -1 : 1;
    return 0;
  });

  const lines = ["#Life 1.06", ...coordinates.map((c) => `${c.x} ${c.y}`)];
  return lines.join("\n") + "\n";
}
