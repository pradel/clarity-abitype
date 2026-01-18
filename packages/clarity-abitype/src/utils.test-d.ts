import { assertType, describe, test } from "vitest";
import type { ClarityAbi } from "./abi.js";
import type { sip10Abi } from "./abis/json.js";
import type { Merge, Range, Tuple } from "./types.js";
import type {
  ClarityAbiArgToPrimitiveType,
  ClarityAbiArgsToPrimitiveTypes,
  ClarityAbiOutputToPrimitiveType,
  ClarityBasicTypeToPrimitiveType,
  ClarityFixedArrayRange,
  ClarityFixedArraySizeLookup,
  ClarityTypeToPrimitiveType,
  ExtractAbiDefinedTrait,
  ExtractAbiDefinedTraitNames,
  ExtractAbiDefinedTraits,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
  ExtractAbiFunctions,
  ExtractAbiFungibleTokenNames,
  ExtractAbiFungibleTokens,
  ExtractAbiImplementedTraits,
  ExtractAbiMap,
  ExtractAbiMapKeyType,
  ExtractAbiMapNames,
  ExtractAbiMaps,
  ExtractAbiMapValueType,
  ExtractAbiNonFungibleToken,
  ExtractAbiNonFungibleTokenNames,
  ExtractAbiNonFungibleTokens,
  ExtractAbiNonFungibleTokenType,
  ExtractAbiVariable,
  ExtractAbiVariableNames,
  ExtractAbiVariables,
  IsClarityAbi,
} from "./utils.js";

const testPrincipal = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

describe("ClarityTypeToPrimitiveType", () => {
  test("principal", () => {
    assertType<ClarityTypeToPrimitiveType<"principal">>(testPrincipal);
  });

  test("bool", () => {
    assertType<ClarityTypeToPrimitiveType<"bool">>(true);
    assertType<ClarityTypeToPrimitiveType<"bool">>(false);
  });

  test("none", () => {
    assertType<ClarityTypeToPrimitiveType<"none">>(null);
  });

  test("int128", () => {
    assertType<ClarityTypeToPrimitiveType<"int128">>(1n);
    assertType<ClarityTypeToPrimitiveType<"int128">>(BigInt(1));
    assertType<ClarityTypeToPrimitiveType<"int128">>(BigInt(-1));
  });

  test("uint128", () => {
    assertType<ClarityTypeToPrimitiveType<"uint128">>(1n);
    assertType<ClarityTypeToPrimitiveType<"uint128">>(BigInt(1));
    assertType<ClarityTypeToPrimitiveType<"uint128">>(BigInt(123456));
  });

  test("buffer", () => {
    assertType<ClarityTypeToPrimitiveType<{ buffer: { length: 32 } }>>("0xfoo");
    assertType<ClarityTypeToPrimitiveType<{ buffer: { length: 1024 } }>>(
      "0xfoo",
    );
  });

  test("string-ascii", () => {
    assertType<ClarityTypeToPrimitiveType<{ "string-ascii": { length: 32 } }>>(
      "foo",
    );
    assertType<ClarityTypeToPrimitiveType<{ "string-ascii": { length: 256 } }>>(
      "hello world",
    );
  });

  test("string-utf8", () => {
    assertType<ClarityTypeToPrimitiveType<{ "string-utf8": { length: 32 } }>>(
      "foo",
    );
    assertType<ClarityTypeToPrimitiveType<{ "string-utf8": { length: 256 } }>>(
      "hello 世界",
    );
  });

  test("tuple", () => {
    assertType<
      ClarityTypeToPrimitiveType<{
        tuple: [
          { name: "amount"; type: "uint128" },
          { name: "sender"; type: "principal" },
        ];
      }>
    >({ amount: 1n, sender: testPrincipal });
  });

  test("list", () => {
    // Fixed-length list (length <= 99) produces a tuple with exact number of elements
    assertType<
      ClarityTypeToPrimitiveType<{
        list: { type: "uint128"; length: 3 };
      }>
    >([1n, 2n, 3n]);

    // Variable-length list (length > 99) produces a readonly array
    assertType<
      ClarityTypeToPrimitiveType<{
        list: { type: "principal"; length: 100 };
      }>
    >([testPrincipal, testPrincipal]);
  });

  test("optional", () => {
    assertType<ClarityTypeToPrimitiveType<{ optional: "uint128" }>>(1n);
    assertType<ClarityTypeToPrimitiveType<{ optional: "uint128" }>>(null);

    assertType<
      ClarityTypeToPrimitiveType<{ optional: { buffer: { length: 34 } } }>
    >("0xfoo");
    assertType<
      ClarityTypeToPrimitiveType<{ optional: { buffer: { length: 34 } } }>
    >(null);
  });

  test("response", () => {
    assertType<
      ClarityTypeToPrimitiveType<{
        response: { ok: "bool"; error: "uint128" };
      }>
    >({ ok: true });

    assertType<
      ClarityTypeToPrimitiveType<{
        response: { ok: "bool"; error: "uint128" };
      }>
    >({ error: 1n });

    assertType<
      ClarityTypeToPrimitiveType<{
        response: { ok: "uint128"; error: "none" };
      }>
    >({ ok: 100n });

    assertType<
      ClarityTypeToPrimitiveType<{
        response: { ok: "uint128"; error: "none" };
      }>
    >({ error: null });
  });

  test("nested tuple", () => {
    assertType<
      ClarityTypeToPrimitiveType<{
        tuple: [
          { name: "name"; type: "principal" },
          {
            name: "metadata";
            type: {
              tuple: [
                { name: "age"; type: "uint128" },
                { name: "active"; type: "bool" },
              ];
            };
          },
        ];
      }>
    >({
      name: testPrincipal,
      metadata: { age: 30n, active: true },
    });
  });

  test("list of tuples", () => {
    assertType<
      ClarityTypeToPrimitiveType<{
        list: {
          type: {
            tuple: [
              { name: "amount"; type: "uint128" },
              { name: "sender"; type: "principal" },
            ];
          };
          length: 200;
        };
      }>
    >([
      { amount: 1n, sender: testPrincipal },
      { amount: 2n, sender: testPrincipal },
    ]);
  });
});

