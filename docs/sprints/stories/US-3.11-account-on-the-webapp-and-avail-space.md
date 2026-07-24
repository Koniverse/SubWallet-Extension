---
id: US-3.11
title: "Account on the WebApp & Avail Space"
epic: EPIC-3
status: done
priority: P3
points: 5
sprint: sprint-2024-M01
version_shipped: 1.2.26
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Make account creation, import, attach, derivation and management work **on the WebApp & Avail
Space** — the non-extension surfaces where the same account model runs as a page, not a background.

## Status

> **✅ done — all 37 rows below are settled**: 36 delivered, 1 closed without shipping. It carries
> **no FR** — account creation/import/management are FR-13 … FR-27; this story is the second surface
> they run on.
>
> **`version_shipped: 1.2.26` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release. The WebApp has its own version space
> ([AGENTS.md](../../../AGENTS.md) rule 1b), which is why 17 rows carry `Shipped: —`.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24. Its own story because
the WebApp runs the account model as a *page*, with its own file-save, camera-permission and
seed-generation quirks that the extension never hits — #1743/#1761/#1933 (generating a seed on a
page), #2100/#2138 (file save and camera access in a browser tab).

The open WebApp account work is in [US-3.12](US-3.12-open-account-improvements.md)
([AGENTS.md](../../../AGENTS.md) rule 9).

## Incremental work, fixes & chores

