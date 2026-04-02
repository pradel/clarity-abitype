import type {
  ClarityAbi,
  ClarityAbiAccess,
  ClarityAbiFunction,
} from "../abi.js";
import { primitivesToCVs, cvToPrimitive } from "../stacks-js/utils.js";
import type {
  ClarityAbiArgsToPrimitiveTypes,
  ClarityAbiOutputToPrimitiveType,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "../utils.js";
import type {
  Simnet,
  ParsedTransactionResult,
  TypedTransactionResult,
} from "./types.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Contract Function Types (Internal - not exported)
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts the function name type for a given access level.
 * Falls back to `string` if the abi is not narrowable.
 * @internal
 */
type SimnetContractFunctionName<
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
 * @internal
 */
type SimnetContractFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
  functionName extends SimnetContractFunctionName<abi, access> =
    SimnetContractFunctionName<abi, access>,
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
 * @internal
 */
type SimnetContractFunctionReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
  functionName extends SimnetContractFunctionName<abi, access> =
    SimnetContractFunctionName<abi, access>,
> = abi extends ClarityAbi
  ? ClarityAbi extends abi
    ? unknown
    : ClarityAbiOutputToPrimitiveType<
        ExtractAbiFunction<abi, functionName>["outputs"]
      >
  : unknown;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Public Function Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Public function name type.
 */
export type TypedCallPublicFnFunctionName<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = SimnetContractFunctionName<abi, "public">;

/**
 * Public function arguments type.
 */
export type TypedCallPublicFnFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallPublicFnFunctionName<abi> =
    TypedCallPublicFnFunctionName<abi>,
> = SimnetContractFunctionArgs<abi, "public", functionName>;

/**
 * Parameters for calling a public function with type safety.
 */
export type TypedCallPublicFnParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallPublicFnFunctionName<abi> =
    TypedCallPublicFnFunctionName<abi>,
  args extends TypedCallPublicFnFunctionArgs<abi, functionName> =
    TypedCallPublicFnFunctionArgs<abi, functionName>,
> = {
  /** The simnet instance from @stacks/clarinet-sdk */
  simnet: Simnet;
  /** The contract ABI */
  abi: abi;
  /** The contract name (without deployer prefix) */
  contract: string;
  /** The function name to call */
  functionName:
    | TypedCallPublicFnFunctionName<abi>
    | (functionName extends TypedCallPublicFnFunctionName<abi>
        ? functionName
        : never);
  /** The sender address for the transaction */
  sender: string;
} & (readonly [] extends args
  ? { functionArgs?: args | undefined }
  : { functionArgs: args });

/**
 * Return type for calling a public function.
 */
export type TypedCallPublicFnReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallPublicFnFunctionName<abi> =
    TypedCallPublicFnFunctionName<abi>,
> = TypedTransactionResult<
  SimnetContractFunctionReturnType<abi, "public", functionName>
>;

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
 * import { typedCallPublicFn } from 'clarity-abitype/clarinet-sdk';
 *
 * const { result, events } = typedCallPublicFn({
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
export function typedCallPublicFn<
  const abi extends ClarityAbi | readonly unknown[],
  functionName extends TypedCallPublicFnFunctionName<abi>,
  const args extends TypedCallPublicFnFunctionArgs<abi, functionName>,
>(
  parameters: TypedCallPublicFnParameters<abi, functionName, args>,
): TypedCallPublicFnReturnType<abi, functionName> {
  const {
    simnet,
    abi: abiParam,
    contract,
    functionName: funcName,
    functionArgs = [],
    sender,
  } = parameters as TypedCallPublicFnParameters;

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
  } as TypedCallPublicFnReturnType<abi, functionName>;
}
