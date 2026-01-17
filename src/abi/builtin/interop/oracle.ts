import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeUnknownParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Oracle.Price', params: makeUnknownParams(1) },
  { key: 'Oracle.Quote', params: makeUnknownParams(3) },
  { key: 'Oracle.Read', params: makeUnknownParams(1) },
];

export function addOracleInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}