import type { ClarityValue } from "@stacks/transactions";

/**
 * Represents an event emitted during a contract call.
 * Based on clarinet-sdk's event structure.
 */
export interface TransactionEvent {
  event: string;
  data: Record<string, unknown>;
}

/**
 * The result returned from calling a contract function in the clarinet-sdk.
 * This matches the ParsedTransactionResult type from @stacks/clarinet-sdk.
 */
export interface ParsedTransactionResult {
  /** The Clarity value result of the transaction */
  result: ClarityValue;
  /** Events emitted during the transaction */
  events: TransactionEvent[];
}

/**
 * Typed version of ParsedTransactionResult where the result is converted to a primitive type.
 */
export interface TypedTransactionResult<T> {
  /** The result converted to a TypeScript primitive type */
  result: T;
  /** Events emitted during the transaction */
  events: TransactionEvent[];
}

/**
 * Interface representing the simnet object from @stacks/clarinet-sdk.
 * This is used to type the simnet parameter in our wrapper functions.
 */
export interface Simnet {
  /**
   * Calls a read-only function without mining a block.
   */
  callReadOnlyFn(
    contract: string,
    method: string,
    args: ClarityValue[],
    sender: string,
  ): ParsedTransactionResult;

  /**
   * Calls a public function and mines a block.
   */
  callPublicFn(
    contract: string,
    method: string,
    args: ClarityValue[],
    sender: string,
  ): ParsedTransactionResult;

  /**
   * Calls a private function (testing only) and mines a block.
   */
  callPrivateFn(
    contract: string,
    method: string,
    args: ClarityValue[],
    sender: string,
  ): ParsedTransactionResult;

  /** The current block height of simnet */
  blockHeight: number;

  /** The default deployer address */
  deployer: string;

  /** The current epoch of simnet */
  currentEpoch: number;

  /** Get all configured Stacks addresses */
  getAccounts(): Map<string, string>;
}
