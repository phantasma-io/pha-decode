import assert from 'node:assert/strict';
import test from 'node:test';
import { PhantasmaKeys } from 'phantasma-sdk-ts';
import { parseArgs } from '../src/cli/args.js';

const TEST_WIF = 'L5UEVHBjujaR1721aZM5Zm5ayjDyamMZS9W35RE9Y9giRkdf3dVx';
const TEST_ADDRESS = 'P2KFEyFevpQfSaW8G4VjSmhWUZXR4QrG9YQR1HbMpTUCpCL';
const TEST_BYTES32 = Buffer.from(PhantasmaKeys.fromWIF(TEST_WIF).Address.GetPublicKey()).toString('hex');

test('parses address mode with --pha', () => {
  const parsed = parseArgs(['address', '--pha', TEST_ADDRESS]);
  assert.equal(parsed.kind, 'ok');
  if (parsed.kind !== 'ok') {
    return;
  }
  assert.equal(parsed.options.command, 'address');
  assert.equal(parsed.options.addressPha, TEST_ADDRESS);
  assert.equal(parsed.options.addressBytes32, undefined);
});

test('parses address mode with --bytes32', () => {
  const parsed = parseArgs(['address', '--bytes32', TEST_BYTES32]);
  assert.equal(parsed.kind, 'ok');
  if (parsed.kind !== 'ok') {
    return;
  }
  assert.equal(parsed.options.command, 'address');
  assert.equal(parsed.options.addressBytes32, TEST_BYTES32);
  assert.equal(parsed.options.addressPha, undefined);
});

test('address mode rejects missing conversion input', () => {
  const parsed = parseArgs(['address']);
  assert.equal(parsed.kind, 'error');
  if (parsed.kind !== 'error') {
    return;
  }
  assert.match(parsed.message, /requires --bytes32 <hex> or --pha <address>/);
});

test('address mode rejects both conversion inputs together', () => {
  const parsed = parseArgs(['address', '--bytes32', TEST_BYTES32, '--pha', TEST_ADDRESS]);
  assert.equal(parsed.kind, 'error');
  if (parsed.kind !== 'error') {
    return;
  }
  assert.match(parsed.message, /accepts only one of --bytes32 or --pha/);
});
