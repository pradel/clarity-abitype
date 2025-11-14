export const sip10Abi = {
  maps: [],
  epoch: "Epoch25",
  functions: [
    {
      args: [
        {
          name: "item",
          type: {
            tuple: [
              {
                name: "amount",
                type: "uint128",
              },
              {
                name: "sender",
                type: "principal",
              },
            ],
          },
        },
      ],
      name: "burn-fixed-many-iter",
      access: "private",
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
      args: [
        {
          name: "amount",
          type: "uint128",
        },
      ],
      name: "decimals-to-fixed",
      access: "private",
      outputs: {
        type: "uint128",
      },
    },
    {
      args: [],
      name: "pow-decimals",
      access: "private",
      outputs: {
        type: "uint128",
      },
    },
    {
      args: [
        {
          name: "amount",
          type: "uint128",
        },
        {
          name: "sender",
          type: "principal",
        },
      ],
      name: "burn",
      access: "public",
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
      args: [
        {
          name: "amount",
          type: "uint128",
        },
        {
          name: "sender",
          type: "principal",
        },
      ],
      name: "burn-fixed",
      access: "public",
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
      args: [
        {
          name: "senders",
          type: {
            list: {
              type: {
                tuple: [
                  {
                    name: "amount",
                    type: "uint128",
                  },
                  {
                    name: "sender",
                    type: "principal",
                  },
                ],
              },
              length: 200,
            },
          },
        },
      ],
      name: "burn-fixed-many",
      access: "public",
      outputs: {
        type: {
          response: {
            ok: {
              list: {
                type: {
                  response: {
                    ok: "bool",
                    error: "uint128",
                  },
                },
                length: 200,
              },
            },
            error: "uint128",
          },
        },
      },
    },
    {
      args: [
        {
          name: "amount",
          type: "uint128",
        },
        {
          name: "recipient",
          type: "principal",
        },
      ],
      name: "mint",
      access: "public",
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
      args: [
        {
          name: "amount",
          type: "uint128",
        },
        {
          name: "recipient",
          type: "principal",
        },
      ],
      name: "mint-fixed",
      access: "public",
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
      args: [
        {
          name: "new-decimals",
          type: "uint128",
        },
      ],
      name: "set-decimals",
      access: "public",
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
      args: [
        {
          name: "new-name",
          type: {
            "string-ascii": {
              length: 32,
            },
          },
        },
      ],
      name: "set-name",
      access: "public",
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
      args: [
        {
          name: "new-symbol",
          type: {
            "string-ascii": {
              length: 10,
            },
          },
        },
      ],
      name: "set-symbol",
      access: "public",
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
      args: [
        {
          name: "new-uri",
          type: {
            optional: {
              "string-utf8": {
                length: 256,
              },
            },
          },
        },
      ],
      name: "set-token-uri",
      access: "public",
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
      args: [
        {
          name: "amount",
          type: "uint128",
        },
        {
          name: "sender",
          type: "principal",
        },
        {
          name: "recipient",
          type: "principal",
        },
        {
          name: "memo",
          type: {
            optional: {
              buffer: {
                length: 34,
              },
            },
          },
        },
      ],
      name: "transfer",
      access: "public",
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
      args: [
        {
          name: "amount",
          type: "uint128",
        },
        {
          name: "sender",
          type: "principal",
        },
        {
          name: "recipient",
          type: "principal",
        },
        {
          name: "memo",
          type: {
            optional: {
              buffer: {
                length: 34,
              },
            },
          },
        },
      ],
      name: "transfer-fixed",
      access: "public",
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
      args: [
        {
          name: "amount",
          type: "uint128",
        },
      ],
      name: "fixed-to-decimals",
      access: "read_only",
      outputs: {
        type: "uint128",
      },
    },
    {
      args: [
        {
          name: "who",
          type: "principal",
        },
      ],
      name: "get-balance",
      access: "read_only",
      outputs: {
        type: {
          response: {
            ok: "uint128",
            error: "none",
          },
        },
      },
    },
    {
      args: [
        {
          name: "account",
          type: "principal",
        },
      ],
      name: "get-balance-fixed",
      access: "read_only",
      outputs: {
        type: {
          response: {
            ok: "uint128",
            error: "none",
          },
        },
      },
    },
    {
      args: [],
      name: "get-decimals",
      access: "read_only",
      outputs: {
        type: {
          response: {
            ok: "uint128",
            error: "none",
          },
        },
      },
    },
    {
      args: [],
      name: "get-name",
      access: "read_only",
      outputs: {
        type: {
          response: {
            ok: {
              "string-ascii": {
                length: 32,
              },
            },
            error: "none",
          },
        },
      },
    },
    {
      args: [],
      name: "get-symbol",
      access: "read_only",
      outputs: {
        type: {
          response: {
            ok: {
              "string-ascii": {
                length: 10,
              },
            },
            error: "none",
          },
        },
      },
    },
    {
      args: [],
      name: "get-token-uri",
      access: "read_only",
      outputs: {
        type: {
          response: {
            ok: {
              optional: {
                "string-utf8": {
                  length: 256,
                },
              },
            },
            error: "none",
          },
        },
      },
    },
    {
      args: [],
      name: "get-total-supply",
      access: "read_only",
      outputs: {
        type: {
          response: {
            ok: "uint128",
            error: "none",
          },
        },
      },
    },
    {
      args: [],
      name: "get-total-supply-fixed",
      access: "read_only",
      outputs: {
        type: {
          response: {
            ok: "uint128",
            error: "none",
          },
        },
      },
    },
    {
      args: [],
      name: "is-dao-or-extension",
      access: "read_only",
      outputs: {
        type: {
          response: {
            ok: "bool",
            error: "uint128",
          },
        },
      },
    },
  ],
  variables: [
    {
      name: "ERR-NOT-AUTHORIZED",
      type: {
        response: {
          ok: "none",
          error: "uint128",
        },
      },
      access: "constant",
    },
    {
      name: "ONE_8",
      type: "uint128",
      access: "constant",
    },
    {
      name: "token-decimals",
      type: "uint128",
      access: "variable",
    },
    {
      name: "token-name",
      type: {
        "string-ascii": {
          length: 32,
        },
      },
      access: "variable",
    },
    {
      name: "token-symbol",
      type: {
        "string-ascii": {
          length: 10,
        },
      },
      access: "variable",
    },
    {
      name: "token-uri",
      type: {
        optional: {
          "string-utf8": {
            length: 256,
          },
        },
      },
      access: "variable",
    },
  ],
  clarity_version: "Clarity2",
  fungible_tokens: [
    {
      name: "bridged-btc",
    },
  ],
  non_fungible_tokens: [],
} as const;
