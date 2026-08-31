# Using with Clarinet SDK

The `@stacks/clarinet-sdk` package provides a local simulation network (simnet) for testing your contracts. It lets you call functions and mine blocks without deploying to a live network.

**clarity-abitype** provides typed wrapper functions that call the underlying Clarinet SDK functions for you. These wrappers add compile-time type safety for function names, arguments, and return types.

## Installation

```bash
npm install @stacks/clarinet-sdk clarity-abitype
```

## Setting Up the Simnet

Initialize the simnet and get accounts for testing:

```ts
import { initSimnet } from "@stacks/clarinet-sdk";

const simnet = await initSimnet();
const accounts = simnet.getAccounts();

const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
```

## Generating Your Contract ABI

For local contracts in Clarinet, you need to define the ABI manually. There is currently no way to directly generate the ABI from clarinet but you can call `simnet.getContractsInterfaces()` as a workaround to get the ABI. Then add the ABI to your test file:

```ts
const counterAbi = {
  functions: [
    {
      name: "increment",
      access: "public",
      args: [],
      outputs: { type: { response: { ok: "bool", error: "none" } } },
    },
    {
      name: "get-count",
      access: "read_only",
      args: [{ name: "who", type: "principal" }],
      outputs: { type: "uint128" },
    },
  ],
  variables: [],
  maps: [],
  fungible_tokens: [],
  non_fungible_tokens: [],
} as const;
```

**Note:** The `as const` assertion is required for type inference to work.

## Calling Public Functions

Use `callPublicFn` to call public functions. This function wraps `simnet.callPublicFn` and mines a block.

```ts
import { callPublicFn } from "clarity-abitype/clarinet-sdk";

const { result, events } = callPublicFn({
  simnet,
  abi: counterAbi,
  contract: "counter",
  functionName: "increment",
  functionArgs: [],
  sender: deployer,
});
// Result type: { ok: boolean } | { error: uint128 }
```

### What happens under the hood

1. Looks up the function in your ABI to get argument types
2. Converts your TypeScript values to ClarityValues
3. Calls Clarinet SDK's `simnet.callPublicFn`
4. Converts the result back to a TypeScript primitive
5. Returns `{ result, events }` with typed result

## Read-Only Calls

Use `callReadOnlyFn` to query contract state. This wraps `simnet.callReadOnlyFn`.

```ts
import { callReadOnlyFn } from "clarity-abitype/clarinet-sdk";

const { result } = callReadOnlyFn({
  simnet,
  abi: counterAbi,
  contract: "counter",
  functionName: "get-count",
  functionArgs: [deployer],
  sender: deployer,
});
// Result type: uint128
```

### What happens under the hood

1. Looks up the function in your ABI to get argument and return types
2. Converts your TypeScript values to ClarityValues
3. Calls Clarinet SDK's `simnet.callReadOnlyFn`
4. Converts the result back to a TypeScript primitive
5. Returns `{ result }` with typed result

## Type Safety Benefits

- **Function names** are autocomplete-enabled and validated at compile time
- **Arguments** are typed to match the ABI, no more wrong types or counts
- **Return types** are inferred, response types become discriminated unions
- **Structured Error diagnostics** provide clear error messages (`AbiFunctionNotFoundError`, `AbiArgumentMismatchError`)
