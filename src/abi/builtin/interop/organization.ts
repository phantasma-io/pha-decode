import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Organization.RemoveMember', params: makeParams([['source', 'Address'], ['name', 'String'], ['target', 'Address']]) },
];

export function addOrganizationInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}
