import assert from "node:assert/strict";
import { test } from "node:test";

import { run, step } from "../src/simulation.js";

function cellSet(coords: ReadonlyArray<readonly [bigint, bigint]>): Set<string> {
  return new Set(coords.map(([x, y]) => `${x},${y}`));
}

test("empty board stays empty", () => {
  assert.deepEqual(step(new Set()), new Set());
});

test("underpopulation: an isolated live cell (0 neighbors) dies", () => {
  const board = cellSet([[5n, 5n]]);
  assert.deepEqual(step(board), new Set());
});

test("underpopulation: two adjacent live cells (1 neighbor each) both die", () => {
  const board = cellSet([
    [0n, 0n],
    [1n, 0n],
  ]);
  assert.deepEqual(step(board), new Set());
});

test("overpopulation: a live cell with 4 live neighbors dies", () => {
  // A "plus" of 5 live cells: center has 4 orthogonal neighbors alive.
  const board = cellSet([
    [0n, 0n],
    [1n, 0n],
    [-1n, 0n],
    [0n, 1n],
    [0n, -1n],
  ]);
  const next = step(board);
  assert.ok(!next.has("0,0"), "center with 4 live neighbors should die");
});

test("still life: a 2x2 block is stable (each cell survives with exactly 3 neighbors)", () => {
  const block = cellSet([
    [0n, 0n],
    [1n, 0n],
    [0n, 1n],
    [1n, 1n],
  ]);
  assert.deepEqual(step(block), block);
  assert.deepEqual(run(block, 10), block);
});

test("oscillator: a blinker toggles between vertical and horizontal every generation", () => {
  const vertical = cellSet([
    [1n, 0n],
    [1n, 1n],
    [1n, 2n],
  ]);
  const horizontal = cellSet([
    [0n, 1n],
    [1n, 1n],
    [2n, 1n],
  ]);

  const afterOne = step(vertical);
  assert.deepEqual(afterOne, horizontal);

  const afterTwo = step(afterOne);
  assert.deepEqual(afterTwo, vertical);

  // Period 2, so 10 generations (even) returns to the original phase.
  assert.deepEqual(run(vertical, 10), vertical);
});

test("reproduction: an L-tromino gains a 4th cell to become a block (birth with exactly 3 neighbors, survival with exactly 2)", () => {
  const lTromino = cellSet([
    [0n, 0n],
    [1n, 0n],
    [0n, 1n],
  ]);
  const block = cellSet([
    [0n, 0n],
    [1n, 0n],
    [0n, 1n],
    [1n, 1n],
  ]);
  assert.deepEqual(step(lTromino), block);
});

test("negative coordinates behave identically to the equivalent positive-space pattern", () => {
  const block = cellSet([
    [-5n, -5n],
    [-4n, -5n],
    [-5n, -4n],
    [-4n, -4n],
  ]);
  assert.deepEqual(step(block), block);
});

test("enormous coordinates outside JS's safe-integer range simulate correctly", () => {
  const base = 9_223_372_036_854_775_800n; // within int64, well past Number.MAX_SAFE_INTEGER
  const vertical = cellSet([
    [base, base],
    [base, base + 1n],
    [base, base + 2n],
  ]);
  const horizontal = cellSet([
    [base - 1n, base + 1n],
    [base, base + 1n],
    [base + 1n, base + 1n],
  ]);
  assert.deepEqual(step(vertical), horizontal);
});

test("mixed distant populations evolve independently without interfering", () => {
  const nearBlock = cellSet([
    [0n, 0n],
    [1n, 0n],
    [0n, 1n],
    [1n, 1n],
  ]);
  const farVertical = cellSet([
    [1_000_000_000_000n, -1_000_000_000_000n],
    [1_000_000_000_000n, -999_999_999_999n],
    [1_000_000_000_000n, -999_999_999_998n],
  ]);
  const combined = new Set([...nearBlock, ...farVertical]);

  const next = step(combined);

  const expectedFarHorizontal = cellSet([
    [999_999_999_999n, -999_999_999_999n],
    [1_000_000_000_000n, -999_999_999_999n],
    [1_000_000_000_001n, -999_999_999_999n],
  ]);
  const expected = new Set([...nearBlock, ...expectedFarHorizontal]);

  assert.deepEqual(next, expected);
});
