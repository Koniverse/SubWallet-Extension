---
id: US-8.16
title: "EVM fee & gas estimation"
epic: EPIC-8
status: done
priority: P3
points: 3
sprint: sprint-2025-M11
version_shipped: 1.3.66
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Predict what an EVM transaction will cost accurately enough that it neither fails for want of gas
nor over-reserves the user's balance — and say something useful when the prediction is wrong.

## Status

> **✅ done — all 16 rows below are settled**: 13 delivered, 3 closed without shipping. It carries
> **no FR** — the PRD states no fee-correctness requirement, which is the gap
> [US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md) was created to hold.
>
> **`version_shipped: 1.3.66` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release. The table is the full record.
>
> **The open half is [US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md)** — five of its
> eight rows are the estimated fee still being wrong. `done` here means no open row, not a solved
> problem ([AGENTS.md](../../../AGENTS.md) rule 9).

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24. Separated from
[US-8.3](US-8.3-custom-fee-and-tip.md) on the axis that divides them: **US-8.3 lets the user choose
a fee; this story is the wallet guessing one.** The first is a feature with a control, the second is
an estimate that can be quietly wrong.

## Incremental work, fixes & chores

**16 tracker issues** — 11 with a release, 2 delivered with no line naming them, 3 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.5 | [#1361](https://github.com/Koniverse/SubWallet-Extension/issues/1361) | Re-check the get fee of the transaction | ✅ done |
| 1.0.9 | [#1474](https://github.com/Koniverse/SubWallet-Extension/issues/1474) | Optimize decode contract in transaction | ✅ done |
| 1.1.24 | [#2255](https://github.com/Koniverse/SubWallet-Extension/issues/2255) | Error submitting transaction on Astar EVM due to gas fee calculation | ✅ done |
| 1.1.30 | [#2412](https://github.com/Koniverse/SubWallet-Extension/issues/2412) | Hot fix estimating EVM transaction fee | ✅ done |
| 1.1.36 | [#2269](https://github.com/Koniverse/SubWallet-Extension/issues/2269) | Follow case send EVM transaction error due to gas fee calculation | ✅ done |
| 1.1.36 | [#2336](https://github.com/Koniverse/SubWallet-Extension/issues/2336) | Check fee estimation on EVM networks | ✅ done |
| 1.1.38 | [#2606](https://github.com/Koniverse/SubWallet-Extension/issues/2606) | Extension - Update estimating EVM transaction fee for Energy Web Chain | ✅ done |
| 1.1.41 | [#2670](https://github.com/Koniverse/SubWallet-Extension/issues/2670) | [Extension] Improve EVM network fee | ✅ done |
| 1.2.1 | [#3121](https://github.com/Koniverse/SubWallet-Extension/issues/3121) | [Extension] Update subscription for `evmWatchTransactionRequest` request | ✅ done |
| 1.3.40 | [#4314](https://github.com/Koniverse/SubWallet-Extension/issues/4314) | Extension - Follow up the updates of Paraspell's fee calculation API | ✅ done |
| 1.3.66 | [#3632](https://github.com/Koniverse/SubWallet-Extension/issues/3632) | Rounded `value` parameter send in EVM transaction request | ✅ done |
| — | [#356](https://github.com/Koniverse/SubWallet-Extension/issues/356) | Origin Chain Fee displayed is delayed | ⏸ deprecated |
| — | [#813](https://github.com/Koniverse/SubWallet-Extension/issues/813) | Do not show fee on the transaction | ✅ done |
| — | [#1251](https://github.com/Koniverse/SubWallet-Extension/issues/1251) | Incorrect transaction fee display | ⏸ deprecated |
| — | [#1290](https://github.com/Koniverse/SubWallet-Extension/issues/1290) | Update message when insufficient funds for gas to send token in case the estimated fee is not obtained | ✅ done |
| — | [#1668](https://github.com/Koniverse/SubWallet-Extension/issues/1668) | Show fee = NaN in the EVM execute transaction | ⏸ deprecated |

> **1.1.x is one long argument with EVM gas.** #2255 (1.1.24, submission failing on Astar EVM),
> #2269 and #2336 (1.1.36, following the error and checking estimation network by network), #2412
> (1.1.30, a **hot fix**), #2606 (1.1.38, Energy Web Chain), #2670 (1.1.41, improving it generally).
> Six issues in seventeen releases, all the same question.
>
> **Three rows closed without shipping and all three are display, not calculation**: #356
> (*"origin chain fee displayed is delayed"*), #1251 (*"incorrect transaction fee display"*), #1668
> (*"fee = NaN in the EVM execute transaction"*). `NaN` reaching a fee field is the most honest
> possible symptom of an estimate that never resolved — and it was closed `NOT_PLANNED`.
>
> **#3632 is a rounding bug in a value field**: *"rounded `value` parameter sent in an EVM
> transaction request"* (1.3.66). A rounded amount is a different transaction from the one the user
> approved, which is why it sits with the fee work rather than with display.

## Acceptance criteria

- [x] **AC-1** — All 16 issues above are closed on the tracker, each carrying the release the evidence supports or `—` where none exists, and each `⏸ deprecated` row is closed `NOT_PLANNED`/`DUPLICATE` **or** carries board `Status = Cancel`.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |

## Cross-references

- [Epic EPIC-8](../epics/EPIC-8.md) · [US-8.3](US-8.3-custom-fee-and-tip.md) · [US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md) · [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
