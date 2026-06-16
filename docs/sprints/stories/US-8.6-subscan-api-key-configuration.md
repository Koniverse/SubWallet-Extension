---
id: US-8.6
title: "Subscan API-key configuration"
epic: EPIC-8
status: backlog
priority: P2
points: 3
sprint:
version_shipped:
prd_ref: [FR-79]
arch_ref:
depends_on: [US-8.5]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A power user can plug in their own personal Subscan API key so that
Subscan-powered queries — transaction history, transfers, staking rewards — run
against their own rate budget instead of the shared default key, so heavy use no
longer hits the shared limit. The wallet works without it; the key is an opt-in
upgrade for users who need the headroom.

## Background

Subscan backs several Substrate read paths (history, transfers, staking rewards).
The wallet ships with a shared default key that is fine for ordinary use but is a
shared rate budget; a heavy user can exhaust it. This story lets the user enter a
*personal* Subscan key in settings, which is then used for that user's
Subscan-backed requests. The key is user-supplied credential data and is stored
locally with the rest of the extension's settings state; it is never bundled and
never shared.

The surface is small — a settings field, validation that the key works, and
threading it into the Subscan request path — hence sized 3 (settings + one
integration touch-point). It builds on the history surface in
[US-8.5](US-8.5-on-chain-transaction-history.md). Materializes
[FR-79](../../PRD.md#functional-requirements). This story is **Retroactive** —
the capability already ships; `commit` / `version_shipped` are backfilled during
version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** the settings screen, **When** the user enters a Subscan
  API key, **Then** it is persisted locally and subsequent Subscan-backed queries
  (history, transfers, staking rewards) use the personal key instead of the shared
  default.
- [ ] **AC-2** — **Given** no personal key is configured, **When** Subscan-backed
  queries run, **Then** they fall back to the shared default key and the feature
  works unchanged.
- [ ] **AC-3** — **Given** an invalid or unauthorized key, **When** the user saves
  it, **Then** validation surfaces an error (key not accepted) rather than silently
  degrading every query.
- [ ] **AC-4** — **Given** a configured key, **When** the user removes it, **Then**
  the wallet reverts to the shared default key with no lingering use of the removed
  key.

## Tasks

- [ ] **TASK-8.6.1** — Settings field to enter / edit / remove the Subscan API key (AC: 1, 4)
- [ ] **TASK-8.6.2** — Persist the key in local settings state (not bundled, not shared) (AC: 1)
- [ ] **TASK-8.6.3** — Thread the personal key into the Subscan request path; default fallback (AC: 1, 2)
- [ ] **TASK-8.6.4** — Validate the key on save; surface an error if rejected (AC: 3)

## Dev notes

### Architecture constraints

- This story does NOT introduce new AD entries. The key is settings state (the
  `chrome.storage.local` settings slice described in [ARCHITECTURE](../../ARCHITECTURE.md) Data layer); it threads into the existing Subscan request path.

### Cross-story dependencies

- Builds on [US-8.5](US-8.5-on-chain-transaction-history.md) — the personal key applies to the Subscan-backed slice of that history surface.

### References

- [Source: PRD FR-79](../../PRD.md#functional-requirements) — personal Subscan API key for higher rate limits
- [Source: ARCHITECTURE §Data layer](../../ARCHITECTURE.md) — settings persistence

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: enter key in settings → Subscan queries use it |
| AC-2 | Manual: no key → queries use shared default, history still works |
| AC-3 | Manual: enter an invalid key → save surfaces an error |
| AC-4 | Manual: remove key → reverts to shared default, removed key unused |

## Changelog entry

### Added
- Personal Subscan API-key configuration in settings, threaded into Subscan-backed
  queries (history, transfers, staking rewards) with shared-default fallback and
  on-save validation.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-79](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.5](US-8.5-on-chain-transaction-history.md)
