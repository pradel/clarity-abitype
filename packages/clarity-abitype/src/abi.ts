import type { ResolvedRegister } from "./register";
import type { Pretty } from "./types";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity Types
// @see https://docs.stacks.co/reference/clarity/types

export type ClarityInt = "int128";
export type ClarityUInt = "uint128";
export type ClarityBool = "bool";
export type ClarityPrincipal = "principal";
export type ClarityNone = "none";
export type ClarityTraitReference = "trait_reference";

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
  "string-ascii": {
    length: number;
  };
};

/**
 * Clarity string-utf8 type with maximum length
 */
export type ClarityStringUtf8 = {
  "string-utf8": {
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
  | ClarityTraitReference
  | ClarityBuffer
  | ClarityStringAscii
  | ClarityStringUtf8
  | ClarityTuple
  | ClarityList
  | ClarityOptional
  | ClarityResponse;

/**
 * Basic Clarity types that don't contain nested ClarityType references.
 * These can be resolved immediately without recursion.
 */
export type ClarityBasicType =
  | ClarityPrincipal
  | ClarityBool
  | ClarityInt
  | ClarityUInt
  | ClarityNone
  | ClarityTraitReference
  | ClarityBuffer
  | ClarityStringAscii
  | ClarityStringUtf8;

type ResolvedClarityType = ResolvedRegister["strictAbiType"] extends true
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
export type ClarityAbiAccess = "public" | "private" | "read_only";

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
export type ClarityVariableAccess = "constant" | "variable";

/**
 * Clarity ABI variable definition
 */
export type ClarityAbiVariable = {
  name: string;
  type: ResolvedClarityType;
  access: ClarityVariableAccess;
};

/**
 * Clarity ABI map definition.
 * Maps in Clarity ABIs have key and value fields that are ClarityType values directly.
 */
export type ClarityAbiMap = {
  name: string;
  key: ResolvedClarityType;
  value: ResolvedClarityType;
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity Trait Types

/**
 * Clarity trait function definition.
 * Traits define function signatures that contracts can implement.
 */
export type ClarityAbiTraitFunction = {
  name: string;
  access: ClarityAbiAccess;
  args: readonly ClarityAbiArg[];
  outputs: ClarityAbiOutput;
};

/**
 * Clarity trait definition.
 * A trait is a collection of function signatures that a contract can implement.
 *
 * @see https://docs.stacks.co/clarity/traits
 */
export type ClarityAbiTrait = {
  name: string;
  functions: readonly ClarityAbiTraitFunction[];
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity Version Types

/**
 * Clarity epoch versions
 */
export type ClarityEpoch =
  | "Epoch10"
  | "Epoch20"
  | "Epoch2_05"
  | "Epoch21"
  | "Epoch2_1"
  | "Epoch22"
  | "Epoch23"
  | "Epoch24"
  | "Epoch25"
  | "Epoch30"
  | "Epoch31";

/**
 * Clarity version
 */
export type ClarityVersion = "Clarity1" | "Clarity2" | "Clarity3" | "Clarity4";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Complete Clarity ABI

/**
 * Complete Clarity ABI specification.
 *
 * This type represents the full ABI of a Clarity smart contract, including:
 * - Functions (public, private, read-only)
 * - Variables (constants and data variables)
 * - Maps (data maps)
 * - Fungible tokens (FT definitions)
 * - Non-fungible tokens (NFT definitions)
 * - Traits (implemented and defined traits)
 * - Epoch and Clarity version information
 */
export type ClarityAbi = Pretty<{
  /** All functions defined in the contract */
  functions: readonly ClarityAbiFunction[];
  /** All variables (constants and data-vars) defined in the contract */
  variables: readonly ClarityAbiVariable[];
  /** All data maps defined in the contract */
  maps: readonly ClarityAbiMap[];
  /** All fungible token definitions in the contract */
  fungible_tokens: readonly ClarityAbiFungibleToken[];
  /** All non-fungible token definitions in the contract */
  non_fungible_tokens: readonly ClarityAbiNonFungibleToken[];
  /** Traits defined in this contract */
  defined_traits?: readonly ClarityAbiTrait[] | undefined;
  /** Traits implemented by this contract */
  implemented_traits?: readonly ClarityAbiTraitReference[] | undefined;
  /** The epoch version this contract targets */
  epoch?: ClarityEpoch | undefined;
  /** The Clarity language version used */
  clarity_version?: ClarityVersion | undefined;
}>;

/**
 * Reference to a trait implemented by a contract.
 * Format: "principal.contract-name.trait-name"
 */
export type ClarityAbiTraitReference = {
  /** The contract identifier where the trait is defined */
  contract_id: string;
  /** The name of the trait */
  trait_name: string;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
// Utility types for Clarity ABI items

export type ClarityAbiItemType =
  | "function"
  | "variable"
  | "map"
  | "fungible_token"
  | "non_fungible_token"
  | "trait";
