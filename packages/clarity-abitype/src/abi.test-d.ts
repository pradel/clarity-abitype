import { assertType, test } from 'vitest';
import type {
  ClarityBool,
  ClarityBuffer,
  ClarityInt,
  ClarityNone,
  ClarityPrincipal,
  ClarityStringAscii,
  ClarityStringUtf8,
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
