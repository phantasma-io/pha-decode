import {
  Address,
  bytesToHex,
  hexToBytes,
  twosComplementLEToBigInt,
} from 'phantasma-sdk-ts';
import type {
  JsonValue,
  RomDecoded,
  RomVmNodeDecoded,
  RomVmStructEntryDecoded,
} from '../types/decoded.js';

export type RomDecodeMode = 'auto' | 'legacy' | 'crown';

export interface RomDecodeOptions {
  hex: string;
  symbol?: string;
  tokenId?: string;
  mode?: RomDecodeMode;
}

export interface RomDecodeResult {
  decoded: RomDecoded;
  warnings: string[];
}

type RomParserKind = 'legacy' | 'crown';

const VM_TYPE_NAME: Record<number, string> = {
  0: 'None',
  1: 'Struct',
  2: 'Bytes',
  3: 'Number',
  4: 'String',
  5: 'Timestamp',
  6: 'Bool',
  7: 'Enum',
  8: 'Object',
};

class RomReader {
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {}

  get position(): number {
    return this.offset;
  }

  get remaining(): number {
    return this.bytes.length - this.offset;
  }

  get isEnd(): boolean {
    return this.offset >= this.bytes.length;
  }

  readByte(): number {
    if (this.offset >= this.bytes.length) {
      throw new Error(`ROM reader past end at offset ${this.offset}`);
    }
    const value = this.bytes[this.offset];
    if (value === undefined) {
      throw new Error(`ROM reader past end at offset ${this.offset}`);
    }
    this.offset += 1;
    return value;
  }

  readBytes(length: number): Uint8Array {
    if (length < 0) {
      throw new Error(`ROM reader invalid length ${length}`);
    }
    if (this.offset + length > this.bytes.length) {
      throw new Error(
        `ROM reader past end at offset ${this.offset} (need ${length}, remaining ${this.remaining})`
      );
    }
    const out = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return out;
  }

  readUInt32LE(): number {
    const b0 = this.readByte();
    const b1 = this.readByte();
    const b2 = this.readByte();
    const b3 = this.readByte();
    return (b0 + (b1 << 8) + (b2 << 16) + (b3 << 24)) >>> 0;
  }

  readVarInt(max: number = Number.MAX_SAFE_INTEGER): number {
    const prefix = this.readByte();
    let value: bigint;

    if (prefix === 0xfd) {
      const a = this.readByte();
      const b = this.readByte();
      value = BigInt(a + (b << 8));
    } else if (prefix === 0xfe) {
      const a = this.readByte();
      const b = this.readByte();
      const c = this.readByte();
      const d = this.readByte();
      value = BigInt((a + (b << 8) + (c << 16) + (d << 24)) >>> 0);
    } else if (prefix === 0xff) {
      const a = BigInt(this.readByte());
      const b = BigInt(this.readByte());
      const c = BigInt(this.readByte());
      const d = BigInt(this.readByte());
      const e = BigInt(this.readByte());
      const f = BigInt(this.readByte());
      const g = BigInt(this.readByte());
      const h = BigInt(this.readByte());
      value =
        a +
        (b << 8n) +
        (c << 16n) +
        (d << 24n) +
        (e << 32n) +
        (f << 40n) +
        (g << 48n) +
        (h << 56n);
    } else {
      value = BigInt(prefix);
    }

    const limit = BigInt(max);
    if (value > limit) {
      throw new Error(`ROM varint ${value.toString()} exceeds max ${max}`);
    }
    return Number(value);
  }

  readByteArray(max: number = Number.MAX_SAFE_INTEGER): Uint8Array {
    const length = this.readVarInt(max);
    return this.readBytes(length);
  }
}

function vmTypeName(typeId: number): string {
  return VM_TYPE_NAME[typeId] ?? `Unknown_${typeId}`;
}

function decodeUtf8(bytes: Uint8Array): string {
  return new TextDecoder('utf-8').decode(bytes);
}

function timestampToIso(value: number): string {
  return new Date(value * 1000).toISOString();
}

function nodeToJson(node: RomVmNodeDecoded): JsonValue {
  if (node.vmType === 'Struct') {
    if (node.fields) {
      return node.fields;
    }
    const entries = node.entries ?? [];
    return entries.map((entry) => ({
      keyVmType: entry.keyVmType,
      key: entry.key,
      valueVmType: entry.valueVmType,
      value: entry.value,
    }));
  }

  if (node.value === undefined) {
    return null;
  }

  return node.value;
}

