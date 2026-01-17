import {
  bytesToHex,
  CarbonBinaryReader,
  Bytes32,
  Bytes64,
  IntX,
  SeriesInfo,
  SmallString,
  TokenInfo,
  TxMsgCall,
  TxMsgCallMulti,
  TxMsgMintFungible,
  VmDynamicStruct,
  VmDynamicVariable,
  VmStructSchema,
} from 'phantasma-sdk-ts';
import type { CarbonCallArg, CarbonCallDecoded, CarbonCallSection } from '../types/decoded.js';
import { carbonValueToJson } from './carbon-values.js';

type CarbonArgType = string;

interface CarbonArgDef {
  name: string;
  type: CarbonArgType;
  optional?: boolean;
}

interface CarbonMethodSignature {
  name: string;
  args: CarbonArgDef[];
}

interface CarbonModuleSignature {
  name: string;
  methods: Record<number, CarbonMethodSignature>;
}

const MODULE_NAMES: Record<number, string> = {
  0: 'Governance',
  1: 'Token',
  2: 'PhantasmaVm',
  3: 'Organization',
  4: 'Market',
  4294967295: 'Internal',
};

// Signatures are derived from node_cpp carbon contract Call() argument reads.
const MODULE_SIGNATURES: Record<number, CarbonModuleSignature> = {
  0: {
    name: 'Governance',
    methods: {
      0: {
        name: 'Genesis',
        args: [
          { name: 'chainConfig', type: 'chain_config' },
          { name: 'gasConfig', type: 'gas_config' },
          { name: 'nodes', type: 'node_info[]' },
          { name: 'metadata', type: 'vm_dynamic_struct', optional: true },
          { name: 'tokens', type: 'token_info[]', optional: true },
          { name: 'mints', type: 'txmsg_mint_fungible[]', optional: true },
          { name: 'series', type: 'series_import[]', optional: true },
          { name: 'stakes', type: 'stake_import[]', optional: true },
          { name: 'names', type: 'name_import[]', optional: true },
          { name: 'orgs', type: 'organization_import[]', optional: true },
        ],
      },
      1: { name: 'RegisterName', args: [{ name: 'address', type: 'bytes32' }, { name: 'name', type: 'smallstring' }] },
      2: { name: 'SpecialResolution', args: [{ name: 'id', type: 'u64' }, { name: 'calls', type: 'txmsg_call_multi' }] },
      3: { name: 'SetGasConfig', args: [{ name: 'config', type: 'gas_config' }] },
      4: { name: 'SetChainConfig', args: [{ name: 'config', type: 'chain_config' }] },
      5: { name: 'SetMetadata', args: [{ name: 'metadata', type: 'vm_dynamic_struct' }] },
      6: { name: 'SetNodeConfig', args: [{ name: 'nodes', type: 'node_list' }] },
      7: { name: 'GetSpecialResolutionCount', args: [] },
      8: { name: 'LookupName', args: [{ name: 'address', type: 'bytes32' }] },
      9: { name: 'LookupAddress', args: [{ name: 'name', type: 'smallstring' }] },
      10: { name: 'SetFeatureLevel', args: [{ name: 'version', type: 'u32' }] },
    },
  },
  1: {
    name: 'Token',
    methods: {
      0: {
        name: 'TransferFungible',
        args: [
          { name: 'to', type: 'bytes32' },
          { name: 'from', type: 'bytes32' },
          { name: 'tokenId', type: 'u64' },
          { name: 'amount', type: 'intx' },
        ],
      },
      1: {
        name: 'TransferNonFungible',
        args: [
          { name: 'to', type: 'bytes32' },
          { name: 'from', type: 'bytes32' },
          { name: 'tokenId', type: 'u64' },
          { name: 'instanceIds', type: 'u64[]' },
        ],
      },
      2: { name: 'CreateToken', args: [{ name: 'info', type: 'token_info' }] },
      3: {
        name: 'MintFungible',
        args: [
          { name: 'tokenId', type: 'u64' },
          { name: 'to', type: 'bytes32' },
          { name: 'amount', type: 'intx' },
        ],
      },
      4: {
        name: 'BurnFungible',
        args: [
          { name: 'tokenId', type: 'u64' },
          { name: 'from', type: 'bytes32' },
          { name: 'amount', type: 'intx' },
        ],
      },
      5: { name: 'GetBalance', args: [{ name: 'tokenId', type: 'u64' }, { name: 'address', type: 'bytes32' }] },
      6: { name: 'CreateTokenSeries', args: [{ name: 'tokenId', type: 'u64' }, { name: 'info', type: 'series_info' }] },
      7: { name: 'DeleteTokenSeries', args: [{ name: 'tokenId', type: 'u64' }, { name: 'seriesId', type: 'u32' }] },
      8: {
        name: 'MintNonFungible',
        args: [
          { name: 'tokenId', type: 'u64' },
          { name: 'address', type: 'bytes32' },
          { name: 'tokens', type: 'nft_mint_info[]' },
        ],
      },
      9: {
        name: 'BurnNonFungible',
        args: [
          { name: 'tokenId', type: 'u64' },
          { name: 'address', type: 'bytes32' },
          { name: 'instanceIds', type: 'u64[]' },
        ],
      },
      10: { name: 'GetInstances', args: [{ name: 'tokenId', type: 'u64' }, { name: 'address', type: 'bytes32' }] },
      11: {
        name: 'GetNonFungibleInfo',
        args: [
          { name: 'tokenId', type: 'u64' },
          { name: 'instanceId', type: 'u64' },
          { name: 'getSchemas', type: 'u8' },
        ],
      },
      12: {
        name: 'GetNonFungibleInfoByRomId',
        args: [
          { name: 'tokenId', type: 'u64' },
          { name: 'romId', type: 'vm_dynamic_variable' },
          { name: 'getSchemas', type: 'u8' },
        ],
      },
      13: { name: 'GetSeriesInfo', args: [{ name: 'tokenId', type: 'u64' }, { name: 'seriesId', type: 'u32' }] },
      14: { name: 'GetSeriesInfoByMetaId', args: [{ name: 'tokenId', type: 'u64' }, { name: 'romId', type: 'vm_dynamic_variable' }] },
      15: { name: 'GetTokenInfo', args: [{ name: 'tokenId', type: 'u64' }] },
      16: { name: 'GetTokenInfoBySymbol', args: [{ name: 'symbol', type: 'smallstring' }] },
      17: { name: 'GetTokenSupply', args: [{ name: 'tokenId', type: 'u64' }] },
      18: { name: 'GetSeriesSupply', args: [{ name: 'tokenId', type: 'u64' }, { name: 'seriesId', type: 'u32' }] },
      19: { name: 'GetTokenIdBySymbol', args: [{ name: 'symbol', type: 'smallstring' }] },
      20: { name: 'GetBalances', args: [{ name: 'address', type: 'bytes32' }] },
      21: {
        name: 'CreateMintedTokenSeries',
        args: [
          { name: 'tokenId', type: 'u64' },
          { name: 'info', type: 'series_info' },
          { name: 'address', type: 'bytes32' },
          { name: 'roms', type: 'bytes[]' },
          { name: 'rams', type: 'bytes[]' },
        ],
      },
      22: { name: 'ApplyInflation', args: [{ name: 'tokenId', type: 'u64' }] },
      23: { name: 'UpdateTokenMetadata', args: [{ name: 'tokenId', type: 'u64' }, { name: 'metadata', type: 'vm_dynamic_struct' }] },
      24: { name: 'GetNextTokenInflation', args: [{ name: 'tokenId', type: 'u64' }] },
      25: { name: 'SetTokensConfig', args: [{ name: 'config', type: 'tokens_config' }] },
    },
  },
  2: {
    name: 'PhantasmaVm',
    methods: {
      0: {
        name: 'ExecuteScript',
        args: [
          { name: 'maxGas', type: 'u64' },
          { name: 'gasFrom', type: 'bytes32' },
          { name: 'script', type: 'bytes' },
        ],
      },
      1: {
        name: 'RegisterTokenContract',
        args: [
          { name: 'tokenId', type: 'u64' },
          { name: 'symbol', type: 'smallstring' },
          { name: 'script', type: 'bytes' },
          { name: 'abi', type: 'bytes' },
        ],
      },
      2: {
        name: 'DeployContract',
        args: [
          { name: 'from', type: 'bytes32' },
          { name: 'contractName', type: 'smallstring' },
          { name: 'script', type: 'bytes' },
          { name: 'abi', type: 'bytes' },
        ],
      },
      3: { name: 'IsContractDeployed', args: [{ name: 'name', type: 'smallstring' }] },
      4: { name: 'SetConfig', args: [{ name: 'config', type: 'phantasmavm_config' }] },
    },
  },
  3: {
    name: 'Organization',
    methods: {},
  },
  4: {
    name: 'Market',
    methods: {
      0: {
        name: 'SellToken',
        args: [
          { name: 'from', type: 'bytes32' },
          { name: 'tokenId', type: 'u64' },
          { name: 'instanceId', type: 'u64' },
          { name: 'quoteTokenId', type: 'u64' },
          { name: 'price', type: 'intx' },
          { name: 'endDate', type: 'i64' },
        ],
      },
      1: {
        name: 'SellTokenById',
        args: [
          { name: 'from', type: 'bytes32' },
          { name: 'symbol', type: 'smallstring' },
          { name: 'instanceId', type: 'vm_dynamic_variable' },
          { name: 'quoteSymbol', type: 'smallstring' },
          { name: 'price', type: 'intx' },
          { name: 'endDate', type: 'i64' },
        ],
      },
      2: { name: 'CancelSale', args: [{ name: 'tokenId', type: 'u64' }, { name: 'instanceId', type: 'u64' }] },
      3: { name: 'CancelSaleById', args: [{ name: 'symbol', type: 'smallstring' }, { name: 'instanceId', type: 'vm_dynamic_variable' }] },
      4: { name: 'BuyToken', args: [{ name: 'from', type: 'bytes32' }, { name: 'tokenId', type: 'u64' }, { name: 'instanceId', type: 'u64' }] },
      5: { name: 'BuyTokenById', args: [{ name: 'from', type: 'bytes32' }, { name: 'symbol', type: 'smallstring' }, { name: 'instanceId', type: 'vm_dynamic_variable' }] },
      6: { name: 'GetTokenListingCount', args: [{ name: 'tokenId', type: 'u64' }] },
      7: { name: 'GetTokenListingInfo', args: [{ name: 'tokenId', type: 'u64' }, { name: 'instanceId', type: 'u64' }] },
      8: { name: 'GetTokenListingInfoById', args: [{ name: 'symbol', type: 'smallstring' }, { name: 'instanceId', type: 'vm_dynamic_variable' }] },
    },
  },
};

