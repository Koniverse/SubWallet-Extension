---
id: US-9.27
title: "NFT fixes recovered from Uncategorized"
epic: EPIC-9
status: done
priority: P3
points: 1
sprint:
version_shipped: 1.1.2
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The NFT maintenance the triage bucket held — collection parsing, deleted/sent-NFT display and new-standard support whose title did not say "NFT" first.

## Status

> **✅ done — all 8 rows below are settled**: 5 delivered, 3 closed without shipping. Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.1.2` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the NFT — parsing / display / standards issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**8 tracker issues** — 5 with a release, 3 closed without shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.4 | [#178](https://github.com/Koniverse/SubWallet-Extension/issues/178) | Bug on getAddressTokens of quartz_nft | ✅ done |
| 0.6.7 | [#497](https://github.com/Koniverse/SubWallet-Extension/issues/497) | Still shows deleted NFTs | ✅ done |
| 0.7.9 | [#985](https://github.com/Koniverse/SubWallet-Extension/issues/985) | Support Shiden base PSP-34 contract | ✅ done |
| 0.8.4 | [#1112](https://github.com/Koniverse/SubWallet-Extension/issues/1112) | Add ArtZero API | ✅ done |
| 1.1.2 | [#1615](https://github.com/Koniverse/SubWallet-Extension/issues/1615) | Still showing NFTs that have been sent | ✅ done |
| — | [#3096](https://github.com/Koniverse/SubWallet-Extension/issues/3096) | Support Common NFTs from Drop Space | ⏸ deprecated |
| — | [#3603](https://github.com/Koniverse/SubWallet-Extension/issues/3603) | [Story Protocols] Implement BI Tools | ⏸ deprecated |
| — | [#4759](https://github.com/Koniverse/SubWallet-Extension/issues/4759) | Extension - Add support for Unique' Nested NFTs | ⏸ deprecated |

> **Stale NFTs and new standards.** Still-showing deleted or sent NFTs (#497, #1615), collection parsing (#178), and standard/collection support — PSP-34 (#985), ArtZero (#1112), Drop Space (#3096), Nested NFTs (#4759).

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-9; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
