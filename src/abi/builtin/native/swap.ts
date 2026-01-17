import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'swap.DepositTokens', params: makeParams([['from', 'Address'], ['symbol', 'String'], ['amount', 'BigInteger']]) },
  { key: 'swap.GetRate', params: makeParams([['fromSymbol', 'String'], ['toSymbol', 'String'], ['amount', 'BigInteger']]), returnType: 'BigInteger' },
  { key: 'swap.IsSupportedToken', params: makeParams([['symbol', 'String']]), returnType: 'Bool' },
  { key: 'swap.SwapFee', params: makeParams([['from', 'Address'], ['fromSymbol', 'String'], ['feeAmount', 'BigInteger']]) },
  { key: 'swap.SwapReverse', params: makeParams([['from', 'Address'], ['fromSymbol', 'String'], ['toSymbol', 'String'], ['total', 'BigInteger']]) },
  { key: 'swap.SwapTokens', params: makeParams([['from', 'Address'], ['fromSymbol', 'String'], ['toSymbol', 'String'], ['amount', 'BigInteger']]) },
  { key: 'swap.SwapTokensV2', params: makeParams([['from', 'Address'], ['fromSymbol', 'String'], ['toSymbol', 'String'], ['amount', 'BigInteger']]) },
];

export function addSwapMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}