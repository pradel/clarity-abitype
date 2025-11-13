import { assertType, test } from 'vitest';
import type {
  ClarityAbiAccess,
  ClarityAbiArg,
  ClarityAbiOutput,
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
  ClarityUInt,
} from './abi';

test('Clarity Primitive Types', () => {
  assertType<ClarityInt>('int128');
  assertType<ClarityUInt>('uint128');
  assertType<ClarityBool>('bool');
  assertType<ClarityPrincipal>('principal');
  assertType<ClarityNone>('none');
});

test('ClarityBuffer', () => {
  assertType<ClarityBuffer>({
    buffer: {
      length: 32,
    },
  });

  assertType<ClarityBuffer>({
    buffer: {
      length: 1024,
    },
  });
});

test('ClarityStringAscii', () => {
  assertType<ClarityStringAscii>({
    'string-ascii': {
      length: 10,
    },
  });

  assertType<ClarityStringAscii>({
    'string-ascii': {
      length: 256,
    },
  });
});

test('ClarityStringUtf8', () => {
  assertType<ClarityStringUtf8>({
    'string-utf8': {
      length: 256,
    },
  });

  assertType<ClarityStringUtf8>({
    'string-utf8': {
      length: 1024,
    },
  });
});

test('ClarityList', () => {
  assertType<ClarityList>({
    list: {
      type: 'uint128',
      length: 10,
    },
  });

  assertType<ClarityList>({
    list: {
      type: 'principal',
      length: 100,
    },
  });

  // List of tuples
  assertType<ClarityList>({
    list: {
      type: {
        tuple: [
          { name: 'amount', type: 'uint128' },
          { name: 'sender', type: 'principal' },
        ],
      },
      length: 200,
    },
  });
});

test('ClarityTuple', () => {
  assertType<ClarityTuple>({
    tuple: [
      { name: 'amount', type: 'uint128' },
      { name: 'sender', type: 'principal' },
    ],
  });

  assertType<ClarityTuple>({
    tuple: [
      { name: 'id', type: 'uint128' },
      {
        name: 'data',
        type: {
          'string-ascii': { length: 32 },
        },
      },
    ],
  });

  // Nested tuple
  assertType<ClarityTuple>({
    tuple: [
      { name: 'name', type: 'principal' },
      {
        name: 'metadata',
        type: {
          tuple: [
            { name: 'age', type: 'uint128' },
            { name: 'active', type: 'bool' },
          ],
        },
      },
    ],
  });
});

test('ClarityOptional', () => {
  assertType<ClarityOptional>({
    optional: 'uint128',
  });

  assertType<ClarityOptional>({
    optional: {
      buffer: { length: 34 },
    },
  });

  assertType<ClarityOptional>({
    optional: {
      'string-utf8': { length: 256 },
    },
  });
});

test('ClarityResponse', () => {
  assertType<ClarityResponse>({
    response: {
      ok: 'bool',
      error: 'uint128',
    },
  });

  assertType<ClarityResponse>({
    response: {
      ok: 'uint128',
      error: 'uint128',
    },
  });

  assertType<ClarityResponse>({
    response: {
      ok: {
        tuple: [
          { name: 'id', type: 'uint128' },
          { name: 'name', type: 'principal' },
        ],
      },
      error: 'uint128',
    },
  });
});

test('ClarityAbiArg', () => {
  assertType<ClarityAbiArg>({
    name: 'amount',
    type: 'uint128',
  });

  assertType<ClarityAbiArg>({
    name: 'recipient',
    type: 'principal',
  });

  assertType<ClarityAbiArg>({
    name: 'memo',
    type: {
      optional: {
        buffer: { length: 34 },
      },
    },
  });

  assertType<ClarityAbiArg>({
    name: 'data',
    type: {
      tuple: [
        { name: 'amount', type: 'uint128' },
        { name: 'sender', type: 'principal' },
      ],
    },
  });
});

test('ClarityAbiOutput', () => {
  assertType<ClarityAbiOutput>({
    type: 'uint128',
  });

  assertType<ClarityAbiOutput>({
    type: {
      response: {
        ok: 'bool',
        error: 'uint128',
      },
    },
  });
});

test('ClarityAbiAccess', () => {
  assertType<ClarityAbiAccess>('public');
  assertType<ClarityAbiAccess>('private');
  assertType<ClarityAbiAccess>('read_only');
  // @ts-expect-error invalid access modifier
  assertType<ClarityAbiAccess>('invalid');
});
