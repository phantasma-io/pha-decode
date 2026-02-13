import type {
  CliOptions,
  ParseResult,
  CliCommand,
  VmDetailMode,
  CarbonDetailMode,
} from '../types/cli.js';
import type { OutputFormat } from '../types/decoded.js';
import { DomainSettings } from 'phantasma-sdk-ts';

const DEFAULT_FORMAT: OutputFormat = 'pretty';
const DEFAULT_VM_DETAIL: VmDetailMode = 'all';
const DEFAULT_CARBON_DETAIL: CarbonDetailMode = 'call';
const DEFAULT_PROTOCOL_VERSION = DomainSettings.LatestKnownProtocol;

function isCommand(value: string): value is CliCommand {
  return value === 'tx' || value === 'event';
}

function parseFormat(value: string): OutputFormat | null {
  if (value === 'json' || value === 'pretty') {
    return value;
  }
  return null;
}

function parseVmDetail(value: string): VmDetailMode | null {
  switch (value) {
    case 'all':
    case 'both':
      return 'all';
    case 'calls':
    case 'methods':
      return 'calls';
    case 'ops':
    case 'opcodes':
      return 'ops';
    case 'none':
    case 'off':
      return 'none';
    default:
      return null;
  }
}

function parseCarbonDetail(value: string): CarbonDetailMode | null {
  switch (value) {
    case 'all':
    case 'call':
    case 'msg':
    case 'none':
      return value;
    default:
      return null;
  }
}

function parseProtocol(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function setFlagValue(
  opts: CliOptions,
  key: string,
  value: string
): string | null {
  switch (key) {
    case 'rpc':
      opts.rpcUrl = value;
      return null;
    case 'abi':
      opts.abiPath = value;
      return null;
    case 'hash':
    case 'tx':
      opts.txHash = value;
      return null;
    case 'hex':
      if (opts.command === 'event') {
        opts.eventHex = value;
      } else {
        opts.txHex = value;
      }
      return null;
    case 'event-hex':
      opts.eventHex = value;
      return null;
    case 'kind':
      opts.eventKind = value;
      return null;
    case 'format': {
      const format = parseFormat(value);
      if (!format) {
        return `unknown format: ${value}`;
      }
      opts.format = format;
      return null;
    }
    case 'vm-detail': {
      const vmDetail = parseVmDetail(value);
      if (!vmDetail) {
        return `unknown vm detail: ${value}`;
      }
      opts.vmDetail = vmDetail;
      return null;
    }
    case 'carbon-detail': {
      const carbonDetail = parseCarbonDetail(value);
      if (!carbonDetail) {
        return `unknown carbon detail: ${value}`;
      }
      opts.carbonDetail = carbonDetail;
      return null;
    }
    case 'protocol':
    case 'protocol-version': {
      const protocolVersion = parseProtocol(value);
      if (protocolVersion === null) {
        return `invalid protocol version: ${value}`;
      }
      opts.protocolVersion = protocolVersion;
      return null;
    }
    default:
      return `unknown flag: --${key}`;
  }
}

function validateOptions(opts: CliOptions): string | null {
  if (opts.command === 'tx') {
    if (!opts.txHex && !opts.txHash) {
      return 'tx mode requires --hex <txHex> or --hash <txHash>';
    }
    if (opts.txHex && opts.txHash) {
      return 'use only one of --hex or --hash';
    }
  } else if (opts.command === 'event') {
    if (!opts.eventHex) {
      return 'event mode requires --hex <eventHex>';
    }
  }
  return null;
}

export function parseArgs(argv: string[]): ParseResult {
  if (argv.length === 0) {
    return { kind: 'help' };
  }

  if (argv.includes('--help') || argv.includes('-h')) {
    return { kind: 'help' };
  }

  // Shorthand: no flags, single arg => tx hex
  const firstArg = argv[0];
  if (argv.length === 1 && firstArg && !firstArg.startsWith('-')) {
    const opts: CliOptions = {
      command: 'tx',
      format: DEFAULT_FORMAT,
      resolve: false,
      verbose: false,
      vmDetail: DEFAULT_VM_DETAIL,
      carbonDetail: DEFAULT_CARBON_DETAIL,
      protocolVersion: DEFAULT_PROTOCOL_VERSION,
      txHex: firstArg,
    };
    const err = validateOptions(opts);
    if (err) {
      return { kind: 'error', message: err };
    }
    return { kind: 'ok', options: opts };
  }

  const first = argv[0];
  let command: CliCommand = 'tx';
  let index = 0;
  if (first && isCommand(first)) {
    command = first;
    index = 1;
  }

  const opts: CliOptions = {
    command,
    format: DEFAULT_FORMAT,
    resolve: false,
    verbose: false,
    vmDetail: DEFAULT_VM_DETAIL,
    carbonDetail: DEFAULT_CARBON_DETAIL,
    protocolVersion: DEFAULT_PROTOCOL_VERSION,
  };

  while (index < argv.length) {
    const token = argv[index];
    if (!token) {
      index += 1;
      continue;
    }

    if (token === '--resolve') {
      opts.resolve = true;
      index += 1;
      continue;
    }

    if (token === '--verbose') {
      opts.verbose = true;
      index += 1;
      continue;
    }

    if (!token.startsWith('--')) {
      return { kind: 'error', message: `unexpected argument: ${token}` };
    }

    const [rawKeyRaw, rawValue] = token.slice(2).split('=');
    const rawKey = rawKeyRaw ?? '';
    if (!rawKey) {
      return { kind: 'error', message: 'missing flag name' };
    }
    if (rawValue !== undefined) {
      const err = setFlagValue(opts, rawKey, rawValue);
      if (err) {
        return { kind: 'error', message: err };
      }
      index += 1;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      return { kind: 'error', message: `missing value for --${rawKey}` };
    }
    const err = setFlagValue(opts, rawKey, value);
    if (err) {
      return { kind: 'error', message: err };
    }
    index += 2;
  }

  const validationError = validateOptions(opts);
  if (validationError) {
    return { kind: 'error', message: validationError };
  }

  return { kind: 'ok', options: opts };
}

export function printHelp(): void {
  const text = `Usage:
  pha-decode <txHex>
  pha-decode tx --hex <txHex>
  pha-decode tx --hash <txHash> [--rpc <url>]
  pha-decode event --hex <eventHex> [--kind <kind>]

Options:
  --format <json|pretty>  Output format (default: pretty)
  --vm-detail <mode>      VM output detail: all|calls|ops|none (default: all)
  --carbon-detail <mode>  Carbon output detail: all|call|msg|none (default: call)
  --protocol <number>     Protocol version for interop ABI selection (default: latest)
  --rpc <url>             RPC endpoint for --hash
  --resolve               Enable extra RPC-based resolution
  --verbose               Enable SDK logging
  --version               Show version number
  --abi <path>            ABI JSON file or directory
  --kind <eventKind>      Event kind hint for hex-encoded (classic) events
  --help                  Show this help
`;
  console.log(text);
}
