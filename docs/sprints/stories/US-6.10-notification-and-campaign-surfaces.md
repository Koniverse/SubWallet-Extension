---
id: US-6.10
title: "Notification & marketing-campaign surfaces"
epic: EPIC-6
status: done
priority: P3
points: 3
sprint: sprint-2024-M10
version_shipped: 1.3.4
prd_ref: []
assignee:
commit:
created: 2026-07-23
updated: 2026-07-23
---

## Goal

Render the messages the wallet sends **to** the user rather than about their assets: in-app
notifications and marketing-campaign banners — where they appear, in what order, and how the user
gets out of them.

## Status

> **✅ done — all 10 rows below are settled**, 6 with a release and 4 delivered with no line naming
> them. It carries **no FR**: the *capabilities* are FR-155 (campaign banners) and FR-159
> (notification centre), owned by
> [US-19.4](US-19.4-in-app-campaign-banners.md) and
> [US-19.8](US-19.8-in-app-notification-center.md) in
> [EPIC-19](../epics/EPIC-19.md). **This story owns the surface, not the feature.**
>
> **`version_shipped: 1.3.4` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-23. The split with
EPIC-19 is the one this epic draws everywhere: **EPIC-19 decides what to say and when; EPIC-6 owns
where it lands on the screen.** Every row here is display order, position, navigation out of the
banner, or the popup that carries it.

The open half — five more campaign-display issues — is in
[US-6.6](US-6.6-design-system-and-ux-hardening.md)
([AGENTS.md](../../../AGENTS.md) rule 9).

## Incremental work, fixes & chores

**10 tracker issues** — 6 with a release, 4 delivered with no line naming them.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.3 | [#1639](https://github.com/Koniverse/SubWallet-Extension/issues/1639) | Update UI - Update notification with close button | ✅ done |
| 1.1.33 | [#2038](https://github.com/Koniverse/SubWallet-Extension/issues/2038) | Improve notification/banner in app feature | ✅ done |
| 1.1.36 | [#2099](https://github.com/Koniverse/SubWallet-Extension/issues/2099) | Add button on the Minting success screen to navigate user to Airlyft | ✅ done |
| 1.1.65 | [#3062](https://github.com/Koniverse/SubWallet-Extension/issues/3062) | Extension - Unable to back screen in case open General settings to Marketing campaign | ✅ done |
| 1.3.4 | [#3507](https://github.com/Koniverse/SubWallet-Extension/issues/3507) | Extension - Support Notification UI in app | ✅ done |
| 1.3.4 | [#3515](https://github.com/Koniverse/SubWallet-Extension/issues/3515) | Implement notification logic | ✅ done |
| — | [#1599](https://github.com/Koniverse/SubWallet-Extension/issues/1599) | Improve Notifcation Logic And UI | ✅ done |
| — | [#1989](https://github.com/Koniverse/SubWallet-Extension/issues/1989) | In App marketing banners, features | ✅ done |
| — | [#2496](https://github.com/Koniverse/SubWallet-Extension/issues/2496) | Improve notification/banner in app feature (Round 2) | ✅ done |
| — | [#2571](https://github.com/Koniverse/SubWallet-Extension/issues/2571) | Extension - Improved display order of campain banner | ✅ done |

> **The banner is the most re-worked single element in this epic.** #1989 introduces it, #2038
> improves it (1.1.33), #2496 improves it again (round 2), #2571 fixes its display *order*, #3062
> fixes not being able to navigate back out of it — and three more are still open in
> [US-6.6](US-6.6-design-system-and-ux-hardening.md). Ten rows for a surface that shows an
> advertisement.
>
> **#2571 was `deprecated` in the generated ledger and is `done` here** — closed `COMPLETED` with
> board `Done` ([AGENTS.md](../../../AGENTS.md) rule 12). It is the only status correction in this
> fold.
>
> **#3507 and #3515 are one delivery split in two**, both 1.3.4: *"support Notification UI in app"*
> and *"implement notification logic"*. The generated ledger merged them into a single row; they are
> separated here because the UI half is this epic's and the logic half is
> [US-19.8](US-19.8-in-app-notification-center.md)'s.
>
> **#3062 is the shape of the whole story.** *"Unable to back screen in case open General settings
> to Marketing campaign"* — the campaign is reachable from Settings and, once reached, has no way
> back. A surface question, not a campaign question.

## Acceptance criteria

- [x] **AC-1** — All 10 issues above are closed `COMPLETED` on the tracker with board `Status = Done`, each carrying the release the evidence supports or `—` where none exists.
- [x] **AC-2** — Each row is a display concern; the campaign and notification *capabilities* they render are claimed by [US-19.4](US-19.4-in-app-campaign-banners.md) and [US-19.8](US-19.8-in-app-notification-center.md), and no row here is also a row there.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED / COMPLETED · board `Status` per [rule 12](../../../AGENTS.md) |
| AC-2 | `grep -n "issues/1989\|issues/2038\|issues/2496\|issues/3507" docs/sprints/stories/US-19.*.md` → no hits |

## Cross-references

- [Epic EPIC-6](../epics/EPIC-6.md) · [US-19.4](US-19.4-in-app-campaign-banners.md) · [US-19.8](US-19.8-in-app-notification-center.md) · [US-6.6](US-6.6-design-system-and-ux-hardening.md) · [consolidation note](../../notes/2026-07-23.md#d-epic-26-maintenance--ui--ux-merged-into-epic-6)
