---
id: US-8.21
title: "Transaction fixes recovered from Uncategorized"
epic: EPIC-8
status: done
priority: P3
points: 1
sprint:
version_shipped: 1.3.30
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The transaction maintenance the triage bucket held — extrinsic decoding, txn-queueing and status-subscription fixes whose title did not say "transaction".

## Status

> **✅ done — all 7 rows below are settled**: 4 delivered, 3 closed without shipping. Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.3.30` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the transaction — extrinsic / queueing / status issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**7 tracker issues** — 3 with a release, 1 delivered with no line naming them, 3 closed without shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.5 | [#1362](https://github.com/Koniverse/SubWallet-Extension/issues/1362) | Handling the case of showing "Completed" while there is no "Extrinsic hash" | ✅ done |
| 1.1.41 | [#2538](https://github.com/Koniverse/SubWallet-Extension/issues/2538) | Fix bug sending AVL on Avail Goldberg testnet | ✅ done |
| 1.3.30 | [#3293](https://github.com/Koniverse/SubWallet-Extension/issues/3293) | Evm, miner: fix enforcing the minimum miner tip 1 wei | ✅ done |
| — | [#403](https://github.com/Koniverse/SubWallet-Extension/issues/403) | Support txn Queueing | ⏸ deprecated |
| — | [#419](https://github.com/Koniverse/SubWallet-Extension/issues/419) | Support txn Queueing | ⏸ deprecated |
| — | [#664](https://github.com/Koniverse/SubWallet-Extension/issues/664) | Improve extrinsic submitting flow and error handling | ✅ done |
| — | [#1293](https://github.com/Koniverse/SubWallet-Extension/issues/1293) | Extension - Disable other actions while the request is being submitted | ⏸ deprecated |

> **Extrinsic handling and queueing.** Extrinsic decoding/review (#158), transaction queueing (#403, #419), extrinsic-status subscription (#4240, #3654) and the EVM minimum-tip fix (#3293). They join the Transactions fold ([note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)).

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-8; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-8](../epics/EPIC-8.md) · [US-8.20](US-8.20-open-transaction-improvements.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
