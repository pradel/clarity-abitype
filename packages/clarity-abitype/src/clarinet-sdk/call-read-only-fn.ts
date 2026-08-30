import type { ClarityAbi, ClarityAbiFunction } from "../abi.js";
import {
  AbiArgumentMismatchError,
  AbiFunctionNotFoundError,
  BaseError,
  ContractExecutionError,
} from "../errors.js";
import { primitivesToCVs, cvToPrimitive } from "../stacks-js/utils.js";
import type { UnionEvaluate, UnionWiden } from "../types.js";
import type {
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionReturnType,
} from "../utils.js";
import type {
  Simnet,
  ParsedTransactionResult,
  TypedTransactionResult,
} from "./types.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Read-Only Function Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Read-only function name type.
 */
export type TypedCallReadOnlyFnFunctionName<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = ContractFunctionName<abi, "read_only">;

/**
 * Read-only function arguments type.
 */
export type TypedCallReadOnlyFnFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallReadOnlyFnFunctionName<abi> =
    TypedCallReadOnlyFnFunctionName<abi>,
> = ContractFunctionArgs<abi, "read_only", functionName>;

/**
 * Parameters for calling a read-only function with type safety.
 */
export type TypedCallReadOnlyFnParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallReadOnlyFnFunctionName<abi> =
    TypedCallReadOnlyFnFunctionName<abi>,
  args extends TypedCallReadOnlyFnFunctionArgs<abi, functionName> =
    TypedCallReadOnlyFnFunctionArgs<abi, functionName>,
> = UnionEvaluate<
  {
    /** The simnet instance from @stacks/clarinet-sdk */
    simnet: Simnet;
    /** The contract ABI */
    abi: abi;
    /** The contract name (without deployer prefix) */
    contract: string;
    /** The function name to call */
    functionName:
      | TypedCallReadOnlyFnFunctionName<abi>
      | (functionName extends TypedCallReadOnlyFnFunctionName<abi>
          ? functionName
          : never);
    /** The sender address for the simulated call */
    sender: string;
  } & (readonly [] extends args
    ? {
        /** Function arguments (optional when function takes no arguments) */
        functionArgs?: UnionWiden<args> | undefined;
      }
    : {
        /** Function arguments */
        functionArgs: UnionWiden<args>;
      })
>;

/**
 * Return type for calling a read-only function.
 */
export type TypedCallReadOnlyFnReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallReadOnlyFnFunctionName<abi> =
    TypedCallReadOnlyFnFunctionName<abi>,
> = TypedTransactionResult<
  ContractFunctionReturnType<abi, "read_only", functionName>
>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Type-safe Read-Only Function Call
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Type-safe wrapper around clarinet-sdk's simnet.callReadOnlyFn.
 *
 * Automatically converts TypeScript primitive types to ClarityValues based on the ABI,
 * and returns the result as a TypeScript primitive type.
 *
 * @example
 * ```ts
 * import { typedCallReadOnlyFn } from 'clarity-abitype/clarinet-sdk';
 *
 * const { result } = typedCallReadOnlyFn({
 *   simnet,
 *   abi: sip10Abi,
 *   contract: "my-token",
 *   functionName: "get-balance",
 *   functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
 *   sender: simnet.deployer,
 * });
 * // result is typed as { ok: bigint; error?: never } | { ok?: never; error: null }
 * ```
 *
 * @param parameters - The call configuration
 * @returns The typed transaction result with primitive values
 */
export function typedCallReadOnlyFn<
  const abi extends ClarityAbi | readonly unknown[],
  functionName extends TypedCallReadOnlyFnFunctionName<abi>,
  const args extends TypedCallReadOnlyFnFunctionArgs<abi, functionName>,
>(
  parameters: TypedCallReadOnlyFnParameters<abi, functionName, args>,
): TypedCallReadOnlyFnReturnType<abi, functionName> {
  const {
    simnet,
    abi: abiParam,
    contract,
    functionName: funcName,
    functionArgs = [],
    sender,
  } = parameters as TypedCallReadOnlyFnParameters;

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
    // Call the underlying clarinet-sdk function
    const result: ParsedTransactionResult = simnet.callReadOnlyFn(
      contract,
      String(funcName),
      clarityArgs,
      sender,
    );

    // Convert the result back to a primitive type
    return {
      result: cvToPrimitive(result.result),
      events: result.events,
    } as TypedCallReadOnlyFnReturnType<abi, functionName>;
  } catch (error) {
    if (error instanceof BaseError) throw error;
    throw new ContractExecutionError(error, {
      contractName: contract,
      functionName: String(funcName),
    });
  }
}
