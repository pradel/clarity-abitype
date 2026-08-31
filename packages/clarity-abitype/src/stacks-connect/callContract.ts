import { request } from "@stacks/connect";
import type { CallContractParams } from "@stacks/connect/dist/types/methods.js";

import type { ClarityAbi, ClarityAbiFunction } from "../abi.js";
import {
  AbiArgumentMismatchError,
  AbiFunctionNotFoundError,
  BaseError,
  ContractExecutionError,
} from "../errors.js";
import { primitivesToCVs } from "../stacks-js/utils.js";
import type { UnionEvaluate, UnionWiden } from "../types.js";
import type { ContractFunctionName, ContractFunctionArgs } from "../utils.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Contract Call Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Public function name type for contract call operations.
 */
export type CallContractFunctionName<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = ContractFunctionName<abi, "public">;

/**
 * Public function arguments type for contract call operations.
 */
export type CallContractFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends CallContractFunctionName<abi> =
    CallContractFunctionName<abi>,
> = ContractFunctionArgs<abi, "public", functionName>;

/**
 * Parameters for making a typed contract call via @stacks/connect.
 * Extends the base options but replaces functionName and functionArgs with typed versions.
 */
export type CallContractParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends CallContractFunctionName<abi> =
    CallContractFunctionName<abi>,
  args extends CallContractFunctionArgs<abi, functionName> =
    CallContractFunctionArgs<abi, functionName>,
> = UnionEvaluate<
  Omit<CallContractParams, "functionName" | "functionArgs"> & {
    /** The contract ABI */
    abi: abi;
    /** The function name to call */
    functionName:
      | CallContractFunctionName<abi>
      | (functionName extends CallContractFunctionName<abi>
          ? functionName
          : never);
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
 * Return type for callContract - returns the transaction ID from the wallet.
 */
export type CallContractReturnType = string;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Call Contract Function
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Type-safe wrapper around @stacks/connect's stx_callContract.
 *
 * Opens the Stacks wallet to sign and broadcast a contract call transaction.
 * Automatically converts TypeScript primitive types to ClarityValues based on the ABI.
 *
 * @example
 * ```ts
 * import { callContract } from 'clarity-abitype/stacks-connect';
 *
 * const result = await callContract({
 *   abi: swapAbi,
 *   contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.swap",
 *   functionName: "xbtc-to-sbtc-swap",
 *   functionArgs: [amount],
 *   network: "mainnet",
 *   postConditionMode: "deny",
 *   postConditions: [userSendsXbtc, contractSendsSbtc],
 * });
 *
 * // result is the txId of the submitted transaction
 * console.log(result);
 * ```
 *
 * @param parameters - {@link CallContractParameters}
 * @returns Promise resolving to the transaction ID
 */
export async function callContract<
  const abi extends ClarityAbi | readonly unknown[],
  functionName extends CallContractFunctionName<abi>,
  const args extends CallContractFunctionArgs<abi, functionName>,
>(
  parameters: CallContractParameters<abi, functionName, args>,
): Promise<CallContractReturnType> {
  const {
    abi: abiParam,
    functionName: funcName,
    functionArgs = [],
    ...options
  } = parameters as CallContractParameters;

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
    // Call the underlying @stacks/connect request
    const response = await request("stx_callContract", {
      ...options,
      functionName: String(funcName),
      functionArgs: clarityArgs,
    });

    if (!response.txid) {
      throw new Error("Transaction was cancelled or failed to submit");
    }

    return response.txid;
  } catch (error) {
    if (error instanceof BaseError) throw error;
    throw new ContractExecutionError(error, {
      contractName: options.contract,
      functionName: String(funcName),
    });
  }
}
