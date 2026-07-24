---
id: US-1.14
title: "Uncategorized platform maintenance"
epic: EPIC-1
status: done
priority: P3
points: 4
sprint:
version_shipped: 1.3.79
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The genuinely-uncategorizable platform maintenance — logging, error-handling, caching, small cross-cutting fixes and meta work — that fits no feature and no other platform cluster.

## Status

> **✅ done — all 32 rows below are settled**: 30 delivered, 2 closed without shipping. Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.3.79` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the genuinely-uncategorized platform issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**32 tracker issues** — 17 with a release, 13 delivered with no line naming them, 2 closed without shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.1 | [#168](https://github.com/Koniverse/SubWallet-Extension/issues/168) | Improve some experiences | ✅ done |
| 0.5.2 | [#373](https://github.com/Koniverse/SubWallet-Extension/issues/373) | Logging unknown response from koni-content | ✅ done |
| 0.5.2 | [#436](https://github.com/Koniverse/SubWallet-Extension/issues/436) | Rollback Single Mode | ✅ done |
| 0.5.2 | [#438](https://github.com/Koniverse/SubWallet-Extension/issues/438) | Error logs from koni-content | ✅ done |
| 0.5.5 | [#535](https://github.com/Koniverse/SubWallet-Extension/issues/535) | Some small issues with background | ✅ done |
| 0.6.7 | [#583](https://github.com/Koniverse/SubWallet-Extension/issues/583) | Some errors occurred when updating the caching mechanism | ✅ done |
| 1.0.5 | [#1373](https://github.com/Koniverse/SubWallet-Extension/issues/1373) | Remove some logs | ✅ done |
| 1.1.30 | [#2391](https://github.com/Koniverse/SubWallet-Extension/issues/2391) | Handle fallback for online content | ✅ done |
| 1.1.36 | [#1754](https://github.com/Koniverse/SubWallet-Extension/issues/1754) | WebApp - Show incorrect the menu is active | ✅ done |
| 1.1.55 | [#2475](https://github.com/Koniverse/SubWallet-Extension/issues/2475) | WebApp - Add content in case search haven't result | ✅ done |
| 1.1.61 | [#2986](https://github.com/Koniverse/SubWallet-Extension/issues/2986) | Extension - Check bug Cannot read properties of undefined (reading 'length') | ✅ done |
| 1.2.1 | [#3129](https://github.com/Koniverse/SubWallet-Extension/issues/3129) | Force apply patch for online data update | ✅ done |
| 1.2.8 | [#3218](https://github.com/Koniverse/SubWallet-Extension/issues/3218) | Extension - Error can't read properties of undefined (reading 'filter') | ✅ done |
| 1.2.12 | [#3259](https://github.com/Koniverse/SubWallet-Extension/issues/3259) | Extension - Cannot read properties of undefined (reading 'includes') | ✅ done |
| 1.3.15 | [#4002](https://github.com/Koniverse/SubWallet-Extension/issues/4002) | Extension - Re-check and fix issue Don't open the extension | ✅ done |
| 1.3.62 | [#4536](https://github.com/Koniverse/SubWallet-Extension/issues/4536) | Fix issue can not update patch and online resources | ✅ done |
| 1.3.79 | [#4988](https://github.com/Koniverse/SubWallet-Extension/issues/4988) | Extension – Some issues when merging in version 78. | ✅ done |
| — | [#79](https://github.com/Koniverse/SubWallet-Extension/issues/79) | Some improvements in user experience | ✅ done |
| — | [#81](https://github.com/Koniverse/SubWallet-Extension/issues/81) | Fix some small bugs | ✅ done |
| — | [#83](https://github.com/Koniverse/SubWallet-Extension/issues/83) | Some experience improvements when adding Substrate and EVM parallel running mechanism | ✅ done |
| — | [#514](https://github.com/Koniverse/SubWallet-Extension/issues/514) | Polkadot JS component Issues | ✅ done |
| — | [#763](https://github.com/Koniverse/SubWallet-Extension/issues/763) | Resovle conflict and problems after merge newest koni-dev into koni-dev-wr | ✅ done |
| — | [#974](https://github.com/Koniverse/SubWallet-Extension/issues/974) | Update number handling logic in background | ✅ done |
| — | [#1838](https://github.com/Koniverse/SubWallet-Extension/issues/1838) | Handling conflicts when using both WebApp and extension at the same time | ✅ done |
| — | [#1850](https://github.com/Koniverse/SubWallet-Extension/issues/1850) | WebApp - Update title description and preview images | ⏸ deprecated |
| — | [#2094](https://github.com/Koniverse/SubWallet-Extension/issues/2094) | WebApp - Occasionally an error occurs when accessing web app | ✅ done |
| — | [#2151](https://github.com/Koniverse/SubWallet-Extension/issues/2151) | Check the issue not being able to open the extension | ⏸ deprecated |
| — | [#2434](https://github.com/Koniverse/SubWallet-Extension/issues/2434) | Periodically check some features | ✅ done |
| — | [#4549](https://github.com/Koniverse/SubWallet-Extension/issues/4549) | Describes the process of setting up some features on the wallet | ✅ done |
| — | [#4582](https://github.com/Koniverse/SubWallet-Extension/issues/4582) | Extension - Behaves differently on pjs apps locally | ✅ done |
| — | [#5013](https://github.com/Koniverse/SubWallet-Extension/issues/5013) | [ Extension ] Some issues are open when upgrade version | ✅ done |
| — | [#5016](https://github.com/Koniverse/SubWallet-Extension/issues/5016) | Wallet | ✅ done |

> **The residue of a triage bucket is still mostly platform.** Logging and log-removal (#373, #438, #1373), caching-mechanism fixes (#583), generic *"Cannot read properties of undefined"* runtime bugs (#2986, #3218, #3259, #3891), and meta issues (#4181 product review, #4393 major update) — none maps to a feature; all are the platform staying alive.

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-1; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