function keyToFieldName(node: RomVmNodeDecoded): string | null {
  if (node.value === undefined || node.value === null) {
    return null;
  }

  switch (node.vmType) {
    case 'String':
      return typeof node.value === 'string' ? node.value : null;
    case 'Number':
      return typeof node.value === 'string' ? node.value : null;
    case 'Enum':
    case 'Timestamp':
      return typeof node.value === 'number' ? node.value.toString() : null;
    case 'Bool':
      return typeof node.value === 'boolean' ? (node.value ? 'true' : 'false') : null;
    default:
      return null;
  }
}

function parseVmNode(reader: RomReader, depth: number): RomVmNodeDecoded {
  if (depth > 128) {
    throw new Error('ROM VM decode exceeded max depth');
  }

  const typeId = reader.readByte();
  const typeName = vmTypeName(typeId);

  switch (typeId) {
    case 0:
      return { vmTypeId: typeId, vmType: typeName, value: null };

    case 1: {
      const count = reader.readVarInt();
      const entries: RomVmStructEntryDecoded[] = [];
      const fields: { [key: string]: JsonValue } = {};
      let canBuildFields = true;

      for (let i = 0; i < count; i += 1) {
        const keyNode = parseVmNode(reader, depth + 1);
        const valueNode = parseVmNode(reader, depth + 1);

        const keyJson = nodeToJson(keyNode);
        const valueJson = nodeToJson(valueNode);

        entries.push({
          keyVmType: keyNode.vmType,
          key: keyJson,
          valueVmType: valueNode.vmType,
          value: valueJson,
        });

        const fieldKey = keyToFieldName(keyNode);
        if (!fieldKey || Object.hasOwn(fields, fieldKey)) {
          canBuildFields = false;
          continue;
        }
        fields[fieldKey] = valueJson;
      }

      if (canBuildFields) {
        return {
          vmTypeId: typeId,
          vmType: typeName,
          fields,
          entries,
        };
      }

      return {
        vmTypeId: typeId,
        vmType: typeName,
        entries,
      };
    }

    case 2: {
      const value = bytesToHex(reader.readByteArray());
      return { vmTypeId: typeId, vmType: typeName, value };
    }

    case 3: {
      const length = reader.readByte();
      const bytes = reader.readBytes(length);
      const value = twosComplementLEToBigInt(bytes).toString();
      return { vmTypeId: typeId, vmType: typeName, value };
    }

    case 4: {
      const value = decodeUtf8(reader.readByteArray());
      return { vmTypeId: typeId, vmType: typeName, value };
    }

    case 5: {
      const value = reader.readUInt32LE();
      return { vmTypeId: typeId, vmType: typeName, value };
    }

    case 6: {
      const value = reader.readByte() !== 0;
      return { vmTypeId: typeId, vmType: typeName, value };
    }

    case 7: {
      const value = reader.readVarInt();
      return { vmTypeId: typeId, vmType: typeName, value };
    }

    case 8: {
      const raw = reader.readByteArray();
      const valueHex = bytesToHex(raw);

      // VM Object may contain serialized Address bytes (length-prefixed payload).
      if (raw.length === Address.LengthInBytes + 1 && raw[0] === Address.LengthInBytes) {
        const addressBytes = raw.subarray(1);
        try {
          const address = Address.FromBytes(addressBytes).Text;
          return {
            vmTypeId: typeId,
            vmType: typeName,
            value: {
              kind: 'Address',
              text: address,
              bytesHex: bytesToHex(addressBytes),
            },
          };
        } catch {
          // Keep raw object bytes when address conversion fails.
        }
      }

      return {
        vmTypeId: typeId,
        vmType: typeName,
        value: {
          kind: 'ObjectBytes',
          bytesHex: valueHex,
        },
      };
    }

    default:
      throw new Error(`unsupported VM type ${typeId} at offset ${reader.position - 1}`);
  }
}

