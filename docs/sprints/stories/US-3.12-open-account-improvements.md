---
id: US-3.12
title: "Open account improvements"
epic: EPIC-3
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

The account work that is asked for and not delivered — spread across import, export, unified account,
QR and reset — that no shipped capability story can carry without becoming a mix of done and open
rows.

## Status

> **🚧 in-progress — nothing here has shipped.** All 29 rows below are **open on the tracker**. No
> acceptance criterion is ticked, and `commit`, `sprint` and `version_shipped` stay empty until work
> lands in a release.

## Scope

This is the **open catch-all** for EPIC-3. Every capability and maintenance story in this epic that is
`done` shed its open rows here, because a `done` story may not carry an open row
([AGENTS.md](../../../AGENTS.md) rule 9). The rows come from many themes — import, export, unified
account, QR, reset account — and are held together only by being unfinished.

It materializes **no FR**. Two of these rows are the open ends of duplicated requests whose closed
halves are already folded: #3213 (*"import Substrate account by private key"*, the still-open twin of
#1142 in [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)) and #661 (Web3Auth social
recovery, the one live thread of [US-3.8](US-3.8-account-recovery-identity-roadmap.md)). The open
umbrella [#4205](https://github.com/Koniverse/SubWallet-Extension/issues/4205) is owned by
[EPIC-3](../epics/EPIC-3.md), not this story ([AGENTS.md](../../../AGENTS.md) rule 10); its open
children (#4206, #3811, #3337) are rows here.

## Incremental work, fixes & chores

**29 tracker issues**, all open.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#661](https://github.com/Koniverse/SubWallet-Extension/issues/661) | Integrate with Web3 Auth solution => Users can manage their wallets with social accounts | 📋 backlog |
| — | [#966](https://github.com/Koniverse/SubWallet-Extension/issues/966) | Integrate the phishing website/account list flagged by Polkadot Alliance | 📋 backlog |
| — | [#1408](https://github.com/Koniverse/SubWallet-Extension/issues/1408) | Do not select image on the Scan QR screen when user standing on popup view on the Firefox browser | 📋 backlog |
| — | [#2297](https://github.com/Koniverse/SubWallet-Extension/issues/2297) | Do not show popup import/attach account | 📋 backlog |
| — | [#2338](https://github.com/Koniverse/SubWallet-Extension/issues/2338) | Enable swiping functionality for item selection in the account selector on the mobile screen of the web app | 📋 backlog |
| — | [#2702](https://github.com/Koniverse/SubWallet-Extension/issues/2702) | WebApp - Show incorrect token in case the wallet has only 1 account type | 📋 backlog |
| — | [#2720](https://github.com/Koniverse/SubWallet-Extension/issues/2720) | Export all data | 📋 backlog |
| — | [#2887](https://github.com/Koniverse/SubWallet-Extension/issues/2887) | Extension - Improve UI for export all account | 📋 backlog |
| — | [#3106](https://github.com/Koniverse/SubWallet-Extension/issues/3106) | Extension - Still show QR code when change from specific account to All accounts mode | 📋 backlog |
| — | [#3213](https://github.com/Koniverse/SubWallet-Extension/issues/3213) | Support import Substrate account by private key | 📋 backlog |
| — | [#3337](https://github.com/Koniverse/SubWallet-Extension/issues/3337) | Extension - Handle case when create account on Firefox | 📋 backlog |
| — | [#3638](https://github.com/Koniverse/SubWallet-Extension/issues/3638) | Unified account - Improve UI with feedback | 📋 backlog |
| — | [#3644](https://github.com/Koniverse/SubWallet-Extension/issues/3644) | Unified account - Improve Change Wallet address for TON feature | 📋 backlog |
| — | [#3811](https://github.com/Koniverse/SubWallet-Extension/issues/3811) | Extension - Bug related Unified account on Firefox browser | 📋 backlog |
| — | [#3907](https://github.com/Koniverse/SubWallet-Extension/issues/3907) | Invalid bip39 mnemonic specified | 📋 backlog |
| — | [#3968](https://github.com/Koniverse/SubWallet-Extension/issues/3968) | WebApp - Wallet account injection feature (related to unified account feature) | 🚧 in-progress |
| — | [#4040](https://github.com/Koniverse/SubWallet-Extension/issues/4040) | Extension - Re-display the duplicate account name popup on Tokens screen even though have already manipulated that popup | 📋 backlog |
| — | [#4206](https://github.com/Koniverse/SubWallet-Extension/issues/4206) | Extension - Verify the latest Unified Accounts build on Firefox | 👀 review |
| — | [#4218](https://github.com/Koniverse/SubWallet-Extension/issues/4218) | Extension - Fix some bugs for reset account/eraser all features | 📋 backlog |
| — | [#4270](https://github.com/Koniverse/SubWallet-Extension/issues/4270) | Extension - Added support for export method for Unified accounts | 📋 backlog |
| — | [#4630](https://github.com/Koniverse/SubWallet-Extension/issues/4630) | Extension - Error can't derive F2 TON solo account | 🟡 ready |
| — | [#4862](https://github.com/Koniverse/SubWallet-Extension/issues/4862) | Extension - “Invalid QR Code” When Importing Account via QR | 📋 backlog |
| — | [#4893](https://github.com/Koniverse/SubWallet-Extension/issues/4893) | Extension - Bug about migrating to unified account | 📋 backlog |
| — | [#4978](https://github.com/Koniverse/SubWallet-Extension/issues/4978) | Extension - Bug about export account when account is imported from json file and normal account | 📋 backlog |
| — | [#46](https://github.com/Koniverse/SubWallet-Extension/issues/46) | DAO Fi features: Payroll, Contact | 📋 backlog |
| — | [#1765](https://github.com/Koniverse/SubWallet-Extension/issues/1765) | Need to show a message to the user in case of copied the address when clicking on the avatar | 📋 backlog |
| — | [#3928](https://github.com/Koniverse/SubWallet-Extension/issues/3928) | Extension - Change TON version but address does not update after successful change | 📋 backlog |
| — | [#4070](https://github.com/Koniverse/SubWallet-Extension/issues/4070) | Extension - Improve Unified address format | 📋 backlog |
| — | [#4327](https://github.com/Koniverse/SubWallet-Extension/issues/4327) | WebApp - Update link for "Contact support" | 📋 backlog |

> **+5 open rows recovered from the Uncategorized ledger** (2026-07-24).

> **Unified account is the largest open theme** — #3638, #3644, #3811, #4206, #4270, #4893 and the
> Firefox thread behind umbrella #4205 are the tail of the same programme that shipped
> [US-3.5](US-3.5-the-unified-account-model.md): a feature this large keeps generating follow-ups
> after its headline lands. The rest are one-offs — reset account (#4218), export edge cases (#2720,
> #2887, #4978), an invalid-QR import (#4862), a bad-mnemonic guard (#3907).

## Acceptance criteria

- [ ] **AC-1** — Every row above is open on the tracker (not `CLOSED`); none claims a `version_shipped`.
- [ ] **AC-2** — When any row ships, it moves to the capability story that owns its behaviour and leaves this list.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 4270` `4630` `4893` → OPEN |
| AC-2 | Manual: on each release, re-home any row that shipped into its capability story |

## Cross-references

- [Epic EPIC-3](../epics/EPIC-3.md) · [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md) · [US-3.5](US-3.5-the-unified-account-model.md) · [US-3.8](US-3.8-account-recovery-identity-roadmap.md) · [consolidation note](../../notes/2026-07-24.md#c-epic-23-maintenance--account-merged-into-epic-3)
