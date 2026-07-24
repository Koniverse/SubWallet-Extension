---
id: US-1.12
title: "WebApp & mobile platform sync"
epic: EPIC-1
status: done
priority: P3
points: 5
sprint:
version_shipped: 1.3.34
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Keep the WebApp and the mobile web-runner in step with the extension — the "update the latest code vX" sync chores and the mobile-runner/app portability work across one shared `extension-base` core.

## Status

> **✅ done — all 47 rows below are settled**: 43 delivered, 4 closed without shipping. Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.3.34` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the WebApp code-sync and mobile web-runner/portability issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**47 tracker issues** — 13 with a release, 30 delivered with no line naming them, 4 closed without shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.7 | [#1472](https://github.com/Koniverse/SubWallet-Extension/issues/1472) | Update web runner for fix ABI block explorer on mobile | ✅ done |
| 1.0.11 | [#1510](https://github.com/Koniverse/SubWallet-Extension/issues/1510) | Implement @polkadot/apps-config for typeBundle instead of copy them into extension base | ✅ done |
| 1.1.11 | [#1882](https://github.com/Koniverse/SubWallet-Extension/issues/1882) | Handle bug related to web runner v1.1.10 when used for mobile applications | ✅ done |
| 1.1.36 | [#1889](https://github.com/Koniverse/SubWallet-Extension/issues/1889) | Keep update webapp with newest version of extension | ✅ done |
| 1.1.36 | [#2112](https://github.com/Koniverse/SubWallet-Extension/issues/2112) | Update the latest code from the extension and the latest Chainlist for the web app (W44) | ✅ done |
| 1.1.36 | [#2164](https://github.com/Koniverse/SubWallet-Extension/issues/2164) | WebApp - Update lastest logic from extension version 1.1.21 | ✅ done |
| 1.1.36 | [#2295](https://github.com/Koniverse/SubWallet-Extension/issues/2295) | WebApp - Update webapp according to the latest code (v1.1.24-extension) | ✅ done |
| 1.1.36 | [#2327](https://github.com/Koniverse/SubWallet-Extension/issues/2327) | WebApp - Update webapp according to the latest code (v1.1.25-extension) | ✅ done |
| 1.1.36 | [#2431](https://github.com/Koniverse/SubWallet-Extension/issues/2431) | WebApp - Update latest code for webapp (v1.1.29 extension) | ✅ done |
| 1.2.6 | [#3194](https://github.com/Koniverse/SubWallet-Extension/issues/3194) | Bug can not backup data in Mobile App | ✅ done |
| 1.2.14 | [#3237](https://github.com/Koniverse/SubWallet-Extension/issues/3237) | WebApp - Update latest code (v1.2.10) | ✅ done |
| 1.3.23 | [#4061](https://github.com/Koniverse/SubWallet-Extension/issues/4061) | Merge backend | ✅ done |
| 1.3.34 | [#4091](https://github.com/Koniverse/SubWallet-Extension/issues/4091) | Extension - Support extension side panel | ✅ done |
| — | [#37](https://github.com/Koniverse/SubWallet-Extension/issues/37) | Support Mobile Devices | ✅ done |
| — | [#443](https://github.com/Koniverse/SubWallet-Extension/issues/443) | Update Mobile Version | ✅ done |
| — | [#723](https://github.com/Koniverse/SubWallet-Extension/issues/723) | Web runner - handle migration between version | ⏸ deprecated |
| — | [#1120](https://github.com/Koniverse/SubWallet-Extension/issues/1120) | Update Web-runner for mobile app (v0.8.4 - extension) | ✅ done |
| — | [#1592](https://github.com/Koniverse/SubWallet-Extension/issues/1592) | Ovewview Webapp | ✅ done |
| — | [#2022](https://github.com/Koniverse/SubWallet-Extension/issues/2022) | Don't load web app in the In-App Browser on mobile app | ✅ done |
| — | [#2202](https://github.com/Koniverse/SubWallet-Extension/issues/2202) | Review and testing the features related to NFC | ⏸ deprecated |
| — | [#2257](https://github.com/Koniverse/SubWallet-Extension/issues/2257) | Update web-runner v1.1.23 for mobile app | ✅ done |
| — | [#2272](https://github.com/Koniverse/SubWallet-Extension/issues/2272) | Handle bug reset data on version IOS 17.1 (Round 3) | ⏸ deprecated |
| — | [#2366](https://github.com/Koniverse/SubWallet-Extension/issues/2366) | WebApp - Update webapp according to the latest code (v1.1.26, 1.1.27-extension) | ✅ done |
| — | [#2459](https://github.com/Koniverse/SubWallet-Extension/issues/2459) | Merge all platform in to same codebase | ✅ done |
| — | [#2462](https://github.com/Koniverse/SubWallet-Extension/issues/2462) | Implement auto recover to avoid app reset on Android and ios lower than 17 | ⏸ deprecated |
| — | [#2476](https://github.com/Koniverse/SubWallet-Extension/issues/2476) | Update newest extension codebase in to webapp | ✅ done |
| — | [#2479](https://github.com/Koniverse/SubWallet-Extension/issues/2479) | WebApp - Update latest code for webapp (v1.1.31 extension) | ✅ done |
| — | [#2919](https://github.com/Koniverse/SubWallet-Extension/issues/2919) | WebApp - Update the latest code v1.1.55 | ✅ done |
| — | [#2950](https://github.com/Koniverse/SubWallet-Extension/issues/2950) | WebApp - Update the latest code v1.1.56 | ✅ done |
| — | [#2957](https://github.com/Koniverse/SubWallet-Extension/issues/2957) | WebApp - Update the latest code v1.1.57 | ✅ done |
| — | [#2987](https://github.com/Koniverse/SubWallet-Extension/issues/2987) | WebApp - Update the latest code v1.1.60 | ✅ done |
| — | [#3031](https://github.com/Koniverse/SubWallet-Extension/issues/3031) | WebApp - Update the latest code v1.1.62 | ✅ done |
| — | [#3044](https://github.com/Koniverse/SubWallet-Extension/issues/3044) | WebApp - Update latest code v1.1.64 | ✅ done |
| — | [#3074](https://github.com/Koniverse/SubWallet-Extension/issues/3074) | WebApp - Update latest code v1.1.65 | ✅ done |
| — | [#3120](https://github.com/Koniverse/SubWallet-Extension/issues/3120) | WebApp - Update the latest code v1.1.68 | ✅ done |
| — | [#3138](https://github.com/Koniverse/SubWallet-Extension/issues/3138) | WebApp - Update the latest code v1.2.2 | ✅ done |
| — | [#3182](https://github.com/Koniverse/SubWallet-Extension/issues/3182) | WebApp - Update the latest code v1.2.4, v1.2.5 | ✅ done |
| — | [#3584](https://github.com/Koniverse/SubWallet-Extension/issues/3584) | Avail Space - Update the latest code v1.2.28 | ✅ done |
| — | [#3620](https://github.com/Koniverse/SubWallet-Extension/issues/3620) | WebApp - Update the latest code v1.2.29 | ✅ done |
| — | [#3671](https://github.com/Koniverse/SubWallet-Extension/issues/3671) | WebApp - Update latest code v1.2.30 | ✅ done |
| — | [#3705](https://github.com/Koniverse/SubWallet-Extension/issues/3705) | WebApp - Update the latest code v1.2.32 | ✅ done |
| — | [#3784](https://github.com/Koniverse/SubWallet-Extension/issues/3784) | WebApp - Update the latest code v1.3.35 | ✅ done |
| — | [#3979](https://github.com/Koniverse/SubWallet-Extension/issues/3979) | WebApp - Some update for WebApp | ✅ done |
| — | [#4457](https://github.com/Koniverse/SubWallet-Extension/issues/4457) | [WebApp] Upgrade codebase to version 1.3.41 (sync from Extension) | ✅ done |
| — | [#4571](https://github.com/Koniverse/SubWallet-Extension/issues/4571) | Restructure web-runner-cron for development requirements | ✅ done |
| — | [#4640](https://github.com/Koniverse/SubWallet-Extension/issues/4640) | WebApp - Update code to v1.3.54 | ✅ done |
| — | [#4673](https://github.com/Koniverse/SubWallet-Extension/issues/4673) | WebApp - Update code to v1.3.56 | ✅ done |

> **One core, three surfaces, a permanent sync tax.** The *"Update the latest code v1.x"* chores are the WebApp catching up to each extension release; the web-runner and mobile-app rows are the same core running on a phone (#1120, #1472, #2257). This is [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md)'s monorepo promise paying its ongoing cost.

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-1; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
