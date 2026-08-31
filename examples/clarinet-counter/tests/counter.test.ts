import { initSimnet } from "@stacks/clarinet-sdk";
import { callReadOnlyFn, callPublicFn } from "clarity-abitype/clarinet-sdk";
import { expect, test } from "vite-plus/test";

const counterAbi = {
  functions: [
    {
      name: "count-up",
      access: "public",
      args: [],
      outputs: {
        type: {
          response: {
            ok: "bool",
            error: "none",
          },
        },
      },
    },
    {
      name: "get-count",
      access: "read_only",
      args: [
        {
          name: "who",
          type: "principal",
        },
      ],
      outputs: {
        type: "uint128",
      },
    },
  ],
  variables: [],
  maps: [
    {
      name: "counters",
      key: "principal",
      value: "uint128",
    },
  ],
  fungible_tokens: [],
  non_fungible_tokens: [],
  epoch: "Epoch23",
  clarity_version: "Clarity4",
} as const;

const simnet = await initSimnet();
const accounts = simnet.getAccounts();

test("get-count returns u0 for principals that never called count-up before", () => {
  // Get the deployer account.
  const deployer = accounts.get("deployer")!;

  // Call the get-count read-only function.
  // The first parameter is the contract name, the second the function name, and the
  // third the function arguments as an array. The final parameter is the tx-sender.
  const incrementResponse = callReadOnlyFn({
    simnet,
    abi: counterAbi,
    contract: "counter",
    functionName: "get-count",
    functionArgs: [deployer],
    sender: deployer,
  });

  // Assert that the returned result is a uint with a value of 0 (u0).
  expect(incrementResponse.result).toBe(0n);
});

test("count-up counts up for the tx-sender", () => {
  // Get the deployer account.
  const deployer = accounts.get("deployer")!;

  const response = callPublicFn({
    simnet,
    abi: counterAbi,
    contract: "counter",
    functionName: "count-up",
    sender: deployer,
  });

  // Assert that the returned result is a boolean true.
  expect(response.result.ok).toBe(true);

  // Get the counter value.
  const getCountResponse = callReadOnlyFn({
    simnet,
    abi: counterAbi,
    contract: "counter",
    functionName: "get-count",
    functionArgs: [deployer],
    sender: deployer,
  });

  // Assert that the returned result is a u1.
  expect(getCountResponse.result).toBe(1n);
});

test("counters are specific to the tx-sender", () => {
  // Get some accounts.
  const deployer = accounts.get("deployer")!;
  const wallet1 = accounts.get("wallet_1")!;
  const wallet2 = accounts.get("wallet_2")!;

  // Wallet 1 calls count-up one time.
  callPublicFn({
    simnet,
    abi: counterAbi,
    contract: "counter",
    functionName: "count-up",
    sender: wallet1,
  });

  // Wallet 2 calls count-up two times.
  callPublicFn({
    simnet,
    abi: counterAbi,
    contract: "counter",
    functionName: "count-up",
    sender: wallet2,
  });
  callPublicFn({
    simnet,
    abi: counterAbi,
    contract: "counter",
    functionName: "count-up",
    sender: wallet2,
  });

  // Get and assert the counter value for deployer.
  const deployerCount = callReadOnlyFn({
    simnet,
    abi: counterAbi,
    contract: "counter",
    functionName: "get-count",
    functionArgs: [deployer],
    sender: deployer,
  });
  expect(deployerCount.result).toBe(0n);

  // Get and assert the counter value for wallet 1.
  const wallet1Count = callReadOnlyFn({
    simnet,
    abi: counterAbi,
    contract: "counter",
    functionName: "get-count",
    functionArgs: [wallet1],
    sender: wallet1,
  });
  expect(wallet1Count.result).toBe(1n);

  // Get and assert the counter value for wallet 2.
  const wallet2Count = callReadOnlyFn({
    simnet,
    abi: counterAbi,
    contract: "counter",
    functionName: "get-count",
    functionArgs: [wallet2],
    sender: wallet2,
  });
  expect(wallet2Count.result).toBe(2n);
});
