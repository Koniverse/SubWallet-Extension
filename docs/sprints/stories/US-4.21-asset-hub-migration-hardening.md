---
id: US-4.21
title: "Asset Hub migration hardening"
epic: EPIC-4
status: review
priority: P1
points: 3
sprint: sprint-2026-W28
version_shipped:
prd_ref: [FR-34, FR-31]
arch_ref: [AD-02]
depends_on: [US-4.3, US-4.1]
assignee: frenkie-ng
commit:
created: 2026-06-12
updated: 2026-07-15
---

## Status refresh — 2026-07-15

> Synced from GitHub Projects board #2 ("SubWallet.App – Development"): issue #4451 is **In Review** there, so this story moves `backlog` → `review` (sprint `sprint-2026-W28`). Only status/sprint changed; Goal, AC and reasoning below are untouched. The board is the live source for workflow state.

## Goal

Keep assets visible and endpoints correct as Polkadot moves balances, assets and
functionality onto Asset Hub: when the chain-list and default-active set shift
through the migration, users must keep seeing their chains and tokens and connect
to the post-migration endpoint — never an orphaned or deprecated one.

## Background

This is one of the three focused hardening stories split out of EPIC-4's hardening
cluster (issue [#4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451)).
It owns the **Asset Hub migration facet** of #4451 only — its sibling stories own
the RPC-management facet ([US-4.22](US-4.22-rpc-and-endpoint-management-hardening.md))
and the Bitcoin-API facet ([US-4.23](US-4.23-bitcoin-api-path-hardening.md)).

Unlike the feature stories in this epic, this story owns **no new FR** — it defends
the FR-34 (chain-list / token-metadata auto-update) surface and the FR-31
(network/RPC config) surface against real-world drift. Polkadot is moving
balances/assets and functionality to Asset Hub; the chain-list, default-active set
and per-chain API objects ([AD-02](../../ARCHITECTURE.md#architecture-decisions))
must track the migration without users losing visibility of assets or remaining
connected to a deprecated endpoint. The chain-list changes flow through the
auto-update channel ([US-4.3](US-4.3-auto-update-chain-list-and-token-metadata.md)),
and the affected chain configuration is the custom-RPC / active-chain surface owned
by [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md).

This is a retroactive / ongoing hardening anchor: per the Stream-B model,
feature-local reliability and migration work for the chain-management cluster lands
here rather than in a separate (parked) performance epic, and stays open across the
migration's phases rather than closing on a single fix.

## Acceptance criteria

- [ ] **AC-1** — **Given** the Asset Hub migration, **When** the chain-list / default
  active set updates, **Then** affected chains and assets remain visible and connect
  to the correct (post-migration) endpoint, with no orphaned or deprecated-endpoint
  connections.
- [ ] **AC-2** — **Given** a migrated chain whose spec has moved to Asset Hub, **When**
  the auto-update channel (US-4.3) delivers the new chain-list, **Then** the per-chain
  API object ([AD-02](../../ARCHITECTURE.md#architecture-decisions)) is rebuilt against
  the new endpoint without an ad-hoc chain lookup and without requiring a re-install.
- [ ] **AC-3** *(unhappy path)* — **Given** a chain still pointed at a now-deprecated
  pre-migration endpoint, **When** the wallet connects, **Then** the deprecated
  endpoint is not silently used: the chain either migrates to the new endpoint or is
  shown unavailable, and assets are never dropped from view without indication.
- [ ] **AC-4** — **Given** the migration hardening changes, **When** the regression
  suite runs, **Then** the previously reported Asset-Hub-migration symptoms of #4451
  no longer reproduce.

## Tasks

- [ ] **TASK-4.21.1** — Track the Asset Hub migration in the chain-list / default-active set so affected chains and assets stay visible (AC: 1)
- [ ] **TASK-4.21.2** — Rebuild per-chain API objects (AD-02) against post-migration endpoints via the US-4.3 auto-update channel, no ad-hoc lookups (AC: 2)
- [ ] **TASK-4.21.3** — Guard against orphaned / deprecated-endpoint connections; surface unavailable rather than silently dropping assets (AC: 1, 3)
- [ ] **TASK-4.21.4** — Regression tests covering the Asset-Hub-migration facet of #4451 (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — endpoint/migration changes operate on the per-chain API-object lifecycle; no ad-hoc chain lookups.
- This story introduces no new AD entries — it hardens existing ones.

### Cross-story dependencies

- Builds on [US-4.3](US-4.3-auto-update-chain-list-and-token-metadata.md) — Asset Hub chain-list changes flow through the `fetchStaticData` auto-update channel this story consumes.
- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — hardens the same active-chain / custom-RPC configuration surface.
- Sibling [US-4.22](US-4.22-rpc-and-endpoint-management-hardening.md) and [US-4.23](US-4.23-bitcoin-api-path-hardening.md) — the other two facets of #4451; coordinate the shared regression suite.

### What we explicitly did NOT do

- No new ecosystem or feature — this is migration hardening only.

### Points justification

3 pts — a single-concern hardening story scoped to the Asset Hub migration facet:
chain-list / default-set tracking plus per-chain API-object endpoint updates and a
regression task, riding the existing auto-update channel (US-4.3). Sized per SKILL
§3a-bis as a focused, single-area reliability story; carries no FR. (The original
bundled story was 5 pts across three facets; this facet alone calibrates at 3.)

### References

- [Issue #4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451) — Asset Hub migration / RPC-management / Bitcoin-API hardening (this story owns the Asset-Hub-migration facet)
- [Source: PRD FR-34](../../PRD.md#epic-4--chain-management) — chain-list / token-metadata auto-update (surface defended)
- [Source: PRD FR-31](../../PRD.md#epic-4--chain-management) — network / RPC config (surface defended)
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: simulate Asset Hub migration → assets stay visible, correct endpoint, no deprecated connection |
| AC-2 | Manual: deliver migrated chain-list via auto-update channel → API object rebuilt against new endpoint, no re-install |
| AC-3 | Manual: point a chain at a deprecated pre-migration endpoint → migrated or shown unavailable, assets not silently dropped |
| AC-4 | Regression suite for the Asset-Hub-migration facet of #4451 passes |

## Changelog entry

### Fixed
- Asset Hub migration handling: chains and assets stay visible and connect to the
  post-migration endpoint, with no orphaned / deprecated-endpoint connections
  (Asset-Hub-migration facet of issue #4451).

**Commit**:

## Implementation notes

_Hardening story — Asset-Hub-migration facet of #4451. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [Issue #4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.3](US-4.3-auto-update-chain-list-and-token-metadata.md) · [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) · [US-4.22](US-4.22-rpc-and-endpoint-management-hardening.md) · [US-4.23](US-4.23-bitcoin-api-path-hardening.md)
