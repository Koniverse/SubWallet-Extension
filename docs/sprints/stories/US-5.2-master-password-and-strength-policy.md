---
id: US-5.2
title: "Master password & strength policy"
epic: EPIC-5
status: backlog
priority: P0
points: 3
sprint:
version_shipped:
prd_ref: [FR-53]
arch_ref: [AD-04]
depends_on:
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A single master password — enforced against a strength policy — wraps every
account in the wallet, so that the user manages one secret instead of one per
account and all key material is encrypted at rest under a key only they hold.

## Background

The master password is the root of the wallet's authorization model and the key
that derives the at-rest encryption (AES-256-GCM via browser-passworder,
[NFR-3](../../PRD.md#non-functional-requirements)). It is set once and covers **all** accounts; importing a
new account does not introduce a new password. A strength policy is enforced at
set-time to keep the at-rest key from being trivially brute-forced — the only
thing standing between an attacker with disk access and the keys is this password.

Encryption and decryption happen **only in the background keyring** (AD-04); the
UI submits the candidate password over the `pri(…)` bus and receives a
locked/unlocked result, never the decrypted key bytes. The password is
**non-recoverable** (there is no server custody), which is why the forgot-password
path is a reset, not a recovery — see [US-5.3](US-5.3-forgot-password-reset-wallet.md).
This story is the gate that [EPIC-3](../epics/EPIC-3.md) (create/import/export)
and [EPIC-8](../epics/EPIC-8.md) (signing) consume.

Materializes [FR-53](../../PRD.md#functional-requirements). This story is **retroactive** — already
shipped; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** a fresh wallet, **When** the user sets a master
  password meeting the strength policy, **Then** the policy is enforced (a weak
  password is rejected with guidance) and the password is accepted only once it
  passes.
- [ ] **AC-2** — **Given** an accepted master password, **When** accounts are
  persisted, **Then** key bytes are stored AES-256-GCM-encrypted under a key
  derived from that password (NFR-3); no plaintext key bytes are written to
  storage.
- [ ] **AC-3** — **Given** any number of accounts (created or imported), **Then**
  exactly one master password covers all of them — importing an account does not
  prompt for a new password.
- [ ] **AC-4** — **Given** the keyring runs only in the background (AD-04),
  **When** the UI submits a password, **Then** encryption/decryption happens in
  the background and no decrypted key bytes ever cross the `pri(…)` bus to the UI.

## Tasks

- [ ] **TASK-5.2.1** — Master-password set + strength-policy enforcement (AC: 1)
  - [ ] Reject below-threshold passwords with actionable feedback.
- [ ] **TASK-5.2.2** — Derive at-rest encryption key; encrypt all accounts (AC: 2) — browser-passworder, AES-256-GCM
- [ ] **TASK-5.2.3** — Single-password-covers-all-accounts wiring (AC: 3)
- [ ] **TASK-5.2.4** — Confirm no decrypted key bytes leave the background (AC: 4) — assert bus payloads carry no key material

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — encryption/decryption confined to the background keyring; the UI handles only the candidate password and a locked/unlocked result.
- At-rest encryption is AES-256-GCM via browser-passworder ([NFR-3](../../PRD.md#non-functional-requirements)); the derivation key never leaves the background.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Required by [US-5.3](US-5.3-forgot-password-reset-wallet.md) — reset exists *because* this password is non-recoverable.
- Required by [US-5.4](US-5.4-unified-unlock-and-auto-lock-flow.md) — the unlock flow validates this password.
- Consumed by [EPIC-3](../epics/EPIC-3.md) (key create/import/export gate) and [EPIC-8](../epics/EPIC-8.md) (signing gate).

### References

- [Source: PRD FR-53](../../PRD.md#functional-requirements) — master password with strength policy
- [Source: PRD NFR-3](../../PRD.md#non-functional-requirements) — AES-256-GCM encryption at rest (browser-passworder)
- [Source: ARCHITECTURE AD-04](../../ARCHITECTURE.md#architecture-decisions) — non-custodial keyring confined to background

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: enter a weak password → rejected; enter a strong one → accepted |
| AC-2 | Inspect storage: account entries are ciphertext; no plaintext key bytes |
| AC-3 | Manual: import a second account → no new password prompt; both unlock with the same password |
| AC-4 | Keyring unit test asserts `pri(…)` unlock payloads contain no decrypted key bytes |

## Changelog entry

### Added
- Master password with a strength policy covering all accounts; key material
  encrypted at rest with AES-256-GCM (browser-passworder) under a
  master-password-derived key, in the background keyring only.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-53](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [US-5.3](US-5.3-forgot-password-reset-wallet.md), [US-5.4](US-5.4-unified-unlock-and-auto-lock-flow.md)
