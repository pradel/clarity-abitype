import { assertType, describe, test } from "vite-plus/test";

import type {
  ExactPartial,
  ExactRequired,
  IsNarrowable,
  IsNever,
  IsUnion,
  NoInfer,
  OneOf,
  Prettify,
  UnionEvaluate,
  UnionOmit,
  UnionPick,
  UnionWiden,
  Widen,
} from "./types.js";

describe("Type Utilities ported from viem/abitype", () => {
  test("NoInfer", () => {
    function testNoInfer<T>(val: T, _cb: (x: NoInfer<T>) => void) {
      return val;
    }
    const res = testNoInfer("hello", (x) => {
      assertType<string>(x);
    });
    assertType<string>(res);
  });

  test("IsNever", () => {
    assertType<IsNever<never>>(true);
    assertType<IsNever<string>>(false);
    assertType<IsNever<unknown>>(false);
  });

  test("IsNarrowable", () => {
    assertType<IsNarrowable<"transfer", string>>(true);
    assertType<IsNarrowable<string, string>>(false);
  });

  test("IsUnion", () => {
    assertType<IsUnion<"a" | "b">>(true);
    assertType<IsUnion<"a">>(false);
  });

  test("Widen & UnionWiden", () => {
    assertType<Widen<100n>>(100n);
    assertType<Widen<"SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR">>(
      "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
    );
    assertType<Widen<true>>(true);
    assertType<Widen<null>>(null);

    type WidenedArgs = UnionWiden<readonly [100n, "SP..."]>;
    assertType<WidenedArgs>([100n, "SP..."]);
  });

  test("Prettify & UnionEvaluate", () => {
    type Intersection = { a: string } & { b: number };
    type Prettified = Prettify<Intersection>;
    assertType<Prettified>({ a: "test", b: 123 });

    type UnionType = { a: string } | { b: number };
    type Evaluated = UnionEvaluate<UnionType>;
    assertType<Evaluated>({ a: "test" });
  });

  test("UnionOmit & UnionPick", () => {
    type Union = { a: string; b: number } | { a: string; c: boolean };
    type Omitted = UnionOmit<Union, "a">;
    assertType<Omitted>({ b: 123 });
    assertType<Omitted>({ c: true });

    type Picked = UnionPick<Union, "a">;
    assertType<Picked>({ a: "foo" });
  });

  test("ExactPartial & ExactRequired", () => {
    type Obj = { a: string; b?: number };
    type PartialObj = ExactPartial<Obj>;
    assertType<PartialObj>({});
    assertType<PartialObj>({ a: "foo" });

    type RequiredObj = ExactRequired<Obj>;
    assertType<RequiredObj>({ a: "foo", b: 123 });
  });

  test("OneOf", () => {
    type Variants = { ok: boolean } | { error: bigint };
    type Disjoint = OneOf<Variants>;
    assertType<Disjoint>({ ok: true });
    assertType<Disjoint>({ error: 100n });
  });
});
