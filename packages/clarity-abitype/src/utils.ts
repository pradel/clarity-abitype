import type {
  ClarityAbi,
  ClarityAbiArg,
  ClarityAbiAccess,
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
  ClarityTuple,
  ClarityTupleEntry,
  ClarityType,
  ClarityUInt,
} from "./abi.js";
import type { ResolvedRegister } from "./register.js";
import type { Error, Pretty } from "./types.js";

/**
 * Basic Clarity types that don't contain nested ClarityType references.
 * These can be resolved immediately without recursion.
 */
type ClarityBasicType =
  | ClarityPrincipal
  | ClarityBool
  | ClarityInt
  | ClarityUInt
  | ClarityNone
  | ClarityBuffer
  | ClarityStringAscii
  | ClarityStringUtf8;

/**
 * Converts basic {@link ClarityType} to corresponding TypeScript primitive type.
 * This handles only non-recursive types for efficient type resolution.
 */
type ClarityBasicTypeToPrimitiveType<T extends ClarityBasicType> =
  T extends ClarityPrincipal
    ? ResolvedRegister["addressType"]
    : T extends ClarityBool
      ? boolean
      : T extends ClarityInt
        ? ResolvedRegister["bigIntType"]
        : T extends ClarityUInt
          ? ResolvedRegister["bigIntType"]
          : T extends ClarityNone
            ? null
            : T extends ClarityBuffer
              ? ResolvedRegister["bytesType"]["outputs"]
              : T extends ClarityStringAscii
                ? string
                : T extends ClarityStringUtf8
                  ? string
                  : never;

/**
 * Converts Clarity tuple to TypeScript object type
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
 * Converts Clarity list to TypeScript array type
 */
type ClarityListToPrimitiveType<
  list extends ClarityList,
  itemType extends ClarityType | string = list["list"]["type"],
> = readonly ClarityTypeToPrimitiveType<itemType>[];

/**
 * Converts Clarity optional to TypeScript union with null
 */
type ClarityOptionalToPrimitiveType<
  optional extends ClarityOptional,
  innerType extends ClarityType | string = optional["optional"],
> = ClarityTypeToPrimitiveType<innerType> | null;

/**
 * Converts Clarity response to TypeScript object with ok/error properties
 */
type ClarityResponseToPrimitiveType<
  response extends ClarityResponse,
  okType extends ClarityType | string = response["response"]["ok"],
  errorType extends ClarityType | string = response["response"]["error"],
> =
  | { ok: ClarityTypeToPrimitiveType<okType>; error?: never }
  | { ok?: never; error: ClarityTypeToPrimitiveType<errorType> };

/**
 * Converts {@link ClarityType} to corresponding TypeScript primitive type.
 *
 * Uses a flattened structure with basic type short-circuiting to avoid
 * "Type instantiation is excessively deep" errors.
 *
 * @param clarityType - {@link ClarityType} to convert to TypeScript representation
 * @returns TypeScript primitive type
 */
export type ClarityTypeToPrimitiveType<
  clarityType extends ClarityType | string,
> =
  // 1. Short-circuit: Check for basic types first (non-recursive)
  clarityType extends ClarityBasicType
    ? ClarityBasicTypeToPrimitiveType<clarityType>
    : // 2. Tuple type
      clarityType extends ClarityTuple
      ? ClarityTupleToPrimitiveType<clarityType>
      : // 3. List type
        clarityType extends ClarityList
        ? ClarityListToPrimitiveType<clarityType>
        : // 4. Optional type
          clarityType extends ClarityOptional
          ? ClarityOptionalToPrimitiveType<clarityType>
          : // 5. Response type
            clarityType extends ClarityResponse
            ? ClarityResponseToPrimitiveType<clarityType>
            : // 6. Unknown type handling
              ResolvedRegister["strictAbiType"] extends true
              ? Error<`Unknown type '${clarityType & string}'.`>
              : unknown;

/**
 * Converts a single Clarity ABI argument to its TypeScript primitive type.
 *
 * This follows the pattern from ETH abitype's AbiParameterToPrimitiveType,
 * taking the whole argument object and short-circuiting on basic types.
 *
 * @param arg - {@link ClarityAbiArg} to convert
 * @returns TypeScript primitive type for the argument's type
 */
type ClarityAbiArgToPrimitiveTypeValue<
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
              ResolvedRegister["strictAbiType"] extends true
              ? Error<`Unknown type '${arg["type"] & string}'.`>
              : unknown;

/**
 * Converts Clarity ABI argument to TypeScript primitive type (as object with name as key)
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
 */
export type ClarityAbiArgsToPrimitiveTypes<
  args extends readonly ClarityAbiArg[],
> = Pretty<{
  [key in keyof args]: ClarityAbiArgToPrimitiveTypeValue<args[key]>;
}>;

/**
 * Converts Clarity ABI output to TypeScript primitive type
 */
export type ClarityAbiOutputToPrimitiveType<output> = output extends {
  type: infer type extends ClarityType | string;
}
  ? ClarityTypeToPrimitiveType<type>
  : unknown;

/**
 * Checks if type is {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to check
 * @returns Boolean for whether {@link abi} is {@link ClarityAbi}
 */
export type IsClarityAbi<abi> = abi extends ClarityAbi ? true : false;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity ABI Functions

/**
 * Extracts all {@link ClarityAbiFunction} types from {@link ClarityAbi}.
 *
 * @param abi - {@link ClarityAbi} to extract functions from
 * @param access - {@link ClarityAbiAccess} to filter by
 * @returns All {@link ClarityAbiFunction} types from {@link ClarityAbi}
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
 */
export type ExtractAbiFunction<
  abi extends ClarityAbi,
  functionName extends ExtractAbiFunctionNames<abi>,
  access extends ClarityAbiAccess = ClarityAbiAccess,
> = Extract<ExtractAbiFunctions<abi, access>, { name: functionName }>;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Clarity ABI Variables

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
