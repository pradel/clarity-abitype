import { assertType, test } from "vitest";
import type { ClarityAbi, ClarityAbiFunction } from "./abi";
import {
  ClarityAbiArgsToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "./utils";
import { sip10Abi } from "./abis/json";

declare function callReadOnlyFunction<
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
}): ClarityAbiArgsToPrimitiveTypes<abiFunction["outputs"]>;

test("callReadOnlyFunction", () => {
  const contractAddress = "ST3KC0MTNW34S1ZXD36JYKFD3JJMWA01M55DSJ4JE";
  const contractName = "kv-store";

  const result = callReadOnlyFunction({
    abi: sip10Abi,
    functionName: "doesnt exist",
    // functionArgs: [],
  });
});
