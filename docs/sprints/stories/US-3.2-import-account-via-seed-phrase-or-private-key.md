---
id: US-3.2
title: "Import account via seed phrase or private key"
epic: EPIC-3
status: backlog
priority: P0
points: 3
sprint:
version_shipped:
prd_ref: [FR-14, FR-15]
arch_ref: [AD-04, AD-11]
depends_on: [US-3.1]
assignee:
commit:
created: 2026-06-11
updated: 2026-06-11
---

## Goal

A user migrating from another wallet can bring an existing account in by its
12/24-word seed phrase or by a raw private key — so that they keep control of
funds they already hold without creating a new key.

## Background

The two secret-based import paths. A seed import reconstructs a full
**Unified Account** (one seed → all five ecosystems, [AD-11](../../ARCHITECTURE.md#architecture-decisions)),
whereas a private-key import yields a single-chain "solo" account (a private key
only addresses one curve). Both parse the secret **in the background keyring**
([AD-04](../../ARCHITECTURE.md#architecture-decisions)) and persist it encrypted
under the master password set in
[US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md); no secret bytes reach the
UI. Other import formats (JSON keystore, QR, Trust Wallet) are separate stories —
this one is scoped to the two raw-secret paths because they share validation and
the solo-vs-unified branching.

Materializes [FR-14](../../PRD.md) and [FR-15](../../PRD.md). **Retroactive** —
already shipped; `commit` / `version_shipped` backfilled in reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** a valid 12/24-word mnemonic, **When** the user imports
  it, **Then** a Unified Account is created with correct addresses across all five
  ecosystems (AD-11) and the secret is parsed only in the background (AD-04).
- [ ] **AC-2** — **Given** a valid private key, **When** the user imports it,
  **Then** a solo account for the matching ecosystem is created and usable for
  signing.
- [ ] **AC-3** — **Given** an invalid mnemonic (bad checksum/word) or malformed
  private key, **When** the user submits it, **Then** import is rejected with a
  clear error and no partial account is persisted.
- [ ] **AC-4** — **Given** any successful import, **Then** the secret is stored
  encrypted at rest under the master password (NFR-3); no plaintext key bytes are
  written to storage.

## Tasks

- [ ] **TASK-3.2.1** — Seed-phrase import → Unified Account (AC: 1, 4)
  - [ ] Validate mnemonic checksum; derive all-ecosystem addresses in background.
- [ ] **TASK-3.2.2** — Private-key import → solo account (AC: 2, 4)
  - [ ] Detect curve/ecosystem; create solo account.
- [ ] **TASK-3.2.3** — Input validation + error states for both paths (AC: 3)

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — secret parsing/storage
  stays in the background; UI passes user input, never receives key bytes.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — a seed yields a unified
  account; a private key cannot (single curve) and stays solo.

### Cross-story dependencies

- Builds on [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md) — reuses the
  master-password setup and the keyring persistence path.
- Sibling: future import stories (JSON keystore, QR, Trust Wallet) extend the same
  import surface.

### References

- [Source: PRD FR-14](../../PRD.md) — import via seed phrase
- [Source: PRD FR-15](../../PRD.md) — import via private key
- [Source: PRD NFR-3](../../PRD.md) — encryption at rest
- [Source: CONTEXT D37](../../CONTEXT.md) — Unified Account model

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: import a known mnemonic → addresses match expected across ecosystems |
| AC-2 | Manual: import a known private key → solo account signs a test tx |
| AC-3 | Unit test: invalid mnemonic / malformed key → rejected, no account persisted |
| AC-4 | Inspect storage: no plaintext key bytes; entry is ciphertext |

## Changelog entry

### Added
- Import account by 12/24-word seed phrase (→ Unified Account) and by private key
  (→ solo account), with validation and error states.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and caveats during version reconciliation._

## Cross-references

- [PRD FR-14](../../PRD.md), [PRD FR-15](../../PRD.md)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
