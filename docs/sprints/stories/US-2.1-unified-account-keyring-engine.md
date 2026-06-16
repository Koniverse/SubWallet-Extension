---
id: US-2.1
title: "Unified-Account keyring engine"
epic: EPIC-2
status: backlog
priority: P0
points: 8
sprint:
version_shipped:
prd_ref: [FR-5]
arch_ref: [AD-04, AD-11]
depends_on:
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The keyring engine is the product's signature capability: it derives one seed
phrase into addresses across Substrate, EVM, Bitcoin, TON and Cardano under a
single **Unified Account**, supports unified↔solo conversion, and does it all
**inside the background service worker** so no key bytes ever reach the UI. Every
feature epic that signs, derives or shows an address stops worrying about
multi-curve derivation and key isolation because this engine owns them.

## Background

This story catalogues the **`keyring-service`** module
(`packages/extension-base/src/services/keyring-service`) layered over the
**`@subwallet/keyring`** package — the engine that materializes the Unified
Account model. It realizes two Architecture Decisions:

- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — the unified
  multi-chain account model. One seed spans five ecosystems; both unified and
  per-chain "solo" accounts are supported, with derivation between them. This is
  the single-seed/single-backup guarantee that is the core product promise
  ([CONTEXT D37](../../CONTEXT.md) integrated Bitcoin into the existing
  Substrate + EVM + TON + Cardano model).
- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — the non-custodial
  boundary. `@subwallet/keyring` and `@subwallet/ui-keyring` are instantiated
  **only** in the background; no private-key bytes flow to UI or inject scripts,
  which eliminates key exfiltration via XSS or a compromised dApp page.

Its responsibility is *identity and key material*: generate/parse/store secrets,
derive per-ecosystem addresses, and convert between unified and solo accounts.
It is the engine that EPIC-3's onboarding flows drive and that US-2.7 / US-2.8
call when a signature is required. This story is sized 8 (multi-system: five
ecosystem key schemes + the unified↔solo derivation graph + the background
isolation boundary, all of which other engines depend on).

This story is **Retroactive** — the engine already ships; `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** a single seed phrase parsed in the background, **When**
  the keyring materializes a unified account, **Then** it exposes correct,
  reproducible addresses for Substrate, EVM, Bitcoin, TON and Cardano (AD-11,
  NFR-18).
- [ ] **AC-2** — **Given** any keyring operation (create / import / derive /
  export / sign), **When** it runs, **Then** the seed and private-key bytes are
  confined to the background service worker and never appear on the `pri(…)` /
  `pub(…)` message bus or in inject scripts (AD-04).
- [ ] **AC-3** — **Given** a unified account, **When** the user converts it to a
  per-chain solo account (or vice-versa), **Then** the derivation is
  deterministic and the resulting addresses match those produced directly from
  the same seed (AD-11).
- [ ] **AC-4** — **Given** an invalid secret (bad mnemonic checksum or malformed
  private key), **When** it is submitted to the keyring, **Then** the operation
  is rejected with a typed error and no partial account is persisted.

## Tasks

- [ ] **TASK-2.1.1** — Per-ecosystem derivation: one seed → Substrate / EVM / BTC / TON / Cardano addresses (AC: 1)
  - [ ] Confirm reproducibility across fresh installs with no server dependency (NFR-18).
- [ ] **TASK-2.1.2** — Background-only key isolation boundary (AC: 2)
  - [ ] Assert no seed/private-key bytes on the `pri(…)`/`pub(…)` bus or inject scripts.
- [ ] **TASK-2.1.3** — Unified↔solo conversion / derivation graph (AC: 3)
- [ ] **TASK-2.1.4** — Secret validation + typed-error / no-partial-persist path (AC: 4)

## Dev notes

### Architecture constraints

- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — the engine MUST produce a unified multi-ecosystem account from one seed; excluding any chain would force a separate seed and break the single-backup promise.
- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring instances live only in the background; the UI passes user input and receives addresses, never key bytes. Hardware-wallet signing (out of scope, EPIC-16) delegates to the device.
- This story does NOT introduce new AD entries; it materializes AD-11 + AD-04.

### Cross-story dependencies

- Required by [US-2.7](US-2.7-requestservice-approval-queue.md) and [US-2.8](US-2.8-transaction-lifecycle-engine.md) — both call the keyring to sign once a request is approved.
- Required by EPIC-3 account stories — onboarding/import/export flows drive this engine through the background.
- Consumes the master-password gate owned by EPIC-5 (security); it does not define lock policy.

### References

- [Source: PRD FR-5](../../PRD.md#functional-requirements) — Unified-Account keyring engine
- [Source: PRD NFR-18](../../PRD.md#non-functional-requirements) — deterministic, server-independent derivation
- [Source: ARCHITECTURE AD-04, AD-11](../../ARCHITECTURE.md#architecture-decisions)
- [Source: CONTEXT D37](../../CONTEXT.md) — Bitcoin integrated into the Unified Account model

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Keyring unit test: one seed derives expected Substrate/EVM/BTC/TON/Cardano addresses (`packages/keyring`, `services/keyring-service` tests) |
| AC-2 | Keyring test asserts no mnemonic/private-key bytes on the `pri(…)`/`pub(…)` bus |
| AC-3 | Unit test: unified→solo (and reverse) derivation matches direct-from-seed addresses |
| AC-4 | Unit test: invalid mnemonic / malformed key → rejected, no account persisted |

## Changelog entry

### Added
- Unified-Account keyring engine: one seed → addresses across Substrate, EVM,
  Bitcoin, TON and Cardano under a single account, with unified↔solo conversion,
  confined to the background service worker.

**Commit**:

## Implementation notes

_Retroactive story — engine already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-5](../../PRD.md#functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [CONTEXT D37](../../CONTEXT.md)