function parseCreatedFromFields(fields?: { [key: string]: JsonValue }): number | null {
  if (!fields) {
    return null;
  }

  const value = fields.created;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function decodeLegacyRom(
  bytes: Uint8Array,
  symbol?: string,
  tokenId?: string
): RomDecodeResult {
  const warnings: string[] = [];
  const reader = new RomReader(bytes);
  const root = parseVmNode(reader, 0);

  if (root.vmType !== 'Struct') {
    throw new Error(`legacy ROM root must be Struct, got ${root.vmType}`);
  }

  if (!reader.isEnd) {
    warnings.push(`legacy ROM has ${reader.remaining} trailing bytes`);
  }

  const fields = root.fields;
  const createdUnix = parseCreatedFromFields(fields);

  const decoded: RomDecoded = {
    parser: 'legacy-vm-dictionary',
    rawHex: bytesToHex(bytes),
    vm: { root },
  };

  if (symbol) {
    decoded.symbol = symbol;
  }

  if (tokenId) {
    decoded.tokenId = tokenId;
  }

  if (fields) {
    decoded.fields = fields;
  }

  if (fields && typeof fields.name === 'string') {
    decoded.name = fields.name;
  }

  if (fields && typeof fields.description === 'string') {
    decoded.description = fields.description;
  }

  if (createdUnix !== null) {
    decoded.createdUnix = createdUnix;
    decoded.createdIso = timestampToIso(createdUnix);
  }

  return { decoded, warnings };
}

function decodeCrownRom(
  bytes: Uint8Array,
  symbol?: string,
  tokenId?: string
): RomDecodeResult {
  const warnings: string[] = [];
  const reader = new RomReader(bytes);

  const addressLength = reader.readVarInt(2048);
  const stakerAddressBytes = reader.readBytes(addressLength);
  const timestampUnix = reader.readUInt32LE();

  if (!reader.isEnd) {
    warnings.push(`CROWN ROM has ${reader.remaining} trailing bytes`);
  }

  let stakerAddress: string | undefined;
  if (stakerAddressBytes.length === Address.LengthInBytes) {
    try {
      stakerAddress = Address.FromBytes(stakerAddressBytes).Text;
    } catch {
      warnings.push('CROWN staker address bytes could not be converted to text address');
    }
  } else {
    warnings.push(
      `CROWN staker address length is ${stakerAddressBytes.length}, expected ${Address.LengthInBytes}`
    );
  }

  const crown: NonNullable<RomDecoded['crown']> = {
    addressLength,
    stakerAddressHex: bytesToHex(stakerAddressBytes),
    timestampUnix,
    timestampIso: timestampToIso(timestampUnix),
  };

  if (stakerAddress) {
    crown.stakerAddress = stakerAddress;
  }

  const decoded: RomDecoded = {
    parser: 'crown',
    rawHex: bytesToHex(bytes),
    ...(tokenId ? { name: `CROWN #${tokenId}` } : {}),
    description: '',
    createdUnix: timestampUnix,
    createdIso: timestampToIso(timestampUnix),
    crown,
  };

  if (symbol) {
    decoded.symbol = symbol;
  }

  if (tokenId) {
    decoded.tokenId = tokenId;
  }

  return { decoded, warnings };
}

function pickPrimaryParser(mode: RomDecodeMode, symbol?: string): RomParserKind {
  if (mode === 'legacy') {
    return 'legacy';
  }

  if (mode === 'crown') {
    return 'crown';
  }

  // CROWN ROM is not a VM dictionary, so prefer dedicated parser when symbol is known.
  const normalizedSymbol = symbol?.trim().toUpperCase();
  return normalizedSymbol === 'CROWN' ? 'crown' : 'legacy';
}

function runParser(
  parser: RomParserKind,
  bytes: Uint8Array,
  symbol?: string,
  tokenId?: string
): RomDecodeResult {
  if (parser === 'crown') {
    return decodeCrownRom(bytes, symbol, tokenId);
  }

  return decodeLegacyRom(bytes, symbol, tokenId);
}

export function decodeRomHex(options: RomDecodeOptions): RomDecodeResult {
  const mode = options.mode ?? 'auto';
  const symbol = options.symbol?.trim().toUpperCase();
  const tokenId = options.tokenId?.trim();

  const normalizedHex = bytesToHex(hexToBytes(options.hex));
  const bytes = hexToBytes(normalizedHex);

  const primary = pickPrimaryParser(mode, symbol);

  try {
    const primaryResult = runParser(primary, bytes, symbol, tokenId);
    return primaryResult;
  } catch (primaryErr) {
    const primaryMessage = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);

    if (mode !== 'auto') {
      throw new Error(`${primary} ROM decode failed: ${primaryMessage}`);
    }

    // Auto mode is deterministic: try alternate parser and surface explicit fallback warning.
    const fallback: RomParserKind = primary === 'crown' ? 'legacy' : 'crown';
    const fallbackResult = runParser(fallback, bytes, symbol, tokenId);
    fallbackResult.warnings.unshift(
      `auto parser fallback: ${primary} failed (${primaryMessage}); ${fallback} succeeded`
    );
    return fallbackResult;
  }
}
