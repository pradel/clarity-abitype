import {
  uintCV,
  responseOkCV,
  trueCV,
  standardPrincipalCV,
  noneCV,
} from "@stacks/transactions";
import { describe, it, expect, vi } from "vite-plus/test";

import { sip10Abi } from "../abis/json.js";
import { getContract } from "./contract.js";
import type { Simnet } from "./types.js";

function createMockSimnet(
  callPublicFnMock?: Simnet["callPublicFn"],
  callReadOnlyFnMock?: Simnet["callReadOnlyFn"],
): Simnet {
  return {
    callReadOnlyFn:
      callReadOnlyFnMock ??
      vi.fn().mockReturnValue({
        result: responseOkCV(uintCV(1000n)),
        events: [],
      }),
    callPublicFn:
      callPublicFnMock ??
      vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: [],
      }),
    callPrivateFn: vi.fn(),
    blockHeight: 1,
    deployer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    currentEpoch: "2.5",
    getAccounts: vi.fn().mockReturnValue(new Map()),
  } as unknown as Simnet;
}

describe("getContract (clarinet-sdk)", () => {
  it("creates a contract instance with public and read proxies", () => {
    const simnet = createMockSimnet();
    const contract = getContract({
      simnet,
      abi: sip10Abi,
      contract: "my-token",
    });

    expect(contract.contract).toBe("my-token");
    expect(contract.public).toBeDefined();
    expect(contract.read).toBeDefined();
  });

  it("calls public functions via contract.public", () => {
    const mockCallPublic = vi.fn().mockReturnValue({
      result: responseOkCV(trueCV()),
      events: [],
    });
    const simnet = createMockSimnet(mockCallPublic);

    const contract = getContract({
      simnet,
      abi: sip10Abi,
      contract: "my-token",
    });

    const sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
    const recipient = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

    const { result, events } = contract.public.transfer({
      functionArgs: [100n, sender, recipient, null],
      sender,
    });

    expect(result).toEqual({ ok: true });
    expect(events).toEqual([]);
    expect(mockCallPublic).toHaveBeenCalledWith(
      "my-token",
      "transfer",
      [
        uintCV(100n),
        standardPrincipalCV(sender),
        standardPrincipalCV(recipient),
        noneCV(),
      ],
      sender,
    );
  });

  it("calls read-only functions via contract.read", () => {
    const mockCallReadOnly = vi.fn().mockReturnValue({
      result: responseOkCV(uintCV(42n)),
      events: [],
    });
    const simnet = createMockSimnet(undefined, mockCallReadOnly);

    const contract = getContract({
      simnet,
      abi: sip10Abi,
      contract: "my-token",
    });

    const { result } = contract.read["get-balance"]({
      functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
    });

    expect(result).toEqual({ ok: 42n });
    expect(mockCallReadOnly).toHaveBeenCalledWith(
      "my-token",
      "get-balance",
      [standardPrincipalCV("SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR")],
      simnet.deployer,
    );
  });
});