describe("ClarityAbiArgToPrimitiveType", () => {
  test("principal", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "owner";
      type: "principal";
    }>;
    assertType<Result>({ owner: testPrincipal });
  });

  test("bool", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "active";
      type: "bool";
    }>;
    assertType<Result>({ active: true });
    assertType<Result>({ active: false });
  });

  test("uint128", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "amount";
      type: "uint128";
    }>;
    assertType<Result>({ amount: 123n });
    assertType<Result>({ amount: BigInt(123) });
    // @ts-expect-error string value
    assertType<Result>({ amount: "123" });
  });

  test("int128", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "delta";
      type: "int128";
    }>;
    assertType<Result>({ delta: 123n });
    assertType<Result>({ delta: BigInt(-123) });
  });

  test("buffer", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "data";
      type: { buffer: { length: 32 } };
    }>;
    assertType<Result>({ data: "0xfoo" });
  });

  test("string-ascii", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "name";
      type: { "string-ascii": { length: 32 } };
    }>;
    assertType<Result>({ name: "foo" });
  });

  test("string-utf8", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "message";
      type: { "string-utf8": { length: 256 } };
    }>;
    assertType<Result>({ message: "hello world" });
  });

  test("tuple", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "item";
      type: {
        tuple: [
          { name: "amount"; type: "uint128" },
          { name: "sender"; type: "principal" },
        ];
      };
    }>;
    assertType<Result>({
      item: { amount: 1n, sender: testPrincipal },
    });
    assertType<Result>({
      // @ts-expect-error missing keys
      item: { amount: 1n },
    });
  });

  test("list", () => {
    // Fixed-length list produces tuple - use length > 99 for variable-length array
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "amounts";
      type: { list: { type: "uint128"; length: 200 } };
    }>;
    assertType<Result>({ amounts: [1n, 2n, 3n] });
  });

  test("fixed-length list", () => {
    // Fixed-length list (length <= 99) produces a tuple with exact number of elements
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "pair";
      type: { list: { type: "uint128"; length: 2 } };
    }>;
    assertType<Result>({ pair: [1n, 2n] });
  });

  test("optional", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "memo";
      type: { optional: { buffer: { length: 34 } } };
    }>;
    assertType<Result>({ memo: "0xfoo" });
    assertType<Result>({ memo: null });
  });

  test("response", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "result";
      type: { response: { ok: "bool"; error: "uint128" } };
    }>;
    assertType<Result>({ result: { ok: true } });
    assertType<Result>({ result: { error: 1n } });
  });

  test("nested tuple", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "complex";
      type: {
        tuple: [
          { name: "id"; type: "uint128" },
          {
            name: "data";
            type: {
              tuple: [
                { name: "name"; type: { "string-ascii": { length: 32 } } },
                { name: "active"; type: "bool" },
              ];
            };
          },
        ];
      };
    }>;
    assertType<Result>({
      complex: {
        id: 1n,
        data: { name: "test", active: true },
      },
    });
  });

  test("list of tuples", () => {
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "senders";
      type: {
        list: {
          type: {
            tuple: [
              { name: "amount"; type: "uint128" },
              { name: "sender"; type: "principal" },
            ];
          };
          length: 200;
        };
      };
    }>;
    assertType<Result>({
      senders: [
        { amount: 1n, sender: testPrincipal },
        { amount: 2n, sender: testPrincipal },
      ],
    });
  });
});