function isEndOfStream(err: unknown): boolean {
  return err instanceof Error && err.message.includes('end of stream');
}

function decodeChainConfig(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    version: reader.read1(),
    reserved1: reader.read1(),
    reserved2: reader.read1(),
    reserved3: reader.read1(),
    allowedTxTypes: reader.read4u(),
    expiryWindow: reader.read4u(),
    blockRateTarget: reader.read4u(),
  };
}

function decodeGasConfig(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    version: reader.read1(),
    maxNameLength: reader.read1(),
    maxTokenSymbolLength: reader.read1(),
    feeShift: reader.read1(),
    maxStructureSize: reader.read4u(),
    feeMultiplier: reader.read8u(),
    gasTokenId: reader.read8u(),
    dataTokenId: reader.read8u(),
    minimumGasOffer: reader.read8u(),
    dataEscrowPerRow: reader.read8u(),
    gasFeeTransfer: reader.read8u(),
    gasFeeQuery: reader.read8u(),
    gasFeeCreateTokenBase: reader.read8u(),
    gasFeeCreateTokenSymbol: reader.read8u(),
    gasFeeCreateTokenSeries: reader.read8u(),
    gasFeePerByte: reader.read8u(),
    gasFeeRegisterName: reader.read8u(),
    gasBurnRatioMul: reader.read8u(),
    gasBurnRatioShift: reader.read1(),
  };
}