**37 tracker issues** — 19 with a release, 17 delivered with no line naming them, 1 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.13 | [#1919](https://github.com/Koniverse/SubWallet-Extension/issues/1919) | WebApp - Not show selected account on header when choose all account and list account have one account only | ✅ done |
| 1.1.20 | [#2100](https://github.com/Koniverse/SubWallet-Extension/issues/2100) | WebApp - Bug in case save file when create new account, export account | ✅ done |
| 1.1.23 | [#1500](https://github.com/Koniverse/SubWallet-Extension/issues/1500) | WebApp \| Extension Double check the self-activation of tokens based on account balance | ✅ done |
| 1.1.36 | [#1680](https://github.com/Koniverse/SubWallet-Extension/issues/1680) | WebApp - Show incorrect locked balance of the account | ✅ done |
| 1.1.36 | [#1682](https://github.com/Koniverse/SubWallet-Extension/issues/1682) | WebApp - Show incorrect the current account | ✅ done |
| 1.1.36 | [#1688](https://github.com/Koniverse/SubWallet-Extension/issues/1688) | WebApp - UI bugs related to Add/Import/Attach account features | ✅ done |
| 1.1.36 | [#1691](https://github.com/Koniverse/SubWallet-Extension/issues/1691) | WebApp - UI bugs on the Account Detail screens | ✅ done |
| 1.1.36 | [#1736](https://github.com/Koniverse/SubWallet-Extension/issues/1736) | WebApp - Bug related to search network, account on header | ✅ done |
| 1.1.36 | [#1742](https://github.com/Koniverse/SubWallet-Extension/issues/1742) | WebApp - Show incorrect screen after import multi account by JSON file successfully | ✅ done |
| 1.1.36 | [#1779](https://github.com/Koniverse/SubWallet-Extension/issues/1779) | WebApp - Bug when removing the account in case the wallet has 1 account | ✅ done |
| 1.1.36 | [#1803](https://github.com/Koniverse/SubWallet-Extension/issues/1803) | WebApp - UI bug on the Select account screen | ✅ done |
| 1.1.36 | [#1864](https://github.com/Koniverse/SubWallet-Extension/issues/1864) | WebApp - Do not derive account in case below | ✅ done |
| 1.1.36 | [#1865](https://github.com/Koniverse/SubWallet-Extension/issues/1865) | WebApp - Change appear of manage network and account selector from popover to modal | ✅ done |
| 1.1.36 | [#1914](https://github.com/Koniverse/SubWallet-Extension/issues/1914) | WebApp - Update UI for import account by seed phrase and import account by private key | ✅ done |
| 1.1.36 | [#1925](https://github.com/Koniverse/SubWallet-Extension/issues/1925) | WebApp - Create incorrect account in case change account type when create account | ✅ done |
| 1.1.36 | [#1958](https://github.com/Koniverse/SubWallet-Extension/issues/1958) | WebApp - Navigate incorrect in case back to Import account | ✅ done |
| 1.1.36 | [#2116](https://github.com/Koniverse/SubWallet-Extension/issues/2116) | WebApp  - Update neway to fetch history data of an account | ✅ done |
| 1.1.36 | [#2138](https://github.com/Koniverse/SubWallet-Extension/issues/2138) | WebApp - Error page in case enable config Camera access for QR on local | ✅ done |
| 1.2.26 | [#2845](https://github.com/Koniverse/SubWallet-Extension/issues/2845) | WebApp - Implement UI for export multi-account | ✅ done |
| — | [#1687](https://github.com/Koniverse/SubWallet-Extension/issues/1687) | WebApp - Do not import account by private key starting without 0x | ✅ done |
| — | [#1693](https://github.com/Koniverse/SubWallet-Extension/issues/1693) | WebApp - Do not import token | ✅ done |
| — | [#1741](https://github.com/Koniverse/SubWallet-Extension/issues/1741) | WebApp - Error page in case Import by Json on firefox | ⏸ deprecated |
| — | [#1743](https://github.com/Koniverse/SubWallet-Extension/issues/1743) | WebApp - Do not generate new seed phrase | ✅ done |
| — | [#1761](https://github.com/Koniverse/SubWallet-Extension/issues/1761) | WebApp - Need to creating a new seed phrase when reopening create a new account | ✅ done |
| — | [#1780](https://github.com/Koniverse/SubWallet-Extension/issues/1780) | WebApp - Do not show Select Import an account | ✅ done |
| — | [#1804](https://github.com/Koniverse/SubWallet-Extension/issues/1804) | WebApp - Showing multiple popup select account | ✅ done |
| — | [#1858](https://github.com/Koniverse/SubWallet-Extension/issues/1858) | WebApp - Incorrect navigation when remove all accounts | ✅ done |
| — | [#1859](https://github.com/Koniverse/SubWallet-Extension/issues/1859) | WebApp - Incorrect navigation in case of attaching a watch-only account on first use of Web App | ✅ done |
| — | [#1933](https://github.com/Koniverse/SubWallet-Extension/issues/1933) | WebApp - Show incorrect seed phrase when create new account | ✅ done |
| — | [#3083](https://github.com/Koniverse/SubWallet-Extension/issues/3083) | WebApp - QR code of the receiving address is lost | ✅ done |
| — | [#3488](https://github.com/Koniverse/SubWallet-Extension/issues/3488) | WebApp - UI bug in case import by seed phrase | ✅ done |
| — | [#3943](https://github.com/Koniverse/SubWallet-Extension/issues/3943) | WebApp - Overview of the WebApp update supporting unified accounts | ✅ done |
| — | [#3963](https://github.com/Koniverse/SubWallet-Extension/issues/3963) | WebApp - prepare for Unified account feature | ✅ done |
| — | [#3964](https://github.com/Koniverse/SubWallet-Extension/issues/3964) | Webapp - Manage unified account | ✅ done |
| — | [#3967](https://github.com/Koniverse/SubWallet-Extension/issues/3967) | Webapp - Other features related to unifed account feature | ✅ done |
| — | [#4068](https://github.com/Koniverse/SubWallet-Extension/issues/4068) | WebApp - Bug when update Unified account | ✅ done |
| — | [#4736](https://github.com/Koniverse/SubWallet-Extension/issues/4736) | [WebApp] Hide copy/QR content for relay chain addresses (AssetHub migration) | ✅ done |

> **The WebApp had to re-earn every account flow the extension already had**, and each one is a row:
> create (#1743, #1761, #1933), import by seed / key / JSON (#1687, #1742, #1914, #3488), attach and
> watch-only (#1688, #1859), derive (#1864), the account selector (#1780, #1803, #1804, #1919), and
> export-multi-account (#2845). The last cluster is the unified-account rollout reaching the WebApp
> (#3943, #3963, #3964, #3967, #4068) — the same programme that fills
> [US-3.5](US-3.5-the-unified-account-model.md), one surface over.

## Acceptance criteria

- [x] **AC-1** — Every row above is a WebApp / Avail Space account issue, closed on the tracker (36 `COMPLETED`, 1 not-planned).
- [x] **AC-2** — No row here is also a row in any EPIC-3 capability story: the WebApp surface's issues are partitioned from the extension's.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 1795` … `4736` → CLOSED |
| AC-2 | `comm -12 <(grep -o "issues/[0-9]*" docs/sprints/stories/US-3.11-*.md \| sort -u) <(cat docs/sprints/stories/US-3.[1-9]-*.md \| grep -o "issues/[0-9]*" \| sort -u)` → empty |

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md) · [US-3.5](US-3.5-the-unified-account-model.md) · [US-3.12](US-3.12-open-account-improvements.md) · [consolidation note](../../notes/2026-07-24.md#c-epic-23-maintenance--account-merged-into-epic-3)