describe("ClarityAbiArgsToPrimitiveTypes", () => {
  test("no arguments", () => {
    type Result = ClarityAbiArgsToPrimitiveTypes<[]>;
    assertType<Result>([]);
  });

  test("single argument", () => {
    type Result = ClarityAbiArgsToPrimitiveTypes<
      [
        {
          name: "amount";
          type: "uint128";
        },
      ]
    >;
    assertType<Result>([1n]);
  });

  test("multiple arguments", () => {
    type Result = ClarityAbiArgsToPrimitiveTypes<
      [
        { name: "amount"; type: "uint128" },
        { name: "sender"; type: "principal" },
        { name: "recipient"; type: "principal" },
      ]
    >;
    assertType<Result>([1n, testPrincipal, testPrincipal]);
  });

  test("complex arguments", () => {
    type Result = ClarityAbiArgsToPrimitiveTypes<
      [
        {
          name: "item";
          type: {
            tuple: [
              { name: "amount"; type: "uint128" },
              { name: "sender"; type: "principal" },
            ];
          };
        },
        {
          name: "memo";
          type: {
            optional: {
              buffer: { length: 34 };
            };
          };
        },
        {
          name: "active";
          type: "bool";
        },
      ]
    >;
    assertType<Result>([{ amount: 1n, sender: testPrincipal }, "0xfoo", true]);
    assertType<Result>([{ amount: 1n, sender: testPrincipal }, null, false]);
  });
});

describe("ClarityAbiOutputToPrimitiveType", () => {
  test("uint128", () => {
    type Result = ClarityAbiOutputToPrimitiveType<{
      type: "uint128";
    }>;
    assertType<Result>(123n);
  });

  test("bool", () => {
    type Result = ClarityAbiOutputToPrimitiveType<{
      type: "bool";
    }>;
    assertType<Result>(true);
  });

  test("response", () => {
    type Result = ClarityAbiOutputToPrimitiveType<{
      type: {
        response: {
          ok: "bool";
          error: "uint128";
        };
      };
    }>;
    assertType<Result>({ ok: true });
    assertType<Result>({ error: 1n });
  });

  test("optional", () => {
    type Result = ClarityAbiOutputToPrimitiveType<{
      type: {
        optional: {
          "string-utf8": { length: 256 };
        };
      };
    }>;
    assertType<Result>("foo");
    assertType<Result>(null);
  });

  test("tuple", () => {
    type Result = ClarityAbiOutputToPrimitiveType<{
      type: {
        tuple: [
          { name: "amount"; type: "uint128" },
          { name: "sender"; type: "principal" },
        ];
      };
    }>;
    assertType<Result>({ amount: 1n, sender: testPrincipal });
  });
});

describe("IsClarityAbi", () => {
  test("const assertion", () => {
    assertType<IsClarityAbi<typeof sip10Abi>>(true);
  });

  test("declared as ClarityAbi type", () => {
    const abi: ClarityAbi = {
      functions: [
        {
          name: "transfer",
          access: "public",
          args: [{ name: "amount", type: "uint128" }],
          outputs: { type: "bool" },
        },
      ],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [],
    };
    type Result = IsClarityAbi<typeof abi>;
    assertType<Result>(true);
  });

  test("no const assertion", () => {
    const abi = {
      functions: [
        {
          name: "transfer",
          access: "public",
          args: [{ name: "amount", type: "uint128" }],
          outputs: { type: "bool" },
        },
      ],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [],
    };
    type Result = IsClarityAbi<typeof abi>;
    assertType<Result>(false);

    type InvalidAbiResult = IsClarityAbi<"foo">;
    assertType<InvalidAbiResult>(false);
  });
});

