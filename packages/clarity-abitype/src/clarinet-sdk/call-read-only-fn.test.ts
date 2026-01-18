import { describe, it, expect, vi, expectTypeOf } from "vitest";
import {
  typedCallReadOnlyFn,
  TypedCallReadOnlyFnFunctionName,
  TypedCallReadOnlyFnFunctionArgs,
} from "./call-read-only-fn.js";
import { sip10Abi } from "../abis/json.js";
import { sbtcTokenAbi } from "../../tests/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.js";
import type { Simnet } from "./types.js";
import {
  uintCV,
  responseOkCV,
  stringAsciiCV,
  standardPrincipalCV,
} from "@stacks/transactions";
import type { ExtractAbiFunctionNames } from "../utils.js";

/**
 * Creates a mock simnet instance for testing.
 * We cast to Simnet since we only need to mock the methods we use.
 */
function createMockSimnet(
  callReadOnlyFnMock?: Simnet["callReadOnlyFn"],
): Simnet {
  return {
    callReadOnlyFn:
      callReadOnlyFnMock ??
      vi.fn().mockReturnValue({
        result: responseOkCV(uintCV(0n)),
        events: [],
      }),
    callPublicFn: vi.fn(),
    callPrivateFn: vi.fn(),
    blockHeight: 1,
    deployer: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    currentEpoch: "2.5",
    getAccounts: vi.fn().mockReturnValue(new Map()),
  } as unknown as Simnet;
}

