import { uintCV, standardPrincipalCV, noneCV } from "@stacks/transactions";
import {
  describe,
  it,
  expect,
  vi,
  expectTypeOf,
  beforeEach,
} from "vite-plus/test";

import { sbtcTokenAbi } from "../../tests/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.js";
import { sip10Abi } from "../abis/json.js";
import { typedCallContract } from "./contract-call.js";
import type {
  TypedCallContractFunctionName,
  TypedCallContractFunctionArgs,
} from "./contract-call.js";

vi.mock("@stacks/connect", () => ({
  request: vi.fn(),
}));

import { request } from "@stacks/connect";

describe("typedCallContract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("type inference", () => {
    it("infers public function names correctly", () => {
      type PublicFunctions = TypedCallContractFunctionName<typeof sip10Abi>;

      expectTypeOf<"transfer">().toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"mint">().toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"burn">().toMatchTypeOf<PublicFunctions>();

      expectTypeOf<"get-balance">().not.toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"get-decimals">().not.toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"get-name">().not.toMatchTypeOf<PublicFunctions>();
    });

    it("infers function arguments correctly for transfer", () => {
      type TransferArgs = TypedCallContractFunctionArgs<
        typeof sip10Abi,
        "transfer"
      >;

      expectTypeOf<TransferArgs>().toMatchTypeOf<
        readonly [bigint | number, string, string, string | null]
      >();
    });

    it("infers function arguments correctly for mint", () => {
      type MintArgs = TypedCallContractFunctionArgs<typeof sip10Abi, "mint">;

      expectTypeOf<MintArgs>().toMatchTypeOf<
        readonly [bigint | number, string]
      >();
    });
  });

  describe("function behavior", () => {
    it("throws for non-existent function name", async () => {
      await expect(
        typedCallContract({
          abi: sip10Abi,
          contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
          // @ts-expect-error - testing runtime error for non-existent function name
          functionName: "non-existent-function",
          network: "mainnet",
        }),
      ).rejects.toThrow(
        'Function "non-existent-function" not found in ABI or is not a public function',
      );
    });

    it("throws for read_only function name", async () => {
      await expect(
        typedCallContract({
          abi: sip10Abi,
          contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
          // @ts-expect-error - testing runtime error for calling read_only function
          functionName: "get-balance",
          functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
          network: "mainnet",
        }),
      ).rejects.toThrow(
        'Function "get-balance" not found in ABI or is not a public function',
      );
    });

    it("calls request with correct ClarityValues for mint", async () => {
      const mockRequest = request as ReturnType<typeof vi.fn>;
      mockRequest.mockImplementation(async () => {
        return Promise.resolve({ txid: "0x1234" });
      });

      const recipient = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

      const result = await typedCallContract({
        abi: sip10Abi,
        contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
        functionName: "mint",
        functionArgs: [1000n, recipient],
        network: "mainnet",
      });

      expect(result).toBe("0x1234");
      expect(mockRequest).toHaveBeenCalledWith(
        "stx_callContract",
        expect.objectContaining({
          contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
          functionName: "mint",
          functionArgs: [uintCV(1000n), standardPrincipalCV(recipient)],
          network: "mainnet",
        }),
      );
    });

    it("calls request with correct ClarityValues for transfer", async () => {
      const mockRequest = request as ReturnType<typeof vi.fn>;
      mockRequest.mockImplementation(async () => {
        return Promise.resolve({ txid: "0x5678" });
      });

      const sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
      const recipient = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

      const result = await typedCallContract({
        abi: sip10Abi,
        contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
        functionName: "transfer",
        functionArgs: [100n, sender, recipient, null],
        network: "mainnet",
      });

      expect(result).toBe("0x5678");
      expect(mockRequest).toHaveBeenCalledWith(
        "stx_callContract",
        expect.objectContaining({
          contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
          functionName: "transfer",
          functionArgs: [
            uintCV(100n),
            standardPrincipalCV(sender),
            standardPrincipalCV(recipient),
            noneCV(),
          ],
        }),
      );
    });

    it("passes through postConditionMode and postConditions", async () => {
      const mockRequest = request as ReturnType<typeof vi.fn>;
      mockRequest.mockImplementation(async () => {
        return Promise.resolve({ txid: "0x9999" });
      });

      const postConditions = ["0xpostcondition"];

      await typedCallContract({
        abi: sip10Abi,
        contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
        functionName: "mint",
        functionArgs: [1000n, "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
        network: "mainnet",
        postConditionMode: "deny",
        postConditions,
      });

      expect(mockRequest).toHaveBeenCalledWith(
        "stx_callContract",
        expect.objectContaining({
          postConditionMode: "deny",
          postConditions: ["0xpostcondition"],
        }),
      );
    });

    it("throws when transaction is cancelled (no txId)", async () => {
      const mockRequest = request as ReturnType<typeof vi.fn>;
      mockRequest.mockImplementation(async () => {
        return Promise.resolve({});
      });

      await expect(
        typedCallContract({
          abi: sip10Abi,
          contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
          functionName: "mint",
          functionArgs: [1000n, "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
          network: "mainnet",
        }),
      ).rejects.toThrow("Transaction was cancelled or failed to submit");
    });
  });

  describe("with sbtc-token ABI", () => {
    it("calls protocol-mint correctly", async () => {
      const mockRequest = request as ReturnType<typeof vi.fn>;
      mockRequest.mockImplementation(async () => {
        return Promise.resolve({ txid: "0xabcd" });
      });

      const recipient = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";
      const contractFlag = "0x00";

      const result = await typedCallContract({
        abi: sbtcTokenAbi,
        contract: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token",
        functionName: "protocol-mint",
        functionArgs: [100000000n, recipient, contractFlag],
        network: "mainnet",
      });

      expect(result).toBe("0xabcd");
      expect(mockRequest).toHaveBeenCalledWith(
        "stx_callContract",
        expect.objectContaining({
          contract: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token",
          functionName: "protocol-mint",
        }),
      );
    });

    it("calls protocol-set-name correctly", async () => {
      const mockRequest = request as ReturnType<typeof vi.fn>;
      mockRequest.mockImplementation(async () => {
        return Promise.resolve({ txid: "0xdef0" });
      });

      const newName = "Wrapped sBTC";
      const contractFlag = "0x00";

      const result = await typedCallContract({
        abi: sbtcTokenAbi,
        contract: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token",
        functionName: "protocol-set-name",
        functionArgs: [newName, contractFlag],
        network: "mainnet",
      });

      expect(result).toBe("0xdef0");
    });
  });

  describe("parameter validation", () => {
    it("accepts valid parameters matching the ABI", async () => {
      const mockRequest = request as ReturnType<typeof vi.fn>;
      mockRequest.mockImplementation(async () => {
        return Promise.resolve({ txid: "0xvalid" });
      });

      const validConfig = {
        abi: sip10Abi,
        contract: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-token",
        functionName: "transfer",
        functionArgs: [
          100n,
          "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9",
          null,
        ],
        network: "mainnet",
      } as const;

      expectTypeOf(validConfig.functionName).toEqualTypeOf<"transfer">();
      expectTypeOf(validConfig.functionArgs).toMatchTypeOf<
        readonly [bigint, string, string, null]
      >();

      const result = await typedCallContract(validConfig);
      expect(result).toBe("0xvalid");
    });
  });
});
