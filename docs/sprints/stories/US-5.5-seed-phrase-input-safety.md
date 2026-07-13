---
id: US-5.5
title: "Seed-phrase input safety"
epic: EPIC-5
status: done
priority: P0
points: 2
sprint:
version_shipped: 1.1.10
prd_ref: [FR-56]
arch_ref: [AD-04]
depends_on:
assignee: S2kael
commit: b6ed1bab75, 3bdec2605f, 4489d8ee5c
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Every field that accepts or displays a seed phrase or private key uses an
`<input>` element, never a `<textarea>` — so that the browser's
autocomplete/autofill cache cannot capture the secret and leak it to local
storage (the "demonic vulnerability").

## Background

The "demonic vulnerability" is a concrete, shipped bug class: seed-phrase and
private-key fields rendered as `<textarea>` let the browser cache the typed
secret in autocomplete/autofill storage, where another script or a later session
could read it. The fix is structural — render these fields as `<input>` elements
with autocomplete disabled — and it was applied in v1.1.10 (issue #1798); the rule
is recorded in [LESSONS §29](../../LESSONS.md) and as the standing invariant
[NFR-7](../../PRD.md#non-functional-requirements).

This is a small but high-severity story: it is a single control (the input
element type) defending the most sensitive data in the product. It complements
the background-keyring boundary (AD-04) — even though the secret is only *parsed*
in the background, it must still be *typed* in the UI, and that typing surface is
where this leak occurs. The guard is enforceable by a lint/grep check that no
seed/key field uses `<textarea>`, so a regression cannot land silently.

Materializes [FR-56](../../PRD.md#functional-requirements). This story is **retroactive** — already
shipped (v1.1.10); `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** any seed-phrase or private-key entry field, **When**
  it renders, **Then** it is an `<input>` element (not a `<textarea>`) with
  browser autocomplete/autofill disabled.
- [x] **AC-2** — **Given** a user types a seed phrase, **When** the field is used,
  **Then** the secret is not written to the browser autocomplete/autofill cache.
- [x] **AC-3** — **Given** the codebase, **When** scanned, **Then** no
  seed-phrase / private-key field uses a `<textarea>` element (regression guard,
  LESSONS §29).

## Tasks

- [x] **TASK-5.5.1** — Ensure all seed/key fields render as `<input>` with autocomplete off (AC: 1)
- [x] **TASK-5.5.2** — Verify no secret reaches the autocomplete/autofill cache (AC: 2)
- [x] **TASK-5.5.3** — Add a lint/grep regression guard against `<textarea>` for secret fields (AC: 3) — LESSONS §29

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — the secret is only parsed/stored in the background, but it is *typed* in the UI; this story protects that typing surface.
- The rule is the standing invariant [NFR-7](../../PRD.md#non-functional-requirements) — seed phrase never rendered in a `<textarea>`.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Sibling: [EPIC-3](../epics/EPIC-3.md) create/import flows ([US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md), [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)) own the surfaces that *use* these fields; this story owns the safety rule those fields must obey.

### References

- [Source: PRD FR-56](../../PRD.md#functional-requirements) — seed phrase display via input elements only
- [Source: PRD NFR-7](../../PRD.md#non-functional-requirements) — seed phrase never rendered in a textarea
- [Source: LESSONS §29](../../LESSONS.md) — seed/key inputs must use `<input>` not `<textarea>` (issue #1798, fixed v1.1.10)
- [Source: ARCHITECTURE AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to background

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual/DOM inspect: seed/key fields are `<input>` with `autocomplete` off |
| AC-2 | Manual: type a seed → confirm nothing cached in browser autofill |
| AC-3 | `rg "<textarea" packages/ --type tsx -l` returns no seed/key-input file (LESSONS §29 guard) |

## Changelog entry

### Fixed
- Seed-phrase / private-key entry fields render as `<input>` (not `<textarea>`)
  with autocomplete disabled, preventing browser autofill caching of secrets (the
  "demonic vulnerability"); regression-guarded.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped (v1.1.10, issue #1798). Fill
`commit`, `version_shipped` and any caveats during version reconciliation._

## Cross-references

- [PRD FR-56](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [LESSONS §29](../../LESSONS.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md), [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
