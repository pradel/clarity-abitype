import type {
  ClarityAbi,
  ClarityAbiArg,
  ClarityAbiAccess,
  ClarityAbiTrait,
  ClarityBasicType,
  ClarityBool,
  ClarityBuffer,
  ClarityInt,
  ClarityList,
  ClarityNone,
  ClarityOptional,
  ClarityPrincipal,
  ClarityResponse,
  ClarityStringAscii,
  ClarityStringUtf8,
  ClarityTraitReference,
  ClarityTuple,
  ClarityTupleEntry,
  ClarityType,
  ClarityUInt,
} from "./abi.js";
import type { ResolvedRegister } from "./register.js";
import type {
  Error,
  IsNarrowable,
  Prettify,
  Range,
  Tuple,
  UnionWiden,
} from "./types.js";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Primitive Type Lookup Tables
//
// Using lookup tables instead of conditional chains for O(1) type resolution.
// This improves performance and avoids "Type instantiation is excessively deep" errors.
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Lookup table for string-based Clarity types.
 * Maps Clarity type strings to their TypeScript primitive equivalents.
 */
interface ClarityStringTypeLookup {
  principal: ResolvedRegister["AddressType"];
  bool: boolean;
  int128: ResolvedRegister["BigIntType"];
  uint128: ResolvedRegister["BigIntType"];
  none: null;
  trait_reference: ResolvedRegister["AddressType"];
}

/**
 * Converts string-based Clarity types to TypeScript primitives using lookup.
 */
type ClarityStringTypeToPrimitive<
  T extends
    | ClarityPrincipal
    | ClarityBool
    | ClarityInt
    | ClarityUInt
    | ClarityNone
    | ClarityTraitReference,
> = ClarityStringTypeLookup[T];

/**
 * Converts object-based basic Clarity types to TypeScript primitives.
 * Handles buffer, string-ascii, and string-utf8 types.
 */
type ClarityObjectTypeToPrimitive<
  T extends ClarityBuffer | ClarityStringAscii | ClarityStringUtf8,
> = T extends ClarityBuffer
  ? ResolvedRegister["BytesType"]["outputs"]
  : T extends ClarityStringAscii
    ? string
    : T extends ClarityStringUtf8
      ? string
      : never;

/**
 * Converts basic {@link ClarityType} to corresponding TypeScript primitive type.
 * Uses lookup tables for string types and pattern matching for object types.
 *
 * @internal
 */
export type ClarityBasicTypeToPrimitiveType<T extends ClarityBasicType> =
  T extends
    | ClarityPrincipal
    | ClarityBool
    | ClarityInt
    | ClarityUInt
    | ClarityNone
    | ClarityTraitReference
    ? ClarityStringTypeToPrimitive<T>
    : T extends ClarityBuffer | ClarityStringAscii | ClarityStringUtf8
      ? ClarityObjectTypeToPrimitive<T>
      : never;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fixed-Length List Support
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Lookup table for fixed array sizes.
 * Maps string representations of numbers to their numeric values.
 */
export type ClarityFixedArraySizeLookup = {
  [K in ClarityFixedArrayRange as `${K}`]: K;
};

/**
 * Range of valid fixed array sizes based on register configuration.
 * Uses the Range type to generate numbers from FixedArrayMinLength to FixedArrayMaxLength.
 */
export type ClarityFixedArrayRange = Range<
  ResolvedRegister["FixedArrayMinLength"],
  ResolvedRegister["FixedArrayMaxLength"]
>[number];

////////////////////////////////////////////////////////////////////////////////////////////////////
// Complex Type Converters
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Converts Clarity tuple to TypeScript object type.
 *
 * @param tuple - The Clarity tuple type
 * @param entries - The tuple entries (extracted for efficiency)
 * @returns TypeScript object type with named properties
 */
type ClarityTupleToPrimitiveType<
  tuple extends ClarityTuple,
  entries extends readonly ClarityTupleEntry[] = tuple["tuple"],
> = entries extends readonly []
  ? {}
  : {
      [K in entries[number] as K["name"]]: ClarityTypeToPrimitiveType<
        K["type"]
      >;
    };

