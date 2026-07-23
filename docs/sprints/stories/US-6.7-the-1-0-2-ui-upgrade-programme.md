---
id: US-6.7
title: "The 1.0.2 UI upgrade programme"
epic: EPIC-6
status: done
priority: P3
points: 8
sprint: sprint-2024-M06
version_shipped: 1.2.10
prd_ref: []
assignee:
commit:
created: 2026-07-23
updated: 2026-07-23
---

## Goal

Hold the **rewrite that replaced the wallet's entire interface** — new design system, new navigation,
new theme structure, every screen re-implemented — delivered as one release, 1.0.2, and tracked as
sixty separate issues.

## Status

> **✅ done — all 60 rows below are settled**: 59 delivered, 1 closed without shipping. It carries
> **no FR**: the surfaces this rewrite produced are FR-63 … FR-67, owned by
> [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md) …
> [US-6.5](US-6.5-display-fiat-currency-selection.md). What is recorded here is the **rewrite
> itself**.
>
> **`version_shipped: 1.2.10` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release ([#3228](https://github.com/Koniverse/SubWallet-Extension/issues/3228),
> a design-system bump a year later). **The programme landed in 1.0.2**, and 34 of these rows carry
> that version.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-23. **This is the
largest story in the epic — 60 of its 186 rows, nearly one row in three.**

Its own story rather than rows spread across US-6.1 … US-6.5, because these sixty are not
maintenance on five capabilities: they are **one project**, planned as a work-breakdown structure
and executed into one release. Splitting them by which screen they touched would destroy the only
thing they have in common.

## Incremental work, fixes & chores

**60 tracker issues** — 34 with a release, 25 delivered with no line naming them, 1 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.2 | [#972](https://github.com/Koniverse/SubWallet-Extension/issues/972) | Upgrade UI - Restructure Init App Flow | ✅ done |
| 1.0.2 | [#976](https://github.com/Koniverse/SubWallet-Extension/issues/976) | Upgrade UI - Update Redux | ✅ done |
| 1.0.2 | [#990](https://github.com/Koniverse/SubWallet-Extension/issues/990) | Upgrade UI - Add support SubWallet React UI | ✅ done |
| 1.0.2 | [#994](https://github.com/Koniverse/SubWallet-Extension/issues/994) | Upgrade UI - Screen Welcome | ✅ done |
| 1.0.2 | [#1005](https://github.com/Koniverse/SubWallet-Extension/issues/1005) | Upgrade UI - Screen Home / Crypto | ✅ done |
| 1.0.2 | [#1009](https://github.com/Koniverse/SubWallet-Extension/issues/1009) | Upgrade UI - Screen Home / Histories | ✅ done |
| 1.0.2 | [#1010](https://github.com/Koniverse/SubWallet-Extension/issues/1010) | Upgrade UI - Screen Confirmations | ✅ done |
| 1.0.2 | [#1011](https://github.com/Koniverse/SubWallet-Extension/issues/1011) | Upgrade UI - Screen Setting / General | ✅ done |
| 1.0.2 | [#1012](https://github.com/Koniverse/SubWallet-Extension/issues/1012) | Upgrade UI - Screen Settings / Master Password | ✅ done |
| 1.0.2 | [#1015](https://github.com/Koniverse/SubWallet-Extension/issues/1015) | Upgrade UI - Screen Settings List | ✅ done |
| 1.0.2 | [#1023](https://github.com/Koniverse/SubWallet-Extension/issues/1023) | Upgrade UI - Modal / Implement Simple Confirm | ✅ done |
| 1.0.2 | [#1025](https://github.com/Koniverse/SubWallet-Extension/issues/1025) | Upgrade UI - Layout | ✅ done |
| 1.0.2 | [#1026](https://github.com/Koniverse/SubWallet-Extension/issues/1026) | Upgrade UI - Login | ✅ done |
| 1.0.2 | [#1027](https://github.com/Koniverse/SubWallet-Extension/issues/1027) | Upgrade UI - Screen Settings / Migrate to Master Pasword | ✅ done |
| 1.0.2 | [#1033](https://github.com/Koniverse/SubWallet-Extension/issues/1033) | Upgrade UI - Debug Popup (Navigate - Call API) | ✅ done |
| 1.0.2 | [#1037](https://github.com/Koniverse/SubWallet-Extension/issues/1037) | Upgrade UI - Allow open predefined popup via URL | ✅ done |
| 1.0.2 | [#1052](https://github.com/Koniverse/SubWallet-Extension/issues/1052) | Upgrade UI - Optimize Navigation | ✅ done |
| 1.0.2 | [#1070](https://github.com/Koniverse/SubWallet-Extension/issues/1070) | Upgrade UI - Background for History Service | ✅ done |
| 1.0.2 | [#1072](https://github.com/Koniverse/SubWallet-Extension/issues/1072) | Upgrade UI - Setting / Security Setting screen | ✅ done |
| 1.0.2 | [#1088](https://github.com/Koniverse/SubWallet-Extension/issues/1088) | Upgrade UI - Auto focus form item | ✅ done |
| 1.0.2 | [#1124](https://github.com/Koniverse/SubWallet-Extension/issues/1124) | Upgrade UI - Manage address book | ✅ done |
| 1.0.2 | [#1125](https://github.com/Koniverse/SubWallet-Extension/issues/1125) | Upgrade UI - Grammar Verification | ✅ done |
| 1.0.2 | [#1144](https://github.com/Koniverse/SubWallet-Extension/issues/1144) | Upgrade UI - Update PSP standard | ✅ done |
| 1.0.2 | [#1147](https://github.com/Koniverse/SubWallet-Extension/issues/1147) | Upgrade UI - Implement Reload button | ✅ done |
| 1.0.2 | [#1152](https://github.com/Koniverse/SubWallet-Extension/issues/1152) | Upgrade UI - Update style of the error message in some screens | ✅ done |
| 1.0.2 | [#1155](https://github.com/Koniverse/SubWallet-Extension/issues/1155) | Upgrade UI - Keep the address inputted by the user | ✅ done |
| 1.0.2 | [#1157](https://github.com/Koniverse/SubWallet-Extension/issues/1157) | Upgrade UI - Update UI confirmation screen follow by design | ✅ done |
| 1.0.2 | [#1180](https://github.com/Koniverse/SubWallet-Extension/issues/1180) | Update title and icon in done screen | ✅ done |
| 1.0.2 | [#1193](https://github.com/Koniverse/SubWallet-Extension/issues/1193) | Upgrade UI - Do not show the Successful screen after migrated password successfully | ✅ done |
| 1.0.2 | [#1196](https://github.com/Koniverse/SubWallet-Extension/issues/1196) | Upgrade UI - Apply sort for some list | ✅ done |
| 1.0.2 | [#1198](https://github.com/Koniverse/SubWallet-Extension/issues/1198) | Error page when search website in Manage website access screen | ✅ done |
| 1.0.6 | [#1450](https://github.com/Koniverse/SubWallet-Extension/issues/1450) | Update login & welcome screen | ✅ done |
| 1.0.8 | [#1419](https://github.com/Koniverse/SubWallet-Extension/issues/1419) | Update some screens follow by design | ✅ done |
| 1.2.10 | [#3228](https://github.com/Koniverse/SubWallet-Extension/issues/3228) | Update subwallet-react-ui | ✅ done |
| — | [#969](https://github.com/Koniverse/SubWallet-Extension/issues/969) | Upgrade UI - Upgrade navigation | ✅ done |
| — | [#973](https://github.com/Koniverse/SubWallet-Extension/issues/973) | Upgrade UI - Upgrade Theme Structure for new Design System | ✅ done |
| — | [#993](https://github.com/Koniverse/SubWallet-Extension/issues/993) | Upgrade UI - Build navigation structure | ✅ done |
| — | [#1004](https://github.com/Koniverse/SubWallet-Extension/issues/1004) | Upgrade UI - Screen Phishing Page | ✅ done |
| — | [#1021](https://github.com/Koniverse/SubWallet-Extension/issues/1021) | Upgrade UI - Modal / Implement ScanQR | ✅ done |
| — | [#1022](https://github.com/Koniverse/SubWallet-Extension/issues/1022) | Upgrade UI - Modal / Implement Select Modal | ✅ done |
| — | [#1028](https://github.com/Koniverse/SubWallet-Extension/issues/1028) | Upgrade UI - Update Data Format | ✅ done |
| — | [#1039](https://github.com/Koniverse/SubWallet-Extension/issues/1039) | Upgrade UI - Fix build problems | ✅ done |
| — | [#1049](https://github.com/Koniverse/SubWallet-Extension/issues/1049) | Upgrade UI - Other issues | ✅ done |
| — | [#1053](https://github.com/Koniverse/SubWallet-Extension/issues/1053) | Upgrade UI - Optimize Components | ✅ done |
| — | [#1065](https://github.com/Koniverse/SubWallet-Extension/issues/1065) | Upgrade UI - Optimize Extension General UI | ✅ done |
| — | [#1068](https://github.com/Koniverse/SubWallet-Extension/issues/1068) | Upgrade UI - Add Components for Confirmation Screeens | ✅ done |
| — | [#1075](https://github.com/Koniverse/SubWallet-Extension/issues/1075) | Upgrade UI - Reset wallet | ✅ done |
| — | [#1081](https://github.com/Koniverse/SubWallet-Extension/issues/1081) | Upgrade UI - Fix Modal Problems | ✅ done |
| — | [#1082](https://github.com/Koniverse/SubWallet-Extension/issues/1082) | Upgrade UI - Expand view | ✅ done |
| — | [#1091](https://github.com/Koniverse/SubWallet-Extension/issues/1091) | Upgrade UI - Filter | ✅ done |
| — | [#1102](https://github.com/Koniverse/SubWallet-Extension/issues/1102) | Upgrade UI - Handle case lock wallet | ✅ done |
| — | [#1103](https://github.com/Koniverse/SubWallet-Extension/issues/1103) | Upgrade UI - Handling the display of large numbers | ✅ done |
| — | [#1133](https://github.com/Koniverse/SubWallet-Extension/issues/1133) | Upgrade UI - Improve some UX | ✅ done |
| — | [#1134](https://github.com/Koniverse/SubWallet-Extension/issues/1134) | Upgrade UI - Auto lock wallet | ✅ done |
| — | [#1136](https://github.com/Koniverse/SubWallet-Extension/issues/1136) | Upgrade UI - Bugs related to migration when user upgrade version | ✅ done |
| — | [#1148](https://github.com/Koniverse/SubWallet-Extension/issues/1148) | Upgrade UI - Bugs related to History feature | ✅ done |
| — | [#1173](https://github.com/Koniverse/SubWallet-Extension/issues/1173) | Upgrade UI - Update chainlist | ✅ done |
| — | [#1183](https://github.com/Koniverse/SubWallet-Extension/issues/1183) | Upgrade UI - Address book | ⏸ deprecated |
| — | [#1191](https://github.com/Koniverse/SubWallet-Extension/issues/1191) | Implement SubWallet UI Kit | ✅ done |
| — | [#1269](https://github.com/Koniverse/SubWallet-Extension/issues/1269) | Upgrade UI - Incorrect size popup on Windows | ✅ done |

> **This is what a UI rewrite looks like as a work-breakdown structure.** Fifty-four of the sixty
> titles literally begin *"Upgrade UI - "*: Theme Structure, Redux, navigation, Layout, Login, and
> then one issue per screen — Welcome, Home/Crypto, Home/Histories, Confirmations, Settings/General,
> Settings List, Settings/Master Password, Phishing Page — plus one per modal, one for the expand
> view, one for filters, one for build problems, and one called **"Other issues"** (#1049).
>
> **The design system is #1191, and it is not prefixed like the rest.** *"Implement SubWallet UI
> Kit"* is the component library everything else consumes; #990 adds support for it in the
> extension and #3228 bumps it a year later. A rewrite of this size is only affordable if the
> components are shared, which is why the kit is a separate deliverable.
>
> **Twenty-five rows carry no CHANGELOG line.** A sixty-issue programme that ships as one release
> gets one release note; the individual issues are invisible from the changelog, which is why the
> generated ledger showed them all as `—`.
>
> **#1183 is the only row that did not ship** — *"Upgrade UI - Address book"* closed
> `NOT_PLANNED` — while #1124, *"Upgrade UI - Manage address book"*, shipped in 1.0.2. Two issues
> for one screen, one of them redundant by the time it was reached.
>
> **The programme has a tail.** #1419 (1.0.8, *"update some screens follow by design"*), #1450
> (1.0.6, login and welcome), #1198 (an error page in Manage website access) and #1269 (wrong popup
> size on Windows) all land after 1.0.2. A rewrite is not finished when it ships.

## Acceptance criteria

- [x] **AC-1** — All 60 issues above are closed on the tracker, each carrying the release the evidence supports or `—` where none exists; #1183 is closed `NOT_PLANNED` or carries board `Status = Cancel`.
- [x] **AC-2** — 34 of the rows carry `1.0.2`, the release the programme delivered into.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row → CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |
| AC-2 | `grep -c "^\| 1.0.2 \|" docs/sprints/stories/US-6.7-the-1-0-2-ui-upgrade-programme.md` → 34 |

## Cross-references

- [Epic EPIC-6](../epics/EPIC-6.md) · [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md) · [US-6.4](US-6.4-settings-management.md) · [US-6.8](US-6.8-number-and-value-display.md) · [consolidation note](../../notes/2026-07-23.md#d-epic-26-maintenance--ui--ux-merged-into-epic-6)
