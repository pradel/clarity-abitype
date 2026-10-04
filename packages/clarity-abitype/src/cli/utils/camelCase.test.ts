import { describe, expect, test } from "vite-plus/test";

import { camelCase } from "./camelCase.js";

describe("camelCase", () => {
  test.each([
    ["sbtcToken", "sbtcToken"],
    ["sbtc-token", "sbtcToken"],
    ["sbtc_token", "sbtcToken"],
    ["sbtc.token", "sbtcToken"],
    ["Sbtc Token", "sbtcToken"],
    ["ccd001-direct-execute", "ccd001DirectExecute"],
    ["USD Coin", "usdCoin"],
    ["foo__bar", "fooBar"],
    ["foo", "foo"],
  ])("camelCase(%o) -> %o", (input, expected) => {
    expect(camelCase(input)).toBe(expected);
  });
});
