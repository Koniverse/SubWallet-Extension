---
id: US-8.15
title: "Transfer-max & available-balance edges"
epic: EPIC-8
status: done
priority: P3
points: 3
sprint: sprint-2026-M06
version_shipped: 1.3.80
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Answer the one question a send form cannot ask the chain directly: **how much can actually leave**.
Max-send, the balance shown next to it, and every case where the two disagree.

## Status

> **✅ done — all 17 rows below are settled**: 16 delivered, 1 closed without shipping. It carries
> **no FR**: the number it defends belongs to
> [FR-69](../../PRD.md#functional-requirements) (EPIC-7, who computes it) and
> [FR-80](../../PRD.md#functional-requirements) ([US-8.7](US-8.7-existential-deposit-safety-guard.md),
> who guards it) — this story is where the send flow *uses* it.
>
> **`version_shipped: 1.3.80` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release. The table is the full record.
>
> Three open max-send rows are in [US-8.20](US-8.20-open-transaction-improvements.md)
> ([AGENTS.md](../../../AGENTS.md) rule 9).

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24.

**Out of scope: the formula itself.** *"Update transferable balance calculation formula"* (#2118),
*"…for system pallet v1"* (#3166) and *"…for other pallets"* (#3246) arrived through this ledger but
are the calculation, not its use — they were routed to
[US-7.2](US-7.2-transferable-vs-locked-balance-calculation.md), which already owns that capability.
**One issue, one owning story**, even when the tracker files it under the wrong area.

## Incremental work, fixes & chores

**17 tracker issues** — 12 with a release, 4 delivered with no line naming them, 1 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.2 | [#283](https://github.com/Koniverse/SubWallet-Extension/issues/283) | The balance display incorrect after transfer Sub-token successfully | ✅ done |
| 0.5.7 | [#576](https://github.com/Koniverse/SubWallet-Extension/issues/576) | Showing incorrect transferable balance for PRING token | ✅ done |
| 1.0.2 | [#1220](https://github.com/Koniverse/SubWallet-Extension/issues/1220) | Review and improve send max in transaction screens | ✅ done |
| 1.0.7 | [#1458](https://github.com/Koniverse/SubWallet-Extension/issues/1458) | Add validate for case Transfer Max local token | ✅ done |
| 1.1.19 | [#2079](https://github.com/Koniverse/SubWallet-Extension/issues/2079) | Fix bug estimating fee on calculating max transferable | ✅ done |
| 1.1.48 | [#2795](https://github.com/Koniverse/SubWallet-Extension/issues/2795) | Re-check bug transfer Max | ✅ done |
| 1.1.49 | [#2793](https://github.com/Koniverse/SubWallet-Extension/issues/2793) | Handle case slow getting max transferable cause wrong amount when submit max transfer | ✅ done |
| 1.1.55 | [#2817](https://github.com/Koniverse/SubWallet-Extension/issues/2817) | WebApp - Disable submit button when getting max transferable | ✅ done |
| 1.1.55 | [#2818](https://github.com/Koniverse/SubWallet-Extension/issues/2818) | WebApp - Add message to warn about asset loss when click Transfer Max | ✅ done |
| 1.3.58 | [#4462](https://github.com/Koniverse/SubWallet-Extension/issues/4462) | Extension - Show incorrect amount when transfer max | ✅ done |
| 1.3.68 | [#4821](https://github.com/Koniverse/SubWallet-Extension/issues/4821) | [Extension] Refactor Available Balance logic for different transaction types | ✅ done |
| 1.3.80 | [#2641](https://github.com/Koniverse/SubWallet-Extension/issues/2641) | Extension  Re-check transaction failed in case transfer max with balance = ED | ✅ done |
| — | [#353](https://github.com/Koniverse/SubWallet-Extension/issues/353) | The transferable balance of the token on the Astar-EVM chain is incorrect on the Send Fund screen | ⏸ deprecated |
| — | [#749](https://github.com/Koniverse/SubWallet-Extension/issues/749) | Fix balance validating when transferring token | ✅ done |
| — | [#968](https://github.com/Koniverse/SubWallet-Extension/issues/968) | Show incorrect transferable balance of the Origin Account in case change token | ✅ done |
| — | [#1439](https://github.com/Koniverse/SubWallet-Extension/issues/1439) | Improve case Transfer Max | ✅ done |
| — | [#2849](https://github.com/Koniverse/SubWallet-Extension/issues/2849) | Wrong transferable balance | ✅ done |

> **"Transfer max" is the most re-opened phrase in this epic.** #1220 reviewed it, #1439 improved it,
> #1458 validated it for local tokens, #2793 handled the case where computing it is slow enough that
> the user submits a stale number, #2817 disabled the submit button until it arrives, #4462 found it
> still showing the wrong amount in 1.3.58, and #4821 refactored the whole available-balance path in
> 1.3.68. Seven attempts across five years at one number.
>
> **#2793 and #2817 are the same insight from two directions.** The max is computed asynchronously;
> the user can press Send before it lands. One fixed the submitted amount, the other stopped the
> press. The second is the durable fix.
>
> **#2818 is what happens when the number is right and the outcome still is not**: *"add a message
> warning about asset loss when clicking Transfer Max"*. Sending everything is legal, correct, and
> frequently a mistake.

## Acceptance criteria

- [x] **AC-1** — All 17 issues above are closed on the tracker, each carrying the release the evidence supports or `—` where none exists.
- [x] **AC-2** — The three transferable-balance *formula* issues that arrived through this ledger (#2118, #3166, #3246) are rows in [US-7.2](US-7.2-transferable-vs-locked-balance-calculation.md) and in no story here.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |
| AC-2 | `grep -rn "issues/2118\|issues/3166\|issues/3246" docs/sprints/stories/` → US-7.2 only |

## Cross-references

- [Epic EPIC-8](../epics/EPIC-8.md) · [US-8.7](US-8.7-existential-deposit-safety-guard.md) · [US-7.2](US-7.2-transferable-vs-locked-balance-calculation.md) · [US-8.20](US-8.20-open-transaction-improvements.md) · [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