describe("Function", () => {
  test("ExtractAbiFunctions", () => {
    const abiFunction = {
      name: "transfer",
      access: "public",
      args: [{ name: "amount", type: "uint128" }],
      outputs: { type: "bool" },
    } as const;
    assertType<
      ExtractAbiFunctions<
        {
          functions: [typeof abiFunction];
          variables: [];
          maps: [];
          fungible_tokens: [];
          non_fungible_tokens: [];
        },
        "public"
      >
    >(abiFunction);
  });

  test("ExtractAbiFunctions with access filter", () => {
    type Result = ExtractAbiFunctions<typeof sip10Abi, "public">;
    const publicFunction: Result = {
      name: "transfer",
      access: "public",
      args: [
        { name: "amount", type: "uint128" },
        { name: "sender", type: "principal" },
        { name: "recipient", type: "principal" },
        {
          name: "memo",
          type: { optional: { buffer: { length: 34 } } },
        },
      ],
      outputs: {
        type: {
          response: {
            ok: "bool",
            error: "uint128",
          },
        },
      },
    };
    assertType<Result>(publicFunction);

    type ReadOnlyResult = ExtractAbiFunctions<typeof sip10Abi, "read_only">;
    const readOnlyFunction: ReadOnlyResult = {
      name: "get-balance",
      access: "read_only",
      args: [{ name: "who", type: "principal" }],
      outputs: {
        type: {
          response: {
            ok: "uint128",
            error: "none",
          },
        },
      },
    };
    assertType<ReadOnlyResult>(readOnlyFunction);
  });

  test("ExtractAbiFunctionNames", () => {
    assertType<ExtractAbiFunctionNames<typeof sip10Abi>>("transfer");
    assertType<ExtractAbiFunctionNames<typeof sip10Abi>>("get-balance");
    assertType<ExtractAbiFunctionNames<typeof sip10Abi>>("mint");
    assertType<ExtractAbiFunctionNames<typeof sip10Abi, "public">>("burn");
    assertType<ExtractAbiFunctionNames<typeof sip10Abi, "read_only">>(
      "get-decimals",
    );
    assertType<ExtractAbiFunctionNames<typeof sip10Abi, "private">>(
      "pow-decimals",
    );
  });

  test("ExtractAbiFunction", () => {
    assertType<ExtractAbiFunction<typeof sip10Abi, "transfer">>({
      name: "transfer",
      access: "public",
      args: [
        { name: "amount", type: "uint128" },
        { name: "sender", type: "principal" },
        { name: "recipient", type: "principal" },
        {
          name: "memo",
          type: { optional: { buffer: { length: 34 } } },
        },
      ],
      outputs: {
        type: {
          response: {
            ok: "bool",
            error: "uint128",
          },
        },
      },
    });

    assertType<ExtractAbiFunction<typeof sip10Abi, "get-balance">>({
      name: "get-balance",
      access: "read_only",
      args: [{ name: "who", type: "principal" }],
      outputs: {
        type: {
          response: {
            ok: "uint128",
            error: "none",
          },
        },
      },
    });

    assertType<ExtractAbiFunction<typeof sip10Abi, "pow-decimals">>({
      name: "pow-decimals",
      access: "private",
      args: [],
      outputs: {
        type: "uint128",
      },
    });
  });
});

describe("Variables", () => {
  test("ExtractAbiVariables", () => {
    type Result = ExtractAbiVariables<typeof sip10Abi>;
    const variable: Result = {
      name: "token-name",
      type: { "string-ascii": { length: 32 } },
      access: "variable",
    };
    assertType<Result>(variable);

    const constant: Result = {
      name: "ERR-NOT-AUTHORIZED",
      type: { response: { ok: "none", error: "uint128" } },
      access: "constant",
    };
    assertType<Result>(constant);
  });

  test("ExtractAbiVariableNames", () => {
    assertType<ExtractAbiVariableNames<typeof sip10Abi>>("token-name");
    assertType<ExtractAbiVariableNames<typeof sip10Abi>>("token-symbol");
    assertType<ExtractAbiVariableNames<typeof sip10Abi>>("ERR-NOT-AUTHORIZED");
    assertType<ExtractAbiVariableNames<typeof sip10Abi>>("ONE_8");
  });

  test("ExtractAbiVariable", () => {
    assertType<ExtractAbiVariable<typeof sip10Abi, "token-name">>({
      name: "token-name",
      type: { "string-ascii": { length: 32 } },
      access: "variable",
    });

    assertType<ExtractAbiVariable<typeof sip10Abi, "ERR-NOT-AUTHORIZED">>({
      name: "ERR-NOT-AUTHORIZED",
      type: { response: { ok: "none", error: "uint128" } },
      access: "constant",
    });

    assertType<ExtractAbiVariable<typeof sip10Abi, "ONE_8">>({
      name: "ONE_8",
      type: "uint128",
      access: "constant",
    });
  });
});

