import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeUnknownParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'List.Add', params: makeUnknownParams(2) },
  { key: 'List.Clear', params: makeUnknownParams(1) },
  { key: 'List.Count', params: makeUnknownParams(2) },
  { key: 'List.Get', params: makeUnknownParams(4) },
  { key: 'List.RemoveAt', params: makeUnknownParams(2) },
  { key: 'List.Replace', params: makeUnknownParams(3) },
];

export function addListInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}