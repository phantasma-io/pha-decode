import type { EventDecoded, JsonValue } from '../types/decoded.js';
import { Address, bytesToHex, hexToBytes, twosComplementLEToBigInt } from 'phantasma-sdk-ts';

export interface EventDecodeResult {
  decoded: EventDecoded;
  warnings: string[];
}

const EVENT_KIND_NAME: Record<number, string> = {
  0: 'Unknown',
  1: 'ChainCreate',
  2: 'TokenCreate',
  3: 'TokenSend',
  4: 'TokenReceive',
  5: 'TokenMint',
  6: 'TokenBurn',
  7: 'TokenStake',
  8: 'TokenClaim',
  9: 'AddressRegister',
  10: 'AddressLink',
  11: 'AddressUnlink',
  12: 'OrganizationCreate',
  13: 'OrganizationAdd',
  14: 'OrganizationRemove',
  15: 'GasEscrow',
  16: 'GasPayment',
  17: 'AddressUnregister',
  18: 'OrderCreated',
  19: 'OrderCancelled',
  20: 'OrderFilled',
  21: 'OrderClosed',
  22: 'FeedCreate',
  23: 'FeedUpdate',
  24: 'FileCreate',
  25: 'FileDelete',
  26: 'ValidatorPropose',
  27: 'ValidatorElect',
  28: 'ValidatorRemove',
  29: 'ValidatorSwitch',
  30: 'PackedNFT',
  31: 'ValueCreate',
  32: 'ValueUpdate',
  33: 'PollCreated',
  34: 'PollClosed',
  35: 'PollVote',
  36: 'ChannelCreate',
  37: 'ChannelRefill',
  38: 'ChannelSettle',
  39: 'LeaderboardCreate',
  40: 'LeaderboardInsert',
  41: 'LeaderboardReset',
  42: 'PlatformCreate',
  43: 'ChainSwap',
  44: 'ContractRegister',
  45: 'ContractDeploy',
  46: 'AddressMigration',
  47: 'ContractUpgrade',
  48: 'Log',
  49: 'Inflation',
  50: 'OwnerAdded',
  51: 'OwnerRemoved',
  52: 'DomainCreate',
  53: 'DomainDelete',
  54: 'TaskStart',
  55: 'TaskStop',
  56: 'CrownRewards',
  57: 'Infusion',
  58: 'Crowdsale',
  59: 'OrderBid',
  60: 'ContractKill',
  61: 'OrganizationKill',
  62: 'MasterClaim',
  63: 'ExecutionFailure',
  64: 'Custom',
  65: 'Custom_V2',
};

const TYPE_AUCTION_NAME: Record<number, string> = {
  0: 'Fixed',
  1: 'Classic',
  2: 'Reserve',
  3: 'Dutch',
};

const SALE_EVENT_KIND_NAME: Record<number, string> = {
  0: 'Creation',
  1: 'SoftCap',
  2: 'HardCap',
  3: 'AddedToWhitelist',
  4: 'RemovedFromWhitelist',
  5: 'Distribution',
  6: 'Refund',
  7: 'PriceChange',
  8: 'Participation',
};

class LegacyEventReader {
  private offset = 0;
  constructor(private readonly bytes: Uint8Array) {}

  readByte(): number {
    if (this.offset >= this.bytes.length) {
      throw new Error('legacy event reader past end of data');
    }
    const value = this.bytes[this.offset];
    if (value === undefined) {
      throw new Error('legacy event reader past end of data');
    }
    this.offset += 1;
    return value;
  }

  get remaining(): number {
    return this.bytes.length - this.offset;
  }

  readBytes(length: number): Uint8Array {
    if (this.offset + length > this.bytes.length) {
      throw new Error('legacy event reader past end of data');
    }
    const out = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return out;
  }

  readRemainingBytes(): Uint8Array {
    return this.readBytes(this.remaining);
  }

