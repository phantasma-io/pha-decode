import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Map.Clear', params: makeParams([['field', 'String']]) },
  { key: 'Map.Count', params: makeParams([['contract', 'String'], ['field', 'String']]) },
  { key: 'Map.Get', params: makeParams([['contract', 'String'], ['field', 'String'], ['entryKey', 'Bytes'], ['vmType', 'VMType']]) },
  { key: 'Map.Has', params: makeParams([['contract', 'String'], ['field', 'String'], ['entryKey', 'Bytes'], ['vmType', 'VMType']]) },
  { key: 'Map.Keys', params: makeParams([['contract', 'String'], ['field', 'String']]) },
  { key: 'Map.Remove', params: makeParams([['field', 'String'], ['entryKey', 'Bytes']]) },
  { key: 'Map.Set', params: makeParams([['field', 'String'], ['entryKey', 'Bytes'], ['value', 'Bytes']]) },
];

export function addMapInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}
