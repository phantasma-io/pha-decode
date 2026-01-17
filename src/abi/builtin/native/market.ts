import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'market.BidToken', params: makeParams([['from', 'Address'], ['symbol', 'String'], ['tokenID', 'BigInteger'], ['price', 'BigInteger'], ['buyingFee', 'BigInteger'], ['buyingFeeAddress', 'Address']]) },
  { key: 'market.BuyToken', params: makeParams([['from', 'Address'], ['symbol', 'String'], ['tokenID', 'BigInteger']]) },
  { key: 'market.CancelSale', params: makeParams([['symbol', 'String'], ['tokenID', 'BigInteger']]) },
  { key: 'market.EditAuction', params: makeParams([['from', 'Address'], ['baseSymbol', 'String'], ['quoteSymbol', 'String'], ['tokenID', 'BigInteger'], ['price', 'BigInteger'], ['endPrice', 'BigInteger'], ['startDate', 'Timestamp'], ['endDate', 'Timestamp'], ['extensionPeriod', 'BigInteger']]) },
  { key: 'market.GetAuction', params: makeParams([['symbol', 'String'], ['tokenID', 'BigInteger']]), returnType: 'MarketAuction' },
  { key: 'market.GetAuctions', params: makeParams([]), returnType: 'MarketAuction[]' },
  { key: 'market.HasAuction', params: makeParams([['symbol', 'String'], ['tokenID', 'BigInteger']]), returnType: 'Bool' },
  { key: 'market.IsSeller', params: makeParams([['target', 'Address']]), returnType: 'Bool' },
  { key: 'market.ListToken', params: makeParams([['from', 'Address'], ['baseSymbol', 'String'], ['quoteSymbol', 'String'], ['tokenID', 'BigInteger'], ['price', 'BigInteger'], ['endPrice', 'BigInteger'], ['startDate', 'Timestamp'], ['endDate', 'Timestamp'], ['extensionPeriod', 'BigInteger'], ['typeAuction', 'BigInteger'], ['listingFee', 'BigInteger'], ['listingFeeAddress', 'Address']]) },
  { key: 'market.SellToken', params: makeParams([['from', 'Address'], ['baseSymbol', 'String'], ['quoteSymbol', 'String'], ['tokenID', 'BigInteger'], ['price', 'BigInteger'], ['endDate', 'Timestamp']]) },
];

export function addMarketMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}