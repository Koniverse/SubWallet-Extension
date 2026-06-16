---
id: US-2.5
title: "Balance detection & aggregation engine"
epic: EPIC-2
status: backlog
priority: P0
points: 8
sprint:
version_shipped:
prd_ref: [FR-9]
arch_ref: [AD-07, AD-24]
depends_on: [US-2.2]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The balance engine subscribes to and aggregates transferable and locked balances
across every account and 200+ chains, with token auto-detection, so that the
portfolio and send flows can ask "what does this user hold?" once and get a
single reactive, aggregated answer instead of fanning out per-chain RPC
themselves.

## Background

This story catalogues the **`balance-service`** module
(`packages/extension-base/src/services/balance-service`) — the read-side data
engine that aggregates holdings. It realizes two Architecture Decisions:

- [AD-07](../../ARCHITECTURE.md#architecture-decisions) — balance/token queries
  run over the lightweight WsProvider read path published by ChainService
  (US-2.2), keeping memory bounded as chain count grows.
- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — aggregation is backed by
  the **SubWallet Services SDK** backend (`@subwallet-monorepos/subwallet-services-sdk`,
  wired in `setup-api-sdk.ts`) rather than computed entirely on-device, because
  per-chain RPC across 200+ networks is heavy and rate-limited; the backend cuts
  client RPC load and centralizes assembly ([CONTEXT D66](../../CONTEXT.md),
  NFR-20).

Its responsibility is *balance subscription, token auto-detection and
aggregation*: maintain live transferable/locked balances per account/chain and
roll them up. Sized 8 (multi-system: live subscriptions across all accounts ×
200+ chains, token auto-detection, and the two-sided memory + backend-aggregation
contract). Depends on US-2.2 for the WsProvider read path.

This story is **Retroactive** — the engine already ships; `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** multiple accounts across many chains, **When** the
  engine subscribes, **Then** it produces aggregated transferable and locked
  balances per account and a portfolio roll-up, updating reactively.
- [ ] **AC-2** — **Given** a token held by an account that is not yet in the
  active list, **When** detection runs, **Then** the token is auto-detected and
  its balance included in the aggregate.
- [ ] **AC-3** — **Given** the read path, **When** balances are queried, **Then**
  they go through the lightweight WsProvider / Services SDK aggregation layer and
  do not force a full ApiPromise per chain (AD-07, AD-24).
- [ ] **AC-4** — **Given** a chain's RPC or the Services SDK backend is
  unavailable, **When** that source fails, **Then** the engine degrades
  gracefully (stale/last-known for that source) without dropping balances from
  the healthy chains.

## Tasks

- [ ] **TASK-2.5.1** — Subscribe + aggregate transferable/locked balances across accounts × chains (AC: 1)
- [ ] **TASK-2.5.2** — Token auto-detection into the aggregate (AC: 2)
- [ ] **TASK-2.5.3** — Read path over WsProvider + Services SDK aggregation layer (AC: 3)
- [ ] **TASK-2.5.4** — Per-source degradation on RPC / SDK backend failure (AC: 4)

## Dev notes

### Architecture constraints

- [AD-07](../../ARCHITECTURE.md#architecture-decisions) — balance reads use the lightweight WsProvider, never a full ApiPromise per chain.
- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — aggregation goes through the Services SDK backend; the engine does not re-implement on-device aggregation across 200+ chains.
- This story does NOT introduce new AD entries; it materializes AD-07 + AD-24.

### Cross-story dependencies

- Builds on [US-2.2](US-2.2-chainservice-live-api-per-chain.md) — consumes the WsProvider read path.
- Sibling [US-2.4](US-2.4-swapservice-routing-engine.md) — both source data through the Services SDK (AD-24); coordinate `setup-api-sdk.ts` wiring.
- Required by [US-2.6](US-2.6-fee-engine.md) and [US-2.8](US-2.8-transaction-lifecycle-engine.md) — both consult balances at validate/preflight time.

### Performance budget

- Balance reads stay in the WsProvider memory envelope (AD-07) and offload aggregation to the Services SDK (AD-24); story PR must confirm no per-chain ApiPromise on the read path.

### References

- [Source: PRD FR-9](../../PRD.md#functional-requirements) — balance detection & aggregation engine
- [Source: PRD NFR-20](../../PRD.md#non-functional-requirements) — Services SDK backend aggregation
- [Source: ARCHITECTURE AD-07, AD-24](../../ARCHITECTURE.md#architecture-decisions)
- [Source: CONTEXT D66](../../CONTEXT.md) — Services SDK aggregation

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Unit test: aggregated transferable/locked balances per account + roll-up (`services/balance-service` tests) |
| AC-2 | Test: a held-but-unlisted token is auto-detected into the aggregate |
| AC-3 | Inspect read path: WsProvider / Services SDK used; no full ApiPromise per chain |
| AC-4 | Test: RPC / SDK backend down → stale/last-known for that source, healthy chains unaffected |

## Changelog entry

### Added
- Balance detection & aggregation engine: subscribes to and aggregates
  transferable/locked balances across all accounts and 200+ chains with token
  auto-detection, backed by the Services SDK aggregation layer.

**Commit**:

## Implementation notes

_Retroactive story — engine already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-9](../../PRD.md#functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [US-2.2](US-2.2-chainservice-live-api-per-chain.md)
