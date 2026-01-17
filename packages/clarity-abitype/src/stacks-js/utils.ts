import type {
  ClarityType,
  ClarityTuple,
  ClarityList,
  ClarityOptional,
  ClarityResponse,
} from "../abi.js";

import type { ClarityValue } from "@stacks/transactions";

import {
  uintCV,
  intCV,
  bufferCV,
  stringAsciiCV,
  stringUtf8CV,
  trueCV,
  falseCV,
  noneCV,
  someCV,
  standardPrincipalCV,
  contractPrincipalCV,
  listCV,
  tupleCV,
  responseOkCV,
  responseErrorCV,
} from "@stacks/transactions";
import { hexToBytes, bytesToHex } from "@stacks/common";

////////////////////////////////////////////////////////////////////////////////////////////////////
// ClarityValue to Primitive Conversion
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Represents a ClarityValue as returned by the Stacks API.
 * The type can be either a numeric enum or a string identifier.
 */
type ApiClarityValue =
  | { type: "ok"; value: ApiClarityValue }
  | { type: "err"; value: ApiClarityValue }
  | { type: "int"; value: string | bigint }
  | { type: "uint"; value: string | bigint }
  | { type: "bool"; value: boolean }
  | { type: "ascii"; value: string }
  | { type: "utf8"; value: string }
  | { type: "none" }
  | { type: "some"; value: ApiClarityValue }
  | { type: "buff"; value: string }
  | { type: "principal"; value: string }
  | { type: "list"; value: ApiClarityValue[] }
  | { type: "tuple"; value: Record<string, ApiClarityValue> }
  | ClarityValue;

/**
 * Converts a ClarityValue to a TypeScript primitive value.
 * Handles both the API response format (string types) and the internal ClarityValue format (numeric types).
 *
 * @param cv - The ClarityValue to convert
 * @returns The corresponding TypeScript primitive value
 */
export function cvToPrimitive(cv: ClarityValue | ApiClarityValue): unknown {
  const cvAny = cv as ApiClarityValue;
  const cvType = (cv as { type: string | number }).type;

  // Handle string-based types from API responses
  if (typeof cvType === "string") {
    switch (cvType) {
      case "ok":
        return {
          ok: cvToPrimitive(
            (cvAny as { type: "ok"; value: ApiClarityValue }).value,
          ),
        };

      case "err":
        return {
          error: cvToPrimitive(
            (cvAny as { type: "err"; value: ApiClarityValue }).value,
          ),
        };

      case "int":
        const intVal = (cvAny as { type: "int"; value: string | bigint }).value;
        return typeof intVal === "bigint" ? intVal : BigInt(intVal);

      case "uint":
        const uintVal = (cvAny as { type: "uint"; value: string | bigint })
          .value;
        return typeof uintVal === "bigint" ? uintVal : BigInt(uintVal);

      case "bool":
        return (cvAny as { type: "bool"; value: boolean }).value;

      case "ascii":
        return (cvAny as { type: "ascii"; value: string }).value;

      case "utf8":
        return (cvAny as { type: "utf8"; value: string }).value;

      case "none":
        return null;

      case "some":
        return cvToPrimitive(
          (cvAny as { type: "some"; value: ApiClarityValue }).value,
        );

      case "buff":
        const buffVal = (cvAny as { type: "buff"; value: string }).value;
        return buffVal.startsWith("0x") ? buffVal : "0x" + buffVal;

      case "principal":
        return (cvAny as { type: "principal"; value: string }).value;

      case "list":
        return (
          (cvAny as { type: "list"; value: ApiClarityValue[] }).value || []
        ).map(cvToPrimitive);

      case "tuple":
        const tupleData = (
          cvAny as { type: "tuple"; value: Record<string, ApiClarityValue> }
        ).value;
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(tupleData)) {
          result[key] = cvToPrimitive(value);
        }
        return result;

      default:
        throw new Error(`Unknown ClarityValue string type: ${cvType}`);
    }
  }

  // Handle numeric types from internal ClarityValue format
  // Based on ClarityType enum from @stacks/transactions
  // 0 = Int, 1 = UInt, 2 = Buffer, 3 = BoolTrue, 4 = BoolFalse
  // 5 = PrincipalStandard, 6 = PrincipalContract, 7 = ResponseOk, 8 = ResponseErr
  // 9 = None, 10 = Some, 11 = List, 12 = Tuple, 13 = StringASCII, 14 = StringUTF8

  switch (cvType) {
    case 0: // Int
      return (cv as { value: bigint }).value;

    case 1: // UInt
      return (cv as { value: bigint }).value;

    case 2: // Buffer
      return (
        "0x" + bytesToHex((cv as unknown as { buffer: Uint8Array }).buffer)
      );

    case 3: // BoolTrue
      return true;

    case 4: // BoolFalse
      return false;

    case 5: // PrincipalStandard
      return formatPrincipal(cv as unknown as PrincipalCV);

    case 6: // PrincipalContract
      return formatContractPrincipal(cv as unknown as ContractPrincipalCV);

    case 7: // ResponseOk
      return { ok: cvToPrimitive((cv as { value: ClarityValue }).value) };

    case 8: // ResponseErr
      return { error: cvToPrimitive((cv as { value: ClarityValue }).value) };

    case 9: // None
      return null;

    case 10: // Some
      return cvToPrimitive((cv as { value: ClarityValue }).value);

    case 11: // List
      return ((cv as unknown as { list: ClarityValue[] }).list || []).map(
        cvToPrimitive,
      );

    case 12: // Tuple
      const numericTupleData = (
        cv as unknown as { data: Record<string, ClarityValue> }
      ).data;
      const numericResult: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(numericTupleData)) {
        numericResult[key] = cvToPrimitive(value);
      }
      return numericResult;

    case 13: // StringASCII
      return (cv as unknown as { data: string }).data;

    case 14: // StringUTF8
      return (cv as unknown as { data: string }).data;

    default:
      throw new Error(`Unknown ClarityValue numeric type: ${cvType}`);
  }
}

