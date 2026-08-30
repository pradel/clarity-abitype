import type { ClarityAbi } from "../abi.js";
import type { Prettify, UnionWiden } from "../types.js";
import {
  type TypedCallPublicFnFunctionArgs,
  type TypedCallPublicFnFunctionName,
  type TypedCallPublicFnReturnType,
  typedCallPublicFn,
} from "./call-public-fn.js";
import {
  type TypedCallReadOnlyFnFunctionArgs,
  type TypedCallReadOnlyFnFunctionName,
  type TypedCallReadOnlyFnReturnType,
  typedCallReadOnlyFn,
} from "./call-read-only-fn.js";
import type { Simnet } from "./types.js";

export type ContractPublicFnOptions<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallPublicFnFunctionName<abi> =
    TypedCallPublicFnFunctionName<abi>,
  args extends TypedCallPublicFnFunctionArgs<abi, functionName> =
    TypedCallPublicFnFunctionArgs<abi, functionName>,
> = {
  /** Optional transaction sender (defaults to contract instance sender or simnet.deployer) */
  sender?: string | undefined;
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

export type ContractReadOnlyFnOptions<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  functionName extends TypedCallReadOnlyFnFunctionName<abi> =
    TypedCallReadOnlyFnFunctionName<abi>,
  args extends TypedCallReadOnlyFnFunctionArgs<abi, functionName> =
    TypedCallReadOnlyFnFunctionArgs<abi, functionName>,
> = {
  /** Optional simulation sender (defaults to contract instance sender or simnet.deployer) */
  sender?: string | undefined;
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

export type GetContractParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = {
  /** The simnet instance from @stacks/clarinet-sdk */
  simnet: Simnet;
  /** The contract ABI */
  abi: abi;
  /** The contract name (without deployer prefix) */
  contract: string;
  /** Optional default sender address */
  sender?: string | undefined;
};

export type GetContractReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
> = Prettify<{
  simnet: Simnet;
  abi: abi;
  contract: string;
  public: {
    [functionName in TypedCallPublicFnFunctionName<abi>]: (
      options?: ContractPublicFnOptions<abi, functionName>,
    ) => TypedCallPublicFnReturnType<abi, functionName>;
  };
  read: {
    [functionName in TypedCallReadOnlyFnFunctionName<abi>]: (
      options?: ContractReadOnlyFnOptions<abi, functionName>,
    ) => TypedCallReadOnlyFnReturnType<abi, functionName>;
  };
}>;

/**
 * Gets a type-safe contract instance bound to a specific ABI and contract name for Clarinet SDK.
 *
 * @example
 * ```ts
 * import { getContract } from 'clarity-abitype/clarinet-sdk';
 *
 * const contract = getContract({
 *   simnet,
 *   abi: sip10Abi,
 *   contract: "my-token",
 * });
 *
 * // Public function call (mines a block)
 * const { result, events } = contract.public.transfer({
 *   args: [100n, "SP2C...", "SP3K...", null],
 *   sender: simnet.deployer,
 * });
 *
 * // Read-only function call
 * const { result: balance } = contract.read["get-balance"]({
 *   args: ["SP2C..."],
 *   sender: simnet.deployer,
 * });
 * ```
 */
export function getContract<const abi extends ClarityAbi | readonly unknown[]>(
  parameters: GetContractParameters<abi>,
): GetContractReturnType<abi> {
  const { simnet, abi, contract, sender: defaultSender } = parameters;

  const publicMethods = new Proxy(
    {},
    {
      get(_, functionName: string) {
        return (options: any = {}) => {
          return typedCallPublicFn({
            simnet,
            abi,
            contract,
            functionName,
            sender: options.sender ?? defaultSender ?? simnet.deployer,
            ...options,
          });
        };
      },
    },
  );

  const readMethods = new Proxy(
    {},
    {
      get(_, functionName: string) {
        return (options: any = {}) => {
          return typedCallReadOnlyFn({
            simnet,
            abi,
            contract,
            functionName,
            sender: options.sender ?? defaultSender ?? simnet.deployer,
            ...options,
          });
        };
      },
    },
  );

  return {
    simnet,
    abi,
    contract,
    public: publicMethods,
    read: readMethods,
  } as unknown as GetContractReturnType<abi>;
}
