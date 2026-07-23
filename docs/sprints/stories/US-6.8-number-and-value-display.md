---
id: US-6.8
title: "Number, decimal & value display"
epic: EPIC-6
status: done
priority: P3
points: 2
sprint: sprint-2025-M10
version_shipped: 1.3.64
prd_ref: []
assignee:
commit:
created: 2026-07-23
updated: 2026-07-23
---

## Goal

Render a **number a user can trust**: how many decimals to show, what to do with a value too small
or too large to display honestly, and how to present a rate or a fee next to it.

## Status

> **✅ done — all 8 rows below are settled**: 6 delivered, 2 closed without shipping. It carries
> **no FR** — the display surfaces are FR-63 … FR-67. The open request, small-number display
> ([#3982](https://github.com/Koniverse/SubWallet-Extension/issues/3982)), is in
> [US-6.6](US-6.6-design-system-and-ux-hardening.md)
> ([AGENTS.md](../../../AGENTS.md) rule 9).
>
> **`version_shipped: 1.3.64` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-23. Its own story
because a wrong number is a different class of defect from a wrong layout: the screen looks correct
and the value is false.

The large-number half of this work sits inside the 1.0.2 rewrite
([#1103](https://github.com/Koniverse/SubWallet-Extension/issues/1103) —
*"handling the display of large numbers"*, in
[US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md)), where the programme, not the topic, is the unit.

## Incremental work, fixes & chores

**8 tracker issues** — 4 with a release, 2 delivered with no line naming them, 2 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.5.7 | [#585](https://github.com/Koniverse/SubWallet-Extension/issues/585) | Improved decimal display UX | ✅ done |
| 1.3.7 | [#2751](https://github.com/Koniverse/SubWallet-Extension/issues/2751) | Improve display collators list | ✅ done |
| 1.3.38 | [#4347](https://github.com/Koniverse/SubWallet-Extension/issues/4347) | Extension - Update UI to clearly display fees | ✅ done |
| 1.3.64 | [#4739](https://github.com/Koniverse/SubWallet-Extension/issues/4739) | [Energy Web X] Display APY for collators in collator list | ✅ done |
| — | [#599](https://github.com/Koniverse/SubWallet-Extension/issues/599) | Display decimals according to the following rule | ✅ done |
| — | [#1303](https://github.com/Koniverse/SubWallet-Extension/issues/1303) | Update the decimal display rule | ⏸ deprecated |
| — | [#2028](https://github.com/Koniverse/SubWallet-Extension/issues/2028) | Vara's withdrawal amount is displayed incorrectly | ⏸ deprecated |
| — | [#3325](https://github.com/Koniverse/SubWallet-Extension/issues/3325) | Follow-up the time of withdrawable and UX UI in case have multiple redeem request | ✅ done |

> **The decimal rule was written, applied, and then re-opened and dropped.** #599 states the rule,
> #585 (0.5.7) improves the UX around it, and #1303 — *"update the decimal display rule"* — closed
> `NOT_PLANNED`. Whatever was wrong with the rule in 2023 is still wrong; the open
> [#3982](https://github.com/Koniverse/SubWallet-Extension/issues/3982) (*"improved small number
> display"*) is the same question again.
>
> **#2028 is a number that was simply false** — *"Vara's withdrawal amount is displayed
> incorrectly"* — and it closed `NOT_PLANNED`.
>
> **Two rows are the collator list** (#2751, 1.3.7 and #4739, 1.3.64). Displaying an APY means
> deriving it, and the derivation is EPIC-12's; what this story owns is that the figure shown next
> to a collator is the one the user will actually earn.

## Acceptance criteria

- [x] **AC-1** — All 8 issues above are closed on the tracker, each carrying the release the evidence supports or `—` where none exists, and each `⏸ deprecated` row is closed `NOT_PLANNED`/`DUPLICATE` or carries board `Status = Cancel`.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |

## Cross-references

- [Epic EPIC-6](../epics/EPIC-6.md) · [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) · [US-6.6](US-6.6-design-system-and-ux-hardening.md) · [consolidation note](../../notes/2026-07-23.md#d-epic-26-maintenance--ui--ux-merged-into-epic-6)
