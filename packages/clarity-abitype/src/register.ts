export interface Register {}

export type ResolvedRegister = {
  /**
   * TypeScript type to use for `principal` values
   * @default `${string}.${string}` | `${string}`
   */
  AddressType: Register extends { AddressType: infer type }
    ? type
    : DefaultRegister["AddressType"];
  /**
   * TypeScript type to use for `int128` and `uint128` values
   * @default bigint
   */
  BigIntType: Register extends { BigIntType: infer type }
    ? type
    : DefaultRegister["BigIntType"];
  /**
   * TypeScript type to use for `buffer` values
   * @default { inputs: `0x${string}`; outputs: `0x${string}`; }
   */
  BytesType: Register extends {
    BytesType: infer type extends { inputs: unknown; outputs: unknown };
  }
    ? type
    : DefaultRegister["BytesType"];

  /**
   * Lower bound for fixed list/buffer/string length
   * @default 1
   */
  FixedArrayMinLength: Register extends {
    FixedArrayMinLength: infer type extends number;
  }
    ? type
    : DefaultRegister["FixedArrayMinLength"];
  /**
   * Upper bound for fixed list/buffer/string length
   * @default 99
   */
  FixedArrayMaxLength: Register extends {
    FixedArrayMaxLength: infer type extends number;
  }
    ? type
    : DefaultRegister["FixedArrayMaxLength"];

  /**
   * Maximum depth for nested list types.
   * When set to a number, limits recursion depth for list type resolution.
   * When set to `false`, no depth limiting is applied.
   *
   * @default false
   */
  ListMaxDepth: Register extends {
    ListMaxDepth: infer type extends number | false;
  }
    ? type
    : DefaultRegister["ListMaxDepth"];

  /**
   * When set, validates {@link ClarityType} strictly
   *
   * Note: You probably only want to set this to `true` if parsed types are returning as `unknown`
   * and you want to figure out why.
   *
   * @default false
   */
  StrictAbiType: Register extends { StrictAbiType: infer type extends boolean }
    ? type
    : DefaultRegister["StrictAbiType"];
};

export type DefaultRegister = {
  /** Lower bound for fixed list/buffer/string length */
  FixedArrayMinLength: 1;
  /** Upper bound for fixed list/buffer/string length */
  FixedArrayMaxLength: 99;

  /** TypeScript type to use for `principal` values */
  AddressType: `${string}.${string}` | `${string}`;
  /** TypeScript type to use for `buffer` values */
  BytesType: {
    /** TypeScript type to use for `buffer` input values */
    inputs: `0x${string}`;
    /** TypeScript type to use for `buffer` output values */
    outputs: `0x${string}`;
  };
  /** TypeScript type to use for `int128` and `uint128` values */
  BigIntType: bigint;

  /** Maximum depth for nested list types (false = unlimited) */
  ListMaxDepth: false;

  /** When set, validates {@link ClarityType} strictly */
  StrictAbiType: false;
};
