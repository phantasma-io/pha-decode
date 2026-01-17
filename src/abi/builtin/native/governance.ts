import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'governance.CreateValue', params: makeParams([['from', 'Address'], ['name', 'String'], ['initial', 'BigInteger'], ['serializedConstraints', 'Bytes']]) },
  { key: 'governance.GetNames', params: makeParams([]), returnType: 'String[]' },
  { key: 'governance.GetValue', params: makeParams([['name', 'String']]), returnType: 'BigInteger' },
  { key: 'governance.GetValues', params: makeParams([]), returnType: 'GovernancePair[]' },
  { key: 'governance.HasName', params: makeParams([['name', 'String']]), returnType: 'Bool' },
  { key: 'governance.HasValue', params: makeParams([['name', 'String']]), returnType: 'Bool' },
  { key: 'governance.SetValue', params: makeParams([['from', 'Address'], ['name', 'String'], ['value', 'BigInteger']]) },
];

export function addGovernanceMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}