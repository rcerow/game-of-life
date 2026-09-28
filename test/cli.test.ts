import assert from "node:assert/strict";
import { Readable, Writable } from "node:stream";
import { test } from "node:test";

import { main } from "../src/cli.js";

function collectingWritable(): { stream: Writable; text: () => string } {
  const chunks: Buffer[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      callback();
    },
  });
  return { stream, text: () => Buffer.concat(chunks).toString("utf8") };
}

test("runs 10 generations of a still life end-to-end and prints Life 1.06", async () => {
  const input = ["#Life 1.06", "0 0", "1 0", "0 1", "1 1", ""].join("\n");
  const { stream: stdout, text } = collectingWritable();

  await main(Readable.from(input), stdout);

  assert.equal(text(), "#Life 1.06\n0 0\n0 1\n1 0\n1 1\n");
});

test("runs 10 generations of a blinker (even period, returns to original phase)", async () => {
  const input = ["#Life 1.06", "1 0", "1 1", "1 2", ""].join("\n");
  const { stream: stdout, text } = collectingWritable();

  await main(Readable.from(input), stdout);

  assert.equal(text(), "#Life 1.06\n1 0\n1 1\n1 2\n");
});

test("empty input produces header-only output", async () => {
  const { stream: stdout, text } = collectingWritable();

  await main(Readable.from("#Life 1.06\n"), stdout);

  assert.equal(text(), "#Life 1.06\n");
});

test("the spec's sample input: a glider plus a distant L-tromino, after 10 generations", async () => {
  // The first 5 cells form a glider, which travels diagonally and repeats
  // its shape (5 live cells) every 4 generations. The 3 distant cells form
  // an L-tromino, which is one step short of a still-life block (see the
  // "reproduction" test in simulation.test.ts) and settles into one
  // immediately, staying put for the remaining generations.
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
  const { stream: stdout, text } = collectingWritable();

  await main(Readable.from(input), stdout);

  assert.equal(
    text(),
    [
      "#Life 1.06",
      "-2000000000001 -2000000000001",
      "-2000000000001 -2000000000000",
      "-2000000000000 -2000000000001",
      "-2000000000000 -2000000000000",
      "3 4",
      "4 2",
      "4 4",
      "5 3",
      "5 4",
      "",
    ].join("\n"),
  );
});
