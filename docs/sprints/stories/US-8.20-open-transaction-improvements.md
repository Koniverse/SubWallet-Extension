---
id: US-8.20
title: "Open transaction improvements (improvement on US-8.1 … US-8.18)"
epic: EPIC-8
status: in-progress
priority: P3
points: 5
sprint:
version_shipped:
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The transaction work that is asked for and not delivered: another round of address validation, more
history types, the fee service that would replace ad-hoc estimation, and the error message a user
gets when a transfer fails.

## Status

> **🚧 in-progress — nothing here has shipped.** All 19 rows below are **open on the tracker**. No acceptance criterion is ticked, and `commit`, `sprint` and
> `version_shipped` stay empty until work lands in a release.

## Scope

This is an **improvement story on shipped ones**. Every capability story in this epic is `done`;
these 17 issues ask for things none of them delivered. A `done` story may not carry an open row
([AGENTS.md](../../../AGENTS.md) rule 9), so they moved here on 2026-07-24.

It materializes **no FR**.

**Not here:** the fee-accuracy findings, which are
[US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md) — that story's own title enumerates
its eight issues, and splitting on the title is what keeps both readable.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#1549](https://github.com/Koniverse/SubWallet-Extension/issues/1549) | Re-check case send Max on some tokens | 📋 backlog |
| — | [#1922](https://github.com/Koniverse/SubWallet-Extension/issues/1922) | Handle the case of transfer Max for some tokens | 📋 backlog |
| — | [#2179](https://github.com/Koniverse/SubWallet-Extension/issues/2179) | WebApp - Update more transaction history types | 📋 backlog |
| — | [#2541](https://github.com/Koniverse/SubWallet-Extension/issues/2541) | Add popup to show message "Sakura unable to transfer all" | 📋 backlog |
| — | [#2618](https://github.com/Koniverse/SubWallet-Extension/issues/2618) | Implement new fee service | 📋 backlog |
| — | [#2648](https://github.com/Koniverse/SubWallet-Extension/issues/2648) | Extension - Adjust showing/validating address on Send fund (Round 2) | 📋 backlog |
| — | [#2712](https://github.com/Koniverse/SubWallet-Extension/issues/2712) | Extension - Handle the case of scan address of Polkadot vault when transfer | 📋 backlog |
| — | [#3072](https://github.com/Koniverse/SubWallet-Extension/issues/3072) | Extension - Do not show QR code when receive address | 📋 backlog |
| — | [#3551](https://github.com/Koniverse/SubWallet-Extension/issues/3551) | Unified account - Consider moving transaction warnings to background | 📋 backlog |
| — | [#3573](https://github.com/Koniverse/SubWallet-Extension/issues/3573) | Extension - Adjust showing/validating address on History transaction screen | 📋 backlog |
| — | [#3863](https://github.com/Koniverse/SubWallet-Extension/issues/3863) | Increase weight on PSP token transfer | 📋 backlog |
| — | [#3912](https://github.com/Koniverse/SubWallet-Extension/issues/3912) | Extension - Improve History transaction | 📋 backlog |
| — | [#3952](https://github.com/Koniverse/SubWallet-Extension/issues/3952) | Extension - Updated the error message when perform transaction | 📋 backlog |
| — | [#3969](https://github.com/Koniverse/SubWallet-Extension/issues/3969) | Extension - Show address TON on list recent in case transfer token Substrate | 📋 backlog |
| — | [#4041](https://github.com/Koniverse/SubWallet-Extension/issues/4041) | Extension - Improve show well-known tokens on top when Receive token | 📋 backlog |
| — | [#4093](https://github.com/Koniverse/SubWallet-Extension/issues/4093) | Extension - Add validate receipient address  when transfer | 📋 backlog |
| — | [#4432](https://github.com/Koniverse/SubWallet-Extension/issues/4432) | [Transaction] Ensure proper initialization when navigating via direct link | 📋 backlog |
| — | [#158](https://github.com/Koniverse/SubWallet-Extension/issues/158) | Make the extrinsic decoding and reviewing more seemless | 📋 backlog |
| — | [#3428](https://github.com/Koniverse/SubWallet-Extension/issues/3428) | WebApp - Disable all actions when submitting data | 📋 backlog |

> **+2 open rows recovered from the Uncategorized ledger** (2026-07-24).

> **#2618 is the structural answer nobody has taken.** *"Implement new fee service"* — one place that
> owns fee estimation, instead of the per-chain, per-provider guessing that
> [US-8.16](US-8.16-evm-fee-and-gas-estimation.md) records sixteen issues of. It has been `In
> Backlog` since 2024, and every fee row filed since is interest on that decision.
>
> **#3952 is the user-facing half of [US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md)'s
> #3240.** *"Updated the error message when performing a transaction"* and *"transfer failed, but
> there is no specific error"* are the same complaint filed twice, two years apart, in two different
> areas. Neither has started.
>
> **Address validation is on round two and still open.** #2648 (*"adjust showing/validating address
> on Send fund — round 2"*), #3573 (the same on the history screen), #4093 (validate the recipient),
> #3969 (show TON addresses in the recent list), #2712 (scan a Polkadot Vault address). Five rows on
> one input field, on top of the four already settled in
> [US-8.14](US-8.14-send-fund-form-and-recipient-validation.md).

## Acceptance criteria

- [ ] **AC-1** — The recipient field validates and displays every supported address format across the send and history screens (#2648, #3573, #4093, #3969, #2712), or each is closed with the reason recorded.
- [ ] **AC-2** — A single fee service owns estimation (#2618), or the issue is closed with the reason recorded.
- [ ] **AC-3** — A failed transaction reports a specific reason rather than a generic failure (#3952).
- [ ] **AC-4** — Max-send behaves correctly on the tokens reported in #1549, #1922 and #2541.
- [ ] **AC-5** — The remaining surface asks are delivered or closed with a reason: history types and improvements (#2179, #3912), receive-screen display (#3072, #4041), background transaction warnings (#3551), PSP transfer weight (#3863), and deep-link initialization (#4432).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 2648` `3573` `4093` `3969` `2712` → state |
| AC-2 | `gh issue view 2618` → state |
| AC-3 | `gh issue view 3952` → state · manual: force a transfer failure, read the message |
| AC-4 | `gh issue view 1549` `1922` `2541` → state |
| AC-5 | `gh issue view 2179` `3912` `3072` `4041` `3551` `3863` `4432` → state |

## Cross-references

- [Epic EPIC-8](../epics/EPIC-8.md) · [US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md) · [US-8.14](US-8.14-send-fund-form-and-recipient-validation.md) · [US-8.16](US-8.16-evm-fee-and-gas-estimation.md) · [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
