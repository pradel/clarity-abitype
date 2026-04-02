# clarity-abitype

Strict TypeScript types for Clarity ABIs. Provides utilities and type definitions for [Clarity](https://docs.stacks.co/clarity) smart contract ABIs on the [Stacks](https://www.stacks.co/) blockchain.

## Documentation

[Head to the documentation](https://pradel.github.io/clarity-abitype/) to read and learn more about the package.

## Installation

```bash
npm install clarity-abitype
# or
pnpm add clarity-abitype
# or
yarn add clarity-abitype
```

## Usage

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

## Credits

clarity-abitype initial implementation is based on the amazing work of [abitype](https://github.com/wevm/abitype) by [wevm](https://github.com/wevm).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

- Check everything is ready:

```bash
vp run ready
```

- Run the tests:

```bash
vp run -r test
```

- Build the monorepo:

```bash
vp run -r build
```

## License

MIT
