---
id: US-6.4
title: "Settings management: network selection, token preferences, account metadata"
epic: EPIC-6
status: backlog
priority: P2
points: 3
sprint:
version_shipped:
prd_ref: [FR-66]
arch_ref: [AD-03]
depends_on:
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Give users one place to shape how the wallet behaves: which networks are active,
which tokens show, and how their accounts are labeled. Settings is the shared
preference surface every feature reads from, so users tune the wallet once and
every screen respects it.

## Background

A multi-chain wallet that surfaces 200+ networks and their tokens is unusable
without per-user control over what appears. FR-66 ships **settings management**:
network selection (enable/disable chains), token preferences (which tokens are
visible, custom-token entries), and account metadata (naming, per-account
labels). These preferences are persisted by the background `SettingService` and
read by every feature surface, so a user's choices apply consistently across the
extension, web app, and mobile.

All preference reads/writes cross the typed message bus
([AD-03](../../ARCHITECTURE.md#architecture-decisions)) — the Settings UI never
mutates chain or key state directly; it sends `pri(…)` requests the background
applies. This story owns the **preference surface**, not the *behavior* behind
every entry point: the security entries (master password, auto-lock) render here
but their policy is owned by [EPIC-5](EPIC-5.md), and account-identity flows are
owned by [EPIC-3](EPIC-3.md). Display-currency selection — also a Settings entry
— is split into its own story [US-6.5](US-6.5-display-fiat-currency-selection.md)
because it has its own FR (FR-67).

Materializes [FR-66](../../PRD.md#functional-requirements). This story is **retroactive** — the
capability already ships in the product; `commit` / `version_shipped` are
backfilled during version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** the Settings screen, **When** the user enables or
  disables a network, **Then** the change persists via the background
  `SettingService` and the affected chain's assets appear/disappear across the
  app.
- [ ] **AC-2** — **Given** token preferences, **When** the user toggles a token's
  visibility (or adds a custom token), **Then** the preference persists and is
  honored on every balance/asset surface.
- [ ] **AC-3** — **Given** account metadata, **When** the user renames or
  re-labels an account, **Then** the new name persists and is reflected
  everywhere the account is shown.
- [ ] **AC-4** — **Given** any Settings mutation, **When** it is applied, **Then**
  it is sent over the typed `pri(…)` message bus
  ([AD-03](../../ARCHITECTURE.md#architecture-decisions)) — the UI never mutates
  chain/key state directly.
- [ ] **AC-5** — **Given** an invalid preference input (e.g. a malformed custom-
  token contract), **When** the user submits it, **Then** the setting is rejected
  with a clear error and no partial/corrupt state is persisted.

## Tasks

- [ ] **TASK-6.4.1** — Network selection UI + persistence via `SettingService`
  (AC: 1, 4)
- [ ] **TASK-6.4.2** — Token preference / visibility + custom-token entry (AC: 2,
  4, 5)
- [ ] **TASK-6.4.3** — Account metadata (rename / label) persistence and
  propagation (AC: 3, 4)
- [ ] **TASK-6.4.4** — Validate preference inputs and surface error states; ensure
  the theme selector stays hidden (FR-63, US-6.1) (AC: 5)

## Dev notes

### Architecture constraints

- [AD-03](../../ARCHITECTURE.md#architecture-decisions) — Settings mutations go
  through `pri(…)` messages to the background; the UI holds no authoritative
  preference state.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Sibling [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md) — owns the
  Settings shell and the hidden theme selector (FR-63); coordinate the surface.
- Sibling [US-6.5](US-6.5-display-fiat-currency-selection.md) — the display-currency
  entry lives in this same Settings surface but is materialized separately under
  FR-67.
- Renders entry points whose behavior is owned by [EPIC-5](EPIC-5.md) (security
  settings) and [EPIC-3](EPIC-3.md) (account flows) — this story does not own
  those policies.

### What we explicitly did NOT do

- No theme/appearance toggle — dark-only per FR-63 (US-6.1); the selector stays
  hidden.
- No security-policy behavior (lock/unlock rules) — owned by EPIC-5; Settings
  only renders the entry points.

### References

- [Source: PRD FR-66](../../PRD.md#functional-requirements) — settings management (network, token, account metadata)
- [Source: ARCHITECTURE AD-03](../../ARCHITECTURE.md#architecture-decisions) — background / UI message-bus isolation
- [Source: code] `packages/extension-base/src/services/setting-service/`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: Settings → toggle a network → assets for that chain appear/disappear; persists across reload |
| AC-2 | Manual: hide a token / add a custom token → reflected on balance surfaces and persisted |
| AC-3 | Manual: rename an account → new name shown everywhere and persisted |
| AC-4 | Audit: Settings writes use `pri(settings.*)` handlers; no direct chain/key mutation in UI |
| AC-5 | Manual: submit a malformed custom-token contract → rejected with error, no state persisted |

## Changelog entry

### Added
- Settings management: network selection (enable/disable chains), token preferences (visibility + custom tokens), and account metadata (rename/label), all persisted via the background `SettingService`.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-66](../../PRD.md#functional-requirements)
- [Epic EPIC-6](../epics/EPIC-6.md)
- [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md)
- [US-6.5](US-6.5-display-fiat-currency-selection.md)
