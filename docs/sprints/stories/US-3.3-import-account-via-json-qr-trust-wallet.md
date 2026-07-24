---
id: US-3.3
title: "Import account via JSON / QR / Trust Wallet"
epic: EPIC-3
status: done
priority: P1
points: 5
sprint: sprint-2025-M12
version_shipped: 1.3.71
prd_ref: [FR-16, FR-17, FR-18]
arch_ref: [AD-04, AD-11]
depends_on: [US-3.2, US-2.1]
assignee: bluezdot
commit: e3453f101af3d7a5d3388f08e1fc130e024a42dd, c0a2b55a98ddd265d4a842fc30c55424170fbd9e, 41c8c56ea7b5318c6eb4cf46e0237ffec81c5670
created: 2026-06-11
updated: 2026-06-11
---

## Goal

A user migrating from another wallet can bring an account in by the three
remaining import formats — a JSON keystore file (single account or batch
restore), a scanned QR code, or a Trust Wallet recovery phrase on its own
derivation path — so that no matter how their previous wallet exported keys,
SubWallet can restore them without forcing a re-create.

## Status

> **✅ done — shipped in 1.3.71.** All 4 acceptance criteria are ticked and the 14 rows below are
> settled: 13 delivered, 1 closed without shipping.

## Background

US-3.2 covered the two raw-secret import paths (seed phrase, private key). This
story completes the import surface with the three *encoded* / *foreign-format*
paths:

