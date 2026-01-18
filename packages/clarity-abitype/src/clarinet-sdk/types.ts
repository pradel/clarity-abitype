export type { Simnet, ParsedTransactionResult } from "@stacks/clarinet-sdk";

/**
 * Typed version of ParsedTransactionResult where the result is converted to a primitive type.
 */
export interface TypedTransactionResult<T> {
  /** The result converted to a TypeScript primitive type */
  result: T;
  /** Events emitted during the transaction */
  events: {
    event: string;
    data: Record<string, unknown>;
  }[];
}
