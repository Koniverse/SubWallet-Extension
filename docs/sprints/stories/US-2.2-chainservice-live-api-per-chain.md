---
id: US-2.2
title: "ChainService — live API object per chain"
epic: EPIC-2
status: done
priority: P0
points: 8
sprint:
version_shipped: 1.0.1
prd_ref: [FR-6]
arch_ref: [AD-02, AD-07]
depends_on:
assignee: nulllpc
commit: 5c409b4fed470d0eccead52af6505c8d5f315309, e7dd01a79396934f9bf04fb83fe6e346c4d392fc
created: 2026-06-12
updated: 2026-06-12
---

## Goal

ChainService gives every supported network a single, managed API object and a
memory-bounded read path, so that across 200+ chains the rest of the wallet can
ask "give me the API for chain X" without re-implementing connect/disconnect,
retry, or metadata caching — and without blowing the extension's memory budget.
The balance, fee, earning, swap and transaction engines all stop worrying about
raw chain connectivity because this engine owns it.

## Background

This story catalogues the **`chain-service`** module
(`packages/extension-base/src/services/chain-service`) — the connectivity engine
that materializes two Architecture Decisions:

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — each supported chain
  gets a dedicated API object (`SubstrateApi` or `EvmApi`) managed by a central
  `ChainService` that encapsulates the connect/disconnect lifecycle, retry logic
  and per-chain metadata caching, replacing ad-hoc chain lookups (issues #894,
  #926, #1222; shipped v0.7.6).
- [AD-07](../../ARCHITECTURE.md#architecture-decisions) — for balance/token
  queries the engine uses a **lightweight WsProvider** connector and defers the
  full `@polkadot/api` ApiPromise until extrinsic construction actually needs it.
  This is a hard memory decision: the full ApiPromise consumed ~137 MB for 4
  chains / ~264 MB for 20 chains, whereas the WsProvider-only read path needs
  ~72 MB regardless of chain count (issues #217, #232; PR #3024; shipped
  v1.1.64).

Its responsibility is *live chain connectivity*: own one API object per network,
manage its lifecycle, and publish it to the data engines. Sized 8 (multi-system:
two ecosystem API families across 200+ networks, lifecycle/retry state, and the
dual-mode lightweight/full-API memory contract that every read-path engine
depends on).

This story is **Retroactive** — the engine already ships; `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a supported network, **When** a feature requests its
  API, **Then** ChainService returns a single managed API object
  (`SubstrateApi` / `EvmApi`) for that chain and reuses it rather than creating
  a duplicate (AD-02).
- [x] **AC-2** — **Given** balance/token queries across many chains, **When** the
  read path runs, **Then** it uses the lightweight WsProvider connector and does
  **not** instantiate a full ApiPromise, keeping memory bounded (AD-07).
- [x] **AC-3** — **Given** a chain connection drops, **When** the lifecycle
  manager detects it, **Then** it retries/reconnects and the cached metadata is
  reused without a full cold reload (AD-02).
- [x] **AC-4** — **Given** an unreachable or misconfigured RPC endpoint, **When**
  a connection is attempted, **Then** the chain is marked disconnected and the
  failure is surfaced without crashing other chains' API objects.

## Tasks

- [x] **TASK-2.2.1** — One managed `SubstrateApi`/`EvmApi` per network with reuse (AC: 1)
- [x] **TASK-2.2.2** — Lightweight WsProvider read path; defer full ApiPromise to extrinsic construction (AC: 2)
  - [x] Confirm memory envelope holds as chain count grows (AD-07).
- [x] **TASK-2.2.3** — Connect/disconnect/retry lifecycle + metadata cache (AC: 3)
- [x] **TASK-2.2.4** — Per-chain failure isolation on bad endpoints (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — a central `ChainService` owns per-chain API objects; no feature may open ad-hoc chain connections.
- [AD-07](../../ARCHITECTURE.md#architecture-decisions) — the read path uses the lightweight WsProvider; the full `@polkadot/api` ApiPromise is constructed only when extrinsic building requires it. This memory contract is non-negotiable on the balance/fee read path.
- This story does NOT introduce new AD entries; it materializes AD-02 + AD-07.

### Cross-story dependencies

- Required by [US-2.5](US-2.5-balance-detection-and-aggregation-engine.md) — the balance engine reads through the lightweight WsProvider this engine publishes.
- Required by [US-2.6](US-2.6-fee-engine.md), [US-2.3](US-2.3-earningservice-pool-handler-engine.md), [US-2.8](US-2.8-transaction-lifecycle-engine.md) — all obtain their chain API from this engine.

### Performance budget

- Balance/token read path memory stays in the WsProvider-only envelope (~72 MB regardless of chain count), not the full-ApiPromise envelope (~137 MB at 4 chains).
- Story PR description must confirm the read path does not force a full ApiPromise.

### References

- [Source: PRD FR-6](../../PRD.md#functional-requirements) — ChainService
- [Source: ARCHITECTURE AD-02, AD-07](../../ARCHITECTURE.md#architecture-decisions)
- Issues #894, #926, #1222 (AD-02); #217, #232, PR #3024 (AD-07)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Unit test: `ChainService` returns one cached `SubstrateApi`/`EvmApi` per chain key |
| AC-2 | Inspect read path: balance queries use WsProvider; assert no ApiPromise instantiation (`services/chain-service` tests) |
| AC-3 | Test: simulated disconnect → reconnect reuses cached metadata |
| AC-4 | Test: unreachable endpoint → chain marked disconnected, other chains unaffected |

## Changelog entry

### Added
- ChainService engine: one managed API object per network across 200+ chains
  with connect/disconnect/retry and metadata cache; lightweight WsProvider read
  path with deferred full ApiPromise to cap memory.

**Commit**:

## Implementation notes

_Retroactive story — engine already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-6](../../PRD.md#functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [US-2.5](US-2.5-balance-detection-and-aggregation-engine.md)
