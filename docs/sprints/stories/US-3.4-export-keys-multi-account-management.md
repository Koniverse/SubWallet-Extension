---
id: US-3.4
title: "Export keys & multi-account management"
epic: EPIC-3
status: done
priority: P1
points: 3
sprint: sprint-2023-M03
version_shipped: 1.0.1
prd_ref: [FR-19, FR-20]
arch_ref: [AD-04]
depends_on: [US-3.1, US-3.2, US-2.1]
assignee: S2kael
commit: a3312aa1ae, d5aff956e3, cc1240280e
created: 2026-06-11
updated: 2026-06-11
---

## Goal

A user can recover their own keys (export seed phrase and private key from
settings) and run several named accounts inside one wallet instance — so that
they keep an exit path for their funds and can organize personal, trading, and
shared addresses without spinning up separate wallets.

## Status

> **✅ done — shipped in 1.0.1.** All 4 acceptance criteria are ticked and the 61 rows below are
> settled: 54 delivered, 7 closed without shipping. **This is the largest story in the epic** —
> day-to-day account management is where a wallet lives after onboarding.

## Background

This story owns the two day-to-day management capabilities that bracket the
import stories:

- **Export ([FR-19](../../PRD.md#functional-requirements))** — reveal the seed phrase and private key
  from settings. This is the one place secret bytes are *deliberately* surfaced,
  so it is the most security-sensitive flow in the epic: the reveal is gated by
  the master password ([FR-53](../../PRD.md#functional-requirements), owned by EPIC-5) and the bytes are
  produced **only in the background keyring**
  ([AD-04](../../ARCHITECTURE.md#architecture-decisions)) and handed to the
  reveal UI under that gate — never broadcast on the `pri(…)`/`pub(…)` bus, the
  "no key on the message bus" invariant from [EPIC-3](../epics/EPIC-3.md).
- **Multi-account management ([FR-20](../../PRD.md#functional-requirements))** — create, name/rename, and
  switch between multiple accounts within a single wallet instance; the active
  account drives the rest of the UI.

Materializes [FR-19](../../PRD.md#functional-requirements) and [FR-20](../../PRD.md#functional-requirements). **Retroactive** —
both already ship; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** an unlocked wallet, **When** the user requests an
  export and re-enters the correct master password, **Then** the seed phrase /
  private key is revealed (produced in the background, AD-04) and is never
  emitted on the message bus.
- [x] **AC-2** — **Given** an export request, **When** the user enters the
  **wrong** master password, **Then** the secret is not revealed and a clear
  error is shown (no reveal-without-gate path).
- [x] **AC-3** — **Given** a wallet with several accounts, **When** the user
  creates, renames, and switches accounts, **Then** each account keeps its own
  name and the active account drives the rest of the UI.
- [x] **AC-4** — **Given** a multi-account wallet, **When** an account is
  removed, **Then** only that account is removed and the remaining accounts and
  the wallet itself are unaffected.

## Tasks

- [x] **TASK-3.4.1** — Export seed phrase + private key, master-password-gated (AC: 1, 2)
  - [x] Produce secret in background keyring; assert nothing on the `pri(…)`/`pub(…)` bus.
- [x] **TASK-3.4.2** — Wrong-password rejection on export (AC: 2)
- [x] **TASK-3.4.3** — Multi-account create / rename / switch (AC: 3)
- [x] **TASK-3.4.4** — Account removal isolation (AC: 4)

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — export bytes are
  produced in the background and surfaced only under the master-password gate;
  the keyring stays the sole holder of secrets.
- Master-password gate ([FR-53](../../PRD.md#functional-requirements)) is **owned by EPIC-5**; this story
  consumes it for the export reveal, it does not define or weaken it.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md) /
  [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md) — exports the
  secrets those stories landed; manages the accounts they created.
- Builds on US-2.1 (keyring engine) — reuses the background secret-retrieval
  path.
- Sibling [US-3.3](US-3.3-import-account-via-json-qr-trust-wallet.md) — the JSON
  keystore export format is the inverse of keystore import; coordinate the
  format.

### References

- [Source: PRD FR-19](../../PRD.md#functional-requirements) — export seed phrase and private key
- [Source: PRD FR-20](../../PRD.md#functional-requirements) — manage multiple named accounts
- [Source: PRD FR-53](../../PRD.md#functional-requirements) — master password gate (owned by EPIC-5)
- [Source: ARCHITECTURE AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to background

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: unlock → export → re-enter correct password → secret revealed; keyring test asserts no secret on the bus |
| AC-2 | Manual: export with wrong master password → reveal blocked, error shown |
| AC-3 | Manual: create / rename / switch accounts → names persist, active account drives UI |
| AC-4 | Manual: remove one account → others and wallet unaffected |

## Changelog entry

### Added
- Export seed phrase and private key from settings (master-password-gated,
  background-produced).
- Multi-account management: create, rename, switch, and remove named accounts
  within a single wallet instance.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`,
`version_shipped` and any implementation caveats during version reconciliation._

## Incremental work, fixes & chores

**61 tracker issues** landed on export and multi-account management — 33 with a release, 21
delivered with no line naming them, 7 closed without shipping. Folded in from the former
one-issue-per-story maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.1 | [#68](https://github.com/Koniverse/SubWallet-Extension/issues/68) | Avatar All Account does not update when changing from collapse (popup) | ✅ done |
| 0.3.4 | [#115](https://github.com/Koniverse/SubWallet-Extension/issues/115) | Does not automatically turn off Forget Account screen | ✅ done |
| 0.4.1 | [#191](https://github.com/Koniverse/SubWallet-Extension/issues/191) | Update default avatar for all account | ✅ done |
| 0.5.2 | [#145](https://github.com/Koniverse/SubWallet-Extension/issues/145) | Account Balance still gets calculating from test net | ✅ done |
| 0.5.2 | [#336](https://github.com/Koniverse/SubWallet-Extension/issues/336) | Copy Account address although don't click copy address button when user click on Manage Account icon | ✅ done |
| 0.5.2 | [#354](https://github.com/Koniverse/SubWallet-Extension/issues/354) | Do not showing Avatar account | ✅ done |
| 0.5.2 | [#425](https://github.com/Koniverse/SubWallet-Extension/issues/425) | Add select acc screen when user in All Account mode to show address | ✅ done |
| 0.6.7 | [#709](https://github.com/Koniverse/SubWallet-Extension/issues/709) | Support export account via QR | ✅ done |
| 0.7.2 | [#372](https://github.com/Koniverse/SubWallet-Extension/issues/372) | The sort order of the account list is not fixed | ✅ done |
| 0.7.4 | [#885](https://github.com/Koniverse/SubWallet-Extension/issues/885) | Do not show the Export account screen when visit it from the get wallet address screen | ✅ done |
| 1.1.2 | [#1350](https://github.com/Koniverse/SubWallet-Extension/issues/1350) | Polkadot and Kusama nominator controller accounts are being deprecated | ✅ done |
| 1.1.6 | [#1731](https://github.com/Koniverse/SubWallet-Extension/issues/1731) | Still show history of the removed account | ✅ done |
| 1.1.24 | [#2223](https://github.com/Koniverse/SubWallet-Extension/issues/2223) | Extension - Update neway to fetch history data of an account | ✅ done |
| 1.1.26 | [#2114](https://github.com/Koniverse/SubWallet-Extension/issues/2114) | Hover account to show copy button and QR code button | ✅ done |
| 1.1.27 | [#1781](https://github.com/Koniverse/SubWallet-Extension/issues/1781) | The "All Accounts" option is not showing first in the list of accounts in Firefox browser | ✅ done |
| 1.1.27 | [#2318](https://github.com/Koniverse/SubWallet-Extension/issues/2318) | Sort the Current account on top in the Account selector | ✅ done |
| 1.1.30 | [#2429](https://github.com/Koniverse/SubWallet-Extension/issues/2429) | Do not display the account in the account details tab in case the entire account balance is locked | ✅ done |
| 1.1.31 | [#2390](https://github.com/Koniverse/SubWallet-Extension/issues/2390) | Extension - Do not detect phishing page in case have no account in wallet | ✅ done |
| 1.1.39 | [#2616](https://github.com/Koniverse/SubWallet-Extension/issues/2616) | Extension - Show incorrect token in case the wallet has only 1 account type | ✅ done |
| 1.1.55 | [#2690](https://github.com/Koniverse/SubWallet-Extension/issues/2690) | [Extension] Add export multiple accounts | ✅ done |
| 1.1.55 | [#2819](https://github.com/Koniverse/SubWallet-Extension/issues/2819) | Extension - Implement UI for export multi-account | ✅ done |
| 1.1.68 | [#3090](https://github.com/Koniverse/SubWallet-Extension/issues/3090) | Extension -  Add highlight button Export multi account when navigate to select account screen | ✅ done |
| 1.2.1 | [#2709](https://github.com/Koniverse/SubWallet-Extension/issues/2709) | Extension - MV3 - Handle case displayed account with specific network | ✅ done |
| 1.2.1 | [#3117](https://github.com/Koniverse/SubWallet-Extension/issues/3117) | Extension - MV3 - Still show icon ZK mode on Export account screen in case upgrade version MV2 -> MV3 | ✅ done |
| 1.2.7 | [#3108](https://github.com/Koniverse/SubWallet-Extension/issues/3108) | Extension - Add highlight button Export multi account on Select account screen | ✅ done |
| 1.2.13 | [#3283](https://github.com/Koniverse/SubWallet-Extension/issues/3283) | Extension - Do not show account to get address when stand on All accounts mode | ✅ done |
| 1.2.22 | [#3148](https://github.com/Koniverse/SubWallet-Extension/issues/3148) | Extension - Re-check bug do not show root screen after remove account | ✅ done |
| 1.2.29 | [#2352](https://github.com/Koniverse/SubWallet-Extension/issues/2352) | Do not show token when standing on All accounts mode in case token does not get balance | ✅ done |
| 1.3.2 | [#3752](https://github.com/Koniverse/SubWallet-Extension/issues/3752) | Extension - Update address for TON testnet in the token detail screen on All accounts mode | ✅ done |
| 1.3.2 | [#3755](https://github.com/Koniverse/SubWallet-Extension/issues/3755) | Extension - Improve UI related to Account selector screen | ✅ done |
| 1.3.5 | [#3721](https://github.com/Koniverse/SubWallet-Extension/issues/3721) | Extension - Update icon loading when can't get balance on All account/Specific account mode | ✅ done |
| 1.3.56 | [#4620](https://github.com/Koniverse/SubWallet-Extension/issues/4620) | Extension - Error automatically adding suffix to account name | ✅ done |
| 1.3.61 | [#4735](https://github.com/Koniverse/SubWallet-Extension/issues/4735) | [Extension] Hide copy/QR content for relay chain addresses (AssetHub migration) | ✅ done |
| — | [#16](https://github.com/Koniverse/SubWallet-Extension/issues/16) | Show balance for all account in Wallet | ✅ done |
| — | [#53](https://github.com/Koniverse/SubWallet-Extension/issues/53) | [v0.2.8] Still showing Back to home button when switching tabs, Switch account | ✅ done |
| — | [#54](https://github.com/Koniverse/SubWallet-Extension/issues/54) | Don't navigate to Get Started screen when Forget account is out | ✅ done |
| — | [#56](https://github.com/Koniverse/SubWallet-Extension/issues/56) | Incorrect account information at Expand screen when switching account in popup screen | ✅ done |
| — | [#57](https://github.com/Koniverse/SubWallet-Extension/issues/57) | Automatically rename the account according to the previous switch account | ✅ done |
| — | [#78](https://github.com/Koniverse/SubWallet-Extension/issues/78) | Automatically rename EVM account after successful creation | ✅ done |
| — | [#84](https://github.com/Koniverse/SubWallet-Extension/issues/84) | Add custom avatar feature for All accounts | ✅ done |
| — | [#144](https://github.com/Koniverse/SubWallet-Extension/issues/144) | Master password for all account | ✅ done |
| — | [#278](https://github.com/Koniverse/SubWallet-Extension/issues/278) | Not showing SubWallet account on Polkadot.js.org/app | ✅ done |
| — | [#459](https://github.com/Koniverse/SubWallet-Extension/issues/459) | UX of current account with EVM Provider | ✅ done |
| — | [#463](https://github.com/Koniverse/SubWallet-Extension/issues/463) | Wrong balance with all accounts | ✅ done |
| — | [#483](https://github.com/Koniverse/SubWallet-Extension/issues/483) | Show this icon on All Accounts | ✅ done |
| — | [#572](https://github.com/Koniverse/SubWallet-Extension/issues/572) | Export Account via QR | ✅ done |
| — | [#1046](https://github.com/Koniverse/SubWallet-Extension/issues/1046) | Make Polkadot.js App like in a white list to support EVM Accounts | ✅ done |
| — | [#1211](https://github.com/Koniverse/SubWallet-Extension/issues/1211) | Incorrect total number of account in Manage website access screen when upgrade version | ✅ done |
| — | [#1230](https://github.com/Koniverse/SubWallet-Extension/issues/1230) | The list of accounts that can withdraw is incorrect when viewing in All accounts mode | ✅ done |
| — | [#1415](https://github.com/Koniverse/SubWallet-Extension/issues/1415) | Export message list | ✅ done |
| — | [#1574](https://github.com/Koniverse/SubWallet-Extension/issues/1574) | Still showing all tokens when in All accounts mode in case the wallet has only 1 account type | ⏸ deprecated |
| — | [#2244](https://github.com/Koniverse/SubWallet-Extension/issues/2244) | Recheck automatically activate tokens based on account balance (round 2) | ✅ done |
| — | [#2351](https://github.com/Koniverse/SubWallet-Extension/issues/2351) | Re-check case reload token list after remove account successfully | ✅ done |
| — | [#2376](https://github.com/Koniverse/SubWallet-Extension/issues/2376) | Unable to export account when input valid master password | ✅ done |
| — | [#2473](https://github.com/Koniverse/SubWallet-Extension/issues/2473) | Ui bug when account address is long | ⏸ deprecated |
| — | [#2750](https://github.com/Koniverse/SubWallet-Extension/issues/2750) | Extension - Implement UI for export all accounts feature | ⏸ deprecated |
| — | [#3399](https://github.com/Koniverse/SubWallet-Extension/issues/3399) | Fix bug do not show root screen after remove account (round 2) | ⏸ deprecated |
| — | [#3890](https://github.com/Koniverse/SubWallet-Extension/issues/3890) | Extension - Unable to open extension when update version in case wallet has multi-account | ⏸ deprecated |
| — | [#4147](https://github.com/Koniverse/SubWallet-Extension/issues/4147) | Extension - Error don't show token when perform Reset account | ⏸ deprecated |
| — | [#4670](https://github.com/Koniverse/SubWallet-Extension/issues/4670) | Extension - Improve filter account type by token support for that type in all features | ✅ done |
| — | [#4897](https://github.com/Koniverse/SubWallet-Extension/issues/4897) | Extension - No automatic history switching when changing accounts in The Global Account Switcher (at the top) | ⏸ deprecated |

> **"All accounts" mode alone is a third of this story.** #16, #68, #84, #191, #354, #425, #463,
> #483, #1230, #1574, #1781, #2352, #3721 — an aggregate view over N accounts breaks in ways a single
> account never does: wrong totals, missing avatars, stale balances, sort order that won't hold.
>
> **Export-multiple-accounts is its own multi-round programme:** #2690, #2819, #2845 (WebApp), #3090,
> #3108 — highlight the button, then the batch export behind it. And *"do not show root screen after
> remove account"* is filed twice — #3148, then #3399 (round 2, closed not-planned) — the classic
> shape of a navigation bug that a first fix doesn't fully close.

## Cross-references

- [PRD FR-19](../../PRD.md#functional-requirements), [PRD FR-20](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
- [consolidation note](../../notes/2026-07-24.md#c-epic-23-maintenance--account-merged-into-epic-3)
