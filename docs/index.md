# Getting Started

Strict TypeScript types for Clarity ABIs. Provides utilities and type definitions for [Clarity](https://docs.stacks.co/clarity) smart contract ABIs on the [Stacks](https://www.stacks.co/) blockchain.

## Installation

Install the package using your preferred package manager:

::: code-group

```bash [npm]
npm install clarity-abitype
```

```bash [pnpm]
pnpm add clarity-abitype
```

```bash [yarn]
yarn add clarity-abitype
```

:::

## Choose Your Integration

Select the guide based on your tooling:

- **[stacks.js](/stacks-js-guide)** — For live blockchain interactions. Use `@stacks/transactions` to build, sign, and broadcast transactions.
- **[stacks-connect](/stacks-connect-guide)** — For wallet-based interactions. Use `@stacks/connect` to open the Stacks wallet and sign transactions.
- **[Clarinet SDK](/clarinet-guide)** — For local testing. Use `@stacks/clarinet-sdk` with the simnet to test contracts without deploying.

## Direct Usage

### Getting a Contract ABI

You can fetch a Clarity contract ABI from the Stacks API:

```bash
https://api.mainnet.hiro.so/v2/contracts/interface/{contract_address}/{contract_name}
```

For example, to get the ABI for a contract:

```bash
https://api.mainnet.hiro.so/v2/contracts/interface/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4/sbtc-token
```

### Usage

To allow TypeScript to infer types from your ABI, **you need to define it with a `const` assertion**:

```ts
const myTokenAbi = [...] as const
// or
const myTokenAbi = <const>[...]
```

You can use the utilities provided by `clarity-abitype` to extract function names, definitions, and convert Clarity types to TypeScript types.

```ts
import type { ExtractAbiFunctionNames } from "clarity-abitype";

// Get all function names
type AllFunctions = ExtractAbiFunctionNames<typeof myTokenAbi>;
//   ^? "transfer" | ...

// Filter by access level
type PublicFunctions = ExtractAbiFunctionNames<typeof myTokenAbi, "public">;
//   ^? "transfer" | ...

type TransferFunction = ExtractAbiFunction<typeof myTokenAbi, "transfer">;
//   ^? { name: "transfer", access: "public", args: [...], outputs: {...} }

type TransferArgs = ClarityAbiArgsToPrimitiveTypes<
  ExtractAbiFunction<typeof myTokenAbi, "transfer">["args"]
>;
//   ^? readonly [bigint, string, string]
```
