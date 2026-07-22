---
id: US-9.2
title: "Nested / bundled NFT display"
epic: EPIC-9
status: done
priority: P1
points: 3
sprint: sprint-2026-M06
version_shipped: 1.3.80
prd_ref: [FR-86]
arch_ref: [AD-24]
depends_on: [US-9.1]
assignee: frenkie-ng
commit: 896d66c588, bef3b8ad5b, c46bd61c02
created: 2026-06-12
updated: 2026-06-12
---


## Goal

A user holding nested NFTs (e.g. on Unique Network, where one NFT can bundle
child NFTs) sees the parent–child structure and can navigate into the bundle,
rather than a flat list that hides the relationships.

## Status

> **✅ done — shipped in 1.3.80.** All 3 acceptance criteria are ticked, and the single row below is settled (shipped).
> **The table is history, not a work list** — a `done` story may not carry an open row ([AGENTS.md](../../../AGENTS.md) rule 9).

## Background

Some Substrate collections — notably Unique Network — support nesting: an NFT
can own other NFTs, forming a tree (PRD
[FR-86](../../PRD.md#functional-requirements)). The `UniqueNftHandler` resolves
the bundle tree (`isBundle`, `nestingTokens`, `nestingLevel`, `parentId`) and
the UI renders a navigable structure with a parent lookup. This builds directly
on the Substrate display established in
[US-9.1](US-9.1-substrate-nft-display.md).

Materializes [FR-86](../../PRD.md#functional-requirements). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** an NFT that bundles children, **When** the user opens it, **Then** it is shown as a bundle with its nested tokens listed and a way to drill into each child.
- [x] **AC-2** — **Given** a child NFT viewed inside a bundle, **When** the user navigates up, **Then** the parent is resolved and shown (parent lookup walks `parentId`).
- [x] **AC-3** — **Given** a non-nested NFT, **When** the user opens it, **Then** it renders as a normal item (no empty "bundle" affordance).

## Tasks

- [x] **TASK-9.2.1** — Bundle-tree resolution in the Unique handler (`isBundle`, `nestingTokens`, `nestingLevel`, `parentId`) (AC: 1, 2)
- [x] **TASK-9.2.2** — Nested-NFT UI: bundle detail + structure view + navigate into children (AC: 1)
- [x] **TASK-9.2.3** — Parent lookup hook walking `parentId` for up-navigation (AC: 2)
- [x] **TASK-9.2.4** — Non-nested item path unaffected (AC: 3)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — bundle tree data via the Services SDK backend.
- Extends the Unique handler from [US-9.1](US-9.1-substrate-nft-display.md); no separate "nested NFT" screen — it is a render variant of item detail.

### Cross-story dependencies

- Builds on [US-9.1](US-9.1-substrate-nft-display.md) — uses `UniqueNftHandler` and the shared item-detail view.

### References

- [Source: PRD FR-86](../../PRD.md#functional-requirements) — nested / bundled NFT display
- `packages/extension-base/src/services/nft-service/nft-handlers/unique/`
- `packages/extension-koni-ui/src/Popup/Home/Nfts/nested-nft/`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: open a Unique bundle → nested tokens listed, drill-in works |
| AC-2 | Manual: open a child → navigate up resolves the parent |
| AC-3 | Manual: open a flat NFT → no bundle affordance |

## Changelog entry

### Added
- Nested / bundled NFT display and navigation (parent–child structure, e.g. Unique Network).

**Commit**:

## Implementation notes

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: medium, rule: first-delivery).

**Evidence:** 1.3.80 (2026-06-02): "Implement NFTService + Migrate EVM & Unique Network NFT logic (Phase 1) (#4884)" — the bullet names the NFT-service/Unique migration rather than "nested NFT display" explicitly, but git shows the capability was born inside that work: isBundle/nestingTokens first appear in 896d66c588 "[Issue-4768] Implement UI for Nested NFT" (2025-12-05), and every nesting commit (Issue-4768 + Issue-4884, incl. "Build bundle NFT data on collection detail view") is first tagged v1.3.80 and absent from v1.3.79 (merge-base checks pass); earlier Unique bullets (1.1.36 #2580, 0.2.1) delivered only flat display with no nesting code.

Commits `896d66c588, bef3b8ad5b, c46bd61c02` verified contained in the v1.3.80 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Incremental work, fixes & chores

Beyond the requirement above, **1 tracker issue(s)** of incremental work landed on this capability — fixes, chores and small increments, folded in from the former consolidated ledger (2026-07-17). They materialize no FR of their own; the full issue→story map is in the [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.3.80 | [#4768](https://github.com/Koniverse/SubWallet-Extension/issues/4768) | Implement UI to support the Nested NFT standard | ✅ done |

## Cross-references

- [PRD FR-86](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md)
