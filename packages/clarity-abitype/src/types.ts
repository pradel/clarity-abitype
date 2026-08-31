import type { ResolvedRegister } from "./register.js";

/**
 * Prints custom error message
 *
 * @param messages - Error message
 * @returns Custom error message
 *
 * @example
 * type Result = Error<'Custom error message'>
 * //   ^? type Result = ['Error: Custom error message']
 */
export type Error<messages extends string | string[]> = messages extends string
  ? [
      // Surrounding with array to prevent `messages` from being widened to `string`
      `Error: ${messages}`,
    ]
  : {
      [key in keyof messages]: messages[key] extends infer message extends
        string
        ? `Error: ${message}`
        : never;
    };

/**
 * Merges two object types into new type
 *
 * @param object1 - Object to merge into
 * @param object2 - Object to merge and override keys from {@link object1}
 * @returns New object type with keys from {@link object1} and {@link object2}. If a key exists in both {@link object1} and {@link object2}, the key from {@link object2} will be used.
 *
 * @example
 * type Result = Merge<{ foo: string }, { foo: number; bar: string }>
 * //   ^? type Result = { foo: number; bar: string }
 */
export type Merge<object1, object2> = Omit<object1, keyof object2> & object2;

/**
 * Combines members of an intersection into a readable type.
 *
 * @link https://twitter.com/mattpocockuk/status/1622730173446557697?s=20&t=NdpAcmEFXY01xkqU3KO0Mg
 * @example
 * type Result = Prettify<{ a: string } & { b: string } & { c: number, d: bigint }>
 * //   ^? type Result = { a: string; b: string; c: number; d: bigint }
 */
export type Prettify<type> = { [key in keyof type]: type[key] } & {};

/**
 * Evaluates each union member with {@link Prettify}.
 */
export type UnionEvaluate<type> = type extends object ? Prettify<type> : type;

/**
 * Prevents TypeScript from inferring generic type arguments from a specific position.
 */
export type NoInfer<type> = [type][type extends any ? 0 : never];

/**
 * Checks if {@link T} is `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Checks if {@link T} can be narrowed further than {@link U}.
 */
export type IsNarrowable<T, U> =
  IsNever<
    (T extends U ? true : false) & (U extends T ? false : true)
  > extends true
    ? false
    : true;

/**
 * Checks if {@link union} is a union type.
 */
export type IsUnion<
  union,
  ///
  union2 = union,
> = union extends union2 ? ([union2] extends [union] ? false : true) : never;

/**
 * Widens literal types to their general primitive types (e.g. `100n` -> `bigint`, `"SP..."` -> `string`).
 */
export type Widen<type> =
  | ([unknown] extends [type] ? unknown : never)
  | (type extends Function ? type : never)
  | (type extends null ? null : never)
  | (type extends undefined ? undefined : never)
  | (type extends boolean ? boolean : never)
  | (type extends ResolvedRegister["BigIntType"] ? bigint : never)
  | (type extends number ? number : never)
  | (type extends string
      ? type extends ResolvedRegister["AddressType"]
        ? ResolvedRegister["AddressType"]
        : type extends ResolvedRegister["BytesType"]["inputs"]
          ? ResolvedRegister["BytesType"]["inputs"]
          : string
      : never)
  | (type extends readonly [] ? readonly [] : never)
  | (type extends Record<string, unknown>
      ? { [K in keyof type]: Widen<type[K]> }
      : never)
  | (type extends readonly unknown[]
      ? {
          [K in keyof type]: Widen<type[K]>;
        }
      : never);

/**
 * Distributes {@link Widen} over union types.
 */
export type UnionWiden<type> = type extends any ? Widen<type> : never;

/**
 * Construct a type with the properties of union type T except for those in type K.
 */
export type UnionOmit<type, keys extends keyof any> = type extends any
  ? Omit<type, keys>
  : never;

/**
 * Construct a type with the picked properties of union type T.
 */
export type UnionPick<type, keys extends keyof any> = type extends any
  ? Pick<type, keys & keyof type>
  : never;

/**
 * Makes all properties optional without undefined widening.
 */
export type ExactPartial<type> = {
  [key in keyof type]?: type[key] | undefined;
};

/**
 * Makes all properties required and removes undefined.
 */
export type ExactRequired<type> = {
  [P in keyof type]-?: Exclude<type[P], undefined>;
};

/**
 * Enforces that only one variant in a union is provided.
 */
export type OneOf<
  union extends object,
  fallback extends object | undefined = undefined,
  ///
  keys extends KeyofUnion<union> = KeyofUnion<union>,
> = union extends infer item
  ? Prettify<
      item & {
        [key in Exclude<keys, keyof item>]?: fallback extends object
          ? key extends keyof fallback
            ? fallback[key]
            : undefined
          : undefined;
      }
    >
  : never;
type KeyofUnion<type> = type extends type ? keyof type : never;

/**
 * Creates range between two positive numbers using [tail recursion](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types).
 *
 * @param start - Number to start range
 * @param stop - Number to end range
 * @returns Array with inclusive range from {@link start} to {@link stop}
 *
 * @example
 * type Result = Range<1, 3>
 * //   ^? type Result = [1, 2, 3]
 */
// From [Type Challenges](https://github.com/type-challenges/type-challenges/issues/11625)
export type Range<
  start extends number,
  stop extends number,
  ///
  result extends number[] = [],
  padding extends 0[] = [],
  current extends number = [...padding, ...result]["length"] & number,
> = current extends stop
  ? current extends start
    ? [current]
    : result extends []
      ? []
      : [...result, current]
  : current extends start
    ? Range<start, stop, [current], padding>
    : result extends []
      ? Range<start, stop, [], [...padding, 0]>
      : Range<start, stop, [...result, current], padding>;

/**
 * Create tuple of {@link type} type with {@link size} size
 *
 * @param Type - Type of tuple
 * @param Size - Size of tuple
 * @returns Tuple of {@link type} type with {@link size} size
 *
 * @example
 * type Result = Tuple<string, 2>
 * //   ^? type Result = [string, string]
 */
// https://github.com/Microsoft/TypeScript/issues/26223#issuecomment-674500430
export type Tuple<type, size extends number> = size extends size
  ? number extends size
    ? type[]
    : _TupleOf<type, size, []>
  : never;
type _TupleOf<
  length,
  size extends number,
  acc extends readonly unknown[],
> = acc["length"] extends size
  ? acc
  : _TupleOf<length, size, readonly [length, ...acc]>;
