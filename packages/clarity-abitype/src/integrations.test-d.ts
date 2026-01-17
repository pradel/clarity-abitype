import { assertType, test } from "vitest";
import type { ClarityAbi, ClarityAbiFunction } from "./abi";
import type {
  ClarityAbiArgsToPrimitiveTypes,
  ClarityAbiOutputToPrimitiveType,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "./utils";
import { sip10Abi } from "./abis/json";

function callReadOnlyFunction<
  abi extends ClarityAbi,
  functionName extends ExtractAbiFunctionNames<abi, "read_only">,
  abiFunction extends ClarityAbiFunction = ExtractAbiFunction<
    abi,
    functionName
  >,
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
});
