import type { OutputFormat } from './decoded.js';

export type CliCommand = 'tx' | 'event';
export type VmDetailMode = 'all' | 'calls' | 'ops' | 'none';
export type CarbonDetailMode = 'all' | 'call' | 'msg' | 'none';

export interface CliOptions {
  command: CliCommand;
  format: OutputFormat;
  resolve: boolean;
  verbose: boolean;
  vmDetail: VmDetailMode;
  carbonDetail: CarbonDetailMode;
  protocolVersion: number;
  rpcUrl?: string;
  abiPath?: string;
  txHash?: string;
  txHex?: string;
  eventHex?: string;
  eventKind?: string;
}

export type ParseResult =
  | { kind: 'ok'; options: CliOptions }
  | { kind: 'help'; message?: string }
  | { kind: 'error'; message: string };
