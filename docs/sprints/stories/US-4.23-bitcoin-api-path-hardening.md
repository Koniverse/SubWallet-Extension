---
id: US-4.23
title: "Bitcoin-API path hardening"
epic: EPIC-4
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: []
arch_ref: [AD-19]
depends_on: [US-4.6]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Keep Bitcoin balances and UTXO reads reliable when the indexer is slow or changes:
the backend-proxied Bitcoin API path must time out cleanly, retry, and absorb
provider drift so reads recover without manual intervention — users keep seeing
correct Bitcoin balances through indexer hiccups.

## Background

This is one of the three focused hardening stories split out of EPIC-4's hardening
cluster (issue [#4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451)).
It owns the **Bitcoin-API facet** of #4451 only — its sibling stories own the
Asset-Hub-migration facet ([US-4.21](US-4.21-asset-hub-migration-hardening.md)) and
the RPC-management facet ([US-4.22](US-4.22-rpc-and-endpoint-management-hardening.md)).

Unlike the feature stories in this epic, this story owns **no new FR** — it defends
the FR-37 (Bitcoin integration) surface against real-world drift. The
backend-proxied Bitcoin indexer path
([US-4.6](US-4.6-bitcoin-network-integration.md),
[AD-19](../../ARCHITECTURE.md#architecture-decisions)) needs reliability fixes:
timeouts, retries and provider-drift handling, all kept behind the backend proxy so
no provider key ships in the bundle and the provider stays swappable.

This is a retroactive / ongoing hardening anchor: per the Stream-B model,
feature-local reliability issues for the chain-management cluster land here rather
than in a separate (parked) performance epic, and the Bitcoin-API reliability surface
stays open across indexer / provider churn rather than closing on a single fix.

## Acceptance criteria

- [ ] **AC-1** — **Given** the Bitcoin indexer path, **When** it times out or a
  provider changes, **Then** requests retry / fail cleanly and Bitcoin balances /
  UTXO reads recover without manual intervention
  ([AD-19](../../ARCHITECTURE.md#architecture-decisions)).
- [ ] **AC-2** — **Given** the Bitcoin indexer is reached, **When** any request is
  made, **Then** it routes through the Koni backend proxy with no provider key in the
  client bundle and the provider remains swappable (AD-19).
- [ ] **AC-3** *(unhappy path)* — **Given** the Bitcoin indexer is unreachable or
  returns an error past the retry budget, **When** a balance / UTXO read is
  attempted, **Then** the failure is surfaced cleanly (stale / unavailable) rather
  than hanging the Bitcoin surface, and recovers automatically once the indexer
  returns.
- [ ] **AC-4** — **Given** the hardening changes, **When** the regression suite runs,
  **Then** the previously reported Bitcoin-API symptoms of #4451 no longer reproduce.

## Tasks

- [ ] **TASK-4.23.1** — Bitcoin indexer timeouts + retries so transient failures recover automatically (AC: 1)
- [ ] **TASK-4.23.2** — Provider-drift handling kept behind the backend proxy (AD-19), no key in bundle, provider swappable (AC: 1, 2)
- [ ] **TASK-4.23.3** — Clean failure surface past the retry budget (stale / unavailable, no hang) with auto-recovery (AC: 3)
- [ ] **TASK-4.23.4** — Regression tests covering the Bitcoin-API facet of #4451 (AC: 4)

## Dev notes

### Architecture constraints

- [AD-19](../../ARCHITECTURE.md#architecture-decisions) — Bitcoin reliability work stays behind the backend proxy (no key in bundle, swappable provider); retries/timeouts operate on the proxied path.
- This story introduces no new AD entries — it hardens existing ones.

### Cross-story dependencies

- Builds on [US-4.6](US-4.6-bitcoin-network-integration.md) — hardens the Bitcoin API / indexer path that story integrates.
- Sibling [US-4.21](US-4.21-asset-hub-migration-hardening.md) and [US-4.22](US-4.22-rpc-and-endpoint-management-hardening.md) — the other two facets of #4451; coordinate the shared regression suite.

### What we explicitly did NOT do

- No new ecosystem or feature — this is Bitcoin-API reliability hardening only.

### Points justification

3 pts — a single-concern hardening story scoped to the Bitcoin-API facet: indexer
timeouts/retries and provider-drift handling behind the backend proxy, plus a
regression task. Sized per SKILL §3a-bis as a focused, single-area reliability story;
carries no FR. (The original bundled story was 5 pts across three facets; this facet
alone calibrates at 3.)

### References

- [Issue #4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451) — Asset Hub migration / RPC-management / Bitcoin-API hardening (this story owns the Bitcoin-API facet)
- [Source: PRD FR-37](../../PRD.md#epic-4--chain-management) — Bitcoin integration (surface defended)
- [Source: ARCHITECTURE AD-19](../../ARCHITECTURE.md#architecture-decisions) — backend proxy for third-party API keys

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: time out the Bitcoin indexer → retries/recovers, balances return |
| AC-2 | Code: Bitcoin indexer requests route through the backend proxy; no provider key in client bundle |
| AC-3 | Manual: make the indexer unreachable past the retry budget → clean stale/unavailable, no hang, auto-recovers when it returns |
| AC-4 | Regression suite for the Bitcoin-API facet of #4451 passes |

## Changelog entry

### Fixed
- Bitcoin-API stability: the backend-proxied indexer path now handles timeouts,
  retries and provider drift so Bitcoin balances / UTXO reads recover without manual
  intervention (Bitcoin-API facet of issue #4451).

**Commit**:

## Implementation notes

_Hardening story — Bitcoin-API facet of #4451. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [Issue #4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.6](US-4.6-bitcoin-network-integration.md) · [US-4.21](US-4.21-asset-hub-migration-hardening.md) · [US-4.22](US-4.22-rpc-and-endpoint-management-hardening.md)
