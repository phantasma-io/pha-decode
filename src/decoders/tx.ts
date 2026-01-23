import type { CarbonDecoded, DecodeOutput, OutputFormat } from '../types/decoded.js';
import { bytesToHex, hexToBytes, TxTypes } from 'phantasma-sdk-ts';
import { decodeCarbonPayloadForRpc, decodeCarbonSignedTx } from './carbon.js';
import { decodeVmTransaction } from './vm.js';
import { fetchTransaction } from '../rpc/phantasma.js';
import type { TransactionData } from 'phantasma-sdk-ts';
import { disassembleVmScript } from './vm-disasm.js';
import type { AbiMethodSpecEntry } from '../abi/loader.js';

function buildBaseOutput(source: DecodeOutput['source'], input: string, format: OutputFormat): DecodeOutput {
  return {
    source,
    input,
    format,
    warnings: [],
    errors: [],
  };
}

function extractPhantasmaRawTxHex(msg: CarbonDecoded['msg']): string | null {
  if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
    return null;
  }
  const transaction = (msg as Record<string, unknown>).transaction;
  return typeof transaction === 'string' && transaction.length > 0 ? transaction : null;
}

function attachInnerVmIfPhantasmaRaw(
  output: DecodeOutput,
  methodTable?: Map<string, AbiMethodSpecEntry>,
  protocolVersion?: number
): void {
  if (!output.carbon || output.carbon.type !== TxTypes.Phantasma_Raw) {
    return;
  }
  // Phantasma_Raw wraps a full VM transaction; decode it to expose the inner payload.
  const txHex = extractPhantasmaRawTxHex(output.carbon.msg);
  if (!txHex) {
    output.warnings.push('Phantasma_Raw payload missing inner transaction bytes');
    return;
  }
  try {
    const vm = decodeVmTransaction(txHex, methodTable, protocolVersion);
    output.vm = vm.decoded;
    output.warnings.push(...vm.warnings);
  } catch (err) {
    output.warnings.push(
      `Phantasma_Raw inner VM decode failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export function decodeTxHex(
  hex: string,
  format: OutputFormat,
  methodTable?: Map<string, AbiMethodSpecEntry>,
  protocolVersion?: number
): DecodeOutput {
  const output = buildBaseOutput('tx-hex', hex, format);
  let normalized: string;
  try {
    normalized = bytesToHex(hexToBytes(hex));
  } catch (err) {
    output.errors.push(err instanceof Error ? err.message : String(err));
    return output;
  }

  try {
    // Prefer Carbon decode first; if it fails, fall back to VM decoding.
    const carbon = decodeCarbonSignedTx(normalized);
    output.carbon = carbon.decoded;
    output.warnings.push(...carbon.warnings);
    attachInnerVmIfPhantasmaRaw(output, methodTable, protocolVersion);
    return output;
  } catch {
    // Carbon parse failed; try VM next.
  }

  try {
    const vm = decodeVmTransaction(normalized, methodTable, protocolVersion);
    output.vm = vm.decoded;
    output.warnings.push(...vm.warnings);
    return output;
  } catch (err) {
    output.errors.push(err instanceof Error ? err.message : String(err));
  }

  output.errors.push('failed to decode as Carbon or VM');
  return output;
}

function decodeVmFromRpc(
  tx: TransactionData,
  methodTable?: Map<string, AbiMethodSpecEntry>,
  protocolVersion?: number
): { vm: NonNullable<DecodeOutput['vm']>; warnings: string[] } {
  // RPC provides script/payload but not the serialized VM tx container.
  const warnings: string[] = [];
  const decoded: DecodeOutput['vm'] = {
    nexus: '',
    chain: tx.chainAddress,
    scriptHex: tx.script ?? '',
    payloadHex: tx.payload ?? '',
    expirationUnix: tx.expiration ?? 0,
    signatures: tx.signatures?.length ?? 0,
  };
  if (decoded.scriptHex) {
    try {
      const disasm = disassembleVmScript(decoded.scriptHex, methodTable, protocolVersion);
      decoded.instructions = disasm.instructions;
      decoded.methodCalls = disasm.methodCalls;
      warnings.push(...disasm.warnings);
    } catch {
      warnings.push('VM disassembly failed for RPC script');
    }
  }
  return { vm: decoded, warnings };
}

export async function decodeTxHash(
  hash: string,
  rpcUrl: string,
  format: OutputFormat,
  methodTable?: Map<string, AbiMethodSpecEntry>,
  protocolVersion?: number
): Promise<DecodeOutput> {
  const output = buildBaseOutput('tx-hash', hash, format);
  output.rpc = { url: rpcUrl, method: 'getTransaction' };

  let tx: TransactionData;
  try {
    tx = await fetchTransaction(rpcUrl, hash);
  } catch (err) {
    output.errors.push(err instanceof Error ? err.message : String(err));
    return output;
  }

  const carbonData = (tx.carbonTxData ?? '').trim();
  if (carbonData.length > 0 && carbonData !== '0x') {
    try {
      const normalized = bytesToHex(hexToBytes(carbonData));
      const carbon = decodeCarbonSignedTx(normalized);
      output.carbon = carbon.decoded;
      output.warnings.push(...carbon.warnings);
      attachInnerVmIfPhantasmaRaw(output, methodTable, protocolVersion);
      return output;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      output.warnings.push(`SignedTxMsg decode failed (${message}); trying payload-only decode`);
      try {
        const normalized = bytesToHex(hexToBytes(carbonData));
        const carbon = decodeCarbonPayloadForRpc(tx.carbonTxType ?? 0, normalized, {
          gasPayer: tx.gasPayer,
          gasLimit: tx.gasLimit,
          expiration: tx.expiration,
          payloadHex: tx.payload,
          signatures: tx.signatures,
        });
        output.carbon = carbon.decoded;
        output.warnings.push(...carbon.warnings);
        attachInnerVmIfPhantasmaRaw(output, methodTable, protocolVersion);
        return output;
      } catch (payloadErr) {
        output.warnings.push(
          payloadErr instanceof Error ? payloadErr.message : String(payloadErr)
        );
      }
    }
  }

  const vmResult = decodeVmFromRpc(tx, methodTable, protocolVersion);
  output.vm = vmResult.vm;
  output.warnings.push(...vmResult.warnings);
  output.warnings.push('RPC does not expose full VM tx bytes; output is script/payload only');
  return output;
}
