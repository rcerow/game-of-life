# Conway's Game of Life

Conway's Game of Life over the full signed 64-bit integer coordinate space.
Reads live cells in Life 1.06 format from stdin, runs 10 generations, and
writes the result back out in the same format.

## Requirements

Node.js >= 18

## Running

```sh
npm install
npm run build
cat examples/glider.life | npm start
```

`examples/glider.life` ships in this repo, so the command above works as-is.
Or pipe input directly:

```sh
printf '#Life 1.06\n0 1\n1 2\n2 0\n2 1\n2 2\n' | npm start
```

## Testing

```sh
npm test
```

Runs directly against the TypeScript sources (via `tsx`'s `node:test`
integration) — no build step required. Also available: `npm run lint`,
`npm run format`.

## Approach

The board is stored sparsely — only live cells exist, as a `Set` of `"x,y"`
string keys (`src/cell.ts`) — since the coordinate range rules out any
fixed-size grid.

Each generation (`src/simulation.ts`) tallies, for every live cell, a
neighbor count on each of its 8 surrounding coordinates. Once all live
cells have voted, a coordinate's tally is exactly its live-neighbor count,
dead or alive. Both Life rules then collapse into one pass over that
tally: count === 3 → alive; count === 2 → alive only if already alive.

Modules:

- `src/cell.ts` — `Coordinate` type and string-key encoding.
- `src/parser.ts` / `src/serializer.ts` — Life 1.06 <-> `Set<CellKey>`,
  independent of the simulation.
- `src/simulation.ts` — `step()` / `run()`, operating purely on
  `Set<CellKey>`.
- `src/cli.ts` / `src/index.ts` — stdin -> parse -> run 10 generations ->
  serialize -> stdout.

## Coordinate Representation

Coordinates are `bigint`, not `number`: JavaScript numbers only represent
integers exactly up to 2^53 - 1, well short of the signed 64-bit range
(~9.2 \* 10^18) this problem allows. Parsing builds bigints directly from
source substrings — never through `Number` — so large coordinates aren't
rounded on the way in, and the parser rejects anything outside
`[-2^63, 2^63 - 1]`.

## Complexity

For `L` live cells and `G = 10` generations: each generation is `O(L)`
time (8 tally increments per live cell, one pass over the tally) and
`O(L)` space. Nothing scales with the coordinate range — three cells a
trillion apart cost the same as three cells at the origin.
