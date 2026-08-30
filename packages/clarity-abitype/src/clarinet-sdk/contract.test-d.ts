import { describe, it, expectTypeOf } from "vite-plus/test";

import { sip10Abi } from "../abis/json.js";
import type { GetContractReturnType } from "./contract.js";

describe("getContract type tests (clarinet-sdk)", () => {
  it("infers public and read functions with strongly typed returns", () => {
    type Contract = GetContractReturnType<typeof sip10Abi>;

    // Public methods exist
    expectTypeOf<Contract["public"]["transfer"]>().toBeFunction();
    expectTypeOf<Contract["public"]["mint"]>().toBeFunction();

    // Read methods exist
    expectTypeOf<Contract["read"]["get-name"]>().toBeFunction();
    expectTypeOf<Contract["read"]["get-balance"]>().toBeFunction();

    // Result types
    type PublicTransferResult = ReturnType<
      Contract["public"]["transfer"]
    >["result"];
    expectTypeOf<PublicTransferResult>().toEqualTypeOf<
      { ok: boolean; error?: never } | { ok?: never; error: bigint }
    >();

    type ReadBalanceResult = ReturnType<
      Contract["read"]["get-balance"]
    >["result"];
    expectTypeOf<ReadBalanceResult>().toEqualTypeOf<
      { ok: bigint; error?: never } | { ok?: never; error: null }
    >();
  });
});
