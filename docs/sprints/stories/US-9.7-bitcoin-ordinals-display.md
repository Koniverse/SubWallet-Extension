---
id: US-9.7
title: "Bitcoin Ordinals / inscriptions display"
epic: EPIC-9
status: backlog
priority: P2
points: 5
sprint:
version_shipped:
prd_ref: [FR-91]
arch_ref: [AD-25]
depends_on:
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

> **Consolidated tracker issues (2026-07-17):** #4246 (*Support RUNE & Ordinal for Bitcoin*) and #4295 (*Support showing Rune and Inscription*) — both backlog — are tracked under this story; the shipped webapp-ordinals work is [US-9.17](US-9.17-bitcoin-ordinals-and-inscriptions-shipped.md). See [notes/2026-07-17-epic-9-consolidation](../../notes/2026-07-17-epic-9-consolidation.md).

## Goal

A user with a Bitcoin account sees the Ordinals inscriptions they hold rendered
in the collectibles surface, so Bitcoin NFTs sit alongside their Substrate and
EVM NFTs in one place.

## Background

Ordinals/inscriptions are Bitcoin's NFT-equivalent: arbitrary content inscribed
on individual sats. Detecting them requires the Bitcoin mainnet indexer with
Ordinals support, which is reached through the **keyed `btc-api` proxy** —
**owned by [EPIC-4](../epics/EPIC-4.md)** and protected by NFR-16 (a
service-token header means the provider key never ships in the bundle; only
Bitcoin testnet hits public endpoints directly). EPIC-9 *consumes* that read
endpoint via an Ordinals NFT handler and maps inscriptions into the shared
`NftService` state; media renders through the IPFS/inscription pipeline
([AD-25](../../ARCHITECTURE.md#architecture-decisions), NFR-21). PRD
[FR-91](../../PRD.md#functional-requirements).

Materializes [FR-91](../../PRD.md#functional-requirements). **Retroactive** —
already shipped.

## Acceptance criteria

- [ ] **AC-1** — **Given** a Bitcoin account holding Ordinals inscriptions, **When** the NFT screen loads, **Then** the inscriptions appear in the collectibles grid with their content rendered (image / text / preview).
- [ ] **AC-2** — **Given** the `btc-api` proxy is queried, **When** inscriptions are fetched, **Then** the request goes through the service-token proxy (NFR-16) and no provider key is read on-device.
- [ ] **AC-3** — **Given** the indexer is unreachable, **When** detection runs, **Then** the Ordinals section degrades gracefully (other NFTs still display) and a non-blocking error is surfaced.

## Tasks

- [ ] **TASK-9.7.1** — Ordinals NFT handler consuming the `btc-api` inscriptions endpoint (AC: 1, 2)
  - [ ] Subtask 9.7.1.1 — Map inscriptions to `NftCollection` / `NftItem` for the shared grid
- [ ] **TASK-9.7.2** — Render inscription content (image / text / preview) in item detail (AC: 1)
- [ ] **TASK-9.7.3** — Degraded path when the indexer is unreachable (AC: 3)

## Dev notes

### Architecture constraints

- The keyed `btc-api` indexer proxy is **owned by [EPIC-4](../epics/EPIC-4.md)** (NFR-16); this story only consumes the inscriptions read endpoint — it does not own the proxy or the indexer.
- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — inscription/media content fronted by the SubWallet proxy/gateway layer.

### Cross-story dependencies

- Builds on the `btc-api` proxy delivered by [EPIC-4](../epics/EPIC-4.md) — uses its inscriptions endpoint + service-token header.
- Sibling [US-9.1](US-9.1-substrate-nft-display.md) / [US-9.3](US-9.3-evm-nft-display.md) — all feed the shared collectibles grid.

### References

- [Source: PRD FR-91](../../PRD.md#functional-requirements) — Bitcoin Ordinals / inscriptions display
- [Source: PRD NFR-16](../../PRD.md#non-functional-requirements) — `btc-api` key protection
- [Source: ARCHITECTURE AD-25](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: Bitcoin account with inscriptions → inscriptions render in grid |
| AC-2 | Inspect network: inscriptions request hits the `btc-api` proxy with service-token, no key in bundle |
| AC-3 | Manual: simulate indexer outage → Ordinals degrade, other NFTs still show |

## Changelog entry

### Added
- Bitcoin Ordinals / inscriptions display in the collectibles surface, sourced via the keyed `btc-api` proxy.

**Commit**:

## Implementation notes

**Stays `backlog` — the capability was never released** (US-21.2 straggler, resolved 2026-07-13).
Ordinals/inscription display exists only on an unreleased branch: no docs/CHANGELOG.md bullet
delivers it and no commit implementing it is contained in any release tag. The PRD row (FR-91)
was marked `✅ shipped` in error and is now `🚧 in progress` — code exists, no release carries it.
Flip this story to `done` only when a release actually ships it.

## Cross-references

- [PRD FR-91](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [EPIC-4](../epics/EPIC-4.md)
