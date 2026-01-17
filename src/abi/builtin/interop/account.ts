import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeUnknownParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Account.LastActivity', params: makeUnknownParams(1) },
  { key: 'Account.Name', params: makeUnknownParams(1) },
  { key: 'Account.Transactions', params: makeUnknownParams(1) },
];

export function addAccountInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}