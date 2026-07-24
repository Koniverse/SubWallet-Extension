---
id: US-8.5
title: "On-chain transaction history"
epic: EPIC-8
status: done
priority: P1
points: 5
sprint: sprint-2022-M03
version_shipped: 0.2.7
prd_ref: [FR-78]
arch_ref: [AD-24]
depends_on:
assignee: lw-cdm
commit: 7e795bc144, b486d4fd4f, 071345e374
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can see their on-chain transaction history — past transfers, swaps, staking
and other activity — pulled from indexers and merged with the wallet's own in-app
submissions, so that the wallet is a record of what happened and not just a way to
initiate the next thing. History is the trust surface: a user verifies a send
landed by reading it back here.

## Status

> **✅ done — shipped in 0.2.7.** All acceptance criteria are ticked and the 20 rows below are
> settled: 18 delivered, 2 closed without shipping. The open history work — more history types,
> address display on the history screen, and a general improvement round — is in
> [US-8.20](US-8.20-open-transaction-improvements.md) ([AGENTS.md](../../../AGENTS.md) rule 9).

## Background

The wallet runs **no indexer of its own**; on-chain history is fetched from
per-chain third-party indexers (SubQuery / SubSquid for Substrate, with
Subscan/Blockstream/taostats on other paths) and merged with the in-app
submissions the transaction lifecycle records. `HistoryService` owns the merge
(described in [ARCHITECTURE](../../ARCHITECTURE.md) — Transaction & request
subsystem); the multi-chain history aggregation rides the Backend Services SDK
([AD-24](../../ARCHITECTURE.md#architecture-decisions)).

The load-bearing rule is the merge contract: an indexer entry must never overwrite
the status of a still-pending in-app submission (a freshly-sent tx the indexer
hasn't seen yet must not appear "missing"), and a confirmed indexer entry
reconciles with its matching in-app record rather than double-listing. This is an
**external-integration** read surface (multiple indexers + the SDK), sized 5.
Materializes [FR-78](../../PRD.md#functional-requirements). This story is
**Retroactive** — the capability already ships; `commit` / `version_shipped` are
backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** an account with on-chain activity, **When** the user
  opens history, **Then** transactions fetched from the per-chain indexers
  (SubQuery / SubSquid) are listed with type, amount, counterparty and status.
- [x] **AC-2** — **Given** a transaction just submitted in-app, **When** the
  indexer has not yet indexed it, **Then** it still appears (from the in-app
  record) as pending and is not dropped from the list.
- [x] **AC-3** — **Given** an in-app submission and its later indexer entry,
  **When** both are present, **Then** they reconcile into a single history item
  (status advanced to confirmed) rather than appearing twice.
- [x] **AC-4** — **Given** an indexer is unreachable or returns an error, **When**
  the user opens history, **Then** the in-app records still render and a
  non-blocking staleness/error indicator is shown instead of an empty or broken
  screen.

## Tasks

- [x] **TASK-8.5.1** — Fetch per-chain history from the indexers via the Services SDK (AC: 1)
- [x] **TASK-8.5.2** — Merge indexer history with in-app lifecycle submissions (AC: 2, 3)
  - [x] Pending in-app tx never dropped before the indexer catches up.
  - [x] Reconcile matching in-app + indexer entries into one item.
- [x] **TASK-8.5.3** — History list UI: type, amount, counterparty, status, detail view (AC: 1)
- [x] **TASK-8.5.4** — Degrade on indexer failure: render in-app records + staleness indicator (AC: 4)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — multi-chain history is aggregated through the Backend Services SDK; the wallet does not run an indexer.
- This story does NOT introduce new AD entries. The in-app submission records come from the EPIC-2 transaction lifecycle (FR-12); `HistoryService` performs the merge.

### Cross-story dependencies

- Builds on the transaction lifecycle (EPIC-2, FR-12) — consumes the in-app submission records it writes.
- Required by [US-8.6](US-8.6-subscan-api-key-configuration.md) — the Subscan key raises the rate limits on this history's Subscan-backed queries.
- Required by [US-8.11](US-8.11-export-transaction-history.md) — export serializes the merged history this story assembles.

### Performance budget

- History open shows in-app records immediately; indexer results stream in without blocking the first paint.
- Defended by the `HistoryService` merge test.

### References

- [Source: PRD FR-78](../../PRD.md#functional-requirements) — on-chain transaction history (SubQuery / SubSquid)
- [Source: ARCHITECTURE §Transaction & request subsystem](../../ARCHITECTURE.md)
- [Source: ARCHITECTURE AD-24](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: open history → indexer-backed list with type/amount/counterparty/status |
| AC-2 | Manual: send → immediately open history → tx shown pending, not missing |
| AC-3 | Manual: wait for indexer → single reconciled item, no duplicate |
| AC-4 | Manual: simulate indexer error → in-app records + staleness indicator, no blank screen |

## Changelog entry

### Added
- On-chain transaction history merging per-chain indexer data (SubQuery / SubSquid)
  with in-app lifecycle submissions, with pending-tx preservation, duplicate
  reconciliation, and a degraded state when an indexer is unreachable.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Incremental work, fixes & chores

**20 tracker issues** — 12 with a release, 6 delivered with no line naming them, 2 closed without
shipping. Folded in from the former one-issue-per-story maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.3 | [#296](https://github.com/Koniverse/SubWallet-Extension/issues/296) | Bug happens when viewing Transaction History after Delete token | ✅ done |
| 0.5.5 | [#454](https://github.com/Koniverse/SubWallet-Extension/issues/454) | Add support for transaction history on Astar EVM | ✅ done |
| 0.5.5 | [#521](https://github.com/Koniverse/SubWallet-Extension/issues/521) | Review SubQuery Transaction History | ✅ done |
| 0.5.7 | [#584](https://github.com/Koniverse/SubWallet-Extension/issues/584) | Can't view Transaction history of Moonbase Alpha network | ✅ done |
| 0.7.2 | [#827](https://github.com/Koniverse/SubWallet-Extension/issues/827) | Show incorrect the transfer result on the transaction history screen | ✅ done |
| 1.0.5 | [#1354](https://github.com/Koniverse/SubWallet-Extension/issues/1354) | Detect from from for transaction history type evm.execute | ✅ done |
| 1.0.5 | [#1381](https://github.com/Koniverse/SubWallet-Extension/issues/1381) | Add support "view transaction explorer" for the some chain | ✅ done |
| 1.0.9 | [#1411](https://github.com/Koniverse/SubWallet-Extension/issues/1411) | Do not get transaction history in case the wallet have multi-account | ✅ done |
| 1.1.3 | [#1654](https://github.com/Koniverse/SubWallet-Extension/issues/1654) | Show incorrect transaction time on the History | ✅ done |
| 1.1.58 | [#2955](https://github.com/Koniverse/SubWallet-Extension/issues/2955) | Extension - Do not show transaction history in case sender account null | ✅ done |
| 1.2.2 | [#2613](https://github.com/Koniverse/SubWallet-Extension/issues/2613) | Extension - Show duplicate transaction history when transfer local token | ✅ done |
| 1.2.5 | [#3151](https://github.com/Koniverse/SubWallet-Extension/issues/3151) | WebApp - Show duplicate transaction history when transfer local token | ✅ done |
| — | [#63](https://github.com/Koniverse/SubWallet-Extension/issues/63) | Update the experience while on the Transaction History screen but switch to "All account" | ✅ done |
| — | [#324](https://github.com/Koniverse/SubWallet-Extension/issues/324) | Migrate Transaction History for Custom Network in case Merging networks from older version to a newer version | ✅ done |
| — | [#505](https://github.com/Koniverse/SubWallet-Extension/issues/505) | Do not migrate transaction history of the Substrate Account in case update version extension | ✅ done |
| — | [#927](https://github.com/Koniverse/SubWallet-Extension/issues/927) | Review and re-design the whole transaction history feature | ✅ done |
| — | [#1249](https://github.com/Koniverse/SubWallet-Extension/issues/1249) | An error occurred while viewing transaction history | ✅ done |
| — | [#1291](https://github.com/Koniverse/SubWallet-Extension/issues/1291) | Check the Transaction History status in the following case | ⏸ deprecated |
| — | [#1846](https://github.com/Koniverse/SubWallet-Extension/issues/1846) | Re-check the service to get the transaction history | ✅ done |
| — | [#2108](https://github.com/Koniverse/SubWallet-Extension/issues/2108) | Local transaction history display is missing | ⏸ deprecated |

> **History is the only capability in this epic that was re-designed wholesale.** #927 —
> *"Review and re-design the whole transaction history feature"* — is a rewrite ticket, and #1846
> (*"re-check the service to get the transaction history"*) and #521 (*"review SubQuery transaction
> history"*) are the same doubt arriving twice more. A list assembled from indexers the wallet does
> not own is never finished being reviewed.
>
> **Two rows are the local list disagreeing with the chain**: #2613 and #3151 — *"show duplicate
> transaction history when transferring a local token"*, extension and WebApp, the same defect twice.
> A locally-written entry plus an indexer-returned entry is one transfer counted twice.
>
> **#324 and #505 are history surviving a data migration** — moving custom-network history when
> networks merged, and *not* migrating Substrate-account history on upgrade. History is the one part
> of a wallet that cannot be recomputed from chain state alone.

## Cross-references

- [PRD FR-78](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.6](US-8.6-subscan-api-key-configuration.md)
- [US-8.11](US-8.11-export-transaction-history.md)
- [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
