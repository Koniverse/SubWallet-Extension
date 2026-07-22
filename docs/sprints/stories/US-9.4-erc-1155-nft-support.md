---
id: US-9.4
title: "ERC-1155 NFT support (display & transfer)"
epic: EPIC-9
status: backlog
priority: P2
points: 5
sprint:
version_shipped:
prd_ref: [FR-88]
arch_ref: [AD-24]
depends_on: [US-9.3, US-9.5]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user holding ERC-1155 multi-token NFTs sees them in the collection grid and
can send them, closing the one EVM standard the wallet does not yet support
alongside ERC-721.

## Background

ERC-1155 is a multi-token standard where a single contract holds many token
IDs, each with a balance (semi-fungible). The current `EvmNftHandler` explicitly
filters to ERC-721 only; ERC-1155 is **planned, not yet shipped** (PRD
[FR-88](../../PRD.md#functional-requirements) 📋 planned). This story extends the
existing handler ([US-9.3](US-9.3-evm-nft-display.md)) to detect and map
ERC-1155 holdings (including per-ID balance) and extends the transfer flow
([US-9.5](US-9.5-nft-transfer-send.md)) to build a `safeTransferFrom`-shaped
ERC-1155 transfer.

Materializes [FR-88](../../PRD.md#functional-requirements). **Forward-planned**
— not yet shipped. Tracked by
[#4881](https://github.com/Koniverse/SubWallet-Extension/issues/4881) — Add support for ERC-1155 token standard for NFTs on Ethereum.

## Acceptance criteria

- [ ] **AC-1** — **Given** an EVM account holding ERC-1155 tokens, **When** the NFT screen loads, **Then** the ERC-1155 collection appears in the grid with per-token-ID items and (where semi-fungible) the held quantity.
- [ ] **AC-2** — **Given** an ERC-1155 item, **When** the user sends it, **Then** an ERC-1155 transfer (with amount where applicable) is built and handed to the transaction pipeline, signed and tracked.
- [ ] **AC-3** — **Given** the user enters an amount greater than the held balance for a semi-fungible token, **When** they attempt the send, **Then** a clear validation error is shown and nothing is submitted.

## Tasks

- [ ] **TASK-9.4.1** — Extend `EvmNftHandler` to detect ERC-1155 contracts and map per-ID items + balances (AC: 1)
  - [ ] Subtask 9.4.1.1 — Remove the ERC-721-only filter; branch on detected standard
- [ ] **TASK-9.4.2** — ERC-1155 grid/item rendering with quantity (AC: 1)
- [ ] **TASK-9.4.3** — ERC-1155 transfer request (amount-aware) into the transfer flow (AC: 2)
- [ ] **TASK-9.4.4** — Amount validation against held balance (AC: 3)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — ERC-1155 detection via the Services SDK, consistent with ERC-721.
- Transfer assembly only — signing/submission is owned by [EPIC-8](../epics/EPIC-8.md) + [EPIC-2](../epics/EPIC-2.md). This story does not sign.

### Cross-story dependencies

- Builds on [US-9.3](US-9.3-evm-nft-display.md) — extends `EvmNftHandler`.
- Builds on [US-9.5](US-9.5-nft-transfer-send.md) — extends the NFT transfer flow with the ERC-1155 amount-aware path.

### What we explicitly did NOT do

- No batch (`safeBatchTransferFrom`) UI — single-item transfer only. Trigger to revisit: user demand for multi-ID batch sends.

### References

- [Source: PRD FR-88](../../PRD.md#functional-requirements) — ERC-1155 support
- [Roadmap issue #4881](https://github.com/Koniverse/SubWallet-Extension/issues/4881) — Add support for ERC-1155 token standard for NFTs on Ethereum
- `packages/extension-base/src/services/nft-service/nft-handlers/evm/`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: account with ERC-1155 tokens → collection + per-ID items with quantity |
| AC-2 | Manual: send an ERC-1155 token → signed, tracked in history |
| AC-3 | Manual: amount > balance → validation error, no submission |

## Changelog entry

### Added
- ERC-1155 NFT support: display of per-token-ID items with quantity, and amount-aware ERC-1155 transfer.

### Changed
- `EvmNftHandler` no longer filters to ERC-721 only; it branches on the detected EVM NFT standard.

**Commit**:

## Implementation notes

_Forward-planned — not yet shipped. Fill `commit` / `version_shipped` on delivery._

## Cross-references

- [PRD FR-88](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.3](US-9.3-evm-nft-display.md) · [US-9.5](US-9.5-nft-transfer-send.md)
- [Roadmap issue #4881](https://github.com/Koniverse/SubWallet-Extension/issues/4881) — Add support for ERC-1155 token standard for NFTs on Ethereum
</content>
