---
id: US-2.8
title: "Transaction lifecycle engine"
epic: EPIC-2
status: done
priority: P0
points: 8
sprint: sprint-2023-M03
version_shipped: 1.0.1
prd_ref: [FR-12]
arch_ref: [AD-21]
depends_on: [US-2.2, US-2.6, US-2.7]
assignee: saltict
commit: d0f9b37006, f15076f210, 1cd0cd7755
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The transaction lifecycle engine drives every transaction — transfer, swap, earn,
XCM, governance — through one shared status machine: build → validate → sign →
submit → track → history. Each feature epic hands the engine a typed transaction
and gets back consistent validation, submission and tracking, so no feature
reinvents fee preflight, signing handoff, submission, status tracking or history
recording for itself.

## Background

This story catalogues the **`transaction-service`** module
(`packages/extension-base/src/services/transaction-service`) — `TransactionService`
in the transaction & request subsystem described in
[ARCHITECTURE](../../ARCHITECTURE.md). It validates, routes, submits and caches
transactions and advances each through a shared status machine regardless of type
(transfer / swap / earn / XCM / governance). In-app flows go
UI → `TransactionService` → `RequestService` → sign → submit → `HistoryService`;
the engine records in-app submissions and the history merge picks up per-chain
indexer history (Subscan / Blockstream / taostats).

It composes the other engines rather than duplicating them: it consults the **fee
engine** ([US-2.6](US-2.6-fee-engine.md)) at validate/preflight, routes the sign
step through the **RequestService** approval queue
([US-2.7](US-2.7-requestservice-approval-queue.md),
[AD-21](../../ARCHITECTURE.md#architecture-decisions)), and obtains chain APIs from
**ChainService** ([US-2.2](US-2.2-chainservice-live-api-per-chain.md)) to build and
submit extrinsics. The shared lifecycle is what lets every higher feature epic
("send", "swap", "stake", "vote") express only its transaction *content* and
inherit a uniform status/history contract.

Sized 8 (multi-system: one status machine spanning five transaction families and
every ecosystem, coordinating the fee, request and chain engines plus in-app and
indexer history). Depends on US-2.2 (chain APIs), US-2.6 (fee preflight) and US-2.7
(sign-step approval).

This story is **Retroactive** — the engine already ships; `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** any transaction type (transfer / swap / earn / XCM /
  governance), **When** it is submitted, **Then** it advances through the same
  build → validate → sign → submit → track → history lifecycle, not a per-feature
  flow.
- [x] **AC-2** — **Given** the validate/preflight step, **When** the engine
  prepares a transaction, **Then** it consults the fee engine (US-2.6) for cost
  and routes the sign step through RequestService (US-2.7, AD-21).
- [x] **AC-3** — **Given** a submitted transaction, **When** it is tracked,
  **Then** its status is updated through the shared status machine and the
  in-app submission is recorded and merged into history.
- [x] **AC-4** — **Given** validation fails or submission is rejected/errors,
  **When** the lifecycle runs, **Then** the engine surfaces a typed failed status
  and does not record a successful submission (no false-positive history entry).

## Tasks

- [x] **TASK-2.8.1** — Shared status machine spanning transfer / swap / earn / XCM / governance (AC: 1)
- [x] **TASK-2.8.2** — Validate/preflight: consult the fee engine and route signing through RequestService (AC: 2)
  - [x] Build/submit extrinsics via ChainService APIs (US-2.2).
- [x] **TASK-2.8.3** — Track status + record in-app submission, merge with per-chain indexer history (AC: 3)
- [x] **TASK-2.8.4** — Typed failed status on validation/submission error; no false-positive history (AC: 4)

## Dev notes

### Architecture constraints

- [AD-21](../../ARCHITECTURE.md#architecture-decisions) — the sign step is delegated to RequestService's per-ecosystem approval surface, not signed inline.
- The message-bus isolation, MV3 lifecycle, storage and `HistoryService` indexer-merge are generic runtime plumbing documented in [ARCHITECTURE](../../ARCHITECTURE.md); this story consumes them and does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-2.2](US-2.2-chainservice-live-api-per-chain.md) — builds/submits extrinsics via ChainService APIs.
- Builds on [US-2.6](US-2.6-fee-engine.md) — consults the fee engine at validate/preflight.
- Builds on [US-2.7](US-2.7-requestservice-approval-queue.md) — routes the sign step through the approval queue.
- Required by every transaction-driving feature epic (transfer / swap / earn / XCM / governance) — they submit through this lifecycle instead of building their own.

### References

- [Source: PRD FR-12](../../PRD.md#functional-requirements) — transaction lifecycle engine
- [Source: ARCHITECTURE §Transaction & request subsystem](../../ARCHITECTURE.md)
- [Source: ARCHITECTURE AD-21](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Unit test: each transaction type advances the same status machine (`services/transaction-service` tests) |
| AC-2 | Test: validate step calls the fee engine and the sign step enqueues in RequestService |
| AC-3 | Test: submitted tx is tracked to status; in-app submission recorded and merged into history |
| AC-4 | Test: validation/submission error → typed failed status, no successful-history entry |

## Changelog entry

### Added
- Transaction lifecycle engine: drives every transaction (transfer / swap / earn /
  XCM / governance) through one build → validate → sign → submit → track → history
  status machine, composing the fee, request and chain engines.

**Commit**:

## Implementation notes

_Retroactive story — engine already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-12](../../PRD.md#functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [US-2.6](US-2.6-fee-engine.md)
- [US-2.7](US-2.7-requestservice-approval-queue.md)
