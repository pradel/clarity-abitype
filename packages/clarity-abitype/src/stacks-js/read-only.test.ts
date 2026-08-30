import { describe, it, expect } from "vite-plus/test";

import { sbtcTokenAbi } from "../../tests/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.js";
import { typedCallReadOnlyFunction } from "./read-only.js";

describe("typedCallReadOnlyFunction", () => {
  it("should call sbtc get-name and return the correct response", async () => {
    const result = await typedCallReadOnlyFunction({
      abi: sbtcTokenAbi,
      contractAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      contractName: "sbtc-token",
      functionName: "get-name",
      senderAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      network: "mainnet",
    });

    expect(result).toEqual({ ok: "sBTC" });
  });

  it("should call sbtc get-symbol and return the correct response", async () => {
    const result = await typedCallReadOnlyFunction({
      abi: sbtcTokenAbi,
      contractAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      contractName: "sbtc-token",
      functionName: "get-symbol",
      senderAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      network: "mainnet",
    });

    expect(result).toEqual({ ok: "sBTC" });
  });

  it("should call sbtc get-decimals and return the correct response", async () => {
    const result = await typedCallReadOnlyFunction({
      abi: sbtcTokenAbi,
      contractAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      contractName: "sbtc-token",
      functionName: "get-decimals",
      senderAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      network: "mainnet",
    });

    expect(result).toEqual({ ok: 8n });
  });

  it("should call sbtc get-balance with a principal argument", async () => {
    const result = await typedCallReadOnlyFunction({
      abi: sbtcTokenAbi,
      contractAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      contractName: "sbtc-token",
      functionName: "get-balance",
      functionArgs: ["SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4"],
      senderAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      network: "mainnet",
    });

    // Balance should be a bigint (could be 0n or any amount)
    expect(result).toHaveProperty("ok");
    expect(typeof (result as { ok: bigint }).ok).toBe("bigint");
  });

  it("throws for non-existent function name", async () => {
    await expect(
      typedCallReadOnlyFunction({
        abi: sbtcTokenAbi,
        contractAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
        contractName: "sbtc-token",
        // @ts-expect-error - testing runtime error for non-existent function
        functionName: "non-existent-function",
        senderAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
        network: "mainnet",
      }),
    ).rejects.toThrow(
      'Function "non-existent-function" not found in ABI with access "read_only"',
    );
  });

  it("throws for public function name", async () => {
    await expect(
      typedCallReadOnlyFunction({
        abi: sbtcTokenAbi,
        contractAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
        contractName: "sbtc-token",
        // @ts-expect-error - testing runtime error for public function
        functionName: "transfer",
        senderAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
        network: "mainnet",
      }),
    ).rejects.toThrow(
      'Function "transfer" not found in ABI with access "read_only"',
    );
  });

  it("throws for argument count mismatch", async () => {
    await expect(
      typedCallReadOnlyFunction({
        abi: sbtcTokenAbi,
        contractAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
        contractName: "sbtc-token",
        functionName: "get-balance",
        // @ts-expect-error - testing runtime error for missing args
        functionArgs: [],
        senderAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
        network: "mainnet",
      }),
    ).rejects.toThrow(
      'Argument count mismatch for function "get-balance": expected 1, got 0.',
    );
  });
});
