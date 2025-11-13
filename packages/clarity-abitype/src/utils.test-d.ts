import { assertType, describe, test } from "vitest";
import type { ClarityAbi } from "./abi.js";
import type { sip10Abi } from "./abis/json.js";
import type {
  ClarityAbiArgToPrimitiveType,
  ClarityAbiArgsToPrimitiveTypes,
  ClarityAbiOutputToPrimitiveType,
  ClarityTypeToPrimitiveType,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
  ExtractAbiFunctions,
  ExtractAbiMap,
  ExtractAbiMapNames,
  ExtractAbiMaps,
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
    assertType<
      ClarityTypeToPrimitiveType<{
        list: { type: "uint128"; length: 10 };
      }>
    >([1n, 2n, 3n]);

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
    type Result = ClarityAbiArgToPrimitiveType<{
      name: "amounts";
      type: { list: { type: "uint128"; length: 10 } };
    }>;
    assertType<Result>({ amounts: [1n, 2n, 3n] });
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
          key: [{ name: "account", type: "principal" as const }],
          value: [{ name: "balance", type: "uint128" as const }],
        },
      ],
      fungible_tokens: [],
      non_fungible_tokens: [],
    } as const;

    type Result = ExtractAbiMaps<typeof testAbi>;
    assertType<Result>({
      name: "balances",
      key: [{ name: "account", type: "principal" }],
      value: [{ name: "balance", type: "uint128" }],
    });
  });

  test("ExtractAbiMapNames", () => {
    const testAbi = {
      functions: [],
      variables: [],
      maps: [
        {
          name: "balances",
          key: [{ name: "account", type: "principal" as const }],
          value: [{ name: "balance", type: "uint128" as const }],
        },
        {
          name: "allowances",
          key: [
            { name: "owner", type: "principal" as const },
            { name: "spender", type: "principal" as const },
          ],
          value: [{ name: "amount", type: "uint128" as const }],
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
          key: [{ name: "account", type: "principal" as const }],
          value: [{ name: "balance", type: "uint128" as const }],
        },
        {
          name: "allowances",
          key: [
            { name: "owner", type: "principal" as const },
            { name: "spender", type: "principal" as const },
          ],
          value: [{ name: "amount", type: "uint128" as const }],
        },
      ],
      fungible_tokens: [],
      non_fungible_tokens: [],
    } as const;

    assertType<ExtractAbiMap<typeof testAbi, "balances">>({
      name: "balances",
      key: [{ name: "account", type: "principal" }],
      value: [{ name: "balance", type: "uint128" }],
    });

    assertType<ExtractAbiMap<typeof testAbi, "allowances">>({
      name: "allowances",
      key: [
        { name: "owner", type: "principal" },
        { name: "spender", type: "principal" },
      ],
      value: [{ name: "amount", type: "uint128" }],
    });
  });
});
