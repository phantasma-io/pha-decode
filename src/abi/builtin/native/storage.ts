import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'storage.AddFile', params: makeParams([['from', 'Address'], ['target', 'Address'], ['archiveHash', 'Hash']]) },
  { key: 'storage.AddPermission', params: makeParams([['from', 'Address'], ['externalAddr', 'Address']]) },
  { key: 'storage.CalculateStorageSizeForStake', params: makeParams([['stakeAmount', 'BigInteger']]), returnType: 'BigInteger' },
  { key: 'storage.CreateFile', params: makeParams([['target', 'Address'], ['fileName', 'String'], ['fileSize', 'BigInteger'], ['contentMerkle', 'Bytes'], ['encryptionContent', 'Bytes']]) },
  { key: 'storage.DeleteData', params: makeParams([['target', 'Address'], ['key', 'Bytes']]) },
  { key: 'storage.DeleteFile', params: makeParams([['from', 'Address'], ['targetHash', 'Hash']]) },
  { key: 'storage.DeletePermission', params: makeParams([['from', 'Address'], ['externalAddr', 'Address']]) },
  { key: 'storage.GetAvailableSpace', params: makeParams([['from', 'Address']]), returnType: 'BigInteger' },
  { key: 'storage.GetFiles', params: makeParams([['from', 'Address']]), returnType: 'Hash[]' },
  { key: 'storage.GetUsedDataQuota', params: makeParams([['address', 'Address']]), returnType: 'BigInteger' },
  { key: 'storage.GetUsedSpace', params: makeParams([['from', 'Address']]), returnType: 'BigInteger' },
  { key: 'storage.HasFile', params: makeParams([['target', 'Address'], ['hash', 'Hash']]), returnType: 'Bool' },
  { key: 'storage.HasPermission', params: makeParams([['external', 'Address'], ['target', 'Address']]), returnType: 'Bool' },
  { key: 'storage.Migrate', params: makeParams([['from', 'Address'], ['target', 'Address']]) },
  { key: 'storage.MigratePermission', params: makeParams([['target', 'Address'], ['oldAddr', 'Address'], ['newAddr', 'Address']]) },
  { key: 'storage.WriteData', params: makeParams([['target', 'Address'], ['key', 'Bytes'], ['value', 'Bytes']]) },
];

export function addStorageMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}