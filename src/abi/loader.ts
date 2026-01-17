import { promises as fs } from 'fs';
import path from 'path';

export interface AbiParamSpec {
  name: string;
  type: string;
}

export interface AbiMethodSpec {
  params: AbiParamSpec[];
  returnType?: string;
}

export type AbiMethodSpecEntry = AbiMethodSpec | AbiMethodSpec[];

export interface AbiLoadResult {
  methods: Map<string, AbiMethodSpecEntry>;
  warnings: string[];
}

export interface AbiMergeOptions {
  warnOnDuplicate?: boolean;
  replaceSameArity?: boolean;
}

// ABI input supports either a single contract object, an array of contracts,
// or an object with `contracts: [...]` (matching common RPC ABI shapes).
export interface AbiMethodLike {
  name?: string;
  Name?: string;
  parameters?: unknown[];
  Parameters?: unknown[];
  returnType?: string;
  ReturnType?: string;
}

export interface AbiContractLike {
  name?: string;
  Name?: string;
  methods?: AbiMethodLike[];
  Methods?: AbiMethodLike[];
}

function extractContracts(obj: unknown): AbiContractLike[] {
  if (!obj || typeof obj !== 'object') {
    return [];
  }

  if (Array.isArray(obj)) {
    return obj as AbiContractLike[];
  }

  const record = obj as Record<string, unknown>;
  if (Array.isArray(record.contracts)) {
    return record.contracts as AbiContractLike[];
  }
  if (Array.isArray(record.Contracts)) {
    return record.Contracts as AbiContractLike[];
  }

  if (
    (typeof record.name === 'string' || typeof record.Name === 'string') &&
    (Array.isArray(record.methods) || Array.isArray(record.Methods))
  ) {
    return [record as AbiContractLike];
  }

  return [];
}

function normalizeName(value?: string): string {
  return (value ?? '').trim();
}

// ABI JSON can come from different sources (RPC, exported ABI files) and uses mixed casing.
// Normalize parameter names/types so downstream decoding can rely on a consistent shape.
function extractMethodParams(method: AbiMethodLike, warnings: string[], key: string): AbiParamSpec[] {
  const params = (method.parameters ?? method.Parameters ?? []) as unknown[];
  const out: AbiParamSpec[] = [];
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const record = (param ?? {}) as Record<string, unknown>;
    const rawName = record.name ?? record.Name;
    const rawType = record.type ?? record.Type;
    const name = normalizeName(typeof rawName === 'string' ? rawName : '');
    const type = normalizeName(typeof rawType === 'string' ? rawType : '');
    if (!name) {
      warnings.push(`ABI parameter missing name at ${key}[${i}]`);
    }
    if (!type) {
      warnings.push(`ABI parameter missing type at ${key}[${i}]`);
    }
    out.push({
      name: name || `arg${i}`,
      type: type || 'Unknown',
    });
  }
  return out;
}

function mergeMethodEntry(
  methods: Map<string, AbiMethodSpecEntry>,
  key: string,
  spec: AbiMethodSpec,
  warnings: string[],
  source: string,
  options?: AbiMergeOptions
): void {
  if (methods.has(key)) {
    const existing = methods.get(key);
    if (existing) {
      if (options?.replaceSameArity) {
        // Replace only the matching arity so builtin "Unknown" specs are overridden by real ABI data.
        const existingSpecs = Array.isArray(existing) ? existing : [existing];
        const filtered = existingSpecs.filter(
          (candidate) => candidate.params.length !== spec.params.length
        );
        if (filtered.length === 0) {
          methods.set(key, spec);
        } else if (filtered.length === 1) {
          const [first] = filtered;
          if (first) {
            methods.set(key, [first, spec]);
          } else {
            methods.set(key, spec);
          }
        } else {
          methods.set(key, [...filtered, spec]);
        }
        return;
      }

      if (options?.warnOnDuplicate ?? true) {
        warnings.push(`ABI duplicate method ${key} (${source})`);
      }

      if (Array.isArray(existing)) {
        existing.push(spec);
        methods.set(key, existing);
      } else {
        methods.set(key, [existing, spec]);
      }
      return;
    }
  }
  methods.set(key, spec);
}

export function buildMethodTable(contracts: AbiContractLike[], source: string): AbiLoadResult {
  const warnings: string[] = [];
  const methods = new Map<string, AbiMethodSpecEntry>();

  for (const contract of contracts) {
    const contractName = normalizeName(contract.name ?? contract.Name);
    if (!contractName) {
      warnings.push(`ABI contract missing name (${source})`);
      continue;
    }

    const methodList = contract.methods ?? contract.Methods ?? [];
    for (const method of methodList) {
      const methodName = normalizeName(method.name ?? method.Name);
      if (!methodName) {
        warnings.push(`ABI method missing name in ${contractName} (${source})`);
        continue;
      }

      const key = `${contractName}.${methodName}`;
      const returnType = normalizeName(method.returnType ?? method.ReturnType);
      const spec: AbiMethodSpec = {
        params: extractMethodParams(method, warnings, key),
      };
      if (returnType) {
        spec.returnType = returnType;
      }
      mergeMethodEntry(methods, key, spec, warnings, source);
    }
  }

  return { methods, warnings };
}

export function mergeMethodTables(
  target: Map<string, AbiMethodSpecEntry>,
  incoming: Map<string, AbiMethodSpecEntry>,
  warnings: string[],
  source: string,
  options?: AbiMergeOptions
): void {
  for (const [key, value] of incoming.entries()) {
    if (Array.isArray(value)) {
      for (const spec of value) {
        mergeMethodEntry(target, key, spec, warnings, source, options);
      }
    } else {
      mergeMethodEntry(target, key, value, warnings, source, options);
    }
  }
}

async function loadAbiFromFile(filePath: string): Promise<AbiLoadResult> {
  const warnings: string[] = [];

  const raw = await fs.readFile(filePath, 'utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse ABI JSON: ${filePath}`);
  }

  const contracts = extractContracts(parsed);
  if (contracts.length === 0) {
    warnings.push(`ABI file has no contracts: ${filePath}`);
  }

  const result = buildMethodTable(contracts, path.basename(filePath));
  warnings.push(...result.warnings);

  return { methods: result.methods, warnings };
}

export async function loadAbi(pathInput: string): Promise<AbiLoadResult> {
  const warnings: string[] = [];
  const methods = new Map<string, AbiMethodSpecEntry>();

  const stat = await fs.stat(pathInput);
  if (stat.isDirectory()) {
    const entries = await fs.readdir(pathInput);
    for (const entry of entries) {
      if (!entry.toLowerCase().endsWith('.json')) {
        continue;
      }
      const filePath = path.join(pathInput, entry);
      const result = await loadAbiFromFile(filePath);
      mergeMethodTables(methods, result.methods, warnings, entry);
      warnings.push(...result.warnings);
    }
    return { methods, warnings };
  }

  const fileResult = await loadAbiFromFile(pathInput);
  return {
    methods: fileResult.methods,
    warnings: [...warnings, ...fileResult.warnings],
  };
}