/**
 * Converts Clarity list to TypeScript array type.
 * Supports fixed-length tuples when the length is within the valid range.
 *
 * @param list - The Clarity list type
 * @param itemType - The type of items in the list
 * @param depth - Current recursion depth (for depth limiting)
 * @returns TypeScript array or tuple type
 */
type ClarityListToPrimitiveType<
  list extends ClarityList,
  itemType extends ClarityType | string = list["list"]["type"],
  depth extends readonly number[] = [],
> =
  // Check if depth limiting is enabled and exceeded
  ResolvedRegister["ListMaxDepth"] extends number
    ? depth["length"] extends ResolvedRegister["ListMaxDepth"]
      ? readonly unknown[]
      : ClarityListToPrimitiveTypeImpl<list, itemType, depth>
    : ClarityListToPrimitiveTypeImpl<list, itemType, depth>;

/**
 * Implementation of list-to-primitive conversion.
 * Separated to handle depth checking cleanly.
 */
type ClarityListToPrimitiveTypeImpl<
  list extends ClarityList,
  itemType extends ClarityType | string,
  depth extends readonly number[],
> =
  // Check if the length is a valid fixed size
  `${list["list"]["length"]}` extends keyof ClarityFixedArraySizeLookup
    ? Tuple<
        ClarityTypeToPrimitiveTypeWithDepth<itemType, depth>,
        ClarityFixedArraySizeLookup[`${list["list"]["length"]}`]
      >
    : // Otherwise, use a regular readonly array
      readonly ClarityTypeToPrimitiveTypeWithDepth<itemType, depth>[];

/**
 * Converts Clarity optional to TypeScript union with null.
 *
 * @param optional - The Clarity optional type
 * @param innerType - The wrapped type
 * @param depth - Current recursion depth
 * @returns TypeScript union type T | null
 */
type ClarityOptionalToPrimitiveType<
  optional extends ClarityOptional,
  innerType extends ClarityType | string = optional["optional"],
  depth extends readonly number[] = [],
> = ClarityTypeToPrimitiveTypeWithDepth<innerType, depth> | null;

/**
 * Converts Clarity response to TypeScript discriminated union.
 *
 * @param response - The Clarity response type
 * @param okType - The success type
 * @param errorType - The error type
 * @param depth - Current recursion depth
 * @returns TypeScript discriminated union with ok/error variants
 */
type ClarityResponseToPrimitiveType<
  response extends ClarityResponse,
  okType extends ClarityType | string = response["response"]["ok"],
  errorType extends ClarityType | string = response["response"]["error"],
  depth extends readonly number[] = [],
> =
  | { ok: ClarityTypeToPrimitiveTypeWithDepth<okType, depth>; error?: never }
  | {
      ok?: never;
      error: ClarityTypeToPrimitiveTypeWithDepth<errorType, depth>;
    };

////////////////////////////////////////////////////////////////////////////////////////////////////
// Main Type Conversion
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Internal type converter with depth tracking for list recursion limiting.
 *
 * @internal
 */
type ClarityTypeToPrimitiveTypeWithDepth<
  clarityType extends ClarityType | string,
  depth extends readonly number[] = [],
> =
  // 1. Short-circuit: Check for basic types first (non-recursive)
  clarityType extends ClarityBasicType
    ? ClarityBasicTypeToPrimitiveType<clarityType>
    : // 2. Tuple type
      clarityType extends ClarityTuple
      ? ClarityTupleToPrimitiveType<clarityType>
      : // 3. List type (with depth tracking)
        clarityType extends ClarityList
        ? ClarityListToPrimitiveType<
            clarityType,
            clarityType["list"]["type"],
            [...depth, 1]
          >
        : // 4. Optional type
          clarityType extends ClarityOptional
          ? ClarityOptionalToPrimitiveType<
              clarityType,
              clarityType["optional"],
              depth
            >
          : // 5. Response type
            clarityType extends ClarityResponse
            ? ClarityResponseToPrimitiveType<
                clarityType,
                clarityType["response"]["ok"],
                clarityType["response"]["error"],
                depth
              >
            : // 6. Unknown type handling
              ResolvedRegister["StrictAbiType"] extends true
              ? Error<`Unknown type '${clarityType & string}'.`>
              : unknown;

