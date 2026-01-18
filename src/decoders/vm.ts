import { hexToBytes, PBinaryReader } from 'phantasma-sdk-ts';
import type { VmDecoded } from '../types/decoded.js';
import { disassembleVmScript } from './vm-disasm.js';
import type { AbiMethodSpecEntry } from '../abi/loader.js';

export interface VmDecodeResult {
  decoded: VmDecoded;
  warnings: string[];
}

function isPrintableAscii(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 32 || code > 126) {
      return false;
    }
  }
  return true;
}

function readByteArrayHex(reader: PBinaryReader): string {
  const length = reader.readVarInt();
  if (length === 0) {
    return '';
  }
  return reader.read(length);
}

export function decodeVmTransaction(
  hex: string,
  methodTable?: Map<string, AbiMethodSpecEntry>,
  protocolVersion?: number
): VmDecodeResult {
  const warnings: string[] = [];
  const bytes = hexToBytes(hex);
  const reader = new PBinaryReader(bytes);

  // VM tx starts with nexus/chain strings; validate they look sane before trusting the parse.
  const nexus = reader.readString();
  const chain = reader.readString();
  if (!isPrintableAscii(nexus) || !isPrintableAscii(chain)) {
    throw new Error('VM decode produced non-printable nexus/chain');
  }

  const scriptHex = readByteArrayHex(reader);
  const expiration = reader.readTimestamp().value;
  const payloadHex = readByteArrayHex(reader);
  const signatureCount = reader.readVarInt();

  for (let i = 0; i < signatureCount; i++) {
    // Advance the reader; signature details are not decoded yet.
    reader.readSignatureV2();
  }

  if (!reader.isEndOfStream) {
    warnings.push('VM decode did not consume all bytes');
  }

  const decoded: VmDecoded = {
    nexus,
    chain,
    scriptHex,
    payloadHex,
    expirationUnix: expiration,
    signatures: signatureCount,
  };

  if (scriptHex.length > 0) {
    try {
      const disasm = disassembleVmScript(scriptHex, methodTable, protocolVersion);
      decoded.instructions = disasm.instructions;
      decoded.methodCalls = disasm.methodCalls;
      warnings.push(...disasm.warnings);
    } catch (err) {
      warnings.push(`VM disassembly failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { decoded, warnings };
}
