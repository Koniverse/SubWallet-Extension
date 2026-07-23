---
id: US-6.11
title: "Transaction-history surface"
epic: EPIC-6
status: done
priority: P3
points: 2
sprint: sprint-2024-M10
version_shipped: 1.3.1
prd_ref: []
assignee:
commit:
created: 2026-07-23
updated: 2026-07-23
---

## Goal

Show the user **what already happened** — the history list, what belongs in it, what its entries say
when a transaction never resolved, and where the data behind it comes from.

## Status

> **✅ done — all 8 rows below are settled**: 6 delivered, 2 closed without shipping. It carries
> **no FR**: transaction submission and tracking belong to [EPIC-8](../epics/EPIC-8.md); this story
> owns the **list the user reads**.
>
> **`version_shipped: 1.3.1` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-23. The history *screen*
was also rebuilt inside the 1.0.2 programme
([#1009](https://github.com/Koniverse/SubWallet-Extension/issues/1009),
[#1070](https://github.com/Koniverse/SubWallet-Extension/issues/1070),
[#1148](https://github.com/Koniverse/SubWallet-Extension/issues/1148) in
[US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md)) — there the programme is the unit, here the
topic is.

## Incremental work, fixes & chores

**8 tracker issues** — 5 with a release, 1 delivered with no line naming it, 2 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.7.6 | [#820](https://github.com/Koniverse/SubWallet-Extension/issues/820) | Update history feature | ✅ done |
| 1.1.6 | [#1748](https://github.com/Koniverse/SubWallet-Extension/issues/1748) | Do not display the history of addresses other than the original address | ✅ done |
| 1.1.27 | [#2362](https://github.com/Koniverse/SubWallet-Extension/issues/2362) | Bugs related to EVM history | ✅ done |
| 1.1.33 | [#2387](https://github.com/Koniverse/SubWallet-Extension/issues/2387) | Update history status of the local history in case timeout | ✅ done |
| 1.3.1 | [#3698](https://github.com/Koniverse/SubWallet-Extension/issues/3698) | Review API to track TON tx history | ✅ done |
| — | [#1061](https://github.com/Koniverse/SubWallet-Extension/issues/1061) | Update background logic for history | ⏸ deprecated |
| — | [#1897](https://github.com/Koniverse/SubWallet-Extension/issues/1897) | Extension - Improve history list view | ✅ done |
| — | [#4373](https://github.com/Koniverse/SubWallet-Extension/issues/4373) | Extension - Check get online history from subscan | ⏸ deprecated |

> **History is assembled from sources the wallet does not own, and two of these rows are that
> problem.** #3698 reviews an API to track TON transactions; #4373 — *"check get online history from
> subscan"* — closed `NOT_PLANNED`. A local list plus a third-party indexer is the only way to show
> a complete history, and every chain needs a different indexer.
>
> **#2387 is the honest answer to a transaction that never resolved**: add a *time-out* status
> (1.1.33) rather than leave an entry pending forever. #1061, *"update background logic for
> history"*, closed `NOT_PLANNED` — the deeper fix was not taken.
>
> **#1748 is a privacy-shaped defect.** *"Do not display the history of addresses other than the
> original address"* (1.1.6): the list was showing entries that were not the user's.

## Acceptance criteria

- [x] **AC-1** — All 8 issues above are closed on the tracker, each carrying the release the evidence supports or `—` where none exists, and each `⏸ deprecated` row is closed `NOT_PLANNED`/`DUPLICATE` or carries board `Status = Cancel`.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |

## Cross-references

- [Epic EPIC-6](../epics/EPIC-6.md) · [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) · [Epic EPIC-8](../epics/EPIC-8.md) · [consolidation note](../../notes/2026-07-23.md#d-epic-26-maintenance--ui--ux-merged-into-epic-6)
