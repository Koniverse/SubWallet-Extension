---
id: US-4.9
title: "Substrate light-client fallback"
epic: EPIC-4
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: [FR-40]
arch_ref: [AD-02]
depends_on: [US-4.4]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

When no RPC endpoint is reachable for a Substrate chain, the wallet falls back to
a light client so the user can still connect, rather than seeing a dead network.

## Background

Public RPC endpoints go down, get rate-limited, or simply do not exist for some
chains. SubWallet's `SubstrateApi` wraps `@polkadot/api` with a light-client
fallback via `@substrate/connect`
([AD-02](../../ARCHITECTURE.md#architecture-decisions)), so a chain with no
reachable WS RPC can sync directly via the embedded light client instead of
showing as permanently unavailable in the registry
([US-4.4](US-4.4-substrate-parachain-registry.md)).

This is the resilience layer of the Substrate ecosystem: it trades some sync
latency for connectivity when the centralized RPC path fails.

Materializes [FR-40](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [ ] **AC-1** — **Given** a Substrate chain whose RPC endpoints are all
  unreachable, **When** the user enables it, **Then** the wallet connects via the
  `@substrate/connect` light client instead of failing.
- [ ] **AC-2** — **Given** the light-client connection, **When** it is active,
  **Then** balance/account queries resolve through it and the connectivity status
  reflects the light-client path.
- [ ] **AC-3** — **Given** neither RPC nor light client can sync, **When** connection
  is attempted, **Then** the chain shows unavailable with a clear status, without
  blocking other chains.

## Tasks

- [ ] **TASK-4.9.1** — `@substrate/connect` light-client provider wired into `SubstrateApi` fallback path (AC: 1)
- [ ] **TASK-4.9.2** — Query routing + connectivity-status reporting over the light client (AC: 2)
- [ ] **TASK-4.9.3** — Terminal-failure state when neither RPC nor light client syncs (AC: 3)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — the light client is a fallback transport inside the same `SubstrateApi` API-object model.
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.4](US-4.4-substrate-parachain-registry.md) — fallback applies to registry chains; reuses the connectivity-status surface.

### Dev notes — points

3 pts — a resilience/connectivity feature on the existing Substrate API object;
`@substrate/connect` is already a dependency (not a new external ecosystem
build), per SKILL §3a-bis.

### References

- [Source: PRD FR-40](../../PRD.md#epic-4--chain-management) — Substrate light-client fallback
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2 | Manual: enable a chain with no reachable RPC → connects via light client, queries resolve |
| AC-3 | Manual: unsyncable chain → unavailable status, other chains unaffected |

## Changelog entry

### Added
- Substrate light-client fallback (`@substrate/connect`) for chains with no reachable RPC endpoint.

**Commit**:

## Implementation notes

_Retroactive — capability already shipped. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [PRD FR-40](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.4](US-4.4-substrate-parachain-registry.md)
