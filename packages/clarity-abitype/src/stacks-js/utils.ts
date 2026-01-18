import type {
  ClarityType as AbiClarityType,
  ClarityTuple,
  ClarityList,
  ClarityResponse,
} from "../abi.js";

import type {
  ClarityValue,
  ClarityAbiType as StacksClarityAbiType,
} from "@stacks/transactions";

import {
  noneCV,
  listCV,
  tupleCV,
  responseOkCV,
  responseErrorCV,
  ClarityType,
  cvToValue,
  encodeAbiClarityValue,
} from "@stacks/transactions";

////////////////////////////////////////////////////////////////////////////////////////////////////
// ClarityValue to Primitive Conversion
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Converts a ClarityValue to a TypeScript primitive value.
 *
 * Uses cvToValue from @stacks/transactions for simple types, but handles
 * response types specially to preserve the ok/error structure.
 *
 * @param cv - The ClarityValue to convert
 * @returns The corresponding TypeScript primitive value
 */
export function cvToPrimitive(cv: ClarityValue): unknown {
  const cvWithType = cv as ClarityValue & {
    type: string;
    value?: ClarityValue;
  };

  switch (cvWithType.type) {
    case ClarityType.ResponseOk:
      return { ok: cvToPrimitive(cvWithType.value!) };

    case ClarityType.ResponseErr:
      return { error: cvToPrimitive(cvWithType.value!) };

    case ClarityType.OptionalSome:
      return cvToPrimitive(cvWithType.value!);

    case ClarityType.OptionalNone:
      return null;

    case ClarityType.List:
      return (
        (cvWithType as unknown as { value: ClarityValue[] }).value || []
      ).map(cvToPrimitive);

    case ClarityType.Tuple:
      const tupleData = (
        cvWithType as unknown as { value: Record<string, ClarityValue> }
      ).value;
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(tupleData)) {
        result[key] = cvToPrimitive(value);
      }
      return result;

    default:
      // For simple types (int, uint, bool, string, buffer, principal),
      // cvToValue handles the conversion correctly
      return cvToValue(cv);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Primitive to ClarityValue Conversion
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Converts a TypeScript primitive value to a ClarityValue based on the ABI type.
 *
 * Uses encodeAbiClarityValue from @stacks/transactions for supported types
 * (primitives, buffer, strings, optional), and handles unsupported types
 * (response, list, tuple) ourselves.
 *
 * Note: Buffer values should be passed as hex strings (with or without 0x prefix).
 *
 * @param value - The TypeScript primitive value to convert
 * @param abiType - The Clarity ABI type definition
 * @returns The corresponding ClarityValue
 */
export function primitiveToCV(
  value: unknown,
  abiType: AbiClarityType | string,
): ClarityValue {
  // Handle optional type - need special handling for null/undefined
  if (typeof abiType === "object" && "optional" in abiType) {
    if (value === null || value === undefined) {
      return noneCV();
    }
    // For non-null values, encodeAbiClarityValue handles optional
    return encodeAbiClarityValue(
      String(value),
      abiType as StacksClarityAbiType,
    );
  }

  // Handle list type (not supported by encodeAbiClarityValue)
  if (typeof abiType === "object" && "list" in abiType) {
    if (Array.isArray(value)) {
      const listType = abiType as ClarityList;
      const items = value.map((item) =>
        primitiveToCV(item, listType.list.type),
      );
      return listCV(items);
    }
    throw new Error(`Expected array for list, got ${typeof value}`);
  }

  // Handle tuple type (not supported by encodeAbiClarityValue)
  if (typeof abiType === "object" && "tuple" in abiType) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const tupleType = abiType as ClarityTuple;
      const tupleData: Record<string, ClarityValue> = {};
      for (const entry of tupleType.tuple) {
        const entryValue = (value as Record<string, unknown>)[entry.name];
        if (entryValue === undefined) {
          throw new Error(`Missing tuple field: ${entry.name}`);
        }
        tupleData[entry.name] = primitiveToCV(entryValue, entry.type);
      }
      return tupleCV(tupleData);
    }
    throw new Error(`Expected object for tuple, got ${typeof value}`);
  }

  // Handle response type (not supported by encodeAbiClarityValue)
  if (typeof abiType === "object" && "response" in abiType) {
    if (typeof value === "object" && value !== null) {
      const responseType = abiType as ClarityResponse;
      const responseValue = value as { ok?: unknown; error?: unknown };
      if ("ok" in responseValue && responseValue.ok !== undefined) {
        return responseOkCV(
          primitiveToCV(responseValue.ok, responseType.response.ok),
        );
      }
      if ("error" in responseValue && responseValue.error !== undefined) {
        return responseErrorCV(
          primitiveToCV(responseValue.error, responseType.response.error),
        );
      }
    }
    throw new Error(
      `Expected response object with ok or error, got ${typeof value}`,
    );
  }

  // For all other types (primitives, buffer, strings), use encodeAbiClarityValue
  // Supported: uint128, int128, bool, principal, trait_reference, none,
  //            buffer, string-ascii, string-utf8
  return encodeAbiClarityValue(String(value), abiType as StacksClarityAbiType);
}

/**
 * Converts an array of TypeScript primitive values to ClarityValues based on ABI function args.
 *
 * @param args - Array of TypeScript primitive values
 * @param abiArgs - Array of ABI argument definitions
 * @returns Array of ClarityValues
 */
export function primitivesToCVs(
  args: readonly unknown[],
  abiArgs: readonly { name: string; type: AbiClarityType | string }[],
): ClarityValue[] {
  if (args.length !== abiArgs.length) {
    throw new Error(
      `Argument count mismatch: expected ${abiArgs.length}, got ${args.length}`,
    );
  }

  return args.map((arg, index) => primitiveToCV(arg, abiArgs[index].type));
}
