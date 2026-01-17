import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'interop.AcceptCrossChainTransfer', params: makeParams([['from', 'Address'], ['platform', 'String'], ['identifier', 'String']]) },
  { key: 'interop.BetOnCrossChainSwap', params: makeParams([['from', 'Address'], ['identifier', 'String'], ['platform', 'String'], ['BetFee', 'BigInteger']]) },
  { key: 'interop.CompleteCrossChainTransfer', params: makeParams([['from', 'Address'], ['platform', 'String'], ['identifier', 'String'], ['hash', 'Hash']]) },
  { key: 'interop.CompleteInternalCrossChainTransfer', params: makeParams([['from', 'Address'], ['platform', 'String'], ['identifier', 'String']]) },
  { key: 'interop.GetAllCrossChainBets', params: makeParams([]), returnType: 'CrossChainTransfer[]' },
  { key: 'interop.GetAllCrossChainTransfers', params: makeParams([]), returnType: 'CrossChainTransfer[]' },
  { key: 'interop.GetAllPlatforms', params: makeParams([]), returnType: 'PlatformDetails[]' },
  { key: 'interop.GetAvailableMainSwappers', params: makeParams([['platform', 'String'], ['symbol', 'String']]), returnType: 'PlatformDetails[]' },
  { key: 'interop.GetAvailableSwappers', params: makeParams([['platform', 'String'], ['symbol', 'String']]), returnType: 'PlatformDetails[]' },
  { key: 'interop.GetBetsForTransaction', params: makeParams([['crossChainSwap', 'CrossChainTransfer']]), returnType: 'Bet[]' },
  { key: 'interop.GetCrossChainBet', params: makeParams([['identifier', 'String']]), returnType: 'CrossChainTransfer' },
  { key: 'interop.GetCrossChainSwapAddressToSwap', params: makeParams([['from', 'Address'], ['platform', 'String'], ['symbol', 'String']]), returnType: 'String' },
  { key: 'interop.GetCrossChainTransfers', params: makeParams([]), returnType: 'CrossChainTransfer[]' },
  { key: 'interop.GetCrossChainTransfersForSwapper', params: makeParams([['swapper', 'Address']]), returnType: 'CrossChainTransfer[]' },
  { key: 'interop.GetCrossChainTransfersForUser', params: makeParams([['from', 'Address']]), returnType: 'CrossChainTransfer[]' },
  { key: 'interop.GetExternalCrossChainTranfersForUser', params: makeParams([['from', 'Address']]), returnType: 'CrossChainTransfer[]' },
  { key: 'interop.GetExternalCrossChainTransfersForSwapper', params: makeParams([['swapper', 'Address']]), returnType: 'CrossChainTransfer[]' },
  { key: 'interop.GetLowestFeeForBet', params: makeParams([['from', 'Address'], ['identifier', 'String'], ['platform', 'String']]), returnType: 'BigInteger' },
  { key: 'interop.GetPlatformDetailsForAddress', params: makeParams([['from', 'Address'], ['platform', 'String']]), returnType: 'PlatformDetails' },
  { key: 'interop.GetPlatformsForAddress', params: makeParams([['from', 'Address']]), returnType: 'PlatformDetails[]' },
  { key: 'interop.GetSettlement', params: makeParams([['platformName', 'String'], ['hash', 'Hash']]), returnType: 'Hash' },
  { key: 'interop.GetStatus', params: makeParams([['platformName', 'String'], ['hash', 'Hash']]), returnType: 'InteropTransferStatus' },
  { key: 'interop.GetSwapsForAddress', params: makeParams([['address', 'Address']]), returnType: 'InteropHistory[]' },
  { key: 'interop.HasCrossChainTransfer', params: makeParams([['from', 'Address'], ['hash', 'Hash']]), returnType: 'Bool' },
  { key: 'interop.HasPlatformInfo', params: makeParams([['from', 'Address'], ['platform', 'String']]), returnType: 'Bool' },
  { key: 'interop.RegisterAddress', params: makeParams([['from', 'Address'], ['platform', 'String'], ['localAddress', 'Address'], ['externalAddress', 'String']]) },
  { key: 'interop.RemoveTokenFromPlatform', params: makeParams([['from', 'Address'], ['platform', 'String'], ['symbol', 'String']]) },
  { key: 'interop.SettleTransaction', params: makeParams([['from', 'Address'], ['platform', 'String'], ['chain', 'String'], ['hash', 'Hash']]) },
  { key: 'interop.WithdrawTokens', params: makeParams([['from', 'Address'], ['to', 'Address'], ['symbol', 'String'], ['value', 'BigInteger']]) },
];

export function addInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}