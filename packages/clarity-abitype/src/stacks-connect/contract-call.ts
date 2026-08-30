import { request } from "@stacks/connect";
import type { CallContractParams } from "@stacks/connect/dist/types/methods.js";

import type { ClarityAbi, ClarityAbiFunction } from "../abi.js";
import {
  AbiArgumentMismatchError,
  AbiFunctionNotFoundError,
  BaseError,
  ContractExecutionError,
} from "../errors.js";
import type {
  ContractFunctionName,
  ContractFunctionArgs,
} from "../stacks-js/read-only.js";
import { primitivesToCVs } from "../stacks-js/utils.js";
import type { UnionWiden } from "../types.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Contract Call Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Public function name type for contract call operations.
 */
export type TypedCallContractFunctionName<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = ContractFunctionName<abi, "public">;

/**
 * Public function arguments type for contract call operations.
 */
export type TypedCallContractFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallContractFunctionName<abi> =
    TypedCallContractFunctionName<abi>,
> = ContractFunctionArgs<abi, "public", functionName>;

/**
 * Parameters for making a typed contract call via @stacks/connect.
 * Extends the base options but replaces functionName and functionArgs with typed versions.
 */
export type TypedCallContractParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallContractFunctionName<abi> =
    TypedCallContractFunctionName<abi>,
  args extends TypedCallContractFunctionArgs<abi, functionName> =
    TypedCallContractFunctionArgs<abi, functionName>,
> = Omit<CallContractParams, "functionName" | "functionArgs"> & {
  /** The contract ABI */
  abi: abi;
  /** The function name to call */
  functionName:
    | TypedCallContractFunctionName<abi>
    | (functionName extends TypedCallContractFunctionName<abi>
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
      });

/**
 * Return type for typedCallContract - returns the transaction ID from the wallet.
 */
export type TypedCallContractReturnType = string;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Typed Call Contract Function
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Type-safe wrapper around @stacks/connect's stx_callContract.
 *
 * Opens the Stacks wallet to sign and broadcast a contract call transaction.
 * Automatically converts TypeScript primitive types to ClarityValues based on the ABI.
 *
 * @example
 * ```ts
 * import { typedCallContract } from 'clarity-abitype/stacks-connect';
 *
 * const result = await typedCallContract({
 *   abi: swapAbi,
 *   contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.swap",
 *   functionName: "xbtc-to-sbtc-swap",
 *   functionArgs: [100n],
 *   network: "mainnet",
 * });
 *
 * // result is the txId of the submitted transaction
 * console.log(result);
 * ```
 *
 * @param parameters - {@link TypedCallContractParameters}
 * @returns Promise resolving to the transaction ID
 */
export async function typedCallContract<
  const abi extends ClarityAbi | readonly unknown[],
  functionName extends TypedCallContractFunctionName<abi>,
  const args extends TypedCallContractFunctionArgs<abi, functionName>,
>(
  parameters: TypedCallContractParameters<abi, functionName, args>,
): Promise<TypedCallContractReturnType> {
  const {
    abi: abiParam,
    functionName: funcName,
    functionArgs = [],
    ...options
  } = parameters as TypedCallContractParameters;

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
