---
id: US-4.12
title: "Token registry enable/disable"
epic: EPIC-4
status: done
priority: P1
points: 2
sprint:
version_shipped: 1.0.1
prd_ref: [FR-43]
arch_ref: [AD-02]
depends_on: [US-4.11]
assignee: nulllpc
commit: 5c82ff0bea9f68c2c48a62e00da2d101a1605631, 83e8c110419850de1b91618d21e0ebf5055b823a
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

- [x] **AC-1** — **Given** the token-management screen, **When** the user hides a
  token, **Then** it is removed from the balance/portfolio views and the
  visibility flag persists across restarts.
- [x] **AC-2** — **Given** a hidden token, **When** the user re-enables it,
  **Then** it reappears in the portfolio with its current balance.
- [x] **AC-3** — **Given** a token is hidden, **When** the portfolio aggregates,
  **Then** the underlying chain stays connected and the token data is retained
  (hide is presentation-only, not deletion).
- [x] **AC-4** — **Given** a custom-imported token, **When** the user hides it,
  **Then** the same visibility flag applies (registry and custom tokens behave
  identically).

## Tasks

- [x] **TASK-4.12.1** — Per-token visibility flag on the asset-registry entry; persist + re-apply on restart (AC: 1, 2)
- [x] **TASK-4.12.2** — Filter balance/portfolio aggregation by visibility without dropping the chain connection (AC: 3)
- [x] **TASK-4.12.3** — Apply the flag uniformly to registry and custom tokens (AC: 4)

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

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: medium, rule: first-delivery).

**Evidence:** No changelog bullet ever names token show/hide; it shipped inside 1.0.1's generic rewrite entry "## [1.0.1] — 2023-03-31 — Upgrade: All extension UI" (release commit ad2567d9ae, which contains AssetSetting). Git evidence: Issue-1016 commits 83e8c11041 "setup assetSetting" and 5c82ff0bea "done basic logic for AssetSetting" (Feb 2023) introduce the per-token visibility flag (stores/AssetSetting.ts, ChainService, ManageTokens toggle UI); pre-rewrite v0.8.4 TokenSetting screen only deleted custom tokens, no visibility toggle. Both commits pass ancestry: in 1.0.1 release commit ad2567d9ae and in v1.0.2 (v1.0.1 was never tagged — tags start at v1.0.2). Later bullet "Enable native token automatically when enabling local token from the transfer screen (#1289)" (1.0.4) confirms the capability already existed. Medium confidence per rule 8: no explicit bullet, resolved via git.

Commits `5c82ff0bea9f68c2c48a62e00da2d101a1605631, 83e8c110419850de1b91618d21e0ebf5055b823a` verified contained in the v1.0.1 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Cross-references

- [PRD FR-43](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.11](US-4.11-custom-token-import.md)
