import type { BuiltinMethodSpec, BuiltinMethodTable } from '../helpers.js';
import { addMethods, makeParams } from '../helpers.js';

// Built-in native contract methods from Phantasma-NG sources.
export const METHODS: BuiltinMethodSpec[] = [
  { key: 'gas.AllowGas', params: makeParams([['from', 'Address'], ['target', 'Address'], ['price', 'BigInteger'], ['limit', 'BigInteger']]) },
  { key: 'gas.AllowedGas', params: makeParams([['from', 'Address']]), returnType: 'BigInteger' },
  { key: 'gas.ApplyInflation', params: makeParams([['from', 'Address']]) },
  { key: 'gas.FixInflationTiming', params: makeParams([['from', 'Address'], ['lastInflationDate', 'Timestamp']]) },
  { key: 'gas.GetDaysNextUntilDistribution', params: makeParams([]), returnType: 'Number' },
  { key: 'gas.GetDaysUntilDistribution', params: makeParams([]), returnType: 'Number' },
  { key: 'gas.GetLastInflationDate', params: makeParams([]), returnType: 'Timestamp' },
  { key: 'gas.GetNextInflationDate', params: makeParams([]), returnType: 'Timestamp' },
  { key: 'gas.SetEcosystemAddress', params: makeParams([['from', 'Address'], ['ecosystemAddress', 'Address']]) },
  { key: 'gas.SetLeftoversAddress', params: makeParams([['from', 'Address'], ['leftoversAddress', 'Address']]) },
  { key: 'gas.SpendGas', params: makeParams([['from', 'Address']]) },
];

export function addGasMethods(table: BuiltinMethodTable): void {
  addMethods(table, METHODS);
}