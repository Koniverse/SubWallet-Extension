---
id: US-3.13
title: "Account fixes recovered from Uncategorized"
epic: EPIC-3
status: done
priority: P3
points: 2
sprint:
version_shipped: 1.3.44
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The account maintenance the triage bucket held — address, contact, avatar and account-state fixes whose title did not say "account".

## Status

> **✅ done — all 12 rows below are settled**: 11 delivered, 1 closed without shipping. Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.3.44` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the account — address / contact / state issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**12 tracker issues** — 9 with a release, 2 delivered with no line naming them, 1 closed without shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.1 | [#152](https://github.com/Koniverse/SubWallet-Extension/issues/152) | InputAddress: No longer get data directly from the global object of the background page. Instead, use messages to get the data. | ✅ done |
| 1.0.2 | [#1219](https://github.com/Koniverse/SubWallet-Extension/issues/1219) | Address Book Feature | ✅ done |
| 1.0.4 | [#1279](https://github.com/Koniverse/SubWallet-Extension/issues/1279) | Bug related to address book | ✅ done |
| 1.0.10 | [#1524](https://github.com/Koniverse/SubWallet-Extension/issues/1524) | Show incorrect address book type | ✅ done |
| 1.1.1 | [#1559](https://github.com/Koniverse/SubWallet-Extension/issues/1559) | Bugs related to address book | ✅ done |
| 1.1.44 | [#2729](https://github.com/Koniverse/SubWallet-Extension/issues/2729) | Extension - Update Subject email in case select Contact support | ✅ done |
| 1.1.55 | [#2737](https://github.com/Koniverse/SubWallet-Extension/issues/2737) | WebApp - Update Subject email in case select Contact support | ✅ done |
| 1.3.33 | [#4324](https://github.com/Koniverse/SubWallet-Extension/issues/4324) | Extension - Update link for "Contact support" action | ✅ done |
| 1.3.44 | [#4488](https://github.com/Koniverse/SubWallet-Extension/issues/4488) | Extension - Hide feature Advanced address detection | ✅ done |
| — | [#1421](https://github.com/Koniverse/SubWallet-Extension/issues/1421) | Do not Edit Contract address when Edit Contact | ⏸ deprecated |
| — | [#1702](https://github.com/Koniverse/SubWallet-Extension/issues/1702) | WebApp - Can not get to address in case below | ✅ done |
| — | [#2135](https://github.com/Koniverse/SubWallet-Extension/issues/2135) | Supports custom derived path feature | ✅ done |

> **Address and contact handling dominate.** Editing a contact vs its address (#1421), address-format and advanced-detection toggles (#3864, #4488), and account-state edge cases. They join the Account fold ([note](../../notes/2026-07-24.md#c-epic-23-maintenance--account-merged-into-epic-3)).

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-3; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md) · [US-3.12](US-3.12-open-account-improvements.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
