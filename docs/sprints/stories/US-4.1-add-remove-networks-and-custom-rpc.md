---
id: US-4.1
title: "Add/remove networks + custom RPC"
epic: EPIC-4
status: done
priority: P1
points: 3
sprint: sprint-2022-M05
version_shipped: 0.4.3
prd_ref: [FR-31]
arch_ref: [AD-02]
depends_on:
assignee: saltict
commit: 4e32896869, a2ef6ef7a3, af8c77e83d
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can add or remove networks and point any chain at a custom RPC endpoint
from Settings, so the wallet is not limited to the bundled defaults and can be
repaired when a public endpoint is down.

## Background

Network management is the entry point of the whole chain-management surface: a
user adds a network (by chain spec / genesis), removes one they do not use, and
overrides the RPC endpoint per chain when the default is rate-limited or
offline. Each enabled chain is connected through a `ChainService` per-chain API
object ([AD-02](../../ARCHITECTURE.md#architecture-decisions)); custom-RPC and
enable/disable state is persisted in the background store and re-applied on
re-connect.

This is the foundation the rest of the epic builds on — the registry
([US-4.4](US-4.4-substrate-parachain-registry.md)), bulk operations
([US-4.2](US-4.2-bulk-disable-and-reset-default-networks.md)) and the
light-client fallback ([US-4.9](US-4.9-substrate-light-client-fallback.md)) all
manipulate the same active-chain configuration this story owns.

Materializes [FR-31](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** the Manage Networks screen, **When** the user enables or
  adds a network, **Then** a `ChainService` API object is created and the network
  becomes active with a connectivity indicator.
- [x] **AC-2** — **Given** an active network, **When** the user enters a custom RPC
  URL, **Then** the chain reconnects through that endpoint and the override
  persists across restarts.
- [x] **AC-3** — **Given** a network the user removes/disables, **When** removal is
  confirmed, **Then** the chain is disconnected and its API object torn down.
- [x] **AC-4** — **Given** an invalid or unreachable custom RPC URL, **When** the
  user saves it, **Then** a clear connection error is shown and the prior working
  endpoint is retained (nothing is silently broken).

## Tasks

- [x] **TASK-4.1.1** — Manage-Networks add/enable/remove flow wired to `ChainService` lifecycle (AC: 1, 3)
- [x] **TASK-4.1.2** — Per-chain custom-RPC override: persist + reconnect (AC: 2)
- [x] **TASK-4.1.3** — Custom-RPC validation + connection-failure error state, keep last-good endpoint (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — enable/disable and custom RPC operate on the per-chain API object lifecycle; no ad-hoc chain lookups.
- This story introduces no new AD entries.

### Cross-story dependencies

- Required by [US-4.2](US-4.2-bulk-disable-and-reset-default-networks.md) — bulk disable/reset operates on the active-chain set this story manages.
- Required by [US-4.4](US-4.4-substrate-parachain-registry.md) — the registry is the catalog this add/enable flow draws from.

### Dev notes — points

3 pts — a config/registry feature on top of the existing `ChainService` engine
(no external system integration), per SKILL §3a-bis (multi-doc / internal
integration).

### References

- [Source: PRD FR-31](../../PRD.md#epic-4--chain-management) — add/remove networks; custom RPC per chain
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-3 | Manual: enable then remove a network → connects then tears down |
| AC-2 | Manual: set a custom RPC, restart → override persists, chain connects via it |
| AC-4 | Manual: enter a bad RPC URL → error shown, previous endpoint retained |

## Changelog entry

### Added
- Add / remove networks and per-chain custom RPC endpoint configuration from Settings.

**Commit**:

## Implementation notes

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: high, rule: first-delivery).

**Evidence:** CHANGELOG "## [0.4.3] — 2022-05-31": "Custom network, Custom Endpoint (#36)" — earliest bullet delivering add/remove networks with a custom RPC endpoint; delivered via feature branch koni/dev/issue-36-52 whose PR #229 merge (4e32896869, 196 files) and delete-network feature commit (a2ef6ef7a3) are verified ancestors of v0.4.3. Later "Temporarily remove 'Add custom network' (#464)" in 0.5.3 was explicitly temporary and the capability returned (custom-network bullets resume in 1.x), so no removal flag.

Commits `4e32896869, a2ef6ef7a3, af8c77e83d` verified contained in the v0.4.3 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Cross-references

- [PRD FR-31](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.2](US-4.2-bulk-disable-and-reset-default-networks.md) · [US-4.4](US-4.4-substrate-parachain-registry.md)
