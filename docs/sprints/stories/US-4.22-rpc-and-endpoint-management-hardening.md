---
id: US-4.22
title: "RPC & endpoint-management hardening"
epic: EPIC-4
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: []
arch_ref: [AD-02]
depends_on: [US-4.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Make RPC and endpoint management resilient so a single flaky, rate-limited or
misconfigured endpoint degrades gracefully instead of breaking the wallet: accurate
connectivity status, working fallback/retry, and custom-RPC validation that rejects
a bad provider with a clear error rather than leaving the extension stuck on a
loading screen and unable to open.

## Background

This is one of the three focused hardening stories split out of EPIC-4's hardening
cluster (issue [#4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451)).
It owns the **RPC-management facet** of #4451, plus issue
[#4216](https://github.com/Koniverse/SubWallet-Extension/issues/4216) — its sibling
stories own the Asset-Hub-migration facet
([US-4.21](US-4.21-asset-hub-migration-hardening.md)) and the Bitcoin-API facet
([US-4.23](US-4.23-bitcoin-api-path-hardening.md)).

Unlike the feature stories in this epic, this story owns **no new FR** — it defends
the FR-31 (network / RPC config) surface against real-world drift. Connectivity
status, custom-RPC overrides
([US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md)) and endpoint fallback need
hardening so a single bad endpoint degrades gracefully on the per-chain API-object
lifecycle ([AD-02](../../ARCHITECTURE.md#architecture-decisions)) rather than
breaking the chain. A concrete instance: adding a bad custom provider (e.g. a
Moonriver RPC) must surface a validation error, not leave the extension stuck on a
loading screen and unable to open
([#4216](https://github.com/Koniverse/SubWallet-Extension/issues/4216)).

This is a retroactive / ongoing hardening anchor: per the Stream-B model,
feature-local reliability issues for the chain-management cluster land here rather
than in a separate (parked) performance epic, and the endpoint-reliability surface
stays open across endpoint and provider churn rather than closing on a single fix.

## Acceptance criteria

- [ ] **AC-1** — **Given** a network whose primary RPC is unreachable or
  rate-limited, **When** the wallet connects, **Then** connectivity status is
  accurate and the chain degrades gracefully (fallback / retry) instead of breaking
  the surface.
- [ ] **AC-2** — **Given** a user adds or overrides a custom RPC endpoint, **When**
  the endpoint is valid, **Then** the per-chain API object
  ([AD-02](../../ARCHITECTURE.md#architecture-decisions)) connects through it and
  connectivity status reflects the real state.
- [ ] **AC-3** *(unhappy path)* — **Given** a user adds a bad custom provider (e.g. a
  Moonriver RPC pointed at the wrong chain), **When** it is submitted, **Then** it is
  rejected with a clear validation error and the extension stays usable — it does not
  hang on a loading screen unable to open (#4216).
- [ ] **AC-4** — **Given** the hardening changes, **When** the regression suite runs,
  **Then** the previously reported RPC-management symptoms of #4451 and the #4216
  load-blocking symptom no longer reproduce.

## Tasks

- [ ] **TASK-4.22.1** — Accurate connectivity status + graceful endpoint fallback/retry so one bad RPC never breaks the chain surface (AC: 1)
- [ ] **TASK-4.22.2** — Custom-RPC override connect path on the per-chain API object (AD-02), status reflecting real state (AC: 2)
- [ ] **TASK-4.22.3** — Custom-RPC validation: reject a bad provider with a clear error instead of blocking extension load (#4216) (AC: 3)
- [ ] **TASK-4.22.4** — Regression tests covering the RPC-management facet of #4451 + #4216 (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — connectivity, fallback and custom-RPC changes operate on the per-chain API-object lifecycle; no ad-hoc chain lookups.
- This story introduces no new AD entries — it hardens existing ones.

### Cross-story dependencies

- Builds on [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) — hardens the same custom-RPC / active-chain configuration, including the add-custom-RPC validation path.
- Sibling [US-4.21](US-4.21-asset-hub-migration-hardening.md) and [US-4.23](US-4.23-bitcoin-api-path-hardening.md) — the other two facets of #4451; coordinate the shared regression suite.

### What we explicitly did NOT do

- No new ecosystem or feature — this is RPC/endpoint reliability hardening only.
- No general cross-cutting performance epic work — that lives in EPIC-20 (performance); only chain-management-local RPC issues land here (#4451, #4216).

### Points justification

3 pts — a single-concern hardening story scoped to the RPC / endpoint-management
facet: connectivity status, fallback/retry, custom-RPC override and validation, plus
a regression task. Sized per SKILL §3a-bis as a focused, single-area reliability
story; carries no FR. (The original bundled story was 5 pts across three facets; this
facet — which also absorbs #4216 — calibrates at 3.)

### References

- [Issue #4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451) — Asset Hub migration / RPC-management / Bitcoin-API hardening (this story owns the RPC-management facet)
- [Issue #4216](https://github.com/Koniverse/SubWallet-Extension/issues/4216) — bad custom RPC (Moonriver) blocks extension load; needs validation / error
- [Source: PRD FR-31](../../PRD.md#epic-4--chain-management) — network / RPC config (surface defended)
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: kill a primary RPC → accurate status + graceful fallback, surface not broken |
| AC-2 | Manual: add a valid custom RPC → API object connects through it, status reflects real state |
| AC-3 | Manual: add a bad custom provider (Moonriver RPC) → clear validation error, extension stays usable, no load hang |
| AC-4 | Regression suite for the RPC-management facet of #4451 + #4216 passes |

## Changelog entry

### Fixed
- RPC / endpoint-management reliability: accurate connectivity status and graceful
  fallback/retry so a single bad endpoint no longer breaks the chain surface
  (RPC-management facet of issue #4451).
- Custom-RPC validation: a bad provider (e.g. Moonriver) now surfaces an error
  instead of blocking extension load (#4216).

**Commit**:

## Implementation notes

_Hardening story — RPC-management facet of #4451 + #4216. Fill `commit` / `version_shipped` during reconciliation._

## Cross-references

- [Issue #4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451) · [Issue #4216](https://github.com/Koniverse/SubWallet-Extension/issues/4216) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md) · [US-4.21](US-4.21-asset-hub-migration-hardening.md) · [US-4.23](US-4.23-bitcoin-api-path-hardening.md)
