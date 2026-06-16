---
id: US-9.1
title: "Substrate NFT display (RMRK / Unique / PSP-34)"
epic: EPIC-9
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-85]
arch_ref: [AD-24]
depends_on:
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user with Substrate accounts sees the NFTs they hold across the major
Substrate collection standards — RMRK 1.0/2.0, Unique/Quartz, Asset Hub
(Statemine/Statemint) and PSP-34/WASM — in one collection grid, without
knowing or caring which standard each collection uses.

## Background

Substrate has several incompatible NFT standards. Rather than a screen per
standard, each is a handler that feeds the shared `NftService` state and one
collection grid (PRD [FR-85](../../PRD.md#functional-requirements)). Collection
and item data is aggregated through the SubWallet Services SDK backend
([AD-24](../../ARCHITECTURE.md#architecture-decisions), NFR-20) rather than
scanned entirely on-device; media is resolved through the IPFS gateway proxy
([AD-25](../../ARCHITECTURE.md#architecture-decisions), NFR-21). This is the
first display story and establishes the handler-per-standard pattern reused by
[US-9.3](US-9.3-evm-nft-display.md) and [US-9.7](US-9.7-bitcoin-ordinals-display.md).

Materializes [FR-85](../../PRD.md#functional-requirements). **Retroactive** —
already shipped.

## Acceptance criteria

- [ ] **AC-1** — **Given** an account holding NFTs on a supported Substrate chain (RMRK, Unique/Quartz, Asset Hub, PSP-34/WASM), **When** the NFT screen loads, **Then** each collection appears in the grid with its name, image and item count.
- [ ] **AC-2** — **Given** a collection in the grid, **When** the user opens it, **Then** the items render with name and media resolved through the IPFS gateway pipeline.
- [ ] **AC-3** — **Given** an account holding no Substrate NFTs, **When** the screen loads, **Then** an empty state is shown (no error, no spinner stuck).
- [ ] **AC-4** — **Given** the Services SDK backend is unreachable for a chain, **When** detection runs, **Then** that chain degrades gracefully (other chains still display) and a non-blocking error is surfaced.

## Tasks

- [ ] **TASK-9.1.1** — Substrate NFT handlers (RMRK / Unique / Statemine / PSP-34) producing collections + items via `NftService` (AC: 1, 2)
  - [ ] Subtask 9.1.1.1 — Register handlers in the NFT handler registry (`packages/extension-base/src/services/nft-service/nft-handlers/`)
  - [ ] Subtask 9.1.1.2 — Map SDK collection/item payloads to `NftCollection` / `NftItem`
- [ ] **TASK-9.1.2** — Collection grid + item detail rendering with IPFS-resolved media (AC: 2)
- [ ] **TASK-9.1.3** — Empty state for accounts with no Substrate NFTs (AC: 3)
- [ ] **TASK-9.1.4** — Per-chain degraded path when the backend is unreachable (AC: 4)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — collection/item data via the Services SDK backend, not full on-device scans.
- Handler-per-standard via `BaseNftHandler` subclasses (mirrors the EarningService pool-handler tree, AD-22); no Substrate-specific NFT-UI branch.

### Cross-story dependencies

- Required by [US-9.2](US-9.2-nested-bundled-nft-display.md) — nested display extends the Unique handler this story registers.
- Sibling [US-9.3](US-9.3-evm-nft-display.md) — both use the shared `NftService` grid; coordinate the collection/item shape.
- Display reliability is hardened by [US-9.10](US-9.10-nft-display-and-transfer-hardening.md).

### References

- [Source: PRD FR-85](../../PRD.md#functional-requirements) — Substrate NFT display
- [Source: ARCHITECTURE AD-24](../../ARCHITECTURE.md#architecture-decisions) — Services SDK aggregation
- `packages/extension-base/src/services/nft-service/`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: account with RMRK + Unique + Asset Hub NFTs → all collections in grid |
| AC-2 | Manual: open a collection → items render with media |
| AC-3 | Manual: empty account → empty state, no stuck spinner |
| AC-4 | Manual: simulate SDK 5xx for one chain → other chains still display |

## Changelog entry

### Added
- Substrate NFT display across RMRK 1.0/2.0, Unique/Quartz, Asset Hub (Statemine/Statemint) and PSP-34/WASM via per-standard `NftService` handlers.

**Commit**:

## Implementation notes

_Retroactive — capability already shipped. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [PRD FR-85](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.2](US-9.2-nested-bundled-nft-display.md) · [US-9.3](US-9.3-evm-nft-display.md)
</content>