describe("Maps", () => {
  test("ExtractAbiMaps", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [
        {
          name: "balances",
          key: "principal" as const,
          value: "uint128" as const,
        },
      ],
      fungible_tokens: [],
      non_fungible_tokens: [],
    } as const;

    type Result = ExtractAbiMaps<typeof testAbi>;
    assertType<Result>({
      name: "balances",
      key: "principal",
      value: "uint128",
    });
  });

  test("ExtractAbiMapNames", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [
        {
          name: "balances",
          key: "principal" as const,
          value: "uint128" as const,
        },
        {
          name: "allowances",
          key: {
            tuple: [
              { name: "owner", type: "principal" as const },
              { name: "spender", type: "principal" as const },
            ],
          } as const,
          value: "uint128" as const,
        },
      ],
      fungible_tokens: [],
      non_fungible_tokens: [],
    } as const;

    assertType<ExtractAbiMapNames<typeof testAbi>>("balances");
    assertType<ExtractAbiMapNames<typeof testAbi>>("allowances");
  });

  test("ExtractAbiMap", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [
        {
          name: "balances",
          key: "principal" as const,
          value: "uint128" as const,
        },
        {
          name: "allowances",
          key: {
            tuple: [
              { name: "owner", type: "principal" as const },
              { name: "spender", type: "principal" as const },
            ],
          } as const,
          value: "uint128" as const,
        },
      ],
      fungible_tokens: [],
      non_fungible_tokens: [],
    } as const;

    assertType<ExtractAbiMap<typeof testAbi, "balances">>({
      name: "balances",
      key: "principal",
      value: "uint128",
    });

    assertType<ExtractAbiMap<typeof testAbi, "allowances">>({
      name: "allowances",
      key: {
        tuple: [
          { name: "owner", type: "principal" },
          { name: "spender", type: "principal" },
        ],
      },
      value: "uint128",
    });
  });

  test("ExtractAbiMapKeyType with simple key", () => {
    const map = {
      name: "balances",
      key: "principal" as const,
      value: "uint128" as const,
    } as const;

    type KeyType = ExtractAbiMapKeyType<typeof map>;
    assertType<KeyType>("SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR");
  });

  test("ExtractAbiMapKeyType with tuple key", () => {
    const map = {
      name: "allowances",
      key: {
        tuple: [
          { name: "owner", type: "principal" as const },
          { name: "spender", type: "principal" as const },
        ],
      } as const,
      value: "uint128" as const,
    } as const;

    type KeyType = ExtractAbiMapKeyType<typeof map>;
    assertType<KeyType>({
      owner: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
      spender: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
    });
  });

  test("ExtractAbiMapValueType with simple value", () => {
    const map = {
      name: "balances",
      key: "principal" as const,
      value: "uint128" as const,
    } as const;

    type ValueType = ExtractAbiMapValueType<typeof map>;
    assertType<ValueType>(1000n);
  });

  test("ExtractAbiMapValueType with tuple value", () => {
    const map = {
      name: "allowances",
      key: "principal" as const,
      value: {
        tuple: [
          { name: "amount", type: "uint128" as const },
          { name: "expires", type: "uint128" as const },
        ],
      } as const,
    } as const;

    type ValueType = ExtractAbiMapValueType<typeof map>;
    assertType<ValueType>({
      amount: 1000n,
      expires: 999999n,
    });
  });
});