function decodePhantasmaVmConfig(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    featureLevel: reader.read4u(),
    gasConstructor: reader.read8u(),
    gasNexus: reader.read8u(),
    gasOrganization: reader.read8u(),
    gasAccount: reader.read8u(),
    gasLeaderboard: reader.read8u(),
    gasStandard: reader.read8u(),
    gasOracle: reader.read8u(),
    fuelPerContractDeploy: reader.readBigInt(),
  };
}

function decodeNodeInfo(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    id: Bytes32.read(reader),
    type: reader.read1(),
  };
}

function decodeNodeList(reader: CarbonBinaryReader): Record<string, unknown> {
  const count = reader.read4();
  if (count < 0) {
    throw new Error('negative node count');
  }
  const nodes: Record<string, unknown>[] = new Array(count);
  for (let i = 0; i < count; i++) {
    nodes[i] = decodeNodeInfo(reader);
  }
  return { nodes };
}

function decodeStakeImport(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    tokenId: reader.read8u(),
    to: Bytes32.read(reader),
    amount: IntX.read(reader),
    time: reader.read8(),
  };
}

function decodeNameImport(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    address: Bytes32.read(reader),
    name: reader.readBlob(SmallString),
  };
}

function decodeMemberImport(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    address: Bytes32.read(reader),
    timestamp: reader.read8(),
  };
}

