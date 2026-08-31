import { describe, it, expectTypeOf } from "vite-plus/test";

import { sbtcTokenAbi } from "../../tests/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.js";
import { sip10Abi } from "../abis/json.js";
import type {
  CallReadOnlyFnFunctionName,
  CallReadOnlyFnFunctionArgs,
  CallReadOnlyFnReturnType,
} from "./callReadOnlyFn.js";

describe("CallReadOnlyFnFunctionName", () => {
  it("extracts read_only function names from sip10Abi", () => {
    type ReadOnlyFunctions = CallReadOnlyFnFunctionName<typeof sip10Abi>;

    // Should include read_only functions
    expectTypeOf<"get-balance">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-decimals">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-name">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-symbol">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-token-uri">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-total-supply">().toMatchTypeOf<ReadOnlyFunctions>();

    // Should not include public functions
    expectTypeOf<"transfer">().not.toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"mint">().not.toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"burn">().not.toMatchTypeOf<ReadOnlyFunctions>();

    // Should not include private functions
    expectTypeOf<"pow-decimals">().not.toMatchTypeOf<ReadOnlyFunctions>();
  });

  it("extracts read_only function names from sbtcTokenAbi", () => {
    type ReadOnlyFunctions = CallReadOnlyFnFunctionName<typeof sbtcTokenAbi>;

    // Should include read_only functions
    expectTypeOf<"get-balance">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-balance-available">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-balance-locked">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-decimals">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-name">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-symbol">().toMatchTypeOf<ReadOnlyFunctions>();

    // Should not include public functions
    expectTypeOf<"transfer">().not.toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"protocol-mint">().not.toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"protocol-burn">().not.toMatchTypeOf<ReadOnlyFunctions>();
  });
});

describe("CallReadOnlyFnFunctionArgs", () => {
  it("infers correct args for get-balance (single principal)", () => {
    type Args = CallReadOnlyFnFunctionArgs<typeof sip10Abi, "get-balance">;

    expectTypeOf<Args>().toEqualTypeOf<readonly [string]>();
  });

  it("infers correct args for get-decimals (no args)", () => {
    type Args = CallReadOnlyFnFunctionArgs<typeof sip10Abi, "get-decimals">;

    expectTypeOf<Args>().toEqualTypeOf<readonly []>();
  });

  it("infers correct args for get-name (no args)", () => {
    type Args = CallReadOnlyFnFunctionArgs<typeof sip10Abi, "get-name">;

    expectTypeOf<Args>().toEqualTypeOf<readonly []>();
  });

  it("infers correct args for fixed-to-decimals (uint128)", () => {
    type Args = CallReadOnlyFnFunctionArgs<
      typeof sip10Abi,
      "fixed-to-decimals"
    >;

    expectTypeOf<Args>().toEqualTypeOf<readonly [bigint]>();
  });
});

describe("CallReadOnlyFnReturnType", () => {
  it("infers correct result type for get-balance", () => {
    type Return = CallReadOnlyFnReturnType<typeof sip10Abi, "get-balance">;
    type ResultType = Return["result"];

    // Response { ok: uint128, error: none }
    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: bigint; error?: never } | { ok?: never; error: null }
    >();
  });

  it("infers correct result type for get-decimals", () => {
    type Return = CallReadOnlyFnReturnType<typeof sip10Abi, "get-decimals">;
    type ResultType = Return["result"];

    // Response { ok: uint128, error: none }
    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: bigint; error?: never } | { ok?: never; error: null }
    >();
  });

  it("infers correct result type for get-name", () => {
    type Return = CallReadOnlyFnReturnType<typeof sip10Abi, "get-name">;
    type ResultType = Return["result"];

    // Response { ok: string-ascii, error: none }
    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: string; error?: never } | { ok?: never; error: null }
    >();
  });

  it("infers correct result type for get-token-uri", () => {
    type Return = CallReadOnlyFnReturnType<typeof sip10Abi, "get-token-uri">;
    type ResultType = Return["result"];

    // Response { ok: optional string-utf8, error: none }
    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: string | null; error?: never } | { ok?: never; error: null }
    >();
  });

  it("infers correct result type for fixed-to-decimals", () => {
    type Return = CallReadOnlyFnReturnType<
      typeof sip10Abi,
      "fixed-to-decimals"
    >;
    type ResultType = Return["result"];

    // Returns uint128 directly (not wrapped in response)
    expectTypeOf<ResultType>().toEqualTypeOf<bigint>();
  });

  it("events field is correctly typed", () => {
    type Return = CallReadOnlyFnReturnType<typeof sip10Abi, "get-balance">;
    type EventsType = Return["events"];

    expectTypeOf<EventsType>().toEqualTypeOf<
      { event: string; data: Record<string, unknown> }[]
    >();
  });
});

describe("CallReadOnlyFnReturnType with sbtcTokenAbi", () => {
  it("infers correct result type for get-balance", () => {
    type Return = CallReadOnlyFnReturnType<typeof sbtcTokenAbi, "get-balance">;
    type ResultType = Return["result"];

    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: bigint; error?: never } | { ok?: never; error: null }
    >();
  });

  it("infers correct result type for get-name", () => {
    type Return = CallReadOnlyFnReturnType<typeof sbtcTokenAbi, "get-name">;
    type ResultType = Return["result"];

    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: string; error?: never } | { ok?: never; error: null }
    >();
  });
});
