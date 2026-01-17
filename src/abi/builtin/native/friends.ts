import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'friends.AddFriend', params: makeParams([['target', 'Address'], ['friend', 'Address']]) },
  { key: 'friends.GetFriends', params: makeParams([['target', 'Address']]), returnType: 'Address[]' },
  { key: 'friends.RemoveFriend', params: makeParams([['target', 'Address'], ['friend', 'Address']]) },
];

export function addFriendsMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}