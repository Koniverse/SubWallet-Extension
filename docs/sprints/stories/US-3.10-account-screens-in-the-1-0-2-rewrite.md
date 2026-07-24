---
id: US-3.10
title: "Account screens in the 1.0.2 UI rewrite"
epic: EPIC-3
status: done
priority: P3
points: 1
sprint: sprint-2023-M04
version_shipped: 1.0.2
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Hold this epic's share of the **1.0.2 rewrite** — the account list, add, export and select-account
screens, and the "All accounts" master-password and forget-all handling, re-implemented when the
whole interface was replaced.

## Status

> **✅ done — all 8 rows below are settled and shipped in 1.0.2.** It carries **no FR**: account
> creation/import/export/management are FR-13 … FR-27; what is recorded here is the rewrite.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24.

**This is the fourth area the 1.0.2 rewrite turned up in.**
[US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) holds 60 rows from the UI ledger,
[US-8.17](US-8.17-transaction-screens-in-the-1-0-2-rewrite.md) 11 from the transactions ledger,
[US-10.15](US-10.15-dapp-screens-in-the-1-0-2-rewrite.md) 3 from the dApp ledger, and these 8 sat in
the account ledger — same `Upgrade UI - ` title prefix, same programme with no parent issue.
**The rewrite's provable size is now 82 rows across four areas**, and the generator saw it in none of
them.

## Incremental work, fixes & chores

**8 tracker issues**, all shipped in 1.0.2 (7 with a line naming them, 1 delivered without).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.2 | [#1018](https://github.com/Koniverse/SubWallet-Extension/issues/1018) | Upgrade UI - Screen Account / Add | ✅ done |
| 1.0.2 | [#1019](https://github.com/Koniverse/SubWallet-Extension/issues/1019) | Upgrade UI - Screen Account / Export | ✅ done |
| 1.0.2 | [#1020](https://github.com/Koniverse/SubWallet-Extension/issues/1020) | Upgrade UI - Modal Select Account | ✅ done |
| 1.0.2 | [#1139](https://github.com/Koniverse/SubWallet-Extension/issues/1139) | UpgradeUI - Show counter of accounts to which the master password needs to be applied is incorrect | ✅ done |
| 1.0.2 | [#1149](https://github.com/Koniverse/SubWallet-Extension/issues/1149) | Upgrade UI - Handling the case where the user chooses the bet action when no account is supported | ✅ done |
| 1.0.2 | [#1150](https://github.com/Koniverse/SubWallet-Extension/issues/1150) | Upgrade UI - Implement Withdraw feature for the "All accounts" mode | ✅ done |
| 1.0.2 | [#1158](https://github.com/Koniverse/SubWallet-Extension/issues/1158) | Upgrade UI - Handle case forget all account | ✅ done |
| — | [#1017](https://github.com/Koniverse/SubWallet-Extension/issues/1017) | Upgrade UI - Screen Account / List | ✅ done |

> **Four rows are the four account screens** — list (#1017), add (#1018), export (#1019) and the
> select-account modal (#1020) — redrawn as a set. The other four are the "All accounts" mode the
> rewrite had to carry with them: the counter of accounts still needing the master password (#1139),
> the no-account edge case (#1149), the All-accounts withdraw entry point (#1150) and forget-all
> (#1158). The account *model* was untouched; only the screens over it were replaced.

## Acceptance criteria

- [x] **AC-1** — All 8 issues above are closed `COMPLETED` and shipped in 1.0.2.
- [x] **AC-2** — No issue here is also a row in [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md), [US-8.17](US-8.17-transaction-screens-in-the-1-0-2-rewrite.md) or [US-10.15](US-10.15-dapp-screens-in-the-1-0-2-rewrite.md): the four halves of the programme partition its issues.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 1017` … `1158` → CLOSED / COMPLETED |
| AC-2 | `comm -12 <(grep -o "issues/[0-9]*" docs/sprints/stories/US-3.10-*.md \| sort -u) <(cat docs/sprints/stories/US-6.7-*.md docs/sprints/stories/US-8.17-*.md docs/sprints/stories/US-10.15-*.md \| grep -o "issues/[0-9]*" \| sort -u)` → empty |

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md) · [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) · [US-8.17](US-8.17-transaction-screens-in-the-1-0-2-rewrite.md) · [US-10.15](US-10.15-dapp-screens-in-the-1-0-2-rewrite.md) · [consolidation note](../../notes/2026-07-24.md#c-epic-23-maintenance--account-merged-into-epic-3)
