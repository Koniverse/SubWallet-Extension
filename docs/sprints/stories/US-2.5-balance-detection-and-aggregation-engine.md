---
id: US-2.5
title: "Balance detection & aggregation engine"
epic: EPIC-2
status: done
priority: P0
points: 8
sprint:
version_shipped: 0.2.2
prd_ref: [FR-9]
arch_ref: [AD-07, AD-24]
depends_on: [US-2.2]
assignee: saltict
commit: 4158deedde, 532e984c09, d48520c384
created: 2026-06-12
updated: 2026-06-12
---

> **⚠️ Corrected 2026-07-13 — AD-07's mechanism does not exist.** Wherever this file says
> reads ride a *"lightweight WsProvider"* and that a full `ApiPromise` is deferred to
> extrinsic construction, that is inherited from [AD-07](../../ARCHITECTURE.md#architecture-decisions),
> which was **decided in 2022 and never implemented**: `SubstrateApi` builds a full
> `ApiPromise` eagerly per enabled chain and the read path reads off it. Every memory figure
> here (~72 MB / ~264 MB) is a 2022 MV2-era claim with **no probe behind it**. The gap is
> owned by [US-20.3](US-20.3-read-path-memory-budget.md); the decision trail is
> [CONTEXT D95](../../CONTEXT.md).


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

- [x] **AC-1** — **Given** multiple accounts across many chains, **When** the
  engine subscribes, **Then** it produces aggregated transferable and locked
  balances per account and a portfolio roll-up, updating reactively.
- [x] **AC-2** — **Given** a token held by an account that is not yet in the
  active list, **When** detection runs, **Then** the token is auto-detected and
  its balance included in the aggregate.
- [x] **AC-3** — **Given** the read path, **When** balances are queried, **Then**
  they go through the lightweight WsProvider / Services SDK aggregation layer and
  do not force a full ApiPromise per chain (AD-07, AD-24).
- [x] **AC-4** — **Given** a chain's RPC or the Services SDK backend is
  unavailable, **When** that source fails, **Then** the engine degrades
  gracefully (stale/last-known for that source) without dropping balances from
  the healthy chains.

## Tasks

- [x] **TASK-2.5.1** — Subscribe + aggregate transferable/locked balances across accounts × chains (AC: 1)
- [x] **TASK-2.5.2** — Token auto-detection into the aggregate (AC: 2)
- [x] **TASK-2.5.3** — Read path over ChainService's per-chain API + the Services SDK aggregation layer (AC: 3). *(The "WsProvider-only" half of the original wording was never built — see the banner.)*
- [x] **TASK-2.5.4** — Per-source degradation on RPC / SDK backend failure (AC: 4)

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
| AC-3 | Services SDK aggregation is used (AD-24 — real). ⚠️ The "no full ApiPromise per chain" half is FALSE in the shipped code — see [US-20.3](US-20.3-read-path-memory-budget.md). |
| AC-4 | Test: RPC / SDK backend down → stale/last-known for that source, healthy chains unaffected |

## Changelog entry

### Added
- Balance detection & aggregation engine: subscribes to and aggregates
  transferable/locked balances across all accounts and 200+ chains with token
  auto-detection, backed by the Services SDK aggregation layer.

**Commit**:

## Implementation notes

Traced 2026-07-13 (US-21.2 straggler pass). Version from the CHANGELOG bullet that first delivers the capability: **[0.2.2] — 2022-02-19**, "Added the feature to track the balances of multiple accounts in one wallet" — the only early bullet naming balance tracking (0.1.0 / 0.2.1 are architecture + layout + NFT/staking only). Code chain: `4158deedde` created `State.balanceSubject` / `subscribeBalance()` over the whole `dotSamaAPIMap`; `532e984c09` turned it into the aggregating engine (`subscribeBalance(addresses[])` on `system.account.multi`, BN-summing free/reserved/frozen, `detectAddresses()` from `ALL_ACCOUNT_KEY`); `d48520c384` shipped the "All" account that makes it user-visible. **0.2.2 has no tag and no release commit** (one of the six earliest Koni releases predating this repo's recorded history), so containment is proven against the earliest existing tag instead: all three commits pass `git merge-base --is-ancestor <sha> v0.2.5`.

## Cross-references

- [PRD FR-9](../../PRD.md#functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [US-2.2](US-2.2-chainservice-live-api-per-chain.md)
