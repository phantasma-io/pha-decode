import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'stake.Claim', params: makeParams([['from', 'Address'], ['stakeAddress', 'Address']]) },
  { key: 'stake.FuelToStake', params: makeParams([['fuelAmount', 'BigInteger']]), returnType: 'BigInteger' },
  { key: 'stake.GetAddressVotingPower', params: makeParams([['address', 'Address']]), returnType: 'BigInteger' },
  { key: 'stake.GetClaimMasterCount', params: makeParams([['claimDate', 'Timestamp']]), returnType: 'BigInteger' },
  { key: 'stake.GetLastMasterClaim', params: makeParams([]), returnType: 'Timestamp' },
  { key: 'stake.GetMasterAddresses', params: makeParams([]), returnType: 'Address[]' },
  { key: 'stake.GetMasterClaimDate', params: makeParams([['claimDistance', 'BigInteger']]), returnType: 'Timestamp' },
  { key: 'stake.GetMasterClaimDateForAddress', params: makeParams([['target', 'Address']]), returnType: 'Timestamp' },
  { key: 'stake.GetMasterClaimDateFromReference', params: makeParams([['claimDistance', 'BigInteger'], ['referenceTime', 'Timestamp']]), returnType: 'Timestamp' },
  { key: 'stake.GetMasterCount', params: makeParams([]), returnType: 'BigInteger' },
  { key: 'stake.GetMasterDate', params: makeParams([['target', 'Address']]), returnType: 'Timestamp' },
  { key: 'stake.GetMasterRewards', params: makeParams([['from', 'Address']]), returnType: 'BigInteger' },
  { key: 'stake.GetMasterThreshold', params: makeParams([]), returnType: 'BigInteger' },
  { key: 'stake.GetRate', params: makeParams([]), returnType: 'BigInteger' },
  { key: 'stake.GetStake', params: makeParams([['address', 'Address']]), returnType: 'BigInteger' },
  { key: 'stake.GetStakeTimestamp', params: makeParams([['from', 'Address']]), returnType: 'Timestamp' },
  { key: 'stake.GetStorageStake', params: makeParams([['address', 'Address']]), returnType: 'BigInteger' },
  { key: 'stake.GetTimeBeforeUnstake', params: makeParams([['from', 'Address']]), returnType: 'BigInteger' },
  { key: 'stake.GetUnclaimed', params: makeParams([['from', 'Address']]), returnType: 'BigInteger' },
  { key: 'stake.Initialize', params: makeParams([['from', 'Address']]) },
  { key: 'stake.IsMaster', params: makeParams([['address', 'Address']]), returnType: 'Bool' },
  { key: 'stake.MasterClaim', params: makeParams([['from', 'Address']]) },
  { key: 'stake.Migrate', params: makeParams([['from', 'Address'], ['to', 'Address']]) },
  { key: 'stake.Stake', params: makeParams([['from', 'Address'], ['stakeAmount', 'BigInteger']]) },
  { key: 'stake.StakeToFuel', params: makeParams([['stakeAmount', 'BigInteger']]), returnType: 'BigInteger' },
  { key: 'stake.Unstake', params: makeParams([['from', 'Address'], ['unstakeAmount', 'BigInteger']]) },
  { key: 'stake.UpdateRate', params: makeParams([['rate', 'BigInteger']]) },
];

export function addStakeMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}