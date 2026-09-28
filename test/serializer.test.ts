import assert from "node:assert/strict";
import { test } from "node:test";

import { parseLife106 } from "../src/parser.js";
import { serializeLife106 } from "../src/serializer.js";

test("empty set serializes to just the header", () => {
  assert.equal(serializeLife106(new Set()), "#Life 1.06\n");
});

test("output is sorted by x then y", () => {
  const cells = new Set(["5,5", "-3,10", "-3,-1", "0,0"]);
  const output = serializeLife106(cells);
  assert.equal(output, "#Life 1.06\n-3 -1\n-3 10\n0 0\n5 5\n");
});

test("round-trips through parse -> serialize -> parse", () => {
  const input = [
    "#Life 1.06",
    "0 1",
    "1 2",
    "2 0",
    "-9223372036854775808 9223372036854775807",
    "",
  ].join("\n");

  const parsed = parseLife106(input);
  const reparsed = parseLife106(serializeLife106(parsed));

  assert.deepEqual([...reparsed].sort(), [...parsed].sort());
});
