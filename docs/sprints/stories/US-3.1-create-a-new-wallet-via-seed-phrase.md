---
id: US-3.1
title: "Create a new wallet via seed phrase"
epic: EPIC-3
status: done
priority: P0
points: 3
sprint:
version_shipped: 0.2.1
prd_ref: [FR-13]
arch_ref: [AD-04, AD-11]
depends_on:
assignee: jacogr
commit: 0b6bcd2bb9, f5a00988b0, 1e96fdce1d
created: 2026-06-11
updated: 2026-06-11
---

## Goal

A first-time user can create a brand-new self-custodial wallet in one guided
flow — generate a 12/24-word seed, set a master password, confirm the backup —
so that they immediately hold addresses across all five ecosystems from a single
seed only they control.

## Background

This is the top of the activation funnel and the first place the non-custodial
guarantee is exercised. Seed entropy is generated inside the background keyring
([AD-04](../../ARCHITECTURE.md#architecture-decisions)) and never crosses to the
UI or inject scripts; the resulting seed is materialized straight into a
**Unified Account** ([AD-11](../../ARCHITECTURE.md#architecture-decisions)) so the
user is not asked to set up each chain. The master password
([FR-53](../../PRD.md#functional-requirements)) wraps the key at rest and is **non-recoverable by design**
(reset = wipe), which is why backup confirmation is a mandatory gate, not a
skippable nicety.

Materializes [FR-13](../../PRD.md#functional-requirements). Sibling onboarding story:
[US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md) (import an
existing account). This story is **retroactive** — the capability already ships
in the product; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a fresh install, **When** the user chooses "Create new
  wallet", **Then** a 12/24-word mnemonic is generated **in the background** and
  no seed bytes appear in any UI/inject message (AD-04).
- [x] **AC-2** — **Given** a generated seed, **When** the user sets a master
  password that meets the strength policy (FR-53), **Then** the key is encrypted
  at rest (NFR-3) and the wallet subsequently unlocks only with that password.
- [x] **AC-3** — **Given** the backup-confirmation step, **When** the user has not
  correctly re-entered the seed words, **Then** wallet creation cannot complete
  (no skip path).
- [x] **AC-4** — **Given** creation completes, **Then** exactly one Unified Account
  exists exposing correct addresses for Substrate, EVM, Bitcoin, TON and Cardano
  (AD-11).

## Tasks

- [x] **TASK-3.1.1** — Generate seed entropy in the background keyring (AC: 1)
  - [x] Confirm no mnemonic bytes are emitted on the `pri(…)`/`pub(…)` bus.
- [x] **TASK-3.1.2** — Master-password set + encrypt-at-rest (AC: 2)
  - [x] Enforce strength policy (FR-53); persist via browser-passworder (NFR-3).
- [x] **TASK-3.1.3** — Mandatory backup-confirmation gate (AC: 3)
- [x] **TASK-3.1.4** — Materialize the Unified Account + verify per-ecosystem addresses (AC: 4)

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to the
  background; seed/key bytes never reach UI or inject scripts.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — creation yields a unified
  multi-ecosystem account, not a Substrate-only one.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Sibling [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md) — both
  land accounts through the same keyring service; coordinate the shared
  master-password setup step.

### References

- [Source: PRD FR-13](../../PRD.md#functional-requirements) — create a new wallet via seed phrase
- [Source: PRD FR-53](../../PRD.md#functional-requirements) — master password with strength policy
- [Source: PRD NFR-3](../../PRD.md#non-functional-requirements) — AES-256-GCM encryption at rest
- [Source: CONTEXT D37](../../CONTEXT.md) — Unified Account model

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Keyring unit test for `createSeed` asserts no mnemonic on the message bus (`packages/extension-base` keyring tests) |
| AC-2 | Manual: set password → lock → unlock; wrong password rejected |
| AC-3 | Manual: attempt to skip backup confirmation → creation blocked |
| AC-4 | Manual: after create, Account → addresses shows Substrate/EVM/BTC/TON/Cardano |

## Changelog entry

### Added
- Create-new-wallet flow: background seed generation, master-password setup,
  mandatory backup confirmation, Unified Account materialization.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-13](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
