---
id: US-3.5
title: "The Unified Account model"
epic: EPIC-3
status: backlog
priority: P1
points: 8
sprint:
version_shipped:
prd_ref: [FR-21, FR-22, FR-23]
arch_ref: [AD-11, AD-12, AD-13, AD-14, AD-15]
depends_on: [US-3.1, US-3.2, US-2.1]
assignee:
commit:
created: 2026-06-11
updated: 2026-06-11
---

## Goal

A user holds **one seed** that simultaneously addresses all five ecosystems —
Substrate, EVM, Bitcoin, TON and Cardano — and can convert between the unified
view and per-chain "solo" accounts without ever touching a second seed or a
second backup. This is the core product promise: single seed, single backup,
every chain.

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

- [ ] **AC-1** — **Given** one seed, **When** a unified account is materialized,
  **Then** correct addresses exist for Substrate, EVM, Bitcoin, TON and Cardano
  simultaneously (AD-11), each honoring its per-ecosystem model (AD-12/13/14/15).
- [ ] **AC-2** — **Given** the same seed and derivation path on a fresh install,
  **When** the unified account is reproduced, **Then** the addresses are
  identical with no server dependency (NFR-18, deterministic derivation).
- [ ] **AC-3** — **Given** several solo accounts that share one underlying seed,
  **When** the user merges them, **Then** a single unified account results and
  the prior solo entries are reconciled (FR-22).
- [ ] **AC-4** — **Given** an attempt to merge solo accounts that do **not**
  share the same seed, **When** the user submits the merge, **Then** it is
  rejected with a clear error and no account is altered.
- [ ] **AC-5** *(forward — FR-23)* — **Given** a unified account, **When** the
  user splits it, **Then** per-chain solo accounts result without re-entering the
  seed. _Not yet implemented; tracked for the FR-23 milestone._

## Tasks

- [ ] **TASK-3.5.1** — Unified derivation across all five ecosystems (AC: 1, 2)
  - [ ] Honor per-ecosystem models AD-12 (BTC address types) / AD-13 (TON version) / AD-14 (Cardano) / AD-15 (Bittensor).
- [ ] **TASK-3.5.2** — Deterministic-derivation verification on fresh install (AC: 2)
- [ ] **TASK-3.5.3** — Solo → Unified merge (AC: 3, 4)
  - [ ] Reject merges across mismatched seeds.
- [ ] **TASK-3.5.4** *(forward — FR-23)* — Unified → Solo split (AC: 5)

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

## Cross-references

- [PRD FR-21](../../PRD.md#functional-requirements), [PRD FR-22](../../PRD.md#functional-requirements), [PRD FR-23](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
