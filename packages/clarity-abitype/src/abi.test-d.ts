import { assertType, test } from 'vitest';
import type {
  ClarityBool,
  ClarityInt,
  ClarityNone,
  ClarityPrincipal,
  ClarityUInt,
} from './abi';

test('Clarity Primitive Types', () => {
  assertType<ClarityInt>('int128');
  assertType<ClarityUInt>('uint128');
  assertType<ClarityBool>('bool');
  assertType<ClarityPrincipal>('principal');
  assertType<ClarityNone>('none');
});
