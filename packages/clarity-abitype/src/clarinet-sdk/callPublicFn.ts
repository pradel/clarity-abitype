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
  TransactionResult,
} from "./types.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Public Function Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Public function name type.
 */
export type CallPublicFnFunctionName<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = ContractFunctionName<abi, "public">;

/**
 * Public function arguments type.
 */
export type CallPublicFnFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends CallPublicFnFunctionName<abi> =
    CallPublicFnFunctionName<abi>,
> = ContractFunctionArgs<abi, "public", functionName>;

/**
 * Parameters for calling a public function with type safety.
 */
export type CallPublicFnParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends CallPublicFnFunctionName<abi> =
    CallPublicFnFunctionName<abi>,
  args extends CallPublicFnFunctionArgs<abi, functionName> =
    CallPublicFnFunctionArgs<abi, functionName>,
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
      | CallPublicFnFunctionName<abi>
      | (functionName extends CallPublicFnFunctionName<abi>
          ? functionName
          : never);
    /** The sender address for the transaction */
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
 * Return type for calling a public function.
 */
export type CallPublicFnReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends CallPublicFnFunctionName<abi> =
    CallPublicFnFunctionName<abi>,
> = TransactionResult<ContractFunctionReturnType<abi, "public", functionName>>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Type-safe Public Function Call
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Type-safe wrapper around clarinet-sdk's simnet.callPublicFn.
 *
 * Automatically converts TypeScript primitive types to ClarityValues based on the ABI,
 * and returns the result as a TypeScript primitive type.
 *
 * This function mines a block when called.
 *
 * @example
 * ```ts
 * import { callPublicFn } from 'clarity-abitype/clarinet-sdk';
 *
 * const { result, events } = callPublicFn({
 *   simnet,
 *   abi: sip10Abi,
 *   contract: "my-token",
 *   functionName: "transfer",
 *   functionArgs: [100n, "SP2C2YFP...", "SP3K8BC0...", null],
 *   sender: simnet.deployer,
 * });
 * // result is typed as { ok: boolean; error?: never } | { ok?: never; error: bigint }
 * ```
 *
 * @param parameters - The call configuration
 * @returns The typed transaction result with primitive values
 */
export function callPublicFn<
  const abi extends ClarityAbi | readonly unknown[],
  functionName extends CallPublicFnFunctionName<abi>,
  const args extends CallPublicFnFunctionArgs<abi, functionName>,
>(
  parameters: CallPublicFnParameters<abi, functionName, args>,
): CallPublicFnReturnType<abi, functionName> {
  const {
    simnet,
    abi: abiParam,
    contract,
    functionName: funcName,
    functionArgs = [],
    sender,
  } = parameters as CallPublicFnParameters;

  // Find the function in the ABI
  const abiTyped = abiParam as ClarityAbi;
  const abiFunc = abiTyped.functions?.find(
    (fn: ClarityAbiFunction) => fn.name === funcName && fn.access === "public",
  );

  if (!abiFunc) {
    throw new AbiFunctionNotFoundError(String(funcName), {
      access: "public",
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
    const result: ParsedTransactionResult = simnet.callPublicFn(
      contract,
      String(funcName),
      clarityArgs,
      sender,
    );

    // Convert the result back to a primitive type
    return {
      result: cvToPrimitive(result.result),
      events: result.events,
    } as CallPublicFnReturnType<abi, functionName>;
  } catch (error) {
    if (error instanceof BaseError) throw error;
    throw new ContractExecutionError(error, {
      contractName: contract,
      functionName: String(funcName),
    });
  }
}