  // Varint layout matches IOUtils.ReadVarInt (prefix 0xFD/0xFE/0xFF).
  readVarInt(max: number = Number.MAX_SAFE_INTEGER): number {
    const prefix = this.readByte();
    let value: number;
    if (prefix === 0xfd) {
      value = this.readUint16();
    } else if (prefix === 0xfe) {
      value = this.readUint32();
    } else if (prefix === 0xff) {
      value = Number(this.readUint64());
    } else {
      value = prefix;
    }
    if (value > max) {
      throw new Error('legacy event varint exceeds max');
    }
    return value;
  }

  readVarString(): string | null {
    const length = this.readVarInt();
    if (length === 0) {
      return null;
    }
    const bytes = this.readBytes(length);
    return new TextDecoder().decode(bytes);
  }

  readByteArray(): Uint8Array {
    const length = this.readVarInt();
    if (length === 0) {
      return new Uint8Array();
    }
    return this.readBytes(length);
  }

  // BigInteger in legacy serialization uses a single-byte length prefix.
  readBigInteger(): string {
    const length = this.readByte();
    const bytes = this.readBytes(length);
    return twosComplementLEToBigInt(bytes).toString();
  }

  readTimestamp(): number {
    return this.readUint32();
  }

  readAddress(): string {
    const bytes = this.readByteArray();
    if (bytes.length !== Address.LengthInBytes) {
      throw new Error(`invalid address length ${bytes.length}`);
    }
    return Address.FromBytes(bytes).Text;
  }

  readHashHex(): string {
    const bytes = this.readByteArray();
    if (bytes.length !== 32) {
      throw new Error(`invalid hash length ${bytes.length}`);
    }
    return bytesToHex(bytes);
  }

  readRawHashHex(): string {
    const bytes = this.readBytes(32);
    return bytesToHex(bytes);
  }

  private readUint16(): number {
    const a = this.readByte();
    const b = this.readByte();
    return a + (b << 8);
  }

  private readUint32(): number {
    const a = this.readByte();
    const b = this.readByte();
    const c = this.readByte();
    const d = this.readByte();
    return (a + (b << 8) + (c << 16) + (d << 24)) >>> 0;
  }

  private readUint64(): bigint {
    const a = BigInt(this.readByte());
    const b = BigInt(this.readByte());
    const c = BigInt(this.readByte());
    const d = BigInt(this.readByte());
    const e = BigInt(this.readByte());
    const f = BigInt(this.readByte());
    const g = BigInt(this.readByte());
    const h = BigInt(this.readByte());
    return (
      a +
      (b << 8n) +
      (c << 16n) +
      (d << 24n) +
      (e << 32n) +
      (f << 40n) +
      (g << 48n) +
      (h << 56n)
    );
  }
}

function parseEventKind(kind?: string): { id: number; name: string } | null {
  if (!kind) {
    return null;
  }
  const trimmed = kind.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (/^\d+$/.test(trimmed)) {
    const id = Number(trimmed);
    return { id, name: EVENT_KIND_NAME[id] ?? `EventKind_${id}` };
  }
  const normalized = trimmed.replace(/\s+/g, '').toLowerCase();
  for (const [idText, name] of Object.entries(EVENT_KIND_NAME)) {
    if (name.toLowerCase() === normalized) {
      return { id: Number(idText), name };
    }
  }
  return null;
}

function decodeTokenEvent(reader: LegacyEventReader): JsonValue {
  return {
    symbol: reader.readVarString(),
    value: reader.readBigInteger(),
    chain: reader.readVarString(),
  };
}

function decodeTokenCreateEvent(reader: LegacyEventReader): JsonValue {
  return {
    symbol: reader.readVarString(),
  };
}

function decodeGasEvent(reader: LegacyEventReader): JsonValue {
  return {
    address: reader.readAddress(),
    price: reader.readBigInteger(),
    amount: reader.readBigInteger(),
  };
}

