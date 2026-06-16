---
id: US-8.11
title: "Export transaction history"
epic: EPIC-8
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: [FR-84]
arch_ref:
depends_on: [US-8.5]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can export their transaction history to a file — for accounting, tax
reporting, or personal record-keeping — so that the wallet's history is portable
and not trapped inside the extension. This is the one **forward-looking** story in
the epic: the rest of EPIC-8 is shipped, this one is planned.

## Background

Transaction history is currently view-only inside the wallet
([US-8.5](US-8.5-on-chain-transaction-history.md)). Users who need their activity
for tax season or bookkeeping have no way to get it out except manual copying.
This story adds an **export** of the merged history (in-app submissions + indexer
records) to a portable file format (e.g. CSV/JSON) covering the fields a user needs
to reconcile: date, type, token, amount, counterparty, fee, status, and chain.

Unlike the other EPIC-8 stories this is **planned, not shipped** — FR-84 is
`📋 planned` in the [PRD](../../PRD.md#functional-requirements). It is therefore authored forward (real
acceptance criteria to be implemented), not retroactively backfilled. It builds
directly on the assembled-history surface of US-8.5. Sized 3 (a serializer +
file-download over existing merged data, with format/field decisions).
Materializes [FR-84](../../PRD.md#functional-requirements). Tracked by
[#4124](https://github.com/Koniverse/SubWallet-Extension/issues/4124) — Allow export transaction history.

## Acceptance criteria

- [ ] **AC-1** — **Given** an account with transaction history, **When** the user
  chooses Export, **Then** a file is produced containing that account's merged
  history (in-app + indexer) with date, type, token, amount, counterparty, fee,
  status and chain per row.
- [ ] **AC-2** — **Given** the export, **When** it is generated, **Then** amounts
  are written in human-readable token units (formatted by decimals) and the file
  parses cleanly in a spreadsheet / standard reader (well-formed CSV/JSON).
- [ ] **AC-3** — **Given** a filtered or ranged history view (e.g. a date range or
  a single chain), **When** the user exports, **Then** the export reflects the
  active filter rather than always dumping everything.
- [ ] **AC-4** — **Given** an account with no transaction history, **When** the
  user attempts Export, **Then** the export is either disabled or produces a
  valid empty file with headers — never a malformed or partial file.

## Tasks

- [ ] **TASK-8.11.1** — History serializer: merged history → rows with the reconciliation fields (AC: 1)
- [ ] **TASK-8.11.2** — Format amounts in token units; emit well-formed CSV/JSON (AC: 2)
- [ ] **TASK-8.11.3** — Respect the active history filter / range in the export (AC: 3)
- [ ] **TASK-8.11.4** — File-download trigger from the history screen (AC: 1)
- [ ] **TASK-8.11.5** — Empty-history handling: disabled or valid headers-only file (AC: 4)

## Dev notes

### Architecture constraints

- This story does NOT introduce new AD entries. It serializes the already-merged
  history from [US-8.5](US-8.5-on-chain-transaction-history.md); no new chain calls
  or indexer integration.

### Cross-story dependencies

- Builds on [US-8.5](US-8.5-on-chain-transaction-history.md) — exports the merged history that story assembles; depends on its reconciliation contract for accurate rows.

### What we explicitly did NOT do

- No scheduled / automatic export and no cloud upload — manual on-demand file export only. Trigger to revisit: a user request for recurring accounting exports.

### References

- [Source: PRD FR-84](../../PRD.md#functional-requirements) — export transaction history (planned)
- [Source: ARCHITECTURE §Transaction & request subsystem](../../ARCHITECTURE.md)
- [Roadmap issue #4124](https://github.com/Koniverse/SubWallet-Extension/issues/4124) — Allow export transaction history

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: Export → file contains merged history with all reconciliation fields |
| AC-2 | Manual: open the file in a spreadsheet → parses cleanly, amounts in token units |
| AC-3 | Manual: apply a date/chain filter → export reflects only the filtered rows |
| AC-4 | Manual: empty-history account → Export disabled or valid headers-only file |

## Changelog entry

### Added
- Transaction history export: download an account's merged history (date, type,
  token, amount, counterparty, fee, status, chain) as a well-formed CSV/JSON file,
  respecting the active filter, with safe empty-history handling.

**Commit**:

## Implementation notes

_Planned story (FR-84) — authored forward. Fill `commit` / `version_shipped` on
ship._

## Cross-references

- [PRD FR-84](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.5](US-8.5-on-chain-transaction-history.md)
- [Roadmap issue #4124](https://github.com/Koniverse/SubWallet-Extension/issues/4124) — Allow export transaction history
