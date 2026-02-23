import { test } from 'node:test';
import assert from 'node:assert';
import { encodeShareCode, decodeShareCode } from './share.js';

test('encodeShareCode & decodeShareCode - roundtrip', () => {
  const original = { id: 'test-123', name: 'Test Simulation', data: { val: 100 } };
  const encoded = encodeShareCode(original);
  const decoded = decodeShareCode(encoded);

  assert.deepStrictEqual(decoded, original);
});

test('decodeShareCode - returns null for invalid input', () => {
  const decoded = decodeShareCode('invalid-base64-!!!');
  assert.strictEqual(decoded, null);
});
