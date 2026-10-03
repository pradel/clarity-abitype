---
"clarity-abitype": minor
---

Added `clarity-abitype` CLI with `init` and `generate` commands. `generate` reads a `clarity.config.ts` contract list, fetches ABIs from the Stacks API, and writes a TypeScript file with `as const` ABI declarations.
