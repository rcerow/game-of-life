import assert from "node:assert/strict";
import { test } from "node:test";

import { parseLife106 } from "../src/parser.js";

test("parses the sample input from the spec", () => {
  const input = [
    "#Life 1.06",
    "0 1",
    "1 2",
    "2 0",
    "2 1",
    "2 2",
    "-2000000000000 -2000000000000",
    "-2000000000001 -2000000000001",
    "-2000000000000 -2000000000001",
    "",
  ].join("\n");

  const cells = parseLife106(input);

  assert.equal(cells.size, 8);
  assert.ok(cells.has("0,1"));
  assert.ok(cells.has("2,2"));
  assert.ok(cells.has("-2000000000000,-2000000000000"));
  assert.ok(cells.has("-2000000000001,-2000000000001"));
});

test("parses coordinates beyond Number.MAX_SAFE_INTEGER exactly", () => {
  const input = ["#Life 1.06", "9223372036854775807 -9223372036854775808"].join("\n");

  const cells = parseLife106(input);

  assert.equal(cells.size, 1);
  assert.ok(cells.has("9223372036854775807,-9223372036854775808"));
});

test("empty input (no live cells) parses to an empty set", () => {
  assert.equal(parseLife106("").size, 0);
  assert.equal(parseLife106("#Life 1.06\n").size, 0);
  assert.equal(parseLife106("#Life 1.06\n\n\n").size, 0);
});

test("header line is optional (lenient parsing)", () => {
  const cells = parseLife106("0 0\n1 1\n");
  assert.equal(cells.size, 2);
});

test("duplicate coordinates collapse to a single live cell", () => {
  const cells = parseLife106("#Life 1.06\n0 0\n0 0\n");
  assert.equal(cells.size, 1);
});

test("rejects a mismatched header", () => {
  assert.throws(() => parseLife106("#Life 1.05\n0 0\n"), /header/);
});

test("rejects a malformed coordinate line", () => {
  assert.throws(() => parseLife106("#Life 1.06\n0 0 0\n"), /Malformed/);
  assert.throws(() => parseLife106("#Life 1.06\nabc def\n"), /Invalid integer/);
});

test("accepts coordinates exactly at the signed 64-bit boundaries", () => {
  const cells = parseLife106("#Life 1.06\n9223372036854775807 -9223372036854775808\n");
  assert.equal(cells.size, 1);
  assert.ok(cells.has("9223372036854775807,-9223372036854775808"));
});

test("rejects coordinates one past the signed 64-bit boundaries", () => {
  assert.throws(
    () => parseLife106("#Life 1.06\n9223372036854775808 0\n"),
    /outside the signed 64-bit range/,
  );
  assert.throws(
    () => parseLife106("#Life 1.06\n-9223372036854775809 0\n"),
    /outside the signed 64-bit range/,
  );
  assert.throws(
    () => parseLife106("#Life 1.06\n999999999999999999999999999999999999 0\n"),
    /outside the signed 64-bit range/,
  );
});
