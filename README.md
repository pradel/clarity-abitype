# clarity-abitype

## Download a contract ABI

You can get a Clarity contract ABI using the Stacks API: `https://api.hiro.so/extended/v1/contract/{contract_id}`

```ts
import type {
  ClarityAbiArgsToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "clarinet-abitype";
import { sip10Abi } from "clarinet-abitype/abis";

type FunctionNames = ExtractAbiFunctionNames<typeof sip10Abi, "read_only">;
//   ^? type FunctionNames = "get-balance" | "get-decimals" | "get-name" | "get-symbol" | ...

type TransferInputTypes = ClarityAbiArgsToPrimitiveTypes<
  // ^? type TransferInputTypes = readonly [bigint, string, string, Uint8Array | null]
  ExtractAbiFunction<typeof sip10Abi, "transfer">["args"]
>;
```

## Credits

clarity-abitype initial implementation is based on the work of [abitype](https://github.com/wevm/abitype).