function decodeOrganizationInfo(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    name: reader.readBlob(SmallString),
    owner: Bytes32.read(reader),
    metadata: reader.readBlob(VmDynamicStruct),
  };
}

function decodeOrganizationImport(reader: CarbonBinaryReader, warnings: string[]): Record<string, unknown> {
  const info = decodeOrganizationInfo(reader);
  const memberImports = decodeArray(reader, 'member_import', warnings);
  return { info, memberImports };
}

function decodeNftImport(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    mintNumber: reader.read4u(),
    originator: Bytes32.read(reader),
    created: reader.read8(),
    rom: reader.readArray(),
    ram: reader.readArray(),
    owner: Bytes32.read(reader),
  };
}

function decodeSeriesImport(reader: CarbonBinaryReader, warnings: string[]): Record<string, unknown> {
  const tokenId = reader.read8u();
  const info = reader.readBlob(SeriesInfo);
  const imports = decodeArray(reader, 'nft_import', warnings);
  return { tokenId, info, imports };
}

function decodeNftMintInfo(reader: CarbonBinaryReader): Record<string, unknown> {
  return {
    seriesId: reader.read4u(),
    rom: reader.readArray(),
    ram: reader.readArray(),
  };
}

function decodeType(reader: CarbonBinaryReader, type: string, warnings: string[]): unknown {
  if (type.endsWith('[]')) {
    const elementType = type.slice(0, -2);
    return decodeArray(reader, elementType, warnings);
  }

  switch (type) {
    case 'bytes':
      return reader.readArray();
    case 'bytes32':
      return Bytes32.read(reader);
    case 'bytes64':
      return Bytes64.read(reader);
    case 'smallstring':
      return reader.readBlob(SmallString);
    case 'u64':
      return reader.read8u();
    case 'i64':
      return reader.read8();
    case 'u32':
      return reader.read4u();
    case 'u8':
      return reader.read1();
    case 'intx':
      return IntX.read(reader);
    case 'vm_dynamic_struct':
      return reader.readBlob(VmDynamicStruct);
    case 'vm_dynamic_variable':
      return reader.readBlob(VmDynamicVariable);
    case 'vm_struct_schema':
      return reader.readBlob(VmStructSchema);
    case 'token_info':
      return reader.readBlob(TokenInfo);
    case 'series_info':
      return reader.readBlob(SeriesInfo);
    case 'tokens_config':
      return { flags: reader.read1() };
    case 'nft_mint_info':
      return decodeNftMintInfo(reader);
    case 'stake_import':
      return decodeStakeImport(reader);
    case 'name_import':
      return decodeNameImport(reader);
    case 'organization_import':
      return decodeOrganizationImport(reader, warnings);
    case 'series_import':
      return decodeSeriesImport(reader, warnings);
    case 'nft_import':
      return decodeNftImport(reader);
    case 'member_import':
      return decodeMemberImport(reader);
    case 'txmsg_mint_fungible':
      return reader.readBlob(TxMsgMintFungible);
    case 'txmsg_call_multi': {
      const multi = reader.readBlob(TxMsgCallMulti);
      const decoded = decodeCarbonCallMulti(multi);
      warnings.push(...decoded.warnings);
      return decoded.calls;
    }
    case 'chain_config':
      return decodeChainConfig(reader);
    case 'gas_config':
      return decodeGasConfig(reader);
    case 'node_info':
      return decodeNodeInfo(reader);
    case 'node_list':
      return decodeNodeList(reader);
    case 'phantasmavm_config':
      return decodePhantasmaVmConfig(reader);
    default:
      throw new Error(`unsupported arg type '${type}'`);
  }
}

