---
id: US-5.13
title: "Security fixes recovered from Uncategorized"
epic: EPIC-5
status: done
priority: P3
points: 2
sprint:
version_shipped: 1.3.7
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The security maintenance the triage bucket held — reset-wallet, ZK-mode, block-action and encryption work whose title named the mechanism, not "security".

## Status

> **✅ done — all 17 rows below are settled**: 13 delivered, 4 closed without shipping. Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.3.7` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the security — reset / ZK-mode / block-action issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**17 tracker issues** — 11 with a release, 2 delivered with no line naming them, 4 closed without shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.4 | [#1224](https://github.com/Koniverse/SubWallet-Extension/issues/1224) | Reset Wallet Feature | ✅ done |
| 1.0.5 | [#1171](https://github.com/Koniverse/SubWallet-Extension/issues/1171) | Improve auto lock wallet feature | ✅ done |
| 1.0.5 | [#1369](https://github.com/Koniverse/SubWallet-Extension/issues/1369) | No policy for a master password | ✅ done |
| 1.1.11 | [#1763](https://github.com/Koniverse/SubWallet-Extension/issues/1763) | Improve auto-lock feature | ✅ done |
| 1.1.36 | [#1184](https://github.com/Koniverse/SubWallet-Extension/issues/1184) | Decrease time and avoid error while changing master password | ✅ done |
| 1.1.36 | [#1681](https://github.com/Koniverse/SubWallet-Extension/issues/1681) | WebApp - Re-check apply master password feature | ✅ done |
| 1.1.36 | [#1943](https://github.com/Koniverse/SubWallet-Extension/issues/1943) | An error occurs when using ZK mode with authenticate with password = When needed | ✅ done |
| 1.1.58 | [#2555](https://github.com/Koniverse/SubWallet-Extension/issues/2555) | Add show/hide password for case input password | ✅ done |
| 1.1.63 | [#2973](https://github.com/Koniverse/SubWallet-Extension/issues/2973) | WebApp - Add show/hide password for case input password | ✅ done |
| 1.2.31 | [#3635](https://github.com/Koniverse/SubWallet-Extension/issues/3635) | Block action online | ✅ done |
| 1.3.7 | [#3814](https://github.com/Koniverse/SubWallet-Extension/issues/3814) | Improve block action online by environment | ✅ done |
| — | [#832](https://github.com/Koniverse/SubWallet-Extension/issues/832) | Add new feature: Social Recovery | ⏸ deprecated |
| — | [#1295](https://github.com/Koniverse/SubWallet-Extension/issues/1295) | Bug related to Master Password | ⏸ deprecated |
| — | [#1543](https://github.com/Koniverse/SubWallet-Extension/issues/1543) | Recheck the size of the password field with Window device | ⏸ deprecated |
| — | [#1608](https://github.com/Koniverse/SubWallet-Extension/issues/1608) | Improve ZK mode | ⏸ deprecated |
| — | [#1642](https://github.com/Koniverse/SubWallet-Extension/issues/1642) | Do not show wrong password when enter invalid password multiple-time in case enable ZK mode | ✅ done |
| — | [#1826](https://github.com/Koniverse/SubWallet-Extension/issues/1826) | WebApp - Bug related to Authenticate with password feature in WebApp | ✅ done |

> **"Reset wallet" and "block action" are the two clusters.** Reset-to-default and reset-data (#1224, #2374, #3035, #3036), the ZK-mode surface (#1608, #3117-adjacent), and the online *block-action* guard (#3635, #3678, #3814). Social recovery (#832) is the one forward idea here.

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-5; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md) · [US-5.14](US-5.14-open-security-improvements-recovered-from-uncategorized.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
