# clarity-abitype

Strict TypeScript types for Clarity ABIs. Provides utilities and type definitions for [Clarity](https://docs.stacks.co/clarity) smart contract ABIs on the [Stacks](https://www.stacks.co/) blockchain.

```ts
import type {
  ClarityAbiArgsToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "clarity-abitype";
import { sip10Abi } from "clarity-abitype/abis";

type FunctionNames = ExtractAbiFunctionNames<typeof sip10Abi, "read_only">;
//   ^? type FunctionNames = "get-balance" | "get-decimals" | "get-name" | "get-symbol" | ...

type TransferInputTypes = ClarityAbiArgsToPrimitiveTypes<
  // ^? type TransferInputTypes = readonly [bigint, string, string, `0x${string}` | null]
  ExtractAbiFunction<typeof sip10Abi, "transfer">["args"]
>;
```

Works great for adding blazing fast autocomplete and type checking to functions, variables, or your own types. No need to generate types with third-party tools – just use your ABI and let TypeScript do the rest!

## Installation

```bash
npm install clarity-abitype
# or
pnpm add clarity-abitype
# or
yarn add clarity-abitype
```

## Quick Start

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

## Examples

### Typed Contract Calls

```ts
import type {
  ClarityAbi,
  ClarityAbiFunction,
  ClarityAbiArgsToPrimitiveTypes,
  ClarityAbiOutputToPrimitiveType,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "clarity-abitype";

function createContractCall<
  abi extends ClarityAbi,
  functionName extends ExtractAbiFunctionNames<abi, "public">,
  abiFunction extends ClarityAbiFunction = ExtractAbiFunction<
    abi,
    functionName
  >,
>(config: {
  abi: abi;
  functionName: functionName | ExtractAbiFunctionNames<abi, "public">;
  functionArgs: ClarityAbiArgsToPrimitiveTypes<abiFunction["args"]>;
}): ClarityAbiOutputToPrimitiveType<abiFunction["outputs"]> {
  // Implementation with full type safety
}

// Usage - args are fully typed!
// Return type is inferred as: { ok: boolean } | { error: bigint }
const result = createContractCall({
  abi: sip10Abi,
  functionName: "transfer",
  functionArgs: [
    1000n, // amount: bigint
    "SP2C2YFP...", // sender: string
    "SP3FBR2AGK...", // recipient: string
    null, // memo: `0x${string}` | null
  ],
});
```

### Type-safe Read Calls

```ts
import type {
  ClarityAbiOutputToPrimitiveType,
  ExtractAbiFunction,
} from "clarity-abitype";

async function callReadOnlyFunction<
  abi extends ClarityAbi,
  functionName extends ExtractAbiFunctionNames<abi, "read_only">,
  abiFunction extends ClarityAbiFunction = ExtractAbiFunction<
    abi,
    functionName
  >,
>(config: {
  abi: abi;
  functionName: functionName | ExtractAbiFunctionNames<abi, "read_only">;
  functionArgs: ClarityAbiArgsToPrimitiveTypes<abiFunction["args"]>;
}): Promise<ClarityAbiOutputToPrimitiveType<abiFunction["outputs"]>> {
  // Implementation
}

// Return type is inferred as: { ok: bigint } | { error: null }
const balance = await callReadOnlyFunction({
  abi: sip10Abi,
  functionName: "get-balance",
  functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
});
```

## Credits

clarity-abitype initial implementation is based on the amazing work of [abitype](https://github.com/wevm/abitype) by [wevm](https://github.com/wevm).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
