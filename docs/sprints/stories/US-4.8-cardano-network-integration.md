---
id: US-4.8
title: "Cardano network integration"
epic: EPIC-4
status: done
priority: P1
points: 5
sprint:
version_shipped: 1.3.23
prd_ref: [FR-39]
arch_ref: [AD-14, AD-19]
depends_on: [US-4.1]
assignee: bluezdot
commit: 3ba31ae831, eca66a269c
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can hold and view ADA and CIP-26 native assets from the same unified
wallet, with chain data served by a managed indexer, so Cardano support ships
without self-hosting a Cardano node.

## Background

Cardano is a UTXO (eUTXO) ecosystem served through Blockfrost rather than a
self-hosted node. Cardano chain data is fetched from Blockfrost routed through the
Koni backend proxy, the dApp connector follows CIP-30, and CIP-26 native assets
ship alongside ADA transfers; staking/delegation is deferred
([AD-14](../../ARCHITECTURE.md#architecture-decisions)). A managed indexer avoids
self-hosting, and standards-based connector/asset support maximises dApp and token
compatibility. The Cardano account derives from the unified multi-chain seed
([AD-11](../../ARCHITECTURE.md#architecture-decisions), EPIC-3), and the Blockfrost
key is hidden behind the backend proxy so it never ships in the bundle and the
provider can be swapped ([AD-19](../../ARCHITECTURE.md#architecture-decisions)).

This story covers the **network integration, address model, and CIP-26 native
assets**; the CIP-30 dApp connector is owned by [EPIC-10](../epics/EPIC-10.md)
(FR-97) and references AD-14 there. Cardano plugs into the `ChainService`
per-chain API-object model ([AD-02](../../ARCHITECTURE.md#architecture-decisions))
as a new API-object type.

Materializes [FR-39](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** an account, **When** Cardano is enabled, **Then** a
  Cardano address derives from the unified seed and ADA balance resolves via
  Blockfrost (AD-14), with no separate seed/backup (AD-11).
- [x] **AC-2** — **Given** an enabled Cardano account holding CIP-26 native assets,
  **When** balances load, **Then** those native assets are listed alongside ADA.
- [x] **AC-3** — **Given** Blockfrost is reached, **When** any Cardano data is
  requested, **Then** it resolves through the backend proxy and no Blockfrost key
  is present in the shipped bundle (AD-19).
- [x] **AC-4** — **Given** Blockfrost is unreachable, **When** data is requested,
  **Then** a clear unavailable state is shown without breaking other ecosystems.

## Tasks

- [x] **TASK-4.8.1** — Cardano API object via Blockfrost (backend-proxied), wired into `ChainService` (AC: 1, 3)
- [x] **TASK-4.8.2** — CIP-26 native-asset balance read alongside ADA (AC: 2)
- [x] **TASK-4.8.3** — Backend-proxy routing assertion: no Blockfrost key in bundle (AC: 3)
- [x] **TASK-4.8.4** — Blockfrost-unavailable error state (AC: 4)

## Dev notes

### Architecture constraints

- [AD-14](../../ARCHITECTURE.md#architecture-decisions) — Cardano served by Blockfrost (backend-proxied); CIP-30 connector; CIP-26 native assets; staking/delegation deferred.
- [AD-19](../../ARCHITECTURE.md#architecture-decisions) — Blockfrost key routed through the backend proxy (no key in bundle, swappable provider).
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — Cardano address derives from the unified seed (EPIC-3).
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — uses the enable/disable + endpoint configuration surface.
- Sibling of [US-4.6](US-4.6-bitcoin-network-integration.md) / [US-4.7](US-4.7-ton-network-integration.md) — all add a new `ChainService` API-object type and (BTC/Cardano) ride the AD-19 backend proxy.

### Dev notes — points

5 pts — a new-ecosystem (Cardano) integration: new API-object type, Blockfrost
data path, CIP-26 native assets and backend-proxy wiring, per SKILL §3a-bis (1
external system integration).

### References

- [Source: PRD FR-39](../../PRD.md#epic-4--chain-management) — Cardano via Blockfrost, CIP-26 native assets, CIP-30 connector
- [Source: ARCHITECTURE AD-14](../../ARCHITECTURE.md#architecture-decisions) — Cardano integration model
- [Source: ARCHITECTURE AD-19](../../ARCHITECTURE.md#architecture-decisions) — backend proxy for API keys

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: enable Cardano → address from unified seed, ADA balance via Blockfrost |
| AC-2 | Manual: account with CIP-26 assets → native assets listed alongside ADA |
| AC-3 | Manual: data resolves via backend proxy; no Blockfrost key in bundle |
| AC-4 | Manual: block Blockfrost → unavailable state, other chains fine |

## Changelog entry

### Added
- Cardano network integration: ADA transfers and CIP-26 native assets via the backend-proxied Blockfrost indexer (CIP-30 connector owned by EPIC-10).

**Commit**:

## Implementation notes

Backfilled by US-21.2 (batch 1, commit `571f3085be`). Version `1.3.23` is the release whose docs/CHANGELOG.md bullet first delivers this story's headline capability; commits `3ba31ae831, eca66a269c` were resolved from that bullet's issue number (`git log --grep`, filtered to a ±270-day window around the release date to exclude same-numbered upstream polkadot-js PRs) and each verified contained in the v1.3.23 anchor via `git merge-base --is-ancestor`. Assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Cross-references

- [PRD FR-39](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.6](US-4.6-bitcoin-network-integration.md) · [US-4.7](US-4.7-ton-network-integration.md)
