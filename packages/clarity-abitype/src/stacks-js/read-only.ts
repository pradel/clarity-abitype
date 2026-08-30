import type { NetworkClientParam } from "@stacks/network";
import { fetchCallReadOnlyFunction } from "@stacks/transactions";

import type {
  ClarityAbi,
  ClarityAbiAccess,
  ClarityAbiFunction,
} from "../abi.js";
import {
  AbiArgumentMismatchError,
  AbiFunctionNotFoundError,
  BaseError,
  ContractExecutionError,
} from "../errors.js";
import type { UnionWiden } from "../types.js";
import type {
  ClarityAbiArgsToPrimitiveTypes,
  ClarityAbiOutputToPrimitiveType,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "../utils.js";
import { primitivesToCVs, cvToPrimitive } from "./utils.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Contract Function Types
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
  ? {
      /** Function arguments (optional when function takes no arguments) */
      functionArgs?: UnionWiden<args> | undefined;
    }
  : {
      /** Function arguments */
      functionArgs: UnionWiden<args>;
    });

/**
 * Return type for calling a read-only function.
 */
export type TypedCallReadOnlyFunctionReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends ContractFunctionName<abi, "read_only"> =
    ContractFunctionName<abi, "read_only">,
> = ContractFunctionReturnType<abi, "read_only", functionName>;

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
  const abiFunc = abiTyped.functions?.find(
    (fn: ClarityAbiFunction) =>
      fn.name === funcName && fn.access === "read_only",
  );

  if (!abiFunc) {
    throw new AbiFunctionNotFoundError(String(funcName), {
      access: "read_only",
    });
  }

  if (functionArgs.length !== abiFunc.args.length) {
    throw new AbiArgumentMismatchError({
      functionName: String(funcName),
      expectedCount: abiFunc.args.length,
      givenCount: functionArgs.length,
    });
  }

  // Convert primitive args to ClarityValues
  const clarityArgs = primitivesToCVs(
    functionArgs as readonly unknown[],
    abiFunc.args,
  );

  try {
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
    return cvToPrimitive(result) as TypedCallReadOnlyFunctionReturnType<
      abi,
      functionName
    >;
  } catch (error) {
    if (error instanceof BaseError) throw error;
    throw new ContractExecutionError(error, {
      contractAddress,
      contractName,
      functionName: String(funcName),
    });
  }
}
