---
id: US-5.3
title: "Forgot password → reset wallet"
epic: EPIC-5
status: done
priority: P0
points: 3
sprint:
version_shipped: 1.0.4
prd_ref: [FR-54]
arch_ref: [AD-04]
depends_on: [US-5.2]
assignee: S2kael
commit: 5bae12e640b665a13eea2c942a240ee766a0ab88, 3e7c67bb15e28d5283e8e0068267486a0b01061b, 5f89e5911ece4caf9c807295be5735434cfb6f37
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user who has forgotten their master password can recover *access to the
extension* — but only by resetting the wallet, which clears all accounts and
requires re-import from seed — so that the non-custodial guarantee is preserved:
there is no back door, and the user's seed remains the single source of truth.

## Background

The master password is **non-recoverable by design** (FR-54): there is no
server-side custody, no recovery email, no security questions. The only way past
a forgotten password is to wipe the encrypted store and start over. This is a
direct consequence of [US-5.2](US-5.2-master-password-and-strength-policy.md) —
if the at-rest key derives solely from the password and the password is gone, the
ciphertext is unrecoverable.

The reset is destructive and must be **complete**: every data service must be
iterated and cleared, because nothing self-clears — a partial reset that leaves
stale account data behind is both a correctness bug and a security leak
([LESSONS §16](../../LESSONS.md)). The UI must make the consequence unmistakable
(accounts gone, seed required) before the user confirms, so a reset is never an
accidental click. Accounts created from a seed survive the reset *only* because
the user re-imports them — the wallet itself retains nothing.

Materializes [FR-54](../../PRD.md#functional-requirements). This story is **retroactive** — already
shipped; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** the unlock screen, **When** the user chooses "Forgot
  password", **Then** the only offered path is a wallet reset (no recovery option
  is presented).
- [x] **AC-2** — **Given** the reset confirmation, **When** the user has not
  explicitly acknowledged that accounts will be cleared and a seed re-import is
  required, **Then** the reset cannot proceed.
- [x] **AC-3** — **Given** a confirmed reset, **When** it runs, **Then** every
  data service is iterated and cleared — accounts, keyring, settings, caches — with
  no stale account data left behind (LESSONS §16).
- [x] **AC-4** — **Given** the reset completes, **When** the user re-imports a
  seed, **Then** the original accounts are reconstructed deterministically
  (NFR-18) and a new master password is set.

## Tasks

- [x] **TASK-5.3.1** — "Forgot password" → reset-only path on the unlock screen (AC: 1)
- [x] **TASK-5.3.2** — Destructive-reset confirmation gate with explicit consequences (AC: 2)
- [x] **TASK-5.3.3** — Iterate every data service on reset (AC: 3) — keyring, accounts, settings, caches (LESSONS §16)
- [x] **TASK-5.3.4** — Post-reset re-import path + new master password (AC: 4)

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — the encrypted store lives in the background; reset clears it there, not from the UI.
- Reset must iterate **every** data service — nothing self-clears ([LESSONS §16](../../LESSONS.md)); a missed service is a security/correctness leak.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-5.2](US-5.2-master-password-and-strength-policy.md) — reset exists because that password is non-recoverable; post-reset re-import sets a fresh master password via the same flow.
- Reuses the wallet-reset routine that must clear every service ([LESSONS §16](../../LESSONS.md)).

### What we explicitly did NOT do

- No password recovery, hint, or escrow mechanism — by design (FR-54). Trigger to revisit: never, without abandoning non-custodial posture.

### References

- [Source: PRD FR-54](../../PRD.md#functional-requirements) — forgot password → reset wallet (non-recoverable)
- [Source: PRD NFR-18](../../PRD.md#non-functional-requirements) — deterministic derivation enables re-import
- [Source: ARCHITECTURE AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to background
- [Source: LESSONS §16](../../LESSONS.md) — wallet reset must iterate every data service

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: "Forgot password" → only a reset path is offered |
| AC-2 | Manual: attempt reset without acknowledging consequences → blocked |
| AC-3 | After reset, inspect each data service → no residual account data |
| AC-4 | Manual: re-import the seed → original accounts/addresses reconstructed; set new password |

## Changelog entry

### Added
- Forgot-password → wallet-reset flow: a non-recoverable master password can only
  be resolved by a destructive reset that clears every data service; accounts are
  restored by re-importing the seed.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-54](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [LESSONS §16](../../LESSONS.md)
- [US-5.2](US-5.2-master-password-and-strength-policy.md)
