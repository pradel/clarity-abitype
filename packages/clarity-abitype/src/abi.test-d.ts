import { assertType, test } from "vitest";
import type {
  ClarityAbi,
  ClarityAbiAccess,
  ClarityAbiArg,
  ClarityAbiFunction,
  ClarityAbiFungibleToken,
  ClarityAbiMap,
  ClarityAbiNonFungibleToken,
  ClarityAbiOutput,
  ClarityAbiVariable,
  ClarityBool,
  ClarityBuffer,
  ClarityEpoch,
  ClarityInt,
  ClarityList,
  ClarityNone,
  ClarityOptional,
  ClarityPrincipal,
  ClarityResponse,
  ClarityStringAscii,
  ClarityStringUtf8,
  ClarityTuple,
  ClarityUInt,
  ClarityVariableAccess,
  ClarityVersion,
} from "./abi";
import { sip10Abi } from "./abis/json";

test("Clarity Primitive Types", () => {
  assertType<ClarityInt>("int128");
  assertType<ClarityUInt>("uint128");
  assertType<ClarityBool>("bool");
  assertType<ClarityPrincipal>("principal");
  assertType<ClarityNone>("none");
});

test("ClarityBuffer", () => {
  assertType<ClarityBuffer>({
    buffer: {
      length: 32,
    },
  });

  assertType<ClarityBuffer>({
    buffer: {
      length: 1024,
    },
  });
});

test("ClarityStringAscii", () => {
  assertType<ClarityStringAscii>({
    "string-ascii": {
      length: 10,
    },
  });

  assertType<ClarityStringAscii>({
    "string-ascii": {
      length: 256,
    },
  });
});

test("ClarityStringUtf8", () => {
  assertType<ClarityStringUtf8>({
    "string-utf8": {
      length: 256,
    },
  });

  assertType<ClarityStringUtf8>({
    "string-utf8": {
      length: 1024,
    },
  });
});

test("ClarityList", () => {
  assertType<ClarityList>({
    list: {
      type: "uint128",
      length: 10,
    },
  });

  assertType<ClarityList>({
    list: {
      type: "principal",
      length: 100,
    },
  });

  // List of tuples
  assertType<ClarityList>({
    list: {
      type: {
        tuple: [
          { name: "amount", type: "uint128" },
          { name: "sender", type: "principal" },
        ],
      },
      length: 200,
    },
  });
});

test("ClarityTuple", () => {
  assertType<ClarityTuple>({
    tuple: [
      { name: "amount", type: "uint128" },
      { name: "sender", type: "principal" },
    ],
  });

  assertType<ClarityTuple>({
    tuple: [
      { name: "id", type: "uint128" },
      {
        name: "data",
        type: {
          "string-ascii": { length: 32 },
        },
      },
    ],
  });

  // Nested tuple
  assertType<ClarityTuple>({
    tuple: [
      { name: "name", type: "principal" },
      {
        name: "metadata",
        type: {
          tuple: [
            { name: "age", type: "uint128" },
            { name: "active", type: "bool" },
          ],
        },
      },
    ],
  });
});

test("ClarityOptional", () => {
  assertType<ClarityOptional>({
    optional: "uint128",
  });

  assertType<ClarityOptional>({
    optional: {
      buffer: { length: 34 },
    },
  });

  assertType<ClarityOptional>({
    optional: {
      "string-utf8": { length: 256 },
    },
  });
});

test("ClarityResponse", () => {
  assertType<ClarityResponse>({
    response: {
      ok: "bool",
      error: "uint128",
    },
  });

  assertType<ClarityResponse>({
    response: {
      ok: "uint128",
      error: "uint128",
    },
  });

  assertType<ClarityResponse>({
    response: {
      ok: {
        tuple: [
          { name: "id", type: "uint128" },
          { name: "name", type: "principal" },
        ],
      },
      error: "uint128",
    },
  });
});

test("ClarityAbiArg", () => {
  assertType<ClarityAbiArg>({
    name: "amount",
    type: "uint128",
  });

  assertType<ClarityAbiArg>({
    name: "recipient",
    type: "principal",
  });

  assertType<ClarityAbiArg>({
    name: "memo",
    type: {
      optional: {
        buffer: { length: 34 },
      },
    },
  });

  assertType<ClarityAbiArg>({
    name: "data",
    type: {
      tuple: [
        { name: "amount", type: "uint128" },
        { name: "sender", type: "principal" },
      ],
    },
  });
});

test("ClarityAbiOutput", () => {
  assertType<ClarityAbiOutput>({
    type: "uint128",
  });

  assertType<ClarityAbiOutput>({
    type: {
      response: {
        ok: "bool",
        error: "uint128",
      },
    },
  });
});

