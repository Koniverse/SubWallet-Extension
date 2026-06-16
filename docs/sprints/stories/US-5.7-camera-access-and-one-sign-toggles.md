---
id: US-5.7
title: "Camera-access + One-Sign toggles"
epic: EPIC-5
status: backlog
priority: P0
points: 3
sprint:
version_shipped:
prd_ref: [FR-59, FR-60]
arch_ref: [AD-03]
depends_on:
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The user controls two security-relevant conveniences from settings: a
**camera-access** toggle that enables or disables the camera used for QR scanning
(FR-59), and a **One-Sign** (single-approval) toggle that opts in to confirming
multiple sequential transactions with a single signature (FR-60) — so each user
can decide whether to widen their attack/permission surface for convenience or
keep it minimal by default.

## Background

These two FRs are merged into one story because they are a single Settings
cluster of opt-in security toggles: each lets the user *enlarge* a normally-narrow
surface, and each must be default-safe (off / minimal) so a user who never touches
settings is in the conservative posture. The **camera-access toggle** (FR-59)
gates the browser camera permission used for QR-code scanning (Keystone / Polkadot
Vault signing, address scanning); a user who never scans QR codes can keep the
camera disabled so no surface requests it. The **One-Sign toggle** (FR-60) opts in
to the single-approval flow where a sequence of transactions (e.g. an
approve-then-swap, or a multi-step earning path) is confirmed once rather than
per-step — a convenience that necessarily reduces the number of explicit
confirmations, so it is opt-in, not default.

The One-Sign *mechanism* (the multi-step batching itself) is materialized in the
transaction epic ([EPIC-8](../epics/EPIC-8.md), FR-82); this story owns only the
**security toggle** that turns it on and the default-safe posture. Both settings
are persisted and exchanged with the background over the typed bus (AD-03); their
effect (whether the camera is requested, whether sequential signatures collapse
into one) is enforced where the action runs, not in the toggle UI.

Materializes [FR-59](../../PRD.md#functional-requirements) and [FR-60](../../PRD.md#functional-requirements). This story is
**retroactive** — already shipped; `commit` / `version_shipped` are backfilled
during version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** the security settings, **When** the user toggles
  camera access off, **Then** QR-scanning surfaces do not request the camera and
  the camera permission is not held; toggling it on re-enables QR scanning (FR-59).
- [ ] **AC-2** — **Given** the One-Sign toggle is **off** (default), **When** the
  user performs a multi-step transaction sequence, **Then** each step is confirmed
  individually (no single-signature batching).
- [ ] **AC-3** — **Given** the One-Sign toggle is **on**, **When** the user
  performs a supported multi-step sequence, **Then** the sequence is confirmed with
  a single approval (FR-60), delegating to the EPIC-8 one-sign mechanism.
- [ ] **AC-4** — Both toggles persist across sessions and default to the
  conservative posture (camera off until enabled, One-Sign off) on a fresh install.
- [ ] **AC-5** — **Given** the One-Sign toggle is on, **When** the user reaches an
  *unsupported* sequence, **Then** the flow falls back to per-step confirmation
  rather than silently batching an unsupported set.

## Tasks

- [ ] **TASK-5.7.1** — Camera-access toggle: gate the QR-scan camera permission (AC: 1) — no camera request when off
- [ ] **TASK-5.7.2** — One-Sign toggle wiring into the EPIC-8 multi-step flow (AC: 2, 3) — off ⇒ per-step, on ⇒ single approval
- [ ] **TASK-5.7.3** — Persist both settings with conservative defaults (AC: 4) — over the typed bus (AD-03)
- [ ] **TASK-5.7.4** — Unsupported-sequence fallback to per-step confirmation (AC: 5)

## Dev notes

### Architecture constraints

- [AD-03](../../ARCHITECTURE.md#architecture-decisions) — toggle settings cross the typed bus; the *effect* (camera request, signature batching) is enforced where the action runs, not by the toggle UI.
- The One-Sign *batching mechanism* is owned by [EPIC-8](../epics/EPIC-8.md) (FR-82); this story owns only the security toggle that enables it and its default-off posture.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Sibling [EPIC-8](../epics/EPIC-8.md) (FR-82, multi-step / one-sign signing) — owns the batching mechanism; this story owns the toggle that gates it. Coordinate the shared setting key.
- The camera toggle gates the QR-signing surfaces owned by [EPIC-16](../epics/EPIC-16.md) (Keystone / Polkadot Vault).

### What we explicitly did NOT do

- No per-dApp One-Sign override — One-Sign is a global toggle, not a per-origin policy. Trigger to revisit: a dApp partnership that needs scoped batching.

### References

- [Source: PRD FR-59](../../PRD.md#functional-requirements) — camera access permission toggle
- [Source: PRD FR-60](../../PRD.md#functional-requirements) — single-approval (One-Sign) toggle
- [Source: ARCHITECTURE AD-03](../../ARCHITECTURE.md#architecture-decisions) — background / UI message-bus isolation

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: disable camera → QR scan surface does not request camera; enable → scan works |
| AC-2 | Manual: One-Sign off → multi-step sequence confirms each step |
| AC-3 | Manual: One-Sign on → supported sequence confirms with one approval |
| AC-4 | Manual: fresh install → both toggles in conservative default; settings persist after restart |
| AC-5 | Manual: One-Sign on + unsupported sequence → falls back to per-step |

## Changelog entry

### Added
- Camera-access toggle (FR-59) gating the QR-scan camera permission, and a
  One-Sign single-approval toggle (FR-60) opting in to single-signature
  confirmation of supported multi-step transaction sequences — both default-safe.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-59](../../PRD.md#functional-requirements), [PRD FR-60](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [US-5.6](US-5.6-auto-lock-timer-and-unlock-type.md)
