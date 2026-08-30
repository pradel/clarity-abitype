import { describe, it, expect } from "vite-plus/test";

import {
  BaseError,
  AbiFunctionNotFoundError,
  AbiArgumentMismatchError,
  ContractExecutionError,
} from "./errors.js";

describe("BaseError", () => {
  it("formats error with docs and details", () => {
    const err = new BaseError("Something went wrong.", {
      details: "More info about the failure.",
      docsPath: "troubleshooting",
    });

    expect(err.name).toBe("ClarityAbitypeError");
    expect(err.shortMessage).toBe("Something went wrong.");
    expect(err.message).toContain("Something went wrong.");
    expect(err.message).toContain(
      "Docs: https://github.com/pradel/clarity-abitype#troubleshooting",
    );
    expect(err.message).toContain("Details: More info about the failure.");
  });

  it("extracts details from cause", () => {
    const cause = new Error("Network timeout");
    const err = new BaseError("Call failed.", { cause });

    expect(err.cause).toBe(cause);
    expect(err.message).toContain("Details: Network timeout");
  });
});

describe("AbiFunctionNotFoundError", () => {
  it("formats function name and access modifier", () => {
    const err = new AbiFunctionNotFoundError("transfer", { access: "public" });

    expect(err.name).toBe("AbiFunctionNotFoundError");
    expect(err.message).toContain(
      'Function "transfer" not found in ABI with access "public".',
    );
  });
});

describe("AbiArgumentMismatchError", () => {
  it("formats argument count mismatch", () => {
    const err = new AbiArgumentMismatchError({
      functionName: "transfer",
      expectedCount: 4,
      givenCount: 2,
    });

    expect(err.name).toBe("AbiArgumentMismatchError");
    expect(err.message).toContain(
      'Argument count mismatch for function "transfer": expected 4, got 2.',
    );
  });
});

describe("ContractExecutionError", () => {
  it("formats contract execution failure", () => {
    const err = new ContractExecutionError(new Error("RPC failure"), {
      contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
      contractName: "my-token",
      functionName: "transfer",
    });

    expect(err.name).toBe("ContractExecutionError");
    expect(err.message).toContain(
      'Execution failed for contract "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token" function "transfer".',
    );
    expect(err.message).toContain("Details: RPC failure");
  });
});
