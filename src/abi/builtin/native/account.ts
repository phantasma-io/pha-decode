import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'account.HasScript', params: makeParams([['address', 'Address']]), returnType: 'Bool' },
  { key: 'account.LookUpABI', params: makeParams([['target', 'Address']]), returnType: 'Bytes' },
  { key: 'account.LookUpAddress', params: makeParams([['target', 'Address']]), returnType: 'String' },
  { key: 'account.LookUpName', params: makeParams([['name', 'String']]), returnType: 'Address' },
  { key: 'account.LookUpScript', params: makeParams([['target', 'Address']]), returnType: 'Bytes' },
  { key: 'account.Migrate', params: makeParams([['from', 'Address'], ['target', 'Address']]) },
  { key: 'account.RegisterName', params: makeParams([['target', 'Address'], ['name', 'String']]) },
  { key: 'account.RegisterScript', params: makeParams([['target', 'Address'], ['script', 'Bytes'], ['abiBytes', 'Bytes']]) },
  { key: 'account.UnregisterName', params: makeParams([['target', 'Address']]) },
];

export function addAccountMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}