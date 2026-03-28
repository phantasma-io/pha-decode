import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ContractInterface,
  ContractMethod,
  ContractParameter,
  ContractTxHelper,
  PBinaryWriter,
  PhantasmaKeys,
  ScriptBuilder,
  VMType,
} from 'phantasma-sdk-ts';
import { buildBuiltinMethodTable } from '../src/abi/builtin/index.js';
import { disassembleVmScript } from '../src/decoders/vm-disasm.js';

const TEST_WIF = 'L5UEVHBjujaR1721aZM5Zm5ayjDyamMZS9W35RE9Y9giRkdf3dVx';

function buildTestAbiBytes(): Uint8Array {
  const abi = new ContractInterface(
    [
      new ContractMethod('getValue', VMType.Number, 42, [
        new ContractParameter('who', VMType.String),
      ]),
    ],
    []
  );
  const writer = new PBinaryWriter();
  abi.SerializeData(writer);
  return writer.toUint8Array();
}

function expectRecord(value: unknown): Record<string, unknown> {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value));
  return value as Record<string, unknown>;
}

test('deploy interop exposes contract artifact summaries', () => {
  const owner = PhantasmaKeys.fromWIF(TEST_WIF).Address;
  const contractScript = Uint8Array.from([11]);
  const contractAbi = buildTestAbiBytes();
  const scriptHex = ContractTxHelper.buildDeployScript({
    from: owner,
    contractName: 'demo',
    script: contractScript,
    abi: contractAbi,
  });

  const result = disassembleVmScript(scriptHex, buildBuiltinMethodTable(16), 16);
  const call = result.methodCalls.find((entry) => entry.method === 'Runtime.DeployContract');

  assert.ok(call);
  const summary = expectRecord(call.summary);
  assert.equal(summary.kind, 'contract-deploy');
  assert.equal(summary.contractName, 'demo');
  assert.equal(summary.from, owner.Text);

  const scriptArg = call.args.find((entry) => entry.name === 'contractScript');
  const scriptDetails = expectRecord(scriptArg?.details);
  assert.equal(scriptDetails.byteLength, 1);
  assert.equal(scriptDetails.instructionCount, 1);
  assert.equal(typeof scriptDetails.sha256, 'string');

  const abiArg = call.args.find((entry) => entry.name === 'contractABI');
  const abiDetails = expectRecord(abiArg?.details);
  assert.equal(abiDetails.byteLength, contractAbi.length);
  assert.equal(abiDetails.methodCount, 1);
  assert.equal(abiDetails.eventCount, 0);

  const methods = abiDetails.methods;
  assert.ok(Array.isArray(methods));
  const [firstMethod] = methods as Array<Record<string, unknown>>;
  assert.equal(firstMethod?.name, 'getValue');
});

test('legacy upgrade interop still summarizes script bytes without abi', () => {
  const owner = PhantasmaKeys.fromWIF(TEST_WIF).Address;
  const contractScript = Uint8Array.from([11]);
  const nullAddress = new ScriptBuilder().NullAddress;
  const scriptHex = new ScriptBuilder()
    .BeginScript()
    .AllowGas(owner, nullAddress, 100000, 1)
    .CallInterop('Runtime.UpgradeContract', [owner, 'demo', contractScript])
    .SpendGas(owner)
    .EndScript();

  const result = disassembleVmScript(scriptHex, buildBuiltinMethodTable(13), 13);
  const call = result.methodCalls.find((entry) => entry.method === 'Runtime.UpgradeContract');

  assert.ok(call);
  const summary = expectRecord(call.summary);
  assert.equal(summary.kind, 'contract-upgrade');
  assert.equal(summary.contractName, 'demo');
  assert.equal('contractABI' in summary, false);

  const scriptArg = call.args.find((entry) => entry.name === 'contractScript');
  const scriptDetails = expectRecord(scriptArg?.details);
  assert.equal(scriptDetails.byteLength, 1);
  assert.equal(scriptDetails.instructionCount, 1);
});
