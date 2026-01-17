import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'validator.DemoteValidator', params: makeParams([['from', 'Address'], ['target', 'Address']]) },
  { key: 'validator.GetCurrentValidator', params: makeParams([['tendermintAddress', 'String']]), returnType: 'ValidatorEntry' },
  { key: 'validator.GetIndexOfValidator', params: makeParams([['address', 'Address']]), returnType: 'BigInteger' },
  { key: 'validator.GetMaxPrimaryValidators', params: makeParams([]), returnType: 'BigInteger' },
  { key: 'validator.GetMaxSecondaryValidators', params: makeParams([]), returnType: 'BigInteger' },
  { key: 'validator.GetMaxTotalValidators', params: makeParams([]), returnType: 'Number' },
  { key: 'validator.GetValidatorByIndex', params: makeParams([['index', 'BigInteger']]), returnType: 'ValidatorEntry' },
  { key: 'validator.GetValidatorCount', params: makeParams([['type', 'ValidatorType']]), returnType: 'BigInteger' },
  { key: 'validator.GetValidatorLastActivity', params: makeParams([['target', 'Address']]), returnType: 'Timestamp' },
  { key: 'validator.GetValidatorType', params: makeParams([['address', 'Address']]), returnType: 'ValidatorType' },
  { key: 'validator.GetValidators', params: makeParams([]), returnType: 'ValidatorEntry[]' },
  { key: 'validator.Migrate', params: makeParams([['from', 'Address'], ['to', 'Address']]) },
  { key: 'validator.RegisterValidatorActivity', params: makeParams([['from', 'Address'], ['validatorAddress', 'Address']]) },
  { key: 'validator.SetValidator', params: makeParams([['target', 'Address'], ['index', 'BigInteger'], ['type', 'ValidatorType']]) },
  { key: 'validator.UpdateValidatorActivity', params: makeParams([['from', 'Address']]) },
];

export function addValidatorMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}