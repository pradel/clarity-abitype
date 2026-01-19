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

## Making Public Calls

Use `typedMakeContractCall` to create and sign a transaction. This function wraps `makeContractCall` from stacks.js.

```ts
import { typedMakeContractCall } from "clarity-abitype";
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

### What happens under the hood

1. Looks up the function in your ABI to get argument types
2. Converts your TypeScript values to ClarityValues based on the ABI json
3. Calls stacks.js `makeContractCall` with the converted values
4. Returns the signed transaction ready for broadcasting

## Read-Only Calls

Use `typedCallReadOnlyFunction` to query contract state. This function wraps `fetchCallReadOnlyFunction` from stacks.js.

```ts
import { typedCallReadOnlyFunction } from "clarity-abitype";

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

### What happens under the hood

1. Looks up the function in your ABI to get argument and return types
2. Converts your TypeScript values to ClarityValues
3. Calls stacks.js `fetchCallReadOnlyFunction`
4. Converts the ClarityValue result back to a TypeScript primitive
5. Returns the typed result

## Type Safety Benefits

- **Function names** are autocomplete-enabled and validated at compile time
- **Arguments** are typed to match the ABI, no more wrong types or counts
- **Return types** are inferred, response types become discriminated unions
