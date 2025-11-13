export interface Register {}

export type ResolvedRegister = {
  /**
   * TypeScript type to use for `principal` values
   * @default `${string}.${string}` | `${string}`
   */
  addressType: Register extends { addressType: infer type }
    ? type
    : DefaultRegister['addressType'];
  /**
   * TypeScript type to use for `int128` and `uint128` values
   * @default bigint
   */
  bigIntType: Register extends { bigIntType: infer type }
    ? type
    : DefaultRegister['bigIntType'];
  /**
   * TypeScript type to use for `buffer` values
   * @default { inputs: `0x${string}`; outputs: `0x${string}`; }
   */
  bytesType: Register extends {
    bytesType: infer type extends { inputs: unknown; outputs: unknown };
  }
    ? type
    : DefaultRegister['bytesType'];

  /**
   * Lower bound for fixed list/buffer/string length
   * @default 1
   */
  fixedArrayMinLength: Register extends {
    fixedArrayMinLength: infer type extends number;
  }
    ? type
    : DefaultRegister['fixedArrayMinLength'];
  /**
   * Upper bound for fixed list/buffer/string length
   * @default 99
   */
  fixedArrayMaxLength: Register extends {
    fixedArrayMaxLength: infer type extends number;
  }
    ? type
    : DefaultRegister['fixedArrayMaxLength'];

  /**
   * When set, validates {@link ClarityType} strictly
   *
   * Note: You probably only want to set this to `true` if parsed types are returning as `unknown`
   * and you want to figure out why.
   *
   * @default false
   */
  strictAbiType: Register extends { strictAbiType: infer type extends boolean }
    ? type
    : DefaultRegister['strictAbiType'];
};

export type DefaultRegister = {
  /** Lower bound for fixed list/buffer/string length */
  fixedArrayMinLength: 1;
  /** Upper bound for fixed list/buffer/string length */
  fixedArrayMaxLength: 99;

  /** TypeScript type to use for `principal` values */
  addressType: `${string}.${string}` | `${string}`;
  /** TypeScript type to use for `buffer` values */
  bytesType: {
    /** TypeScript type to use for `buffer` input values */
    inputs: `0x${string}`;
    /** TypeScript type to use for `buffer` output values */
    outputs: `0x${string}`;
  };
  /** TypeScript type to use for `int128` and `uint128` values */
  bigIntType: bigint;

  /** When set, validates {@link ClarityType} strictly */
  strictAbiType: false;
};
