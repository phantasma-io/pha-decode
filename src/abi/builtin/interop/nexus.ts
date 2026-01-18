import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Nexus.BeginInit', params: makeParams([['owner', 'Address']]) },
  { key: 'Nexus.CreateOrganization', params: makeParams([['source', 'Address'], ['id', 'String'], ['name', 'String'], ['script', 'Bytes']]) },
  { key: 'Nexus.CreateToken', params: makeParams([['owner', 'Address'], ['script', 'Bytes'], ['abiBytes', 'Bytes']]) },
  { key: 'Nexus.CreateTokenSeries', params: makeParams([['from', 'Address'], ['symbol', 'String'], ['seriesID', 'BigInteger'], ['maxSupply', 'BigInteger'], ['mode', 'TokenSeriesMode'], ['script', 'Bytes'], ['abiBytes', 'Bytes']]) },
  { key: 'Nexus.EndInit', params: makeParams([['owner', 'Address']]) },
  { key: 'Nexus.GetGovernanceValue', params: makeParams([['tag', 'String']]) },
];

export function addNexusInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}
