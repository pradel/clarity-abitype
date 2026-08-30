import { hexToBytes } from "@stacks/common";
import {
  uintCV,
  intCV,
  trueCV,
  falseCV,
  noneCV,
  someCV,
  standardPrincipalCV,
  contractPrincipalCV,
  bufferCV,
  stringAsciiCV,
  stringUtf8CV,
  listCV,
  tupleCV,
  responseOkCV,
  responseErrorCV,
} from "@stacks/transactions";
import { describe, it, expect, expectTypeOf } from "vite-plus/test";

import { sip10Abi } from "../abis/json.js";
import type {
  ClarityAbiArgsToPrimitiveTypes,
  ClarityAbiOutputToPrimitiveType,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "../utils.js";
import { primitiveToCV, primitivesToCVs } from "./utils.js";

describe("primitiveToCV", () => {
  describe("uint128", () => {
    it("converts bigint to uintCV", () => {
      const result = primitiveToCV(100n, "uint128");
      expect(result).toEqual(uintCV(100n));
    });

    it("converts number to uintCV", () => {
      const result = primitiveToCV(100, "uint128");
      expect(result).toEqual(uintCV(100));
    });

    it("also accepts string values (via encodeAbiClarityValue)", () => {
      // encodeAbiClarityValue is permissive and accepts strings
      const result = primitiveToCV("100", "uint128");
      expect(result).toEqual(uintCV(100n));
    });
  });

  describe("int128", () => {
    it("converts bigint to intCV", () => {
      const result = primitiveToCV(-100n, "int128");
      expect(result).toEqual(intCV(-100n));
    });

    it("converts number to intCV", () => {
      const result = primitiveToCV(-100, "int128");
      expect(result).toEqual(intCV(-100));
    });

    it("also accepts string values (via encodeAbiClarityValue)", () => {
      // encodeAbiClarityValue is permissive and accepts strings
      const result = primitiveToCV("100", "int128");
      expect(result).toEqual(intCV(100n));
    });
  });

  describe("bool", () => {
    it("converts true to trueCV", () => {
      const result = primitiveToCV(true, "bool");
      expect(result).toEqual(trueCV());
    });

    it("converts false to falseCV", () => {
      const result = primitiveToCV(false, "bool");
      expect(result).toEqual(falseCV());
    });

    it("also accepts string values (via encodeAbiClarityValue)", () => {
      // encodeAbiClarityValue accepts "true"/"false" and "1"/"0"
      expect(primitiveToCV("true", "bool")).toEqual(trueCV());
      expect(primitiveToCV("false", "bool")).toEqual(falseCV());
      expect(primitiveToCV("1", "bool")).toEqual(trueCV());
      expect(primitiveToCV("0", "bool")).toEqual(falseCV());
    });
  });

  describe("principal", () => {
    it("converts standard principal string", () => {
      const address = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";
      const result = primitiveToCV(address, "principal");
      expect(result).toEqual(standardPrincipalCV(address));
    });

    it("converts contract principal string", () => {
      const address = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-contract";
      const result = primitiveToCV(address, "principal");
      expect(result).toEqual(
        contractPrincipalCV(
          "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          "my-contract",
        ),
      );
    });

    it("throws for invalid principal format", () => {
      // encodeAbiClarityValue will throw for invalid c32 address format
      expect(() => primitiveToCV(123, "principal")).toThrow(/invalid/i);
    });
  });

  describe("trait_reference", () => {
    it("converts contract principal for trait reference", () => {
      const address = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.my-trait";
      const result = primitiveToCV(address, "trait_reference");
      expect(result).toEqual(
        contractPrincipalCV(
          "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          "my-trait",
        ),
      );
    });
  });

  describe("none", () => {
    it("converts to noneCV", () => {
      const result = primitiveToCV(null, "none");
      expect(result).toEqual(noneCV());
    });

    it("converts undefined to noneCV", () => {
      const result = primitiveToCV(undefined, "none");
      expect(result).toEqual(noneCV());
    });
  });

  describe("buffer", () => {
    it("converts hex string without 0x prefix", () => {
      const result = primitiveToCV("deadbeef", { buffer: { length: 4 } });
      expect(result).toEqual(bufferCV(hexToBytes("deadbeef")));
    });
  });

  describe("string-ascii", () => {
    it("converts string to stringAsciiCV", () => {
      const result = primitiveToCV("hello", { "string-ascii": { length: 10 } });
      expect(result).toEqual(stringAsciiCV("hello"));
    });

    it("also accepts number values (via encodeAbiClarityValue)", () => {
      // encodeAbiClarityValue converts via toString()
      const result = primitiveToCV(123, { "string-ascii": { length: 10 } });
      expect(result).toEqual(stringAsciiCV("123"));
    });
  });

  describe("string-utf8", () => {
    it("converts string to stringUtf8CV", () => {
      const result = primitiveToCV("hello 世界", {
        "string-utf8": { length: 20 },
      });
      expect(result).toEqual(stringUtf8CV("hello 世界"));
    });

    it("also accepts number values (via encodeAbiClarityValue)", () => {
      // encodeAbiClarityValue converts via toString()
      const result = primitiveToCV(123, { "string-utf8": { length: 10 } });
      expect(result).toEqual(stringUtf8CV("123"));
    });
  });

  describe("optional", () => {
    it("converts null to noneCV", () => {
      const result = primitiveToCV(null, { optional: "uint128" });
      expect(result).toEqual(noneCV());
    });

    it("converts undefined to noneCV", () => {
      const result = primitiveToCV(undefined, { optional: "uint128" });
      expect(result).toEqual(noneCV());
    });

    it("converts value to someCV", () => {
      const result = primitiveToCV(100n, { optional: "uint128" });
      expect(result).toEqual(someCV(uintCV(100n)));
    });

    it("handles nested optional types", () => {
      const result = primitiveToCV("hello", {
        optional: { "string-ascii": { length: 10 } },
      });
      expect(result).toEqual(someCV(stringAsciiCV("hello")));
    });
  });

  describe("list", () => {
    it("converts array of primitives", () => {
      const result = primitiveToCV([1n, 2n, 3n], {
        list: { type: "uint128", length: 10 },
      });
      expect(result).toEqual(listCV([uintCV(1n), uintCV(2n), uintCV(3n)]));
    });

    it("converts empty array", () => {
      const result = primitiveToCV([], {
        list: { type: "uint128", length: 10 },
      });
      expect(result).toEqual(listCV([]));
    });

    it("throws for non-array value", () => {
      expect(() =>
        primitiveToCV("not an array", {
          list: { type: "uint128", length: 10 },
        }),
      ).toThrow("Expected array for list");
    });
  });

  describe("tuple", () => {
    it("converts object to tupleCV", () => {
      const result = primitiveToCV(
        { amount: 100n, sender: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR" },
        {
          tuple: [
            { name: "amount", type: "uint128" },
            { name: "sender", type: "principal" },
          ],
        },
      );
      expect(result).toEqual(
        tupleCV({
          amount: uintCV(100n),
          sender: standardPrincipalCV(
            "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
          ),
        }),
      );
    });

    it("throws for missing tuple field", () => {
      expect(() =>
        primitiveToCV(
          { amount: 100n },
          {
            tuple: [
              { name: "amount", type: "uint128" },
              { name: "sender", type: "principal" },
            ],
          },
        ),
      ).toThrow("Missing tuple field: sender");
    });

    it("throws for non-object value", () => {
      expect(() =>
        primitiveToCV("not an object", {
          tuple: [{ name: "amount", type: "uint128" }],
        }),
      ).toThrow("Expected object for tuple");
    });
  });

  describe("response", () => {
    it("converts ok response", () => {
      const result = primitiveToCV(
        { ok: 100n },
        { response: { ok: "uint128", error: "uint128" } },
      );
      expect(result).toEqual(responseOkCV(uintCV(100n)));
    });

    it("converts error response", () => {
      const result = primitiveToCV(
        { error: 500n },
        { response: { ok: "uint128", error: "uint128" } },
      );
      expect(result).toEqual(responseErrorCV(uintCV(500n)));
    });

    it("throws for invalid response object", () => {
      expect(() =>
        primitiveToCV(
          { neither: 100n },
          { response: { ok: "uint128", error: "uint128" } },
        ),
      ).toThrow("Expected response object with ok or error");
    });
  });
});

describe("primitivesToCVs", () => {
  it("converts multiple arguments", () => {
    const args = [100n, "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"];
    const abiArgs = [
      { name: "amount", type: "uint128" as const },
      { name: "recipient", type: "principal" as const },
    ];

    const result = primitivesToCVs(args, abiArgs);

    expect(result).toEqual([
      uintCV(100n),
      standardPrincipalCV("SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"),
    ]);
  });

  it("throws for argument count mismatch", () => {
    const args = [100n];
    const abiArgs = [
      { name: "amount", type: "uint128" as const },
      { name: "recipient", type: "principal" as const },
    ];

    expect(() => primitivesToCVs(args, abiArgs)).toThrow(
      "Argument count mismatch: expected 2, got 1",
    );
  });

  it("handles complex nested types", () => {
    const args = [
      { amount: 100n, sender: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR" },
    ];
    const abiArgs = [
      {
        name: "item",
        type: {
          tuple: [
            { name: "amount", type: "uint128" as const },
            { name: "sender", type: "principal" as const },
          ],
        } as const,
      },
    ];

    const result = primitivesToCVs(args, abiArgs);

    expect(result).toEqual([
      tupleCV({
        amount: uintCV(100n),
        sender: standardPrincipalCV(
          "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
        ),
      }),
    ]);
  });
});

describe("typedCallReadOnlyFunction types", () => {
  it("infers correct argument types", () => {
    // This is a compile-time type test
    type GetBalanceArgs = ClarityAbiArgsToPrimitiveTypes<
      ExtractAbiFunction<typeof sip10Abi, "get-balance">["args"]
    >;

    // get-balance takes a single principal argument (who)
    expectTypeOf<GetBalanceArgs>().toEqualTypeOf<readonly [string]>();
  });

  it("infers correct return type", () => {
    type GetBalanceOutput = ClarityAbiOutputToPrimitiveType<
      ExtractAbiFunction<typeof sip10Abi, "get-balance">["outputs"]
    >;

    // get-balance returns response { ok: uint128, error: none }
    expectTypeOf<GetBalanceOutput>().toEqualTypeOf<
      { ok: bigint; error?: never } | { ok?: never; error: null }
    >();
  });

  it("extracts read_only function names", () => {
    type ReadOnlyFunctions = ExtractAbiFunctionNames<
      typeof sip10Abi,
      "read_only"
    >;

    // Should include read_only functions
    expectTypeOf<"get-balance">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-decimals">().toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"get-name">().toMatchTypeOf<ReadOnlyFunctions>();

    // Should not include public functions
    expectTypeOf<"transfer">().not.toMatchTypeOf<ReadOnlyFunctions>();
    expectTypeOf<"mint">().not.toMatchTypeOf<ReadOnlyFunctions>();
  });

  it("has correct config type shape", () => {
    // Test that the function accepts the expected configuration
    const config = {
      abi: sip10Abi,
      contractAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
      contractName: "my-token",
      functionName: "get-balance" as const,
      functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"] as const,
      senderAddress: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
    };

    // This would fail at compile time if types don't match
    expectTypeOf(config.functionArgs).toMatchTypeOf<readonly [string]>();
  });
});
