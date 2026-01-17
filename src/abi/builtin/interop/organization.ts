import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeUnknownParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Organization.RemoveMember', params: makeUnknownParams(3) },
];

export function addOrganizationInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}