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

/**
 * Clarity ABI variable definition
 */
export type ClarityAbiVariable = {
  name: string;
  type: ResolvedClarityType;
  access: ClarityVariableAccess;
};

/**
 * Clarity ABI map key-value definition
 */
export type ClarityAbiMapEntry = {
  name: string;
  type: ResolvedClarityType;
};

/**
 * Clarity ABI map definition
 */
export type ClarityAbiMap = {
  name: string;
  key: readonly ClarityAbiMapEntry[];
  value: readonly ClarityAbiMapEntry[];
};

/**
 * Clarity fungible token definition
 */
export type ClarityAbiFungibleToken = {
  name: string;
};

/**
 * Clarity non-fungible token definition
 */
export type ClarityAbiNonFungibleToken = {
  name: string;
  type: ResolvedClarityType;
};

/**
 * Clarity epoch versions
 */
export type ClarityEpoch =
  | 'Epoch10'
  | 'Epoch20'
  | 'Epoch21'
  | 'Epoch22'
  | 'Epoch23'
  | 'Epoch24'
  | 'Epoch25'
  | 'Epoch30'
  | 'Epoch31';

/**
 * Clarity version
 */
export type ClarityVersion = 'Clarity1' | 'Clarity2' | 'Clarity3' | 'Clarity4';