describe("typedCallReadOnlyFn", () => {
  describe("type inference", () => {
    it("infers read_only function names correctly", () => {
      type ReadOnlyFunctions = TypedCallReadOnlyFnFunctionName<typeof sip10Abi>;

      // Should include read_only functions
      expectTypeOf<"get-balance">().toMatchTypeOf<ReadOnlyFunctions>();
      expectTypeOf<"get-decimals">().toMatchTypeOf<ReadOnlyFunctions>();
      expectTypeOf<"get-name">().toMatchTypeOf<ReadOnlyFunctions>();
      expectTypeOf<"get-symbol">().toMatchTypeOf<ReadOnlyFunctions>();

      // Should not include public functions
      expectTypeOf<"transfer">().not.toMatchTypeOf<ReadOnlyFunctions>();
      expectTypeOf<"mint">().not.toMatchTypeOf<ReadOnlyFunctions>();
    });

    it("infers function arguments correctly for get-balance", () => {
      type GetBalanceArgs = TypedCallReadOnlyFnFunctionArgs<
        typeof sip10Abi,
        "get-balance"
      >;

      // get-balance takes a single principal argument (who)
      expectTypeOf<GetBalanceArgs>().toMatchTypeOf<readonly [string]>();
    });

    it("infers empty arguments for get-decimals", () => {
      type GetDecimalsArgs = TypedCallReadOnlyFnFunctionArgs<
        typeof sip10Abi,
        "get-decimals"
      >;

      // get-decimals takes no arguments
      expectTypeOf<GetDecimalsArgs>().toMatchTypeOf<readonly []>();
    });

    it("extracts only read_only function names", () => {
      type AllReadOnlyFunctions = ExtractAbiFunctionNames<
        typeof sip10Abi,
        "read_only"
      >;

      // Verify read_only functions are included
      expectTypeOf<"get-balance">().toMatchTypeOf<AllReadOnlyFunctions>();
      expectTypeOf<"get-decimals">().toMatchTypeOf<AllReadOnlyFunctions>();
      expectTypeOf<"get-name">().toMatchTypeOf<AllReadOnlyFunctions>();

      // Verify public functions are excluded
      expectTypeOf<"transfer">().not.toMatchTypeOf<AllReadOnlyFunctions>();
      expectTypeOf<"mint">().not.toMatchTypeOf<AllReadOnlyFunctions>();
    });
  });

  describe("function behavior", () => {
    it("calls simnet.callReadOnlyFn with correct arguments for get-decimals", () => {
      const mockCallReadOnlyFn = vi.fn().mockReturnValue({
        result: responseOkCV(uintCV(8n)),
        events: [],
      });
      const simnet = createMockSimnet(mockCallReadOnlyFn);

      const result = typedCallReadOnlyFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "get-decimals",
        sender: simnet.deployer,
      });

      expect(mockCallReadOnlyFn).toHaveBeenCalledWith(
        "my-token",
        "get-decimals",
        [],
        simnet.deployer,
      );
      expect(result.result).toEqual({ ok: 8n });
      expect(result.events).toEqual([]);
    });

    it("calls simnet.callReadOnlyFn with correct arguments for get-balance", () => {
      const mockCallReadOnlyFn = vi.fn().mockReturnValue({
        result: responseOkCV(uintCV(1000n)),
        events: [],
      });
      const simnet = createMockSimnet(mockCallReadOnlyFn);
      const wallet = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

      const result = typedCallReadOnlyFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "get-balance",
        functionArgs: [wallet],
        sender: simnet.deployer,
      });

      expect(mockCallReadOnlyFn).toHaveBeenCalledWith(
        "my-token",
        "get-balance",
        [standardPrincipalCV(wallet)],
        simnet.deployer,
      );
      expect(result.result).toEqual({ ok: 1000n });
    });

    it("calls simnet.callReadOnlyFn with correct arguments for get-name", () => {
      const mockCallReadOnlyFn = vi.fn().mockReturnValue({
        result: responseOkCV(stringAsciiCV("My Token")),
        events: [],
      });
      const simnet = createMockSimnet(mockCallReadOnlyFn);

      const result = typedCallReadOnlyFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "get-name",
        sender: simnet.deployer,
      });

      expect(mockCallReadOnlyFn).toHaveBeenCalledWith(
        "my-token",
        "get-name",
        [],
        simnet.deployer,
      );
      expect(result.result).toEqual({ ok: "My Token" });
    });

    it("returns events from the transaction result", () => {
      const mockEvents = [{ event: "print_event", data: { value: "test" } }];
      const mockCallReadOnlyFn = vi.fn().mockReturnValue({
        result: responseOkCV(uintCV(42n)),
        events: mockEvents,
      });
      const simnet = createMockSimnet(mockCallReadOnlyFn);

      const result = typedCallReadOnlyFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "get-total-supply",
        sender: simnet.deployer,
      });

      expect(result.events).toEqual(mockEvents);
    });

    it("throws for non-existent function name", () => {
      const simnet = createMockSimnet();

      expect(() =>
        // Using Function cast to bypass type checking for runtime error test
        (typedCallReadOnlyFn as Function)({
          simnet,
          abi: sip10Abi,
          contract: "my-token",
          functionName: "non-existent-function",
          sender: simnet.deployer,
        }),
      ).toThrow(
        'Function "non-existent-function" not found in ABI or is not a read_only function',
      );
    });

    it("throws for public function name", () => {
      const simnet = createMockSimnet();

      expect(() =>
        // Using Function cast to bypass type checking for runtime error test
        (typedCallReadOnlyFn as Function)({
          simnet,
          abi: sip10Abi,
          contract: "my-token",
          functionName: "transfer",
          sender: simnet.deployer,
        }),
      ).toThrow(
        'Function "transfer" not found in ABI or is not a read_only function',
      );
    });
  });

  describe("with sbtc-token ABI", () => {
    it("calls get-balance correctly", () => {
      const mockCallReadOnlyFn = vi.fn().mockReturnValue({
        result: responseOkCV(uintCV(500000000n)),
        events: [],
      });
      const simnet = createMockSimnet(mockCallReadOnlyFn);
      const wallet = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

      const result = typedCallReadOnlyFn({
        simnet,
        abi: sbtcTokenAbi,
        contract: "sbtc-token",
        functionName: "get-balance",
        functionArgs: [wallet],
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ ok: 500000000n });
    });

    it("calls get-name correctly", () => {
      const mockCallReadOnlyFn = vi.fn().mockReturnValue({
        result: responseOkCV(stringAsciiCV("sBTC")),
        events: [],
      });
      const simnet = createMockSimnet(mockCallReadOnlyFn);

      const result = typedCallReadOnlyFn({
        simnet,
        abi: sbtcTokenAbi,
        contract: "sbtc-token",
        functionName: "get-name",
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ ok: "sBTC" });
    });

    it("calls get-symbol correctly", () => {
      const mockCallReadOnlyFn = vi.fn().mockReturnValue({
        result: responseOkCV(stringAsciiCV("sBTC")),
        events: [],
      });
      const simnet = createMockSimnet(mockCallReadOnlyFn);

      const result = typedCallReadOnlyFn({
        simnet,
        abi: sbtcTokenAbi,
        contract: "sbtc-token",
        functionName: "get-symbol",
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ ok: "sBTC" });
    });

    it("calls get-decimals correctly", () => {
      const mockCallReadOnlyFn = vi.fn().mockReturnValue({
        result: responseOkCV(uintCV(8n)),
        events: [],
      });
      const simnet = createMockSimnet(mockCallReadOnlyFn);

      const result = typedCallReadOnlyFn({
        simnet,
        abi: sbtcTokenAbi,
        contract: "sbtc-token",
        functionName: "get-decimals",
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ ok: 8n });
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
        functionName: "get-balance" as const,
        functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"] as const,
        sender: simnet.deployer,
      };

      // Verify the config has the correct shape
      expectTypeOf(validConfig.functionName).toEqualTypeOf<"get-balance">();
      expectTypeOf(validConfig.functionArgs).toMatchTypeOf<readonly [string]>();
    });

    it("allows omitting functionArgs for no-arg functions", () => {
      const mockCallReadOnlyFn = vi.fn().mockReturnValue({
        result: responseOkCV(uintCV(8n)),
        events: [],
      });
      const simnet = createMockSimnet(mockCallReadOnlyFn);

      // This should compile without functionArgs
      const result = typedCallReadOnlyFn({
        simnet,
        abi: sip10Abi,
        contract: "my-token",
        functionName: "get-decimals",
        sender: simnet.deployer,
      });

      expect(result.result).toEqual({ ok: 8n });
    });
  });
});
