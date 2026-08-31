---
"clarity-abitype": minor
---

Align naming conventions and modernize API:

- **Register & Type Configuration**: Converted `Register` / `ResolvedRegister` / `DefaultRegister` keys to PascalCase (`AddressType`, `BigIntType`, `BytesType`, `FixedArrayMinLength`, `FixedArrayMaxLength`, `ListMaxDepth`, `StrictAbiType`).
- **Function and Parameter Naming**: Removed `typed*`/`Typed*` prefixes from integration functions and parameter types:
  - `clarity-abitype/clarinet-sdk`: `callPublicFn`, `callReadOnlyFn` (and `CallPublicFnParameters`, `CallReadOnlyFnParameters`, etc.)
  - `clarity-abitype/stacks-js`: `makeContractCall`, `callReadOnlyFunction` (and `MakeContractCallParameters`, `CallReadOnlyFunctionParameters`, etc.)
  - `clarity-abitype/stacks-connect`: `callContract` (and `CallContractParameters`, etc.)
- **Utilities**: Added `ContractFunctionParameters` generic helper.
- **File Structure**: Renamed integration source and test files to camelCase.
