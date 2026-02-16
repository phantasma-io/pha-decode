import type { OutputFormat } from './decoded.js';

export type CliCommand = 'tx' | 'event' | 'rom';
export type VmDetailMode = 'all' | 'calls' | 'ops' | 'none';
export type CarbonDetailMode = 'all' | 'call' | 'msg' | 'none';
export type RomDecodeMode = 'auto' | 'legacy' | 'crown';

export interface CliOptions {
  command: CliCommand;
  format: OutputFormat;
  resolve: boolean;
  verbose: boolean;
  vmDetail: VmDetailMode;
  carbonDetail: CarbonDetailMode;
  romMode: RomDecodeMode;
  protocolVersion: number;
  rpcUrl?: string;
  abiPath?: string;
  txHash?: string;
  txHex?: string;
  eventHex?: string;
  eventKind?: string;
  romHex?: string;
  romSymbol?: string;
  romTokenId?: string;
}

export type ParseResult =
  | { kind: 'ok'; options: CliOptions }
  | { kind: 'help'; message?: string }
  | { kind: 'error'; message: string };
