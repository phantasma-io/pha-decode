import { Address, bytesToHex, hexToBytes, twosComplementLEToBigInt, VMType } from 'phantasma-sdk-ts';
import type { JsonValue, VmInstruction, VmMethodCall, VmMethodCallArg } from '../types/decoded.js';
import type { AbiMethodSpec, AbiMethodSpecEntry, AbiParamSpec } from '../abi/loader.js';

export interface VmDisasmResult {
  instructions: VmInstruction[];
  methodCalls: VmMethodCall[];
  warnings: string[];
}

// Opcode mapping mirrors the legacy VM enum (Phantasma-NG) so disassembly matches old scripts.
const OPCODE_NAME: Record<number, string> = {
  0: 'NOP',
  1: 'MOVE',
  2: 'COPY',
  3: 'PUSH',
  4: 'POP',
  5: 'SWAP',
  6: 'CALL',
  7: 'EXTCALL',
  8: 'JMP',
  9: 'JMPIF',
  10: 'JMPNOT',
  11: 'RET',
  12: 'THROW',
  13: 'LOAD',
  14: 'CAST',
  15: 'CAT',
  16: 'RANGE',
  17: 'LEFT',
  18: 'RIGHT',
  19: 'SIZE',
  20: 'COUNT',
  21: 'NOT',
  22: 'AND',
  23: 'OR',
  24: 'XOR',
  25: 'EQUAL',
  26: 'LT',
  27: 'GT',
  28: 'LTE',
  29: 'GTE',
  30: 'INC',
  31: 'DEC',
  32: 'SIGN',
  33: 'NEGATE',
  34: 'ABS',
  35: 'ADD',
  36: 'SUB',
  37: 'MUL',
  38: 'DIV',
  39: 'MOD',
  40: 'SHL',
  41: 'SHR',
  42: 'MIN',
  43: 'MAX',
  44: 'POW',
  45: 'CTX',
  46: 'SWITCH',
  47: 'PUT',
  48: 'GET',
  49: 'CLEAR',
  50: 'UNPACK',
  51: 'PACK',
  52: 'DEBUG',
  53: 'SUBSTR',
  54: 'REMOVE',
  255: 'EVM',
};

function opcodeName(opcode: number): string {
  return OPCODE_NAME[opcode] ?? `OP_${opcode}`;
}

function vmTypeName(type: number): string {
  return VMType[type] ?? `VMType_${type}`;
}

function expectedInteropArity(key: string, protocolVersion: number): number | undefined {
  // Some interop methods changed arity across protocol versions; use this to warn on mismatches.
  switch (key) {
    case 'Runtime.Notify':
      return protocolVersion < 19 ? 3 : 4;
    case 'Runtime.ReadToken':
      return protocolVersion < 15 ? 2 : 3;
    case 'Runtime.UpgradeContract':
      return protocolVersion < 14 ? 3 : 4;
    default:
      return undefined;
  }
}

function warnOnProtocolArityMismatch(
  key: string,
  protocolVersion: number | undefined,
  actualCount: number,
  warnings: string[]
): void {
  if (protocolVersion === undefined) {
    return;
  }
  const expected = expectedInteropArity(key, protocolVersion);
  if (expected === undefined || expected === actualCount) {
    return;
  }
  warnings.push(
    `protocol ${protocolVersion} expects ${expected} args for ${key}; script provides ${actualCount}`
  );
}

class ScriptReader {
  private offset = 0;
  constructor(private readonly bytes: Uint8Array) {}

  read8(): number {
    if (this.offset >= this.bytes.length) {
      throw new Error('VM disassembler read past end of script');
    }
    const value = this.bytes[this.offset];
    if (value === undefined) {
      throw new Error('VM disassembler read past end of script');
    }
    this.offset += 1;
    return value;
  }

  read16(): number {
    const a = this.read8();
    const b = this.read8();
    return a + (b << 8);
  }

  read32(): number {
    const a = this.read8();
    const b = this.read8();
    const c = this.read8();
    const d = this.read8();
    return (a + (b << 8) + (c << 16) + (d << 24)) >>> 0;
  }

  read64(): bigint {
    const a = BigInt(this.read8());
    const b = BigInt(this.read8());
    const c = BigInt(this.read8());
    const d = BigInt(this.read8());
    const e = BigInt(this.read8());
    const f = BigInt(this.read8());
    const g = BigInt(this.read8());
    const h = BigInt(this.read8());
    return a + (b << 8n) + (c << 16n) + (d << 24n) + (e << 32n) + (f << 40n) + (g << 48n) + (h << 56n);
  }

