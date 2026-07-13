---
id: US-4.6
title: "Bitcoin network integration"
epic: EPIC-4
status: done
priority: P1
points: 5
sprint:
version_shipped: 1.3.42
prd_ref: [FR-37]
arch_ref: [AD-12, AD-19]
depends_on: [US-4.1]
assignee: frenkie-ng
commit: a6dfc0bd26, 49d460215b
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can hold and view Bitcoin from the same unified wallet, with all three
standard address types per account, so the wallet is compatible with the broad
range of BTC dApps and counterparties that each expect a different format.

## Background

Bitcoin is a non-account-model (UTXO) ecosystem, so it needs its own integration
shape. The Bitcoin keyring exposes three address types per account — BIP44
Legacy, BIP84 Native SegWit (default), and BIP86 Taproot — and the BTC dApp
provider is injected as a separate namespace, signing via PSBT
([AD-12](../../ARCHITECTURE.md#architecture-decisions)). Addresses derive from
the unified multi-chain seed ([AD-11](../../ARCHITECTURE.md#architecture-decisions),
EPIC-3). Chain data (UTXOs, fees) is served through the Koni backend proxy so the
indexer key never ships in the bundle and the provider can be swapped
([AD-19](../../ARCHITECTURE.md#architecture-decisions)).

This story covers the **network integration and address model**; the UTXO
multi-asset transfer + custom-fee flow is the planned
[US-4.13](US-4.13-bitcoin-utxo-multi-asset-transfer.md).

Materializes [FR-37](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** an account, **When** Bitcoin is enabled, **Then** the
  keyring exposes all three address types (BIP44 Legacy / BIP84 Native SegWit /
  BIP86 Taproot), defaulting to Native SegWit (AD-12).
- [x] **AC-2** — **Given** an enabled Bitcoin network, **When** balances load,
  **Then** UTXO/balance data resolves through the backend-proxied indexer (no key
  in the bundle, AD-19).
- [x] **AC-3** — **Given** the three address types derive from one account,
  **When** the user views them, **Then** they all originate from the unified seed
  (no extra account/backup, AD-11).
- [x] **AC-4** — **Given** the Bitcoin indexer is unreachable, **When** data is
  requested, **Then** a clear unavailable state is shown without breaking other
  ecosystems.

## Tasks

- [x] **TASK-4.6.1** — Bitcoin keyring: three address types per account, default Native SegWit (AC: 1, 3)
- [x] **TASK-4.6.2** — Bitcoin API object + backend-proxied indexer for UTXO/balance reads (AC: 2)
- [x] **TASK-4.6.3** — Indexer-unavailable error state (AC: 4)

## Dev notes

### Architecture constraints

- [AD-12](../../ARCHITECTURE.md#architecture-decisions) — three address types per account, PSBT signing, separate dApp namespace.
- [AD-19](../../ARCHITECTURE.md#architecture-decisions) — Bitcoin indexer routed through the backend proxy (no key in bundle).
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — Bitcoin addresses derive from the unified seed (EPIC-3).
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — enable/disable + endpoint config.
- Required by [US-4.13](US-4.13-bitcoin-utxo-multi-asset-transfer.md) — UTXO multi-asset transfer extends this address/API model.

### Dev notes — points

5 pts — an external-system (Bitcoin UTXO) ecosystem integration: new keyring
address model, PSBT signing, proxied indexer, per SKILL §3a-bis (1 external
system integration).

### References

- [Source: PRD FR-37](../../PRD.md#epic-4--chain-management) — Bitcoin BIP44/84/86 per account
- [Source: ARCHITECTURE AD-12](../../ARCHITECTURE.md#architecture-decisions) — Bitcoin integration model
- [Source: ARCHITECTURE AD-19](../../ARCHITECTURE.md#architecture-decisions) — backend proxy for API keys

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-3 | Manual: enable Bitcoin → three address types from one seed, default SegWit |
| AC-2 | Manual: balances load via backend-proxied indexer; no key in bundle |
| AC-4 | Manual: block the indexer → unavailable state, other chains fine |

## Changelog entry

### Added
- Bitcoin network integration with BIP44 Legacy / BIP84 Native SegWit / BIP86 Taproot addresses per account (PSBT signing), via the backend-proxied indexer.

**Commit**:

## Implementation notes

Backfilled by US-21.2 (batch 1, commit `571f3085be`). Version `1.3.42` is the release whose docs/CHANGELOG.md bullet first delivers this story's headline capability; commits `a6dfc0bd26, 49d460215b` were resolved from that bullet's issue number (`git log --grep`, filtered to a ±270-day window around the release date to exclude same-numbered upstream polkadot-js PRs) and each verified contained in the v1.3.42 anchor via `git merge-base --is-ancestor`. Assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Cross-references

- [PRD FR-37](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.13](US-4.13-bitcoin-utxo-multi-asset-transfer.md)
