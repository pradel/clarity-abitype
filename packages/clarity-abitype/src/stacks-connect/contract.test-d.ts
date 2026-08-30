import { describe, it, expectTypeOf } from "vite-plus/test";

import { sip10Abi } from "../abis/json.js";
import type { GetContractReturnType } from "./contract.js";

describe("getContract type tests (stacks-connect)", () => {
  it("infers public functions and parameters", () => {
    type Contract = GetContractReturnType<typeof sip10Abi>;

    // Call methods exist
    expectTypeOf<Contract["call"]["transfer"]>().toBeFunction();
    expectTypeOf<Contract["call"]["mint"]>().toBeFunction();

    // Return types
    type TransferReturn = ReturnType<Contract["call"]["transfer"]>;
    expectTypeOf<TransferReturn>().toEqualTypeOf<Promise<string>>();
  });
});
