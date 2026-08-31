# clarity-abitype

## 0.7.0

### Minor Changes

- [#49](https://github.com/pradel/clarity-abitype/pull/49) [`2b9acc8`](https://github.com/pradel/clarity-abitype/commit/2b9acc83ce7ece106cba0097c678d7f170651b18) Thanks [@pradel](https://github.com/pradel)! - Add custom error classes (`BaseError`, `AbiFunctionNotFoundError`, `AbiArgumentMismatchError`, `ContractExecutionError`) with formatted diagnostics and cause chaining.

- [#52](https://github.com/pradel/clarity-abitype/pull/52) [`3be6d4e`](https://github.com/pradel/clarity-abitype/commit/3be6d4e70f36ecaa6619a610a17036285262abb3) Thanks [@pradel](https://github.com/pradel)! - Add support for typescript v7.

- [#53](https://github.com/pradel/clarity-abitype/pull/53) [`fd47852`](https://github.com/pradel/clarity-abitype/commit/fd4785290236b30a39af8c47771d09cface14fdf) Thanks [@pradel](https://github.com/pradel)! - Align naming conventions and modernize API:

  - **Register & Type Configuration**: Converted `Register` / `ResolvedRegister` / `DefaultRegister` keys to PascalCase (`AddressType`, `BigIntType`, `BytesType`, `FixedArrayMinLength`, `FixedArrayMaxLength`, `ListMaxDepth`, `StrictAbiType`).
  - **Function and Parameter Naming**: Removed `typed*`/`Typed*` prefixes from integration functions and parameter types:
    - `clarity-abitype/clarinet-sdk`: `callPublicFn`, `callReadOnlyFn` (and `CallPublicFnParameters`, `CallReadOnlyFnParameters`, etc.)
    - `clarity-abitype/stacks-js`: `makeContractCall`, `callReadOnlyFunction` (and `MakeContractCallParameters`, `CallReadOnlyFunctionParameters`, etc.)
    - `clarity-abitype/stacks-connect`: `callContract` (and `CallContractParameters`, etc.)
  - **Utilities**: Added `ContractFunctionParameters` generic helper.
  - **File Structure**: Renamed integration source and test files to camelCase.

- [#51](https://github.com/pradel/clarity-abitype/pull/51) [`4fe56b1`](https://github.com/pradel/clarity-abitype/commit/4fe56b1b5c09e2f2b2c15060aefacd649a6120a4) Thanks [@pradel](https://github.com/pradel)! - Add core type utilities, function argument widening (`UnionWiden`), and type evaluation performance optimizations.

## 0.6.0

### Minor Changes

- [`772e3cb`](https://github.com/pradel/clarity-abitype/commit/772e3cb51484859907911c67baddeba51f4de2ca) Thanks [@pradel](https://github.com/pradel)! - Create `typedCallContract` function to provide type safe contract interaction as drop in replacements for the `@stacks/connect` `request("stx_callContract")` method. Add new stacks-connect documentation.

- [#43](https://github.com/pradel/clarity-abitype/pull/43) [`f9803ba`](https://github.com/pradel/clarity-abitype/commit/f9803bae99e8388a0df4478a58a0c8fce484d157) Thanks [@pradel](https://github.com/pradel)! - Add support for typescript v6.

## 0.5.1

### Patch Changes

- [#33](https://github.com/pradel/clarity-abitype/pull/33) [`a895081`](https://github.com/pradel/clarity-abitype/commit/a89508139fe97d680204fd6e9858e55216c55cf7) Thanks [@pradel](https://github.com/pradel)! - Improve repository tooling and publishing.

- [#34](https://github.com/pradel/clarity-abitype/pull/34) [`be2821c`](https://github.com/pradel/clarity-abitype/commit/be2821c5f806eb21a88aa91091f1b6074f3f11ab) Thanks [@pradel](https://github.com/pradel)! - Upgrade repository dependencies.

## 0.5.0

### Minor Changes

- [#29](https://github.com/pradel/clarity-abitype/pull/29) [`e0295bf`](https://github.com/pradel/clarity-abitype/commit/e0295bf0d4875e14d23379aa0ccc40eb089845e3) Thanks [@friedger](https://github.com/friedger)! - Add more epochs

## 0.4.0

### Minor Changes

- [#26](https://github.com/pradel/clarity-abitype/pull/26) [`36b827b`](https://github.com/pradel/clarity-abitype/commit/36b827b45b4cbc4e8e931e8da92d4d530bc01de3) Thanks [@pradel](https://github.com/pradel)! - Change the integrations to sub imports instead of being exposed directly.

- [`052a54a`](https://github.com/pradel/clarity-abitype/commit/052a54a611b45a2e1ebee9c4dfc760da515a6778) Thanks [@pradel](https://github.com/pradel)! - Create documentation website.

## 0.3.1

### Patch Changes

- [`b4640c6`](https://github.com/pradel/clarity-abitype/commit/b4640c6c3892dc58151bf4013ae0bda7d2be6ac4) Thanks [@pradel](https://github.com/pradel)! - Add pkg sourcemaps to build.

## 0.3.0

### Minor Changes

- [#22](https://github.com/pradel/clarity-abitype/pull/22) [`d7ff469`](https://github.com/pradel/clarity-abitype/commit/d7ff46930685f5406ceeeb0b4e1fb0f52639bd2c) Thanks [@pradel](https://github.com/pradel)! - Create `typedCallReadOnlyFn` and `typedCallPublicFn` functions to provide type safe contract interaction as drop in replacements for the clarinet-sdk `simnet.callReadOnlyFn` and `simnet.callPublicFn` methods.

- [#20](https://github.com/pradel/clarity-abitype/pull/20) [`9965bb4`](https://github.com/pradel/clarity-abitype/commit/9965bb476db63b3cf445818409eda0abc92265ca) Thanks [@pradel](https://github.com/pradel)! - Create `typedCallReadOnlyFunction` and `typedMakeContractCall` function to provide type safe contract interaction as drop in replacements for the stacks.js `callReadOnlyFunction` and `makeContractCall` functions.

### Patch Changes

- [#22](https://github.com/pradel/clarity-abitype/pull/22) [`d7ff469`](https://github.com/pradel/clarity-abitype/commit/d7ff46930685f5406ceeeb0b4e1fb0f52639bd2c) Thanks [@pradel](https://github.com/pradel)! - Add clarinet counter example.

## 0.2.2

### Patch Changes

- [#18](https://github.com/pradel/clarity-abitype/pull/18) [`aceba71`](https://github.com/pradel/clarity-abitype/commit/aceba71fa0f35c6f19549d9cc739ef79f9a1bd4e) Thanks [@pradel](https://github.com/pradel)! - Fix map type issues, add real contract tests.

## 0.2.1

### Patch Changes

- [`87b7d1e`](https://github.com/pradel/clarity-abitype/commit/87b7d1ec8ee556422a4e1d8efd0589f8f0683e84) Thanks [@pradel](https://github.com/pradel)! - Add README.md to package in npm publish step.

## 0.2.0

### Minor Changes

- [#15](https://github.com/pradel/clarity-abitype/pull/15) [`bbfe595`](https://github.com/pradel/clarity-abitype/commit/bbfe595cb1b19e88a62a3f31021306fee444153d) Thanks [@pradel](https://github.com/pradel)! - Add traits abi specification.

### Patch Changes

- [#15](https://github.com/pradel/clarity-abitype/pull/15) [`bbfe595`](https://github.com/pradel/clarity-abitype/commit/bbfe595cb1b19e88a62a3f31021306fee444153d) Thanks [@pradel](https://github.com/pradel)! - Improve list types with proper length check.

- [#15](https://github.com/pradel/clarity-abitype/pull/15) [`bbfe595`](https://github.com/pradel/clarity-abitype/commit/bbfe595cb1b19e88a62a3f31021306fee444153d) Thanks [@pradel](https://github.com/pradel)! - Improve performance of the ClarityAbiArgsToPrimitiveTypes type.

- [#15](https://github.com/pradel/clarity-abitype/pull/15) [`bbfe595`](https://github.com/pradel/clarity-abitype/commit/bbfe595cb1b19e88a62a3f31021306fee444153d) Thanks [@pradel](https://github.com/pradel)! - Fix "Type instantiation is excessively deep" errors with function args.

## 0.1.8

### Patch Changes

- [#13](https://github.com/pradel/clarity-abitype/pull/13) [`c0594a1`](https://github.com/pradel/clarity-abitype/commit/c0594a15f78cc840ee92fac102db71cd9ce9bda9) Thanks [@pradel](https://github.com/pradel)! - Fix lint issues and add more type tests.

## 0.1.7

### Patch Changes

- [#11](https://github.com/pradel/clarity-abitype/pull/11) [`6fd3e04`](https://github.com/pradel/clarity-abitype/commit/6fd3e044e02daeba9f7d98648968e8509f2eb434) Thanks [@pradel](https://github.com/pradel)! - Check arethetypeswrong on the build before publishing.

## 0.1.6

### Patch Changes

- [#9](https://github.com/pradel/clarity-abitype/pull/9) [`da4a659`](https://github.com/pradel/clarity-abitype/commit/da4a65911982600913c6435c7580a81ae37fb7e4) Thanks [@pradel](https://github.com/pradel)! - Upgrade package dependencies.

## 0.1.5

### Patch Changes

- [`7e7910e`](https://github.com/pradel/clarity-abitype/commit/7e7910e4a905d82e3f89b0c94e36eada022f98b5) Thanks [@pradel](https://github.com/pradel)! - Publish first version with CI.

## 0.1.4

### Patch Changes

- [`e34cf69`](https://github.com/pradel/clarity-abitype/commit/e34cf695851eded9f22f575250e3623f437dad1a) Thanks [@pradel](https://github.com/pradel)! - Publint before publish.

## 0.1.3

### Patch Changes

- [`8e6925e`](https://github.com/pradel/clarity-abitype/commit/8e6925e5b1ba4673ae85fb640c51f7fe011d3282) Thanks [@pradel](https://github.com/pradel)! - Publish first version with CI.

## 0.1.2

### Patch Changes

- [`8a89a76`](https://github.com/pradel/clarity-abitype/commit/8a89a760dffb3b90e838d047f354b5a7b716a020) Thanks [@pradel](https://github.com/pradel)! - Publish first version with CI.

## 0.1.1

### Patch Changes

- [`a70da7e`](https://github.com/pradel/clarity-abitype/commit/a70da7efccf3ef6c05688971b2b8f93d887d0177) Thanks [@pradel](https://github.com/pradel)! - Publish first version with CI.

## 0.1.0

### Minor Changes

- [#2](https://github.com/pradel/clarity-abitype/pull/2) [`9dcee37`](https://github.com/pradel/clarity-abitype/commit/9dcee374b1188d3e1fa006e4fa185b974256576d) Thanks [@pradel](https://github.com/pradel)! - First version of clarity-abitype
