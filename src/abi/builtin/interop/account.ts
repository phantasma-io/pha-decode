import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Account.LastActivity', params: makeParams([['address', 'Address']]) },
  { key: 'Account.Name', params: makeParams([['address', 'Address']]) },
  { key: 'Account.Transactions', params: makeParams([['address', 'Address']]) },
];

export function addAccountInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}
