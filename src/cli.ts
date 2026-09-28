import { parseLife106 } from "./parser.js";
import { serializeLife106 } from "./serializer.js";
import { run } from "./simulation.js";

const GENERATIONS = 10;

async function readStdin(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function main(
  stdin: NodeJS.ReadableStream,
  stdout: NodeJS.WritableStream,
): Promise<void> {
  const input = await readStdin(stdin);
  const initial = parseLife106(input);
  const final = run(initial, GENERATIONS);
  stdout.write(serializeLife106(final));
}