/**
 * Converts {@link ClarityType} to corresponding TypeScript primitive type.
 *
 * Uses a flattened structure with basic type short-circuiting and lookup tables
 * to avoid "Type instantiation is excessively deep" errors.
 *
 * @param clarityType - {@link ClarityType} to convert to TypeScript representation
 * @returns TypeScript primitive type
 *
 * @example
 * type Result = ClarityTypeToPrimitiveType<"uint128">
 * //   ^? type Result = bigint
 *
 * @example
 * type Result = ClarityTypeToPrimitiveType<{ tuple: [{ name: "amount"; type: "uint128" }] }>
 * //   ^? type Result = { amount: bigint }
 */
export type ClarityTypeToPrimitiveType<
  clarityType extends ClarityType | string,
> = ClarityTypeToPrimitiveTypeWithDepth<clarityType, []>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// ABI Argument Type Conversion
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Converts a single Clarity ABI argument to its TypeScript primitive type value.
 *
 * This follows the pattern from ETH abitype's AbiParameterToPrimitiveType,
 * taking the whole argument object and short-circuiting on basic types.
 *
 * @param arg - {@link ClarityAbiArg} to convert
 * @returns TypeScript primitive type for the argument's type
 *
 * @internal
 */
export type ClarityAbiArgToPrimitiveTypeValue<
  arg extends ClarityAbiArg | { name: string; type: ClarityType | string },
> =
  // 1. Short-circuit: Check for basic types first
  arg["type"] extends ClarityBasicType
    ? ClarityBasicTypeToPrimitiveType<arg["type"]>
    : // 2. Tuple type - pattern match on the arg structure
      arg extends { type: infer T extends ClarityTuple }
      ? ClarityTupleToPrimitiveType<T>
      : // 3. List type
        arg extends { type: infer T extends ClarityList }
        ? ClarityListToPrimitiveType<T>
        : // 4. Optional type
          arg extends { type: infer T extends ClarityOptional }
          ? ClarityOptionalToPrimitiveType<T>
          : // 5. Response type
            arg extends { type: infer T extends ClarityResponse }
            ? ClarityResponseToPrimitiveType<T>
            : // 6. Unknown type handling
              ResolvedRegister["StrictAbiType"] extends true
              ? Error<`Unknown type '${arg["type"] & string}'.`>
              : unknown;

/**
 * Converts Clarity ABI argument to TypeScript primitive type (as object with name as key).
 *
 * @param arg - {@link ClarityAbiArg} to convert
 * @returns Object type with the argument name as key and primitive type as value
 *
 * @example
 * type Result = ClarityAbiArgToPrimitiveType<{ name: "amount"; type: "uint128" }>
 * //   ^? type Result = { amount: bigint }
 */
export type ClarityAbiArgToPrimitiveType<arg extends ClarityAbiArg> = {
  [K in arg["name"]]: ClarityAbiArgToPrimitiveTypeValue<arg>;
};

/**
 * Converts array of Clarity ABI arguments to tuple of TypeScript primitive types.
 *
 * Uses ClarityAbiArgToPrimitiveTypeValue which short-circuits on basic types
 * to avoid "Type instantiation is excessively deep" errors.
 *
 * @param args - Array of {@link ClarityAbiArg} to convert to TypeScript representations
 * @returns Tuple of TypeScript primitive types
 *
 * @example
 * type Result = ClarityAbiArgsToPrimitiveTypes<[
 *   { name: "amount"; type: "uint128" },
 *   { name: "sender"; type: "principal" }
 * ]>
 * //   ^? type Result = [bigint, string]
 */
export type ClarityAbiArgsToPrimitiveTypes<
  args extends readonly ClarityAbiArg[],
> = Prettify<{
  [key in keyof args]: ClarityAbiArgToPrimitiveTypeValue<args[key]>;
}>;

/**
 * Converts Clarity ABI output to TypeScript primitive type.
 *
 * @param output - The ABI output specification
 * @returns TypeScript primitive type for the output
 */
export type ClarityAbiOutputToPrimitiveType<output> = output extends {
  type: infer type extends ClarityType | string;
}
  ? ClarityTypeToPrimitiveType<type>
  : unknown;