// Helper types for principal handling
interface PrincipalCV {
  type: number;
  address: {
    version: number;
    hash160: Uint8Array;
  };
}

interface ContractPrincipalCV extends PrincipalCV {
  contractName: {
    content: string;
  };
}

function formatPrincipal(cv: PrincipalCV): string {
  const { version, hash160 } = cv.address;
  // Use c32 encoding for the address
  const c32Alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const data = new Uint8Array([version, ...hash160]);

  // Simple c32check encoding
  let result = "";
  let carry = 0;
  let carryBits = 0;

  for (let i = data.length - 1; i >= 0; i--) {
    carry |= data[i] << carryBits;
    carryBits += 8;
    while (carryBits >= 5) {
      result = c32Alphabet[carry & 0x1f] + result;
      carry >>= 5;
      carryBits -= 5;
    }
  }
  if (carryBits > 0) {
    result = c32Alphabet[carry & 0x1f] + result;
  }

  // Add prefix based on version
  const prefix = version === 22 || version === 20 ? "SP" : "ST";
  return prefix + result;
}

function formatContractPrincipal(cv: ContractPrincipalCV): string {
  const address = formatPrincipal(cv);
  const contractName = cv.contractName.content;
  return `${address}.${contractName}`;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Primitive to ClarityValue Conversion
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Converts a TypeScript primitive value to a ClarityValue based on the ABI type.
 *
 * @param value - The TypeScript primitive value to convert
 * @param abiType - The Clarity ABI type definition
 * @returns The corresponding ClarityValue
 */
export function primitiveToCV(
  value: unknown,
  abiType: ClarityType | string,
): ClarityValue {
  // Handle string-based primitive types
  if (typeof abiType === "string") {
    switch (abiType) {
      case "uint128":
        if (typeof value === "bigint" || typeof value === "number") {
          return uintCV(value);
        }
        throw new Error(
          `Expected bigint or number for uint128, got ${typeof value}`,
        );

      case "int128":
        if (typeof value === "bigint" || typeof value === "number") {
          return intCV(value);
        }
        throw new Error(
          `Expected bigint or number for int128, got ${typeof value}`,
        );

      case "bool":
        if (typeof value === "boolean") {
          return value ? trueCV() : falseCV();
        }
        throw new Error(`Expected boolean for bool, got ${typeof value}`);

      case "principal":
      case "trait_reference":
        if (typeof value === "string") {
          if (value.includes(".")) {
            const [address, contractName] = value.split(".");
            return contractPrincipalCV(address, contractName);
          }
          return standardPrincipalCV(value);
        }
        throw new Error(`Expected string for principal, got ${typeof value}`);

      case "none":
        return noneCV();

      default:
        throw new Error(`Unknown primitive Clarity type: ${abiType}`);
    }
  }

  // Handle object-based types
  if (typeof abiType === "object" && abiType !== null) {
    // Buffer type
    if ("buffer" in abiType) {
      if (typeof value === "string") {
        // Assume hex string starting with 0x
        const hexValue = value.startsWith("0x") ? value.slice(2) : value;
        return bufferCV(hexToBytes(hexValue));
      }
      if (value instanceof Uint8Array) {
        return bufferCV(value);
      }
      throw new Error(
        `Expected string or Uint8Array for buffer, got ${typeof value}`,
      );
    }

    // String ASCII type
    if ("string-ascii" in abiType) {
      if (typeof value === "string") {
        return stringAsciiCV(value);
      }
      throw new Error(`Expected string for string-ascii, got ${typeof value}`);
    }

    // String UTF8 type
    if ("string-utf8" in abiType) {
      if (typeof value === "string") {
        return stringUtf8CV(value);
      }
      throw new Error(`Expected string for string-utf8, got ${typeof value}`);
    }

    // Optional type
    if ("optional" in abiType) {
      const optionalType = abiType as ClarityOptional;
      if (value === null || value === undefined) {
        return noneCV();
      }
      return someCV(primitiveToCV(value, optionalType.optional));
    }

    // List type
    if ("list" in abiType) {
      const listType = abiType as ClarityList;
      if (Array.isArray(value)) {
        const items = value.map((item) =>
          primitiveToCV(item, listType.list.type),
        );
        return listCV(items);
      }
      throw new Error(`Expected array for list, got ${typeof value}`);
    }

    // Tuple type
    if ("tuple" in abiType) {
      const tupleType = abiType as ClarityTuple;
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
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

    // Response type
    if ("response" in abiType) {
      const responseType = abiType as ClarityResponse;
      if (typeof value === "object" && value !== null) {
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
  }

  throw new Error(`Unsupported Clarity type: ${JSON.stringify(abiType)}`);
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
  abiArgs: readonly { name: string; type: ClarityType | string }[],
): ClarityValue[] {
  if (args.length !== abiArgs.length) {
    throw new Error(
      `Argument count mismatch: expected ${abiArgs.length}, got ${args.length}`,
    );
  }

  return args.map((arg, index) => primitiveToCV(arg, abiArgs[index].type));
}
