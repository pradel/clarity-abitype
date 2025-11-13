# clarity-abitype

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
