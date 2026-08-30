# Error Handling

**clarity-abitype** exports a structured error hierarchy for runtime validation and execution failures. All errors extend [`BaseError`](#error-classes).

## Catching Errors

Catch and narrow errors with `instanceof` or the exported TypeScript error types:

```ts
import {
  AbiFunctionNotFoundError,
  AbiArgumentMismatchError,
  ContractExecutionError,
  BaseError,
} from "clarity-abitype";
import { typedMakeContractCall } from "clarity-abitype/stacks-js";

try {
  await typedMakeContractCall({ ... });
} catch (error) {
  if (error instanceof AbiFunctionNotFoundError) {
    // Function not found in ABI or access modifier mismatch
  } else if (error instanceof AbiArgumentMismatchError) {
    // Wrong number of arguments provided
  } else if (error instanceof ContractExecutionError) {
    // Underlying execution/RPC failed (error.cause contains the root error)
  } else if (error instanceof BaseError) {
    // Generic clarity-abitype error
  }
}
```

## Error Classes

| Class                      | Description                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `BaseError`                | Base class extending `Error` with `shortMessage`, `details`, `cause`, and doc links.                    |
| `AbiFunctionNotFoundError` | Thrown when a function is missing from the ABI or has the wrong access level (`public` vs `read_only`). |
| `AbiArgumentMismatchError` | Thrown when argument count does not match the ABI function definition.                                  |
| `ContractExecutionError`   | Thrown when the underlying RPC or wallet client fails during execution.                                 |

## TypeScript Types

Each error class has an accompanying type (`BaseErrorType`, `AbiFunctionNotFoundErrorType`, `AbiArgumentMismatchErrorType`, `ContractExecutionErrorType`) for typing `catch` blocks:

```ts
import type { ContractExecutionErrorType } from "clarity-abitype";

try {
  // ...
} catch (e) {
  const error = e as ContractExecutionErrorType;
  if (error.name === "ContractExecutionError") {
    console.error(error.details);
  }
}
```
