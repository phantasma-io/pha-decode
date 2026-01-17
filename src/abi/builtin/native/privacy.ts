import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'privacy.PutPrivate', params: makeParams([['from', 'Address'], ['symbol', 'String']]), returnType: 'Number' },
  { key: 'privacy.TakePrivate', params: makeParams([['to', 'Address'], ['symbol', 'String'], ['queueID', 'Number'], ['signature', 'RingSignature']]) },
];

export function addPrivacyMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}