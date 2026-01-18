import { describe, it, expectTypeOf } from "vitest";
import {
  TypedCallPublicFnFunctionName,
  TypedCallPublicFnFunctionArgs,
  TypedCallPublicFnReturnType,
} from "./call-public-fn.js";
import { sip10Abi } from "../abis/json.js";
import { sbtcTokenAbi } from "../../tests/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.js";

describe("TypedCallPublicFnFunctionName", () => {
  it("extracts public function names from sip10Abi", () => {
    type PublicFunctions = TypedCallPublicFnFunctionName<typeof sip10Abi>;

    // Should include public functions
    expectTypeOf<"transfer">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"mint">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"burn">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"burn-fixed">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"set-name">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"set-symbol">().toMatchTypeOf<PublicFunctions>();

    // Should not include read_only functions
    expectTypeOf<"get-balance">().not.toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"get-decimals">().not.toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"get-name">().not.toMatchTypeOf<PublicFunctions>();

    // Should not include private functions
    expectTypeOf<"pow-decimals">().not.toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"burn-fixed-many-iter">().not.toMatchTypeOf<PublicFunctions>();
  });

  it("extracts public function names from sbtcTokenAbi", () => {
    type PublicFunctions = TypedCallPublicFnFunctionName<typeof sbtcTokenAbi>;

    // Should include public functions
    expectTypeOf<"transfer">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"transfer-many">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"protocol-mint">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"protocol-burn">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"protocol-lock">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"protocol-unlock">().toMatchTypeOf<PublicFunctions>();

    // Should not include read_only functions
    expectTypeOf<"get-balance">().not.toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"get-name">().not.toMatchTypeOf<PublicFunctions>();

    // Should not include private functions
    expectTypeOf<"protocol-mint-many-iter">().not.toMatchTypeOf<PublicFunctions>();
  });
});

describe("TypedCallPublicFnFunctionArgs", () => {
  it("infers correct args for mint", () => {
    type Args = TypedCallPublicFnFunctionArgs<typeof sip10Abi, "mint">;

    // mint(amount: uint128, recipient: principal)
    expectTypeOf<Args>().toEqualTypeOf<readonly [bigint, string]>();
  });

  it("infers correct args for burn", () => {
    type Args = TypedCallPublicFnFunctionArgs<typeof sip10Abi, "burn">;

    // burn(amount: uint128, sender: principal)
    expectTypeOf<Args>().toEqualTypeOf<readonly [bigint, string]>();
  });

  it("infers correct args for set-name", () => {
    type Args = TypedCallPublicFnFunctionArgs<typeof sip10Abi, "set-name">;

    // set-name(new-name: string-ascii)
    expectTypeOf<Args>().toEqualTypeOf<readonly [string]>();
  });

  it("infers correct args for set-decimals", () => {
    type Args = TypedCallPublicFnFunctionArgs<typeof sip10Abi, "set-decimals">;

    // set-decimals(new-decimals: uint128)
    expectTypeOf<Args>().toEqualTypeOf<readonly [bigint]>();
  });

  it("infers correct args for protocol-mint from sbtcTokenAbi", () => {
    type Args = TypedCallPublicFnFunctionArgs<
      typeof sbtcTokenAbi,
      "protocol-mint"
    >;

    // protocol-mint(amount: uint128, recipient: principal, contract-flag: buffer)
    expectTypeOf<Args>().toEqualTypeOf<
      readonly [bigint, string, `0x${string}`]
    >();
  });
});

describe("TypedCallPublicFnReturnType", () => {
  it("infers correct result type for mint", () => {
    type Return = TypedCallPublicFnReturnType<typeof sip10Abi, "mint">;
    type ResultType = Return["result"];

    // Response { ok: bool, error: uint128 }
    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: boolean; error?: never } | { ok?: never; error: bigint }
    >();
  });

  it("infers correct result type for burn", () => {
    type Return = TypedCallPublicFnReturnType<typeof sip10Abi, "burn">;
    type ResultType = Return["result"];

    // Response { ok: bool, error: uint128 }
    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: boolean; error?: never } | { ok?: never; error: bigint }
    >();
  });

  it("events field is correctly typed", () => {
    type Return = TypedCallPublicFnReturnType<typeof sip10Abi, "mint">;
    type EventsType = Return["events"];

    expectTypeOf<EventsType>().toEqualTypeOf<
      { event: string; data: Record<string, unknown> }[]
    >();
  });
});

describe("TypedCallPublicFnReturnType with sbtcTokenAbi", () => {
  it("infers correct result type for protocol-mint", () => {
    type Return = TypedCallPublicFnReturnType<
      typeof sbtcTokenAbi,
      "protocol-mint"
    >;
    type ResultType = Return["result"];

    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: boolean; error?: never } | { ok?: never; error: bigint }
    >();
  });

  it("infers correct result type for protocol-burn", () => {
    type Return = TypedCallPublicFnReturnType<
      typeof sbtcTokenAbi,
      "protocol-burn"
    >;
    type ResultType = Return["result"];

    expectTypeOf<ResultType>().toEqualTypeOf<
      { ok: boolean; error?: never } | { ok?: never; error: bigint }
    >();
  });
});
