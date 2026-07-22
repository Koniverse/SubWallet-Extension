---
id: US-4.10
title: "Starknet ecosystem integration"
epic: EPIC-4
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-41]
arch_ref: [AD-02]
depends_on: [US-4.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can hold and transfer STRK and Starknet ERC-20 tokens from the same
unified wallet, using a seed-phrase-derived account-abstracted Starknet wallet,
so the Starknet ecosystem joins the multi-chain account without a separate seed.

## Background

Starknet is a Cairo-based ZK-rollup whose accounts are smart contracts
(account-abstraction native). Integrating it requires a new `ChainService`
API-object type ([AD-02](../../ARCHITECTURE.md#architecture-decisions)) that
derives an account-abstracted Starknet wallet from the unified multi-chain seed
([AD-11](../../ARCHITECTURE.md#architecture-decisions), EPIC-3), connects to a
Starknet RPC/feeder gateway, and reads STRK plus Starknet ERC-20 balances. Because
Starknet accounts are deployed contracts, address derivation and the
account-deploy step differ from EOA ecosystems.

This story is **forward-looking** — Starknet is `📋 planned` in the PRD. It is the
first of the roadmap ecosystems, and it overlaps conceptually with the
account-abstraction standards work ([US-4.19](US-4.19-account-abstraction-standards.md)),
which generalises AA across EVM; here AA is Starknet-native. This story covers
**network + account model + token reads + transfers**; Starknet dApp connection
is deferred to its consuming epic if/when scheduled.

Materializes [FR-41](../../PRD.md#epic-4--chain-management).

## Acceptance criteria

- [ ] **AC-1** — **Given** the Starknet ecosystem is enabled, **When** an account
  is set up, **Then** an account-abstracted Starknet wallet derives from the
  unified seed (no separate seed/backup, AD-11) and its address is shown.
- [ ] **AC-2** — **Given** an enabled Starknet account, **When** balances load,
  **Then** STRK and Starknet ERC-20 token balances resolve through the Starknet
  API object (AD-02).
- [ ] **AC-3** — **Given** a funded Starknet account, **When** the user transfers
  STRK or an ERC-20, **Then** the transaction is built, signed and submitted, and
  appears in history (account-deploy handled on first outbound tx if required).
- [ ] **AC-4** — **Given** the Starknet endpoint is unreachable, **When** data is
  requested, **Then** a clear unavailable state is shown without breaking other
  ecosystems.

## Tasks

- [ ] **TASK-4.10.1** — Starknet API object (RPC/feeder gateway) wired into `ChainService` (AC: 2, 4)
- [ ] **TASK-4.10.2** — Seed-derived account-abstracted Starknet account + address derivation + deploy-on-first-tx (AC: 1, 3)
- [ ] **TASK-4.10.3** — STRK + Starknet ERC-20 balance reads (AC: 2)
- [ ] **TASK-4.10.4** — STRK / ERC-20 transfer build + sign + submit + history (AC: 3)
- [ ] **TASK-4.10.5** — Endpoint-unavailable error state (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — Starknet connects through a new dedicated `ChainService` API-object type, not an ad-hoc client.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — the Starknet account derives from the unified seed (EPIC-3); account-abstracted contract accounts must still honour the one-seed/one-backup promise.
- This story introduces no new AD entries; if the Starknet account model warrants its own decision at implementation time, append a CONTEXT entry then.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — uses the enable/disable + endpoint configuration surface.
- Sibling of [US-4.19](US-4.19-account-abstraction-standards.md) — both deal with account-abstraction; Starknet is AA-native, US-4.19 generalises AA over EVM.

### What we explicitly did NOT do

- No Starknet dApp connection in this story — deferred to its consuming epic when scheduled.
- No Starknet-specific paymaster/fee-token UX beyond native STRK fees — revisit if user demand or a partner integration requires it.

### Dev notes — points

5 pts — a new-ecosystem integration with an account-abstracted account model
(seed-derived contract account, deploy-on-first-tx, new API object), per SKILL
§3a-bis (1 external system integration). Forward-looking (FR-41 planned).

### References

- [Source: PRD FR-41](../../PRD.md#epic-4--chain-management) — Starknet seed-derived account-abstracted wallets, STRK + ERC-20 transfers
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects
- [Source: ARCHITECTURE AD-11](../../ARCHITECTURE.md#architecture-decisions) — unified multi-chain account model

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: enable Starknet → AA wallet address from unified seed, one backup |
| AC-2 | Manual: STRK + Starknet ERC-20 balances resolve |
| AC-3 | Manual: transfer STRK / ERC-20 → tx submitted, appears in history |
| AC-4 | Manual: block the Starknet endpoint → unavailable state, other chains fine |

## Changelog entry

### Added
- Starknet ecosystem: seed-derived account-abstracted Starknet wallets with STRK and Starknet ERC-20 balances and transfers.

**Commit**:

## Implementation notes

_Forward-looking (FR-41 planned). Fill on implementation._

_Speculative — no tracked roadmap issue found; inferred from the PRD roadmap._

## Cross-references

- [PRD FR-41](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.19](US-4.19-account-abstraction-standards.md)
