import type {
  ClarityAbi,
  ClarityAbiAccess,
  ClarityAbiFunction,
  ClarityType,
  ClarityTuple,
  ClarityList,
  ClarityOptional,
  ClarityResponse,
} from "./abi.js";
import type {
  ClarityAbiArgsToPrimitiveTypes,
  ClarityAbiOutputToPrimitiveType,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "./utils.js";

// Re-export types from @stacks/transactions for convenience
import type { ClarityValue } from "@stacks/transactions";
import type { NetworkClientParam } from "@stacks/network";

import {
  fetchCallReadOnlyFunction,
  uintCV,
  intCV,
  bufferCV,
  stringAsciiCV,
  stringUtf8CV,
  trueCV,
  falseCV,
  noneCV,
  someCV,
  standardPrincipalCV,
  contractPrincipalCV,
  listCV,
  tupleCV,
  responseOkCV,
  responseErrorCV,
  cvToValue,
} from "@stacks/transactions";
import { hexToBytes } from "@stacks/common";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Contract Function Types (following viem's pattern)
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts the function name type for a given access level.
 * Falls back to `string` if the abi is not narrowable.
 */
export type ContractFunctionName<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
> =
  ExtractAbiFunctionNames<
    abi extends ClarityAbi ? abi : ClarityAbi,
    access
  > extends infer functionName extends string
    ? [functionName] extends [never]
      ? string
      : functionName
    : string;

/**
 * Extracts the function arguments type for a given function.
 * Falls back to `readonly unknown[]` if not inferrable.
 */
export type ContractFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
  functionName extends ContractFunctionName<abi, access> = ContractFunctionName<
    abi,
    access
  >,
> =
  ClarityAbiArgsToPrimitiveTypes<
    ExtractAbiFunction<
      abi extends ClarityAbi ? abi : ClarityAbi,
      functionName
    >["args"]
  > extends infer args
    ? [args] extends [never]
      ? readonly unknown[]
      : args
    : readonly unknown[];

/**
 * Extracts the function return type for a given function.
 * Falls back to `unknown` if not inferrable.
 */
export type ContractFunctionReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
  functionName extends ContractFunctionName<abi, access> = ContractFunctionName<
    abi,
    access
  >,
> = abi extends ClarityAbi
  ? ClarityAbi extends abi
    ? unknown
    : ClarityAbiOutputToPrimitiveType<
        ExtractAbiFunction<abi, functionName>["outputs"]
      >
  : unknown;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Read-Only Function Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Parameters for calling a read-only function with type safety.
 */
export type TypedCallReadOnlyFunctionParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends ContractFunctionName<abi, "read_only"> =
    ContractFunctionName<abi, "read_only">,
  args extends ContractFunctionArgs<abi, "read_only", functionName> =
    ContractFunctionArgs<abi, "read_only", functionName>,
> = {
  /** The contract ABI */
  abi: abi;
  /** The contract address */
  contractAddress: string;
  /** The contract name */
  contractName: string;
  /** The function name to call */
  functionName:
    | ContractFunctionName<abi, "read_only">
    | (functionName extends ContractFunctionName<abi, "read_only">
        ? functionName
        : never);
  /** The sender address for the simulated call */
  senderAddress: string;
  /** Optional network configuration */
  network?: NetworkClientParam["network"];
  /** Optional client configuration */
  client?: NetworkClientParam["client"];
} & (readonly [] extends args
  ? { functionArgs?: args | undefined }
  : { functionArgs: args });

/**
 * Return type for calling a read-only function.
 */
export type TypedCallReadOnlyFunctionReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends ContractFunctionName<abi, "read_only"> =
    ContractFunctionName<abi, "read_only">,
> = ContractFunctionReturnType<abi, "read_only", functionName>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Primitive to ClarityValue Conversion
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Converts a TypeScript primitive value to a ClarityValue based on the ABI type.
 *
 * @param value - The TypeScript primitive value to convert
 * @param abiType - The Clarity ABI type definition
 * @returns The corresponding ClarityValue
 */
export function primitiveToCV(
  value: unknown,
  abiType: ClarityType | string,
): ClarityValue {
  // Handle string-based primitive types
  if (typeof abiType === "string") {
    switch (abiType) {
      case "uint128":
        if (typeof value === "bigint" || typeof value === "number") {
          return uintCV(value);
        }
        throw new Error(
          `Expected bigint or number for uint128, got ${typeof value}`,
        );

      case "int128":
        if (typeof value === "bigint" || typeof value === "number") {
          return intCV(value);
        }
        throw new Error(
          `Expected bigint or number for int128, got ${typeof value}`,
        );

      case "bool":
        if (typeof value === "boolean") {
          return value ? trueCV() : falseCV();
        }
        throw new Error(`Expected boolean for bool, got ${typeof value}`);

      case "principal":
      case "trait_reference":
        if (typeof value === "string") {
          if (value.includes(".")) {
            const [address, contractName] = value.split(".");
            return contractPrincipalCV(address, contractName);
          }
          return standardPrincipalCV(value);
        }
        throw new Error(`Expected string for principal, got ${typeof value}`);

      case "none":
        return noneCV();

      default:
        throw new Error(`Unknown primitive Clarity type: ${abiType}`);
    }
  }

  // Handle object-based types
  if (typeof abiType === "object" && abiType !== null) {
    // Buffer type
    if ("buffer" in abiType) {
      if (typeof value === "string") {
        // Assume hex string starting with 0x
        const hexValue = value.startsWith("0x") ? value.slice(2) : value;
        return bufferCV(hexToBytes(hexValue));
      }
      if (value instanceof Uint8Array) {
        return bufferCV(value);
      }
      throw new Error(
        `Expected string or Uint8Array for buffer, got ${typeof value}`,
      );
    }

    // String ASCII type
    if ("string-ascii" in abiType) {
      if (typeof value === "string") {
        return stringAsciiCV(value);
      }
      throw new Error(`Expected string for string-ascii, got ${typeof value}`);
    }

    // String UTF8 type
    if ("string-utf8" in abiType) {
      if (typeof value === "string") {
        return stringUtf8CV(value);
      }
      throw new Error(`Expected string for string-utf8, got ${typeof value}`);
    }

    // Optional type
    if ("optional" in abiType) {
      const optionalType = abiType as ClarityOptional;
      if (value === null || value === undefined) {
        return noneCV();
      }
      return someCV(primitiveToCV(value, optionalType.optional));
    }

    // List type
    if ("list" in abiType) {
      const listType = abiType as ClarityList;
      if (Array.isArray(value)) {
        const items = value.map((item) =>
          primitiveToCV(item, listType.list.type),
        );
        return listCV(items);
      }
      throw new Error(`Expected array for list, got ${typeof value}`);
    }

    // Tuple type
    if ("tuple" in abiType) {
      const tupleType = abiType as ClarityTuple;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const tupleData: Record<string, ClarityValue> = {};
        for (const entry of tupleType.tuple) {
          const entryValue = (value as Record<string, unknown>)[entry.name];
          if (entryValue === undefined) {
            throw new Error(`Missing tuple field: ${entry.name}`);
          }
          tupleData[entry.name] = primitiveToCV(entryValue, entry.type);
        }
        return tupleCV(tupleData);
      }
      throw new Error(`Expected object for tuple, got ${typeof value}`);
    }

    // Response type
    if ("response" in abiType) {
      const responseType = abiType as ClarityResponse;
      if (typeof value === "object" && value !== null) {
        const responseValue = value as { ok?: unknown; error?: unknown };
        if ("ok" in responseValue && responseValue.ok !== undefined) {
          return responseOkCV(
            primitiveToCV(responseValue.ok, responseType.response.ok),
          );
        }
        if ("error" in responseValue && responseValue.error !== undefined) {
          return responseErrorCV(
            primitiveToCV(responseValue.error, responseType.response.error),
          );
        }
      }
      throw new Error(
        `Expected response object with ok or error, got ${typeof value}`,
      );
    }
  }

  throw new Error(`Unsupported Clarity type: ${JSON.stringify(abiType)}`);
}

/**
 * Converts an array of TypeScript primitive values to ClarityValues based on ABI function args.
 *
 * @param args - Array of TypeScript primitive values
 * @param abiArgs - Array of ABI argument definitions
 * @returns Array of ClarityValues
 */
export function primitivesToCVs(
  args: readonly unknown[],
  abiArgs: readonly { name: string; type: ClarityType | string }[],
): ClarityValue[] {
  if (args.length !== abiArgs.length) {
    throw new Error(
      `Argument count mismatch: expected ${abiArgs.length}, got ${args.length}`,
    );
  }

  return args.map((arg, index) => primitiveToCV(arg, abiArgs[index].type));
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Type-safe Read-Only Function Call
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Type-safe wrapper around stacks.js fetchCallReadOnlyFunction.
 *
 * Automatically converts TypeScript primitive types to ClarityValues based on the ABI,
 * and returns the result as a TypeScript primitive type.
 *
 * @example
 * ```ts
 * const result = await typedCallReadOnlyFunction({
 *   abi: sip10Abi,
 *   contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
 *   contractName: "my-token",
 *   functionName: "get-balance",
 *   functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
 *   senderAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
 * });
 * // result is typed as { ok: bigint; error?: never } | { ok?: never; error: null }
 * ```
 *
 * @param parameters - The call configuration
 * @returns Promise resolving to the typed result
 */
export async function typedCallReadOnlyFunction<
  const abi extends ClarityAbi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "read_only">,
  const args extends ContractFunctionArgs<abi, "read_only", functionName>,
>(
  parameters: TypedCallReadOnlyFunctionParameters<abi, functionName, args>,
): Promise<TypedCallReadOnlyFunctionReturnType<abi, functionName>> {
  const {
    abi: abiParam,
    contractAddress,
    contractName,
    functionName: funcName,
    functionArgs = [],
    senderAddress,
    network,
    client,
  } = parameters as TypedCallReadOnlyFunctionParameters;

  // Find the function in the ABI
  const abiTyped = abiParam as ClarityAbi;
  const abiFunc = abiTyped.functions.find(
    (fn: ClarityAbiFunction) =>
      fn.name === funcName && fn.access === "read_only",
  );

  if (!abiFunc) {
    throw new Error(
      `Function "${String(funcName)}" not found in ABI or is not a read_only function`,
    );
  }

  // Convert primitive args to ClarityValues
  const clarityArgs = primitivesToCVs(
    functionArgs as readonly unknown[],
    abiFunc.args,
  );

  // Call the underlying stacks.js function
  const result = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: String(funcName),
    functionArgs: clarityArgs,
    senderAddress,
    network,
    client,
  });

  // Convert the result back to a primitive type
  return cvToValue(result, true) as TypedCallReadOnlyFunctionReturnType<
    abi,
    functionName
  >;
}
