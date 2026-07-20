---
id: US-5.7
title: "Camera-access + One-Sign toggles"
epic: EPIC-5
status: done
priority: P0
points: 3
sprint: sprint-2025-M02
version_shipped: 1.3.21
prd_ref: [FR-59, FR-60]
arch_ref: [AD-03]
depends_on:
assignee: S2kael
commit: 2f5a47c2df, ff5b6b565e, 872d7b808a
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The user controls two security-relevant conveniences from settings: a
**camera-access** toggle that enables or disables the camera used for QR scanning
(FR-59), and a **One-Sign** (single-approval) toggle controlling whether
multiple sequential transactions are confirmed with a single signature (FR-60) — so
each user can decide whether to widen their attack/permission surface for
convenience or keep it minimal. **The two toggles ship with opposite defaults**:
camera **off**, One-Sign **on**.

## Background

These two FRs are merged into one story because they are a single Settings
cluster of security toggles: each lets the user *enlarge* or narrow a
permission surface. They do **not** share a default — `DEFAULT_CAMERA_ENABLE = false`
but `DEFAULT_ALLOW_ONE_SIGN = true`
(`packages/extension-base/src/services/setting-service/constants.ts:19`, applied at
`:57`). The **camera-access toggle** (FR-59)
gates the browser camera permission used for QR-code scanning (Keystone / Polkadot
Vault signing, address scanning); a user who never scans QR codes can keep the
camera disabled so no surface requests it. The **One-Sign toggle** (FR-60) governs
the single-approval flow where a sequence of transactions (e.g. an approve-then-swap,
or a multi-step earning path) is confirmed once rather than per-step. It ships **on**,
so it is opt-**out**: a user who wants per-step confirmation turns it off. What
narrows the exposure is not the default but three conditions in the mechanism — it
applies only to `AccountSignMode.PASSWORD` accounts (never Ledger / QR / injected —
`useOneSignProcess.ts:14`), only to processes of **3+ steps**, and only to `SWAP` and
`EARNING` process types
(`packages/extension-base/src/services/transaction-service/README.md` §One-Sign
Multi-Step Process).

The One-Sign *mechanism* (the multi-step batching itself) is materialized in the
transaction epic ([EPIC-8](../epics/EPIC-8.md), FR-82); this story owns only the
**security toggle** that controls it and the shipped defaults. Both settings
are persisted and exchanged with the background over the typed bus (AD-03); their
effect (whether the camera is requested, whether sequential signatures collapse
into one) is enforced where the action runs, not in the toggle UI.

Materializes [FR-59](../../PRD.md#functional-requirements) and [FR-60](../../PRD.md#functional-requirements). This story is
**retroactive** — already shipped; `commit` / `version_shipped` are backfilled
during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** the security settings, **When** the user toggles
  camera access off, **Then** QR-scanning surfaces do not request the camera and
  the camera permission is not held; toggling it on re-enables QR scanning (FR-59).
- [x] **AC-2** — **Given** the One-Sign toggle is turned **off** by the user, **When**
  the user performs a multi-step transaction sequence, **Then** each step is confirmed
  individually (no single-signature batching).
- [x] **AC-3** — **Given** the One-Sign toggle is **on**, **When** the user
  performs a supported multi-step sequence, **Then** the sequence is confirmed with
  a single approval (FR-60), delegating to the EPIC-8 one-sign mechanism.
- [x] **AC-4** — Both toggles persist across sessions and, on a fresh install, take
  their shipped defaults — **camera off**, **One-Sign on**
  (`DEFAULT_CAMERA_ENABLE = false`, `DEFAULT_ALLOW_ONE_SIGN = true`).
- [x] **AC-5** — **Given** the One-Sign toggle is on, **When** the user reaches an
  *unsupported* sequence, **Then** the flow falls back to per-step confirmation
  rather than silently batching an unsupported set.

## Tasks

- [x] **TASK-5.7.1** — Camera-access toggle: gate the QR-scan camera permission (AC: 1) — no camera request when off
- [x] **TASK-5.7.2** — One-Sign toggle wiring into the EPIC-8 multi-step flow (AC: 2, 3) — off ⇒ per-step, on ⇒ single approval
- [x] **TASK-5.7.3** — Persist both settings with conservative defaults (AC: 4) — over the typed bus (AD-03)
- [x] **TASK-5.7.4** — Unsupported-sequence fallback to per-step confirmation (AC: 5)

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
| AC-4 | `grep -E 'DEFAULT_(CAMERA_ENABLE\|ALLOW_ONE_SIGN)' packages/extension-base/src/services/setting-service/constants.ts` → `false` / `true` respectively, both applied in `DEFAULT_SETTING` (`:57`) · Manual: settings persist after restart |
| AC-5 | Manual: One-Sign on + unsupported sequence → falls back to per-step |

## Changelog entry

### Added
- Camera-access toggle (FR-59) gating the QR-scan camera permission, and a
  One-Sign single-approval toggle (FR-60) opting in to single-signature
  confirmation of supported multi-step transaction sequences — both default-safe.

**Commit**:

## Implementation notes

**Two toggles, two lineages — one built here, one inherited.** This story bundles a setting
SubWallet built with one that arrived with the fork:

| Capability | Built by | Commit | Lineage |
| --- | --- | --- | --- |
| **One-Sign toggle** | `S2kael` (SubWallet) | `2f5a47c2df` (`[Issue-3901]`), merged in `ff5b6b565e` (PR #4056) | this product — shipped **1.3.21** (2025-02) |
| **Camera-access toggle** | `jacogr` (Jaco Greeff) — polkadot-js | `872d7b808a` *"Allow settings for camera (#183)"* (2019-10-24) | **inherited**, pre-fork — came with the fork ([CONTEXT D105](../../CONTEXT.md)); reached a SubWallet user in **0.2.1** |

`assignee` and `version_shipped` name the **new** half (the One-Sign toggle). The camera-access
toggle is **not SubWallet's work** — it is **Inherited from polkadot-js**, flagged here for the same reason the
pure-inherited stories are ([CONTEXT D101](../../CONTEXT.md), [LESSONS §66](../../LESSONS.md)): a
pre-fork commit sitting under a SubWallet-assigned story would otherwise read as ours.

## Cross-references

- [PRD FR-59](../../PRD.md#functional-requirements), [PRD FR-60](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [US-5.6](US-5.6-auto-lock-timer-and-unlock-type.md)
