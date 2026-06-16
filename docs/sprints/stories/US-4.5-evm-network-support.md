---
id: US-4.5
title: "EVM network support"
epic: EPIC-4
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-36]
arch_ref: [AD-02]
depends_on: [US-4.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can use Ethereum mainnet, the major L2s, and EVM-compatible parachains
from the same wallet — balances, accounts and transactions — so EVM is a
first-class ecosystem alongside Substrate.

## Background

EVM is the second core ecosystem. Each EVM chain (Ethereum mainnet, Base,
Moonbeam, Astar, BNB Chain, Polygon, Avalanche, and others) connects through an
`EvmApi` per-chain object managed by `ChainService`
([AD-02](../../ARCHITECTURE.md#architecture-decisions)), parallel to the
`SubstrateApi` model. EVM accounts derive from the same unified multi-chain seed
([AD-11](../../ARCHITECTURE.md#architecture-decisions), owned by EPIC-3), so a
user gets EVM addresses without a separate backup.

This is an external-ecosystem integration: a different runtime (EVM JSON-RPC),
different address format, different signing payload, all behind the shared
`ChainService`/registry surface so the rest of the wallet treats it uniformly.

Materializes [FR-36](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [ ] **AC-1** — **Given** the registry, **When** the user enables an EVM network
  (mainnet / L2 / EVM parachain), **Then** an `EvmApi` object connects and the
  network becomes active.
- [ ] **AC-2** — **Given** the unified account, **When** EVM is enabled, **Then**
  the EVM address derives from the same seed (no separate backup) and shows
  balances on enabled EVM chains.
- [ ] **AC-3** — **Given** an EVM chain with a custom RPC, **When** the user sets
  it, **Then** the `EvmApi` connects through that endpoint (reuses US-4.1).
- [ ] **AC-4** — **Given** an EVM RPC that is unreachable, **When** connection is
  attempted, **Then** the network shows unavailable without blocking other chains.

## Tasks

- [ ] **TASK-4.5.1** — `EvmApi` per-chain object: connect/disconnect lifecycle via `ChainService` (AC: 1, 4)
- [ ] **TASK-4.5.2** — EVM account derivation from the unified seed + balance reads (AC: 2)
- [ ] **TASK-4.5.3** — Custom-RPC + connectivity status for EVM chains (AC: 3, 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — EVM chains use the `EvmApi` API-object type under the same `ChainService` engine.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — EVM is a branch of the unified multi-chain account (owned by EPIC-3).
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — reuses add/enable + custom-RPC for EVM chains.
- Sibling [US-4.15](US-4.15-flow-network-support.md) — Flow's EVM runtime reuses the `EvmApi` object type.

### Dev notes — points

5 pts — an external-system (EVM runtime) ecosystem integration: new API-object
type, address format, signing payload, per SKILL §3a-bis (1 external system
integration).

### References

- [Source: PRD FR-36](../../PRD.md#epic-4--chain-management) — EVM network support (Ethereum, L2s, EVM parachains)
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions)
- [Source: ARCHITECTURE AD-11](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-4 | Manual: enable an EVM chain → connects; unreachable RPC → unavailable |
| AC-2 | Manual: enable EVM → address from unified seed, balances shown |
| AC-3 | Manual: set custom EVM RPC → connects via it |

## Changelog entry

### Added
- EVM network support (Ethereum mainnet, Base, Moonbeam, Astar, BNB Chain, Polygon, Avalanche and others) via the `EvmApi` per-chain object.

**Commit**:

## Implementation notes

_Retroactive — capability already shipped. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [PRD FR-36](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md)
