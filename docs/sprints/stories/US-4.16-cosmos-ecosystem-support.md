---
id: US-4.16
title: "Cosmos ecosystem support"
epic: EPIC-4
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-47]
arch_ref: [AD-02]
depends_on: [US-4.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can hold and view Cosmos SDK chain assets from the same unified wallet,
bringing the Cosmos / IBC ecosystem into the multi-chain account without a
separate seed.

## Background

Cosmos is a family of application-specific chains built on the Cosmos SDK with
bech32 addresses (per-chain prefixes), Tendermint/CometBFT RPC, and IBC for
inter-chain transfers. Supporting it is a new-ecosystem integration: a dedicated
`ChainService` API-object type ([AD-02](../../ARCHITECTURE.md#architecture-decisions))
that connects to Cosmos RPC/REST endpoints, derives bech32 accounts (with the
correct per-chain prefix) from the unified multi-chain seed
([AD-11](../../ARCHITECTURE.md#architecture-decisions), EPIC-3), and reads native +
IBC-denom balances. Because Cosmos is a multi-chain family, the API object must be
parameterised by chain (prefix, denom, RPC) rather than hard-coded to one chain.

This story is **forward-looking** — FR-47 is `📋 planned`. It covers **network
presence + bech32 account model + balance reads** for Cosmos SDK chains; transfer,
IBC routing and dApp flows are deferred to their consuming epics when scheduled.

Tracked by [#4178](https://github.com/Koniverse/SubWallet-Extension/issues/4178) —
Cosmos Ecosystem Support, and
[#1648](https://github.com/Koniverse/SubWallet-Extension/issues/1648) — Keyring for
cosmos.

Materializes [FR-47](../../PRD.md#epic-4--chain-management).

## Acceptance criteria

- [ ] **AC-1** — **Given** a Cosmos SDK chain is enabled, **When** an account is set
  up, **Then** a bech32 account with the chain's prefix derives from the unified
  seed (no separate seed/backup, AD-11).
- [ ] **AC-2** — **Given** an enabled Cosmos chain, **When** balances load, **Then**
  the native denom and held IBC denoms resolve through the Cosmos API object (AD-02).
- [ ] **AC-3** — **Given** multiple Cosmos chains with different prefixes, **When**
  they are enabled, **Then** each shows its correctly-prefixed address from the same
  seed (parameterised API object, not per-chain hard-coding).
- [ ] **AC-4** — **Given** a Cosmos RPC endpoint is unreachable, **When** data is
  requested, **Then** a clear unavailable state is shown without breaking other
  ecosystems.

## Tasks

- [ ] **TASK-4.16.1** — Cosmos API object (Tendermint/CometBFT RPC/REST), parameterised by chain (prefix/denom/endpoint) (AC: 2, 3, 4)
- [ ] **TASK-4.16.2** — Seed-derived bech32 account derivation with per-chain prefix (AC: 1, 3)
- [ ] **TASK-4.16.3** — Native + IBC-denom balance reads (AC: 2)
- [ ] **TASK-4.16.4** — Endpoint-unavailable error state (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — Cosmos connects through a new dedicated `ChainService` API-object type, parameterised per Cosmos chain.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — Cosmos bech32 accounts derive from the unified seed (EPIC-3).
- This story introduces no new AD entries; the bech32-prefix/IBC model may warrant a CONTEXT decision at implementation time.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — uses the enable/disable + endpoint configuration surface (Cosmos chains are added like other networks).
- Sibling of [US-4.14](US-4.14-midnight-network-support.md), [US-4.15](US-4.15-flow-network-support.md), [US-4.17](US-4.17-solana-support.md).

### What we explicitly did NOT do

- No IBC transfer routing or Cosmos staking in this story — scoped to chain presence + balances; IBC/transfer deferred (relates to EPIC-13 / EPIC-8 when scheduled).

### Dev notes — points

5 pts — a new-ecosystem integration with a chain-parameterised account/RPC model
(bech32 prefixes, IBC denoms), per SKILL §3a-bis (1 external system integration).
Forward-looking (FR-47 planned).

### References

- [Source: PRD FR-47](../../PRD.md#epic-4--chain-management) — Cosmos ecosystem support
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects
- [Source: ARCHITECTURE AD-11](../../ARCHITECTURE.md#architecture-decisions) — unified multi-chain account model
- [Roadmap: #4178](https://github.com/Koniverse/SubWallet-Extension/issues/4178) — Cosmos Ecosystem Support
- [Roadmap: #1648](https://github.com/Koniverse/SubWallet-Extension/issues/1648) — Keyring for cosmos

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: enable a Cosmos chain → bech32 account from unified seed |
| AC-2 | Manual: native + IBC-denom balances resolve |
| AC-3 | Manual: enable two Cosmos chains → each shows its correct prefix from one seed |
| AC-4 | Manual: block the Cosmos RPC → unavailable state, other chains fine |

## Changelog entry

### Added
- Cosmos ecosystem support: seed-derived bech32 accounts and native + IBC-denom balances for Cosmos SDK chains.

**Commit**:

## Implementation notes

_Forward-looking (FR-47 planned). Fill on implementation._

## Cross-references

- [PRD FR-47](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) · [#4178](https://github.com/Koniverse/SubWallet-Extension/issues/4178) · [#1648](https://github.com/Koniverse/SubWallet-Extension/issues/1648)
