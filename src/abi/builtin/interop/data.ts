import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Data.Delete', params: makeParams([['field', 'String']]) },
  { key: 'Data.Set', params: makeParams([['field', 'String'], ['value', 'Bytes']]) },
];

export function addDataInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}
