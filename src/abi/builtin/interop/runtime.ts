import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
const COMMON_METHODS: BuiltinMethodSpec[] = [
  { key: 'Runtime.BurnToken', params: makeParams([['source', 'Address'], ['symbol', 'String'], ['tokenID', 'BigInteger']]) },
  { key: 'Runtime.BurnTokens', params: makeParams([['target', 'Address'], ['symbol', 'String'], ['amount', 'BigInteger']]) },
  { key: 'Runtime.Context', params: makeParams([]) },
  { key: 'Runtime.ContractExists', params: makeParams([['contractName', 'String']]) },
  { key: 'Runtime.DeployContract', params: makeParams([['from', 'Address'], ['contractName', 'String'], ['contractScript', 'Bytes'], ['contractABI', 'Bytes']]) },
  { key: 'Runtime.GasTarget', params: makeParams([]) },
  { key: 'Runtime.GenerateUID', params: makeParams([]) },
  { key: 'Runtime.GetAvailableNFTSymbols', params: makeParams([]) },
  { key: 'Runtime.GetAvailableTokenSymbols', params: makeParams([]) },
  { key: 'Runtime.GetBalance', params: makeParams([['address', 'Address'], ['symbol', 'String']]) },
  { key: 'Runtime.GetOwnerships', params: makeParams([['address', 'Address'], ['symbol', 'String']]) },
  { key: 'Runtime.GetTokenDecimals', params: makeParams([['symbol', 'String']]) },
  { key: 'Runtime.GetTokenFlags', params: makeParams([['symbol', 'String']]) },
  { key: 'Runtime.GetTokenSupply', params: makeParams([['symbol', 'String']]) },
  { key: 'Runtime.InfuseToken', params: makeParams([['source', 'Address'], ['targetSymbol', 'String'], ['tokenID', 'BigInteger'], ['infuseSymbol', 'String'], ['value', 'BigInteger']]) },
  { key: 'Runtime.IsMinter', params: makeParams([['address', 'Address'], ['symbol', 'String']]) },
  { key: 'Runtime.IsTrigger', params: makeParams([]) },
  { key: 'Runtime.IsWitness', params: makeParams([['address', 'Address']]) },
  { key: 'Runtime.KillContract', params: makeParams([['from', 'Address'], ['contractName', 'String']]) },
  { key: 'Runtime.Log', params: makeParams([['text', 'String']]) },
  { key: 'Runtime.MintToken', params: makeParams([['source', 'Address'], ['destination', 'Address'], ['symbol', 'String'], ['rom', 'Bytes'], ['ram', 'Bytes'], ['seriesID', 'BigInteger']]) },
  { key: 'Runtime.MintTokens', params: makeParams([['source', 'Address'], ['destination', 'Address'], ['symbol', 'String'], ['amount', 'BigInteger']]) },
  { key: 'Runtime.Nexus', params: makeParams([]) },
  { key: 'Runtime.PreviousContext', params: makeParams([]) },
  { key: 'Runtime.ReadInfusions', params: makeParams([['symbol', 'String'], ['tokenID', 'BigInteger']]) },
  { key: 'Runtime.ReadTokenRAM', params: makeParams([['symbol', 'String'], ['tokenID', 'BigInteger']]) },
  { key: 'Runtime.ReadTokenROM', params: makeParams([['symbol', 'String'], ['tokenID', 'BigInteger']]) },
  { key: 'Runtime.SwapTokens', params: makeParams([['targetChain', 'String'], ['source', 'Address'], ['destination', 'Address'], ['symbol', 'String'], ['amount', 'BigInteger']]) },
  { key: 'Runtime.Time', params: makeParams([]) },
  { key: 'Runtime.TokenExists', params: makeParams([['symbol', 'String']]) },
  { key: 'Runtime.TransactionHash', params: makeParams([]) },
  { key: 'Runtime.TransferBalance', params: makeParams([['source', 'Address'], ['destination', 'Address'], ['symbol', 'String']]) },
  { key: 'Runtime.TransferToken', params: makeParams([['source', 'Address'], ['destination', 'Address'], ['symbol', 'String'], ['tokenID', 'BigInteger']]) },
  { key: 'Runtime.TransferTokens', params: makeParams([['source', 'Address'], ['destination', 'Address'], ['symbol', 'String'], ['amount', 'BigInteger']]) },
  { key: 'Runtime.ValidateAddress', params: makeParams([['address', 'Address'], ['signedData', 'String'], ['random', 'String'], ['data', 'String']]) },
  { key: 'Runtime.Validator', params: makeParams([]) },
  { key: 'Runtime.Version', params: makeParams([]) },
  { key: 'Runtime.WriteToken', params: makeParams([['from', 'Address'], ['symbol', 'String'], ['tokenID', 'BigInteger'], ['ram', 'Bytes']]) },
];

const NOTIFY_LEGACY: BuiltinMethodSpec = {
  key: 'Runtime.Notify',
  params: makeParams([['kind', 'EventKind'], ['address', 'Address'], ['data', 'Object']]),
};

const NOTIFY_V19: BuiltinMethodSpec = {
  key: 'Runtime.Notify',
  params: makeParams([['kind', 'EventKind'], ['address', 'Address'], ['data', 'Object'], ['name', 'String']]),
};

const READTOKEN_LEGACY: BuiltinMethodSpec = {
  key: 'Runtime.ReadToken',
  params: makeParams([['symbol', 'String'], ['tokenID', 'BigInteger']]),
};

const READTOKEN_V15: BuiltinMethodSpec = {
  key: 'Runtime.ReadToken',
  params: makeParams([['symbol', 'String'], ['tokenID', 'BigInteger'], ['fields', 'String']]),
};

const UPGRADE_LEGACY: BuiltinMethodSpec = {
  key: 'Runtime.UpgradeContract',
  params: makeParams([['from', 'Address'], ['contractName', 'String'], ['contractScript', 'Bytes']]),
};

const UPGRADE_V14: BuiltinMethodSpec = {
  key: 'Runtime.UpgradeContract',
  params: makeParams([['from', 'Address'], ['contractName', 'String'], ['contractScript', 'Bytes'], ['contractABI', 'Bytes']]),
};

export function addRuntimeInteropMethods(
  table: BuiltinMethodTable,
  protocolVersion: number
): void {
  addMethods(table, COMMON_METHODS);

  // Register both arities so decoding can follow the actual stack shape.
  // Protocol-specific expectations are enforced via warnings during disassembly.
  addMethods(table, [NOTIFY_LEGACY, NOTIFY_V19]);
  addMethods(table, [READTOKEN_LEGACY, READTOKEN_V15]);
  addMethods(table, [UPGRADE_LEGACY, UPGRADE_V14]);
}
