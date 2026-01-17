import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeUnknownParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Map.Clear', params: makeUnknownParams(1) },
  { key: 'Map.Count', params: makeUnknownParams(2) },
  { key: 'Map.Get', params: makeUnknownParams(4) },
  { key: 'Map.Has', params: makeUnknownParams(4) },
  { key: 'Map.Keys', params: makeUnknownParams(2) },
  { key: 'Map.Remove', params: makeUnknownParams(2) },
  { key: 'Map.Set', params: makeUnknownParams(3) },
];

export function addMapInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}