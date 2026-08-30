import { describe, it, expect, expectTypeOf } from "vite-plus/test";

import { sip10Abi } from "../abis/json.js";
import type { ExtractAbiFunctionNames } from "../utils.js";
import { typedMakeContractCall } from "./contract-call.js";
import type {
  TypedContractCallFunctionName,
  TypedContractCallFunctionArgs,
} from "./contract-call.js";

describe("typedMakeContractCall", () => {
  describe("type inference", () => {
    it("infers public function names correctly", () => {
      type PublicFunctions = TypedContractCallFunctionName<typeof sip10Abi>;

      // Should include public functions
      expectTypeOf<"transfer">().toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"mint">().toMatchTypeOf<PublicFunctions>();

      // Should not include read_only functions
      expectTypeOf<"get-balance">().not.toMatchTypeOf<PublicFunctions>();
      expectTypeOf<"get-name">().not.toMatchTypeOf<PublicFunctions>();
    });

    it("infers function arguments correctly for transfer", () => {
      type TransferArgs = TypedContractCallFunctionArgs<
        typeof sip10Abi,
        "transfer"
      >;

      // transfer takes (amount: uint128, sender: principal, recipient: principal, memo: optional buffer)
      expectTypeOf<TransferArgs>().toMatchTypeOf<
        readonly [bigint | number, string, string, string | null]
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

      // Verify read_only functions are excluded
      expectTypeOf<"get-balance">().not.toMatchTypeOf<AllPublicFunctions>();
      expectTypeOf<"get-decimals">().not.toMatchTypeOf<AllPublicFunctions>();
    });
  });

  describe("function behavior", () => {
    it("throws for non-existent function name", async () => {
      await expect(
        typedMakeContractCall({
          abi: sip10Abi,
          contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          contractName: "my-token",
          // @ts-expect-error - testing invalid function name
          functionName: "non-existent-function",
          // @ts-expect-error - testing invalid function name
          functionArgs: [],
          senderKey:
            "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
        }),
      ).rejects.toThrow(
        'Function "non-existent-function" not found in ABI with access "public"',
      );
    });

    it("throws for read_only function name", async () => {
      await expect(
        typedMakeContractCall({
          abi: sip10Abi,
          contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          contractName: "my-token",
          // @ts-expect-error - testing read_only function (should only allow public)
          functionName: "get-balance",
          functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
          senderKey:
            "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
        }),
      ).rejects.toThrow(
        'Function "get-balance" not found in ABI with access "public"',
      );
    });

    it("throws for argument count mismatch", async () => {
      await expect(
        typedMakeContractCall({
          abi: sip10Abi,
          contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          contractName: "my-token",
          functionName: "transfer",
          // @ts-expect-error - testing invalid function args count
          functionArgs: [100n],
          senderKey:
            "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
        }),
      ).rejects.toThrow(
        'Argument count mismatch for function "transfer": expected 4, got 1.',
      );
    });

    it("creates a valid transaction for transfer function", async () => {
      const transaction = await typedMakeContractCall({
        abi: sip10Abi,
        contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
        contractName: "my-token",
        functionName: "transfer",
        functionArgs: [
          100n,
          "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9",
          null,
        ],
        senderKey:
          "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
        fee: 1000n,
        nonce: 0n,
      });

      expect(transaction).toBeDefined();
      expect(transaction.payload).toBeDefined();
    });

    it("creates a valid transaction for mint function", async () => {
      const transaction = await typedMakeContractCall({
        abi: sip10Abi,
        contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
        contractName: "my-token",
        functionName: "mint",
        functionArgs: [1000n, "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
        senderKey:
          "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
        fee: 1000n,
        nonce: 0n,
      });

      expect(transaction).toBeDefined();
      expect(transaction.payload).toBeDefined();
    });
  });

  describe("parameter validation", () => {
    it("accepts valid parameters matching the ABI", () => {
      // This test verifies compile-time type checking
      const validConfig = {
        abi: sip10Abi,
        contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
        contractName: "my-token",
        functionName: "transfer" as const,
        functionArgs: [
          100n,
          "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9",
          null,
        ] as const,
        senderKey:
          "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
      };

      // Verify the config has the correct shape
      expectTypeOf(validConfig.functionName).toEqualTypeOf<"transfer">();
      expectTypeOf(validConfig.functionArgs).toMatchTypeOf<
        readonly [bigint, string, string, null]
      >();
    });
  });
});
