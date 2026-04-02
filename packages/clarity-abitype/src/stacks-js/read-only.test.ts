import { describe, it, expect } from "vitest";

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
});
