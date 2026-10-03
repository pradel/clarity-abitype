import type { ClarityAbi } from "./abi.js";

export type MaybePromise<type> = type | Promise<type>;

/**
 * A contract to generate an ABI declaration for.
 */
export type ContractConfig = {
  /** Pre-resolved contract ABI. When omitted, it is fetched from the Stacks API. */
  abi?: ClarityAbi | undefined;
  /** Contract identifier, e.g. `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`. */
  contract: string;
  /** Name used to derive the generated ABI export. */
  name: string;
};

/**
 * clarity-abitype CLI configuration.
 */
export type Config = {
  /** Stacks API base URL used to fetch contract ABIs. */
  apiUrl?: string | undefined;
  /** Contracts to generate ABIs for. */
  contracts: ContractConfig[];
  /** Output file path, relative to the current working directory. */
  out?: string | undefined;
};

export const defaultConfig = {
  apiUrl: "https://api.mainnet.hiro.so",
  contracts: [],
  out: "src/generated.ts",
} satisfies Config;

export function defineConfig(
  config: Config | (() => MaybePromise<Config>),
): Config | (() => MaybePromise<Config>) {
  return config;
}
