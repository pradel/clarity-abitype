import { request } from "@stacks/connect";
import type { NetworkClientParam } from "@stacks/network";

import type { ClarityAbi, ClarityAbiFunction } from "../abi.js";
import type {
  ContractFunctionName,
  ContractFunctionArgs,
} from "../stacks-js/read-only.js";
import { primitivesToCVs } from "../stacks-js/utils.js";

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

type StacksConnectPostConditionMode = "permit" | "deny";

type StacksConnectPostCondition = unknown;

interface TypedCallContractOptions {
  network: NetworkClientParam["network"];
  postConditionMode?: StacksConnectPostConditionMode;
  postConditions?: StacksConnectPostCondition[];
  sponsored?: boolean;
  onFinish?: (data: { txId: string }) => void;
  onCancel?: (data: { error?: string }) => void;
}

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
> = Omit<TypedCallContractOptions, "postConditionMode" | "postConditions"> & {
  /** The contract ABI */
  abi: abi;
  /** The contract address */
  contractAddress: string;
  /** The contract name */
  contractName: string;
  /** The function name to call */
  functionName:
    | TypedCallContractFunctionName<abi>
    | (functionName extends TypedCallContractFunctionName<abi>
        ? functionName
        : never);
  /** Post condition mode (default: "permit") */
  postConditionMode?: StacksConnectPostConditionMode;
  /** Post conditions to include */
  postConditions?: StacksConnectPostCondition[];
} & (readonly [] extends args
    ? { functionArgs?: args | undefined }
    : { functionArgs: args });

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
 * import { Cl } from '@stacks/transactions';
 *
 * const result = await typedCallContract({
 *   abi: swapAbi,
 *   contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
 *   contractName: "swap",
 *   functionName: "xbtc-to-sbtc-swap",
 *   functionArgs: [Cl.uint(amount)],
 *   network: "mainnet",
 *   postConditionMode: "deny",
 *   postConditions: [userSendsXbtc, contractSendsSbtc],
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
    contractAddress,
    contractName,
    functionName: funcName,
    functionArgs = [],
    postConditionMode,
    postConditions,
    ...options
  } = parameters as TypedCallContractParameters;

  // Find the function in the ABI
  const abiTyped = abiParam as ClarityAbi;
  const abiFunc = abiTyped.functions.find(
    (fn: ClarityAbiFunction) => fn.name === funcName && fn.access === "public",
  );

  if (!abiFunc) {
    throw new Error(
      `Function "${String(funcName)}" not found in ABI or is not a public function`,
    );
  }

  // Convert primitive args to ClarityValues
  const clarityArgs = primitivesToCVs(
    functionArgs as readonly unknown[],
    abiFunc.args,
  );

  // Build contract identifier
  const contract = `${contractAddress}.${contractName}`;

  let txId: string | undefined;

  // Call the underlying @stacks/connect request
  await (request as Function)("stx_callContract", {
    ...options,
    contract,
    functionName: String(funcName),
    functionArgs: clarityArgs,
    postConditionMode: postConditionMode ?? "permit",
    postConditions: postConditions ?? [],
    onFinish: (data: { txId: string }) => {
      txId = data.txId;
      options.onFinish?.(data);
    },
  });

  if (!txId) {
    throw new Error("Transaction was cancelled or failed to submit");
  }

  return txId;
}
