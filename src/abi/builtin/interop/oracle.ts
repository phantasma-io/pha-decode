import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Oracle.Price', params: makeParams([['symbol', 'String']]) },
  { key: 'Oracle.Quote', params: makeParams([['amount', 'BigInteger'], ['quoteSymbol', 'String'], ['baseSymbol', 'String']]) },
  { key: 'Oracle.Read', params: makeParams([['url', 'String']]) },
];

export function addOracleInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}
