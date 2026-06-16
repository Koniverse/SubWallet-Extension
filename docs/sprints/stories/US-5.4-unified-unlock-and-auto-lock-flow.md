---
id: US-5.4
title: "Unified unlock / auto-lock flow"
epic: EPIC-5
status: backlog
priority: P0
points: 3
sprint:
version_shipped:
prd_ref: [FR-55]
arch_ref: [AD-03, AD-04]
depends_on: [US-5.2]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The wallet has one unlock surface and one lock state: entering the master
password unlocks the whole wallet, and locking (manual or automatic) relocks
everything at once — so that the user reasons about a single security boundary,
never a patchwork of per-account or per-feature locks.

## Background

A unified lock state is what makes "the wallet is locked" a meaningful guarantee.
Unlocking validates the master password from [US-5.2](US-5.2-master-password-and-strength-policy.md)
in the background keyring (AD-04) and flips a single locked/unlocked flag that
every feature observes; the UI learns the state over the `pub(…)` / `pri(…)` bus
(AD-03) and never holds the decrypted key itself. Locking clears the in-memory
decrypted key in the background so that, after lock, no feature can sign without a
re-unlock.

This story owns the *flow and state machine*; the **policy knobs** that drive
auto-lock — the inactivity timer and the per-action-vs-per-session unlock type —
are configured in [US-5.6](US-5.6-auto-lock-timer-and-unlock-type.md), which this
story consumes. The MV3 service-worker lifecycle (AD-20) complicates "in-memory":
the lock state must survive a service-worker wake/sleep without silently
re-unlocking, so the flag is reconstructed safely on wake ([LESSONS §7](../../LESSONS.md)).

Materializes [FR-55](../../PRD.md#functional-requirements). This story is **retroactive** — already
shipped; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** a locked wallet, **When** the user enters the correct
  master password, **Then** the entire wallet unlocks through one surface and all
  accounts become usable.
- [ ] **AC-2** — **Given** an unlocked wallet, **When** the user locks it (manually
  or via auto-lock), **Then** the in-memory decrypted key is cleared in the
  background and no feature can sign until re-unlock.
- [ ] **AC-3** — **Given** an unlock attempt with the wrong password, **When**
  submitted, **Then** the wallet stays locked and surfaces an error (no partial
  unlock).
- [ ] **AC-4** — **Given** the MV3 service worker sleeps and wakes while locked,
  **When** it wakes, **Then** the wallet remains locked (it never silently
  re-unlocks across the lifecycle, LESSONS §7).

## Tasks

- [ ] **TASK-5.4.1** — Single unlock surface validating the master password (AC: 1, 3)
  - [ ] Validate in the background keyring (AD-04); surface only locked/unlocked over the bus (AD-03).
- [ ] **TASK-5.4.2** — Unified lock action clears the in-memory key (AC: 2)
- [ ] **TASK-5.4.3** — Wrong-password handling keeps the wallet locked (AC: 3)
- [ ] **TASK-5.4.4** — Lock state survives MV3 wake/sleep without auto-unlock (AC: 4) — reconstruct safely on wake (LESSONS §7)

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — password validation and the decrypted key live in the background; the UI sees only the lock flag.
- [AD-03](../../ARCHITECTURE.md#architecture-decisions) — the UI observes lock state over the `pub(…)` / `pri(…)` bus; it never holds the key.
- MV3 lifecycle (AD-20) — the lock flag must be rebuilt safely on service-worker wake so it does not auto-unlock ([LESSONS §7](../../LESSONS.md)).
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-5.2](US-5.2-master-password-and-strength-policy.md) — validates that master password.
- Consumes [US-5.6](US-5.6-auto-lock-timer-and-unlock-type.md) — the auto-lock timer and unlock-type policy drive when this flow relocks / re-prompts.

### References

- [Source: PRD FR-55](../../PRD.md#functional-requirements) — unified unlock / auto-lock flow
- [Source: ARCHITECTURE AD-03, AD-04](../../ARCHITECTURE.md#architecture-decisions) — message-bus isolation; background keyring
- [Source: ARCHITECTURE AD-20](../../ARCHITECTURE.md#architecture-decisions) — four-state MV3 background lifecycle
- [Source: LESSONS §7](../../LESSONS.md) — MV3 service-worker lifecycle breaks always-on patterns

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: lock → enter correct password → whole wallet unlocks |
| AC-2 | Manual: lock → attempt to sign → blocked until re-unlock |
| AC-3 | Manual: enter wrong password → stays locked, error shown |
| AC-4 | Manual: lock → idle until service worker sleeps → wake → still locked |

## Changelog entry

### Added
- Unified unlock / auto-lock flow: one master-password unlock surface and a single
  wallet-wide lock state; the in-memory decrypted key is cleared on lock and the
  lock state survives MV3 service-worker wake/sleep.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-55](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [LESSONS §7](../../LESSONS.md)
- [US-5.2](US-5.2-master-password-and-strength-policy.md), [US-5.6](US-5.6-auto-lock-timer-and-unlock-type.md)
