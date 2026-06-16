---
id: US-4.4
title: "Substrate parachain registry (200+)"
epic: EPIC-4
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: [FR-35]
arch_ref: [AD-02, AD-07]
depends_on: [US-4.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The wallet ships a Polkadot/Substrate registry covering 200+ networks
(relay chains and parachains) with a live connectivity status per chain, so a
user can find and trust any Substrate network the moment they enable it.

## Background

The Substrate side of the wallet is not a handful of chains — it is the whole
Polkadot/Kusama relay + parachain set, 200+ networks. Each enabled chain is a
`SubstrateApi` object wrapping `@polkadot/api`
([AD-02](../../ARCHITECTURE.md#architecture-decisions)). Doing that naïvely is a
memory problem: a full `ApiPromise` for 20 chains consumed ~264 MB, so balance/
token queries use the lightweight WsProvider connector and the full `ApiPromise`
is deferred to extrinsic construction
([AD-07](../../ARCHITECTURE.md#architecture-decisions)). The registry surfaces a
live connectivity indicator per chain so users see which endpoints are healthy.

This is the largest single-ecosystem surface in the epic and the reason the
AD-07 memory budget exists; the planned light-client fallback
([US-4.9](US-4.9-substrate-light-client-fallback.md)) extends it for chains with
no reachable RPC.

Materializes [FR-35](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [ ] **AC-1** — **Given** the network registry, **When** the user browses it,
  **Then** 200+ Substrate networks (relay + parachains) are listed and searchable.
- [ ] **AC-2** — **Given** an enabled Substrate chain, **When** it connects via
  `SubstrateApi`, **Then** a live connectivity status (connected / connecting /
  unavailable) is shown.
- [ ] **AC-3** — **Given** many enabled Substrate chains, **When** the wallet runs,
  **Then** balance/token queries use the lightweight WsProvider so RAM does not
  scale with the full ApiPromise per chain (AD-07).
- [ ] **AC-4** — **Given** a chain whose endpoint is unreachable, **When** connection
  is attempted, **Then** its status shows unavailable without blocking the rest of
  the registry.

## Tasks

- [ ] **TASK-4.4.1** — Registry of 200+ Substrate networks (relay + parachains), searchable (AC: 1)
- [ ] **TASK-4.4.2** — Per-chain live connectivity status driven by `SubstrateApi` connect state (AC: 2, 4)
- [ ] **TASK-4.4.3** — WsProvider-first connection; defer full `ApiPromise` to extrinsic build (AC: 3)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — each enabled Substrate chain is a managed `SubstrateApi` object.
- [AD-07](../../ARCHITECTURE.md#architecture-decisions) — lightweight WsProvider for balance queries; full ApiPromise only on extrinsic construction (memory ceiling).
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — enable/disable + custom-RPC apply to registry chains.
- Required by [US-4.9](US-4.9-substrate-light-client-fallback.md) — the light client is the fallback path for registry chains with no reachable RPC.

### Performance budget

- WsProvider-only mode: RAM ~constant regardless of enabled-chain count (full ApiPromise hit ~264 MB for 20 chains).
- Story PR must confirm balance/token queries do not instantiate a full ApiPromise per chain.

### Dev notes — points

3 pts — a registry/connectivity feature on the existing Substrate API object
(`@polkadot/api` already integrated; not a new external ecosystem), per SKILL
§3a-bis.

### References

- [Source: PRD FR-35](../../PRD.md#epic-4--chain-management) — 200+-network registry with live connectivity
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions)
- [Source: ARCHITECTURE AD-07](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: browse registry → 200+ Substrate networks searchable |
| AC-2, AC-4 | Manual: enable a chain → live status; unreachable chain → unavailable, registry usable |
| AC-3 | Manual: enable many chains → RAM stays bounded (WsProvider mode) |

## Changelog entry

### Added
- Polkadot/Substrate registry of 200+ networks with per-chain live connectivity status, on the WsProvider-first connection model.

**Commit**:

## Implementation notes

_Retroactive — capability already shipped. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [PRD FR-35](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.9](US-4.9-substrate-light-client-fallback.md)
