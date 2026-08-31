export type { Simnet, ParsedTransactionResult } from "@stacks/clarinet-sdk";

/**
 * Result of a transaction or call where the result is converted to a TypeScript primitive type.
 */
export interface TransactionResult<T> {
  /** The result converted to a TypeScript primitive type */
  result: T;
  /** Events emitted during the transaction */
  events: {
    event: string;
    data: Record<string, unknown>;
  }[];
}
