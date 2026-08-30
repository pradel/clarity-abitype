import { describe, it, expectTypeOf } from "vite-plus/test";

import { sip10Abi } from "../abis/json.js";
import type { GetContractReturnType } from "./contract.js";

describe("getContract type tests (stacks-js)", () => {
  it("infers read and call functions with strongly typed returns", () => {
    type Contract = GetContractReturnType<typeof sip10Abi>;

    // Read methods exist
    expectTypeOf<Contract["read"]["get-name"]>().toBeFunction();
    expectTypeOf<Contract["read"]["get-balance"]>().toBeFunction();

    // Call methods exist
    expectTypeOf<Contract["call"]["transfer"]>().toBeFunction();
    expectTypeOf<Contract["call"]["mint"]>().toBeFunction();
  });
});
