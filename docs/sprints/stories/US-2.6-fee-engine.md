---
id: US-2.6
title: "Fee engine"
epic: EPIC-2
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-10]
arch_ref: [AD-02]
depends_on: [US-2.2]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The fee engine computes and estimates transaction fees consistently across
ecosystems — Substrate tips, EVM EIP-1559 gas, and non-native fee tokens such as
Asset Hub's `assetConversion` — so that every transaction flow (transfer, swap,
earn, XCM, governance) shows an accurate fee and the transaction engine can
preflight cost without each feature re-deriving fee math per chain.

## Background

This story catalogues the **`fee-service`** module
(`packages/extension-base/src/services/fee-service`) — the engine that normalizes
fee estimation across three distinct fee models:

- **Substrate** — partial-fee + optional tip.
- **EVM** — EIP-1559 (base fee + priority fee) gas estimation.
- **Non-native fee tokens** — paying fees in a token other than the chain's
  native asset (e.g. Asset Hub `assetConversion`).

It obtains its chain APIs from ChainService ([AD-02](../../ARCHITECTURE.md#architecture-decisions),
US-2.2). Sized 5 rather than 8: it integrates multiple fee models but each is a
bounded, well-specified estimation (not a multi-provider or multi-account
aggregation engine), and it sits behind the transaction engine rather than owning
external integrations of its own.

This story is **Retroactive** — the engine already ships; `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** a Substrate extrinsic, **When** a fee is estimated,
  **Then** the engine returns the partial fee and supports an optional tip.
- [ ] **AC-2** — **Given** an EVM transaction, **When** a fee is estimated,
  **Then** the engine returns an EIP-1559 estimate (base + priority) usable for
  submission.
- [ ] **AC-3** — **Given** a chain that supports non-native fee tokens (e.g.
  Asset Hub `assetConversion`), **When** the user pays the fee in a non-native
  token, **Then** the engine computes the fee in that token.
- [ ] **AC-4** — **Given** fee-rate data is unavailable for a chain, **When**
  estimation runs, **Then** the engine surfaces a typed "fee unavailable" result
  rather than returning a silent zero or stale value that could under-fund a tx.

## Tasks

- [ ] **TASK-2.6.1** — Substrate partial-fee + optional tip estimation (AC: 1)
- [ ] **TASK-2.6.2** — EVM EIP-1559 gas estimation (AC: 2)
- [ ] **TASK-2.6.3** — Non-native fee-token computation (Asset Hub `assetConversion`) (AC: 3)
- [ ] **TASK-2.6.4** — Typed "fee unavailable" path when rate data is missing (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — the engine obtains per-chain API objects from ChainService rather than opening its own connections.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-2.2](US-2.2-chainservice-live-api-per-chain.md) — fee estimation uses the chain API from ChainService.
- Required by [US-2.8](US-2.8-transaction-lifecycle-engine.md) — the lifecycle engine consults the fee engine at validate/preflight.

### References

- [Source: PRD FR-10](../../PRD.md#functional-requirements) — fee engine
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Unit test: Substrate partial-fee + tip estimate (`services/fee-service` tests) |
| AC-2 | Unit test: EVM EIP-1559 estimate (base + priority) |
| AC-3 | Test: non-native fee token (Asset Hub `assetConversion`) computes fee in that token |
| AC-4 | Test: missing fee-rate data → typed "fee unavailable", not zero/stale |

## Changelog entry

### Added
- Fee engine: estimates transaction fees across Substrate tips, EVM EIP-1559 gas
  and non-native fee tokens (Asset Hub `assetConversion`).

**Commit**:

## Implementation notes

_Retroactive story — engine already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-10](../../PRD.md#functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [US-2.8](US-2.8-transaction-lifecycle-engine.md)