  // VM varint encoding uses 0xFD/0xFE/0xFF prefixes (little-endian).
  readVar(max: number): number {
    const prefix = this.read8();
    let value: bigint;
    switch (prefix) {
      case 0xfd:
        value = BigInt(this.read16());
        break;
      case 0xfe:
        value = BigInt(this.read32());
        break;
      case 0xff:
        value = this.read64();
        break;
      default:
        value = BigInt(prefix);
        break;
    }
    if (value > BigInt(max)) {
      throw new Error('VM disassembler varint exceeds max');
    }
    return Number(value);
  }

  readBytes(length: number): Uint8Array {
    if (this.offset + length > this.bytes.length) {
      throw new Error('VM disassembler read past end of script');
    }
    const out = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return out;
  }

  get position(): number {
    return this.offset;
  }
}

interface Instruction {
  offset: number;
  opcode: number;
  args: unknown[];
}

class VmValue {
  constructor(public type: VMType, public data: unknown) {}

  static fromBytes(type: VMType, bytes: Uint8Array): VmValue {
    // VM values are stored as raw byte arrays; convert using VMType rules.
    switch (type) {
      case VMType.Bytes:
        return new VmValue(type, bytes);
      case VMType.Number:
        return new VmValue(type, twosComplementLEToBigInt(bytes));
      case VMType.String:
        return new VmValue(type, new TextDecoder().decode(bytes));
      case VMType.Enum: {
        if (bytes.length < 4) {
          throw new Error('VM enum value requires 4 bytes');
        }
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        return new VmValue(type, view.getUint32(0, true));
      }
      case VMType.Timestamp: {
        if (bytes.length < 4) {
          throw new Error('VM timestamp requires 4 bytes');
        }
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        return new VmValue(type, view.getUint32(0, true));
      }
      case VMType.Bool:
        return new VmValue(type, bytes.length > 0 && bytes[0] !== 0);
      default:
        if (bytes.length === Address.LengthInBytes) {
          return new VmValue(type, Address.FromBytes(bytes));
        }
        return new VmValue(type, bytes);
    }
  }

  clone(): VmValue {
    if (this.data instanceof Uint8Array) {
      return new VmValue(this.type, new Uint8Array(this.data));
    }
    return new VmValue(this.type, this.data);
  }

  asString(): string {
    switch (this.type) {
      case VMType.String:
        return String(this.data);
      case VMType.Number:
        return (this.data as bigint).toString();
      case VMType.Bytes:
        return new TextDecoder().decode(this.data as Uint8Array);
      case VMType.Enum:
        return String(this.data as number);
      case VMType.Bool:
        return (this.data as boolean) ? 'true' : 'false';
      case VMType.Timestamp:
        return String(this.data as number);
      case VMType.Object:
        if (this.data instanceof Address) {
          return this.data.Text;
        }
        return `Interop:${typeof this.data}`;
      default:
        return String(this.data ?? '');
    }
  }

  toJson(): VmMethodCallArg {
    if (this.type === VMType.Bytes && this.data instanceof Uint8Array) {
      return { vmType: vmTypeName(this.type), value: bytesToHex(this.data) };
    }
    if (this.type === VMType.Object && this.data instanceof Address) {
      return { vmType: vmTypeName(this.type), value: this.data.Text };
    }
    if (this.type === VMType.Number) {
      return { vmType: vmTypeName(this.type), value: (this.data as bigint).toString() };
    }
    return { vmType: vmTypeName(this.type), value: this.data as JsonValue };
  }
}

// Pretty display for LOAD values: show string/number, otherwise raw bytes.
function decodeLoadValue(type: VMType, bytes: Uint8Array): JsonValue {
  switch (type) {
    case VMType.String:
      return new TextDecoder().decode(bytes);
    case VMType.Number:
      return twosComplementLEToBigInt(bytes).toString();
    default:
      return bytesToHex(bytes);
  }
}

