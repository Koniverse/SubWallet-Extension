---
id: US-7.1
title: "Aggregate portfolio across accounts and chains"
epic: EPIC-7
status: done
priority: P1
points: 5
sprint:
version_shipped: 0.2.2
prd_ref: [FR-68]
arch_ref: [AD-07, AD-24]
depends_on:
assignee: LeeW0ng
commit: 532e984c09, d48520c384, 3843712877
created: 2026-06-12
updated: 2026-06-12
---

> **⚠️ Corrected 2026-07-13 — AD-07's mechanism does not exist.** Wherever this file says
> reads ride a *"lightweight WsProvider"* and that a full `ApiPromise` is deferred to
> extrinsic construction, that is inherited from [AD-07](../../ARCHITECTURE.md#architecture-decisions),
> which was **decided in 2022 and never implemented**: `SubstrateApi` builds a full
> `ApiPromise` eagerly per enabled chain and the read path reads off it. Every memory figure
> here (~72 MB / ~264 MB) is a 2022 MV2-era claim with **no probe behind it**. **NFR-11 has
> since been retired and [US-20.3](US-20.3-read-path-memory-budget.md) deprecated** — memory
> is no longer a stated requirement ([CONTEXT D95](../../CONTEXT.md) / D96). Treat every
> memory sentence in this file as historical. If a memory complaint appears: **measure
> first** ([LESSONS §64](../../LESSONS.md)).


## Goal

A user opens the wallet and immediately sees one aggregated portfolio value —
the sum of every token they hold across every account and all 200+ supported
chains — so that the daily-home screen answers "how much do I have" without the
user switching accounts or networks. This story owns the read surface; the
downstream balance-semantics and price stories render *into* it.

## Background

This is the wallet's daily-home screen and the most-opened surface in the
product. The cross-chain aggregation itself is the **engine** layer: the
`BalanceService` and the SubWallet Services SDK
([AD-24](../../ARCHITECTURE.md#architecture-decisions)) fan transferable/locked
detection across all accounts and 200+ chains, riding the lightweight WsProvider
read path ([AD-07](../../ARCHITECTURE.md#architecture-decisions)) to stay
memory-bounded. That engine is owned by [EPIC-2](../epics/EPIC-2.md)
([US-2.5](US-2.5-balance-detection-and-aggregation-engine.md)); this story
*consumes* the aggregated RxJS subjects and renders the dashboard.

Because the MV3 background can be evicted and re-woken, the home screen must serve
last-known cached balances immediately on popup open and refresh progressively
with visible skeleton states (NFR-12) — a blank portfolio while waiting reads as a
broken wallet.

Materializes [FR-68](../../PRD.md#functional-requirements). This story is **retroactive** — the capability
already ships in the product; `commit` / `version_shipped` are backfilled during
version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** accounts across multiple ecosystems and chains, **When**
  the user opens the portfolio screen, **Then** a single aggregated fiat total is
  shown that equals the sum of all per-account, per-chain token values.
- [x] **AC-2** — **Given** the popup is opened after a background eviction, **When**
  the screen first paints, **Then** the last-known cached portfolio is shown within
  ≤ 300 ms with skeletons on not-yet-refreshed rows (NFR-12), never a blank screen.
- [x] **AC-3** — **Given** a selected account context (all-accounts vs a single
  account), **When** the user switches it, **Then** the aggregated total recomputes
  to the selected scope without forcing a full ApiPromise on the read path (AD-07).
- [x] **AC-4** — **Given** one chain's data source is unreachable, **When** the
  portfolio refreshes, **Then** the reachable chains still aggregate and the
  degraded chain is shown as stale/unavailable rather than failing the whole view.

## Tasks

- [x] **TASK-7.1.1** — Subscribe the portfolio screen to the aggregated `BalanceService` subjects from the Services SDK (AC: 1)
  - [x] Consume the multi-account/multi-chain subject exposed by [US-2.5](US-2.5-balance-detection-and-aggregation-engine.md); do not re-derive per-chain.
- [x] **TASK-7.1.2** — Cached-first render with progressive refresh + skeletons (AC: 2)
  - [x] Serve `redux-persist` last-known snapshot on open; replace rows as fresh data arrives.
- [x] **TASK-7.1.3** — Account-scope selector recompute on the read path (AC: 3). *("Lightweight" in the original wording is inherited from AD-07 and is not what the code does — see the banner.)*
  - [x] Assert no full `@polkadot/api` ApiPromise is instantiated for the read (AD-07).
- [x] **TASK-7.1.4** — Per-chain degraded-source handling (AC: 4)
  - [x] Mark unreachable chains stale; keep aggregate sum over reachable chains.

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — balance aggregation is fetched through the Services SDK backend, not computed entirely on-device; this screen consumes it.
- [AD-07](../../ARCHITECTURE.md#architecture-decisions) — balance/token queries use the lightweight WsProvider; the read path must stay memory-bounded (≤ 72 MB, NFR-11) regardless of chain count.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-2.5](US-2.5-balance-detection-and-aggregation-engine.md) — consumes the aggregated transferable/locked subject and the Services-SDK wiring.
- Required by [US-7.2](US-7.2-transferable-vs-locked-balance-calculation.md), [US-7.3](US-7.3-auto-detect-tokens-show-hide-zero-balance.md), [US-7.4](US-7.4-real-time-token-price-and-per-asset-chart.md) — they render into this dashboard and reuse the aggregated-balance subject fixture set up here.

### Performance budget

- Home-screen first paint: cached portfolio visible ≤ 300 ms on popup open (NFR-12).
- ~~Aggregation read memory: ≤ 72 MB~~ — **RETIRED** (CONTEXT D96): the budget was never measured and its mechanism never built.
- Story PR description must explicitly confirm both budgets are met.

### Points justification

5 pts — §3a-bis "1 external system integration": this is the portfolio
*aggregation* read surface wiring the home screen to the Services-SDK aggregation
backend (AD-24) plus the cached-first/progressive-refresh lifecycle. Aggregation /
price-feed integration sizes at 5 per the epic sizing guidance.

### References

- [Source: PRD FR-68](../../PRD.md#functional-requirements) — aggregate portfolio balance view
- ~~Source: PRD NFR-11~~ — **retired 2026-07-13** (no memory budget is stated any more; see [CONTEXT D96](../../CONTEXT.md))
- [Source: PRD NFR-12](../../PRD.md#non-functional-requirements) — cached cold-start + progressive refresh
- [Source: ARCHITECTURE AD-07, AD-24](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: hold tokens on 3+ chains/accounts → portfolio total equals sum of rows |
| AC-2 | Manual: idle until background evicts → reopen popup → cached total paints with skeletons, no blank |
| AC-3 | Component test: account-scope switch recomputes total; assert no full ApiPromise on the read path |
| AC-4 | Manual: disable one chain's RPC → reachable chains still aggregate; degraded chain shown stale |

## Changelog entry

### Added
- Aggregated portfolio home screen: single fiat total across all accounts and 200+
  chains, consuming the Services-SDK balance aggregation with cached-first paint and
  progressive refresh.

**Commit**:

## Implementation notes

Traced 2026-07-13 (US-21.2 straggler pass). Same first-delivery bullet as the engine story it reads from ([US-2.5](US-2.5-balance-detection-and-aggregation-engine.md)): **[0.2.2] — 2022-02-19**, "Added the feature to track the balances of multiple accounts in one wallet". This story owns the *read surface*: at the 0.2.2 cut, `Popup/Home/index.tsx` renders `<BalanceVal value={totalBalanceValue}>` from `useAccountBalance`, summing `convertedBalanceValue` over every shown network for every address behind `ALL_ACCOUNT_KEY` — one total across all accounts and chains. The all-accounts UI did not exist before 2022-02-11, so 0.2.1 (2022-02-10) could not have carried it. **0.2.2 is untagged**; all three commits verified contained in the earliest existing tag, `v0.2.5`.

## Cross-references

- [PRD FR-68](../../PRD.md#functional-requirements)
- [Epic EPIC-7](../epics/EPIC-7.md)
- [US-2.5](US-2.5-balance-detection-and-aggregation-engine.md)
- [US-7.2](US-7.2-transferable-vs-locked-balance-calculation.md)
</content>
