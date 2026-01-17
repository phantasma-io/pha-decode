export type OutputFormat = 'json' | 'pretty';
export type DecodeSourceKind = 'tx-hex' | 'tx-hash' | 'event-hex';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export interface RpcMeta {
  url: string;
  method: string;
}

export interface CarbonDecoded {
  type: number;
  typeName: string;
  expiry: string;
  maxGas: string;
  maxData: string;
  gasFrom: string;
  payload: string;
  msg?: JsonValue;
  witnesses?: JsonValue;
  call?: CarbonCallDecoded;
  calls?: CarbonCallDecoded[];
}

export interface CarbonCallArg {
  name: string;
  type: string;
  value?: JsonValue;
  error?: string;
}

export interface CarbonCallSection {
  registerOffset: number;
  argsHex?: string;
  args?: CarbonCallArg[];
}

export interface CarbonCallDecoded {
  moduleId: number;
  methodId: number;
  moduleName?: string;
  methodName?: string;
  argsHex?: string;
  args?: CarbonCallArg[];
  sections?: CarbonCallSection[];
}

export interface VmInstruction {
  offset: number;
  opcode: number;
  opcodeName: string;
  args: JsonValue[];
}

export interface VmMethodCallArg {
  vmType: string;
  value: JsonValue;
  name?: string;
  abiType?: string;
}

export interface VmMethodCall {
  contract: string;
  method: string;
  args: VmMethodCallArg[];
}

export interface VmDecoded {
  nexus: string;
  chain: string;
  scriptHex: string;
  payloadHex: string;
  expirationUnix: number;
  signatures: number;
  instructions?: VmInstruction[];
  methodCalls?: VmMethodCall[];
}

export interface EventDecoded {
  kind?: string;
  kindId?: number;
  rawHex: string;
  decoded?: JsonValue;
}

export interface DecodeOutput {
  source: DecodeSourceKind;
  input: string;
  format: OutputFormat;
  rpc?: RpcMeta;
  carbon?: CarbonDecoded;
  vm?: VmDecoded;
  event?: EventDecoded;
  warnings: string[];
  errors: string[];
}
