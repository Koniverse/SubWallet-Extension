---
id: US-4.17
title: "Solana support"
epic: EPIC-4
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-48]
arch_ref: [AD-02]
depends_on: [US-4.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can hold and view SOL and SPL tokens from the same unified wallet, bringing
the Solana ecosystem into the multi-chain account without a separate seed.

## Background

Solana is a high-throughput, account-model chain with ed25519 keys, base58
addresses, and the SPL token-account model (token balances live in associated
token accounts rather than directly on the wallet). Supporting it is a
new-ecosystem integration: a dedicated `ChainService` API-object type
([AD-02](../../ARCHITECTURE.md#architecture-decisions)) that connects to a Solana
RPC, derives an ed25519 Solana account from the unified multi-chain seed
([AD-11](../../ARCHITECTURE.md#architecture-decisions), EPIC-3), and reads SOL plus
SPL-token balances via associated token accounts.

This story is **forward-looking** — FR-48 is `📋 planned`. It covers **network
presence + ed25519 account model + SOL/SPL balance reads**; transfer, priority-fee
UX and dApp flows are deferred to their consuming epics when scheduled.

Tracked by [#4127](https://github.com/Koniverse/SubWallet-Extension/issues/4127) —
Add support Solana.

Materializes [FR-48](../../PRD.md#epic-4--chain-management).

## Acceptance criteria

- [ ] **AC-1** — **Given** the Solana ecosystem is enabled, **When** an account is
  set up, **Then** an ed25519 Solana account (base58 address) derives from the
  unified seed (no separate seed/backup, AD-11).
- [ ] **AC-2** — **Given** an enabled Solana account, **When** balances load,
  **Then** SOL and held SPL tokens (via associated token accounts) resolve through
  the Solana API object (AD-02).
- [ ] **AC-3** — **Given** an account with no associated token account for an SPL
  token, **When** balances load, **Then** it is handled gracefully (no error, token
  simply absent/zero).
- [ ] **AC-4** — **Given** the Solana RPC is unreachable, **When** data is
  requested, **Then** a clear unavailable state is shown without breaking other
  ecosystems.

## Tasks

- [ ] **TASK-4.17.1** — Solana API object (RPC) wired into `ChainService` (AC: 2, 4)
- [ ] **TASK-4.17.2** — Seed-derived ed25519 Solana account + base58 address (AC: 1)
- [ ] **TASK-4.17.3** — SOL + SPL balance reads via associated token accounts (AC: 2, 3)
- [ ] **TASK-4.17.4** — Endpoint-unavailable error state (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — Solana connects through a new dedicated `ChainService` API-object type.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — the ed25519 Solana account derives from the unified seed (EPIC-3).
- This story introduces no new AD entries; the SPL associated-token-account model may warrant a CONTEXT decision at implementation time.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — uses the enable/disable + endpoint configuration surface.
- Sibling of [US-4.14](US-4.14-midnight-network-support.md), [US-4.15](US-4.15-flow-network-support.md), [US-4.16](US-4.16-cosmos-ecosystem-support.md).

### What we explicitly did NOT do

- No Solana transfer or priority-fee UX in this story — scoped to chain presence + SOL/SPL balances; deferred.

### Dev notes — points

5 pts — a new-ecosystem integration with an ed25519 account and SPL
associated-token-account model, per SKILL §3a-bis (1 external system integration).
Forward-looking (FR-48 planned).

### References

- [Source: PRD FR-48](../../PRD.md#epic-4--chain-management) — Solana support
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects
- [Source: ARCHITECTURE AD-11](../../ARCHITECTURE.md#architecture-decisions) — unified multi-chain account model
- [Roadmap: #4127](https://github.com/Koniverse/SubWallet-Extension/issues/4127) — Add support Solana

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: enable Solana → ed25519 base58 account from unified seed |
| AC-2 | Manual: SOL + SPL balances resolve via associated token accounts |
| AC-3 | Manual: token with no ATA → handled gracefully (zero/absent, no error) |
| AC-4 | Manual: block the Solana RPC → unavailable state, other chains fine |

## Changelog entry

### Added
- Solana support: seed-derived ed25519 Solana account with SOL and SPL token balances.

**Commit**:

## Implementation notes

_Forward-looking (FR-48 planned). Fill on implementation._

## Cross-references

- [PRD FR-48](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) · [#4127](https://github.com/Koniverse/SubWallet-Extension/issues/4127)
