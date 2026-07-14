---
id: US-7.4
title: "Real-time token price and per-asset chart"
epic: EPIC-7
status: done
priority: P1
points: 5
sprint: sprint-2025-M04
version_shipped: 1.3.33
prd_ref: [FR-71]
arch_ref: [AD-25]
depends_on: [US-7.1]
assignee: Thiendekaco
commit: a7c5edd647, c8c4078bb8, c349c1f6f6
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Show a live USD price for every held asset and a per-asset price chart, so that
the portfolio's fiat total is real-time and a user can see how an asset's price is
moving without leaving the wallet. This is what turns the balance dashboard from a
token-count view into a *value* view.

## Background

The aggregated portfolio (US-7.1) sums *token amounts*; to show fiat value it needs
a price layer. Token prices, exchange rates and chart data are fetched through
SubWallet's `api-cache` proxy ([AD-25](../../ARCHITECTURE.md#architecture-decisions),
NFR-21) with a `static-cache` fallback — never directly from a keyed upstream in the
bundle (NFR-16). Fronting upstream providers with the proxy reduces rate-limit
exposure and survives an upstream outage with the last cached price.

The price-feed *engine* (provider fetch + cache assembly) shares the
`BalanceService` / Services-SDK wiring owned by [EPIC-2](../epics/EPIC-2.md); this
story owns the price *display* — the live tick on each token row, the multiplied
fiat total, and the current-period per-asset chart — rendered into the dashboard
from US-7.1.

Materializes [FR-71](../../PRD.md#functional-requirements). This story is **retroactive** — the capability
already ships; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** held assets with a price source, **When** the portfolio
  renders, **Then** each asset shows a live USD price and the portfolio fiat total
  equals Σ(amount × price), fetched through the `api-cache` proxy (AD-25).
- [x] **AC-2** — **Given** an asset detail view, **When** the user opens it, **Then**
  a current-period price chart renders for that asset.
- [x] **AC-3** — **Given** the price proxy is unreachable, **When** the portfolio
  refreshes, **Then** the last cached price is shown marked stale (or "—" if no
  cache) and the screen does not error or block; live refresh resumes when the
  proxy recovers.
- [x] **AC-4** — **Given** an asset with no price source, **When** it is rendered,
  **Then** its amount still shows but it contributes 0 to the fiat total and is not
  treated as a fetch failure.

## Tasks

- [x] **TASK-7.4.1** — Render live USD price per asset and compute the fiat total (AC: 1, 4)
  - [x] Fetch prices via the `api-cache` proxy; multiply into the aggregated amounts from US-7.1.
- [x] **TASK-7.4.2** — Per-asset current-period price chart on the detail view (AC: 2)
  - [x] Render the chart from the proxy price series; share the price-proxy mock fixture for tests.
- [x] **TASK-7.4.3** — Proxy-unreachable / no-price-source degradation (AC: 3, 4)
  - [x] Show stale cached price or "—"; never error the portfolio; resume on recovery.

## Dev notes

### Architecture constraints

- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — token prices and exchange rates come through the `api-cache` proxy with a `static-cache` fallback; no keyed upstream is called directly from the bundle (NFR-16).
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md) — multiplies prices into the aggregated token amounts.
- Required by [US-7.5](US-7.5-price-history-ohlcv-chart-per-asset.md), [US-7.6](US-7.6-balance-history-portfolio-value-over-time.md) — they reuse the price-proxy mock fixture set up here.

### Performance budget

- Live price tick: ≤ 1 fetch per asset per refresh window through `api-cache` (NFR-21).
- Story PR description must explicitly confirm this budget is met.

### References

- [Source: PRD FR-71](../../PRD.md#functional-requirements) — real-time token price + price chart
- [Source: PRD NFR-21](../../PRD.md#non-functional-requirements) — cache / CDN proxy for market data
- [Source: PRD NFR-16](../../PRD.md#non-functional-requirements) — third-party API-key protection (proxied providers)
- [Source: ARCHITECTURE AD-25](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: portfolio fiat total equals Σ(amount × price); prices sourced from `api-cache` |
| AC-2 | Manual: open an asset → current-period price chart renders |
| AC-3 | Manual: block the price proxy → stale/`—` price shown, no error; recovers on restore |
| AC-4 | Component test: a no-price asset shows amount, contributes 0, no fetch-failure state |

## Changelog entry

### Added
- Live USD price per asset and per-asset current-period price chart, fetched through
  the `api-cache` proxy with stale-cache fallback; fiat portfolio total.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-71](../../PRD.md#functional-requirements)
- [Epic EPIC-7](../epics/EPIC-7.md)
- [US-7.5](US-7.5-price-history-ohlcv-chart-per-asset.md)
</content>
