import type { CallContractParams } from "@stacks/connect/dist/types/methods.js";

import type { ClarityAbi } from "../abi.js";
import type { Prettify, UnionWiden } from "../types.js";
import {
  type TypedCallContractFunctionArgs,
  type TypedCallContractFunctionName,
  type TypedCallContractReturnType,
  typedCallContract,
} from "./contract-call.js";

export type ContractConnectCallOptions<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallContractFunctionName<abi> =
    TypedCallContractFunctionName<abi>,
  args extends TypedCallContractFunctionArgs<abi, functionName> =
    TypedCallContractFunctionArgs<abi, functionName>,
> = Omit<CallContractParams, "contract" | "functionName" | "functionArgs"> &
  (readonly [] extends args
    ? {
        /** Function arguments (optional when function takes no arguments) */
        functionArgs?: UnionWiden<args> | undefined;
      }
    : {
        /** Function arguments */
        functionArgs: UnionWiden<args>;
      });

export type GetContractParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = {
  /** The contract ABI */
  abi: abi;
  /** The contract identifier in format "address.contract-name" */
  contract: string;
};

export type GetContractReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = Prettify<{
  abi: abi;
  contract: string;
  call: {
    [functionName in TypedCallContractFunctionName<abi>]: (
      options: ContractConnectCallOptions<abi, functionName>,
    ) => Promise<TypedCallContractReturnType>;
  };
}>;

/**
 * Gets a type-safe contract instance bound to a specific ABI and contract identifier for @stacks/connect.
 *
 * @example
 * ```ts
 * import { getContract } from 'clarity-abitype/stacks-connect';
 *
 * const contract = getContract({
 *   abi: sip10Abi,
 *   contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
 * });
 *
 * const txId = await contract.call.transfer({
 *   functionArgs: [100n, "SP2C...", "SP3K...", null],
 *   network: "mainnet",
 * });
 * ```
 */
export function getContract<const abi extends ClarityAbi | readonly unknown[]>(
  parameters: GetContractParameters<abi>,
): GetContractReturnType<abi> {
  const { abi, contract } = parameters;

  const call = new Proxy(
    {},
    {
      get(_, functionName: string) {
        return (options: any = {}) => {
          return typedCallContract({
            abi,
            contract,
            functionName,
            ...options,
          });
        };
      },
    },
  );

  return {
    abi,
    contract,
    call,
  } as unknown as GetContractReturnType<abi>;
}
