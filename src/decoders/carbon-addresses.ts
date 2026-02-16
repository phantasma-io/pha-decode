import type { CarbonAddressMode } from '../types/cli.js';
import type {
  CarbonCallArg,
  CarbonCallDecoded,
  CarbonDecoded,
  DecodeOutput,
  JsonValue,
} from '../types/decoded.js';
import { decodeAddressConversion } from './address.js';

const BYTES32_HEX_RE = /^(?:0x)?[0-9a-fA-F]{64}$/;

// Canonical inventory of all Carbon output paths that can be converted from bytes32 to Phantasma.
export const CARBON_ADDRESS_PATH_INVENTORY = [
  'carbon.gasFrom',
  'carbon.witnesses[].address',
  'carbon.msg.to',
  'carbon.msg.from',
  'carbon.msg.transferF[].to',
  'carbon.msg.transferF[].from',
  'carbon.msg.transferN[].to',
  'carbon.msg.transferN[].from',
  'carbon.msg.mintF[].to',
  'carbon.msg.burnF[].from',
  'carbon.msg.mintN[].to',
  'carbon.msg.burnN[].from',
  'carbon.call.args[].value (type=bytes32)',
  'carbon.call.args[].value[] (type=bytes32[])',
  'carbon.call.args[].value.owner (type=token_info|series_info)',
  'carbon.call.args[].value.to (type=stake_import|txmsg_mint_fungible)',
  'carbon.call.args[].value.address (type=name_import|member_import)',
  'carbon.call.args[].value.info.owner (type=organization_import|series_import)',
  'carbon.call.args[].value.memberImports[].address (type=organization_import)',
  'carbon.call.args[].value.imports[].originator (type=series_import)',
  'carbon.call.args[].value.imports[].owner (type=series_import)',
  'carbon.call.args[].value.originator (type=nft_import)',
  'carbon.call.args[].value.owner (type=nft_import)',
  'carbon.call.sections[].args[] (same typed mapping as carbon.call.args[])',
  'carbon.calls[].args[] (same typed mapping as carbon.call.args[])',
  'carbon.calls[].sections[].args[] (same typed mapping as carbon.call.args[])',
] as const;

function asJsonObject(value: JsonValue | null | undefined): Record<string, JsonValue> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, JsonValue>;
}

function convertBytes32ToPhantasmaIfNeeded(value: JsonValue | undefined): JsonValue | undefined {
  if (typeof value !== 'string' || !BYTES32_HEX_RE.test(value)) {
    return value;
  }
  try {
    return decodeAddressConversion({ bytes32: value }).decoded.phantasma;
  } catch {
    return value;
  }
}

function convertObjectAddressField(obj: Record<string, JsonValue>, field: string): void {
  const current = obj[field] as JsonValue | undefined;
  const converted = convertBytes32ToPhantasmaIfNeeded(current);
  if (converted !== undefined) {
    obj[field] = converted;
  }
}

function convertObjectAddressFields(obj: Record<string, JsonValue>, fields: string[]): void {
  for (const field of fields) {
    convertObjectAddressField(obj, field);
  }
}

function convertCollectionAddressFields(
  obj: Record<string, JsonValue>,
  collectionField: string,
  entryFields: string[]
): void {
  const collection = obj[collectionField];
  if (!Array.isArray(collection)) {
    return;
  }

  for (const entry of collection) {
    const entryObj = asJsonObject(entry);
    if (!entryObj) {
      continue;
    }
    convertObjectAddressFields(entryObj, entryFields);
  }
}

