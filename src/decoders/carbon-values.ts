import { bytesToHex, Bytes32, Bytes64, IntX, SmallString } from 'phantasma-sdk-ts';
import type { JsonValue } from '../types/decoded.js';

// Normalize Carbon SDK values into JSON-friendly primitives for stable CLI output.
export function carbonValueToJson(value: unknown): JsonValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Bytes32 || value instanceof Bytes64) {
    return value.ToHex();
  }

  if (value instanceof SmallString) {
    return value.data;
  }

  if (value instanceof IntX) {
    return value.toString();
  }

  if (value instanceof Uint8Array) {
    return bytesToHex(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => carbonValueToJson(item));
  }

  if (typeof value === 'object') {
    const out: { [key: string]: JsonValue } = {};
    for (const [key, item] of Object.entries(value)) {
      if (typeof item === 'function') {
        continue;
      }
      out[key] = carbonValueToJson(item);
    }
    return out;
  }

  return String(value);
}