describe("Tokens", () => {
  test("ExtractAbiFungibleTokens", () => {
    type Result = ExtractAbiFungibleTokens<typeof sip10Abi>;
    assertType<Result>({ name: "bridged-btc" });
  });

  test("ExtractAbiFungibleTokenNames", () => {
    type Result = ExtractAbiFungibleTokenNames<typeof sip10Abi>;
    assertType<Result>("bridged-btc");
  });

  test("ExtractAbiNonFungibleTokens", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [
        { name: "my-nft", type: "uint128" as const },
        {
          name: "domain-nft",
          type: { "string-ascii": { length: 64 } } as const,
        },
      ],
    } as const;

    type Result = ExtractAbiNonFungibleTokens<typeof testAbi>;
    assertType<Result>({ name: "my-nft", type: "uint128" });
    assertType<Result>({
      name: "domain-nft",
      type: { "string-ascii": { length: 64 } },
    });
  });

  test("ExtractAbiNonFungibleTokenNames", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [
        { name: "my-nft", type: "uint128" as const },
        { name: "domain-nft", type: "principal" as const },
      ],
    } as const;

    type Result = ExtractAbiNonFungibleTokenNames<typeof testAbi>;
    assertType<Result>("my-nft");
    assertType<Result>("domain-nft");
  });

  test("ExtractAbiNonFungibleToken", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [
        { name: "my-nft", type: "uint128" as const },
        { name: "domain-nft", type: "principal" as const },
      ],
    } as const;

    type Result = ExtractAbiNonFungibleToken<typeof testAbi, "my-nft">;
    assertType<Result>({ name: "my-nft", type: "uint128" });
  });

  test("ExtractAbiNonFungibleTokenType", () => {
    const token = { name: "my-nft", type: "uint128" as const };
    type Result = ExtractAbiNonFungibleTokenType<typeof token>;
    assertType<Result>(1n);

    const tupleToken = {
      name: "complex-nft",
      type: {
        tuple: [
          { name: "id", type: "uint128" as const },
          { name: "owner", type: "principal" as const },
        ],
      } as const,
    };
    type TupleResult = ExtractAbiNonFungibleTokenType<typeof tupleToken>;
    assertType<TupleResult>({
      id: 1n,
      owner: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
    });
  });
});

describe("Traits", () => {
  test("ExtractAbiDefinedTraits", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [],
      defined_traits: [
        {
          name: "sip-010-trait",
          functions: [
            {
              name: "transfer",
              access: "public" as const,
              args: [
                { name: "amount", type: "uint128" as const },
                { name: "sender", type: "principal" as const },
                { name: "recipient", type: "principal" as const },
              ],
              outputs: {
                type: { response: { ok: "bool", error: "uint128" } } as const,
              },
            },
          ],
        },
        {
          name: "ownable-trait",
          functions: [
            {
              name: "get-owner",
              access: "read_only" as const,
              args: [],
              outputs: { type: "principal" as const },
            },
          ],
        },
      ],
    } as const;

    type Result = ExtractAbiDefinedTraits<typeof testAbi>;
    assertType<Result>({
      name: "sip-010-trait",
      functions: [
        {
          name: "transfer",
          access: "public",
          args: [
            { name: "amount", type: "uint128" },
            { name: "sender", type: "principal" },
            { name: "recipient", type: "principal" },
          ],
          outputs: { type: { response: { ok: "bool", error: "uint128" } } },
        },
      ],
    });
  });

  test("ExtractAbiDefinedTraitNames", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [],
      defined_traits: [
        { name: "sip-010-trait", functions: [] },
        { name: "ownable-trait", functions: [] },
      ],
    } as const;

    type Result = ExtractAbiDefinedTraitNames<typeof testAbi>;
    assertType<Result>("sip-010-trait");
    assertType<Result>("ownable-trait");
  });

  test("ExtractAbiDefinedTrait", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [],
      defined_traits: [
        {
          name: "sip-010-trait",
          functions: [
            {
              name: "transfer",
              access: "public" as const,
              args: [],
              outputs: { type: "bool" as const },
            },
          ],
        },
        {
          name: "ownable-trait",
          functions: [
            {
              name: "get-owner",
              access: "read_only" as const,
              args: [],
              outputs: { type: "principal" as const },
            },
          ],
        },
      ],
    } as const;

    type Result = ExtractAbiDefinedTrait<typeof testAbi, "ownable-trait">;
    assertType<Result>({
      name: "ownable-trait",
      functions: [
        {
          name: "get-owner",
          access: "read_only",
          args: [],
          outputs: { type: "principal" },
        },
      ],
    });
  });

  test("ExtractAbiImplementedTraits", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [],
      implemented_traits: [
        {
          contract_id:
            "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard",
          trait_name: "sip-010-trait",
        },
        {
          contract_id: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.ownable",
          trait_name: "ownable-trait",
        },
      ],
    } as const;

    type Result = ExtractAbiImplementedTraits<typeof testAbi>;
    assertType<Result>({
      contract_id:
        "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard",
      trait_name: "sip-010-trait",
    });
    assertType<Result>({
      contract_id: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.ownable",
      trait_name: "ownable-trait",
    });
  });
});

