---
id: US-4.2
title: "Bulk disable + reset to default networks"
epic: EPIC-4
status: done
priority: P1
points: 2
sprint: sprint-2022-M05
version_shipped: 0.4.3
prd_ref: [FR-32, FR-33]
arch_ref: [AD-02]
depends_on: [US-4.1]
assignee: nulllpc
commit: 8522b18ccc, 4e32896869
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can disable every active network at once (with a confirmation guard) and
later reset the network list back to the default active set, so they can quickly
declutter a noisy multi-chain view or recover from a misconfiguration without
toggling chains one by one.

## Background

With 200+ networks available ([US-4.4](US-4.4-substrate-parachain-registry.md)),
managing the active set one chain at a time is tedious. This story adds two bulk
operations on the active-chain configuration owned by
[US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md): **disable all** (gated by
a confirmation, because it tears down every API object) and **reset to default**
(restore the curated default active set). Both operate through `ChainService`
([AD-02](../../ARCHITECTURE.md#architecture-decisions)) so connectivity stays
consistent.

This is a merged story: FR-32 (bulk disable) and FR-33 (reset to default) share
the same Manage-Networks surface and the same active-set primitive, so they ship
together.

Materializes [FR-32, FR-33](../../PRD.md#epic-4--chain-management).
**Retroactive** — already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** several active networks, **When** the user triggers
  "disable all", **Then** a confirmation is shown, and on confirm every network is
  disabled and its API object disconnected (FR-32).
- [x] **AC-2** — **Given** a customized active set, **When** the user triggers
  "reset to default", **Then** the active set returns to the curated default
  networks (FR-33).
- [x] **AC-3** — **Given** the "disable all" confirmation, **When** the user
  cancels, **Then** no network is disabled and state is unchanged (the guard is
  honoured).

## Tasks

- [x] **TASK-4.2.1** — Disable-all action with confirmation modal, batched `ChainService` disconnect (AC: 1, 3)
- [x] **TASK-4.2.2** — Reset-to-default: restore curated default active set (AC: 2)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — bulk operations iterate the per-chain API-object lifecycle; the default active set is part of the chain registry.
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — operates on the active-chain set and enable/disable primitive from that story.

### Dev notes — points

2 pts — a config feature (two bulk actions) on an existing primitive, single
surface, internal review only, per SKILL §3a-bis.

### References

- [Source: PRD FR-32](../../PRD.md#epic-4--chain-management) — bulk disable with confirmation
- [Source: PRD FR-33](../../PRD.md#epic-4--chain-management) — reset to the default active set
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-3 | Manual: disable-all → confirm disconnects all; cancel leaves state unchanged |
| AC-2 | Manual: customize then reset → active set returns to defaults |

## Changelog entry

### Added
- Bulk "disable all networks" (with confirmation) and "reset networks to default" actions.

**Commit**:

## Implementation notes

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: medium, rule: completion).

**Evidence:** CHANGELOG 0.4.3 (2022-05-31): "Custom network, Custom Endpoint (#36)" — umbrella bullet for the issue-36-52 network-settings work whose commit 8522b18ccc adds disableAllNetworks + resetDefaultNetwork handlers AND the "Disable all"/"Reset to default" UI in Settings/networks/Networks.tsx, delivering both enumerated components (FR-32+FR-33) simultaneously; later bullets are not first delivery — 1.3.78 "Disable all networks' switch to Manage Networks page (#4970)" re-adds the switch UI after the 1.0 rewrite, and the 2022-10-18 commit "Fix error can not disconnect all or reset to default in network settings" proves the capability predated it; both reported commits pass merge-base --is-ancestor v0.4.3.

Commits `8522b18ccc, 4e32896869` verified contained in the v0.4.3 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Cross-references

- [PRD FR-32](../../PRD.md#epic-4--chain-management) · [PRD FR-33](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md)
