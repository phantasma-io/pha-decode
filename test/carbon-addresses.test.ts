import assert from 'node:assert/strict';
import test from 'node:test';
import { PhantasmaKeys } from 'phantasma-sdk-ts';
import { applyCarbonAddressMode, CARBON_ADDRESS_PATH_INVENTORY } from '../src/decoders/carbon-addresses.js';
import type { DecodeOutput } from '../src/types/decoded.js';

// Test vectors sourced from phantasma-sdk-ts tests:
// - tests/types/Address.test.ts
// - tests/tx/Transaction.test.ts
const TEST_WIF = 'L5UEVHBjujaR1721aZM5Zm5ayjDyamMZS9W35RE9Y9giRkdf3dVx';
const TEST_ADDRESS = 'P2KFEyFevpQfSaW8G4VjSmhWUZXR4QrG9YQR1HbMpTUCpCL';
const TEST_BYTES32 = Buffer.from(PhantasmaKeys.fromWIF(TEST_WIF).Address.GetPublicKey()).toString('hex');

function buildOutputFixture(): DecodeOutput {
  return {
    source: 'tx-hex',
    input: '00',
    format: 'json',
    warnings: [],
    errors: [],
    carbon: {
      type: 0,
      typeName: 'Call',
      expiry: '0',
      maxGas: '0',
      maxData: '0',
      gasFrom: TEST_BYTES32,
      payload: '',
      witnesses: [
        { address: TEST_BYTES32, signature: '11'.repeat(64) },
      ],
      msg: {
        to: TEST_BYTES32,
        from: TEST_BYTES32,
        id: TEST_BYTES32,
        transferF: [{ to: TEST_BYTES32, from: TEST_BYTES32 }],
        transferN: [{ to: TEST_BYTES32, from: TEST_BYTES32 }],
        mintF: [{ to: TEST_BYTES32 }],
        burnF: [{ from: TEST_BYTES32 }],
        mintN: [{ to: TEST_BYTES32 }],
        burnN: [{ from: TEST_BYTES32 }],
      },
      call: {
        moduleId: 1,
        methodId: 0,
        args: [
          { name: 'direct', type: 'bytes32', value: TEST_BYTES32 },
          { name: 'list', type: 'bytes32[]', value: [TEST_BYTES32, TEST_BYTES32] },
          { name: 'tokenInfo', type: 'token_info', value: { owner: TEST_BYTES32, symbol: 'TEST' } },
          { name: 'seriesInfo', type: 'series_info', value: { owner: TEST_BYTES32 } },
          { name: 'stake', type: 'stake_import', value: { to: TEST_BYTES32 } },
          { name: 'name', type: 'name_import', value: { address: TEST_BYTES32 } },
          { name: 'member', type: 'member_import', value: { address: TEST_BYTES32 } },
          {
            name: 'organization',
            type: 'organization_import',
            value: {
              info: { owner: TEST_BYTES32 },
              memberImports: [{ address: TEST_BYTES32 }],
            },
          },
          {
            name: 'seriesImport',
            type: 'series_import',
            value: {
              info: { owner: TEST_BYTES32 },
              imports: [{ originator: TEST_BYTES32, owner: TEST_BYTES32 }],
            },
          },
          {
            name: 'nftImport',
            type: 'nft_import',
            value: { originator: TEST_BYTES32, owner: TEST_BYTES32 },
          },
          {
            name: 'mintFungible',
            type: 'txmsg_mint_fungible',
            value: { to: TEST_BYTES32 },
          },
          {
            name: 'embeddedCalls',
            type: 'txmsg_call_multi',
            value: [
              {
                moduleId: 1,
                methodId: 0,
                args: [{ name: 'embeddedAddress', type: 'bytes32', value: TEST_BYTES32 }],
              },
            ],
          },
        ],
        sections: [
          {
            registerOffset: 0,
            args: [{ name: 'sectionAddress', type: 'bytes32', value: TEST_BYTES32 }],
          },
        ],
      },
      calls: [
        {
          moduleId: 1,
          methodId: 1,
          args: [{ name: 'multiAddress', type: 'bytes32', value: TEST_BYTES32 }],
          sections: [
            {
              registerOffset: 0,
              args: [{ name: 'multiSectionAddress', type: 'bytes32', value: TEST_BYTES32 }],
            },
          ],
        },
      ],
    },
  };
}

