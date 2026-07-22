---
id: US-3.9
title: "Unified → Solo account split"
epic: EPIC-3
status: backlog
priority: P0
points: 3
sprint:
version_shipped:
prd_ref: [FR-23]
arch_ref: [AD-11]
depends_on: [US-3.5]
assignee:
commit:
created: 2026-07-13
updated: 2026-07-13
---

## Goal

A user holding a unified account can **split it back into per-chain solo accounts**
without re-entering or re-backing-up the seed, so that the unified model is a
reversible choice rather than a one-way door.

## Background

[US-3.5](US-3.5-the-unified-account-model.md) shipped the unified account and the
**solo → unified** direction (merge, [FR-22](../../PRD.md#functional-requirements)).
The reverse direction — **unified → solo** ([FR-23](../../PRD.md#functional-requirements))
— was scoped inside that story as a forward AC and **was never implemented**.

The code confirms it: at `v1.3.82` the keyring service carries
`SoloAccountToBeMigrated`, `soloAccountsNeedToBeMigrated`,
`soloAccountsNeedToBeMigratedGroup` — every symbol points *into* the unified model.
There is no `separateAccount` / `unifiedToSolo` surface anywhere in
`packages/extension-base/src` or `packages/extension-koni-ui/src`.

Carved out of US-3.5 on 2026-07-13 during the US-21.2 backfill: US-3.5 is `done` for
its shipped scope, and a `done` story cannot carry an unticked acceptance criterion.
See [US-21.2](US-21.2-history-backfill.md) — the FR-23 row had been marked
`✅ shipped` on the strength of US-3.5 being done, which is exactly the trap a
multi-FR story sets.

📋 **Planned / forward** — no code yet.

## Acceptance criteria

- [ ] **AC-1** — **Given** a unified account, **When** the user splits it, **Then**
  per-chain solo accounts result without the user re-entering the seed.
- [ ] **AC-2** — **Given** the split completes, **Then** every resulting solo account
  addresses the same key material as the unified account did for that ecosystem
  (same addresses, no silent re-derivation).
- [ ] **AC-3** — **Given** a split is requested, **When** it fails partway, **Then**
  no account is left in a half-migrated state — the operation is all-or-nothing.

## Tasks

- [ ] **TASK-3.9.1** — Unified → Solo split in the keyring service's account context (AC: 1, 2)
- [ ] **TASK-3.9.2** — Split flow UI + confirmation of the resulting addresses (AC: 1, 2)
- [ ] **TASK-3.9.3** — Atomicity / rollback on partial failure (AC: 3)

## Dev notes

### Architecture constraints

- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — the unified-account model; the split must respect the same per-ecosystem derivation, not invent a second one.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-3.5](US-3.5-the-unified-account-model.md) — the unified model and the solo → unified merge it reverses.

### Points justification

3 pts — one flow against an existing engine seam (account context already models both
shapes; the merge path is the template to invert). No new external system, no new AD.

### References

- [Source: PRD FR-23](../../PRD.md#functional-requirements) — Unified → Solo account split
- Carved out of [US-3.5](US-3.5-the-unified-account-model.md) AC-5 / TASK-3.5.4

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: split a unified account → per-chain solo accounts appear, no seed prompt |
| AC-2 | Manual: compare each solo address against the unified account's address for that ecosystem |
| AC-3 | Manual: interrupt the split → no half-migrated account remains |

## Changelog entry

### Added
- Split a unified account back into per-chain solo accounts.

**Commit**:

## Implementation notes

_Planned / forward story — not yet shipped. Fill on implementation._

## Cross-references

- [PRD FR-23](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.5](US-3.5-the-unified-account-model.md)