function instructionToOutput(instruction: Instruction): VmInstruction {
  const name = opcodeName(instruction.opcode);
  const args: JsonValue[] = [];
  if (name === 'LOAD') {
    const dst = instruction.args[0] as number;
    const type = instruction.args[1] as number;
    const bytes = instruction.args[2] as Uint8Array;
    args.push(dst, vmTypeName(type), decodeLoadValue(type as VMType, bytes));
  } else {
    for (const arg of instruction.args) {
      if (arg instanceof Uint8Array) {
        args.push(Array.from(arg));
      } else if (typeof arg === 'number') {
        args.push(arg);
      } else if (typeof arg === 'string') {
        args.push(arg);
      } else if (typeof arg === 'bigint') {
        args.push(arg.toString());
      } else {
        args.push(String(arg));
      }
    }
  }
  return {
    offset: instruction.offset,
    opcode: instruction.opcode,
    opcodeName: name,
    args,
  };
}

// Low-level VM bytecode parser. Keeps raw LOAD bytes for later arg decoding.
function disassembleScript(bytes: Uint8Array): Instruction[] {
  const reader = new ScriptReader(bytes);
  const instructions: Instruction[] = [];

  while (reader.position < bytes.length) {
    const offset = reader.position;
    const opcode = reader.read8();
    const opName = opcodeName(opcode);
    const args: unknown[] = [];

    switch (opName) {
      case 'RET':
        instructions.push({ offset, opcode, args: [] });
        return instructions;

      case 'CTX':
      case 'MOVE':
      case 'COPY':
      case 'SWAP':
      case 'SIZE':
      case 'COUNT':
      case 'SIGN':
      case 'NOT':
      case 'NEGATE':
      case 'ABS':
      case 'UNPACK':
      case 'REMOVE': {
        const src = reader.read8();
        const dst = reader.read8();
        args.push(src, dst);
        break;
      }

      case 'LOAD': {
        const dst = reader.read8();
        const type = reader.read8();
        const len = reader.readVar(0xffff);
        const bytesValue = reader.readBytes(len);
        args.push(dst, type, bytesValue);
        break;
      }

      case 'CAST': {
        const src = reader.read8();
        const dst = reader.read8();
        const type = reader.read8();
        args.push(src, dst, vmTypeName(type));
        break;
      }

      case 'POP':
      case 'PUSH':
      case 'EXTCALL':
      case 'THROW':
      case 'CLEAR': {
        const src = reader.read8();
        args.push(src);
        break;
      }

      case 'CALL': {
        const count = reader.read8();
        const ofs = reader.read16();
        args.push(count, ofs);
        break;
      }

      case 'JMP': {
        const newPos = reader.read16();
        args.push(newPos);
        break;
      }

      case 'JMPIF':
      case 'JMPNOT': {
        const src = reader.read8();
        const newPos = reader.read16();
        args.push(src, newPos);
        break;
      }

      case 'AND':
      case 'OR':
      case 'XOR':
      case 'CAT':
      case 'EQUAL':
      case 'LT':
      case 'GT':
      case 'LTE':
      case 'GTE': {
        const srcA = reader.read8();
        const srcB = reader.read8();
        const dst = reader.read8();
        args.push(srcA, srcB, dst);
        break;
      }

      case 'LEFT':
      case 'RIGHT': {
        const src = reader.read8();
        const dst = reader.read8();
        const len = reader.readVar(0xffff);
        args.push(src, dst, len);
        break;
      }

      case 'RANGE': {
        const src = reader.read8();
        const dst = reader.read8();
        const index = reader.readVar(0xffff);
        const len = reader.readVar(0xffff);
        args.push(src, dst, index, len);
        break;
      }

      case 'INC':
      case 'DEC':
      case 'SWITCH': {
        const dst = reader.read8();
        args.push(dst);
        break;
      }

      case 'ADD':
      case 'SUB':
      case 'MUL':
      case 'DIV':
      case 'MOD':
      case 'SHR':
      case 'SHL':
      case 'MIN':
      case 'MAX':
      case 'POW':
      case 'PUT':
      case 'GET': {
        const srcA = reader.read8();
        const srcB = reader.read8();
        const dst = reader.read8();
        args.push(srcA, srcB, dst);
        break;
      }

      default:
        break;
    }

    instructions.push({ offset, opcode, args });
  }

  return instructions;
}

