import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'mail.DomainExists', params: makeParams([['domainName', 'String']]), returnType: 'Bool' },
  { key: 'mail.GetDomainUsers', params: makeParams([['domainName', 'String']]), returnType: 'Address[]' },
  { key: 'mail.GetUserDomain', params: makeParams([['target', 'Address']]), returnType: 'String' },
  { key: 'mail.JoinDomain', params: makeParams([['from', 'Address'], ['domainName', 'String']]) },
  { key: 'mail.LeaveDomain', params: makeParams([['from', 'Address'], ['domainName', 'String']]) },
  { key: 'mail.MigrateDomain', params: makeParams([['domainName', 'String'], ['target', 'Address']]) },
  { key: 'mail.PushMessage', params: makeParams([['from', 'Address'], ['target', 'Address'], ['archiveHash', 'Hash']]) },
  { key: 'mail.RegisterDomain', params: makeParams([['from', 'Address'], ['domainName', 'String']]) },
  { key: 'mail.UnregisterDomain', params: makeParams([['domainName', 'String']]) },
  { key: 'mail.getDomainGroups', params: makeParams([['domainName', 'String']]), returnType: 'String[]' },
  { key: 'mail.getGroupUsers', params: makeParams([]) },
  { key: 'mail.joinGroup', params: makeParams([]) },
  { key: 'mail.leaveGroup', params: makeParams([]) },
  { key: 'mail.registerGroup', params: makeParams([]) },
  { key: 'mail.unregisterGroup', params: makeParams([]) },
];

export function addMailMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}