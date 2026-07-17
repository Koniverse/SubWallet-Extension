---
id: US-9.3
title: "EVM NFT display (ERC-721)"
epic: EPIC-9
status: done
priority: P1
points: 3
sprint: sprint-2022-M04
version_shipped: 0.3.1
prd_ref: [FR-87]
arch_ref: [AD-24]
depends_on:
assignee: nulllpc
commit: 5493ff4f0483999ebfbb67049b37bbb8e838b229, 73dfc19b8ecf7107415d943e21aebb672407b2a2, fc11432fdd9487eeb38140571f086a9446db2cad
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

- [x] **AC-1** — **Given** an EVM account holding ERC-721 NFTs, **When** the NFT screen loads, **Then** each ERC-721 collection appears in the grid with name, image and item count.
- [x] **AC-2** — **Given** an EVM collection, **When** the user opens it, **Then** items render with metadata and IPFS-resolved media.
- [x] **AC-3** — **Given** a contract that is not ERC-721 (e.g. ERC-1155), **When** detection runs, **Then** it is not mis-shown as ERC-721 (handled by [US-9.4](US-9.4-erc-1155-nft-support.md), not silently dropped into the 721 path).

## Tasks

- [x] **TASK-9.3.1** — `EvmNftHandler` detection over EVM addresses via the Services SDK (AC: 1)
- [x] **TASK-9.3.2** — Map ERC-721 collections/items to `NftCollection` / `NftItem` and render in the shared grid (AC: 1, 2)
- [x] **TASK-9.3.3** — Standard filter so non-ERC-721 contracts are not mapped as ERC-721 (AC: 3)

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

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: high, rule: first-delivery).

**Evidence:** CHANGELOG 0.3.1 (2022-04-05): "Display Moonbeam / Moonriver NFT (issue #33)" — the first bullet delivering EVM ERC-721 NFT display (earlier 0.2.x releases shipped only Substrate NFTs: RMRK, Unique, Acala, Quartz, Statemine); delivering commits add ERC721Contract.json ABI and the web3-based moonbeam_nft handler, are ancestors of v0.3.1 (merge-base verified), and v0.3.1 is the first tag containing them. Note: the issue-#33 grep also hits 2019 upstream polkadot-js PR #33 (discarded per fork-collision rule), and the story's AD-24 EvmNftHandler/Services-SDK architecture is a much later re-implementation ("Implement NFTService + Migrate EVM & Unique Network NFT logic (Phase 1) (#4884)", 1.3.x era) of a capability first shipped here.

Commits `5493ff4f0483999ebfbb67049b37bbb8e838b229, 73dfc19b8ecf7107415d943e21aebb672407b2a2, fc11432fdd9487eeb38140571f086a9446db2cad` verified contained in the v0.3.1 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Incremental work, fixes & chores

Beyond the requirement above, **9 tracker issue(s)** of incremental work landed on this capability — fixes, chores and small increments, folded in from the former consolidated ledger (2026-07-17). They materialize no FR of their own; the full issue→story map is in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

> 1 issue(s) below are ⏸ **deprecated** — closed not-planned / superseded, never shipped.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.1 | [#34](https://github.com/Koniverse/SubWallet-Extension/issues/34) | Send & Receive Moonbeam / Moonriver NFT | ✅ done |
| 0.3.1 | [#33](https://github.com/Koniverse/SubWallet-Extension/issues/33) | Display Moonbeam / Moonriver NFT | ✅ done |
| 0.5.4 | [#517](https://github.com/Koniverse/SubWallet-Extension/issues/517) | Add Moonpets NFT | ✅ done |
| 0.5.6 | [#467](https://github.com/Koniverse/SubWallet-Extension/issues/467) | Integration MoonFit NFT | ✅ done |
| 1.0.5 | [#12](https://github.com/Koniverse/SubWallet-Extension/issues/12) | Integrate Snow EVM network | ✅ done |
| 1.0.5 | [#27](https://github.com/Koniverse/SubWallet-Extension/issues/27) | Update RPC endpoint for Mangata | ✅ done |
| 1.0.6 | [#1404](https://github.com/Koniverse/SubWallet-Extension/issues/1404) | Fix bug show Moonfit’s NFT | ✅ done |
| 1.3.7 | [#3854](https://github.com/Koniverse/SubWallet-Extension/issues/3854) | Integration NFT for Story Protocol | ✅ done |
| — | [#3850](https://github.com/Koniverse/SubWallet-Extension/issues/3850) | Extension - Integration NFT for Story Protocol | ⏸ deprecated |
| — | [#4028](https://github.com/Koniverse/SubWallet-Extension/issues/4028) | Extension - Follow display NFT for Story Odyssey Testnet after mainnet | ✅ done |

## Cross-references

- [PRD FR-87](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md) · [US-9.4](US-9.4-erc-1155-nft-support.md)
