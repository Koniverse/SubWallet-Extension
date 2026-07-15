---
id: EPIC-39
title: "Maintenance — Onboarding & Localization"
status: in-progress
prd_ref: []
created: 2026-07-15
updated: 2026-07-15
generated_by: koni-docs-gen-maintenance
---

## Goal

Incremental work, fixes and chores for the **Onboarding & Localization** area ([EPIC-19](EPIC-19.md)) that materialize no FR of their own. One story per tracker issue, so the CHANGELOG and issue tracker are fully claimed
and the ERP can answer "who shipped what, under which issue" for this area. This epic is a
**ledger, not a plan** — it was generated from the tracker and CHANGELOG by a one-off local
generator (kept in the setup scratchpad, not the repo: it wipes and rebuilds every `generated_by`
file from six `/tmp` caches, so re-running it without those caches would destroy this provenance).

## Why separate from EPIC-19

The 21 product epics are the **FR map**: each story there is a requirement's contract. These
issues materialize no FR — they are fixes, chore bumps, and small increments. Keeping them here
leaves [EPIC-19](EPIC-19.md) readable as the requirement set, while
still giving every shipped issue exactly one owning story ([CONTEXT D107](../../CONTEXT.md) on
keeping the unit of status honest).

## What a story here is — and is not

- **It records the tracker, not the code.** Its acceptance criterion is a *coverage* assertion
  ("issue #N shipped in vX" / "closed on the tracker"), never an invented Given/When/Then — that
  is the [US-5.1](../stories/US-5.1-phishing-site-and-address-protection.md) failure this program
  exists to prevent ([LESSONS §68](../../LESSONS.md)).
- **`points: 1` is a count, not a Fibonacci estimate.** One story = one shipped issue. **Never
  sum these with the product stories' points** — a rollup here measures issue throughput.
- **`sprint` is a real month** (a single issue closed in one month), not a rollup ([D105](../../CONTEXT.md)).

## Scope

