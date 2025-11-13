/**
 * Clarity primitive types
 * @see https://docs.stacks.co/reference/clarity/types
 */
export type ClarityInt = 'int128';
export type ClarityUInt = 'uint128';
export type ClarityBool = 'bool';
export type ClarityPrincipal = 'principal';
export type ClarityNone = 'none';

/**
 * Clarity buffer type with maximum length
 */
export type ClarityBuffer = {
  buffer: {
    length: number;
  };
};

/**
 * Clarity string-ascii type with maximum length
 */
export type ClarityStringAscii = {
  'string-ascii': {
    length: number;
  };
};

/**
 * Clarity string-utf8 type with maximum length
 */
export type ClarityStringUtf8 = {
  'string-utf8': {
    length: number;
  };
};
