---
id: US-7.9
title: "Portfolio & balance fixes recovered from Uncategorized"
epic: EPIC-7
status: done
priority: P3
points: 1
sprint:
version_shipped: 1.1.65
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The portfolio/balance maintenance the triage bucket held — crypto-list, big-number, currency-type and percentage-display fixes.

## Status

> **✅ done — all 5 rows below are settled — all delivered.** Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.1.65` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the portfolio / balance display issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**5 tracker issues** — 5 with a release.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.1 | [#69](https://github.com/Koniverse/SubWallet-Extension/issues/69) | [v0.2.9] Crypto list error | ✅ done |
| 1.0.2 | [#1272](https://github.com/Koniverse/SubWallet-Extension/issues/1272) | Handling the case of large numbers | ✅ done |
| 1.1.36 | [#1675](https://github.com/Koniverse/SubWallet-Extension/issues/1675) | WebApp - Portforlio % show incorrect | ✅ done |
| 1.1.62 | [#2738](https://github.com/Koniverse/SubWallet-Extension/issues/2738) | Extension - Add more currency type | ✅ done |
| 1.1.65 | [#2914](https://github.com/Koniverse/SubWallet-Extension/issues/2914) | WebApp - Add more currency type | ✅ done |

> **Display correctness across the balance surface.** The crypto list (#69), large-number handling (#1272), added currency types (#2738, #2914) and a WebApp portfolio-% bug (#1675) — the read side where a wrong figure is most visible.

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-7; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-7](../epics/EPIC-7.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