function resolveMethodSpec(
  contract: string,
  method: string,
  stack: VmValue[],
  table: Map<string, AbiMethodSpecEntry> | undefined,
  warnings: string[],
  protocolVersion?: number
): { key: string; spec?: AbiMethodSpec } {
  const key = contract ? `${contract}.${method}` : method;
  const argCount = stack.length;
  warnOnProtocolArityMismatch(key, protocolVersion, argCount, warnings);
  if (!table || !table.has(key)) {
    warnings.push(`missing ABI for ${key}; args omitted`);
    stack.length = 0;
    return { key };
  }
  const entry = table.get(key);
  if (!entry) {
    warnings.push(`missing ABI for ${key}; args omitted`);
    stack.length = 0;
    return { key };
  }

  const specs = Array.isArray(entry) ? entry : [entry];
  const exactMatches = specs.filter((candidate) => candidate.params.length === stack.length);
  if (exactMatches.length === 1) {
    const [match] = exactMatches;
    if (match) {
      return { key, spec: match };
    }
  }
  if (exactMatches.length > 1) {
    warnings.push(`ABI overload ambiguity for ${key}; args omitted`);
    stack.length = 0;
    return { key };
  }

  warnings.push(`missing ABI for ${key}; args omitted`);
  stack.length = 0;
  return { key };
}

function popArgs(key: string, stack: VmValue[], count: number): VmValue[] {
  if (stack.length < count) {
    throw new Error(`method ${key} expected ${count} args, got ${stack.length}`);
  }

  const args: VmValue[] = new Array(count);
  for (let i = 0; i < count; i++) {
    args[i] = stack.pop() as VmValue;
  }
  return args;
}

function attachAbi(arg: VmMethodCallArg, param?: AbiParamSpec): VmMethodCallArg {
  if (!param) {
    return arg;
  }
  return {
    ...arg,
    name: param.name,
    abiType: param.type,
  };
}

// Simulate VM stack/register behavior to extract contract/method calls.
function extractMethodCalls(
  instructions: Instruction[],
  table: Map<string, AbiMethodSpecEntry> | undefined,
  warnings: string[],
  protocolVersion?: number
): VmMethodCall[] {
  const regs: Array<VmValue | null> = new Array(16).fill(null);
  const stack: VmValue[] = [];
  const calls: VmMethodCall[] = [];

  for (const instruction of instructions) {
    const opName = opcodeName(instruction.opcode);
    switch (opName) {
      case 'LOAD': {
        const dst = instruction.args[0] as number;
        const type = instruction.args[1] as VMType;
        const raw = instruction.args[2];
        const bytes = raw instanceof Uint8Array ? raw : new Uint8Array();
        regs[dst] = VmValue.fromBytes(type, bytes);
        break;
      }
      case 'PUSH': {
        const src = instruction.args[0] as number;
        const value = regs[src];
        if (!value) {
          warnings.push(`PUSH from empty register r${src}`);
          break;
        }
        stack.push(value.clone());
        break;
      }
      case 'CTX': {
        const src = instruction.args[0] as number;
        const dst = instruction.args[1] as number;
        const value = regs[src];
        regs[dst] = value ? value.clone() : null;
        break;
      }
      case 'SWITCH': {
        const src = instruction.args[0] as number;
        const contract = regs[src]?.asString() ?? '';
        const method = stack.pop()?.asString() ?? '';
        const resolved = resolveMethodSpec(contract, method, stack, table, warnings, protocolVersion);
        const args = resolved.spec ? popArgs(resolved.key, stack, resolved.spec.params.length) : [];
        calls.push({
          contract,
          method,
          args: args.map((arg, index) => attachAbi(arg.toJson(), resolved.spec?.params[index])),
        });
        break;
      }
      case 'EXTCALL': {
        const src = instruction.args[0] as number;
        const method = regs[src]?.asString() ?? '';
        const resolved = resolveMethodSpec('', method, stack, table, warnings, protocolVersion);
        const args = resolved.spec ? popArgs(resolved.key, stack, resolved.spec.params.length) : [];
        calls.push({
          contract: '',
          method,
          args: args.map((arg, index) => attachAbi(arg.toJson(), resolved.spec?.params[index])),
        });
        break;
      }
      default:
        break;
    }
  }

  return calls;
}

export function disassembleVmScript(
  scriptHex: string,
  methodTable?: Map<string, AbiMethodSpecEntry>,
  protocolVersion?: number
): VmDisasmResult {
  const warnings: string[] = [];
  const bytes = hexToBytes(scriptHex);
  const instructions = disassembleScript(bytes);
  const calls = extractMethodCalls(instructions, methodTable, warnings, protocolVersion);
  const outputInstructions = instructions.map((instruction) => instructionToOutput(instruction));

  return {
    instructions: outputInstructions,
    methodCalls: calls,
    warnings,
  };
}