**19 stories** — 14 done (shipped), 1 in flight (ready / in-progress /
review, from the Projects board), 3 backlog (open, not yet started), 1 deprecated
(closed **not-planned / duplicate** — never shipped). Open-issue status mirrors the GitHub
Projects board (#2); closed-issue status comes from the tracker's close reason. Per-issue
detail is the [CHANGELOG coverage index](../../notes/changelog-coverage.md) and each frontmatter.

## Stories

Every story in this ledger, in issue order — click a US to open its tracker link, evidence and
verification. **Assignee** is who the tracker or the `[Issue-N]` PR/commit names (`—` where nobody
is recorded); **Shipped** is the `(Koni)` release, `—` when no CHANGELOG line proves one.

| US | Status | Title | Issue | Assignee | Shipped |
|---|---|---|---|---|---|
| [US-39.1](../stories/US-39.1-create-pr-to-intergrate-subwallet-into-web3-onboard.md) | ✅ done | Create PR to intergrate SubWallet into web3-onboard | [#1045](https://github.com/Koniverse/SubWallet-Extension/issues/1045) | S2kael | — |
| [US-39.2](../stories/US-39.2-update-manage-message-and-notification-in-extension.md) | ✅ done | Update manage message and notification in extension | [#1227](https://github.com/Koniverse/SubWallet-Extension/issues/1227) | S2kael | 1.1.2 |
| [US-39.3](../stories/US-39.3-support-notification-in-browser-and-banner-in-app.md) | ✅ done | Support notification in browser and banner in app | [#2000](https://github.com/Koniverse/SubWallet-Extension/issues/2000) | S2kael | 1.1.18 |
| [US-39.4](../stories/US-39.4-webapp-disable-browser-notification-type-setting.md) | ✅ done | WebApp - Disable Browser notification type setting | [#2117](https://github.com/Koniverse/SubWallet-Extension/issues/2117) | lw-cdm | 1.1.36 |
| [US-39.5](../stories/US-39.5-re-check-order-campaign.md) | ✅ done | Re-check order campaign | [#2144](https://github.com/Koniverse/SubWallet-Extension/issues/2144) | saltict | — |
| [US-39.6](../stories/US-39.6-set-up-notifications-for-mobile-devices-in-case-of-data.md) | ✅ done | Set up notifications for mobile devices in case of data loss on iOS 17.1 | [#2230](https://github.com/Koniverse/SubWallet-Extension/issues/2230) | Sokol142196 | — |
| [US-39.7](../stories/US-39.7-webapp-support-marketing-campaign-feature-for-webapp.md) | ✅ done | WebApp - Support marketing campaign feature for webapp | [#2552](https://github.com/Koniverse/SubWallet-Extension/issues/2552) | frenkie-ng | — |
| [US-39.8](../stories/US-39.8-improve-the-marketing-campaign-application-mechanism.md) | ✅ done | Improve the Marketing Campaign application mechanism | [#2806](https://github.com/Koniverse/SubWallet-Extension/issues/2806) | Quangdm-cdm | 1.2.6 |
| [US-39.9](../stories/US-39.9-improve-performance-upon-showing-marketing-campaign.md) | ✅ done | Improve performance upon showing Marketing Campaign | [#3414](https://github.com/Koniverse/SubWallet-Extension/issues/3414) | Quangdm-cdm | 1.2.24 |
| [US-39.10](../stories/US-39.10-webapp-support-marketing-campaign-feature-for-webapp-ro.md) | 📋 backlog | WebApp - Support marketing campaign feature for webapp ( Round 2 ) | [#3454](https://github.com/Koniverse/SubWallet-Extension/issues/3454) | — | — |
| [US-39.11](../stories/US-39.11-improve-condition-for-marketing-campaign.md) | ✅ done | Improve condition for Marketing campaign | [#3468](https://github.com/Koniverse/SubWallet-Extension/issues/3468) | Quangdm-cdm | 1.2.28 |
| [US-39.12](../stories/US-39.12-extension-improve-notification.md) | 📋 backlog | Extension - Improve Notification | [#3798](https://github.com/Koniverse/SubWallet-Extension/issues/3798) | — | — |
| [US-39.13](../stories/US-39.13-extension-check-bug-spam-notification.md) | 🟢 ready | Extension - Check bug spam notification | [#3845](https://github.com/Koniverse/SubWallet-Extension/issues/3845) | bluezdot | — |
| [US-39.14](../stories/US-39.14-webapp-support-notification-in-app.md) | ⏸️ deprecated | WebApp - Support Notification in app | [#3945](https://github.com/Koniverse/SubWallet-Extension/issues/3945) | — | — |
| [US-39.15](../stories/US-39.15-avail-space-support-notification-in-app.md) | ✅ done | Avail Space - Support Notification in-app | [#3953](https://github.com/Koniverse/SubWallet-Extension/issues/3953) | lw-cdm | — |
| [US-39.16](../stories/US-39.16-webapp-support-notification-in-app.md) | ✅ done | WebApp - Support Notification in-app | [#4064](https://github.com/Koniverse/SubWallet-Extension/issues/4064) | frenkie-ng | — |
| [US-39.17](../stories/US-39.17-improve-mkt-campaign-features.md) | 📋 backlog | Improve MKT campaign features | [#4182](https://github.com/Koniverse/SubWallet-Extension/issues/4182) | nulllpc | — |
| [US-39.18](../stories/US-39.18-in-app-notifications.md) | ✅ done | In-app Notifications | [#4370](https://github.com/Koniverse/SubWallet-Extension/issues/4370) | — | — |
| [US-39.19](../stories/US-39.19-fixed-bug-error-page-when-use-marketing-campaign.md) | ✅ done | Fixed bug Error page when use marketing campaign | [#4403](https://github.com/Koniverse/SubWallet-Extension/issues/4403) | lw-cdm | 1.3.41 |

## Acceptance criteria

- [ ] **AC-1** — Every Onboarding & Localization issue with no FR story has exactly one story here; its status matches the tracker (done = COMPLETED, backlog = open, deprecated = not-planned/duplicate).
- [x] **AC-2** — `npx koni-docs validate` and `node scripts/koni-docs-check-ids.mjs` exit 0.
