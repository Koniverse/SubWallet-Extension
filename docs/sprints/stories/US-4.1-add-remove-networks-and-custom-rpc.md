---
id: US-4.1
title: "Add/remove networks + custom RPC"
epic: EPIC-4
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: [FR-31]
arch_ref: [AD-02]
depends_on:
assignee:
commit:
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

- [ ] **AC-1** — **Given** the Manage Networks screen, **When** the user enables or
  adds a network, **Then** a `ChainService` API object is created and the network
  becomes active with a connectivity indicator.
- [ ] **AC-2** — **Given** an active network, **When** the user enters a custom RPC
  URL, **Then** the chain reconnects through that endpoint and the override
  persists across restarts.
- [ ] **AC-3** — **Given** a network the user removes/disables, **When** removal is
  confirmed, **Then** the chain is disconnected and its API object torn down.
- [ ] **AC-4** — **Given** an invalid or unreachable custom RPC URL, **When** the
  user saves it, **Then** a clear connection error is shown and the prior working
  endpoint is retained (nothing is silently broken).

## Tasks

- [ ] **TASK-4.1.1** — Manage-Networks add/enable/remove flow wired to `ChainService` lifecycle (AC: 1, 3)
- [ ] **TASK-4.1.2** — Per-chain custom-RPC override: persist + reconnect (AC: 2)
- [ ] **TASK-4.1.3** — Custom-RPC validation + connection-failure error state, keep last-good endpoint (AC: 4)

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

_Retroactive — capability already shipped. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [PRD FR-31](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.2](US-4.2-bulk-disable-and-reset-default-networks.md) · [US-4.4](US-4.4-substrate-parachain-registry.md)
