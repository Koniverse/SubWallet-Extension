---
id: US-3.5
title: "The Unified Account model"
epic: EPIC-3
status: done
priority: P1
points: 8
sprint: sprint-2024-M10
version_shipped: 1.3.1
prd_ref: [FR-21, FR-22]
arch_ref: [AD-11, AD-12, AD-13, AD-14, AD-15]
depends_on: [US-3.1, US-3.2, US-2.1]
assignee: saltict
commit: 97de5d35e0008743a140074f7f11a6d59e420b85, 87901e2961ef9bbeee9f3381b1763f97aa96ad8a
created: 2026-06-11
updated: 2026-06-11
---

## Goal

A user holds **one seed** that simultaneously addresses all five ecosystems —
Substrate, EVM, Bitcoin, TON and Cardano — and can convert between the unified
view and per-chain "solo" accounts without ever touching a second seed or a
second backup. This is the core product promise: single seed, single backup,
every chain.

## Status

> **✅ done — shipped in 1.3.1.** All 4 acceptance criteria are ticked and the 59 rows below are
> settled: 54 delivered, 5 closed without shipping. **This is the second-largest story in the epic** —
> the Unified Account is the core product promise, and it cost the most to build. Its umbrella
> [#4184](https://github.com/Koniverse/SubWallet-Extension/issues/4184) is owned by
> [EPIC-3](../epics/EPIC-3.md) ([AGENTS.md](../../../AGENTS.md) rule 10).

## Background

The Unified Account is the spine of [EPIC-3](../epics/EPIC-3.md) — every other
account story (create, import, derive, export) produces or consumes it. This
story owns the model itself and the conversions across it:

- **Unified derivation ([FR-21](../../PRD.md#functional-requirements), AD-11)** — one seed phrase derives
  addresses for Substrate, EVM, Bitcoin, TON and Cardano at once. Each ecosystem
  carries its own per-chain model: Bitcoin's three address types (Legacy /
  SegWit / Taproot, [AD-12](../../ARCHITECTURE.md#architecture-decisions)), TON's
  selectable wallet-contract version
  ([AD-13](../../ARCHITECTURE.md#architecture-decisions)), Cardano's CIP-30 /
  CIP-26 model ([AD-14](../../ARCHITECTURE.md#architecture-decisions)), and the
  Bittensor/Substrate path ([AD-15](../../ARCHITECTURE.md#architecture-decisions))
  — all reproduced deterministically from the one seed
  ([NFR-18](../../PRD.md#non-functional-requirements)), with no server dependency.
- **Solo → Unified migration ([FR-22](../../PRD.md#functional-requirements))** — merge existing solo
  accounts that share the same underlying seed into a single unified account.
- **Unified → Solo split ([FR-23](../../PRD.md#functional-requirements))** — split a unified account back
  into per-chain solo accounts. **📋 Forward / planned** — FR-23 is `📋 planned`
  in the [PRD](../../PRD.md#functional-requirements); FR-21 and FR-22 already ship. This story is
  therefore **partly retroactive** (FR-21, FR-22 shipped) and **partly forward**
  (FR-23): the split direction is authored here for completeness but is not yet
  implemented.

All derivation and conversion happen **in the background keyring**
([AD-04](../../ARCHITECTURE.md#architecture-decisions)); no seed bytes cross to
the UI — the "no key on the message bus" invariant from the epic.

Materializes [FR-21](../../PRD.md#functional-requirements), [FR-22](../../PRD.md#functional-requirements) (shipped) and
[FR-23](../../PRD.md#functional-requirements) (forward). For the shipped parts, `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** one seed, **When** a unified account is materialized,
  **Then** correct addresses exist for Substrate, EVM, Bitcoin, TON and Cardano
  simultaneously (AD-11), each honoring its per-ecosystem model (AD-12/13/14/15).
- [x] **AC-2** — **Given** the same seed and derivation path on a fresh install,
  **When** the unified account is reproduced, **Then** the addresses are
  identical with no server dependency (NFR-18, deterministic derivation).
- [x] **AC-3** — **Given** several solo accounts that share one underlying seed,
  **When** the user merges them, **Then** a single unified account results and
  the prior solo entries are reconciled (FR-22).
- [x] **AC-4** — **Given** an attempt to merge solo accounts that do **not**
  share the same seed, **When** the user submits the merge, **Then** it is
  rejected with a clear error and no account is altered.

## Tasks

- [x] **TASK-3.5.1** — Unified derivation across all five ecosystems (AC: 1, 2)
  - [x] Honor per-ecosystem models AD-12 (BTC address types) / AD-13 (TON version) / AD-14 (Cardano) / AD-15 (Bittensor).
- [x] **TASK-3.5.2** — Deterministic-derivation verification on fresh install (AC: 2)
- [x] **TASK-3.5.3** — Solo → Unified merge (AC: 3, 4)
  - [x] Reject merges across mismatched seeds.

## Dev notes

### Architecture constraints

- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — one seed → unified
  multi-ecosystem account; both unified and solo accounts supported, with
  derivation between them. This story is the canonical owner of AD-11.
- [AD-12](../../ARCHITECTURE.md#architecture-decisions) /
  [AD-13](../../ARCHITECTURE.md#architecture-decisions) /
  [AD-14](../../ARCHITECTURE.md#architecture-decisions) /
  [AD-15](../../ARCHITECTURE.md#architecture-decisions) — each ecosystem's
  account model constrains how the unified seed materializes its addresses.
- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — all derivation /
  conversion happens in the background; no seed bytes on the bus.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md) /
  [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md) — those land
  the seed; this story owns the model they materialize into.
- Builds on US-2.1 (keyring engine) — derivation runs on the keyring substrate.
- Required by [US-3.7](US-3.7-account-derivation-custom-path-child-accounts.md) —
  child / custom-path derivation extends this model.

### What we explicitly did NOT do

- **Unified → Solo split (FR-23)** is authored as AC-5 / TASK-3.5.4 but **not
  implemented** — it is `📋 planned` in the PRD. Trigger to implement: the FR-23
  milestone is scheduled. The merge direction (FR-22) ships; the split direction
  does not yet.

### References

- [Source: PRD FR-21](../../PRD.md#functional-requirements) — Unified Account across five ecosystems
- [Source: PRD FR-22](../../PRD.md#functional-requirements) — Solo → Unified migration
- [Source: PRD FR-23](../../PRD.md#functional-requirements) — Unified → Solo split (planned)
- [Source: PRD NFR-18](../../PRD.md#non-functional-requirements) — deterministic account derivation
- [Source: ARCHITECTURE AD-11](../../ARCHITECTURE.md#architecture-decisions) — unified multi-chain account model
- [Source: ARCHITECTURE AD-12/13/14/15](../../ARCHITECTURE.md#architecture-decisions) — per-ecosystem models
- [Source: CONTEXT D37](../../CONTEXT.md) — Unified Account model

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: create/import a unified account → addresses present for Substrate/EVM/BTC/TON/Cardano, each per its model |
| AC-2 | Manual: reproduce the account from the same seed on a fresh install → addresses identical |
| AC-3 | Manual: merge solo accounts sharing one seed → single unified account |
| AC-4 | Unit test: merge across mismatched seeds → rejected, no account altered |
| AC-5 | _(forward — FR-23)_ Not yet runnable; defended when split ships |

## Changelog entry

### Added
- Unified Account model: one seed derives Substrate / EVM / Bitcoin / TON /
  Cardano addresses simultaneously, honoring each ecosystem's per-chain model.
- Solo → Unified migration (merge same-seed solo accounts into a unified
  account).

### Changed
- _(planned, FR-23)_ Unified → Solo split — authored, pending implementation.

**Commit**:

## Implementation notes

_FR-21 and FR-22 are retroactive — already shipped; fill `commit` /
`version_shipped` during version reconciliation. FR-23 (Unified → Solo split) is
forward / planned — implement and verify AC-5 when the milestone is scheduled._

**Scope correction (2026-07-13, US-21.2):** this story originally carried a *forward*
AC-5 / TASK-3.5.4 for the **unified → solo split** (FR-23), left unticked on purpose.
The batch backfill ticked every open AC when it flipped the story to `done`, which
silently turned FR-23 into `✅ shipped` in the PRD — it is not: at v1.3.82 the keyring
service has no split surface at all. The forward scope now lives in
[US-3.9](US-3.9-unified-to-solo-account-split.md) and FR-23 is back to `📋 planned`.
This story is `done` for what it actually shipped: the unified model (FR-21) and the
solo → unified merge (FR-22).

## Incremental work, fixes & chores

**59 tracker issues** landed on the Unified Account model — 38 with a release, 16 delivered with no
line naming them, 5 closed without shipping. Folded in from the former one-issue-per-story
maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.5.3 | [#223](https://github.com/Koniverse/SubWallet-Extension/issues/223) | Integrate CLV EVM accounts and assets | ✅ done |
| 1.2.22 | [#3054](https://github.com/Koniverse/SubWallet-Extension/issues/3054) | Extension - Show blank screen when attach account | ✅ done |
| 1.2.31 | [#3643](https://github.com/Koniverse/SubWallet-Extension/issues/3643) | Extension - Can't import JSON file(from Unified account) on store version | ✅ done |
| 1.3.1 | [#3396](https://github.com/Koniverse/SubWallet-Extension/issues/3396) | Update UI to support unified account | ✅ done |
| 1.3.1 | [#3457](https://github.com/Koniverse/SubWallet-Extension/issues/3457) | Fix UI bugs for Unified account | ✅ done |
| 1.3.1 | [#3462](https://github.com/Koniverse/SubWallet-Extension/issues/3462) | Unified account - Filter chains, tokens and features for account types | ✅ done |
| 1.3.1 | [#3472](https://github.com/Koniverse/SubWallet-Extension/issues/3472) | [Unified-Account] Add logic search account on address input | ✅ done |
| 1.3.1 | [#3485](https://github.com/Koniverse/SubWallet-Extension/issues/3485) | Unified account  - Update export/import logic | ✅ done |
| 1.3.1 | [#3496](https://github.com/Koniverse/SubWallet-Extension/issues/3496) | Fix UI bugs for Unified account (round 2) | ✅ done |
| 1.3.1 | [#3505](https://github.com/Koniverse/SubWallet-Extension/issues/3505) | Unified account - Add validate unique for Account Name | ✅ done |
| 1.3.1 | [#3512](https://github.com/Koniverse/SubWallet-Extension/issues/3512) | Unified-account - Add feature to switch WalletContract version for ton | ✅ done |
| 1.3.1 | [#3524](https://github.com/Koniverse/SubWallet-Extension/issues/3524) | Unified account - Update Address Input component | ✅ done |
| 1.3.1 | [#3526](https://github.com/Koniverse/SubWallet-Extension/issues/3526) | Unified account - Update export/import UI | ✅ done |
| 1.3.1 | [#3528](https://github.com/Koniverse/SubWallet-Extension/issues/3528) | Unified account - Fix bug validating recipient address | ✅ done |
| 1.3.1 | [#3534](https://github.com/Koniverse/SubWallet-Extension/issues/3534) | Unified account - Implement advanced address detection | ✅ done |
| 1.3.1 | [#3549](https://github.com/Koniverse/SubWallet-Extension/issues/3549) | Unified account - Fix bug releated to Import/Export account | ✅ done |
| 1.3.1 | [#3556](https://github.com/Koniverse/SubWallet-Extension/issues/3556) | Unified account - Implement Customize derivation path feature | ✅ done |
| 1.3.1 | [#3565](https://github.com/Koniverse/SubWallet-Extension/issues/3565) | Unified account - Update the latest code | ✅ done |
| 1.3.1 | [#3570](https://github.com/Koniverse/SubWallet-Extension/issues/3570) | Unified account - Fix some UI bugs | ✅ done |
| 1.3.1 | [#3581](https://github.com/Koniverse/SubWallet-Extension/issues/3581) | Unified account - Improve auto-add suffix for duplicate account name (SubWallet add suffix) in case upgrade version | ✅ done |
| 1.3.1 | [#3593](https://github.com/Koniverse/SubWallet-Extension/issues/3593) | Unified account - Update UI for import account feature | ✅ done |
| 1.3.1 | [#3604](https://github.com/Koniverse/SubWallet-Extension/issues/3604) | Unified account - Update content | ✅ done |
| 1.3.1 | [#3610](https://github.com/Koniverse/SubWallet-Extension/issues/3610) | Unified account - Support save contact for TON address | ✅ done |
| 1.3.1 | [#3642](https://github.com/Koniverse/SubWallet-Extension/issues/3642) | Unified account - Update content for some features | ✅ done |
| 1.3.1 | [#3686](https://github.com/Koniverse/SubWallet-Extension/issues/3686) | Unified account - Improve some UI phrase 1 | ✅ done |
| 1.3.1 | [#3696](https://github.com/Koniverse/SubWallet-Extension/issues/3696) | Unified account - Show derivation information for derived account | ✅ done |
| 1.3.1 | [#3700](https://github.com/Koniverse/SubWallet-Extension/issues/3700) | Unified account - Update for TON account | ✅ done |
| 1.3.1 | [#3701](https://github.com/Koniverse/SubWallet-Extension/issues/3701) | Unified account - Do not update address when change Address version for TON Solo account | ✅ done |
| 1.3.23 | [#3926](https://github.com/Koniverse/SubWallet-Extension/issues/3926) | Implement account migration for Unified account | ✅ done |
| 1.3.23 | [#3927](https://github.com/Koniverse/SubWallet-Extension/issues/3927) | Fix UI bug for Cardano unified account | ✅ done |
| 1.3.42 | [#4094](https://github.com/Koniverse/SubWallet-Extension/issues/4094) | Extension - Improvements unified account after Bitcoin supported | ✅ done |
| 1.3.42 | [#4168](https://github.com/Koniverse/SubWallet-Extension/issues/4168) | Support Bitcoin account | ✅ done |
| 1.3.42 | [#4200](https://github.com/Koniverse/SubWallet-Extension/issues/4200) | Support Bitcoin for new unified account | ✅ done |
| 1.3.42 | [#4201](https://github.com/Koniverse/SubWallet-Extension/issues/4201) | Migrate unifed account to support Bitcoin | ✅ done |
| 1.3.42 | [#4228](https://github.com/Koniverse/SubWallet-Extension/issues/4228) | Support watch-only account for Bitcoin | ✅ done |
| 1.3.42 | [#4261](https://github.com/Koniverse/SubWallet-Extension/issues/4261) | Extension - Support bitcoin derivation with unified account | ✅ done |
| 1.3.42 | [#4262](https://github.com/Koniverse/SubWallet-Extension/issues/4262) | Extension - Support import/export Bitcoin account | ✅ done |
| 1.3.53 | [#4031](https://github.com/Koniverse/SubWallet-Extension/issues/4031) | Extension - Can't import JSON file(from Migrate account) on store version | ✅ done |
| — | [#937](https://github.com/Koniverse/SubWallet-Extension/issues/937) | Allow custom path when deriving account after implementing master account feature | ⏸ deprecated |
| — | [#1206](https://github.com/Koniverse/SubWallet-Extension/issues/1206) | Support master account | ✅ done |
| — | [#2398](https://github.com/Koniverse/SubWallet-Extension/issues/2398) | Keyring for Bitcoin | ✅ done |
| — | [#3022](https://github.com/Koniverse/SubWallet-Extension/issues/3022) | Block attach account Polkadot vault for network Moonbeam, Moonriver, Moonbase | ⏸ deprecated |
| — | [#3395](https://github.com/Koniverse/SubWallet-Extension/issues/3395) | Integrate unified account | ✅ done |
| — | [#3509](https://github.com/Koniverse/SubWallet-Extension/issues/3509) | Unified account - Add logic to choose account type (unified/solo) when import by seed phrase (discuss more for UX) | ✅ done |
| — | [#3510](https://github.com/Koniverse/SubWallet-Extension/issues/3510) | Checklist and Testing for Unified account: Create, Import... | ⏸ deprecated |
| — | [#3548](https://github.com/Koniverse/SubWallet-Extension/issues/3548) | Unified account - Review performance in app | ✅ done |
| — | [#3592](https://github.com/Koniverse/SubWallet-Extension/issues/3592) | Unified account - Can't export multi account | ✅ done |
| — | [#3667](https://github.com/Koniverse/SubWallet-Extension/issues/3667) | Unified account - Show avatar for address with TON token | ✅ done |
| — | [#3677](https://github.com/Koniverse/SubWallet-Extension/issues/3677) | Unified account - Update the latest code (v1.2.30) | ✅ done |
| — | [#3704](https://github.com/Koniverse/SubWallet-Extension/issues/3704) | Unified account - Improve derive account feature | ✅ done |
| — | [#3706](https://github.com/Koniverse/SubWallet-Extension/issues/3706) | Unified account - Update the latest code v1.2.31 | ✅ done |
| — | [#3715](https://github.com/Koniverse/SubWallet-Extension/issues/3715) | Migrate unified account feature | ⏸ deprecated |
| — | [#3727](https://github.com/Koniverse/SubWallet-Extension/issues/3727) | Unified account - Final test for features related to account | ✅ done |
| — | [#3728](https://github.com/Koniverse/SubWallet-Extension/issues/3728) | Unified account - Final test some features | ✅ done |
| — | [#3729](https://github.com/Koniverse/SubWallet-Extension/issues/3729) | Unified account - Update the latest code v1.2.32 | ✅ done |
| — | [#3759](https://github.com/Koniverse/SubWallet-Extension/issues/3759) | Extension - Retest unified account on Firefox browser | ✅ done |
| — | [#3844](https://github.com/Koniverse/SubWallet-Extension/issues/3844) | Update BA doc for Unified account | ✅ done |
| — | [#3978](https://github.com/Koniverse/SubWallet-Extension/issues/3978) | Re-check performance for migrate account features | ⏸ deprecated |
| — | [#4558](https://github.com/Koniverse/SubWallet-Extension/issues/4558) | Unable to show balance for Cardano account | ✅ done |

> **#4184 "Develop Unified Account Feature" is the single largest programme in the account history.**
> It has 54 children and no CHANGELOG line of its own, so it is epic-owned, not a row
> ([AGENTS.md](../../../AGENTS.md) rule 10); **34 of its children land here** as the *"Unified account — …"* rounds
> through v1.2.30–1.2.32 (#3395 … #3729), including three *"Update the latest code vX"* checkpoints
> (#3565, #3677, #3706) — a feature large enough that keeping the branch current was itself tracked
> work.
>
> **Bitcoin arrived as its own sub-programme under #4168**, which *does* keep its row — it has a
> CHANGELOG line (1.3.42), so unlike #4184 it delivered a headline capability, then its children
> filled it in: #4200, #4201, #4228 (watch-only), #4261 (derivation), #4262 (import/export), #4094
> (post-Bitcoin cleanup). One seed addressing five ecosystems is the promise; five ecosystems is also
> five times the maintenance.

## Cross-references

- [PRD FR-21](../../PRD.md#functional-requirements), [PRD FR-22](../../PRD.md#functional-requirements), [PRD FR-23](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
- [consolidation note](../../notes/2026-07-24.md#c-epic-23-maintenance--account-merged-into-epic-3)
