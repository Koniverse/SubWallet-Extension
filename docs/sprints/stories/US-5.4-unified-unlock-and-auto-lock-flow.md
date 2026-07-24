---
id: US-5.4
title: "Unified unlock / auto-lock flow"
epic: EPIC-5
status: done
priority: P0
points: 3
sprint: sprint-2023-M04
version_shipped: 1.0.2
prd_ref: [FR-55]
arch_ref: [AD-03, AD-04]
depends_on: [US-5.2]
assignee: S2kael
commit: 26d1307998, 896ccb5263, 3d4d28e56e
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The wallet has one unlock surface and one lock state: entering the master
password unlocks the whole wallet, and locking (manual or automatic) relocks
everything at once — so that the user reasons about a single security boundary,
never a patchwork of per-account or per-feature locks.

## Status

> **✅ done — shipped in 1.0.2.** All 4 acceptance criteria are ticked, and no incremental tracker issue is recorded against this capability.
> **The status is the acceptance criteria's to give** — nothing else in this file can change it.

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

- [x] **AC-1** — **Given** a locked wallet, **When** the user enters the correct
  master password, **Then** the entire wallet unlocks through one surface and all
  accounts become usable.
- [x] **AC-2** — **Given** an unlocked wallet, **When** the user locks it (manually
  or via auto-lock), **Then** the in-memory decrypted key is cleared in the
  background and no feature can sign until re-unlock.
- [x] **AC-3** — **Given** an unlock attempt with the wrong password, **When**
  submitted, **Then** the wallet stays locked and surfaces an error (no partial
  unlock).
- [x] **AC-4** — **Given** the MV3 service worker sleeps and wakes while locked,
  **When** it wakes, **Then** the wallet remains locked (it never silently
  re-unlocks across the lifecycle, LESSONS §7).

## Tasks

- [x] **TASK-5.4.1** — Single unlock surface validating the master password (AC: 1, 3)
  - [x] Validate in the background keyring (AD-04); surface only locked/unlocked over the bus (AD-03).
- [x] **TASK-5.4.2** — Unified lock action clears the in-memory key (AC: 2)
- [x] **TASK-5.4.3** — Wrong-password handling keeps the wallet locked (AC: 3)
- [x] **TASK-5.4.4** — Lock state survives MV3 wake/sleep without auto-unlock (AC: 4) — reconstruct safely on wake (LESSONS §7)

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

## Incremental work, fixes & chores

**None from the security ledger — but 29 candidates are waiting.** No issue in the former
security maintenance ledger landed here (per-issue map: [consolidation note](../../notes/2026-07-21.md)).
That ledger held only 13 issues and they were almost all phishing.

> **This capability's history is not empty — it is not yet folded.** A title scan of the **5
> ledgers still separate** finds **23 issues** mentioning "unlock" / "lock", sitting in EPIC-23, EPIC-24, EPIC-32, EPIC-41.
>
> **The transactions ledger held none of them.** It folded on 2026-07-24 with 200 issues and not one
> title matched — a whole area of the tracker that never touches the lock state.
>
> **The hardware ledger's three candidates were all false positives**, and they are worth recording
> as the shape of the error: `Unblock`, `block action`, `Block networks` — the heuristic matched
> "lock" as a substring. None is a screen-lock issue; all three are Ledger action-blocking, now in
> [US-16.6](US-16.6-ledger-signing-across-wallet-features.md) and
> [US-16.7](US-16.7-generic-ledger-app-migration-and-metadata.md).
>
> **The UI ledger's three were real, and still did not land here**: #1102 and #1134 (*"handle case
> lock wallet"*, *"auto lock wallet"*) went into
> [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) with the rest of the 1.0.2 rewrite, and #1684
> (*"improve lock UX"*, 1.1.10) into [US-6.12](US-6.12-early-ux-iteration.md). The lock **flow** is
> this story's; the **screens that show it** are EPIC-6's — a distinction a title scan cannot make.
>
> The count fell 29 → 26 when the hardware ledger folded on 2026-07-23, then 26 → 23 when the UI
> ledger folded the same day, and **not one of those six issues landed here**.
> Treat the remainder as an **upper bound, not a count**: routing there is a title heuristic
> ([D108](../../CONTEXT.md#d108-every-tracker-issue-gets-a-story--in-a-maintenance-epic-layer-so-the-fr-map-stays-the-fr-map)),
> so some will belong elsewhere once read. Which of them land here is decided when those ledgers
> are folded, not now.

## Cross-references

- [PRD FR-55](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [LESSONS §7](../../LESSONS.md)
- [US-5.2](US-5.2-master-password-and-strength-policy.md), [US-5.6](US-5.6-auto-lock-timer-and-unlock-type.md)
