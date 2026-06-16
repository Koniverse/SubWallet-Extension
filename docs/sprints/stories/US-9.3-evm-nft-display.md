---
id: US-9.3
title: "EVM NFT display (ERC-721)"
epic: EPIC-9
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: [FR-87]
arch_ref: [AD-24]
depends_on:
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user with EVM accounts sees their ERC-721 NFTs across EVM chains
(Moonbeam/Moonriver, Astar, Ethereum and other registered EVM networks) in the
same collection grid as their Substrate NFTs.

## Background

ERC-721 is the dominant EVM NFT standard. The `EvmNftHandler` detects holdings
through the Services SDK backend (Blockscout-backed,
[AD-24](../../ARCHITECTURE.md#architecture-decisions), NFR-20) and maps them into
the shared `NftService` state, so EVM collections render in the same grid as
Substrate ones (PRD [FR-87](../../PRD.md#functional-requirements)). This is a
single-standard sibling of [US-9.1](US-9.1-substrate-nft-display.md); ERC-1155
is a separate forward story ([US-9.4](US-9.4-erc-1155-nft-support.md)).

Materializes [FR-87](../../PRD.md#functional-requirements). **Retroactive** —
already shipped.

## Acceptance criteria

- [ ] **AC-1** — **Given** an EVM account holding ERC-721 NFTs, **When** the NFT screen loads, **Then** each ERC-721 collection appears in the grid with name, image and item count.
- [ ] **AC-2** — **Given** an EVM collection, **When** the user opens it, **Then** items render with metadata and IPFS-resolved media.
- [ ] **AC-3** — **Given** a contract that is not ERC-721 (e.g. ERC-1155), **When** detection runs, **Then** it is not mis-shown as ERC-721 (handled by [US-9.4](US-9.4-erc-1155-nft-support.md), not silently dropped into the 721 path).

## Tasks

- [ ] **TASK-9.3.1** — `EvmNftHandler` detection over EVM addresses via the Services SDK (AC: 1)
- [ ] **TASK-9.3.2** — Map ERC-721 collections/items to `NftCollection` / `NftItem` and render in the shared grid (AC: 1, 2)
- [ ] **TASK-9.3.3** — Standard filter so non-ERC-721 contracts are not mapped as ERC-721 (AC: 3)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — EVM NFT detection via the Services SDK (Blockscout-backed), not direct client RPC enumeration.
- Reuses the shared `NftService` grid; no EVM-specific NFT-UI branch.

### Cross-story dependencies

- Sibling [US-9.1](US-9.1-substrate-nft-display.md) — both feed the shared grid.
- Required by [US-9.4](US-9.4-erc-1155-nft-support.md) — ERC-1155 extends the same `EvmNftHandler`.

### References

- [Source: PRD FR-87](../../PRD.md#functional-requirements) — EVM NFT display
- `packages/extension-base/src/services/nft-service/nft-handlers/evm/`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: EVM account with ERC-721 NFTs → collections in grid |
| AC-2 | Manual: open collection → items + media render |
| AC-3 | Unit test: ERC-1155 contract is not mapped through the ERC-721 path |

## Changelog entry

### Added
- EVM ERC-721 NFT display across Moonbeam/Moonriver, Astar and other registered EVM chains via `EvmNftHandler` + Services SDK.

**Commit**:

## Implementation notes

_Retroactive — capability already shipped. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [PRD FR-87](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md) · [US-9.4](US-9.4-erc-1155-nft-support.md)
</content>
