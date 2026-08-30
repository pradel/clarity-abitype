import type {
  StacksTransactionWire,
  SignedContractCallOptions,
} from "@stacks/transactions";
import { makeContractCall } from "@stacks/transactions";

import type { ClarityAbi, ClarityAbiFunction } from "../abi.js";
import {
  AbiArgumentMismatchError,
  AbiFunctionNotFoundError,
  BaseError,
  ContractExecutionError,
} from "../errors.js";
import type { UnionWiden } from "../types.js";
import type {
  ContractFunctionName,
  ContractFunctionArgs,
} from "./read-only.js";
import { primitivesToCVs } from "./utils.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Contract Call Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Public function name type for contract call operations.
 */
export type TypedContractCallFunctionName<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = ContractFunctionName<abi, "public">;

/**
 * Public function arguments type for contract call operations.
 */
export type TypedContractCallFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedContractCallFunctionName<abi> =
    TypedContractCallFunctionName<abi>,
> = ContractFunctionArgs<abi, "public", functionName>;

/**
 * Parameters for making a typed contract call.
 * Extends SignedContractCallOptions but replaces functionName and functionArgs with typed versions.
 */
export type TypedMakeContractCallParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedContractCallFunctionName<abi> =
    TypedContractCallFunctionName<abi>,
  args extends TypedContractCallFunctionArgs<abi, functionName> =
    TypedContractCallFunctionArgs<abi, functionName>,
> = Omit<
  SignedContractCallOptions,
  "functionName" | "functionArgs" | "validateWithAbi"
> & {
  /** The contract ABI */
  abi: abi;
  /** The function name to call */
  functionName:
    | TypedContractCallFunctionName<abi>
    | (functionName extends TypedContractCallFunctionName<abi>
        ? functionName
        : never);
} & (readonly [] extends args
    ? {
        /** Function arguments (optional when function takes no arguments) */
        args?: UnionWiden<args> | undefined;
        /** @deprecated Use `args` instead */
        functionArgs?: UnionWiden<args> | undefined;
      }
    :
        | {
            /** Function arguments */
            args: UnionWiden<args>;
            /** @deprecated Use `args` instead */
            functionArgs?: never;
          }
        | {
            /** @deprecated Use `args` instead */
            functionArgs: UnionWiden<args>;
            /** Function arguments */
            args?: never;
          });

/**
 * Return type for typedMakeContractCall - returns the signed transaction.
 */
export type TypedMakeContractCallReturnType = StacksTransactionWire;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Typed Make Contract Call Function
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Type-safe wrapper around stacks.js makeContractCall.
 *
 * A "public" function on a Clarity contract modifies the state of the blockchain.
 * These types of functions require gas to be executed, and hence a transaction
 * needs to be broadcast in order to change the state.
 *
 * This function creates and signs the transaction but does NOT broadcast it.
 * Use `broadcastTransaction` from `@stacks/transactions` to broadcast the returned transaction.
 *
 * @example
 * ```ts
 * import { typedMakeContractCall } from 'clarity-abitype/stacks-js';
 * import { broadcastTransaction } from '@stacks/transactions';
 *
 * const transaction = await typedMakeContractCall({
 *   abi: sip10Abi,
 *   contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
 *   contractName: "my-token",
 *   functionName: "transfer",
 *   args: [100n, "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR", "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9", null],
 *   senderKey: "your-private-key",
 *   network: "mainnet",
 * });
 *
 * // Broadcast the transaction
 * const result = await broadcastTransaction({ transaction, network: "mainnet" });
 * ```
 *
 * @param parameters - {@link TypedMakeContractCallParameters}
 * @returns A signed transaction. {@link TypedMakeContractCallReturnType}
 */
export async function typedMakeContractCall<
  const abi extends ClarityAbi | readonly unknown[],
  functionName extends TypedContractCallFunctionName<abi>,
  const args extends TypedContractCallFunctionArgs<abi, functionName>,
>(
  parameters: TypedMakeContractCallParameters<abi, functionName, args>,
): Promise<TypedMakeContractCallReturnType> {
  const {
    abi: abiParam,
    functionName: funcName,
    ...options
  } = parameters as any;

  const rawArgs = parameters.args ?? (parameters as any).functionArgs ?? [];

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

  if (rawArgs.length !== abiFunc.args.length) {
    throw new AbiArgumentMismatchError({
      functionName: String(funcName),
      expectedCount: abiFunc.args.length,
      givenCount: rawArgs.length,
    });
  }

  // Convert primitive args to ClarityValues
  const clarityArgs = primitivesToCVs(
    rawArgs as readonly unknown[],
    abiFunc.args,
  );

  try {
    // Build and sign the transaction using stacks.js makeContractCall
    const transaction = await makeContractCall({
      ...options,
      functionName: String(funcName),
      functionArgs: clarityArgs,
      validateWithAbi: false,
    });

    return transaction;
  } catch (error) {
    if (error instanceof BaseError) throw error;
    throw new ContractExecutionError(error, {
      contractAddress: options.contractAddress,
      contractName: options.contractName,
      functionName: String(funcName),
    });
  }
}
