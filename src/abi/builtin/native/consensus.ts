import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'consensus.AddSignatureTransaction', params: makeParams([['from', 'Address'], ['subject', 'String'], ['signature', 'Bytes']]) },
  { key: 'consensus.CreateTransaction', params: makeParams([['from', 'Address'], ['subject', 'String'], ['transaction', 'Transaction'], ['listOfUsers', 'Address[]']]) },
  { key: 'consensus.DeleteTransaction', params: makeParams([['addresses', 'Address[]'], ['subject', 'String']]) },
  { key: 'consensus.ExecuteTransaction', params: makeParams([['from', 'Address'], ['subject', 'String']]) },
  { key: 'consensus.GetAddressesForTransaction', params: makeParams([['from', 'Address'], ['subject', 'String']]), returnType: 'Address[]' },
  { key: 'consensus.GetConsensusPoll', params: makeParams([['subject', 'String']]), returnType: 'ConsensusPoll' },
  { key: 'consensus.GetConsensusPolls', params: makeParams([]), returnType: 'ConsensusPoll[]' },
  { key: 'consensus.GetRank', params: makeParams([['subject', 'String'], ['value', 'Bytes']]), returnType: 'BigInteger' },
  { key: 'consensus.GetTransaction', params: makeParams([['from', 'Address'], ['subject', 'String']]), returnType: 'Transaction' },
  { key: 'consensus.HasConsensus', params: makeParams([['subject', 'String'], ['value', 'Bytes']]), returnType: 'Bool' },
  { key: 'consensus.Migrate', params: makeParams([['from', 'Address'], ['target', 'Address']]) },
  { key: 'consensus.MultiVote', params: makeParams([['from', 'Address'], ['subject', 'String'], ['choices', 'PollVote[]']]) },
  { key: 'consensus.RemoveVotes', params: makeParams([['from', 'Address'], ['subject', 'String']]) },
  { key: 'consensus.SingleVote', params: makeParams([['from', 'Address'], ['subject', 'String'], ['index', 'BigInteger']]) },
  { key: 'consensus.UpdatePollStatus', params: makeParams([['from', 'Address'], ['subject', 'String']]) },
];

export function addConsensusMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}