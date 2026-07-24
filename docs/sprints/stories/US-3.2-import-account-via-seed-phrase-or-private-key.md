---
id: US-3.2
title: "Import account via seed phrase or private key"
epic: EPIC-3
status: done
priority: P0
points: 3
sprint: sprint-2022-M03
version_shipped: 0.2.8
prd_ref: [FR-14, FR-15]
arch_ref: [AD-04, AD-11]
depends_on: [US-3.1]
assignee: Quangdm-cdm
commit: 71198073234a9f4d42920f0f8c72ddc48833d20c, b22f8c246cdcc9dcf2bbdf140b8397efaf6c846e, 9cc5ab6ebd2770a9e145edbba652c4e8fc52c180
created: 2026-06-11
updated: 2026-06-11
---

## Goal

A user migrating from another wallet can bring an existing account in by its
12/24-word seed phrase or by a raw private key — so that they keep control of
funds they already hold without creating a new key.

## Status

> **✅ done — shipped in 0.2.8.** All 4 acceptance criteria are ticked and the 24 rows below are
> settled: 21 delivered, 3 closed without shipping.

## Background

The two secret-based import paths. A seed import reconstructs a full
**Unified Account** (one seed → all five ecosystems, [AD-11](../../ARCHITECTURE.md#architecture-decisions)),
whereas a private-key import yields a single-chain "solo" account (a private key
only addresses one curve). Both parse the secret **in the background keyring**
([AD-04](../../ARCHITECTURE.md#architecture-decisions)) and persist it encrypted
under the master password set in
[US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md); no secret bytes reach the
UI. Other import formats (JSON keystore, QR, Trust Wallet) are separate stories —
this one is scoped to the two raw-secret paths because they share validation and
the solo-vs-unified branching.

Materializes [FR-14](../../PRD.md#functional-requirements) and [FR-15](../../PRD.md#functional-requirements). **Retroactive** —
already shipped; `commit` / `version_shipped` backfilled in reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a valid 12/24-word mnemonic, **When** the user imports
  it, **Then** a Unified Account is created with correct addresses across all five
  ecosystems (AD-11) and the secret is parsed only in the background (AD-04).
- [x] **AC-2** — **Given** a valid private key, **When** the user imports it,
  **Then** a solo account for the matching ecosystem is created and usable for
  signing.
- [x] **AC-3** — **Given** an invalid mnemonic (bad checksum/word) or malformed
  private key, **When** the user submits it, **Then** import is rejected with a
  clear error and no partial account is persisted.
- [x] **AC-4** — **Given** any successful import, **Then** the secret is stored
  encrypted at rest under the master password (NFR-3); no plaintext key bytes are
  written to storage.

## Tasks

- [x] **TASK-3.2.1** — Seed-phrase import → Unified Account (AC: 1, 4)
  - [x] Validate mnemonic checksum; derive all-ecosystem addresses in background.
- [x] **TASK-3.2.2** — Private-key import → solo account (AC: 2, 4)
  - [x] Detect curve/ecosystem; create solo account.
- [x] **TASK-3.2.3** — Input validation + error states for both paths (AC: 3)

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — secret parsing/storage
  stays in the background; UI passes user input, never receives key bytes.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — a seed yields a unified
  account; a private key cannot (single curve) and stays solo.

### Cross-story dependencies

- Builds on [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md) — reuses the
  master-password setup and the keyring persistence path.
- Sibling: future import stories (JSON keystore, QR, Trust Wallet) extend the same
  import surface.

### References

- [Source: PRD FR-14](../../PRD.md#functional-requirements) — import via seed phrase
- [Source: PRD FR-15](../../PRD.md#functional-requirements) — import via private key
- [Source: PRD NFR-3](../../PRD.md#non-functional-requirements) — encryption at rest
- [Source: CONTEXT D37](../../CONTEXT.md) — Unified Account model

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: import a known mnemonic → addresses match expected across ecosystems |
| AC-2 | Manual: import a known private key → solo account signs a test tx |
| AC-3 | Unit test: invalid mnemonic / malformed key → rejected, no account persisted |
| AC-4 | Inspect storage: no plaintext key bytes; entry is ciphertext |

## Changelog entry

### Added
- Import account by 12/24-word seed phrase (→ Unified Account) and by private key
  (→ solo account), with validation and error states.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and caveats during version reconciliation._

## Incremental work, fixes & chores

**24 tracker issues** landed on account import — 16 with a release, 5 delivered with no line naming
them, 3 closed without shipping. Folded in from the former one-issue-per-story maintenance ledger
(2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.4 | [#120](https://github.com/Koniverse/SubWallet-Extension/issues/120) | The Network list is incorrect in case importing an account from seed phase when there is no account yet | ✅ done |
| 0.4.1 | [#192](https://github.com/Koniverse/SubWallet-Extension/issues/192) | Extension error when entering Substrate's seed phrase but selecting EVM account | ✅ done |
| 0.4.2 | [#208](https://github.com/Koniverse/SubWallet-Extension/issues/208) | Improve import Private key feature | ✅ done |
| 0.4.3 | [#266](https://github.com/Koniverse/SubWallet-Extension/issues/266) | Other defects related to Import EVM Tokens | ✅ done |
| 0.5.5 | [#254](https://github.com/Koniverse/SubWallet-Extension/issues/254) | Add feature to allow first-time users to import their Metamask private keys | ✅ done |
| 0.8.4 | [#1118](https://github.com/Koniverse/SubWallet-Extension/issues/1118) | Fix bug importing PSP22 tokens | ✅ done |
| 1.0.4 | [#1314](https://github.com/Koniverse/SubWallet-Extension/issues/1314) | Still allows importing tokens without Decimal, Symbol | ✅ done |
| 1.0.5 | [#1395](https://github.com/Koniverse/SubWallet-Extension/issues/1395) | Do not import private key when exported from MetaMask | ✅ done |
| 1.0.11 | [#1560](https://github.com/Koniverse/SubWallet-Extension/issues/1560) | Allow user download seed phrase file | ✅ done |
| 1.1.13 | [#1910](https://github.com/Koniverse/SubWallet-Extension/issues/1910) | Handle the case of auto lock after import multi account | ✅ done |
| 1.1.20 | [#1946](https://github.com/Koniverse/SubWallet-Extension/issues/1946) | Add "Token Name" to the Token Details and Import Token screen | ✅ done |
| 1.1.26 | [#2323](https://github.com/Koniverse/SubWallet-Extension/issues/2323) | Re-check case show incorrect balance on All accounts mode when switch account or import account | ✅ done |
| 1.1.33 | [#2472](https://github.com/Koniverse/SubWallet-Extension/issues/2472) | Auto import EVM network with source from online resources | ✅ done |
| 1.1.34 | [#2518](https://github.com/Koniverse/SubWallet-Extension/issues/2518) | Show incorrect tokens on the balance screen in case an account with the type 'ed25519' is imported | ✅ done |
| 1.1.36 | [#1207](https://github.com/Koniverse/SubWallet-Extension/issues/1207) | Block export Private key with Substrate due to not supporting import | ✅ done |
| 1.3.4 | [#3636](https://github.com/Koniverse/SubWallet-Extension/issues/3636) | Allow importing assets on Asset Hub | ✅ done |
| — | [#75](https://github.com/Koniverse/SubWallet-Extension/issues/75) | [v0.2.8] Not resetting Network in Import Account screen | ✅ done |
| — | [#76](https://github.com/Koniverse/SubWallet-Extension/issues/76) | Incorrect Network display in Import Account screen | ✅ done |
| — | [#89](https://github.com/Koniverse/SubWallet-Extension/issues/89) | Auto Import account from Polkadot js wallet to SubWallet | ⏸ deprecated |
| — | [#484](https://github.com/Koniverse/SubWallet-Extension/issues/484) | Export seed phrase for Substrate Account | ✅ done |
| — | [#495](https://github.com/Koniverse/SubWallet-Extension/issues/495) | Notification for important infomation | ✅ done |
| — | [#511](https://github.com/Koniverse/SubWallet-Extension/issues/511) | Token information is overwritten when importing another token with the same name | ✅ done |
| — | [#1142](https://github.com/Koniverse/SubWallet-Extension/issues/1142) | Support import Substrate account by private key | ⏸ deprecated |
| — | [#3318](https://github.com/Koniverse/SubWallet-Extension/issues/3318) | [Bug] Import custom EVM Rpc | ⏸ deprecated |

> **The import *screen* is shared with tokens, and the generator filed a token sub-cluster here.**
> #266, #511, #1118, #1314, #1946, #2472 and #3636 are token / RPC imports that surface on the same
> screen an account is imported from — they materialize no account FR and belong to
> [EPIC-4](../epics/EPIC-4.md)'s territory, kept here because that is the screen whose history they
> are. The account-import bugs proper are network-reset and validation: #75, #76, #120, #192.
>
> **"Import a Substrate account by private key" is filed twice.** #1142 was closed not-planned; the
> same request reappears as #3213, still open in
> [US-3.12](US-3.12-open-account-improvements.md) — a capability the wallet has been asked for twice
> and shipped neither time.

## Cross-references

- [PRD FR-14](../../PRD.md#functional-requirements), [PRD FR-15](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [consolidation note](../../notes/2026-07-24.md#c-epic-23-maintenance--account-merged-into-epic-3)