- **JSON keystore ([FR-16](../../PRD.md#functional-requirements))** — an encrypted backup file unlocked
  with its own password; supports both a single account and a batch restore of
  many accounts from one file.
- **QR code ([FR-17](../../PRD.md#functional-requirements))** — an account payload (e.g. an account QR
  exported by another SubWallet/Polkadot-ecosystem wallet) scanned by camera.
- **Trust Wallet ([FR-18](../../PRD.md#functional-requirements))** — a recovery phrase imported on the
  *Trust Wallet derivation path* so the same addresses Trust produced are
  reproduced here.

All three decode/parse the secret **only in the background keyring**
([AD-04](../../ARCHITECTURE.md#architecture-decisions)); no key bytes cross to
the UI or inject scripts — the "no key on the message bus" invariant from
[EPIC-3](../epics/EPIC-3.md). A mnemonic-bearing JSON restore reconstructs the
account proxy it encoded (a **Unified Account**,
[AD-11](../../ARCHITECTURE.md#architecture-decisions), if the keystore held one);
a single-key payload stays solo, mirroring US-3.2's branching. A **Trust Wallet**
phrase imports as a **solo** account on the Trust derivation path (it is not
merged into the unified model — Trust solo accounts are explicitly excluded from
unified migration).

Materializes [FR-16](../../PRD.md#functional-requirements), [FR-17](../../PRD.md#functional-requirements) and
[FR-18](../../PRD.md#functional-requirements). **Retroactive** — all three formats already ship;
`commit` / `version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a valid JSON keystore file and its correct password,
  **When** the user imports it, **Then** the account(s) are decrypted **in the
  background** (AD-04) and added; a batch file restores every account it
  contains.
- [x] **AC-2** — **Given** a valid account QR code, **When** the user scans it,
  **Then** the encoded account is parsed in the background and added with the
  correct address(es).
- [x] **AC-3** — **Given** a Trust Wallet recovery phrase, **When** the user
  imports it, **Then** a **solo** account is derived on the Trust Wallet
  derivation path and the resulting addresses match Trust Wallet's.
- [x] **AC-4** — **Given** a malformed JSON file, a wrong keystore password, or
  an unrecognized QR payload, **When** the user submits it, **Then** import is
  rejected with a clear error and no partial account is persisted.

## Tasks

- [x] **TASK-3.3.1** — JSON keystore import: single + batch restore (AC: 1, 4)
  - [x] Decrypt with keystore password in the background keyring; persist under master password.
- [x] **TASK-3.3.2** — QR-code account import via camera scan (AC: 2, 4)
  - [x] Decode payload in background; validate before persisting.
- [x] **TASK-3.3.3** — Trust Wallet phrase import on Trust derivation path (AC: 3)
- [x] **TASK-3.3.4** — Shared validation + error states across all three formats (AC: 4)

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — keystore decryption, QR
  decode and Trust phrase parsing all stay in the background; UI passes the file
  / scan / phrase, never receives key bytes.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — a JSON restore yields
  whatever account proxy it encoded (unified or solo); a single-key payload stays
  solo. A Trust Wallet phrase imports as a solo account on the Trust derivation
  path and is not folded into the unified model.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md) —
  extends the same import surface and solo-vs-unified branching.
- Builds on US-2.1 (keyring engine) — reuses the background persistence path.
- Sibling [US-3.4](US-3.4-export-keys-multi-account-management.md) — JSON
  keystore is the inverse of export; coordinate the keystore format.

### References

- [Source: PRD FR-16](../../PRD.md#functional-requirements) — import via JSON keystore (single / batch)
- [Source: PRD FR-17](../../PRD.md#functional-requirements) — import by scanning a QR code
- [Source: PRD FR-18](../../PRD.md#functional-requirements) — import a Trust Wallet account
- [Source: ARCHITECTURE AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to background
- [Source: CONTEXT D37](../../CONTEXT.md) — Unified Account model

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: import a known JSON keystore (single + batch) → all accounts restored |
| AC-2 | Manual: scan a known account QR → account added with correct address |
| AC-3 | Manual: import a Trust Wallet phrase → addresses match Trust Wallet |
| AC-4 | Unit test: malformed JSON / wrong keystore password / bad QR → rejected, no account persisted |

## Changelog entry

### Added
- Import account via JSON keystore file (single account and batch restore), via
  scanned QR code, and via Trust Wallet recovery phrase (Trust derivation path),
  each with validation and error states.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`,
`version_shipped` and any implementation caveats during version reconciliation._

## Incremental work, fixes & chores

**14 tracker issues** landed on the remaining import formats — 10 with a release, 3 delivered with
no line naming them, 1 closed without shipping. Folded in from the former one-issue-per-story
maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.1 | [#88](https://github.com/Koniverse/SubWallet-Extension/issues/88) | Improved json import screen | ✅ done |
| 0.3.1 | [#107](https://github.com/Koniverse/SubWallet-Extension/issues/107) | Can't restore account when the previous .json file is invalid | ✅ done |
| 0.4.9 | [#394](https://github.com/Koniverse/SubWallet-Extension/issues/394) | Can not scan QR | ✅ done |
| 1.0.4 | [#1329](https://github.com/Koniverse/SubWallet-Extension/issues/1329) | Handling the case of importing multiple accounts using a JSON file when an account already exists | ✅ done |
| 1.0.5 | [#1382](https://github.com/Koniverse/SubWallet-Extension/issues/1382) | Update the style of the QR code | ✅ done |
| 1.0.5 | [#1401](https://github.com/Koniverse/SubWallet-Extension/issues/1401) | Handle case access camera setting whe have no account on the wallet | ✅ done |
| 1.0.8 | [#1490](https://github.com/Koniverse/SubWallet-Extension/issues/1490) | Do not Apply master password in case import multi account but file json have information "IsMasterPassword" | ✅ done |
| 1.1.2 | [#1253](https://github.com/Koniverse/SubWallet-Extension/issues/1253) | QR scanner not found | ✅ done |
| 1.3.53 | [#4565](https://github.com/Koniverse/SubWallet-Extension/issues/4565) | Extension - Can not import Json Account from Polkadot{.js} extension | ✅ done |
| 1.3.71 | [#4762](https://github.com/Koniverse/SubWallet-Extension/issues/4762) | Support Import from Trust Wallet to SubWallet | ✅ done |
| — | [#316](https://github.com/Koniverse/SubWallet-Extension/issues/316) | QR display / QR Scan | ✅ done |
| — | [#318](https://github.com/Koniverse/SubWallet-Extension/issues/318) | Build communication structure (via QR) (request between UI and background) | ✅ done |
| — | [#470](https://github.com/Koniverse/SubWallet-Extension/issues/470) | Allow select camera in QR screen and avoid camera open anytime open extension | ✅ done |
| — | [#1649](https://github.com/Koniverse/SubWallet-Extension/issues/1649) | Support QR for ZkAssets | ⏸ deprecated |

> **The QR *scanner* is the maintenance surface, not the formats.** #316, #394, #470, #1253, #1382
> and #1401 are camera and scanner issues — a device permission and a live camera feed break in ways
> a file picker never does. JSON restore contributed only #88, #107, #1329, #4565.
>
> **#4762 keeps its own row rather than being an umbrella.** *"Support Import from Trust Wallet"* has
> one child (#41) **and** its own CHANGELOG line (1.3.71), so it is a delivery that spawned a
> sub-task, not an umbrella ([AGENTS.md](../../../AGENTS.md) rule 10).

## Cross-references

- [PRD FR-16](../../PRD.md#functional-requirements), [PRD FR-17](../../PRD.md#functional-requirements), [PRD FR-18](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
- [consolidation note](../../notes/2026-07-24.md#c-epic-23-maintenance--account-merged-into-epic-3)
