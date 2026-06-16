---
id: US-4.14
title: "Midnight network support"
epic: EPIC-4
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-45]
arch_ref: [AD-02]
depends_on: [US-4.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can hold and view Midnight assets from the same unified wallet, bringing
the Midnight privacy/ZK ecosystem into the multi-chain account without a separate
seed.

## Background

Midnight is a privacy-focused, ZK-based network in the Polkadot/Substrate orbit.
Adding it is a new-ecosystem integration: a dedicated `ChainService` API-object
type ([AD-02](../../ARCHITECTURE.md#architecture-decisions)) that connects to the
Midnight network, derives a Midnight account from the unified multi-chain seed
([AD-11](../../ARCHITECTURE.md#architecture-decisions), EPIC-3), and reads
balances. Midnight's shielded/ZK transaction model may require ecosystem-specific
state handling (e.g. a proving/witness step), so the exact account and balance
shape will be pinned during implementation.

This story is **forward-looking** — FR-45 is `📋 planned`. It covers **network +
account model + balance reads**; transfer, dApp connection and any privacy-feature
UX are deferred to their consuming epics / later iterations when scheduled.

Tracked by [#4394](https://github.com/Koniverse/SubWallet-Extension/issues/4394) —
Support Midnight Ecosystem, and
[#4944](https://github.com/Koniverse/SubWallet-Extension/issues/4944) — Add support
for Midnight Preview.

Materializes [FR-45](../../PRD.md#epic-4--chain-management).

## Acceptance criteria

- [ ] **AC-1** — **Given** the Midnight ecosystem is enabled, **When** an account
  is set up, **Then** a Midnight account derives from the unified seed (no separate
  seed/backup, AD-11) and its address/identifier is shown.
- [ ] **AC-2** — **Given** an enabled Midnight account, **When** balances load,
  **Then** the account's assets resolve through the Midnight API object (AD-02).
- [ ] **AC-3** — **Given** the Midnight endpoint is unreachable, **When** data is
  requested, **Then** a clear unavailable state is shown without breaking other
  ecosystems.

## Tasks

- [ ] **TASK-4.14.1** — Midnight API object wired into `ChainService` (AC: 2, 3)
- [ ] **TASK-4.14.2** — Seed-derived Midnight account + address/identifier derivation (AC: 1)
- [ ] **TASK-4.14.3** — Balance reads (respecting Midnight's shielded/ZK state model) (AC: 2)
- [ ] **TASK-4.14.4** — Endpoint-unavailable error state (AC: 3)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — Midnight connects through a new dedicated `ChainService` API-object type.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — the Midnight account derives from the unified seed (EPIC-3).
- This story introduces no new AD entries; Midnight's ZK/proving model may warrant a CONTEXT decision at implementation time — append it then.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — uses the enable/disable + endpoint configuration surface.
- Sibling of the other planned-ecosystem stories ([US-4.15](US-4.15-flow-network-support.md), [US-4.16](US-4.16-cosmos-ecosystem-support.md), [US-4.17](US-4.17-solana-support.md)) — each adds a new `ChainService` API-object type.

### What we explicitly did NOT do

- No Midnight transfer or privacy-feature UX in this story — scoped to network presence + balance reads; deferred to a later iteration.

### Dev notes — points

5 pts — a new-ecosystem integration with a non-standard (ZK/shielded) state model,
per SKILL §3a-bis (1 external system integration). Forward-looking (FR-45 planned).

### References

- [Source: PRD FR-45](../../PRD.md#epic-4--chain-management) — Midnight network support
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects
- [Source: ARCHITECTURE AD-11](../../ARCHITECTURE.md#architecture-decisions) — unified multi-chain account model
- [Roadmap: #4394](https://github.com/Koniverse/SubWallet-Extension/issues/4394) — Support Midnight Ecosystem
- [Roadmap: #4944](https://github.com/Koniverse/SubWallet-Extension/issues/4944) — Add support for Midnight Preview

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: enable Midnight → account from unified seed, identifier shown |
| AC-2 | Manual: balances resolve via the Midnight API object |
| AC-3 | Manual: block the Midnight endpoint → unavailable state, other chains fine |

## Changelog entry

### Added
- Midnight network support: seed-derived Midnight account with balance display in the unified multi-chain wallet.

**Commit**:

## Implementation notes

_Forward-looking (FR-45 planned). Fill on implementation._

## Cross-references

- [PRD FR-45](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) · [#4394](https://github.com/Koniverse/SubWallet-Extension/issues/4394) · [#4944](https://github.com/Koniverse/SubWallet-Extension/issues/4944)
