import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'sale.AddToWhitelist', params: makeParams([['saleHash', 'Hash'], ['target', 'Address']]) },
  { key: 'sale.CloseSale', params: makeParams([['from', 'Address'], ['saleHash', 'Hash']]) },
  { key: 'sale.EditSalePrice', params: makeParams([['saleHash', 'Hash'], ['price', 'BigInteger']]) },
  { key: 'sale.GetLatestSaleHash', params: makeParams([]), returnType: 'Hash' },
  { key: 'sale.GetPurchasedAmount', params: makeParams([['saleHash', 'Hash'], ['address', 'Address']]), returnType: 'BigInteger' },
  { key: 'sale.GetSale', params: makeParams([['saleHash', 'Hash']]), returnType: 'SaleInfo' },
  { key: 'sale.GetSaleParticipants', params: makeParams([['saleHash', 'Hash']]), returnType: 'Address[]' },
  { key: 'sale.GetSaleWhitelists', params: makeParams([['saleHash', 'Hash']]), returnType: 'Address[]' },
  { key: 'sale.GetSales', params: makeParams([]), returnType: 'SaleInfo[]' },
  { key: 'sale.GetSoldAmount', params: makeParams([['saleHash', 'Hash']]), returnType: 'BigInteger' },
  { key: 'sale.IsSaleActive', params: makeParams([['saleHash', 'Hash']]), returnType: 'Bool' },
  { key: 'sale.IsSeller', params: makeParams([['target', 'Address']]), returnType: 'Bool' },
  { key: 'sale.IsWhitelisted', params: makeParams([['saleHash', 'Hash'], ['address', 'Address']]), returnType: 'Bool' },
  { key: 'sale.Purchase', params: makeParams([['from', 'Address'], ['saleHash', 'Hash'], ['quoteSymbol', 'String'], ['quoteAmount', 'BigInteger']]) },
  { key: 'sale.RemoveFromWhitelist', params: makeParams([['saleHash', 'Hash'], ['target', 'Address']]) },
];

export function addSaleMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}