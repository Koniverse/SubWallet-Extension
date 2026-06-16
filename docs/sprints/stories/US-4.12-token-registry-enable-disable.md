---
id: US-4.12
title: "Token registry enable/disable"
epic: EPIC-4
status: backlog
priority: P1
points: 2
sprint:
version_shipped:
prd_ref: [FR-43]
arch_ref: [AD-02]
depends_on: [US-4.11]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can show or hide individual tokens so the portfolio displays only the
assets they care about, keeping a multi-chain wallet legible without removing the
underlying chain or token data.

## Background

With 200+ chains and auto-detected tokens, the asset list can grow noisy. Token
registry management lets the user toggle per-token **visibility** — a presentation
flag on the asset-registry entry, distinct from enabling/disabling the chain
itself ([US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md)). Hiding a token
does not delete it or stop the chain connection; it only removes the token from
the balance/portfolio views. The flag applies equally to registry tokens
(populated via AD-25 / [US-4.3](US-4.3-auto-update-chain-list-and-token-metadata.md))
and to custom-imported tokens ([US-4.11](US-4.11-custom-token-import.md)).

Materializes [FR-43](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [ ] **AC-1** — **Given** the token-management screen, **When** the user hides a
  token, **Then** it is removed from the balance/portfolio views and the
  visibility flag persists across restarts.
- [ ] **AC-2** — **Given** a hidden token, **When** the user re-enables it,
  **Then** it reappears in the portfolio with its current balance.
- [ ] **AC-3** — **Given** a token is hidden, **When** the portfolio aggregates,
  **Then** the underlying chain stays connected and the token data is retained
  (hide is presentation-only, not deletion).
- [ ] **AC-4** — **Given** a custom-imported token, **When** the user hides it,
  **Then** the same visibility flag applies (registry and custom tokens behave
  identically).

## Tasks

- [ ] **TASK-4.12.1** — Per-token visibility flag on the asset-registry entry; persist + re-apply on restart (AC: 1, 2)
- [ ] **TASK-4.12.2** — Filter balance/portfolio aggregation by visibility without dropping the chain connection (AC: 3)
- [ ] **TASK-4.12.3** — Apply the flag uniformly to registry and custom tokens (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — visibility is a registry-entry flag; it does not tear down or create a chain API object.
- Visibility is a presentation concern only — the balance engine (EPIC-2) still tracks the token; hide filters the view.
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.11](US-4.11-custom-token-import.md) — extends the same asset-registry entry with a visibility flag; custom and registry tokens share the flag.
- Sibling of the balance views (EPIC-7) — they read the visibility flag when aggregating the portfolio.

### Dev notes — points

2 pts — a small config feature: a single persisted visibility flag with a view
filter, no external system and no new chain object, per SKILL §3a-bis (single
file / internal review).

### References

- [Source: PRD FR-43](../../PRD.md#epic-4--chain-management) — enable/disable tokens (visibility)
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: hide a token, restart → stays hidden in the portfolio |
| AC-2 | Manual: re-enable → reappears with balance |
| AC-3 | Manual: hide a token → chain still connected, data retained |
| AC-4 | Manual: hide a custom-imported token → behaves like a registry token |

## Changelog entry

### Added
- Token registry management: per-token show/hide (visibility) for registry and custom-imported tokens.

**Commit**:

## Implementation notes

_Retroactive — capability already shipped. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [PRD FR-43](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.11](US-4.11-custom-token-import.md)
