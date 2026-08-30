# Using with stacks.js

The `@stacks/transactions` package is the official library for interacting with the Stacks blockchain. It handles transaction creation, signing, and broadcasting.

**clarity-abitype** provides typed wrapper functions that call the underlying stacks.js functions for you. These wrappers add compile-time type safety for function names, arguments, and return types.

## Installation

```bash
npm install @stacks/transactions clarity-abitype
```

## Downloading the ABI

Fetch your contract ABI from the Hiro API:

```bash
curl "https://api.mainnet.hiro.so/v2/contracts/interface/SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR/my-token"
```

Save the response to a file like `abis/my-token.ts` and add `as const`:

```ts
// abis/my-token.ts
export const myTokenAbi = {
  // ... paste the ABI JSON here ...
} as const;
```

## Getting Your Contract ABI

For type inference to work, the ABI must be defined inline in your codebase with a `const` assertion. This allows TypeScript to see the exact structure at compile time.

Save the ABI JSON to a file in your project:

```ts
// abis/my-token.ts
export const myTokenAbi = {
  functions: [
    {
      name: "transfer",
      access: "public",
      args: [
        { name: "amount", type: "uint128" },
        { name: "sender", type: "principal" },
        { name: "recipient", type: "principal" },
        { name: "memo", type: { optional: "buff-33" } },
      ],
      outputs: { type: { response: { ok: "bool", error: "uint128" } } },
    },
    {
      name: "get-balance",
      access: "read_only",
      args: [{ name: "owner", type: "principal" }],
      outputs: { type: { response: { ok: "uint128", error: "none" } } },
    },
  ],
  variables: [],
  maps: [],
  fungible_tokens: [{ name: "my-token" }],
  non_fungible_tokens: [],
} as const;
```

Then import it in your code:

```ts
import { myTokenAbi } from "./abis/my-token";
```

## Contract Abstraction with `getContract`

You can create a typed contract instance using `getContract`:

```ts
import { getContract } from "clarity-abitype/stacks-js";

const contract = getContract({
  abi: myTokenAbi,
  contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
  contractName: "my-token",
  network: "mainnet",
});

// Read-only call
const balance = await contract.read["get-balance"]({
  functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
  senderAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
});

// Create & sign transaction
const tx = await contract.call.transfer({
  functionArgs: [1000n, "SP2C...", "SP3K...", null],
  senderKey: "your-private-key",
});
```

## Standalone Function Calls

### Making Public Calls

Use `typedMakeContractCall` to create and sign a transaction. This function wraps `makeContractCall` from stacks.js.

```ts
import { typedMakeContractCall } from "clarity-abitype/stacks-js";
import { broadcastTransaction } from "@stacks/transactions";

const transaction = await typedMakeContractCall({
  abi: myTokenAbi,
  contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
  contractName: "my-token",
  functionName: "transfer",
  functionArgs: [
    1000n, // amount: bigint
    "SP2C...", // sender: string
    "SP3K...", // recipient: string
    null, // memo (optional): `0x${string}` | null
  ],
  senderKey: "your-private-key",
  network: "mainnet",
});

const result = await broadcastTransaction({ transaction, network: "mainnet" });
```

### Read-Only Calls

Use `typedCallReadOnlyFunction` to query contract state. This function wraps `fetchCallReadOnlyFunction` from stacks.js.

```ts
import { typedCallReadOnlyFunction } from "clarity-abitype/stacks-js";

const balance = await typedCallReadOnlyFunction({
  abi: myTokenAbi,
  contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
  contractName: "my-token",
  functionName: "get-balance",
  functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
  senderAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
});
// Result type: { ok: bigint } | { error: uint128 }
```

## Type Safety Benefits

- **`getContract` instance** creates intuitive `.read` and `.call` method proxies
- **Function names** are autocomplete-enabled and validated at compile time
- **Arguments** are typed to match the ABI, no more wrong types or counts
- **Return types** are inferred, response types become discriminated unions
- **Structured Error diagnostics** provide clear error messages (`AbiFunctionNotFoundError`, `AbiArgumentMismatchError`)