function decodeInfusionEvent(reader: LegacyEventReader): JsonValue {
  return {
    baseSymbol: reader.readVarString(),
    tokenId: reader.readBigInteger(),
    infusedSymbol: reader.readVarString(),
    infusedValue: reader.readBigInteger(),
    chain: reader.readVarString(),
  };
}

function decodeMarketEvent(reader: LegacyEventReader): JsonValue {
  const typeId = reader.readVarInt();
  return {
    baseSymbol: reader.readVarString(),
    quoteSymbol: reader.readVarString(),
    id: reader.readBigInteger(),
    price: reader.readBigInteger(),
    endPrice: reader.readBigInteger(),
    type: TYPE_AUCTION_NAME[typeId] ?? `TypeAuction_${typeId}`,
  };
}

function decodeChainValueEvent(reader: LegacyEventReader): JsonValue {
  return {
    name: reader.readVarString(),
    value: reader.readBigInteger(),
  };
}

function decodeOrganizationEvent(reader: LegacyEventReader): JsonValue {
  return {
    organization: reader.readVarString(),
    member: reader.readAddress(),
  };
}

function decodeOrganizationCreateEvent(reader: LegacyEventReader): JsonValue {
  return {
    organization: reader.readVarString(),
  };
}

function decodeNameEvent(reader: LegacyEventReader): JsonValue {
  return {
    name: reader.readVarString(),
  };
}

function decodeSubjectEvent(reader: LegacyEventReader): JsonValue {
  return {
    subject: reader.readVarString(),
  };
}

function decodeAddressEvent(reader: LegacyEventReader): JsonValue {
  return {
    address: reader.readAddress(),
  };
}

function decodeRawBytesEvent(reader: LegacyEventReader): JsonValue {
  return {
    dataHex: bytesToHex(reader.readRemainingBytes()),
  };
}

function decodeRawBigIntegerEvent(reader: LegacyEventReader): JsonValue {
  const bytes = reader.readRemainingBytes();
  return {
    value: bytes.length === 0 ? '0' : twosComplementLEToBigInt(bytes).toString(),
  };
}

function decodePackedNftEvent(reader: LegacyEventReader): JsonValue {
  return {
    symbol: reader.readVarString(),
    romHex: bytesToHex(reader.readByteArray()),
    ramHex: bytesToHex(reader.readByteArray()),
  };
}

function decodeSaleEvent(reader: LegacyEventReader): JsonValue {
  const saleHash = reader.readHashHex();
  const kindId = reader.readVarInt();
  return {
    saleHash,
    kindId,
    kind: SALE_EVENT_KIND_NAME[kindId] ?? `SaleEventKind_${kindId}`,
  };
}

function decodeLeaderboardInsertEvent(reader: LegacyEventReader): JsonValue {
  return {
    address: reader.readAddress(),
    score: reader.readBigInteger(),
  };
}

function decodeMasterEvent(reader: LegacyEventReader): JsonValue {
  return {
    symbol: reader.readVarString(),
    value: reader.readBigInteger(),
    chain: reader.readVarString(),
    claimDate: reader.readTimestamp(),
  };
}

function decodeTransactionSettleEvent(reader: LegacyEventReader): JsonValue {
  return {
    hash: reader.readHashHex(),
    platform: reader.readVarString(),
    chain: reader.readVarString(),
  };
}