describe("Fixed-Length Lists", () => {
  test("fixed-length list produces tuple", () => {
    // Length 3 should produce a tuple of exactly 3 elements
    type Result = ClarityTypeToPrimitiveType<{
      list: { type: "uint128"; length: 3 };
    }>;
    assertType<Result>([1n, 2n, 3n]);
  });

  test("fixed-length list with length 1", () => {
    type Result = ClarityTypeToPrimitiveType<{
      list: { type: "bool"; length: 1 };
    }>;
    assertType<Result>([true]);
  });

  test("variable-length list (length > 99) produces array", () => {
    type Result = ClarityTypeToPrimitiveType<{
      list: { type: "uint128"; length: 100 };
    }>;
    // Should accept any length array
    assertType<Result>([1n, 2n, 3n]);
    assertType<Result>([]);
  });

  test("nested fixed-length lists", () => {
    type Result = ClarityTypeToPrimitiveType<{
      list: {
        type: { list: { type: "uint128"; length: 2 } };
        length: 2;
      };
    }>;
    assertType<Result>([
      [1n, 2n],
      [3n, 4n],
    ]);
  });

  test("ClarityFixedArrayRange is in valid range", () => {
    // Should include 1 through 99
    assertType<ClarityFixedArrayRange>(1);
    assertType<ClarityFixedArrayRange>(50);
    assertType<ClarityFixedArrayRange>(99);
  });

  test("ClarityFixedArraySizeLookup maps string to number", () => {
    type Lookup = ClarityFixedArraySizeLookup;
    assertType<Lookup["1"]>(1);
    assertType<Lookup["50"]>(50);
    assertType<Lookup["99"]>(99);
  });
});

describe("Utility Types", () => {
  test("Merge combines objects with override", () => {
    type Result = Merge<{ a: string; b: number }, { b: string; c: boolean }>;
    assertType<Result>({ a: "hello", b: "world", c: true });
  });

  test("Merge with empty second object", () => {
    type Result = Merge<{ a: string; b: number }, {}>;
    assertType<Result>({ a: "hello", b: 42 });
  });

  test("Tuple creates fixed-length array", () => {
    type Result = Tuple<string, 3>;
    assertType<Result>(["a", "b", "c"]);
  });

  test("Tuple with single element", () => {
    type Result = Tuple<number, 1>;
    assertType<Result>([42]);
  });

  test("Range creates number array", () => {
    type Result = Range<1, 5>;
    assertType<Result>([1, 2, 3, 4, 5]);
  });

  test("Range with same start and stop", () => {
    type Result = Range<5, 5>;
    assertType<Result>([5]);
  });
});

describe("ClarityBasicTypeToPrimitiveType", () => {
  test("principal", () => {
    type Result = ClarityBasicTypeToPrimitiveType<"principal">;
    assertType<Result>("SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR");
  });

  test("bool", () => {
    type Result = ClarityBasicTypeToPrimitiveType<"bool">;
    assertType<Result>(true);
    assertType<Result>(false);
  });

  test("int128", () => {
    type Result = ClarityBasicTypeToPrimitiveType<"int128">;
    assertType<Result>(1n);
  });

  test("uint128", () => {
    type Result = ClarityBasicTypeToPrimitiveType<"uint128">;
    assertType<Result>(1n);
  });

  test("none", () => {
    type Result = ClarityBasicTypeToPrimitiveType<"none">;
    assertType<Result>(null);
  });

  test("buffer", () => {
    type Result = ClarityBasicTypeToPrimitiveType<{ buffer: { length: 32 } }>;
    assertType<Result>("0xabcd");
  });

  test("string-ascii", () => {
    type Result = ClarityBasicTypeToPrimitiveType<{
      "string-ascii": { length: 100 };
    }>;
    assertType<Result>("hello");
  });

  test("string-utf8", () => {
    type Result = ClarityBasicTypeToPrimitiveType<{
      "string-utf8": { length: 100 };
    }>;
    assertType<Result>("hello 世界");
  });
});
