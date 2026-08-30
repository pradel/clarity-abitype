import { hexToBytes } from "@stacks/common";
import {
  uintCV,
  responseOkCV,
  responseErrorCV,
  trueCV,
  standardPrincipalCV,
  noneCV,
  bufferCV,
} from "@stacks/transactions";
import { describe, it, expect, vi, expectTypeOf } from "vite-plus/test";

import { sbtcTokenAbi } from "../../tests/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.js";
import { sip10Abi } from "../abis/json.js";
import type { ExtractAbiFunctionNames } from "../utils.js";
import { typedCallPublicFn } from "./call-public-fn.js";
import type {
  TypedCallPublicFnFunctionName,
  TypedCallPublicFnFunctionArgs,
} from "./call-public-fn.js";
import type { Simnet } from "./types.js";

/**
 * Creates a mock simnet instance for testing.
 * We cast to Simnet since we only need to mock the methods we use.
 */
function createMockSimnet(callPublicFnMock?: Simnet["callPublicFn"]): Simnet {
  return {
    callReadOnlyFn: vi.fn(),
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

describe("typedCallPublicFn", () => {
  describe("type inference", () => {
    it("infers public function names correctly", () => {
      type PublicFunctions = TypedCallPublicFnFunctionName<typeof sip10Abi>;

      // Should include public functions
      expectTypeOf<"transfer">().toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"mint">().toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"burn">().toMatchTypeOf<PublicFunctions>();

      // Should not include read_only functions
      expectTypeOf<"get-balance">().not.toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"get-decimals">().not.toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"get-name">().not.toMatchTypeOf<PublicFunctions>();
    });

    it("infers function arguments correctly for transfer", () => {
      type TransferArgs = TypedCallPublicFnFunctionArgs<
        typeof sip10Abi,
        "transfer"
      >;

      // transfer takes (amount: uint128, sender: principal, recipient: principal, memo: optional buffer)
      expectTypeOf<TransferArgs>().toMatchTypeOf<
        readonly [bigint | number, string, string, string | null]
      >();
    });

    it("infers function arguments correctly for mint", () => {
      type MintArgs = TypedCallPublicFnFunctionArgs<typeof sip10Abi, "mint">;

      // mint takes (amount: uint128, recipient: principal)
      expectTypeOf<MintArgs>().toMatchTypeOf<
        readonly [bigint | number, string]
      >();
    });

    it("extracts only public function names", () => {
      type AllPublicFunctions = ExtractAbiFunctionNames<
        typeof sip10Abi,
        "public"
      >;

      // Verify public functions are included
      expectTypeOf<"transfer">().toMatchTypeOf<AllPublicFunctions>();
      expectTypeOf<"mint">().toMatchTypeOf<AllPublicFunctions>();
      expectTypeOf<"burn">().toMatchTypeOf<AllPublicFunctions>();

      // Verify read_only functions are excluded
      expectTypeOf<"get-balance">().not.toMatchTypeOf<AllPublicFunctions>();
      expectTypeOf<"get-decimals">().not.toMatchTypeOf<AllPublicFunctions>();
    });
  });

  describe("function behavior", () => {
    it("calls simnet.callPublicFn with correct arguments for mint", () => {
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: [],
      });
      const simnet = createMockSimnet(mockCallPublicFn);
      const recipient = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

      const result = typedCallPublicFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "mint",
        functionArgs: [1000n, recipient],
        sender: simnet.deployer,
      });

      expect(mockCallPublicFn).toHaveBeenCalledWith(
        "my-token",
        "mint",
        [uintCV(1000n), standardPrincipalCV(recipient)],
        simnet.deployer,
      );
      expect(result.result).toEqual({ ok: true });
      expect(result.events).toEqual([]);
    });

    it("calls simnet.callPublicFn with correct arguments for transfer", () => {
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: [
          {
            event: "ft_transfer_event",
            data: {
              amount: "100",
              asset_identifier: "my-token::bridged-btc",
              sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
              recipient: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
            },
          },
        ],
      });
      const simnet = createMockSimnet(mockCallPublicFn);
      const sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
      const recipient = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

      const result = typedCallPublicFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "transfer",
        functionArgs: [100n, sender, recipient, null],
        sender: simnet.deployer,
      });

      expect(mockCallPublicFn).toHaveBeenCalledWith(
        "my-token",
        "transfer",
        [
          uintCV(100n),
          standardPrincipalCV(sender),
          standardPrincipalCV(recipient),
          noneCV(),
        ],
        simnet.deployer,
      );
      expect(result.result).toEqual({ ok: true });
      expect(result.events).toHaveLength(1);
      expect(result.events[0].event).toBe("ft_transfer_event");
    });

    it("handles transfer with memo", () => {
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: [],
      });
      const simnet = createMockSimnet(mockCallPublicFn);
      const sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
      const recipient = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";
      const memo = "0xdeadbeef";

      const result = typedCallPublicFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "transfer",
        functionArgs: [100n, sender, recipient, memo],
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ ok: true });
    });

    it("returns error response when transaction fails", () => {
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseErrorCV(uintCV(100n)),
        events: [],
      });
      const simnet = createMockSimnet(mockCallPublicFn);

      const result = typedCallPublicFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "mint",
        functionArgs: [1000n, "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ error: 100n });
    });

    it("returns events from the transaction result", () => {
      const mockEvents = [
        {
          event: "ft_mint_event",
          data: {
            amount: "1000",
            asset_identifier: "my-token::bridged-btc",
            recipient: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          },
        },
        {
          event: "print_event",
          data: { value: "minted tokens" },
        },
      ];
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: mockEvents,
      });
      const simnet = createMockSimnet(mockCallPublicFn);

      const result = typedCallPublicFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "mint",
        functionArgs: [1000n, "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
        sender: simnet.deployer,
      });

      expect(result.events).toEqual(mockEvents);
      expect(result.events).toHaveLength(2);
    });

    it("throws for non-existent function name", () => {
      const simnet = createMockSimnet();

      expect(() =>
        // Using any to bypass type checking for runtime error test
        (typedCallPublicFn as Function)({
          simnet,
          abi: sip10Abi,
          contract: "my-token",
          functionName: "non-existent-function",
          functionArgs: [],
          sender: simnet.deployer,
        }),
      ).toThrow(
        'Function "non-existent-function" not found in ABI with access "public"',
      );
    });

    it("throws for read_only function name", () => {
      const simnet = createMockSimnet();

      expect(() =>
        // Using any to bypass type checking for runtime error test
        (typedCallPublicFn as Function)({
          simnet,
          abi: sip10Abi,
          contract: "my-token",
          functionName: "get-balance",
          functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
          sender: simnet.deployer,
        }),
      ).toThrow('Function "get-balance" not found in ABI with access "public"');
    });

    it("throws for argument count mismatch", () => {
      const simnet = createMockSimnet();

      expect(() =>
        (typedCallPublicFn as Function)({
          simnet,
          abi: sip10Abi,
          contract: "my-token",
          functionName: "transfer",
          functionArgs: [100n],
          sender: simnet.deployer,
        }),
      ).toThrow(
        'Argument count mismatch for function "transfer": expected 4, got 1.',
      );
    });

    it("throws ContractExecutionError when execution throws", () => {
      const mockCallPublic = vi.fn().mockImplementation(() => {
        throw new Error("Simnet failure");
      });
      const simnet = createMockSimnet(mockCallPublic);

      expect(() =>
        (typedCallPublicFn as Function)({
          simnet,
          abi: sip10Abi,
          contract: "my-token",
          functionName: "transfer",
          functionArgs: [
            100n,
            "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
            "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9",
            null,
          ],
          sender: simnet.deployer,
        }),
      ).toThrow(
        'Execution failed for contract "my-token" function "transfer".',
      );
    });
  });

  describe("with sbtc-token ABI", () => {
    it("calls transfer correctly", () => {
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: [],
      });
      const simnet = createMockSimnet(mockCallPublicFn);
      const sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
      const recipient = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

      const result = typedCallPublicFn({
        simnet,
        abi: sbtcTokenAbi,
        contract: "sbtc-token",
        functionName: "transfer",
        functionArgs: [100000000n, sender, recipient, null],
        sender: simnet.deployer,
      });

      expect(mockCallPublicFn).toHaveBeenCalledWith(
        "sbtc-token",
        "transfer",
        [
          uintCV(100000000n),
          standardPrincipalCV(sender),
          standardPrincipalCV(recipient),
          noneCV(),
        ],
        simnet.deployer,
      );
      expect(result.result).toEqual({ ok: true });
    });

    it("calls protocol-mint correctly", () => {
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: [],
      });
      const simnet = createMockSimnet(mockCallPublicFn);
      const recipient = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";
      const contractFlag = "0x00";

      const result = typedCallPublicFn({
        simnet,
        abi: sbtcTokenAbi,
        contract: "sbtc-token",
        functionName: "protocol-mint",
        functionArgs: [100000000n, recipient, contractFlag],
        sender: simnet.deployer,
      });

      expect(mockCallPublicFn).toHaveBeenCalledWith(
        "sbtc-token",
        "protocol-mint",
        [
          uintCV(100000000n),
          standardPrincipalCV(recipient),
          bufferCV(hexToBytes("00")),
        ],
        simnet.deployer,
      );
      expect(result.result).toEqual({ ok: true });
    });

    it("calls protocol-burn correctly", () => {
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: [],
      });
      const simnet = createMockSimnet(mockCallPublicFn);
      const owner = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";
      const contractFlag = "0x01";

      const result = typedCallPublicFn({
        simnet,
        abi: sbtcTokenAbi,
        contract: "sbtc-token",
        functionName: "protocol-burn",
        functionArgs: [50000000n, owner, contractFlag],
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ ok: true });
    });

    it("calls protocol-set-name correctly", () => {
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: [],
      });
      const simnet = createMockSimnet(mockCallPublicFn);
      const newName = "Wrapped sBTC";
      const contractFlag = "0x00";

      const result = typedCallPublicFn({
        simnet,
        abi: sbtcTokenAbi,
        contract: "sbtc-token",
        functionName: "protocol-set-name",
        functionArgs: [newName, contractFlag],
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ ok: true });
    });
  });

  describe("parameter validation", () => {
    it("accepts valid parameters matching the ABI", () => {
      const simnet = createMockSimnet();

      // This test verifies compile-time type checking
      const validConfig = {
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "transfer" as const,
        functionArgs: [
          100n,
          "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9",
          null,
        ] as const,
        sender: simnet.deployer,
      };

      // Verify the config has the correct shape
      expectTypeOf(validConfig.functionName).toEqualTypeOf<"transfer">();
      expectTypeOf(validConfig.functionArgs).toMatchTypeOf<
        readonly [bigint, string, string, null]
      >();
    });

    it("handles bigint as amount", () => {
      const mockCallPublicFn = vi.fn().mockReturnValue({
        result: responseOkCV(trueCV()),
        events: [],
      });
      const simnet = createMockSimnet(mockCallPublicFn);

      const result = typedCallPublicFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "mint",
        functionArgs: [1000n, "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ ok: true });
    });
  });
});
