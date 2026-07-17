---
id: US-9.5
title: "NFT transfer (send)"
epic: EPIC-9
status: done
priority: P1
points: 3
sprint: sprint-2022-M03
version_shipped: 0.2.8
prd_ref: [FR-89]
arch_ref:
depends_on: [US-9.1, US-9.3]
assignee: nulllpc
commit: c586a78109, b5d6f46647
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can send an NFT they own to any compatible address from inside the
wallet, with the resulting transfer signed and tracked in history — turning the
collectibles surface from read-only into something they can act on.

## Background

Display (US-9.1 / US-9.3) makes NFTs visible; this story makes them movable.
The NFT subsystem builds a **transfer request** for the item's standard (e.g.
ERC-721 `transferFrom`, Substrate NFT transfer extrinsic) and hands it to the
**TransactionService / signing pipeline owned by
[EPIC-8](../epics/EPIC-8.md) + [EPIC-2](../epics/EPIC-2.md)** — EPIC-9 does not
sign or broadcast. The user picks the item, enters a recipient, confirms, and
the send is tracked in transaction history (PRD
[FR-89](../../PRD.md#functional-requirements)).

Materializes [FR-89](../../PRD.md#functional-requirements). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** an owned NFT and a valid recipient address, **When** the user confirms the send, **Then** a standard-appropriate transfer request is built, signed via the transaction pipeline, submitted, and appears in history.
- [x] **AC-2** — **Given** a recipient address that is invalid or wrong-format for the NFT's chain, **When** the user attempts to send, **Then** a clear validation error is shown and nothing is submitted.
- [x] **AC-3** — **Given** the account lacks the native balance to pay the transfer fee, **When** the user attempts to send, **Then** an insufficient-fee error is shown before signing.

## Tasks

- [x] **TASK-9.5.1** — Build the standard-appropriate NFT transfer request (Substrate extrinsic / EVM `transferFrom`) (AC: 1)
- [x] **TASK-9.5.2** — Hand the request to the transaction pipeline; track the result in history (AC: 1)
- [x] **TASK-9.5.3** — Recipient address validation per chain (AC: 2)
- [x] **TASK-9.5.4** — Pre-sign fee/balance check (AC: 3)

## Dev notes

### Architecture constraints

- This story does NOT own signing or submission — those are [EPIC-8](../epics/EPIC-8.md) (transaction) + [EPIC-2](../epics/EPIC-2.md) (engines). EPIC-9 assembles the transfer request only.
- Reuses the shared confirmation/fee surface from the transaction layer; no NFT-specific signing path.

### Cross-story dependencies

- Builds on [US-9.1](US-9.1-substrate-nft-display.md) and [US-9.3](US-9.3-evm-nft-display.md) — sends items those stories surface.
- Required by [US-9.4](US-9.4-erc-1155-nft-support.md) — ERC-1155 extends this flow with an amount-aware transfer.

### References

- [Source: PRD FR-89](../../PRD.md#functional-requirements) — NFT transfer (send)
- [Source: ARCHITECTURE — TransactionService](../../ARCHITECTURE.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: send an owned NFT to a valid address → signed, in history |
| AC-2 | Manual: invalid recipient → validation error, no submission |
| AC-3 | Manual: zero native balance → insufficient-fee error before signing |

## Changelog entry

### Added
- NFT transfer (send) from the wallet to any compatible address, tracked in transaction history.

**Commit**:

## Implementation notes

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: high, rule: first-delivery).

**Evidence:** CHANGELOG [0.2.8] — 2022-03-18: "Send and Receive NFT: Acala, RMRK, Quartz, Statemine" — earliest bullet delivering NFT send (0.2.1/0.2.2 were display-only); feature commit c586a78109 "done transfer nft" (2022-03-17) is first tagged in v0.2.8 (merge-base ancestor verified, NOT in v0.2.7).

Commits `c586a78109, b5d6f46647, f30463904d` verified contained in the v0.2.8 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Incremental work, fixes & chores

Beyond the requirement above, **17 tracker issue(s)** of incremental work landed on this capability — fixes, chores and small increments, folded in from the former consolidated ledger (2026-07-17). They materialize no FR of their own; the full issue→story map is in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

> 2 issue(s) below are ⏸ **deprecated** — closed not-planned / superseded, never shipped.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.1 | [#209](https://github.com/Koniverse/SubWallet-Extension/issues/209) | Fix bug can not send EVM NFT | ✅ done |
| 0.4.3 | [#265](https://github.com/Koniverse/SubWallet-Extension/issues/265) | Bug Send NFT when balance is too low | ✅ done |
| 0.4.4 | [#321](https://github.com/Koniverse/SubWallet-Extension/issues/321) | Fix bug 'Encountered an error, please try again' when Send NFT | ✅ done |
| 0.6.8 | [#747](https://github.com/Koniverse/SubWallet-Extension/issues/747) | Issue sending Bit.Country NFT and displaying BIT token | ✅ done |
| 0.6.8 | [#759](https://github.com/Koniverse/SubWallet-Extension/issues/759) | Unable to send NFT with QR Account in case of network not selected | ✅ done |
| 1.1.27 | [#2373](https://github.com/Koniverse/SubWallet-Extension/issues/2373) | Fixed bug show transfer NFT history details | ✅ done |
| 1.1.36 | [#1830](https://github.com/Koniverse/SubWallet-Extension/issues/1830) | WebApp - Error page in case send NFT | ✅ done |
| 1.1.36 | [#1957](https://github.com/Koniverse/SubWallet-Extension/issues/1957) | WebApp - Can't navigate Address book screen when send NFT | ✅ done |
| 1.1.55 | [#2695](https://github.com/Koniverse/SubWallet-Extension/issues/2695) | WebApp - Adjust showing/validating address on Send token, Send NFT, History | ✅ done |
| 1.2.10 | [#3133](https://github.com/Koniverse/SubWallet-Extension/issues/3133) | Fix bug Show incorrect Amount on Transaction history, Transaction confirmation for transfer NFT | ✅ done |
| 1.3.1 | [#3537](https://github.com/Koniverse/SubWallet-Extension/issues/3537) | Unified account - Update address input component for NFT transfer | ✅ done |
| 1.3.9 | [#3762](https://github.com/Koniverse/SubWallet-Extension/issues/3762) | Fixed bug send NFT on Ethereum network | ✅ done |
| — | [#350](https://github.com/Koniverse/SubWallet-Extension/issues/350) | [QR] [Transfer] [NFT] Support transfer NFT via QR | ✅ done |
| — | [#729](https://github.com/Koniverse/SubWallet-Extension/issues/729) | Show incorrect NFT quantity on All Accounts mode in case send NFT on the same wallet | ✅ done |
| — | [#1132](https://github.com/Koniverse/SubWallet-Extension/issues/1132) | An error occurs when send WASM NFT | ⏸ deprecated |
| — | [#3287](https://github.com/Koniverse/SubWallet-Extension/issues/3287) | WebApp - Show incorrect Amount on Transaction confirmation for transfer NFT | ⏸ deprecated |
| — | [#3716](https://github.com/Koniverse/SubWallet-Extension/issues/3716) | Extension - Don't show transferable balance when send NFT on Vara network | ✅ done |

## Cross-references

- [PRD FR-89](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.4](US-9.4-erc-1155-nft-support.md)
