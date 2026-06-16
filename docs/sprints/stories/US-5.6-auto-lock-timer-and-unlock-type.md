---
id: US-5.6
title: "Auto-lock timer + unlock type"
epic: EPIC-5
status: backlog
priority: P0
points: 3
sprint:
version_shipped:
prd_ref: [FR-57, FR-58]
arch_ref: [AD-03]
depends_on: [US-5.4]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The user controls the wallet's lock policy: a configurable inactivity timer that
auto-locks the wallet (FR-57), and an unlock *type* that chooses whether the
master password is required on every protected action or only once per unlocked
session (FR-58) — so each user can trade convenience against exposure to fit their
threat model.

## Background

These two FRs are the **policy knobs** behind the unified lock state machine in
[US-5.4](US-5.4-unified-unlock-and-auto-lock-flow.md); they are merged into one
story because they are a single Settings cluster that together define "how
aggressively does the wallet relock". The **auto-lock timer** (FR-57) sets the
inactivity window after which the wallet locks itself; "0 / never" is a valid but
explicitly-chosen setting. The **unlock type** (FR-58) is the per-action vs
per-session toggle: per-action re-prompts for the password on each protected
operation (maximum safety), per-session unlocks once until lock (maximum
convenience).

Both settings are read by the lock flow in US-5.4 and the signing gate consumed
by [EPIC-8](../epics/EPIC-8.md). They are persisted settings, exchanged with the
background over the typed bus (AD-03) — the *enforcement* of the chosen policy
happens in the background, not the UI, so a tampered UI cannot relax the policy.
Changing the timer or the unlock type takes effect immediately without requiring a
re-unlock.

Materializes [FR-57](../../PRD.md#functional-requirements) and [FR-58](../../PRD.md#functional-requirements). This story is
**retroactive** — already shipped; `commit` / `version_shipped` are backfilled
during version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** the security settings, **When** the user sets an
  auto-lock inactivity timer, **Then** the wallet auto-locks after that period of
  inactivity and the setting persists across sessions (FR-57).
- [ ] **AC-2** — **Given** the unlock type set to **per-action**, **When** the
  user performs a protected action, **Then** the master password is required for
  each such action (FR-58).
- [ ] **AC-3** — **Given** the unlock type set to **per-session**, **When** the
  user has unlocked once, **Then** protected actions proceed without re-prompting
  until the wallet locks (FR-58).
- [ ] **AC-4** — **Given** the policy is enforced in the background, **When** a
  setting is changed, **Then** it takes effect immediately and the new policy is
  applied by the background lock/signing gate (not only the UI) — a UI cannot
  relax it (AD-03).

## Tasks

- [ ] **TASK-5.6.1** — Configurable auto-lock inactivity timer + persistence (AC: 1)
- [ ] **TASK-5.6.2** — Per-action unlock type — re-prompt each protected action (AC: 2)
- [ ] **TASK-5.6.3** — Per-session unlock type — unlock once until lock (AC: 3)
- [ ] **TASK-5.6.4** — Enforce both policies in the background lock/signing gate (AC: 4) — settings over the typed bus (AD-03)

## Dev notes

### Architecture constraints

- [AD-03](../../ARCHITECTURE.md#architecture-decisions) — policy settings cross the typed bus, but enforcement is in the background so a tampered UI cannot relax the lock policy.
- These are the policy inputs to the lock state machine in [US-5.4](US-5.4-unified-unlock-and-auto-lock-flow.md).
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on / drives [US-5.4](US-5.4-unified-unlock-and-auto-lock-flow.md) — the unified lock flow reads the timer and unlock type set here.
- Consumed by [EPIC-8](../epics/EPIC-8.md) signing gate — per-action unlock re-prompts at signing time.

### References

- [Source: PRD FR-57](../../PRD.md#functional-requirements) — configurable extension auto-lock timer
- [Source: PRD FR-58](../../PRD.md#functional-requirements) — unlock type (per-action vs per-session)
- [Source: ARCHITECTURE AD-03](../../ARCHITECTURE.md#architecture-decisions) — background / UI message-bus isolation

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: set a short timer → idle → wallet auto-locks; setting persists after restart |
| AC-2 | Manual: per-action mode → each protected action re-prompts for the password |
| AC-3 | Manual: per-session mode → unlock once → subsequent actions proceed until lock |
| AC-4 | Manual: change setting → applies immediately; background gate enforces it |

## Changelog entry

### Added
- Configurable auto-lock inactivity timer (FR-57) and unlock-type setting —
  per-action vs per-session master-password requirement (FR-58) — enforced by the
  background lock / signing gate.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-57](../../PRD.md#functional-requirements), [PRD FR-58](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [US-5.4](US-5.4-unified-unlock-and-auto-lock-flow.md)
