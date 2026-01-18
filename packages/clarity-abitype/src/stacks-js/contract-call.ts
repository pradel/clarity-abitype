import type { ClarityAbi, ClarityAbiFunction } from "../abi.js";
import type {
  ClarityAbiArgsToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "../utils.js";
import type { SignedContractCallOptions } from "@stacks/transactions";
import { makeContractCall } from "@stacks/transactions";
import { primitivesToCVs } from "./utils.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Public Function Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts the public function name type.
 * Falls back to `string` if the abi is not narrowable.
 */
export type PublicFunctionName<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> =
  ExtractAbiFunctionNames<
    abi extends ClarityAbi ? abi : ClarityAbi,
    "public"
  > extends infer functionName extends string
    ? [functionName] extends [never]
      ? string
      : functionName
    : string;

/**
 * Extracts the public function arguments type for a given function.
 * Falls back to `readonly unknown[]` if not inferrable.
 */
export type PublicFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends PublicFunctionName<abi> = PublicFunctionName<abi>,
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// Contract Call Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Parameters for making a contract call with type safety.
 * Extends SignedContractCallOptions but with typed function args.
 */
export type TypedMakeContractCallParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends PublicFunctionName<abi> = PublicFunctionName<abi>,
  args extends PublicFunctionArgs<abi, functionName> = PublicFunctionArgs<
    abi,
    functionName
  >,
> = Omit<SignedContractCallOptions, "functionName" | "functionArgs"> & {
  /** The contract ABI */
  abi: abi;
  /** The function name to call */
  functionName:
    | PublicFunctionName<abi>
    | (functionName extends PublicFunctionName<abi> ? functionName : never);
} & (readonly [] extends args
    ? { functionArgs?: args | undefined }
    : { functionArgs: args });

////////////////////////////////////////////////////////////////////////////////////////////////////
// Type-safe Contract Call Functions
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Type-safe wrapper around stacks.js makeContractCall.
 *
 * Automatically converts TypeScript primitive types to ClarityValues based on the ABI.
 *
 * @example
 * ```ts
 * const tx = await typedMakeContractCall({
 *   abi: sip10Abi,
 *   contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
 *   contractName: "my-token",
 *   functionName: "transfer",
 *   functionArgs: [100n, "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR", "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9", null],
 *   senderKey: "your-private-key",
 * });
 * ```
 *
 * @param parameters - The contract call configuration
 * @returns Promise resolving to the signed transaction
 */
export async function typedMakeContractCall<
  const abi extends ClarityAbi | readonly unknown[],
  functionName extends PublicFunctionName<abi>,
  const args extends PublicFunctionArgs<abi, functionName>,
>(
  parameters: TypedMakeContractCallParameters<abi, functionName, args>,
): Promise<ReturnType<typeof makeContractCall>> {
  const {
    abi: abiParam,
    functionName: funcName,
    functionArgs = [],
    ...restOptions
  } = parameters as TypedMakeContractCallParameters;

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

  // Call the underlying stacks.js function
  return makeContractCall({
    ...restOptions,
    functionName: String(funcName),
    functionArgs: clarityArgs,
  });
}
