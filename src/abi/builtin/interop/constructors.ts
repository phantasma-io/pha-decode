import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeUnknownParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'ABI()', params: makeUnknownParams(1) },
  { key: 'Address()', params: makeUnknownParams(1) },
  { key: 'Hash()', params: makeUnknownParams(1) },
  { key: 'Timestamp()', params: makeUnknownParams(1) },
];

export function addConstructorsInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}