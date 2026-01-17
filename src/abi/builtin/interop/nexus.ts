import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeUnknownParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Nexus.BeginInit', params: makeUnknownParams(1) },
  { key: 'Nexus.CreateOrganization', params: makeUnknownParams(4) },
  { key: 'Nexus.CreateToken', params: makeUnknownParams(3) },
  { key: 'Nexus.CreateTokenSeries', params: makeUnknownParams(7) },
  { key: 'Nexus.EndInit', params: makeUnknownParams(1) },
  { key: 'Nexus.GetGovernanceValue', params: makeUnknownParams(1) },
];

export function addNexusInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}