////////////////////////////////////////////////////////////////////////////////////////////////////
// ABI Validation
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if type is {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to check
 * @returns Boolean for whether {@link abi} is {@link ClarityAbi}
 *
 * @example
 * type Result = IsClarityAbi<typeof myAbi>
 * //   ^? type Result = true
 */
export type IsClarityAbi<abi> = abi extends ClarityAbi ? true : false;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity ABI Functions
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts all {@link ClarityAbiFunction} types from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract functions from
 * @param access - {@link ClarityAbiAccess} to filter by
 * @returns All {@link ClarityAbiFunction} types from {@link ClarityAbi}
 *
 * @example
 * type Result = ExtractAbiFunctions<typeof myAbi, "read_only">
 */
export type ExtractAbiFunctions<
  abi extends ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
> = Extract<abi["functions"][number], { access: access }>;

/**
 * Extracts all {@link ClarityAbiFunction} names from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract function names from
 * @param access - {@link ClarityAbiAccess} to filter by
 * @returns Union of function names
 *
 * @example
 * type Result = ExtractAbiFunctionNames<typeof myAbi>
 * //   ^? type Result = "transfer" | "get-balance" | ...
 */
export type ExtractAbiFunctionNames<
  abi extends ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
> = ExtractAbiFunctions<abi, access>["name"];

/**
 * Extracts {@link ClarityAbiFunction} with name from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract {@link ClarityAbiFunction} from
 * @param functionName - String name of function to extract from {@link ClarityAbi}
 * @param access - {@link ClarityAbiAccess} to filter by
 * @returns Matching {@link ClarityAbiFunction}
 *
 * @example
 * type Result = ExtractAbiFunction<typeof myAbi, "transfer">
 */
export type ExtractAbiFunction<
  abi extends ClarityAbi,
  functionName extends ExtractAbiFunctionNames<abi>,
  access extends ClarityAbiAccess = ClarityAbiAccess,
> = Extract<ExtractAbiFunctions<abi, access>, { name: functionName }>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity ABI Variables
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts all {@link ClarityAbiVariable} types from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract variables from
 * @returns All {@link ClarityAbiVariable} types from {@link ClarityAbi}
 */
export type ExtractAbiVariables<abi extends ClarityAbi> =
  abi["variables"][number];

/**
 * Extracts all {@link ClarityAbiVariable} names from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract variable names from
 * @returns Union of variable names
 */
export type ExtractAbiVariableNames<abi extends ClarityAbi> =
  ExtractAbiVariables<abi>["name"];

/**
 * Extracts {@link ClarityAbiVariable} with name from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract {@link ClarityAbiVariable} from
 * @param variableName - String name of variable to extract from {@link ClarityAbi}
 * @returns Matching {@link ClarityAbiVariable}
 */
export type ExtractAbiVariable<
  abi extends ClarityAbi,
  variableName extends ExtractAbiVariableNames<abi>,
> = Extract<ExtractAbiVariables<abi>, { name: variableName }>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity ABI Maps
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts all {@link ClarityAbiMap} types from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract maps from
 * @returns All {@link ClarityAbiMap} types from {@link ClarityAbi}
 */
export type ExtractAbiMaps<abi extends ClarityAbi> = abi["maps"][number];

/**
 * Extracts all {@link ClarityAbiMap} names from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract map names from
 * @returns Union of map names
 */
export type ExtractAbiMapNames<abi extends ClarityAbi> =
  ExtractAbiMaps<abi>["name"];

/**
 * Extracts {@link ClarityAbiMap} with name from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract {@link ClarityAbiMap} from
 * @param mapName - String name of map to extract from {@link ClarityAbi}
 * @returns Matching {@link ClarityAbiMap}
 */
export type ExtractAbiMap<
  abi extends ClarityAbi,
  mapName extends ExtractAbiMapNames<abi>,
> = Extract<ExtractAbiMaps<abi>, { name: mapName }>;

/**
 * Extracts the key type from a {@link ClarityAbiMap}.
 *
 * @param map - The map to extract key type from
 * @returns TypeScript primitive type representing the map's key
 */
export type ExtractAbiMapKeyType<map extends { key: ClarityType | string }> =
  ClarityTypeToPrimitiveType<map["key"]>;

/**
 * Extracts the value type from a {@link ClarityAbiMap}.
 *
 * @param map - The map to extract value type from
 * @returns TypeScript primitive type representing the map's value
 */
export type ExtractAbiMapValueType<
  map extends { value: ClarityType | string },
> = ClarityTypeToPrimitiveType<map["value"]>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity ABI Traits
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts all defined {@link ClarityAbiTrait} types from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract defined traits from
 * @returns All defined {@link ClarityAbiTrait} types from {@link ClarityAbi}
 */
export type ExtractAbiDefinedTraits<abi extends ClarityAbi> = abi extends {
  defined_traits: readonly (infer T extends ClarityAbiTrait)[];
}
  ? T
  : never;

/**
 * Extracts all defined {@link ClarityAbiTrait} names from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract trait names from
 * @returns Union of defined trait names
 */
export type ExtractAbiDefinedTraitNames<abi extends ClarityAbi> =
  ExtractAbiDefinedTraits<abi>["name"];

/**
 * Extracts a specific defined {@link ClarityAbiTrait} by name from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract trait from
 * @param traitName - String name of trait to extract
 * @returns Matching {@link ClarityAbiTrait}
 */
export type ExtractAbiDefinedTrait<
  abi extends ClarityAbi,
  traitName extends ExtractAbiDefinedTraitNames<abi>,
> = Extract<ExtractAbiDefinedTraits<abi>, { name: traitName }>;

/**
 * Extracts all implemented trait references from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract implemented traits from
 * @returns All implemented trait references
 */
export type ExtractAbiImplementedTraits<abi extends ClarityAbi> = abi extends {
  implemented_traits: readonly (infer T)[];
}
  ? T
  : never;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity ABI Tokens
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts all fungible token definitions from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract fungible tokens from
 * @returns All fungible token definitions
 */
export type ExtractAbiFungibleTokens<abi extends ClarityAbi> =
  abi["fungible_tokens"][number];

/**
 * Extracts all fungible token names from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract token names from
 * @returns Union of fungible token names
 */
export type ExtractAbiFungibleTokenNames<abi extends ClarityAbi> =
  ExtractAbiFungibleTokens<abi>["name"];

/**
 * Extracts a specific fungible token by name from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract token from
 * @param tokenName - String name of token to extract
 * @returns Matching fungible token definition
 */
export type ExtractAbiFungibleToken<
  abi extends ClarityAbi,
  tokenName extends ExtractAbiFungibleTokenNames<abi>,
> = Extract<ExtractAbiFungibleTokens<abi>, { name: tokenName }>;

/**
 * Extracts all non-fungible token definitions from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract non-fungible tokens from
 * @returns All non-fungible token definitions
 */
export type ExtractAbiNonFungibleTokens<abi extends ClarityAbi> =
  abi["non_fungible_tokens"][number];

/**
 * Extracts all non-fungible token names from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract token names from
 * @returns Union of non-fungible token names
 */
export type ExtractAbiNonFungibleTokenNames<abi extends ClarityAbi> =
  ExtractAbiNonFungibleTokens<abi>["name"];

/**
 * Extracts a specific non-fungible token by name from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract token from
 * @param tokenName - String name of token to extract
 * @returns Matching non-fungible token definition
 */
export type ExtractAbiNonFungibleToken<
  abi extends ClarityAbi,
  tokenName extends ExtractAbiNonFungibleTokenNames<abi>,
> = Extract<ExtractAbiNonFungibleTokens<abi>, { name: tokenName }>;

/**
 * Extracts the asset identifier type from a non-fungible token.
 *
 * @param token - The non-fungible token definition
 * @returns TypeScript primitive type for the token's asset identifier
 */
export type ExtractAbiNonFungibleTokenType<
  token extends { type: ClarityType | string },
> = ClarityTypeToPrimitiveType<token["type"]>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Contract Function Helpers
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts the function name type for a given access level from {@link ClarityAbi}.
 * Uses {@link IsNarrowable} to immediately return `string` if the ABI is not a const literal.
 *
 * @param abi - {@link ClarityAbi} to extract function names from
 * @param access - {@link ClarityAbiAccess} access level to filter by
 * @returns Function name union or string fallback
 */
export type ContractFunctionName<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
  _narrowable extends boolean = IsNarrowable<abi, ClarityAbi>,
> = _narrowable extends true
  ? ExtractAbiFunctionNames<
      abi extends ClarityAbi ? abi : ClarityAbi,
      access
    > extends infer functionName extends string
    ? [functionName] extends [never]
      ? string
      : functionName
    : string
  : string;

/**
 * Extracts the function arguments type for a given function in {@link ClarityAbi}.
 * Falls back to `readonly unknown[]` if the ABI or function is not inferrable.
 *
 * @param abi - {@link ClarityAbi} to extract function arguments from
 * @param access - {@link ClarityAbiAccess} access level to filter by
 * @param functionName - Name of the function to extract args for
 * @returns Tuple of argument primitive types or readonly unknown[]
 */
export type ContractFunctionArgs<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
  functionName extends ContractFunctionName<abi, access> = ContractFunctionName<
    abi,
    access
  >,
  _narrowable extends boolean = IsNarrowable<abi, ClarityAbi>,
> = _narrowable extends true
  ? ClarityAbiArgsToPrimitiveTypes<
      ExtractAbiFunction<
        abi extends ClarityAbi ? abi : ClarityAbi,
        functionName extends ExtractAbiFunctionNames<
          abi extends ClarityAbi ? abi : ClarityAbi,
          access
        >
          ? functionName
          : never,
        access
      >["args"]
    > extends infer args
    ? [args] extends [never]
      ? readonly unknown[]
      : args
    : readonly unknown[]
  : readonly unknown[];

/**
 * Extracts the function return type for a given function in {@link ClarityAbi}.
 * Falls back to `unknown` if the ABI or function is not inferrable.
 *
 * @param abi - {@link ClarityAbi} to extract return type from
 * @param access - {@link ClarityAbiAccess} access level to filter by
 * @param functionName - Name of the function to extract return type for
 * @returns Inferred primitive return type or unknown
 */
export type ContractFunctionReturnType<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
  functionName extends ContractFunctionName<abi, access> = ContractFunctionName<
    abi,
    access
  >,
  _narrowable extends boolean = IsNarrowable<abi, ClarityAbi>,
> = _narrowable extends true
  ? abi extends ClarityAbi
    ? ClarityAbi extends abi
      ? unknown
      : ClarityAbiOutputToPrimitiveType<
          ExtractAbiFunction<
            abi,
            functionName extends ExtractAbiFunctionNames<abi, access>
              ? functionName
              : never,
            access
          >["outputs"]
        >
    : unknown
  : unknown;

/**
 * Generic parameters helper for contract function calls.
 *
 * @param abi - {@link ClarityAbi} of the contract
 * @param access - {@link ClarityAbiAccess} access level to filter by
 * @param functionName - Name of the function to call
 * @param args - Arguments for the function
 */
export type ContractFunctionParameters<
  abi extends ClarityAbi | readonly unknown[] = ClarityAbi,
  access extends ClarityAbiAccess = ClarityAbiAccess,
  functionName extends ContractFunctionName<abi, access> = ContractFunctionName<
    abi,
    access
  >,
  _args extends ContractFunctionArgs<abi, access, functionName> =
    ContractFunctionArgs<abi, access, functionName>,
  ///
  allFunctionNames = ContractFunctionName<abi, access>,
  allArgs = ContractFunctionArgs<abi, access, functionName>,
> = {
  /** The contract ABI */
  abi: abi;
  /** The function name to call */
  functionName:
    | allFunctionNames
    | (functionName extends allFunctionNames ? functionName : never);
} & (readonly [] extends allArgs
  ? {
      /** Function arguments (optional when function takes no arguments) */
      functionArgs?: UnionWiden<allArgs> | undefined;
    }
  : {
      /** Function arguments */
      functionArgs: UnionWiden<allArgs>;
    });
