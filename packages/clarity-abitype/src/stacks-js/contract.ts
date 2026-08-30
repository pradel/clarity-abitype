import type { NetworkClientParam } from "@stacks/network";
import type {
  ReadOnlyFunctionOptions,
  SignedContractCallOptions,
} from "@stacks/transactions";

import type { ClarityAbi } from "../abi.js";
import type { UnionWiden } from "../types.js";
import {
  type TypedMakeContractCallReturnType,
  typedMakeContractCall,
} from "./contract-call.js";
import {
  type ContractFunctionArgs,
  type ContractFunctionName,
  type TypedCallReadOnlyFunctionReturnType,
  typedCallReadOnlyFunction,
} from "./read-only.js";

export type ContractReadOptions<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends ContractFunctionName<abi, "read_only"> =
    ContractFunctionName<abi, "read_only">,
  args extends ContractFunctionArgs<abi, "read_only", functionName> =
    ContractFunctionArgs<abi, "read_only", functionName>,
> = Omit<
  ReadOnlyFunctionOptions,
  | "contractAddress"
  | "contractName"
  | "functionName"
  | "functionArgs"
  | "senderAddress"
> & {
  /** Optional sender address (defaults to contractAddress or contract instance senderAddress) */
  senderAddress?: string | undefined;
} & (readonly [] extends args
    ? {
        /** Function arguments (optional when function takes no arguments) */
        functionArgs?: UnionWiden<args> | undefined;
      }
    : {
        /** Function arguments */
        functionArgs: UnionWiden<args>;
      });

export type ContractCallOptions<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends ContractFunctionName<abi, "public"> =
    ContractFunctionName<abi, "public">,
  args extends ContractFunctionArgs<abi, "public", functionName> =
    ContractFunctionArgs<abi, "public", functionName>,
> = Omit<
  SignedContractCallOptions,
  | "contractAddress"
  | "contractName"
  | "functionName"
  | "functionArgs"
  | "validateWithAbi"
  | "senderKey"
> & {
  /** Optional sender private key (defaults to contract instance senderKey) */
  senderKey?: string | undefined;
} & (readonly [] extends args
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
  /** The contract address */
  contractAddress: string;
  /** The contract name */
  contractName: string;
  /** Optional default sender address for read-only calls */
  senderAddress?: string | undefined;
  /** Optional network configuration */
  network?: NetworkClientParam["network"] | undefined;
  /** Optional client configuration */
  client?: NetworkClientParam["client"] | undefined;
  /** Optional default sender private key for contract calls */
  senderKey?: string | undefined;
};

export type GetContractReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = {
  abi: abi;
  contractAddress: string;
  contractName: string;
  read: {
    [functionName in ContractFunctionName<abi, "read_only">]: (
      options?: ContractReadOptions<abi, functionName>,
    ) => Promise<TypedCallReadOnlyFunctionReturnType<abi, functionName>>;
  };
  call: {
    [functionName in ContractFunctionName<abi, "public">]: (
      options: ContractCallOptions<abi, functionName>,
    ) => Promise<TypedMakeContractCallReturnType>;
  };
};

/**
 * Gets a type-safe contract instance bound to a specific ABI and contract identifier for Stacks.js.
 *
 * @example
 * ```ts
 * import { getContract } from 'clarity-abitype/stacks-js';
 *
 * const contract = getContract({
 *   abi: sip10Abi,
 *   contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
 *   contractName: "my-token",
 * });
 *
 * // Read call
 * const balance = await contract.read["get-balance"]({
 *   functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
 *   senderAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
 * });
 *
 * // Transaction call
 * const tx = await contract.call.transfer({
 *   functionArgs: [100n, "SP2C...", "SP3K...", null],
 *   senderKey: "my-key",
 *   network: "mainnet",
 * });
 * ```
 */
export function getContract<const abi extends ClarityAbi | readonly unknown[]>(
  parameters: GetContractParameters<abi>,
): GetContractReturnType<abi> {
  const {
    abi,
    contractAddress,
    contractName,
    senderAddress: defaultSenderAddress,
    network: defaultNetwork,
    client: defaultClient,
    senderKey: defaultSenderKey,
  } = parameters;

  const read = new Proxy(
    {},
    {
      get(_, functionName: string) {
        return (options: any = {}) => {
          return typedCallReadOnlyFunction({
            abi,
            contractAddress,
            contractName,
            functionName,
            senderAddress:
              options.senderAddress ?? defaultSenderAddress ?? contractAddress,
            network: options.network ?? defaultNetwork,
            client: options.client ?? defaultClient,
            ...options,
          });
        };
      },
    },
  );

  const call = new Proxy(
    {},
    {
      get(_, functionName: string) {
        return (options: any = {}) => {
          return typedMakeContractCall({
            abi,
            contractAddress,
            contractName,
            functionName,
            senderKey: options.senderKey ?? defaultSenderKey,
            network: options.network ?? defaultNetwork,
            ...options,
          });
        };
      },
    },
  );

  return {
    abi,
    contractAddress,
    contractName,
    read,
    call,
  } as unknown as GetContractReturnType<abi>;
}
