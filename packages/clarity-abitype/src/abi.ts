import type { ResolvedRegister } from './register';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity Types
// @see https://docs.stacks.co/reference/clarity/types

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

/**
 * Clarity list type
 */
export type ClarityList = {
  list: {
    type: ClarityType;
    length: number;
  };
};

/**
 * Clarity tuple type
 */
export type ClarityTuple = {
  tuple: readonly ClarityTupleEntry[];
};

export type ClarityTupleEntry = {
  name: string;
  type: ClarityType;
};

/**
 * Clarity optional type
 */
export type ClarityOptional = {
  optional: ClarityType;
};

/**
 * Clarity response type
 */
export type ClarityResponse = {
  response: {
    ok: ClarityType;
    error: ClarityType;
  };
};

/**
 * Union of all Clarity types
 */
export type ClarityType =
  | ClarityPrincipal
  | ClarityBool
  | ClarityInt
  | ClarityUInt
  | ClarityNone
  | ClarityBuffer
  | ClarityStringAscii
  | ClarityStringUtf8
  | ClarityTuple
  | ClarityList
  | ClarityOptional
  | ClarityResponse;

type ResolvedClarityType = ResolvedRegister['strictAbiType'] extends true
  ? ClarityType
  : ClarityType | string;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity ABI Types

/**
 * Clarity function parameter
 */
export type ClarityAbiArg = {
  name: string;
  type: ResolvedClarityType;
};

/**
 * Clarity function output type
 */
export type ClarityAbiOutput = {
  type: ResolvedClarityType;
};

/**
 * Clarity function access modifiers
 */
export type ClarityAbiAccess = 'public' | 'private' | 'read_only';

/**
 * Clarity ABI function definition
 */
export type ClarityAbiFunction = {
  name: string;
  access: ClarityAbiAccess;
  args: readonly ClarityAbiArg[];
  outputs: ClarityAbiOutput;
};

/**
 * Clarity variable access modifiers
 */
export type ClarityVariableAccess = 'constant' | 'variable';
