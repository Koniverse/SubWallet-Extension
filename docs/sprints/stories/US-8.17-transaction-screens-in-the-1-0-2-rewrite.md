---
id: US-8.17
title: "Transaction screens in the 1.0.2 UI rewrite"
epic: EPIC-8
status: done
priority: P3
points: 3
sprint: sprint-2023-M04
version_shipped: 1.0.2
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Hold this epic's share of the **1.0.2 rewrite** — the transaction screens, the receive screen, the
transaction-type components and the background handler, re-implemented when the whole interface was
replaced.

## Status

> **✅ done — all 11 rows below are settled**: 8 delivered, 3 closed without shipping. It carries
> **no FR**: the capabilities these screens present are FR-74 … FR-84, owned by
> [US-8.1](US-8.1-send-native-and-fungible-tokens.md) … [US-8.11](US-8.11-export-transaction-history.md).
> What is recorded here is the **rewrite**.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24.

**The 1.0.2 programme spans two ledgers, and this is the half nobody would have found.**
[US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) holds 60 rows recovered from the UI ledger; these
11 sat in the *transactions* ledger, under the same `Upgrade UI - ` title prefix. The programme has
no parent issue anywhere — it is held together by a naming convention — so it was invisible to the
generator twice, in two different areas.

**71 rows is the rewrite's real size**, not 60.

## Incremental work, fixes & chores

**11 tracker issues** — 6 with a release, 2 delivered with no line naming them, 3 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.2 | [#971](https://github.com/Koniverse/SubWallet-Extension/issues/971) | Upgrade Background & UI - Handle All Transaction | ✅ done |
| 1.0.2 | [#1024](https://github.com/Koniverse/SubWallet-Extension/issues/1024) | Upgrade UI - Screen Transactions | ✅ done |
| 1.0.2 | [#1054](https://github.com/Koniverse/SubWallet-Extension/issues/1054) | Upgrade UI - Receive Token Screen | ✅ done |
| 1.0.2 | [#1066](https://github.com/Koniverse/SubWallet-Extension/issues/1066) | Upgrade UI - Update for Transaction Types | ✅ done |
| 1.0.2 | [#1067](https://github.com/Koniverse/SubWallet-Extension/issues/1067) | Upgrade UI - Add Components for Transaction Screens | ✅ done |
| 1.0.2 | [#1140](https://github.com/Koniverse/SubWallet-Extension/issues/1140) | Upgrade UI - Bugs related to the send tokens feature | ✅ done |
| — | [#1051](https://github.com/Koniverse/SubWallet-Extension/issues/1051) | Transactions Screen | ⏸ deprecated |
| — | [#1063](https://github.com/Koniverse/SubWallet-Extension/issues/1063) | Implement new transaction logic in background | ⏸ deprecated |
| — | [#1079](https://github.com/Koniverse/SubWallet-Extension/issues/1079) | Upgrade UI - Auto write history for any transaction | ⏸ deprecated |
| — | [#1163](https://github.com/Koniverse/SubWallet-Extension/issues/1163) | Upgrade UI - Show incorrect Amount when user transfer all in case the remaining balance < ED | ✅ done |
| — | [#1215](https://github.com/Koniverse/SubWallet-Extension/issues/1215) | Upgrade UI - Re-check validate amount must be equals when transfer | ✅ done |

> **#1051 is #1024 filed twice.** *"Transactions Screen"* (opened 2023-02-27) closed `NOT_PLANNED`;
> *"Upgrade UI - Screen Transactions"* (opened 2023-02-07, twenty days earlier) shipped in 1.0.2.
> A programme tracked by title prefix will collect duplicates that carry no prefix.
>
> **#1063 and #971 are the same work, one abandoned.** *"Implement new transaction logic in
> background"* closed `NOT_PLANNED`; *"Upgrade Background & UI — Handle All Transaction"* shipped.
> The rewrite reached the background too, and only the prefixed ticket survived.
>
> **#1079 is the one piece of the rewrite that was dropped**: *"auto-write history for any
> transaction"*. History still depends on indexers plus locally-written entries — and the duplicate
> entries in [US-8.5](US-8.5-on-chain-transaction-history.md) (#2613, #3151) are what that
> compromise costs.

## Acceptance criteria

- [x] **AC-1** — All 11 issues above are closed on the tracker, each carrying the release the evidence supports or `—` where none exists; each `⏸ deprecated` row is closed `NOT_PLANNED`/`DUPLICATE` or carries board `Status = Cancel`.
- [x] **AC-2** — No issue here is also a row in [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md): the two halves of the programme partition its issues, they do not overlap.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |
| AC-2 | `comm -12 <(grep -o "issues/[0-9]*" docs/sprints/stories/US-8.17-*.md \| sort -u) <(grep -o "issues/[0-9]*" docs/sprints/stories/US-6.7-*.md \| sort -u)` → empty |

## Cross-references

- [Epic EPIC-8](../epics/EPIC-8.md) · [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) · [US-8.5](US-8.5-on-chain-transaction-history.md) · [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