function decodeArray(reader: CarbonBinaryReader, elementType: string, warnings: string[]): unknown[] {
  if (elementType === 'bytes') {
    return reader.readArrayOfArrays();
  }
  const length = reader.read4();
  if (length < 0) {
    throw new Error('negative array length');
  }
  const out: unknown[] = new Array(length);
  for (let i = 0; i < length; i++) {
    out[i] = decodeType(reader, elementType, warnings);
  }
  return out;
}

function decodeArgsBytes(
  args: Uint8Array,
  signature: CarbonMethodSignature | undefined
): { args?: CarbonCallArg[]; warnings: string[] } {
  const warnings: string[] = [];
  if (!signature) {
    return { warnings };
  }

  const reader = new CarbonBinaryReader(args);
  const decoded: CarbonCallArg[] = [];
  // Genesis has optional tail args; stop gracefully when the stream ends.
  for (const arg of signature.args) {
    try {
      const value = decodeType(reader, arg.type, warnings);
      decoded.push({
        name: arg.name,
        type: arg.type,
        value: carbonValueToJson(value),
      });
    } catch (err) {
      if (arg.optional && isEndOfStream(err)) {
        break;
      }
      const message = err instanceof Error ? err.message : String(err);
      warnings.push(`Call arg decode failed (${signature.name}.${arg.name}: ${arg.type}): ${message}`);
      return { args: decoded, warnings };
    }
  }

  const remaining = reader.readRemaining();
  if (remaining.length > 0) {
    warnings.push(`Call args left ${remaining.length} trailing bytes`);
  }

  return { args: decoded, warnings };
}

function decodeCallSection(
  section: { registerOffset: number; args: Uint8Array },
  signature: CarbonMethodSignature | undefined
): { section: CarbonCallSection; warnings: string[] } {
  const warnings: string[] = [];
  const decoded: CarbonCallSection = {
    registerOffset: section.registerOffset,
  };

  // Negative offsets indicate a register-only entry without encoded args.
  if (section.registerOffset < 0) {
    return { section: decoded, warnings };
  }

  decoded.argsHex = bytesToHex(section.args);
  const args = decodeArgsBytes(section.args, signature);
  if (args.args) {
    decoded.args = args.args;
  }
  warnings.push(...args.warnings);
  return { section: decoded, warnings };
}

export function decodeCarbonCall(msg: TxMsgCall): { call: CarbonCallDecoded; warnings: string[] } {
  const warnings: string[] = [];
  const moduleSig = MODULE_SIGNATURES[msg.moduleId];
  const methodSig = moduleSig?.methods[msg.methodId];
  const call: CarbonCallDecoded = {
    moduleId: msg.moduleId,
    methodId: msg.methodId,
  };
  const moduleName = moduleSig?.name ?? MODULE_NAMES[msg.moduleId];
  if (moduleName) {
    call.moduleName = moduleName;
  }
  if (methodSig?.name) {
    call.methodName = methodSig.name;
  }

  if (msg.sections && msg.sections.argSections.length > 0) {
    // Arg sections are used instead of the raw args blob.
    call.sections = msg.sections.argSections.map((section) => {
      const decoded = decodeCallSection(section, methodSig);
      warnings.push(...decoded.warnings);
      return decoded.section;
    });
    return { call, warnings };
  }

  call.argsHex = bytesToHex(msg.args);
  const args = decodeArgsBytes(msg.args, methodSig);
  if (args.args) {
    call.args = args.args;
  }
  warnings.push(...args.warnings);
  return { call, warnings };
}

export function decodeCarbonCallMulti(msg: TxMsgCallMulti): { calls: CarbonCallDecoded[]; warnings: string[] } {
  const warnings: string[] = [];
  const calls = msg.calls.map((call) => {
    const decoded = decodeCarbonCall(call);
    warnings.push(...decoded.warnings);
    return decoded.call;
  });
  return { calls, warnings };
}
