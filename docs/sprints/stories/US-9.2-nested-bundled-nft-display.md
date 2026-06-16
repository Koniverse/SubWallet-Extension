---
id: US-9.2
title: "Nested / bundled NFT display"
epic: EPIC-9
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: [FR-86]
arch_ref: [AD-24]
depends_on: [US-9.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user holding nested NFTs (e.g. on Unique Network, where one NFT can bundle
child NFTs) sees the parent–child structure and can navigate into the bundle,
rather than a flat list that hides the relationships.

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

- [ ] **AC-1** — **Given** an NFT that bundles children, **When** the user opens it, **Then** it is shown as a bundle with its nested tokens listed and a way to drill into each child.
- [ ] **AC-2** — **Given** a child NFT viewed inside a bundle, **When** the user navigates up, **Then** the parent is resolved and shown (parent lookup walks `parentId`).
- [ ] **AC-3** — **Given** a non-nested NFT, **When** the user opens it, **Then** it renders as a normal item (no empty "bundle" affordance).

## Tasks

- [ ] **TASK-9.2.1** — Bundle-tree resolution in the Unique handler (`isBundle`, `nestingTokens`, `nestingLevel`, `parentId`) (AC: 1, 2)
- [ ] **TASK-9.2.2** — Nested-NFT UI: bundle detail + structure view + navigate into children (AC: 1)
- [ ] **TASK-9.2.3** — Parent lookup hook walking `parentId` for up-navigation (AC: 2)
- [ ] **TASK-9.2.4** — Non-nested item path unaffected (AC: 3)

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

_Retroactive — capability already shipped. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [PRD FR-86](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md)
</content>
