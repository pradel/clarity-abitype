import { assertType, test } from "vitest";

import { sbtcTokenAbi } from "../tests/SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
import { ccd001DirectExecuteAbi } from "../tests/SP8A9HZ3PKST0S42VM9523Z9NV42SZ026V4K39WH.ccd001-direct-execute";
import type { ClarityAbi, ClarityAbiFunction } from "./abi";
import { sip10Abi } from "./abis/json";
import type {
  ClarityAbiArgsToPrimitiveTypes,
  ClarityAbiOutputToPrimitiveType,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "./utils";

function callReadOnlyFunction<
  abi extends ClarityAbi,
  functionName extends ExtractAbiFunctionNames<abi, "read_only">,
  abiFunction extends ClarityAbiFunction = ExtractAbiFunction<
    abi,
    functionName
  >,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(config: {
  abi: abi;
  functionName: functionName | ExtractAbiFunctionNames<abi, "read_only">;
  functionArgs: ClarityAbiArgsToPrimitiveTypes<abiFunction["args"]>;
}): ClarityAbiOutputToPrimitiveType<abiFunction["outputs"]> {
  return {} as any;
}

test("callReadOnlyFunction", () => {
  assertType<ClarityAbiOutputToPrimitiveType<bigint>>(
    callReadOnlyFunction({
      abi: sip10Abi,
      functionName: "get-decimals",
      functionArgs: [],
    }),
  );

  assertType<ClarityAbiOutputToPrimitiveType<bigint>>(
    callReadOnlyFunction({
      abi: sip10Abi,
      functionName: "fixed-to-decimals",
      functionArgs: [1000000n],
    }),
  );

  assertType<ClarityAbiOutputToPrimitiveType<bigint>>(
    callReadOnlyFunction({
      abi: sip10Abi,
      functionName: "get-balance",
      functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
    }),
  );

  assertType<ClarityAbiOutputToPrimitiveType<bigint>>(
    callReadOnlyFunction({
      abi: sip10Abi,
      // @ts-expect-error invalid function name
      functionName: "dadsasa",
      functionArgs: [],
    }),
  );

  assertType<ClarityAbiOutputToPrimitiveType<bigint>>(
    callReadOnlyFunction({
      abi: sip10Abi,
      functionName: "get-balance",
      // @ts-expect-error invalid function args
      functionArgs: [1000],
    }),
  );
});

test("Various clarity contracts", () => {
  assertType<ClarityAbiOutputToPrimitiveType<bigint>>(
    callReadOnlyFunction({
      abi: sbtcTokenAbi,
      functionName: "get-symbol",
      functionArgs: [],
    }),
  );

  assertType<ClarityAbiOutputToPrimitiveType<bigint>>(
    callReadOnlyFunction({
      abi: ccd001DirectExecuteAbi,
      functionName: "is-approver",
      functionArgs: ["SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR"],
    }),
  );
});