function decodeByKind(reader: LegacyEventReader, kindId: number): JsonValue | null {
  switch (kindId) {
    case 2: // TokenCreate
      return decodeTokenCreateEvent(reader);
    case 3: // TokenSend
    case 4: // TokenReceive
    case 5: // TokenMint
    case 6: // TokenBurn
    case 7: // TokenStake
    case 8: // TokenClaim
    case 49: // Inflation
    case 56: // CrownRewards
      return decodeTokenEvent(reader);
    case 15: // GasEscrow
    case 16: // GasPayment
      return decodeGasEvent(reader);
    case 12: // OrganizationCreate
      return decodeOrganizationCreateEvent(reader);
    case 13: // OrganizationAdd
    case 14: // OrganizationRemove
      return decodeOrganizationEvent(reader);
    case 31: // ValueCreate
    case 32: // ValueUpdate
      return decodeChainValueEvent(reader);
    case 18: // OrderCreated
    case 19: // OrderCancelled
    case 20: // OrderFilled
    case 21: // OrderClosed
    case 59: // OrderBid
      return decodeMarketEvent(reader);
    case 57: // Infusion
      return decodeInfusionEvent(reader);
    case 62: // MasterClaim
      return decodeMasterEvent(reader);
    case 43: // ChainSwap
      return decodeTransactionSettleEvent(reader);
    case 1: // ChainCreate
    case 22: // FeedCreate
    case 39: // LeaderboardCreate
    case 41: // LeaderboardReset
    case 42: // PlatformCreate
    case 45: // ContractDeploy
    case 47: // ContractUpgrade
    case 52: // DomainCreate
    case 53: // DomainDelete
    case 60: // ContractKill
      return decodeNameEvent(reader);
    case 9: // AddressRegister
    case 17: // AddressUnregister
      return decodeNameEvent(reader);
    case 33: // PollCreated
    case 34: // PollClosed
    case 35: // PollVote
      return decodeSubjectEvent(reader);
    case 10: // AddressLink
    case 11: // AddressUnlink
    case 26: // ValidatorPropose
    case 27: // ValidatorElect
    case 28: // ValidatorRemove
    case 46: // AddressMigration
      return decodeAddressEvent(reader);
    case 24: // FileCreate
      return { hash: reader.readHashHex() };
    case 25: // FileDelete
    case 50: // OwnerAdded
    case 51: // OwnerRemoved
      return { hash: reader.readRawHashHex() };
    case 30: // PackedNFT
      return decodePackedNftEvent(reader);
    case 58: // Crowdsale
      return decodeSaleEvent(reader);
    case 36: // ChannelCreate
      return decodeRawBytesEvent(reader);
    case 37: // ChannelRefill
    case 38: // ChannelSettle
      return { count: reader.readBigInteger() };
    case 40: // LeaderboardInsert
      return decodeLeaderboardInsertEvent(reader);
    case 48: // Log
    case 63: // ExecutionFailure
      return { message: reader.readVarString() };
    case 54: // TaskStart
    case 55: // TaskStop
      return decodeRawBigIntegerEvent(reader);
    default:
      return null;
  }
}

export function decodeEventHex(hex: string, kind?: string): EventDecodeResult {
  const warnings: string[] = [];
  const normalized = bytesToHex(hexToBytes(hex));
  const kindInfo = parseEventKind(kind);

  if (!kindInfo) {
    warnings.push('event kind not provided or unknown; returning raw hex only');
    const decoded: EventDecoded = {
      rawHex: normalized,
    };
    if (kind) {
      decoded.kind = kind;
    }
    return {
      decoded,
      warnings,
    };
  }

  const reader = new LegacyEventReader(hexToBytes(normalized));
  let decoded: JsonValue | null = null;
  try {
    decoded = decodeByKind(reader, kindInfo.id);
  } catch (err) {
    warnings.push(err instanceof Error ? err.message : String(err));
  }

  if (!decoded) {
    warnings.push(`no legacy decoder for EventKind ${kindInfo.name}`);
  } else {
    if (reader.remaining > 0) {
      warnings.push(`legacy event decode left ${reader.remaining} trailing bytes`);
    }
  }

  const decodedEvent: EventDecoded = {
    kind: kindInfo.name,
    kindId: kindInfo.id,
    rawHex: normalized,
  };
  if (decoded !== null) {
    decodedEvent.decoded = decoded;
  }
  return { decoded: decodedEvent, warnings };
}
