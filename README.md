# phadec

CLI tool for decoding Phantasma transactions (Carbon + VM) and hex-encoded event data.

## Features
- Decode Carbon transactions (Call, Call_Multi, mint/burn/transfer).
- Decode VM transactions (script disassembly + method calls).
- Decode hex-encoded event data for classic events.
- JSON or pretty output.
- Optional ABI resolution from files or RPC.

## Requirements
- Node.js with ESM support (Node 18+ recommended).

## Installation
```bash
npm install
npm run build
```

## Usage
```bash
phadec <txHex>
phadec tx --hex <txHex>
phadec tx --hash <txHash> --rpc <url>
phadec event --hex <eventHex> [--kind <eventKind>]
```

## Options
- `--format <json|pretty>` Output format (default: `pretty`).
- `--rpc <url>` RPC endpoint for `--hash` (use JSON-RPC, e.g. `https://pharpc1.phantasma.info/rpc`).
- `--resolve` Fetch contracts from RPC and merge ABI for VM call decoding.
- `--abi <path>` ABI JSON file or directory (merged with built-ins).
- `--vm-detail <all|calls|ops|none>` Control VM output detail (default: `all`).
- `--carbon-detail <all|call|msg|none>` Control Carbon output detail (default: `call`).
- `--verbose` Enable SDK logging.
- `--kind <eventKind>` Event kind hint for hex-encoded (classic) events (event mode only).
- `--help` Show help.

## Examples
Decode a tx hash from RPC:
```bash
phadec tx --hash 155422A6882C3342933521DDC1A335292BF6448DBD489ED0BE21CFC74AFBA52A \
  --rpc https://pharpc1.phantasma.info/rpc \
  --format json \
  --vm-detail calls \
  --carbon-detail call
```

Decode a local tx hex (shorthand):
```bash
phadec 0xDEADBEEF...
```

Decode hex-encoded event data (classic event):
```bash
phadec event --hex 0xAABBCC... --kind TokenMint
```

## Output
JSON output is stable and machine-friendly:
```json
{
  "source": "tx-hash",
  "input": "155422A6...",
  "rpc": { "url": "https://...", "method": "getTransaction" },
  "carbon": { "...": "..." },
  "vm": { "...": "..." },
  "event": { "...": "..." },
  "warnings": [],
  "errors": []
}
```

Notes:
- Field `carbon.call` is the human-readable call decode (module/method + args).
- Field `carbon.msg` is the raw payload decode (moduleId/methodId + args hex).
- Use `--carbon-detail` to show one or both.
- Event hex decoding applies to classic events; newer structured events do not need hex decoding.
- If `--kind` is omitted in event mode, the tool returns raw hex with a warning.

## Dev shortcuts
This repo ships a `justfile`:
- `just` list commands
- `just b` build
- `just r <args>` run `dist/cli/index.js`
- `just d <args>` run in dev mode (tsx)

## Limitations
- `--resolve` depends on `getContracts` RPC output. If the RPC returns an empty set, VM calls remain unresolved.
- Unknown methods or argument types fall back to raw hex (no guessing).
