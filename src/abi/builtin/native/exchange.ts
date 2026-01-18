import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'exchange.AddLiquidity', params: makeParams([['from', 'Address'], ['symbol0', 'String'], ['amount0', 'BigInteger'], ['symbol1', 'String'], ['amount1', 'BigInteger']]) },
  { key: 'exchange.AddLiquidityV1', params: makeParams([['from', 'Address'], ['symbol0', 'String'], ['amount0', 'BigInteger'], ['symbol1', 'String'], ['amount1', 'BigInteger']]) },
  { key: 'exchange.BurnNFT', params: makeParams([['from', 'Address'], ['nftID', 'BigInteger']]) },
  { key: 'exchange.CalculateEscrowSymbol', params: makeParams([['baseToken', 'IToken'], ['quoteToken', 'IToken'], ['side', 'ExchangeOrderSide']]), returnType: 'String' },
  { key: 'exchange.CancelOTCOrder', params: makeParams([['from', 'Address'], ['uid', 'BigInteger']]) },
  { key: 'exchange.CancelOrder', params: makeParams([['uid', 'BigInteger']]) },
  { key: 'exchange.ClaimFees', params: makeParams([['from', 'Address'], ['symbol0', 'String'], ['symbol1', 'String']]) },
  { key: 'exchange.CreatePool', params: makeParams([['from', 'Address'], ['symbol0', 'String'], ['amount0', 'BigInteger'], ['symbol1', 'String'], ['amount1', 'BigInteger']]) },
  { key: 'exchange.CreatePoolV1', params: makeParams([['from', 'Address'], ['symbol0', 'String'], ['amount0', 'BigInteger'], ['symbol1', 'String'], ['amount1', 'BigInteger']]) },
  { key: 'exchange.DepositTokens', params: makeParams([['from', 'Address'], ['symbol', 'String'], ['amount', 'BigInteger']]) },
  { key: 'exchange.GetDexVerion', params: makeParams([]), returnType: 'BigInteger' },
  { key: 'exchange.GetDexVersion', params: makeParams([]), returnType: 'BigInteger' },
  { key: 'exchange.GetExchange', params: makeParams([['address', 'Address']]), returnType: 'ExchangeProvider' },
  { key: 'exchange.GetExchangeID', params: makeParams([['address', 'Address']]), returnType: 'Number' },
  { key: 'exchange.GetExchangeOrder', params: makeParams([['uid', 'BigInteger']]), returnType: 'ExchangeOrder' },
  { key: 'exchange.GetExchanges', params: makeParams([]), returnType: 'ExchangeProvider[]' },
  { key: 'exchange.GetMinimumQuantity', params: makeParams([['tokenDecimals', 'BigInteger']]), returnType: 'BigInteger' },
  { key: 'exchange.GetMinimumSymbolQuantity', params: makeParams([['symbol', 'String']]), returnType: 'BigInteger' },
  { key: 'exchange.GetMinimumTokenQuantity', params: makeParams([['token', 'IToken']]), returnType: 'BigInteger' },
  { key: 'exchange.GetMyNFTID', params: makeParams([['from', 'Address'], ['symbol0', 'String'], ['symbol1', 'String']]), returnType: 'BigInteger' },
  { key: 'exchange.GetMyPoolRAM', params: makeParams([['from', 'Address'], ['symbol0', 'String'], ['symbol1', 'String']]), returnType: 'LPTokenContentRAM' },
  { key: 'exchange.GetOTC', params: makeParams([]), returnType: 'ExchangeOrder[]' },
  { key: 'exchange.GetOrderBook', params: makeParams([['baseSymbol', 'String'], ['quoteSymbol', 'String'], ['side', 'ExchangeOrderSide']]), returnType: 'ExchangeOrder[]' },
  { key: 'exchange.GetOrderBooks', params: makeParams([['baseSymbol', 'String'], ['quoteSymbol', 'String']]), returnType: 'ExchangeOrder[]' },
  { key: 'exchange.GetOrderLeftoverEscrow', params: makeParams([['uid', 'BigInteger']]), returnType: 'BigInteger' },
  { key: 'exchange.GetPool', params: makeParams([['symbol0', 'String'], ['symbol1', 'String']]), returnType: 'Pool' },
  { key: 'exchange.GetPoolBestRoute', params: makeParams([['entrySymbol', 'String'], ['endSymbol', 'String'], ['amount', 'BigInteger']]), returnType: 'PoolRoute' },
  { key: 'exchange.GetPoolRoute', params: makeParams([['entrySymbol', 'String'], ['endSymbol', 'String']]), returnType: 'PoolRoute' },
  { key: 'exchange.GetPools', params: makeParams([]), returnType: 'Pool[]' },
  { key: 'exchange.GetRate', params: makeParams([['fromSymbol', 'String'], ['toSymbol', 'String'], ['amount', 'BigInteger']]), returnType: 'BigInteger' },
  { key: 'exchange.GetTradingVolumeToday', params: makeParams([['symbol0', 'String'], ['symbol1', 'String']]), returnType: 'TradingVolume' },
  { key: 'exchange.GetTradingVolumes', params: makeParams([['symbol0', 'String'], ['symbol1', 'String']]), returnType: 'TradingVolume[]' },
  { key: 'exchange.IsExchange', params: makeParams([['address', 'Address']]), returnType: 'Bool' },
  { key: 'exchange.IsSupportedToken', params: makeParams([['symbol', 'String']]), returnType: 'Bool' },
  { key: 'exchange.Migrate', params: makeParams([]) },
  { key: 'exchange.MigrateToV3', params: makeParams([]) },
  { key: 'exchange.OnMigrate', params: makeParams([['from', 'Address'], ['to', 'Address']]) },
  { key: 'exchange.RemoveLiquidity', params: makeParams([['from', 'Address'], ['symbol0', 'String'], ['amount0', 'BigInteger'], ['symbol1', 'String'], ['amount1', 'BigInteger']]) },
  { key: 'exchange.SwapFee', params: makeParams([['from', 'Address'], ['fromSymbol', 'String'], ['feeAmount', 'BigInteger']]) },
  { key: 'exchange.SwapFiat', params: makeParams([['from', 'Address'], ['fromSymbol', 'String'], ['toSymbol', 'String'], ['worth', 'BigInteger']]) },
  { key: 'exchange.SwapReverse', params: makeParams([['from', 'Address'], ['fromSymbol', 'String'], ['toSymbol', 'String'], ['total', 'BigInteger']]) },
  { key: 'exchange.SwapToken', params: makeParams([['buyer', 'Address'], ['seller', 'Address'], ['baseSymbol', 'String'], ['quoteSymbol', 'String'], ['tokenID', 'BigInteger'], ['price', 'BigInteger'], ['signature', 'Bytes']]) },
  { key: 'exchange.SwapTokens', params: makeParams([['from', 'Address'], ['fromSymbol', 'String'], ['toSymbol', 'String'], ['amount', 'BigInteger']]) },
  { key: 'exchange.TakeOrder', params: makeParams([['from', 'Address'], ['uid', 'BigInteger']]) },
];

export function addExchangeMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}
