---
id: US-7.5
title: "Price history (OHLCV) chart per asset"
epic: EPIC-7
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-72]
arch_ref: [AD-25]
depends_on: [US-7.4]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Show a historical price chart per asset built from OHLCV (open/high/low/close/volume)
data with selectable time ranges, so that a user can review how an asset has moved
over days/weeks/months directly inside the wallet rather than opening an external
price site.

## Background

[US-7.4](US-7.4-real-time-token-price-and-per-asset-chart.md) shipped the live price
and the current-period chart; this story extends it backward in time with historical
OHLCV. The series is fetched through the same `api-cache` proxy
([AD-25](../../ARCHITECTURE.md#architecture-decisions), NFR-21) that fronts the live
price, reusing the price-proxy mock fixture for tests. Historical OHLCV is heavier and
slower-changing than the live tick, so it is range-scoped (1D / 1W / 1M / 1Y) and
cached aggressively — a user flipping ranges should not re-hammer the upstream.

This story owns the historical-chart *display* (range selector, OHLCV rendering,
empty/degraded states); the provider integration shares the price-feed engine wiring
of [EPIC-2](../epics/EPIC-2.md).

Materializes [FR-72](../../PRD.md#functional-requirements). This story is **retroactive** — the capability
already ships; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** an asset with historical data, **When** the user opens its
  chart and selects a range (1D / 1W / 1M / 1Y), **Then** the OHLCV series for that
  range renders, fetched through the `api-cache` proxy (AD-25).
- [ ] **AC-2** — **Given** the user switches ranges repeatedly, **When** a range was
  already loaded, **Then** it is served from cache without a redundant upstream fetch.
- [ ] **AC-3** — **Given** an asset with no historical data (newly listed / unsupported),
  **When** its chart is opened, **Then** an explicit empty state is shown rather than a
  broken or blank chart.
- [ ] **AC-4** — **Given** the history proxy is unreachable, **When** the chart loads,
  **Then** the last cached series for the selected range is shown marked stale (or the
  empty state if none), and the chart does not error.

## Tasks

- [ ] **TASK-7.5.1** — Range-scoped OHLCV chart with a range selector (AC: 1)
  - [ ] Fetch the historical series via `api-cache`; render OHLCV; reuse the price-proxy mock fixture from US-7.4.
- [ ] **TASK-7.5.2** — Per-range cache so range flips don't refetch (AC: 2)
- [ ] **TASK-7.5.3** — Empty + degraded states (AC: 3, 4)
  - [ ] No-data → explicit empty state; proxy-down → stale cached series or empty, never error.

## Dev notes

### Architecture constraints

- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — historical OHLCV is fetched through the `api-cache` proxy with a fallback; range-scoped and cached to limit upstream load (NFR-21).
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-7.4](US-7.4-real-time-token-price-and-per-asset-chart.md) — extends the per-asset chart with history and reuses the price-proxy mock fixture.
- Sibling [US-7.6](US-7.6-balance-history-portfolio-value-over-time.md) — both render historical series; coordinate the range-selector component.

### Performance budget

- Range flips to an already-loaded range issue 0 upstream fetches (served from cache).
- Story PR description must explicitly confirm this budget is met.

### References

- [Source: PRD FR-72](../../PRD.md#functional-requirements) — price history chart (historical OHLCV)
- [Source: PRD NFR-21](../../PRD.md#non-functional-requirements) — cache / CDN proxy for market data
- [Source: ARCHITECTURE AD-25](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: open asset chart, select each range → OHLCV series renders |
| AC-2 | Manual/network: re-select a loaded range → no new upstream request |
| AC-3 | Manual: open an unsupported asset's chart → explicit empty state |
| AC-4 | Manual: block the history proxy → stale cached series or empty, no error |

## Changelog entry

### Added
- Per-asset historical price chart (OHLCV) with selectable ranges, fetched through the
  `api-cache` proxy with per-range caching and stale/empty fallbacks.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-72](../../PRD.md#functional-requirements)
- [Epic EPIC-7](../epics/EPIC-7.md)
- [US-7.4](US-7.4-real-time-token-price-and-per-asset-chart.md)
</content>
