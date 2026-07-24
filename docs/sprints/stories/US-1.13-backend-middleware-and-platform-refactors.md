---
id: US-1.13
title: "Backend, middleware & platform refactors"
epic: EPIC-1
status: done
priority: P3
points: 4
sprint:
version_shipped: 1.3.41
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The backend/middleware services the wallet reaches (API cacher, Blockfrost proxy, Subscan/SubSquid, Strapi) and the platform-side refactors — orchestrators, validation services, data-flow — that restructure code without changing a feature.

## Status

> **✅ done — all 31 rows below are settled — all delivered.** Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.3.41` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the backend/middleware-service and platform-refactor issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**31 tracker issues** — 13 with a release, 18 delivered with no line naming them.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.1 | [#135](https://github.com/Koniverse/SubWallet-Extension/issues/135) | Refactor code for pull request #133 | ✅ done |
| 0.5.9 | [#611](https://github.com/Koniverse/SubWallet-Extension/issues/611) | Deceptive site warning on IPFS gateway cloud | ✅ done |
| 1.1.36 | [#2097](https://github.com/Koniverse/SubWallet-Extension/issues/2097) | Separate environment for data on Strapi | ✅ done |
| 1.1.39 | [#2617](https://github.com/Koniverse/SubWallet-Extension/issues/2617) | Update validation logic for ChainList | ✅ done |
| 1.3.4 | [#3809](https://github.com/Koniverse/SubWallet-Extension/issues/3809) | Extension - Update api key for TAO(Bittensor) | ✅ done |
| 1.3.5 | [#3070](https://github.com/Koniverse/SubWallet-Extension/issues/3070) | Refactor logic parsing data from contract response | ✅ done |
| 1.3.5 | [#3654](https://github.com/Koniverse/SubWallet-Extension/issues/3654) | Extension - Re-check some old types from ExtrinsicType | ✅ done |
| 1.3.17 | [#4029](https://github.com/Koniverse/SubWallet-Extension/issues/4029) | Extension - Fix rate limit api key for Bittensor(TAO) | ✅ done |
| 1.3.27 | [#4164](https://github.com/Koniverse/SubWallet-Extension/issues/4164) | Extension - Update API key for blockfrost on Cardano | ✅ done |
| 1.3.32 | [#4312](https://github.com/Koniverse/SubWallet-Extension/issues/4312) | Extension - Merge some PRs to align with the middleware services | ✅ done |
| 1.3.35 | [#4240](https://github.com/Koniverse/SubWallet-Extension/issues/4240) | Review extrinsic status subscription | ✅ done |
| 1.3.41 | [#4368](https://github.com/Koniverse/SubWallet-Extension/issues/4368) | [Cardano] Moving BlockFrost interaction Logic to the Backend | ✅ done |
| 1.3.41 | [#4415](https://github.com/Koniverse/SubWallet-Extension/issues/4415) | Create flexible `BACKEND_URL` changing mechanism for pull requests | ✅ done |
| — | [#15](https://github.com/Koniverse/SubWallet-Extension/issues/15) | Update new architecture aim to adding more features while being able to rebase the polkadot-js origin at any time. | ✅ done |
| — | [#288](https://github.com/Koniverse/SubWallet-Extension/issues/288) | Create a pinata gateway for Subwallet | ✅ done |
| — | [#300](https://github.com/Koniverse/SubWallet-Extension/issues/300) | Fix github actions issues | ✅ done |
| — | [#496](https://github.com/Koniverse/SubWallet-Extension/issues/496) | Ideas of Middleware Systems | ✅ done |
| — | [#508](https://github.com/Koniverse/SubWallet-Extension/issues/508) | Update github action | ✅ done |
| — | [#939](https://github.com/Koniverse/SubWallet-Extension/issues/939) | Update init API features | ✅ done |
| — | [#1190](https://github.com/Koniverse/SubWallet-Extension/issues/1190) | Implement SubWallet base | ✅ done |
| — | [#1673](https://github.com/Koniverse/SubWallet-Extension/issues/1673) | Update IPFS gateway list | ✅ done |
| — | [#1701](https://github.com/Koniverse/SubWallet-Extension/issues/1701) | WebApp - Update netlify workflow | ✅ done |
| — | [#2451](https://github.com/Koniverse/SubWallet-Extension/issues/2451) | Seperate validation logic into a new service | ✅ done |
| — | [#3662](https://github.com/Koniverse/SubWallet-Extension/issues/3662) | Implement tx orchestrator | ✅ done |
| — | [#3695](https://github.com/Koniverse/SubWallet-Extension/issues/3695) | Extension - Re-check case rate limit | ✅ done |
| — | [#3892](https://github.com/Koniverse/SubWallet-Extension/issues/3892) | Init backend service for SubWallet | ✅ done |
| — | [#4074](https://github.com/Koniverse/SubWallet-Extension/issues/4074) | Update API cacher server | ✅ done |
| — | [#4119](https://github.com/Koniverse/SubWallet-Extension/issues/4119) | Test new Problem logging API | ✅ done |
| — | [#4169](https://github.com/Koniverse/SubWallet-Extension/issues/4169) | Update ChainPatrol API key | ✅ done |
| — | [#4399](https://github.com/Koniverse/SubWallet-Extension/issues/4399) | 🛠️ Feature: Allow Custom Environment Variables per PR | ✅ done |
| — | [#4700](https://github.com/Koniverse/SubWallet-Extension/issues/4700) | Reset to default backend dev after merge | ✅ done |

> **The wallet grew a backend, and refactors kept the core shippable.** Backend/middleware init and cachers (#3892, #4061, #4074), moving Blockfrost server-side (#4368), and the tx-orchestrator / validation-service / data-flow refactors (#3662, #3661, #3663) are infrastructure that underpins features without being one.

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-1; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.6](US-1.6-platform-operations-and-out-of-repo-tooling.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
