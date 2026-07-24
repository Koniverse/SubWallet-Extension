---
id: US-1.11
title: "Dependency, library & build maintenance"
epic: EPIC-1
status: done
priority: P3
points: 3
sprint:
version_shipped: 1.3.73
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Keep the dependency tree, polkadot-js/API libraries and the cross-browser build current — the version bumps and build fixes that no feature owns but every feature rides on.

## Status

> **✅ done — all 27 rows below are settled**: 23 delivered, 4 closed without shipping. Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.3.73` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the dependency, library-version and build/browser issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**27 tracker issues** — 16 with a release, 7 delivered with no line naming them, 4 closed without shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.6.7 | [#691](https://github.com/Koniverse/SubWallet-Extension/issues/691) | Bump deps | ✅ done |
| 0.7.3 | [#847](https://github.com/Koniverse/SubWallet-Extension/issues/847) | Bump dependencies | ✅ done |
| 0.7.7 | [#944](https://github.com/Koniverse/SubWallet-Extension/issues/944) | Bump deps | ✅ done |
| 1.0.3 | [#1306](https://github.com/Koniverse/SubWallet-Extension/issues/1306) | Bump dev outdate libs | ✅ done |
| 1.0.9 | [#1530](https://github.com/Koniverse/SubWallet-Extension/issues/1530) | Update uninstall extension URL | ✅ done |
| 1.1.23 | [#2207](https://github.com/Koniverse/SubWallet-Extension/issues/2207) | Browser waste time when load extension | ✅ done |
| 1.1.26 | [#2259](https://github.com/Koniverse/SubWallet-Extension/issues/2259) | Update extension dependencies | ✅ done |
| 1.1.28 | [#2406](https://github.com/Koniverse/SubWallet-Extension/issues/2406) | Allow access extension from iframe | ✅ done |
| 1.1.36 | [#2015](https://github.com/Koniverse/SubWallet-Extension/issues/2015) | WebApp - Bug related to Safari browser | ✅ done |
| 1.1.56 | [#2853](https://github.com/Koniverse/SubWallet-Extension/issues/2853) | Bump Polkadot dependencies | ✅ done |
| 1.2.24 | [#3308](https://github.com/Koniverse/SubWallet-Extension/issues/3308) | Hide direct api usage of polkadot/js | ✅ done |
| 1.2.29 | [#3542](https://github.com/Koniverse/SubWallet-Extension/issues/3542) | Extension - Re-check file size when release Extension | ✅ done |
| 1.3.10 | [#3888](https://github.com/Koniverse/SubWallet-Extension/issues/3888) | Update version polkadot api | ✅ done |
| 1.3.47 | [#4443](https://github.com/Koniverse/SubWallet-Extension/issues/4443) | Extension - Update Gears Library | ✅ done |
| 1.3.71 | [#4808](https://github.com/Koniverse/SubWallet-Extension/issues/4808) | Update libs for SubWallet Extensions | ✅ done |
| 1.3.73 | [#4957](https://github.com/Koniverse/SubWallet-Extension/issues/4957) | Extension - Update @subwallet-monorepos/subwallet-services-sdk 0.1.16 | ✅ done |
| — | [#153](https://github.com/Koniverse/SubWallet-Extension/issues/153) | Extension expand window | ✅ done |
| — | [#703](https://github.com/Koniverse/SubWallet-Extension/issues/703) | Unable to load extension (extension mode) when the user reopens the browser after improperly shutting down | ⏸ deprecated |
| — | [#732](https://github.com/Koniverse/SubWallet-Extension/issues/732) | Release version 0.6.7 | ✅ done |
| — | [#1126](https://github.com/Koniverse/SubWallet-Extension/issues/1126) | Re-test with other browser and other OS | ✅ done |
| — | [#1517](https://github.com/Koniverse/SubWallet-Extension/issues/1517) | Check and update changes from @polkadot/extension | ✅ done |
| — | [#1561](https://github.com/Koniverse/SubWallet-Extension/issues/1561) | Unable to use extension on LibreWolf browser | ✅ done |
| — | [#1928](https://github.com/Koniverse/SubWallet-Extension/issues/1928) | Re-check the border on Window OS after updating to the latest browser version | ⏸ deprecated |
| — | [#2206](https://github.com/Koniverse/SubWallet-Extension/issues/2206) | Support Avail light client | ⏸ deprecated |
| — | [#3049](https://github.com/Koniverse/SubWallet-Extension/issues/3049) | WebApp - Auto reset currency when reloading browser | ⏸ deprecated |
| — | [#3137](https://github.com/Koniverse/SubWallet-Extension/issues/3137) | Extension - Follow up Extension on Microsoft Edge | ✅ done |
| — | [#3910](https://github.com/Koniverse/SubWallet-Extension/issues/3910) | WebApp - Update version polkadot api | ✅ done |

> **Dependency drift is continuous work.** polkadot-js / polkadot-API bumps, the web3.js→ethers migration (#1572), DeDot (#4143), Gears (#4443), and the cross-browser build (Firefox/Brave/Edge) are the recurring shape — the platform tax every release pays.

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-1; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
