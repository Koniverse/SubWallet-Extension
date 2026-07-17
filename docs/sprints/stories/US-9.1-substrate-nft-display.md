---
id: US-9.1
title: "Substrate NFT display (RMRK / Unique / PSP-34)"
epic: EPIC-9
status: done
priority: P1
points: 5
sprint: sprint-2022-M10
version_shipped: 0.6.7
prd_ref: [FR-85]
arch_ref: [AD-24]
depends_on:
assignee: nulllpc
commit: 6e4091bf3f, 824a020641, 88402e9c33
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

- [x] **AC-1** — **Given** an account holding NFTs on a supported Substrate chain (RMRK, Unique/Quartz, Asset Hub, PSP-34/WASM), **When** the NFT screen loads, **Then** each collection appears in the grid with its name, image and item count.
- [x] **AC-2** — **Given** a collection in the grid, **When** the user opens it, **Then** the items render with name and media resolved through the IPFS gateway pipeline.
- [x] **AC-3** — **Given** an account holding no Substrate NFTs, **When** the screen loads, **Then** an empty state is shown (no error, no spinner stuck).
- [x] **AC-4** — **Given** the Services SDK backend is unreachable for a chain, **When** detection runs, **Then** that chain degrades gracefully (other chains still display) and a non-blocking error is surfaced.

## Tasks

- [x] **TASK-9.1.1** — Substrate NFT handlers (RMRK / Unique / Statemine / PSP-34) producing collections + items via `NftService` (AC: 1, 2)
  - [x] Subtask 9.1.1.1 — Register handlers in the NFT handler registry (`packages/extension-base/src/services/nft-service/nft-handlers/`)
  - [x] Subtask 9.1.1.2 — Map SDK collection/item payloads to `NftCollection` / `NftItem`
- [x] **TASK-9.1.2** — Collection grid + item detail rendering with IPFS-resolved media (AC: 2)
- [x] **TASK-9.1.3** — Empty state for accounts with no Substrate NFTs (AC: 3)
- [x] **TASK-9.1.4** — Per-chain degraded path when the backend is unreachable (AC: 4)

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

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: medium, rule: completion).

**Evidence:** Title enumerates RMRK / Unique / PSP-34, so completion rule applies: RMRK+Unique display first shipped in 0.2.1 ("Integration RMRK's NFT display feature", "Integration Unique's NFT display feature", 2022-02-10; Statemine/Asset Hub by 0.2.8 "Send and Receive NFT: Acala, RMRK, Quartz, Statemine"), and the enumeration completes in 0.6.7 (2022-10-22) — "Support token import for PSP-22 and PSP-34 (#477)" — where commit 6e4091bf3f created the wasm_nft PSP-34 display handler (packages/extension-koni-base/src/api/nft/wasm_nft/index.ts); all commits verified ancestors of v0.6.7. Confidence medium (not high) because the 0.6.7 bullet says "token import" rather than NFT display (display proven by the handler-creation commit) and the capability grew across releases 0.2.1→0.6.7.

Commits `6e4091bf3f, 824a020641, 88402e9c33` verified contained in the v0.6.7 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Incremental work, fixes & chores

Beyond the requirement above, **28 tracker issue(s)** of incremental work landed on this capability — fixes, chores and small increments, folded in from the former consolidated ledger (2026-07-17). They materialize no FR of their own; the full issue→story map is in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

