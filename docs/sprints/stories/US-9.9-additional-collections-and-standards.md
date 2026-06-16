---
id: US-9.9
title: "Additional NFT collections & standards (ERC-6551)"
epic: EPIC-9
status: backlog
priority: P2
points: 5
sprint:
version_shipped:
prd_ref: [FR-93]
arch_ref: [AD-24]
depends_on: [US-9.1, US-9.3]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user holding NFTs on newer ecosystems (Ternoa, Joystream, Aventus) or in
ERC-6551 token-bound accounts sees them in the collectibles surface, widening
coverage beyond the standards already supported.

## Background

NFT coverage is an ongoing expansion. This story onboards **additional
collections / chains** (Ternoa, Joystream, Aventus) as new `NftService`
handlers, and adds **ERC-6551 token-bound accounts** — where an NFT itself owns
a smart-contract account that can hold other assets/NFTs (PRD
[FR-93](../../PRD.md#functional-requirements)). Each addition is a handler, not a
UI branch, consistent with the standard-agnostic invariant.

This FR is **📋 planned** in the PRD — some additional-collection groundwork
exists, but FR-93 (incl. ERC-6551) is not being actively built right now. The
story is authored as `backlog` per Stream-B convention; the planned state is
recorded here so reconciliation knows it is not a clean retroactive ship.

Materializes [FR-93](../../PRD.md#functional-requirements). **📋 planned** — not
yet shipped. Tracked by
[#2485](https://github.com/Koniverse/SubWallet-Extension/issues/2485) — Research ERC-6551.

## Acceptance criteria

- [ ] **AC-1** — **Given** an account holding NFTs on a newly supported chain (Ternoa / Joystream / Aventus), **When** the NFT screen loads, **Then** those collections appear in the shared grid via their handlers.
- [ ] **AC-2** — **Given** an NFT that is an ERC-6551 token-bound account holding nested assets, **When** the user opens it, **Then** the token-bound account and its held assets are surfaced.
- [ ] **AC-3** — **Given** a newly added chain whose backend coverage is incomplete, **When** detection runs, **Then** it degrades gracefully (no crash; partial data shown where available).

## Tasks

- [ ] **TASK-9.9.1** — Add Ternoa / Joystream / Aventus NFT handlers to the registry (AC: 1)
- [ ] **TASK-9.9.2** — ERC-6551 token-bound-account detection + nested-asset surfacing (AC: 2)
- [ ] **TASK-9.9.3** — Graceful degradation for chains with incomplete backend coverage (AC: 3)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — new chains aggregate through the Services SDK backend.
- Each new chain/standard is a `BaseNftHandler` subclass; ERC-6551 is a token-bound-account variant, not a new NFT-UI screen.

### Cross-story dependencies

- Builds on [US-9.1](US-9.1-substrate-nft-display.md) / [US-9.3](US-9.3-evm-nft-display.md) — reuses the shared grid and handler registry.

### What we explicitly did NOT do

- No exhaustive long-tail chain coverage in one story — chains are added incrementally as backend support lands. Trigger to add a chain: Services SDK coverage + user demand.

### References

- [Source: PRD FR-93](../../PRD.md#functional-requirements) — additional NFT collections & standards (Ternoa, Joystream, Aventus; ERC-6551)
- [Roadmap issue #2485](https://github.com/Koniverse/SubWallet-Extension/issues/2485) — Research ERC-6551
- `packages/extension-base/src/services/nft-service/nft-handlers/`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: account with Ternoa/Joystream/Aventus NFTs → collections in grid |
| AC-2 | Manual: open an ERC-6551 NFT → token-bound account + held assets surfaced |
| AC-3 | Manual: chain with partial backend coverage → no crash, partial data |

## Changelog entry

### Added
- Additional NFT collections/standards: Ternoa, Joystream, Aventus handlers and ERC-6551 token-bound-account support.

**Commit**:

## Implementation notes

_Forward-looking — FR-93 is `📋 planned`. Fill `commit` / `version_shipped` as each addition ships._

## Cross-references

- [PRD FR-93](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md) · [US-9.3](US-9.3-evm-nft-display.md)
- [Roadmap issue #2485](https://github.com/Koniverse/SubWallet-Extension/issues/2485) — Research ERC-6551
</content>
