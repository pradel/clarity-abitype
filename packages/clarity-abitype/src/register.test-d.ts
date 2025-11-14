import { assertType, test } from "vitest";
import type { ResolvedRegister } from "./register.js";

test("ResolvedRegister", () => {
  assertType<ResolvedRegister["fixedArrayMinLength"]>(1);
  assertType<ResolvedRegister["fixedArrayMaxLength"]>(99);

  type AddressType = ResolvedRegister["addressType"];
  assertType<AddressType>("SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4");
  assertType<AddressType>(
    "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token",
  );

  type BytesType = ResolvedRegister["bytesType"];
  assertType<BytesType>({
    inputs: "0xfoobarbaz",
    outputs: "0xfoobarbaz",
  });

  type BigIntType = ResolvedRegister["bigIntType"];
  assertType<BigIntType>(123n);

  type StrictAbiType = ResolvedRegister["strictAbiType"];
  assertType<StrictAbiType>(false);
});
