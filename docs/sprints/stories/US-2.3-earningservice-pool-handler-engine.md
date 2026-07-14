---
id: US-2.3
title: "EarningService pool-handler engine"
epic: EPIC-2
status: done
priority: P1
points: 8
sprint: sprint-2024-M02
version_shipped: 1.1.36
prd_ref: [FR-7]
arch_ref: [AD-22]
depends_on: [US-2.2]
assignee: S2kael
commit: 4e07f00c038fc83d50c6a4114eed05ec2b5aa3c6, 87da363f59886d6e77d9f4562e642063efba6678, 222fb694163870422264bbf2be1c9e0de169c4d2
created: 2026-06-12
updated: 2026-06-12
---

## Goal

EarningService models every yield mechanism — native staking, nomination pools,
collator/parachain staking, liquid staking, lending and dTAO subnets — through
one `BasePoolHandler` class tree, exposing positions via RxJS subjects. New
earning protocols are added by writing a subclass, not by branching shared code,
so the earning feature epic can grow its protocol catalogue without destabilizing
the engine.

## Background

This story catalogues the **`earning-service`** module
(`packages/extension-base/src/services/earning-service`, handlers under
`handlers/`) — the yield engine that materializes
[AD-22](../../ARCHITECTURE.md#architecture-decisions): every yield mechanism is a
node in a `BasePoolHandler` inheritance tree —
`BaseNativeStakingPoolHandler` (with relay / para / Astar / Mythos / Tao
subclasses), `NominationPoolHandler`, and `BaseSpecialStakingPoolHandler`
(→ liquid-staking / lending). Data is exposed via RxJS subjects and driven by
account / chain / transaction events. The handler-per-pool-type tree is the
**extensibility seam** for adding earning protocols without touching shared
logic, and it matches the dTAO subnet model ([CONTEXT D33](../../CONTEXT.md),
D46).

Its responsibility is *yield-position modelling and exposure*: subscribe to the
relevant chain data, compute positions per pool type, and publish them
reactively. Sized 8 (multi-system: a multi-level handler hierarchy spanning six
distinct staking mechanisms, each with its own on-chain data shape, all behind
one reactive contract). It depends on US-2.2 for chain API access.

This story is **Retroactive** — the engine already ships; `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** an account with positions across pool types, **When**
  EarningService runs, **Then** each position is produced by the matching
  `BasePoolHandler` subclass (native / nomination-pool / collator /
  liquid-staking / lending / dTAO subnet) and exposed via an RxJS subject
  (AD-22).
- [x] **AC-2** — **Given** a new yield protocol, **When** it is added as a
  `BasePoolHandler` subclass, **Then** it integrates without modifying shared
  EarningService logic (extensibility seam, AD-22).
- [x] **AC-3** — **Given** an account / chain / transaction event, **When** it
  fires, **Then** the affected handlers recompute and the RxJS subjects emit
  updated positions.
- [x] **AC-4** — **Given** a pool's data source is unavailable or returns
  malformed data, **When** a handler polls it, **Then** that handler degrades
  gracefully (no position emitted / stale flagged) without breaking sibling
  handlers.

## Tasks

- [x] **TASK-2.3.1** — `BasePoolHandler` tree: native / nomination-pool / collator / liquid-staking / lending / dTAO (AC: 1)
- [x] **TASK-2.3.2** — Subclass-only extensibility seam — no shared-logic edits to add a protocol (AC: 2)
- [x] **TASK-2.3.3** — Event-driven recompute + RxJS subject emission (AC: 3)
- [x] **TASK-2.3.4** — Per-handler degradation on missing/malformed pool data (AC: 4)

## Dev notes

### Architecture constraints

- [AD-22](../../ARCHITECTURE.md#architecture-decisions) — every yield mechanism is a node in the `BasePoolHandler` tree; data flows through RxJS subjects driven by events. Adding a protocol means subclassing, never adding conditionals to shared logic.
- This story does NOT introduce new AD entries; it materializes AD-22.

### Cross-story dependencies

- Builds on [US-2.2](US-2.2-chainservice-live-api-per-chain.md) — handlers obtain their chain API from ChainService.
- Sibling [US-2.5](US-2.5-balance-detection-and-aggregation-engine.md) — earning positions and balances both surface via reactive subjects; coordinate the event-subscription model.
- Required by the earning feature epic — its screens consume these subjects.

### References

- [Source: PRD FR-7](../../PRD.md#functional-requirements) — EarningService pool-handler engine
- [Source: ARCHITECTURE AD-22](../../ARCHITECTURE.md#architecture-decisions)
- [Source: CONTEXT D33](../../CONTEXT.md) — dTAO / Alpha Token Subnet staking model; D46 — static earning cache

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Unit test: each pool type resolves to its `BasePoolHandler` subclass; subjects emit positions (`services/earning-service` tests) |
| AC-2 | Inspect: adding a handler subclass requires no edit to shared EarningService logic |
| AC-3 | Test: account/chain/transaction event → subjects re-emit updated positions |
| AC-4 | Test: a handler's data source down → that handler degrades, siblings keep emitting |

## Changelog entry

### Added
- EarningService pool-handler engine: a `BasePoolHandler` class tree (native /
  nomination-pool / collator / liquid-staking / lending / dTAO subnet) exposing
  yield positions via RxJS subjects, extensible by subclassing.

**Commit**:

## Implementation notes

_Retroactive story — engine already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-7](../../PRD.md#functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [CONTEXT D33](../../CONTEXT.md)
