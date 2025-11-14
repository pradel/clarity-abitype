import type {
  ClarityAbi,
  ClarityAbiAccess,
  ClarityAbiArg,
  ClarityAbiFunction,
  ClarityAbiMap,
  ClarityAbiVariable,
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
  ClarityType,
  ClarityUInt,
} from "./abi.js";
import type { ResolvedRegister } from "./register.js";
import type { Error, Pretty } from "./types.js";

/**
 * Converts {@link ClarityType} to corresponding TypeScript primitive type.
 *
 * @param clarityType - {@link ClarityType} to convert to TypeScript representation
 * @returns TypeScript primitive type
 */
export type ClarityTypeToPrimitiveType<
  clarityType extends ClarityType | string,
> = clarityType extends ClarityPrincipal
  ? ResolvedRegister["addressType"]
  : clarityType extends ClarityBool
    ? boolean
    : clarityType extends ClarityInt
      ? ResolvedRegister["bigIntType"]
      : clarityType extends ClarityUInt
        ? ResolvedRegister["bigIntType"]
        : clarityType extends ClarityNone
          ? null
          : clarityType extends ClarityBuffer
            ? ResolvedRegister["bytesType"]["outputs"]
            : clarityType extends ClarityStringAscii
              ? string
              : clarityType extends ClarityStringUtf8
                ? string
                : clarityType extends ClarityTuple
                  ? ClarityTupleToPrimitiveType<clarityType>
                  : clarityType extends ClarityList
                    ? ClarityListToPrimitiveType<clarityType>
                    : clarityType extends ClarityOptional
                      ? ClarityOptionalToPrimitiveType<clarityType>
                      : clarityType extends ClarityResponse
                        ? ClarityResponseToPrimitiveType<clarityType>
                        : ResolvedRegister["strictAbiType"] extends true
                          ? Error<`Unknown type '${clarityType & string}'.`>
                          : unknown;

/**
 * Converts Clarity tuple to TypeScript object type
 */
type ClarityTupleToPrimitiveType<tuple extends ClarityTuple> = tuple extends {
  tuple: infer entries extends readonly any[];
}
  ? entries extends readonly []
    ? {}
    : entries[number] extends {
          name: infer name extends string;
          type: infer type;
        }
      ? {
          [K in entries[number] as K["name"]]: ClarityTypeToPrimitiveType<
            K["type"]
          >;
        }
      : never
  : never;

/**
 * Converts Clarity list to TypeScript array type
 */
type ClarityListToPrimitiveType<list extends ClarityList> = list extends {
  list: {
    type: infer itemType extends ClarityType | string;
    length: infer length;
  };
}
  ? readonly ClarityTypeToPrimitiveType<itemType>[]
  : never;

/**
 * Converts Clarity optional to TypeScript union with null
 */
type ClarityOptionalToPrimitiveType<optional extends ClarityOptional> =
  optional extends { optional: infer innerType extends ClarityType | string }
    ? ClarityTypeToPrimitiveType<innerType> | null
    : never;

/**
 * Converts Clarity response to TypeScript object with ok/error properties
 */
type ClarityResponseToPrimitiveType<response extends ClarityResponse> =
  response extends {
    response: {
      ok: infer okType extends ClarityType | string;
      error: infer errorType extends ClarityType | string;
    };
  }
    ?
        | { ok: ClarityTypeToPrimitiveType<okType>; error?: never }
        | { ok?: never; error: ClarityTypeToPrimitiveType<errorType> }
    : never;

/**
 * Converts Clarity ABI argument to TypeScript primitive type
 */
export type ClarityAbiArgToPrimitiveType<arg extends ClarityAbiArg> = {
  [K in arg["name"]]: ClarityTypeToPrimitiveType<arg["type"]>;
};

/**
 * Converts array of Clarity ABI arguments to tuple of TypeScript primitive types
 */
export type ClarityAbiArgsToPrimitiveTypes<
  args extends readonly ClarityAbiArg[],
> = Pretty<{
  [key in keyof args]: ClarityTypeToPrimitiveType<args[key]["type"]>;
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
