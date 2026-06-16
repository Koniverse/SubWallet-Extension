---
id: US-2.4
title: "SwapService routing engine"
epic: EPIC-2
status: backlog
priority: P1
points: 8
sprint:
version_shipped:
prd_ref: [FR-8]
arch_ref: [AD-24]
depends_on: [US-2.2]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

SwapService gives the wallet one interface over many swap providers — Chainflip,
Hydration, Uniswap, KyberSwap, SimpleSwap, Asset Hub DEX and Optimex — each
behind a per-provider handler that produces quotes and assembles multi-step
swap→bridge routes. The swap feature epic asks for "the best route from A to B"
and never touches provider-specific quoting, because this engine owns the
abstraction.

## Background

This story catalogues the **`swap-service`** module
(`packages/extension-base/src/services/swap-service`, per-provider handlers under
`handler/` — `chainflip-handler.ts`, `hydradx-handler.ts`, `uniswap-handler.ts`,
`kyber-handler.ts`, `simpleswap-handler.ts`, `asset-hub/`, `optimex-handler.ts`,
all over `base-handler.ts`). It is a **per-provider handler abstraction**: each
provider implements the same quote/route interface, and the engine selects and
chains them to build multi-step swap→bridge routes behind one surface.

It leans on [AD-24](../../ARCHITECTURE.md#architecture-decisions) — swap data is
aggregated through the SubWallet Services SDK backend rather than computed
entirely on-device, the same backend data plane the balance/fee engines use
([CONTEXT D66](../../CONTEXT.md)). SwapService introduces **no new AD**: it is the
provider-handler pattern applied to swaps on top of that data plane.

Its responsibility is *quote and route assembly*: normalize each provider's
quoting into one interface and compose multi-step routes. Sized 8 (multi-system:
seven external provider integrations, each with its own API/quoting semantics,
plus the cross-provider swap→bridge route assembly). Depends on US-2.2 for chain
API access.

This story is **Retroactive** — the engine already ships; `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** a source token/chain and a destination token/chain,
  **When** a quote is requested, **Then** each enabled provider handler produces
  a quote through the shared interface and the engine returns comparable
  options.
- [ ] **AC-2** — **Given** a route requiring more than one leg (swap then
  bridge), **When** the engine assembles it, **Then** it produces an ordered
  multi-step route behind one interface, not separate per-provider flows.
- [ ] **AC-3** — **Given** a new swap provider, **When** it is added as a handler
  over `base-handler.ts`, **Then** it plugs into quoting/routing without
  modifying the shared SwapService logic (handler abstraction).
- [ ] **AC-4** — **Given** a provider is unavailable, rate-limited, or returns an
  invalid quote, **When** quoting runs, **Then** that provider is skipped and the
  engine still returns the remaining viable routes (no whole-engine failure).

## Tasks

- [ ] **TASK-2.4.1** — Per-provider handler interface over `base-handler.ts` (Chainflip / Hydration / Uniswap / Kyber / SimpleSwap / Asset Hub / Optimex) (AC: 1, 3)
- [ ] **TASK-2.4.2** — Multi-step swap→bridge route assembly behind one interface (AC: 2)
- [ ] **TASK-2.4.3** — Quotes/route data sourced via the Services SDK data plane (AC: 1)
- [ ] **TASK-2.4.4** — Provider failure / rate-limit isolation during quoting (AC: 4)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — swap data is aggregated through the Services SDK backend, not computed entirely on-device; SwapService consumes that data plane.
- This story does NOT introduce new AD entries — the per-provider handler abstraction is an engine pattern over AD-24, not a new architecture decision.

### Cross-story dependencies

- Builds on [US-2.2](US-2.2-chainservice-live-api-per-chain.md) — provider handlers obtain chain APIs from ChainService.
- Sibling [US-2.5](US-2.5-balance-detection-and-aggregation-engine.md) — both source data through the Services SDK (AD-24); coordinate the SDK wiring.
- Required by [US-2.8](US-2.8-transaction-lifecycle-engine.md) — an assembled route is executed through the shared transaction lifecycle.

### References

- [Source: PRD FR-8](../../PRD.md#functional-requirements) — SwapService routing engine
- [Source: ARCHITECTURE AD-24](../../ARCHITECTURE.md#architecture-decisions)
- [Source: CONTEXT D66](../../CONTEXT.md) — aggregate multi-chain data through the Services SDK backend

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Unit test: each provider handler returns a quote through the shared interface (`services/swap-service/handler` tests) |
| AC-2 | Test: a cross-chain pair assembles an ordered multi-step swap→bridge route |
| AC-3 | Inspect: a new handler over `base-handler.ts` needs no shared-logic edits |
| AC-4 | Test: one provider down/invalid → skipped, remaining routes still returned |

## Changelog entry

### Added
- SwapService routing engine: per-provider handler abstraction (Chainflip,
  Hydration, Uniswap, KyberSwap, SimpleSwap, Asset Hub DEX, Optimex) producing
  quotes and multi-step swap→bridge routes behind one interface.

**Commit**:

## Implementation notes

_Retroactive story — engine already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-8](../../PRD.md#functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [CONTEXT D66](../../CONTEXT.md)
