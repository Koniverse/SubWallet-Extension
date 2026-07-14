---
id: US-4.24
title: "Remove Polygon zkEVM logic and update chainlist"
epic: EPIC-4
status: done
priority: P1
points: 3
sprint: sprint-2026-M07
version_shipped: 1.3.82
prd_ref:
  - FR-36
arch_ref: []
depends_on: []
assignee: tunghp2002
commit: e276306dd6
created: 2026-07-09
updated: 2026-07-09
---

## Goal

Remove Polygon zkEVM network support and update the chainlist and domain configuration to reflect this change, so the wallet's supported network list is accurate.

## Background

Polygon zkEVM was previously integrated under EPIC-4 (EVM network support, FR-36). After evaluation, the decision was made to remove it from the supported network list. This story removes the Polygon zkEVM logic from the codebase and updates the chainlist and development domain configuration accordingly.

## Acceptance criteria

- [x] **AC-1** — **Given** the codebase, **When** Polygon zkEVM related code is identified, **Then** it is removed.
- [x] **AC-2** — **Given** the chainlist package, **When** Polygon zkEVM is removed, **Then** the chainlist is updated to reflect the change.
- [x] **AC-3** — **Given** the development domain configuration, **When** the change is made, **Then** the domain is updated.

## Tasks

- [x] Remove Polygon zkEVM from network registry
- [x] Update chainlist to remove Polygon zkEVM entries
- [x] Update development domain configuration
- [x] Upgrade @subwallet/chain-list to stable 0.2.128

## Dev notes — References

- Source: Issue #5002 — commits `e276306dd6`, `4bfefdafcf`, `1e60f61e46`
- RULE-13: all code and docs in English

## Verification commands

```bash
git log --oneline | grep "5002"
```

## Changelog entry

- Removed Polygon zkEVM network support; updated chainlist and domain config (US-4.24)
