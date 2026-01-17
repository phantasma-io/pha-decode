import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeUnknownParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Data.Delete', params: makeUnknownParams(1) },
  { key: 'Data.Set', params: makeUnknownParams(2) },
];

export function addDataInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}