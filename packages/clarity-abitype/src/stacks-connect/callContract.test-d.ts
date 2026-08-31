import { describe, it, expectTypeOf } from "vite-plus/test";

import { sbtcTokenAbi } from "../../tests/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.js";
import { sip10Abi } from "../abis/json.js";
import type {
  CallContractFunctionName,
  CallContractFunctionArgs,
} from "./callContract.js";

describe("CallContractFunctionName", () => {
  it("extracts public function names from sip10Abi", () => {
    type PublicFunctions = CallContractFunctionName<typeof sip10Abi>;

    expectTypeOf<"transfer">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"mint">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"burn">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"burn-fixed">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"set-name">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"set-symbol">().toMatchTypeOf<PublicFunctions>();

    expectTypeOf<"get-balance">().not.toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"get-decimals">().not.toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"get-name">().not.toMatchTypeOf<PublicFunctions>();

    expectTypeOf<"pow-decimals">().not.toMatchTypeOf<PublicFunctions>();
  });

  it("extracts public function names from sbtcTokenAbi", () => {
    type PublicFunctions = CallContractFunctionName<typeof sbtcTokenAbi>;

    expectTypeOf<"transfer">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"transfer-many">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"protocol-mint">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"protocol-burn">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"protocol-lock">().toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"protocol-unlock">().toMatchTypeOf<PublicFunctions>();

    expectTypeOf<"get-balance">().not.toMatchTypeOf<PublicFunctions>();
    expectTypeOf<"get-name">().not.toMatchTypeOf<PublicFunctions>();

    expectTypeOf<"protocol-mint-many-iter">().not.toMatchTypeOf<PublicFunctions>();
  });
});

describe("CallContractFunctionArgs", () => {
  it("infers correct args for transfer", () => {
    type Args = CallContractFunctionArgs<typeof sip10Abi, "transfer">;

    // transfer(amount: uint128, sender: principal, recipient: principal, memo: optional buffer)
    expectTypeOf<Args>().toMatchTypeOf<
      readonly [bigint | number, string, string, string | null]
    >();
  });

  it("infers correct args for mint", () => {
    type Args = CallContractFunctionArgs<typeof sip10Abi, "mint">;

    // mint(amount: uint128, recipient: principal)
    expectTypeOf<Args>().toEqualTypeOf<readonly [bigint, string]>();
  });

  it("infers correct args for burn", () => {
    type Args = CallContractFunctionArgs<typeof sip10Abi, "burn">;

    // burn(amount: uint128, sender: principal)
    expectTypeOf<Args>().toEqualTypeOf<readonly [bigint, string]>();
  });

  it("infers correct args for set-name", () => {
    type Args = CallContractFunctionArgs<typeof sip10Abi, "set-name">;

    // set-name(new-name: string-ascii)
    expectTypeOf<Args>().toEqualTypeOf<readonly [string]>();
  });

  it("infers correct args for protocol-mint from sbtcTokenAbi", () => {
    type Args = CallContractFunctionArgs<typeof sbtcTokenAbi, "protocol-mint">;

    // protocol-mint(amount: uint128, recipient: principal, contract-flag: buffer)
    expectTypeOf<Args>().toEqualTypeOf<
      readonly [bigint, string, `0x${string}`]
    >();
  });

  it("infers correct args for protocol-set-name from sbtcTokenAbi", () => {
    type Args = CallContractFunctionArgs<
      typeof sbtcTokenAbi,
      "protocol-set-name"
    >;

    // protocol-set-name(new-name: string-ascii, contract-flag: buffer)
    expectTypeOf<Args>().toEqualTypeOf<readonly [string, `0x${string}`]>();
  });
});
