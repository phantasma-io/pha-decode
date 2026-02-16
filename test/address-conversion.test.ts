import assert from 'node:assert/strict';
import test from 'node:test';
import { PhantasmaKeys } from 'phantasma-sdk-ts';
import { decodeAddressConversion } from '../src/decoders/address.js';

// Test vectors sourced from phantasma-sdk-ts tests:
// - tests/types/Address.test.ts
// - tests/tx/Transaction.test.ts
const TEST_WIF = 'L5UEVHBjujaR1721aZM5Zm5ayjDyamMZS9W35RE9Y9giRkdf3dVx';
const TEST_ADDRESS = 'P2KFEyFevpQfSaW8G4VjSmhWUZXR4QrG9YQR1HbMpTUCpCL';

test('pha -> bytes32 matches PhantasmaKeys test vector', () => {
  const expectedBytes32 = Buffer.from(PhantasmaKeys.fromWIF(TEST_WIF).Address.GetPublicKey()).toString('hex');
  const result = decodeAddressConversion({ phantasma: TEST_ADDRESS });

  assert.equal(result.decoded.direction, 'pha-to-bytes32');
  assert.equal(result.decoded.phantasma, TEST_ADDRESS);
  assert.equal(result.decoded.bytes32, expectedBytes32);
  assert.equal(result.decoded.kind, 'user');
});

test('bytes32 -> pha roundtrip returns original test vector address', () => {
  const bytes32 = Buffer.from(PhantasmaKeys.fromWIF(TEST_WIF).Address.GetPublicKey()).toString('hex');
  const result = decodeAddressConversion({ bytes32 });

  assert.equal(result.decoded.direction, 'bytes32-to-pha');
  assert.equal(result.decoded.bytes32, bytes32);
  assert.equal(result.decoded.phantasma, TEST_ADDRESS);
  assert.equal(result.decoded.kind, 'user');
});

test('null/system roundtrip is stable', () => {
  const zero = '0000000000000000000000000000000000000000000000000000000000000000';
  const fromBytes = decodeAddressConversion({ bytes32: zero });
  assert.equal(fromBytes.decoded.phantasma, 'NULL');
  assert.equal(fromBytes.decoded.kind, 'system');

  const fromPha = decodeAddressConversion({ phantasma: 'NULL' });
  assert.equal(fromPha.decoded.bytes32, zero);
  assert.equal(fromPha.decoded.kind, 'system');
});

test('invalid bytes32 length throws', () => {
  assert.throws(() => decodeAddressConversion({ bytes32: '0x1234' }), {
    message: /bytes32 value must be 32 bytes/,
  });
});

test('requires exactly one input direction', () => {
  assert.throws(() => decodeAddressConversion({}), {
    message: /requires --bytes32 <hex> or --pha <address>/,
  });
  assert.throws(
    () => decodeAddressConversion({ bytes32: '00'.repeat(32), phantasma: TEST_ADDRESS }),
    { message: /accepts only one of --bytes32 or --pha/ }
  );
});
