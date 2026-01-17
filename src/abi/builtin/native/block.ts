import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'block.IsSettled', params: makeParams([['hash', 'Hash']]), returnType: 'Bool' },
  { key: 'block.SettleTransaction', params: makeParams([['sourceChainAddress', 'Address'], ['hash', 'Hash']]) },
];

export function addBlockMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}