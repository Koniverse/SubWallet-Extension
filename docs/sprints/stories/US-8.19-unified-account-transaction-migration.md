---
id: US-8.19
title: "Unified-account transaction migration"
epic: EPIC-8
status: done
priority: P3
points: 3
sprint: sprint-2024-M10
version_shipped: 1.3.1
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Carry the transaction flow across the **unified-account** change — one account object spanning
Substrate, EVM and TON — so that sending, confirming and reviewing history keep working when an
account is no longer one address.

## Status

> **✅ done — all 8 rows below are settled, every one of them in release 1.3.1.** It carries **no FR**:
> unified accounts are [EPIC-3](../epics/EPIC-3.md)'s; this story is the transaction surface's share
> of that migration.
>
> One open item — moving transaction warnings to the background
> ([#3551](https://github.com/Koniverse/SubWallet-Extension/issues/3551)) — is in
> [US-8.20](US-8.20-open-transaction-improvements.md) ([AGENTS.md](../../../AGENTS.md) rule 9).

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24. Its own story because
these eight are **one migration, not eight defects**: they open together, ship together in 1.3.1, and
none of them is meaningful without the account change that caused it.

**Eight rows, one release, zero stragglers** — the tidiest cluster in this ledger, and the opposite
shape from [US-8.1](US-8.1-send-native-and-fungible-tokens.md)'s fifty-nine.

## Incremental work, fixes & chores

**8 tracker issues**, all with release 1.3.1.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.3.1 | [#3448](https://github.com/Koniverse/SubWallet-Extension/issues/3448) | Update transfer UI to support unified account | ✅ done |
| 1.3.1 | [#3525](https://github.com/Koniverse/SubWallet-Extension/issues/3525) | Unified account - Implement fee selection UI | ✅ done |
| 1.3.1 | [#3553](https://github.com/Koniverse/SubWallet-Extension/issues/3553) | Unified account - Update UI for transaction history and confirmation screen | ✅ done |
| 1.3.1 | [#3583](https://github.com/Koniverse/SubWallet-Extension/issues/3583) | Unified account - Some UI bugs for Send TON | ✅ done |
| 1.3.1 | [#3589](https://github.com/Koniverse/SubWallet-Extension/issues/3589) | Unified account - Bug transfer TON is failed | ✅ done |
| 1.3.1 | [#3608](https://github.com/Koniverse/SubWallet-Extension/issues/3608) | Unified account - Improve validation check when clicking the Transfer button on Send token screen | ✅ done |
| 1.3.1 | [#3649](https://github.com/Koniverse/SubWallet-Extension/issues/3649) | Unified account - Improve UX on Send fund screen | ✅ done |
| 1.3.1 | [#3694](https://github.com/Koniverse/SubWallet-Extension/issues/3694) | Unified account - Bug when transfer transaction for EVM account | ✅ done |

> **TON is why this migration was hard.** #3583 and #3589 are Send-TON defects, and TON transfer
> itself (#3449, in [US-8.1](US-8.1-send-native-and-fungible-tokens.md)) shipped in the *same*
> release. A new ecosystem and a new account model arrived together, so the first thing the unified
> account had to prove was that it could send on a chain it had never sent on.
>
> **#3525 is a fee UI inside an account migration.** Once one account holds several address types,
> *which* balance pays the fee stops being obvious — which is why fee selection needed a screen
> rather than a default.

## Acceptance criteria

- [x] **AC-1** — All 8 issues above are closed `COMPLETED` on the tracker with board `Status = Done`, and every one carries release `1.3.1`.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED / COMPLETED · `grep -c "^\| 1.3.1 \|" docs/sprints/stories/US-8.19-unified-account-transaction-migration.md` → 8 |

## Cross-references

- [Epic EPIC-8](../epics/EPIC-8.md) · [Epic EPIC-3](../epics/EPIC-3.md) · [US-8.1](US-8.1-send-native-and-fungible-tokens.md) · [US-8.20](US-8.20-open-transaction-improvements.md) · [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
