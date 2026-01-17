import {
  Address,
  CarbonBinaryReader,
  Bytes32,
  SignedTxMsg,
  TxMsgBurnFungible,
  TxMsgBurnFungibleGasPayer,
  TxMsgBurnNonFungible,
  TxMsgBurnNonFungibleGasPayer,
  TxMsgCall,
  TxMsgCallMulti,
  TxMsgMintFungible,
  TxMsgMintNonFungible,
  TxMsgPhantasma,
  TxMsgPhantasmaRaw,
  TxMsgTrade,
  TxMsgTransferFungible,
  TxMsgTransferFungibleGasPayer,
  TxMsgTransferNonFungibleMulti,
  TxMsgTransferNonFungibleMultiGasPayer,
  TxMsgTransferNonFungibleSingle,
  TxMsgTransferNonFungibleSingleGasPayer,
  TxTypes,
  hexToBytes,
} from 'phantasma-sdk-ts';
import type { CarbonDecoded } from '../types/decoded.js';
import { carbonValueToJson } from './carbon-values.js';
import { decodeCarbonCall, decodeCarbonCallMulti } from './carbon-call.js';

export interface CarbonDecodeResult {
  decoded: CarbonDecoded;
  warnings: string[];
}

export interface CarbonRpcContext {
  gasPayer?: string;
  gasLimit?: string;
  expiration?: number;
  payloadHex?: string;
  signatures?: unknown[];
}

function decodeCarbonPayload(
  type: TxTypes,
  reader: CarbonBinaryReader
): unknown {
  switch (type) {
    case TxTypes.Call:
      return TxMsgCall.read(reader);
    case TxTypes.Call_Multi:
      return TxMsgCallMulti.read(reader);
    case TxTypes.Trade:
      return TxMsgTrade.read(reader);
    case TxTypes.TransferFungible:
      return TxMsgTransferFungible.read(reader);
    case TxTypes.TransferFungible_GasPayer:
      return TxMsgTransferFungibleGasPayer.read(reader);
    case TxTypes.TransferNonFungible_Single:
      return TxMsgTransferNonFungibleSingle.read(reader);
    case TxTypes.TransferNonFungible_Single_GasPayer:
      return TxMsgTransferNonFungibleSingleGasPayer.read(reader);
    case TxTypes.TransferNonFungible_Multi:
      return TxMsgTransferNonFungibleMulti.read(reader);
    case TxTypes.TransferNonFungible_Multi_GasPayer:
      return TxMsgTransferNonFungibleMultiGasPayer.read(reader);
    case TxTypes.MintFungible:
      return TxMsgMintFungible.read(reader);
    case TxTypes.BurnFungible:
      return TxMsgBurnFungible.read(reader);
    case TxTypes.BurnFungible_GasPayer:
      return TxMsgBurnFungibleGasPayer.read(reader);
    case TxTypes.MintNonFungible:
      return TxMsgMintNonFungible.read(reader);
    case TxTypes.BurnNonFungible:
      return TxMsgBurnNonFungible.read(reader);
    case TxTypes.BurnNonFungible_GasPayer:
      return TxMsgBurnNonFungibleGasPayer.read(reader);
    case TxTypes.Phantasma:
      return TxMsgPhantasma.read(reader);
    case TxTypes.Phantasma_Raw:
      return TxMsgPhantasmaRaw.read(reader);
    default:
      throw new Error(`Unsupported transaction type ${type}`);
  }
}

function decodePayloadText(payloadHex?: string): string {
  if (!payloadHex) {
    return '';
  }
  const bytes = hexToBytes(payloadHex);
  return new TextDecoder().decode(bytes);
}

function resolveGasFrom(gasPayer: string | undefined, warnings: string[]): string {
  if (!gasPayer) {
    return '';
  }
  try {
    const address = Address.FromText(gasPayer);
    const pubKey = address.GetPublicKey();
    return new Bytes32(pubKey).ToHex();
  } catch (err) {
    warnings.push(
      `Failed to derive gasFrom from gasPayer: ${err instanceof Error ? err.message : String(err)}`
    );
    return gasPayer;
  }
}

function buildCarbonDecoded(
  type: TxTypes,
  msg: unknown,
  warnings: string[],
  context?: CarbonRpcContext
): CarbonDecoded {
  const typeName = TxTypes[type] ?? `Unknown(${type})`;
  const decoded: CarbonDecoded = {
    type,
    typeName,
    expiry: (context?.expiration ?? 0).toString(),
    maxGas: context?.gasLimit ?? '0',
    maxData: '0',
    gasFrom: resolveGasFrom(context?.gasPayer, warnings),
    payload: decodePayloadText(context?.payloadHex),
    msg: carbonValueToJson(msg),
  };

  return decoded;
}

function attachCallMetadata(msg: unknown, decoded: CarbonDecoded, warnings: string[]): void {
  if (msg instanceof TxMsgCall) {
    const callDecoded = decodeCarbonCall(msg);
    decoded.call = callDecoded.call;
    warnings.push(...callDecoded.warnings);
  } else if (msg instanceof TxMsgCallMulti) {
    const callDecoded = decodeCarbonCallMulti(msg);
    decoded.calls = callDecoded.calls;
    warnings.push(...callDecoded.warnings);
  }
}

export function decodeCarbonSignedTx(hex: string): CarbonDecodeResult {
  const warnings: string[] = [];
  const bytes = hexToBytes(hex);
  const reader = new CarbonBinaryReader(bytes);

  // Carbon tx hex is a SignedTxMsg blob (msg + witnesses).
  const signed = SignedTxMsg.read(reader);
  const remaining = reader.readRemaining();
  if (remaining.length > 0) {
    warnings.push(`Carbon decode left ${remaining.length} trailing bytes`);
  }

  if (!signed.msg) {
    throw new Error('Carbon tx missing msg');
  }

  const msg = signed.msg;
  const type = msg.type as TxTypes;
  const typeName = TxTypes[type] ?? `Unknown(${type})`;
  const decoded: CarbonDecoded = {
    type,
    typeName,
    expiry: msg.expiry.toString(),
    maxGas: msg.maxGas.toString(),
    maxData: msg.maxData.toString(),
    gasFrom: msg.gasFrom.ToHex(),
    payload: msg.payload?.data ?? '',
    msg: carbonValueToJson(msg.msg ?? null),
    witnesses: carbonValueToJson(signed.witnesses ?? []),
  };

  attachCallMetadata(msg.msg ?? null, decoded, warnings);

  return { decoded, warnings };
}

export function decodeCarbonPayloadForRpc(
  typeRaw: number,
  msgHex: string,
  context: CarbonRpcContext
): CarbonDecodeResult {
  const warnings: string[] = [];
  const bytes = hexToBytes(msgHex);
  const reader = new CarbonBinaryReader(bytes);
  const type = typeRaw as TxTypes;

  // RPC carbonTxData contains only the TxMsg payload, not the SignedTxMsg header.
  const msg = decodeCarbonPayload(type, reader);
  const remaining = reader.readRemaining();
  if (remaining.length > 0) {
    warnings.push(`Carbon decode left ${remaining.length} trailing bytes`);
  }

  const decoded = buildCarbonDecoded(type, msg, warnings, context);
  if (context.signatures) {
    decoded.witnesses = carbonValueToJson(context.signatures);
  }
  attachCallMetadata(msg, decoded, warnings);
  return { decoded, warnings };
}
