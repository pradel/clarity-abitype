import { describe, it, expect } from "vite-plus/test";

import { sbtcTokenAbi } from "../../tests/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token.js";
import { sip10Abi } from "../abis/json.js";
import { getContract } from "./contract.js";

describe("getContract (stacks-js)", () => {
  it("creates a contract instance with read and call proxies", () => {
    const contract = getContract({
      abi: sip10Abi,
      contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
      contractName: "my-token",
    });

    expect(contract.contractAddress).toBe(
      "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
    );
    expect(contract.contractName).toBe("my-token");
    expect(contract.read).toBeDefined();
    expect(contract.call).toBeDefined();
  });

  it("calls read functions via contract.read", async () => {
    const contract = getContract({
      abi: sbtcTokenAbi,
      contractAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      contractName: "sbtc-token",
      senderAddress: "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
      network: "mainnet",
    });

    const result = await contract.read["get-name"]();
    expect(result).toEqual({ ok: "sBTC" });

    const symbolResult = await contract.read["get-symbol"]({});
    expect(symbolResult).toEqual({ ok: "sBTC" });

    const balanceResult = await contract.read["get-balance"]({
      functionArgs: ["SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4"],
    });
    expect(balanceResult).toHaveProperty("ok");
  });

  it("calls public functions via contract.call to create signed transactions", async () => {
    const contract = getContract({
      abi: sip10Abi,
      contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
      contractName: "my-token",
      senderKey:
        "753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601",
    });

    const tx = await contract.call.transfer({
      functionArgs: [
        100n,
        "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
        "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9",
        null,
      ],
      network: "mainnet",
      fee: 1000n,
      nonce: 0n,
    });

    expect(tx).toBeDefined();
    expect(tx.payload).toBeDefined();
  });
});
