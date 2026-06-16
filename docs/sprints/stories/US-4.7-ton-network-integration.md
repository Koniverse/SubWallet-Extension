---
id: US-4.7
title: "TON network integration"
epic: EPIC-4
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-38]
arch_ref: [AD-13]
depends_on: [US-4.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can hold and view TON and Jetton tokens from the same unified wallet, and
choose which wallet-contract version their TON account uses, so funds created on
any prior contract version stay accessible from one seed.

## Background

TON is an account-model ecosystem with a distinctive wrinkle: the user's address
depends on the wallet-contract version. SubWallet uses `@ton/core` + `@ton/ton`
(TonClient) against the TonCenter API, exposes a user-selectable contract version
(v3r1 / v3r2 / v4 / v5, default v5), and supports the TEP-74 Jetton token
standard ([AD-13](../../ARCHITECTURE.md#architecture-decisions)). The official SDK
tracks the TON runtime, and selectable contract version preserves access to funds
created under any earlier version. The TON account derives from the unified
multi-chain seed ([AD-11](../../ARCHITECTURE.md#architecture-decisions), EPIC-3).

This story covers the **network integration, address/contract model, and Jetton
asset type**; TON dApp connection is owned by [EPIC-10](../epics/EPIC-10.md) and
TON transfers by [EPIC-8](../epics/EPIC-8.md). It plugs the TON client into the
`ChainService` per-chain API-object model ([AD-02](../../ARCHITECTURE.md#architecture-decisions)),
so it is a new API-object type rather than an ad-hoc client.

Materializes [FR-38](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [ ] **AC-1** — **Given** an account, **When** TON is enabled, **Then** a TON
  address is derived from the unified seed using the selected wallet-contract
  version (default v5), and balances load via TonCenter (AD-13).
- [ ] **AC-2** — **Given** an enabled TON account, **When** the user selects a
  different contract version (v3r1 / v3r2 / v4 / v5), **Then** the corresponding
  address is shown and its balance resolves, with no separate seed/backup (AD-11).
- [ ] **AC-3** — **Given** a TON account holding Jetton tokens, **When** balances
  load, **Then** TEP-74 Jettons are listed alongside native TON.
- [ ] **AC-4** — **Given** the TonCenter endpoint is unreachable, **When** data is
  requested, **Then** a clear unavailable state is shown without breaking other
  ecosystems.

## Tasks

- [ ] **TASK-4.7.1** — TON API object via `@ton/ton` TonClient against TonCenter, wired into `ChainService` (AC: 1, 4)
- [ ] **TASK-4.7.2** — Selectable wallet-contract version (v3r1/v3r2/v4/v5, default v5) with per-version address derivation (AC: 1, 2)
- [ ] **TASK-4.7.3** — TEP-74 Jetton asset type + balance read (AC: 3)
- [ ] **TASK-4.7.4** — TonCenter-unavailable error state (AC: 4)

## Dev notes

### Architecture constraints

- [AD-13](../../ARCHITECTURE.md#architecture-decisions) — `@ton/core` + `@ton/ton` against TonCenter; user-selectable contract version (default v5); TEP-74 Jetton standard.
- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — TON connects through a dedicated `ChainService` API object, not an ad-hoc client.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — TON address derives from the unified seed (EPIC-3).
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — uses the enable/disable + endpoint configuration surface.
- Sibling of the other ecosystem stories ([US-4.6](US-4.6-bitcoin-network-integration.md), [US-4.8](US-4.8-cardano-network-integration.md)) — all add a new `ChainService` API-object type.

### Dev notes — points

5 pts — a new-ecosystem (TON) integration: new API-object type, contract-version
address model, Jetton asset type and TonCenter wiring, per SKILL §3a-bis (1
external system integration).

### References

- [Source: PRD FR-38](../../PRD.md#epic-4--chain-management) — TON contract version (v3r1/v3r2/v4/v5) + Jetton
- [Source: ARCHITECTURE AD-13](../../ARCHITECTURE.md#architecture-decisions) — TON integration model
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2 | Manual: enable TON → v5 address + balance; switch contract version → matching address resolves, one seed |
| AC-3 | Manual: account with Jettons → Jetton balances listed alongside TON |
| AC-4 | Manual: block TonCenter → unavailable state, other chains fine |

## Changelog entry

### Added
- TON network integration with selectable wallet-contract version (v3r1/v3r2/v4/v5, default v5) and TEP-74 Jetton token support, via TonCenter.

**Commit**:

## Implementation notes

_Retroactive — capability already shipped. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [PRD FR-38](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.6](US-4.6-bitcoin-network-integration.md) · [US-4.8](US-4.8-cardano-network-integration.md)
