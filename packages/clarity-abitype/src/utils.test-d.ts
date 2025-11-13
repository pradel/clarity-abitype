import { assertType, describe, test } from "vitest";
import type { ClarityTypeToPrimitiveType } from "./utils";

describe("ClarityTypeToPrimitiveType", () => {
  test("bool", () => {
    assertType<ClarityTypeToPrimitiveType<"bool">>(true);
    assertType<ClarityTypeToPrimitiveType<"bool">>(false);
  });
});
