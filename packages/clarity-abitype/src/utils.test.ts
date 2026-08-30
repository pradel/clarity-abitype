import { describe, it, expect } from "vite-plus/test";

import { sip10Abi } from "./abis/json.js";
import { formatAbiItem, formatClarityType, getAbiItem } from "./utils.js";

describe("formatClarityType", () => {
  it("formats primitive types", () => {
    expect(formatClarityType("uint128")).toBe("uint128");
    expect(formatClarityType("int128")).toBe("int128");
    expect(formatClarityType("bool")).toBe("bool");
    expect(formatClarityType("principal")).toBe("principal");
    expect(formatClarityType("none")).toBe("none");
  });

  it("formats buffer and strings", () => {
    expect(formatClarityType({ buffer: { length: 34 } })).toBe("(buff 34)");
    expect(formatClarityType({ "string-ascii": { length: 32 } })).toBe(
      "(string-ascii 32)",
    );
    expect(formatClarityType({ "string-utf8": { length: 256 } })).toBe(
      "(string-utf8 256)",
    );
  });

  it("formats complex types", () => {
    expect(
      formatClarityType({
        optional: { buffer: { length: 34 } },
      }),
    ).toBe("(optional (buff 34))");

    expect(
      formatClarityType({
        response: { ok: "bool", error: "uint128" },
      }),
    ).toBe("(response bool uint128)");

    expect(
      formatClarityType({
        list: { type: "uint128", length: 10 },
      }),
    ).toBe("(list 10 uint128)");

    expect(
      formatClarityType({
        tuple: [
          { name: "amount", type: "uint128" },
          { name: "sender", type: "principal" },
        ],
      }),
    ).toBe("(tuple (amount uint128) (sender principal))");
  });
});

describe("getAbiItem", () => {
  it("extracts public functions", () => {
    const fn = getAbiItem({
      abi: sip10Abi,
      name: "transfer",
      access: "public",
    });

    expect(fn).toBeDefined();
    expect(fn?.name).toBe("transfer");
    expect((fn as any)?.access).toBe("public");
  });

  it("extracts read-only functions", () => {
    const fn = getAbiItem({
      abi: sip10Abi,
      name: "get-balance",
      access: "read_only",
    });

    expect(fn).toBeDefined();
    expect(fn?.name).toBe("get-balance");
    expect((fn as any)?.access).toBe("read_only");
  });

  it("extracts variables", () => {
    const variable = getAbiItem({
      abi: sip10Abi,
      name: "token-name",
    });

    expect(variable).toBeDefined();
    expect(variable?.name).toBe("token-name");
    expect((variable as any)?.access).toBe("variable");
  });

  it("extracts fungible tokens", () => {
    const ft = getAbiItem({
      abi: sip10Abi,
      name: "bridged-btc",
    });

    expect(ft).toBeDefined();
    expect(ft?.name).toBe("bridged-btc");
  });

  it("returns undefined for non-existent item", () => {
    const item = getAbiItem({
      abi: sip10Abi,
      name: "does-not-exist",
    });

    expect(item).toBeUndefined();
  });
});

describe("formatAbiItem", () => {
  it("formats public function", () => {
    const fn = getAbiItem({
      abi: sip10Abi,
      name: "transfer",
      access: "public",
    });
    expect(fn).toBeDefined();

    const formatted = formatAbiItem(fn as any);
    expect(formatted).toBe(
      "public transfer(amount: uint128, sender: principal, recipient: principal, memo: (optional (buff 34))) -> (response bool uint128)",
    );
  });

  it("formats read-only function", () => {
    const fn = getAbiItem({
      abi: sip10Abi,
      name: "get-balance",
      access: "read_only",
    });
    expect(fn).toBeDefined();

    const formatted = formatAbiItem(fn as any);
    expect(formatted).toBe(
      "read_only get-balance(who: principal) -> (response uint128 none)",
    );
  });

  it("formats variable", () => {
    const variable = getAbiItem({
      abi: sip10Abi,
      name: "token-name",
    });
    expect(variable).toBeDefined();

    const formatted = formatAbiItem(variable as any);
    expect(formatted).toBe("variable token-name: (string-ascii 32)");
  });

  it("formats fungible token", () => {
    const ft = getAbiItem({
      abi: sip10Abi,
      name: "bridged-btc",
    });
    expect(ft).toBeDefined();

    const formatted = formatAbiItem(ft as any);
    expect(formatted).toBe("ft bridged-btc");
  });
});
