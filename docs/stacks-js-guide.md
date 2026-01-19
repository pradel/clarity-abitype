# Using with stacks.js

The `@stacks/transactions` package is the official library for interacting with the Stacks blockchain. It handles transaction creation, signing, and broadcasting.

**clarity-abitype** provides typed wrapper functions that call the underlying stacks.js functions for you. These wrappers add compile-time type safety for function names, arguments, and return types.

## Installation

```bash
npm install @stacks/transactions clarity-abitype
```

## Getting Your Contract ABI

Fetch your contract ABI from the Hiro API and define it with a `const` assertion to enable type inference:

```ts
import { fetchAbi } from "@stacks/transactions";

const response = await fetch(
  "https://api.mainnet.hiro.so/v2/contracts/interface/SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR/my-token",
);
const abi = (await response.json()) as const;
```

## Making Public Calls

Use `typedMakeContractCall` to create and sign a transaction. This function wraps `makeContractCall` from stacks.js.

```ts
import { typedMakeContractCall } from "clarity-abitype";
import { broadcastTransaction } from "@stacks/transactions";

const transaction = await typedMakeContractCall({
  abi,
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
  abi,
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
