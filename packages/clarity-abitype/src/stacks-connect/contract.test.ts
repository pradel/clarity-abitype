import { uintCV, standardPrincipalCV, noneCV } from "@stacks/transactions";
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

import { sip10Abi } from "../abis/json.js";
import { getContract } from "./contract.js";

vi.mock("@stacks/connect", () => ({
  request: vi.fn(),
}));

import { request } from "@stacks/connect";

describe("getContract (stacks-connect)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a contract instance with call proxy", () => {
    const contract = getContract({
      abi: sip10Abi,
      contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
    });

    expect(contract.contract).toBe(
      "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
    );
    expect(contract.call).toBeDefined();
  });

  it("calls public functions via contract.call", async () => {
    const mockRequest = request as ReturnType<typeof vi.fn>;
    mockRequest.mockImplementation(async () => {
      return Promise.resolve({ txid: "0xconnect123" });
    });

    const contract = getContract({
      abi: sip10Abi,
      contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
    });

    const txId = await contract.call.transfer({
      functionArgs: [
        100n,
        "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
        null,
      ],
      network: "mainnet",
    });

    expect(txId).toBe("0xconnect123");
    expect(mockRequest).toHaveBeenCalledWith(
      "stx_callContract",
      expect.objectContaining({
        contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
        functionName: "transfer",
        functionArgs: [
          uintCV(100n),
          standardPrincipalCV("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
          standardPrincipalCV("SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"),
          noneCV(),
        ],
      }),
    );
  });
});