> 3 issue(s) below are ⏸ **deprecated** — closed not-planned / superseded, never shipped.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.1 | [#52](https://github.com/Koniverse/SubWallet-Extension/issues/52) | Integrate Bit.Country NFT: Display, Send, Receive | ✅ done |
| 0.3.2 | [#44](https://github.com/Koniverse/SubWallet-Extension/issues/44) | Integrate Astar NFT | ✅ done |
| 0.3.4 | [#175](https://github.com/Koniverse/SubWallet-Extension/issues/175) | Update Astar NFT: Astar Pass & Astar Cats | ✅ done |
| 0.4.2 | [#184](https://github.com/Koniverse/SubWallet-Extension/issues/184) | Integrate new cross-chain tokens on Karura (RMRK, ARIS, QTZ, ...) | ✅ done |
| 0.6.4 | [#654](https://github.com/Koniverse/SubWallet-Extension/issues/654) | Add owner attribute to Pioneer NFT | ✅ done |
| 0.6.5 | [#649](https://github.com/Koniverse/SubWallet-Extension/issues/649) | Integrate Pioneer Network NFT | ✅ done |
| 0.6.7 | [#635](https://github.com/Koniverse/SubWallet-Extension/issues/635) | Integration ArtZero NFT | ✅ done |
| 0.7.7 | [#950](https://github.com/Koniverse/SubWallet-Extension/issues/950) | Do not show sub0 Lisbon 2022 NFT | ✅ done |
| 0.8.3 | [#1095](https://github.com/Koniverse/SubWallet-Extension/issues/1095) | Update logic for ink 4.0 and delete old PSP token | ✅ done |
| 1.0.5 | [#29](https://github.com/Koniverse/SubWallet-Extension/issues/29) | Update Zeitgeist and Subsocial integration | ✅ done |
| 1.1.2 | [#1335](https://github.com/Koniverse/SubWallet-Extension/issues/1335) | Integrate Land/Estate NFT on Pioneer's metaverses | ✅ done |
| 1.1.18 | [#2029](https://github.com/Koniverse/SubWallet-Extension/issues/2029) | Fixed bug Do not show Acala, Karura NFT | ✅ done |
| 1.1.36 | [#2580](https://github.com/Koniverse/SubWallet-Extension/issues/2580) | Unique Network and Quartz NFTs support | ✅ done |
| 1.1.68 | [#3115](https://github.com/Koniverse/SubWallet-Extension/issues/3115) | Fix error when fetching with Avail network | ✅ done |
| 1.2.21 | [#3191](https://github.com/Koniverse/SubWallet-Extension/issues/3191) | Support Avail Light Client NFT | ✅ done |
| 1.3.2 | [#3559](https://github.com/Koniverse/SubWallet-Extension/issues/3559) | Support Ternoa NFT | ✅ done |
| — | [#28](https://github.com/Koniverse/SubWallet-Extension/issues/28) | Send / Receive NFT: Acala & Karura | ✅ done |
| — | [#30](https://github.com/Koniverse/SubWallet-Extension/issues/30) | Send / Receive NFT: Statemine / Statemint | ✅ done |
| — | [#194](https://github.com/Koniverse/SubWallet-Extension/issues/194) | Collect NFT on Singular.app but it doesnt show on SubWallet | ✅ done |
| — | [#205](https://github.com/Koniverse/SubWallet-Extension/issues/205) | Add Polka Potions NFT collection | ✅ done |
| — | [#230](https://github.com/Koniverse/SubWallet-Extension/issues/230) | Integrate NFTs on Altair NFT Playground | ⏸ deprecated |
| — | [#603](https://github.com/Koniverse/SubWallet-Extension/issues/603) | Integrate Gromlins NFT | ⏸ deprecated |
| — | [#622](https://github.com/Koniverse/SubWallet-Extension/issues/622) | Support Bit.Country'NFT Trading and Land Portfolio | ✅ done |
| — | [#688](https://github.com/Koniverse/SubWallet-Extension/issues/688) | Support Zeitgeist NFT | ✅ done |
| — | [#1285](https://github.com/Koniverse/SubWallet-Extension/issues/1285) | Add ArtZero API for Astar's NFT | ✅ done |
| — | [#1441](https://github.com/Koniverse/SubWallet-Extension/issues/1441) | Integrate Unique's NFT into SubWallet | ✅ done |
| — | [#1646](https://github.com/Koniverse/SubWallet-Extension/issues/1646) | Support Zk Assets NFT | ⏸ deprecated |
| — | [#2195](https://github.com/Koniverse/SubWallet-Extension/issues/2195) | Recheck the impact on NFT features when ArtZero updates its API | ✅ done |
| — | [#3126](https://github.com/Koniverse/SubWallet-Extension/issues/3126) | Support Avail light client NFT | ✅ done |

## Cross-references

- [PRD FR-85](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.2](US-9.2-nested-bundled-nft-display.md) · [US-9.3](US-9.3-evm-nft-display.md)
