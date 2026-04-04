# Using with stacks-connect

The `@stacks/connect` package is the official library for integrating with the Stacks Wallet. It opens the wallet to sign and broadcast transactions on behalf of users.

**clarity-abitype** provides typed wrapper functions that call the underlying @stacks/connect functions for you. These wrappers add compile-time type safety for function names, arguments, and return types.

## Installation

```bash
npm install @stacks/connect clarity-abitype
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

## Making Contract Calls

Use `typedCallContract` to open the Stacks Wallet and submit a contract call transaction. This function wraps the `stx_callContract` method from @stacks/connect.

```ts
import { typedCallContract } from "clarity-abitype/stacks-connect";

const txId = await typedCallContract({
  abi: myTokenAbi,
  contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
  contractName: "my-token",
  functionName: "transfer",
  functionArgs: [
    1000n, // amount: uint128
    "SP2C...", // sender: principal
    "SP3K...", // recipient: principal
    null, // memo (optional): `0x${string}` | null
  ],
  network: "mainnet",
  postConditionMode: "deny",
  postConditions: [],
});

// txId is the transaction ID returned by the wallet
```

### What happens under the hood

1. Looks up the function in your ABI to get argument types
2. Converts your TypeScript values to ClarityValues automatically
3. Opens the Stacks Wallet with the transaction details
4. After the user signs, returns the transaction ID

## Type Safety Benefits

- **Function names** are autocomplete-enabled and validated at compile time
- **Arguments** are typed to match the ABI, no more wrong types or counts
- **Return types** are inferred, the txId is typed as a string
