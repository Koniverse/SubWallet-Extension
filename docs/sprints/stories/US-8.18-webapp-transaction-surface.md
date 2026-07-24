---
id: US-8.18
title: "WebApp transaction surface"
epic: EPIC-8
status: done
priority: P3
points: 2
sprint: sprint-2024-M05
version_shipped: 1.1.62
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Make the transaction flow work **outside the extension** — the WebApp's confirmation screens, result
screen, QR scanning and back-navigation, all of which had to be re-earned on a surface with no popup.

## Status

> **✅ done — all 10 rows below are settled**, 9 with a release. It carries **no FR** — FR-74 … FR-84
> are the capabilities; this story is the second surface they run on.
>
> **`version_shipped: 1.1.62` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release. The table is the full record.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24. Its own story rather
than rows spread across the capability stories, because these ten share a cause and not a feature:
**the WebApp is a page, not a popup.** Cancelling, navigating back, opening a camera and showing a
confirmation all behave differently when there is no extension chrome around them.

The WebApp's remaining transaction work — more history types
([#2179](https://github.com/Koniverse/SubWallet-Extension/issues/2179)) — is in
[US-8.20](US-8.20-open-transaction-improvements.md) ([AGENTS.md](../../../AGENTS.md) rule 9).

## Incremental work, fixes & chores

**10 tracker issues** — 9 with a release, 1 delivered with no line naming it.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.36 | [#1692](https://github.com/Koniverse/SubWallet-Extension/issues/1692) | WebApp - Bugs related to Send token feature | ✅ done |
| 1.1.36 | [#1725](https://github.com/Koniverse/SubWallet-Extension/issues/1725) | WebApp - Can not back to the previous screen when cancel transaction | ✅ done |
| 1.1.36 | [#1759](https://github.com/Koniverse/SubWallet-Extension/issues/1759) | WebApp - Do not show title screen of the confirmation transaction | ✅ done |
| 1.1.36 | [#1888](https://github.com/Koniverse/SubWallet-Extension/issues/1888) | WebApp - Do not show confirmation after performing any transaction with extension account | ✅ done |
| 1.1.36 | [#1903](https://github.com/Koniverse/SubWallet-Extension/issues/1903) | WebApp - Don't view transaction details and confirmation via QR code | ✅ done |
| 1.1.36 | [#2349](https://github.com/Koniverse/SubWallet-Extension/issues/2349) | WebApp - Do not Go to camera setting screen when click on Scan button on the Transfer screen | ✅ done |
| 1.1.55 | [#2706](https://github.com/Koniverse/SubWallet-Extension/issues/2706) | WebApp - Update transaction result screen | ✅ done |
| 1.1.59 | [#2921](https://github.com/Koniverse/SubWallet-Extension/issues/2921) | WebApp - Add warning message for cross chain transfer to an exchange (CEX) | ✅ done |
| 1.1.62 | [#2730](https://github.com/Koniverse/SubWallet-Extension/issues/2730) | WebApp - Send crash log feature | ✅ done |
| — | [#3965](https://github.com/Koniverse/SubWallet-Extension/issues/3965) | Webapp - Transaction related to unified account | ✅ done |

> **Half of these rows are the confirmation step failing to appear or failing to leave.** #1759 (no
> title on the confirmation screen), #1888 (no confirmation at all after a transaction), #1903
> (cannot view details or confirm via QR), #1725 (cannot go back after cancelling). On a page, a
> confirmation is a route; in a popup it is a window — and the routing had to be built.
>
> **#2349 is the browser refusing what the extension takes for granted**: *"do not go to the camera
> settings screen when clicking Scan"*. QR signing needs a camera permission the WebApp must ask for
> in the page's own terms.
>
> **The WebApp has its own version space** ([AGENTS.md](../../../AGENTS.md) rule 1b) — which is why
> #3965 is `done` with `Shipped: —` rather than missing evidence.

## Acceptance criteria

- [x] **AC-1** — All 10 issues above are closed `COMPLETED` on the tracker with board `Status = Done`, each carrying the release the evidence supports or `—` where none exists.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED / COMPLETED · board `Status` per [rule 12](../../../AGENTS.md) |

## Cross-references

- [Epic EPIC-8](../epics/EPIC-8.md) · [US-6.2](US-6.2-web-app-feature-parity.md) · [US-8.20](US-8.20-open-transaction-improvements.md) · [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
