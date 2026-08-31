import { assertType, test } from "vite-plus/test";

import type { ResolvedRegister } from "./register.js";

test("ResolvedRegister", () => {
  assertType<ResolvedRegister["FixedArrayMinLength"]>(1);
  assertType<ResolvedRegister["FixedArrayMaxLength"]>(99);

  type AddressType = ResolvedRegister["AddressType"];
  assertType<AddressType>("SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4");
  assertType<AddressType>(
    "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token",
  );

  type BytesType = ResolvedRegister["BytesType"];
  assertType<BytesType>({
    inputs: "0xfoobarbaz",
    outputs: "0xfoobarbaz",
  });

  type BigIntType = ResolvedRegister["BigIntType"];
  assertType<BigIntType>(123n);

  type StrictAbiType = ResolvedRegister["StrictAbiType"];
  assertType<StrictAbiType>(false);

  // ListMaxDepth defaults to false (unlimited depth)
  type ListMaxDepth = ResolvedRegister["ListMaxDepth"];
  assertType<ListMaxDepth>(false);
});
