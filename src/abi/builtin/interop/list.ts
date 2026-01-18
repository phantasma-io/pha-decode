import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'List.Add', params: makeParams([['field', 'String'], ['value', 'Bytes']]) },
  { key: 'List.Clear', params: makeParams([['field', 'String']]) },
  { key: 'List.Count', params: makeParams([['contract', 'String'], ['field', 'String']]) },
  { key: 'List.Get', params: makeParams([['contract', 'String'], ['field', 'String'], ['index', 'BigInteger'], ['vmType', 'VMType']]) },
  { key: 'List.RemoveAt', params: makeParams([['field', 'String'], ['index', 'BigInteger']]) },
  { key: 'List.Replace', params: makeParams([['field', 'String'], ['index', 'BigInteger'], ['value', 'Bytes']]) },
];

export function addListInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}
