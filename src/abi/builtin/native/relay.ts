import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'relay.CloseChannel', params: makeParams([['from', 'Address'], ['channelName', 'String']]) },
  { key: 'relay.GetBalance', params: makeParams([['from', 'Address']]), returnType: 'BigInteger' },
  { key: 'relay.GetIndex', params: makeParams([['from', 'Address'], ['to', 'Address']]), returnType: 'BigInteger' },
  { key: 'relay.GetKey', params: makeParams([['from', 'Address']]), returnType: 'Bytes' },
  { key: 'relay.GetTopUpAddress', params: makeParams([['from', 'Address']]), returnType: 'Address' },
  { key: 'relay.OpenChannel', params: makeParams([['from', 'Address'], ['to', 'Address'], ['chainName', 'String'], ['channelName', 'String'], ['tokenSymbol', 'String'], ['amount', 'BigInteger'], ['fee', 'BigInteger']]) },
  { key: 'relay.OpenChannel', params: makeParams([['from', 'Address'], ['publicKey', 'Bytes']]) },
  { key: 'relay.SettleChannel', params: makeParams([['receipt', 'RelayReceipt']]) },
  { key: 'relay.TopUpChannel', params: makeParams([['from', 'Address'], ['count', 'BigInteger']]) },
];

export function addRelayMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}