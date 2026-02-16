import assert from 'node:assert/strict';
import test from 'node:test';
import { parseArgs } from '../src/cli/args.js';

// Verifies that tx mode accepts the new address-display flag and stores it in parsed options.
test('parses tx mode with --carbon-addresses pha', () => {
  const parsed = parseArgs(['tx', '--hex', '00', '--carbon-addresses', 'pha']);
  assert.equal(parsed.kind, 'ok');
  if (parsed.kind !== 'ok') {
    return;
  }
  assert.equal(parsed.options.carbonAddresses, 'pha');
});

// Verifies alias values resolve to the default raw/bytes32 mode.
test('parses tx mode with --carbon-addresses off alias', () => {
  const parsed = parseArgs(['tx', '--hex', '00', '--carbon-addresses', 'off']);
  assert.equal(parsed.kind, 'ok');
  if (parsed.kind !== 'ok') {
    return;
  }
  assert.equal(parsed.options.carbonAddresses, 'bytes32');
});

// Verifies unknown values fail fast with a clear parser error.
test('rejects unknown --carbon-addresses mode', () => {
  const parsed = parseArgs(['tx', '--hex', '00', '--carbon-addresses', 'wrong']);
  assert.equal(parsed.kind, 'error');
  if (parsed.kind !== 'error') {
    return;
  }
  assert.match(parsed.message, /unknown carbon address mode/);
});
