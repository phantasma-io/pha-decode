# pha-decode

CLI tool for decoding Phantasma transactions (Carbon + VM) and hex-encoded event data.

## Features
- Decode Carbon transactions (Call, Call_Multi, mint/burn/transfer).
- Decode VM transactions (script disassembly + method calls).
- Decode hex-encoded event data for classic events.
- Decode NFT ROM bytes with dedicated parsers:
  - legacy/common VM dictionary ROM format,
  - CROWN-specific ROM layout (address + timestamp).
- Convert Carbon `bytes32` addresses to Phantasma addresses and back.
- JSON or pretty output.
- Optional ABI resolution from files or RPC.

## Requirements
- Node.js with ESM support (Node 18+ recommended).

## Installation
```bash
# install globally (recommended for CLI usage)
npm i -g pha-decode

# or run once via npx
npx pha-decode --help

# local dev install
npm install
npm run build
```

## Usage
```bash
pha-decode <txHex>
pha-decode tx --hex <txHex>
pha-decode tx --hash <txHash> --rpc <url>
pha-decode event --hex <eventHex> [--kind <eventKind>]
pha-decode rom --hex <romHex> [--symbol <symbol>] [--token-id <tokenId>] [--rom-format <mode>]
pha-decode address --bytes32 <hex>
pha-decode address --pha <address>
```

## Hex input expectations (tx mode)
`pha-decode tx --hex` accepts **either**:
- a full Carbon **SignedTxMsg** hex (serialized transaction bytes), or
- a raw VM **script** hex.

It does **not** accept the `carbonTxData` field returned by RPC. `carbonTxData` is
payload-only (no SignedTxMsg header), so the CLI cannot decode it by itself.
If you only have a tx hash or RPC response, use `--hash` instead:

```bash
pha-decode tx --hash <txHash> --rpc <url>
```

Notes:
- For Carbon `Phantasma_Raw` transactions, `pha-decode` extracts and decodes the
  inner VM transaction automatically. Use `--vm-detail` (and `--resolve` if you
  have ABI data) to inspect method calls.
- If RPC lacks full VM bytes, the tool falls back to script/payload fields and
  emits a warning.

## Options
- `--format <json|pretty>` Output format (default: `pretty`).
- `--rpc <url>` RPC endpoint for `--hash` (use JSON-RPC, e.g. `https://pharpc1.phantasma.info/rpc`).
- `--resolve` Fetch contracts from RPC and merge ABI for VM call decoding.
- `--abi <path>` ABI JSON file or directory (merged with built-ins).
- `--vm-detail <all|calls|ops|none>` Control VM output detail (default: `all`).
- `--carbon-detail <all|call|msg|none>` Control Carbon output detail (default: `call`).
- `--protocol <number>` Protocol version for interop ABI selection (default: latest known).
- `--verbose` Enable SDK logging.
- `--kind <eventKind>` Event kind hint for hex-encoded (classic) events (event mode only).
- `--symbol <symbol>` ROM symbol hint (rom mode only, e.g. `CROWN`).
- `--token-id <tokenId>` ROM token id hint (rom mode only; used for CROWN display name).
- `--rom-format <auto|legacy|crown>` Select ROM parser mode (default: `auto`).
- `--bytes32 <hex>` Carbon bytes32 address input (address mode only).
- `--pha <address>` Phantasma address input (address mode only).
- `--help` Show help.

## Examples
Decode a tx hash from RPC:
```bash
pha-decode tx --hash 155422A6882C3342933521DDC1A335292BF6448DBD489ED0BE21CFC74AFBA52A \
  --rpc https://pharpc1.phantasma.info/rpc \
  --format json \
  --vm-detail calls \
  --carbon-detail call
```

Decode a local tx hex (shorthand):
```bash
pha-decode 0xDEADBEEF...
```

Decode hex-encoded event data (classic event):
```bash
pha-decode event --hex 0xAABBCC... --kind TokenMint
```

Decode ROM in auto mode (uses `CROWN` hint to pick the dedicated parser):
```bash
pha-decode rom \
  --hex 220100F100396A4B73E3ABCD6B9039712944D7DF9E8ABE7211E519A91176E83A28D01B10027965 \
  --symbol CROWN \
  --token-id 80367770225206466995541877216191568684251978941303868068127874072614271067693 \
  --format pretty
```

Force legacy/common ROM parser:
```bash
pha-decode rom --hex 0x... --rom-format legacy
```

Decode Carbon `bytes32` into a Phantasma address:
```bash
pha-decode address --bytes32 f100396a4b73e3abcd6b9039712944d7df9e8abe7211e519a91176e83a28d01b
```

Convert Phantasma address back to Carbon `bytes32`:
```bash
pha-decode address --pha P2KKzrLNZK75f4Vtp4wwWocfgoqywBo3zKBWxBXjLgbxXmL
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
- ROM decoding has separate parser paths:
  - `legacy` for common historical VM dictionary ROMs,
  - `crown` for CROWN ROMs (`Address` + `UInt32` timestamp), which is intentionally not a generic NFT ROM schema.
- Address conversion mode:
  - `--bytes32` -> `--pha` infers Carbon kind via chain rule (`first 15 bytes == 0` => system, otherwise user),
  - `--pha` -> `--bytes32` supports user/system addresses; interop addresses are rejected.

## Dev shortcuts
This repo ships a `justfile`:
- `just` list commands
- `just b` build
- `just t` run tests
- `just r <args>` run `dist/cli/index.js`
- `just d <args>` run in dev mode (tsx)

## Limitations
- `--resolve` depends on `getContracts` RPC output. If the RPC returns an empty set, VM calls remain unresolved.
- Unknown methods or argument types fall back to raw hex (no guessing).
- ROM auto mode chooses parser from context (`CROWN` => crown parser), then falls back to the other parser with a warning if the first parser fails.
