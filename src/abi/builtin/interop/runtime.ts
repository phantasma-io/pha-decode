import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeUnknownParams } from '../helpers.js';

// Built-in interop methods from Phantasma-NG ExtCalls.IterateExtcalls.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'Runtime.BurnToken', params: makeUnknownParams(3) },
  { key: 'Runtime.BurnTokens', params: makeUnknownParams(3) },
  { key: 'Runtime.Context', params: makeUnknownParams(0) },
  { key: 'Runtime.ContractExists', params: makeUnknownParams(1) },
  { key: 'Runtime.DeployContract', params: makeUnknownParams(4) },
  { key: 'Runtime.GasTarget', params: makeUnknownParams(0) },
  { key: 'Runtime.GenerateUID', params: makeUnknownParams(0) },
  { key: 'Runtime.GetAvailableNFTSymbols', params: makeUnknownParams(0) },
  { key: 'Runtime.GetAvailableTokenSymbols', params: makeUnknownParams(0) },
  { key: 'Runtime.GetBalance', params: makeUnknownParams(2) },
  { key: 'Runtime.GetOwnerships', params: makeUnknownParams(2) },
  { key: 'Runtime.GetTokenDecimals', params: makeUnknownParams(1) },
  { key: 'Runtime.GetTokenFlags', params: makeUnknownParams(1) },
  { key: 'Runtime.GetTokenSupply', params: makeUnknownParams(1) },
  { key: 'Runtime.InfuseToken', params: makeUnknownParams(5) },
  { key: 'Runtime.IsMinter', params: makeUnknownParams(2) },
  { key: 'Runtime.IsTrigger', params: makeUnknownParams(0) },
  { key: 'Runtime.IsWitness', params: makeUnknownParams(1) },
  { key: 'Runtime.KillContract', params: makeUnknownParams(2) },
  { key: 'Runtime.Log', params: makeUnknownParams(1) },
  { key: 'Runtime.MintToken', params: makeUnknownParams(6) },
  { key: 'Runtime.MintTokens', params: makeUnknownParams(4) },
  { key: 'Runtime.Nexus', params: makeUnknownParams(0) },
  { key: 'Runtime.Notify', params: makeUnknownParams(3) },
  { key: 'Runtime.Notify', params: makeUnknownParams(4) },
  { key: 'Runtime.PreviousContext', params: makeUnknownParams(0) },
  { key: 'Runtime.ReadInfusions', params: makeUnknownParams(2) },
  { key: 'Runtime.ReadToken', params: makeUnknownParams(2) },
  { key: 'Runtime.ReadToken', params: makeUnknownParams(3) },
  { key: 'Runtime.ReadTokenRAM', params: makeUnknownParams(2) },
  { key: 'Runtime.ReadTokenROM', params: makeUnknownParams(2) },
  { key: 'Runtime.SwapTokens', params: makeUnknownParams(5) },
  { key: 'Runtime.Time', params: makeUnknownParams(0) },
  { key: 'Runtime.TokenExists', params: makeUnknownParams(1) },
  { key: 'Runtime.TransactionHash', params: makeUnknownParams(0) },
  { key: 'Runtime.TransferBalance', params: makeUnknownParams(3) },
  { key: 'Runtime.TransferToken', params: makeUnknownParams(4) },
  { key: 'Runtime.TransferTokens', params: makeUnknownParams(4) },
  { key: 'Runtime.UpgradeContract', params: makeUnknownParams(3) },
  { key: 'Runtime.UpgradeContract', params: makeUnknownParams(4) },
  { key: 'Runtime.ValidateAddress', params: makeUnknownParams(4) },
  { key: 'Runtime.Validator', params: makeUnknownParams(0) },
  { key: 'Runtime.Version', params: makeUnknownParams(0) },
  { key: 'Runtime.WriteToken', params: makeUnknownParams(4) },
];

export function addRuntimeInteropMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}