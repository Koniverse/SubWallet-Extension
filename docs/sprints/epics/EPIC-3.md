---
id: EPIC-3
title: "account"
status: in-progress
prd_ref:
  - FR-13
  - FR-14
  - FR-15
  - FR-16
  - FR-17
  - FR-18
  - FR-19
  - FR-20
  - FR-21
  - FR-22
  - FR-23
  - FR-24
  - FR-25
  - FR-26
  - FR-27
  - FR-28
  - FR-29
  - FR-30
arch_ref:
  - AD-11
  - AD-04
  - AD-12
  - AD-13
  - AD-14
  - AD-15
created: 2026-06-11
updated: 2026-06-11
---

## Goal

Accounts are the wallet's foundation — every other feature acts on them, and the
one-seed-many-chains **Unified Account** is the core product promise. This epic
owns how keys **enter** (create / import), are **organized & derived**, and
**leave** (export) the wallet.

## Overview

### Business context

Before this epic there is no wallet: nothing in the product works until an
account exists. EPIC-3 owns the **account identity path** — creation, the five
import formats, the Unified Account model that derives one seed into Substrate /
EVM / Bitcoin / TON / Cardano addresses (AD-11, with the per-ecosystem models
AD-12/13/14/15), day-to-day management/derivation, and a planned
recovery/identity roadmap.

All key material is created, parsed and stored **only in the background keyring**
(AD-04) — the non-custodial boundary every story here must hold. The epic owns
*identity*, not *authorization* or *money movement*: the master-password / lock
policy belongs to EPIC-5 (security) and signing/submission to EPIC-8
(transaction) + EPIC-2 (core-platform engines).

> FR statuses below are **story-planning** statuses (Stream B; all `📋 backlog`).
> The real shipped state of each capability lives in [PRD](../../PRD.md) — most
> of EPIC-3 is `✅ shipped` there; `done` + `version_shipped` are backfilled in
> version reconciliation.

### Out of scope

- **Master password, auto-lock, unlock policy** — owned by [EPIC-5](EPIC-5.md) (security). Accounts *use* it; they don't define it.
- **Transaction signing & submission** — owned by [EPIC-8](EPIC-8.md) + [EPIC-2](EPIC-2.md). This epic creates keys; it does not move funds.
- **Hardware-wallet accounts** — owned by [EPIC-16](EPIC-16.md). Those keys live on a device, not in the keyring.
- **Proxy / multisig account types** — owned by [EPIC-17](EPIC-17.md) / [EPIC-18](EPIC-18.md).

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-13 | [US-3.1](../stories/US-3.1-create-a-new-wallet-via-seed-phrase.md) | 📋 backlog |
| FR-14 | [US-3.2](../stories/US-3.2-import-account-via-seed-phrase-or-private-key.md) | 📋 backlog |
| FR-15 | [US-3.2](../stories/US-3.2-import-account-via-seed-phrase-or-private-key.md) | 📋 backlog |
| FR-16 | US-3.3 _(planned)_ | 📋 backlog |
| FR-17 | US-3.3 _(planned)_ | 📋 backlog |
| FR-18 | US-3.3 _(planned)_ | 📋 backlog |
| FR-19 | US-3.4 _(planned)_ | 📋 backlog |
| FR-20 | US-3.4 _(planned)_ | 📋 backlog |
| FR-21 | US-3.5 _(planned)_ | 📋 backlog |
| FR-22 | US-3.5 _(planned)_ | 📋 backlog |
| FR-23 | US-3.5 _(planned)_ | 📋 backlog |
| FR-24 | US-3.6 _(planned)_ | 📋 backlog |
| FR-25 | US-3.6 _(planned)_ | 📋 backlog |
| FR-26 | US-3.7 _(planned)_ | 📋 backlog |
| FR-27 | US-3.7 _(planned)_ | 📋 backlog |
| FR-28 | US-3.8 _(planned)_ | 📋 backlog |
| FR-29 | US-3.8 _(planned)_ | 📋 backlog |
| FR-30 | US-3.8 _(planned)_ | 📋 backlog |

> Every FR is assigned a story ID up front (FR order) so numbering is locked — no
> renumber later. Links = file exists (illustrative examples); `(planned)` = ID
> reserved, file authored when scheduled.

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-3.1](../stories/US-3.1-create-a-new-wallet-via-seed-phrase.md) | Create a new wallet via seed phrase | Generate seed + master password + backup → a Unified Account | 📋 backlog | — |
| [US-3.2](../stories/US-3.2-import-account-via-seed-phrase-or-private-key.md) | Import account via seed phrase or private key | Bring an account in by seed (→ unified) or private key (→ solo) | 📋 backlog | — |
| US-3.3 | Import account via JSON / QR / Trust Wallet | The remaining import formats | 📋 backlog | — |
| US-3.4 | Export keys & multi-account management | Export seed/key; manage multiple named accounts | 📋 backlog | — |
| US-3.5 | The Unified Account model | One seed → five ecosystems + solo↔unified | 📋 backlog | — |
| US-3.6 | Watch-only accounts & address book | Read-only monitoring + saved recipients | 📋 backlog | — |
| US-3.7 | Account derivation: custom path & child accounts | Custom + auto-index derived accounts | 📋 backlog | — |
| US-3.8 | Account recovery & identity (roadmap) | Social recovery, session keys, DID (planned) | 📋 backlog | — |

> 2 illustrative example stories have files (US-3.1, US-3.2); US-3.3–3.8 are
> numbered here and authored when scheduled — sizes follow scope.

## Cross-cutting invariants

- **Key isolation ([FR-13](../../PRD.md), AD-04):** no story may surface seed or
  private-key bytes to the UI or inject scripts; creation/import/export all parse
  and store secrets in the background. Enforced per-story by a "no key on the
  message bus" check.
- **Deterministic derivation (AD-11, [NFR-18](../../PRD.md)):** unified and
  derived (child / custom-path) addresses are reproducible from the same seed with
  no server dependency — the basis of the single-seed/single-backup guarantee.
- **Master-password gate ([FR-53](../../PRD.md), owned by EPIC-5):** every secret
  reveal/export is gated by the master password; this epic consumes that gate, it
  does not weaken it.

## Acceptance criteria (propagated from stories)

- [ ] A new wallet can be created (seed + master password + mandatory backup) and
      yields one Unified Account across five ecosystems — [US-3.1](../stories/US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [ ] An existing account can be imported by seed phrase (→ unified) or private
      key (→ solo) with validation and error states — [US-3.2](../stories/US-3.2-import-account-via-seed-phrase-or-private-key.md)
- [ ] _(pending stories for FR-16–30 — the remaining import formats, account
      management/derivation, and the recovery/identity roadmap)_
