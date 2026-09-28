import { type CellKey, keyOf } from "./cell.js";

const HEADER = "#Life 1.06";

const INT64_MIN = -(1n << 63n);
const INT64_MAX = (1n << 63n) - 1n;

/** Parse directly as bigint to avoid precision loss outside Number's safe integer range. */
export function parseLife106(input: string): Set<CellKey> {
  const cells = new Set<CellKey>();

  const lines = input.split(/\r\n|\r|\n/);
  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const rawLine = lines[lineNumber];
    const line = rawLine === undefined ? "" : rawLine.trim();
    if (line.length === 0) continue;
    if (line.startsWith("#")) {
      if (lineNumber === 0 && !line.startsWith(HEADER)) {
        throw new Error(`Expected "${HEADER}" header, got: "${line}"`);
      }
      continue;
    }

    const tokens = line.split(/\s+/);
    if (tokens.length !== 2) {
      throw new Error(`Malformed coordinate line ${lineNumber + 1}: "${line}" (expected "x y")`);
    }

    const [xToken, yToken] = tokens as [string, string];
    const x = parseSignedBigInt(xToken, lineNumber + 1);
    const y = parseSignedBigInt(yToken, lineNumber + 1);
    cells.add(keyOf(x, y));
  }

  return cells;
}

function parseSignedBigInt(token: string, lineNumber: number): bigint {
  if (!/^[+-]?\d+$/.test(token)) {
    throw new Error(`Invalid integer "${token}" on line ${lineNumber}`);
  }
  const value = BigInt(token);
  if (value < INT64_MIN || value > INT64_MAX) {
    throw new Error(
      `Coordinate "${token}" on line ${lineNumber} is outside the signed 64-bit range ` +
        `[${INT64_MIN}, ${INT64_MAX}]`,
    );
  }
  return value;
}