function convertCallArgValueByType(type: string, value: JsonValue): JsonValue {
  if (type.endsWith('[]')) {
    const innerType = type.slice(0, -2);
    if (!Array.isArray(value)) {
      return value;
    }
    for (let i = 0; i < value.length; i += 1) {
      value[i] = convertCallArgValueByType(innerType, value[i] as JsonValue);
    }
    return value;
  }

  switch (type) {
    case 'bytes32':
      return convertBytes32ToPhantasmaIfNeeded(value) ?? value;
    case 'token_info':
    case 'series_info': {
      const info = asJsonObject(value);
      if (info) {
        convertObjectAddressField(info, 'owner');
      }
      return value;
    }
    case 'stake_import':
    case 'txmsg_mint_fungible': {
      const info = asJsonObject(value);
      if (info) {
        convertObjectAddressField(info, 'to');
      }
      return value;
    }
    case 'name_import':
    case 'member_import': {
      const info = asJsonObject(value);
      if (info) {
        convertObjectAddressField(info, 'address');
      }
      return value;
    }
    case 'organization_import': {
      const info = asJsonObject(value);
      if (!info) {
        return value;
      }
      const orgInfo = asJsonObject((info.info as JsonValue | undefined) ?? null);
      if (orgInfo) {
        convertObjectAddressField(orgInfo, 'owner');
      }
      const members = info.memberImports;
      if (Array.isArray(members)) {
        for (const member of members) {
          const memberObj = asJsonObject(member);
          if (memberObj) {
            convertObjectAddressField(memberObj, 'address');
          }
        }
      }
      return value;
    }
    case 'series_import': {
      const info = asJsonObject(value);
      if (!info) {
        return value;
      }
      const seriesInfo = asJsonObject((info.info as JsonValue | undefined) ?? null);
      if (seriesInfo) {
        convertObjectAddressField(seriesInfo, 'owner');
      }
      const imports = info.imports;
      if (Array.isArray(imports)) {
        for (const nftImport of imports) {
          const nftImportObj = asJsonObject(nftImport);
          if (!nftImportObj) {
            continue;
          }
          convertObjectAddressFields(nftImportObj, ['originator', 'owner']);
        }
      }
      return value;
    }
    case 'nft_import': {
      const nftImport = asJsonObject(value);
      if (nftImport) {
        convertObjectAddressFields(nftImport, ['originator', 'owner']);
      }
      return value;
    }
    case 'txmsg_call_multi': {
      if (!Array.isArray(value)) {
        return value;
      }
      for (const embeddedCall of value) {
        convertEmbeddedCallDecoded(embeddedCall as JsonValue);
      }
      return value;
    }
    default:
      return value;
  }
}

function convertEmbeddedCallArgs(argsValue: JsonValue): void {
  if (!Array.isArray(argsValue)) {
    return;
  }

  for (const entry of argsValue) {
    const arg = asJsonObject(entry);
    if (!arg || typeof arg.type !== 'string' || !('value' in arg)) {
      continue;
    }
    arg.value = convertCallArgValueByType(arg.type, (arg.value as JsonValue | undefined) ?? null);
  }
}

function convertEmbeddedCallDecoded(callValue: JsonValue): void {
  const call = asJsonObject(callValue);
  if (!call) {
    return;
  }

  convertEmbeddedCallArgs((call.args as JsonValue | undefined) ?? null);

  const sections = call.sections;
  if (!Array.isArray(sections)) {
    return;
  }

  for (const section of sections) {
    const sectionObj = asJsonObject(section);
    if (!sectionObj) {
      continue;
    }
    convertEmbeddedCallArgs((sectionObj.args as JsonValue | undefined) ?? null);
  }
}

function convertCallArgs(args: CarbonCallArg[] | undefined): void {
  if (!args) {
    return;
  }

  for (const arg of args) {
    if (arg.value === undefined) {
      continue;
    }
    arg.value = convertCallArgValueByType(arg.type, arg.value);
  }
}

function convertCallDecoded(call: CarbonCallDecoded | undefined): void {
  if (!call) {
    return;
  }

  convertCallArgs(call.args);
  if (!call.sections) {
    return;
  }

  for (const section of call.sections) {
    convertCallArgs(section.args);
  }
}

function convertCarbonMessageAddresses(carbon: CarbonDecoded): void {
  const msg = asJsonObject(carbon.msg ?? null);
  if (!msg) {
    return;
  }

  convertObjectAddressFields(msg, ['to', 'from']);
  convertCollectionAddressFields(msg, 'transferF', ['to', 'from']);
  convertCollectionAddressFields(msg, 'transferN', ['to', 'from']);
  convertCollectionAddressFields(msg, 'mintF', ['to']);
  convertCollectionAddressFields(msg, 'burnF', ['from']);
  convertCollectionAddressFields(msg, 'mintN', ['to']);
  convertCollectionAddressFields(msg, 'burnN', ['from']);
}

function convertCarbonAddresses(carbon: CarbonDecoded): void {
  carbon.gasFrom = (convertBytes32ToPhantasmaIfNeeded(carbon.gasFrom) as string | undefined) ?? carbon.gasFrom;

  if (Array.isArray(carbon.witnesses)) {
    for (const witness of carbon.witnesses) {
      const witnessObj = asJsonObject(witness as JsonValue);
      if (!witnessObj) {
        continue;
      }
      convertObjectAddressField(witnessObj, 'address');
    }
  }

  convertCarbonMessageAddresses(carbon);
  convertCallDecoded(carbon.call);

  if (carbon.calls) {
    for (const call of carbon.calls) {
      convertCallDecoded(call);
    }
  }
}

export function applyCarbonAddressMode(output: DecodeOutput, mode: CarbonAddressMode): string[] {
  if (mode !== 'pha' || !output.carbon) {
    return [];
  }

  convertCarbonAddresses(output.carbon);
  return [];
}
