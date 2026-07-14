---
id: US-3.7
title: "Account derivation: custom path & child accounts"
epic: EPIC-3
status: done
priority: P2
points: 3
sprint: sprint-2022-M02
version_shipped: 0.2.1
prd_ref: [FR-26, FR-27]
arch_ref: [AD-04, AD-11]
depends_on: [US-3.5, US-2.1]
assignee: barrutko
commit: eeac2c1064c591dd33af129a323d2c57ce191bfa, d0de8c0f34c11d1506b68ff592c2ddc451919caa
created: 2026-06-11
updated: 2026-07-14
---

## Goal

An advanced user can create accounts on a custom derivation path and spin up
child (derived) accounts from a parent — with the wallet auto-picking the next
index and keeping a per-parent derived-account list — so that one seed organizes
into as many deterministic sub-accounts as they need, all recoverable from that
single backup.

## Background

This story extends the Unified Account model
([US-3.5](US-3.5-the-unified-account-model.md), AD-11) with the two derivation
capabilities:

- **Custom derivation path ([FR-26](../../PRD.md#functional-requirements))** — create an account on a
  user-supplied derivation path for advanced/interop scenarios.
- **Derive child accounts ([FR-27](../../PRD.md#functional-requirements))** — create and manage derived
  (child) accounts from a parent: **auto next-index** derivation plus a
  **per-parent derived-account list**, for both unified and solo parents.

All derivation is deterministic ([NFR-18](../../PRD.md#non-functional-requirements)) and runs **in the
background keyring** ([AD-04](../../ARCHITECTURE.md#architecture-decisions)) — the
child keys never cross to the UI, holding the [EPIC-3](../epics/EPIC-3.md) "no
key on the message bus" invariant. Because derivation is deterministic, every
derived account is reproducible from the parent seed + path with no extra backup.

Materializes [FR-26](../../PRD.md#functional-requirements) and [FR-27](../../PRD.md#functional-requirements). **Retroactive** —
both already ship; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a parent account, **When** the user derives a child
  with no path specified, **Then** the wallet uses the next free index and adds
  the account to the parent's derived-account list (FR-27).
- [x] **AC-2** — **Given** a parent account, **When** the user supplies a valid
  custom derivation path, **Then** an account is created on that path,
  reproducibly (FR-26, NFR-18), with keys derived only in the background (AD-04).
- [x] **AC-3** — **Given** both unified and solo parents, **When** child accounts
  are derived, **Then** each parent maintains its own derived-account list.
- [x] **AC-4** — **Given** an invalid / malformed derivation path, **When** the
  user submits it, **Then** derivation is rejected with a clear error and no
  account is persisted.

## Tasks

- [x] **TASK-3.7.1** — Auto next-index child derivation + per-parent list (AC: 1, 3)
- [x] **TASK-3.7.2** — Custom derivation-path account creation (AC: 2)
- [x] **TASK-3.7.3** — Derived-account lists for unified and solo parents (AC: 3)
- [x] **TASK-3.7.4** — Derivation-path validation + error states (AC: 4)

## Dev notes

### Architecture constraints

- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — derivation between
  unified and solo accounts is part of the unified model; child accounts are
  reproducible from the parent seed.
- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — derivation runs in the
  background; child keys never reach UI or inject scripts.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-3.5](US-3.5-the-unified-account-model.md) — derivation extends
  the Unified Account model and its solo/unified parents.
- Builds on US-2.1 (keyring engine) — derivation runs on the keyring substrate.
- Builds on [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md) /
  [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md) — parents come
  from create / import.

### References

- [Source: PRD FR-26](../../PRD.md#functional-requirements) — custom derivation path support
- [Source: PRD FR-27](../../PRD.md#functional-requirements) — derive child accounts (auto-index + list)
- [Source: PRD NFR-18](../../PRD.md#non-functional-requirements) — deterministic account derivation
- [Source: ARCHITECTURE AD-11](../../ARCHITECTURE.md#architecture-decisions) — unified account / derivation
- [Source: ARCHITECTURE AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to background

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: derive a child with no path → next index used, added to parent list |
| AC-2 | Manual: derive on a custom path → account created, reproducible on re-derive |
| AC-3 | Manual: derive from unified and solo parents → each keeps its own list |
| AC-4 | Unit test: malformed derivation path → rejected, no account persisted |

## Changelog entry

### Added
- Custom derivation-path account creation.
- Derived (child) accounts from a parent: auto next-index derivation plus a
  per-parent derived-account list, for unified and solo parents.

**Commit**:

## Implementation notes

**Inherited from polkadot-js — `version_shipped` corrected 2026-07-14 ([CONTEXT D101](../../CONTEXT.md)).**
This capability was **not built by SubWallet**. It came with the fork: SubWallet-Extension is a
fork of the **polkadot-js extension**, and inherited its git history, tags and CHANGELOG.

| | |
| --- | --- |
| Upstream release | **0.24.1** (2020-04-19) — a **polkadot-js** release, not a SubWallet one |
| Upstream author | `barrutko` — a polkadot-js maintainer |
| Upstream commit | `eeac2c1064c591dd33af129a323d2c57ce191bfa` — account derivation (custom path / child accounts) |
| **Reached a SubWallet user in** | **0.2.1** (2022-02-10) — SubWallet's **first** release |

This story used to carry `version_shipped: 0.24.1`, which was **actively misleading**: read
on SubWallet's version line, `0.24.1` sits *after* 0.8.1 — so the docs implied the capability
arrived mid-2023, when in fact **SubWallet had it from day one**. `version_shipped` answers
*"which release of **this product** first gave a user this capability"*; the answer is
**0.2.1**. Verified: the upstream commit is an ancestor of **v0.2.5**, SubWallet's earliest
tag (`git merge-base --is-ancestor`; 0.2.1 itself is untagged, so v0.2.5 is its anchor per the
[US-21.2](US-21.2-history-backfill.md) rule).

`assignee` stays `barrutko` — they wrote the code, and that is true. See [LESSONS §66](../../LESSONS.md).

_Retroactive story — capability already shipped. Fill `commit`,
`version_shipped` and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-26](../../PRD.md#functional-requirements), [PRD FR-27](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
