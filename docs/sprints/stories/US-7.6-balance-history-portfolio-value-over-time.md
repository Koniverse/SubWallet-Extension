---
id: US-7.6
title: "Balance history (portfolio value over time)"
epic: EPIC-7
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-73]
arch_ref: [AD-23, AD-25]
depends_on: [US-7.1, US-7.4]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Show the user how their **total portfolio value has moved over time** — a
value-over-time chart of the whole portfolio, not a single asset — so that a holder
can see whether their net worth is up or down across a chosen range and understand
the trend at a glance from the home screen.

## Background

This is the one **forward / planned** capability in the balance epic (FR-73 is
`📋 planned` in the [PRD](../../PRD.md#functional-requirements), unlike the shipped FR-68..72). Balance
history is distinct from price history (US-7.5): price history is per-asset OHLCV;
balance history is the user's *aggregated holdings* valued over time — it depends on
both the holdings series and the historical prices.

Two sources combine: the aggregated portfolio composition from
[US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md) and historical
prices through the `api-cache` proxy
([AD-25](../../ARCHITECTURE.md#architecture-decisions), reused from
[US-7.4](US-7.4-real-time-token-price-and-per-asset-chart.md)). Because computing a
full historical valuation live across 200+ chains would be heavy, the heavy/slow
series is a candidate for the static-data caching pattern
([AD-23](../../ARCHITECTURE.md#architecture-decisions)) — precompute and serve rather
than recompute on every open. This story is explicitly *not* a transaction-history
list (that is EPIC-8); it is a value-over-time series.

This story is **forward** — it is being authored ahead of implementation as the
planned balance-history feature; status stays `backlog` until scheduled. Tracked by
[#4121](https://github.com/Koniverse/SubWallet-Extension/issues/4121) — Support portfolio chart.

## Acceptance criteria

- [ ] **AC-1** — **Given** a portfolio with holdings and available historical prices,
  **When** the user opens balance history and selects a range, **Then** a
  value-over-time chart of total portfolio fiat value renders for that range.
- [ ] **AC-2** — **Given** balance history is requested, **When** it loads, **Then**
  the heavy historical series is served from a precomputed/cached source (AD-23 /
  `api-cache`) rather than recomputed live across all chains on every open.
- [ ] **AC-3** — **Given** a wallet with insufficient history (new account, or a range
  before first activity), **When** the chart is opened, **Then** an explicit empty /
  partial state is shown rather than a misleading flat-zero line.
- [ ] **AC-4** — **Given** the history source is unreachable, **When** the chart loads,
  **Then** the last cached series is shown marked stale (or the empty state if none),
  and the screen does not error.

## Tasks

- [ ] **TASK-7.6.1** — Compose portfolio value-over-time from holdings + historical prices (AC: 1)
  - [ ] Combine the aggregated composition (US-7.1) with the historical price series (US-7.4 proxy / price-proxy mock).
- [ ] **TASK-7.6.2** — Serve the heavy series from a precomputed/cached source (AC: 2)
  - [ ] Use the static-data caching pattern (AD-23) / `api-cache`; do not recompute full history live on each open.
- [ ] **TASK-7.6.3** — Empty / partial-history state (AC: 3)
- [ ] **TASK-7.6.4** — Source-unreachable degradation (AC: 4)

## Dev notes

### Architecture constraints

- [AD-23](../../ARCHITECTURE.md#architecture-decisions) — heavy, slow-changing historical valuation is a static-data caching candidate (precompute + serve), not a live per-open recomputation across 200+ chains.
- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — historical prices come through the `api-cache` proxy reused from US-7.4.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md) — uses the aggregated portfolio composition.
- Builds on [US-7.4](US-7.4-real-time-token-price-and-per-asset-chart.md) — reuses the price-proxy mock fixture / historical price source.
- Sibling [US-7.5](US-7.5-price-history-ohlcv-chart-per-asset.md) — shares the historical range-selector component.

### Performance budget

- Balance-history open serves a cached/precomputed series — no full live re-valuation across all chains per open (AD-23).
- Story PR description must explicitly confirm this budget is met.

### What we explicitly did NOT do

- No transaction-history list — value-over-time is a series; the on-chain tx list is owned by [EPIC-8](../epics/EPIC-8.md).

### References

- [Source: PRD FR-73](../../PRD.md#functional-requirements) — balance history (historical portfolio value over time)
- [Source: ARCHITECTURE AD-23](../../ARCHITECTURE.md#architecture-decisions) — static-data caching via headless web-runner cron
- [Source: ARCHITECTURE AD-25](../../ARCHITECTURE.md#architecture-decisions) — cache / CDN proxy for market data
- [Roadmap issue #4121](https://github.com/Koniverse/SubWallet-Extension/issues/4121) — Support portfolio chart

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: open balance history, select a range → portfolio value-over-time chart renders |
| AC-2 | Network: confirm the series is served from cache/precompute, not a live full re-valuation |
| AC-3 | Manual: new account / pre-activity range → explicit empty/partial state, not flat zero |
| AC-4 | Manual: block the history source → stale cached series or empty, no error |

## Changelog entry

### Added
- Balance-history chart: total portfolio value over time across selectable ranges,
  composed from holdings + historical prices and served from a precomputed/cached
  source.

**Commit**:

## Implementation notes

_Forward / planned story — authored ahead of implementation. Fill `commit`,
`version_shipped` and implementation caveats when the feature lands._

## Cross-references

- [PRD FR-73](../../PRD.md#functional-requirements)
- [Epic EPIC-7](../epics/EPIC-7.md)
- [US-7.4](US-7.4-real-time-token-price-and-per-asset-chart.md)
- [US-7.5](US-7.5-price-history-ohlcv-chart-per-asset.md)
- [Roadmap issue #4121](https://github.com/Koniverse/SubWallet-Extension/issues/4121) — Support portfolio chart
</content>