// Verifies all documented Carbon address paths are converted to Phantasma addresses in pha mode.
test('converts known Carbon paths to Phantasma address format', () => {
  const output = buildOutputFixture();
  applyCarbonAddressMode(output, 'pha');

  const carbon = output.carbon;
  assert.ok(carbon);
  assert.equal(carbon.gasFrom, TEST_ADDRESS);

  const witness = (carbon.witnesses as Array<{ address: string }>)[0];
  assert.equal(witness.address, TEST_ADDRESS);

  const msg = carbon.msg as Record<string, unknown>;
  assert.equal(msg.to, TEST_ADDRESS);
  assert.equal(msg.from, TEST_ADDRESS);
  assert.equal((msg.transferF as Array<Record<string, unknown>>)[0].to, TEST_ADDRESS);
  assert.equal((msg.transferF as Array<Record<string, unknown>>)[0].from, TEST_ADDRESS);
  assert.equal((msg.transferN as Array<Record<string, unknown>>)[0].to, TEST_ADDRESS);
  assert.equal((msg.transferN as Array<Record<string, unknown>>)[0].from, TEST_ADDRESS);
  assert.equal((msg.mintF as Array<Record<string, unknown>>)[0].to, TEST_ADDRESS);
  assert.equal((msg.burnF as Array<Record<string, unknown>>)[0].from, TEST_ADDRESS);
  assert.equal((msg.mintN as Array<Record<string, unknown>>)[0].to, TEST_ADDRESS);
  assert.equal((msg.burnN as Array<Record<string, unknown>>)[0].from, TEST_ADDRESS);

  const callArgs = carbon.call?.args ?? [];
  assert.equal(callArgs[0]?.value, TEST_ADDRESS);
  assert.deepEqual(callArgs[1]?.value, [TEST_ADDRESS, TEST_ADDRESS]);
  assert.equal((callArgs[2]?.value as Record<string, unknown>).owner, TEST_ADDRESS);
  assert.equal((callArgs[3]?.value as Record<string, unknown>).owner, TEST_ADDRESS);
  assert.equal((callArgs[4]?.value as Record<string, unknown>).to, TEST_ADDRESS);
  assert.equal((callArgs[5]?.value as Record<string, unknown>).address, TEST_ADDRESS);
  assert.equal((callArgs[6]?.value as Record<string, unknown>).address, TEST_ADDRESS);
  assert.equal(
    ((callArgs[7]?.value as Record<string, unknown>).info as Record<string, unknown>).owner,
    TEST_ADDRESS
  );
  assert.equal(
    (((callArgs[7]?.value as Record<string, unknown>).memberImports as Array<Record<string, unknown>>)[0]).address,
    TEST_ADDRESS
  );
  assert.equal(
    ((callArgs[8]?.value as Record<string, unknown>).info as Record<string, unknown>).owner,
    TEST_ADDRESS
  );
  assert.equal(
    (((callArgs[8]?.value as Record<string, unknown>).imports as Array<Record<string, unknown>>)[0]).originator,
    TEST_ADDRESS
  );
  assert.equal(
    (((callArgs[8]?.value as Record<string, unknown>).imports as Array<Record<string, unknown>>)[0]).owner,
    TEST_ADDRESS
  );
  assert.equal((callArgs[9]?.value as Record<string, unknown>).originator, TEST_ADDRESS);
  assert.equal((callArgs[9]?.value as Record<string, unknown>).owner, TEST_ADDRESS);
  assert.equal((callArgs[10]?.value as Record<string, unknown>).to, TEST_ADDRESS);
  assert.equal(
    ((((callArgs[11]?.value as Array<Record<string, unknown>>)[0]).args as Array<Record<string, unknown>>)[0]).value,
    TEST_ADDRESS
  );

  assert.equal(carbon.call?.sections?.[0].args?.[0].value, TEST_ADDRESS);
  assert.equal(carbon.calls?.[0].args?.[0].value, TEST_ADDRESS);
  assert.equal(carbon.calls?.[0].sections?.[0].args?.[0].value, TEST_ADDRESS);

  // Non-whitelisted field must remain untouched even if it looks like bytes32.
  assert.equal(msg.id, TEST_BYTES32);
});

// Verifies default mode keeps raw bytes32 output as-is (no conversion).
test('keeps bytes32 format when mode is bytes32', () => {
  const output = buildOutputFixture();
  applyCarbonAddressMode(output, 'bytes32');

  const carbon = output.carbon;
  assert.ok(carbon);
  assert.equal(carbon.gasFrom, TEST_BYTES32);
  assert.equal(carbon.call?.args?.[0].value, TEST_BYTES32);
});

// Verifies that the conversion path inventory keeps critical path markers.
test('path inventory includes core tx and call paths', () => {
  assert.ok(CARBON_ADDRESS_PATH_INVENTORY.includes('carbon.gasFrom'));
  assert.ok(CARBON_ADDRESS_PATH_INVENTORY.includes('carbon.msg.transferF[].to'));
  assert.ok(CARBON_ADDRESS_PATH_INVENTORY.includes('carbon.call.args[].value (type=bytes32)'));
});
