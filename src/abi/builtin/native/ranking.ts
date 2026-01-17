import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'ranking.CreateLeaderboard', params: makeParams([['from', 'Address'], ['name', 'String'], ['size', 'BigInteger']]) },
  { key: 'ranking.Exists', params: makeParams([['name', 'String']]), returnType: 'Bool' },
  { key: 'ranking.GetAddressByIndex', params: makeParams([['name', 'String'], ['index', 'BigInteger']]), returnType: 'Address' },
  { key: 'ranking.GetLeaderboard', params: makeParams([['name', 'String']]), returnType: 'Leaderboard' },
  { key: 'ranking.GetRows', params: makeParams([['name', 'String']]), returnType: 'LeaderboardRow[]' },
  { key: 'ranking.GetScoreByAddress', params: makeParams([['name', 'String'], ['target', 'Address']]), returnType: 'BigInteger' },
  { key: 'ranking.GetScoreByIndex', params: makeParams([['name', 'String'], ['index', 'BigInteger']]), returnType: 'BigInteger' },
  { key: 'ranking.GetSize', params: makeParams([['name', 'String']]), returnType: 'BigInteger' },
  { key: 'ranking.InsertScore', params: makeParams([['from', 'Address'], ['target', 'Address'], ['name', 'String'], ['score', 'BigInteger']]) },
  { key: 'ranking.ResetLeaderboard', params: makeParams([['from', 'Address'], ['name', 'String']]) },
];

export function addRankingMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}