test("ClarityAbiAccess", () => {
  assertType<ClarityAbiAccess>("public");
  assertType<ClarityAbiAccess>("private");
  assertType<ClarityAbiAccess>("read_only");
  // @ts-expect-error invalid access modifier
  assertType<ClarityAbiAccess>("invalid");
});

test("ClarityAbiFunction", () => {
  assertType<ClarityAbiFunction>({
    name: "transfer",
    access: "public",
    args: [
      { name: "amount", type: "uint128" },
      { name: "sender", type: "principal" },
      { name: "recipient", type: "principal" },
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

  assertType<ClarityAbiFunction>({
    name: "get-balance",
    access: "read_only",
    args: [{ name: "account", type: "principal" }],
    outputs: {
      type: "uint128",
    },
  });

  assertType<ClarityAbiFunction>({
    name: "pow-decimals",
    access: "private",
    args: [],
    outputs: {
      type: "uint128",
    },
  });
});

test("ClarityVariableAccess", () => {
  assertType<ClarityVariableAccess>("constant");
  assertType<ClarityVariableAccess>("variable");
});

test("ClarityAbiVariable", () => {
  assertType<ClarityAbiVariable>({
    name: "token-name",
    type: {
      "string-ascii": { length: 32 },
    },
    access: "variable",
  });

  assertType<ClarityAbiVariable>({
    name: "ERR-NOT-AUTHORIZED",
    type: {
      response: {
        ok: "bool",
        error: "uint128",
      },
    },
    access: "constant",
  });

  assertType<ClarityAbiVariable>({
    name: "contract-owner",
    type: "principal",
    access: "constant",
  });
});

test("ClarityAbiMap", () => {
  assertType<ClarityAbiMap>({
    name: "balances",
    key: [{ name: "account", type: "principal" }],
    value: [{ name: "balance", type: "uint128" }],
  });

  assertType<ClarityAbiMap>({
    name: "allowances",
    key: [
      { name: "owner", type: "principal" },
      { name: "spender", type: "principal" },
    ],
    value: [{ name: "amount", type: "uint128" }],
  });
});

test("ClarityAbiFungibleToken", () => {
  assertType<ClarityAbiFungibleToken>({
    name: "wrapped-bitcoin",
  });
});

test("ClarityAbiNonFungibleToken", () => {
  assertType<ClarityAbiNonFungibleToken>({
    name: "my-nft",
    type: "uint128",
  });
});

test("ClarityEpoch", () => {
  assertType<ClarityEpoch>("Epoch20");
  assertType<ClarityEpoch>("Epoch21");
  assertType<ClarityEpoch>("Epoch22");
  assertType<ClarityEpoch>("Epoch23");
  assertType<ClarityEpoch>("Epoch24");
  assertType<ClarityEpoch>("Epoch25");
  assertType<ClarityEpoch>("Epoch30");
  // @ts-expect-error Epoch40 does not exist
  assertType<ClarityEpoch>("Epoch40");
});

test("ClarityVersion", () => {
  assertType<ClarityVersion>("Clarity1");
  assertType<ClarityVersion>("Clarity2");
  assertType<ClarityVersion>("Clarity3");
  assertType<ClarityVersion>("Clarity4");
  // @ts-expect-error Clarity5 does not exist
  assertType<ClarityVersion>("Clarity5");
});

test("ClarityAbi", () => {
  assertType<ClarityAbi>(sip10Abi);

  assertType<ClarityAbi>({
    functions: [
      {
        name: "transfer",
        access: "public",
        args: [
          { name: "amount", type: "uint128" },
          { name: "sender", type: "principal" },
          { name: "recipient", type: "principal" },
        ],
        outputs: {
          type: {
            response: {
              ok: "bool",
              error: "uint128",
            },
          },
        },
      },
      {
        name: "get-balance",
        access: "read_only",
        args: [{ name: "who", type: "principal" }],
        outputs: {
          type: "uint128",
        },
      },
    ],
    variables: [
      {
        name: "contract-owner",
        type: "principal",
        access: "constant",
      },
      {
        name: "token-name",
        type: {
          "string-ascii": { length: 32 },
        },
        access: "variable",
      },
    ],
    maps: [
      {
        name: "balances",
        key: [{ name: "account", type: "principal" }],
        value: [{ name: "balance", type: "uint128" }],
      },
    ],
    fungible_tokens: [
      {
        name: "my-token",
      },
    ],
    non_fungible_tokens: [],
    epoch: "Epoch25",
    clarity_version: "Clarity2",
  });

  // Minimal valid ABI
  assertType<ClarityAbi>({
    functions: [],
    variables: [],
    maps: [],
    fungible_tokens: [],
    non_fungible_tokens: [],
  });
});
