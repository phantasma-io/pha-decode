import type { AbiMethodSpec, AbiMethodSpecEntry, AbiParamSpec } from '../loader.js';

export interface BuiltinMethodSpec {
  key: string;
  params: AbiParamSpec[];
  returnType?: string;
}

export type BuiltinMethodTable = Map<string, AbiMethodSpecEntry>;

export function makeParams(entries: Array<[string, string]>): AbiParamSpec[] {
  return entries.map(([name, type]) => ({ name, type }));
}

export function makeUnknownParams(count: number): AbiParamSpec[] {
  const params: AbiParamSpec[] = [];
  for (let i = 0; i < count; i++) {
    params.push({ name: `arg${i}`, type: 'Unknown' });
  }
  return params;
}

function mergeEntry(existing: AbiMethodSpecEntry, incoming: AbiMethodSpec): AbiMethodSpecEntry {
  if (Array.isArray(existing)) {
    return [...existing, incoming];
  }
  return [existing, incoming];
}

function isSameSpec(a: AbiMethodSpec, b: AbiMethodSpec): boolean {
  if (a.params.length !== b.params.length) {
    return false;
  }
  if ((a.returnType ?? '') !== (b.returnType ?? '')) {
    return false;
  }
  for (let i = 0; i < a.params.length; i++) {
    const left = a.params[i];
    const right = b.params[i];
    if (!left || !right) {
      return false;
    }
    if (left.name !== right.name || left.type !== right.type) {
      return false;
    }
  }
  return true;
}

export function addMethods(
  table: BuiltinMethodTable,
  methods: BuiltinMethodSpec[]
): void {
  for (const method of methods) {
    const spec: AbiMethodSpec = { params: method.params };
    if (method.returnType) {
      spec.returnType = method.returnType;
    }
    const existing = table.get(method.key);
    if (!existing) {
      table.set(method.key, spec);
      continue;
    }
    // Some interop sources repeat entries verbatim; avoid creating ambiguous overloads.
    const existingSpecs = Array.isArray(existing) ? existing : [existing];
    if (existingSpecs.some((candidate) => isSameSpec(candidate, spec))) {
      continue;
    }
    table.set(method.key, mergeEntry(existing, spec));
  }
}
