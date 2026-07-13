---
id: US-8.7
title: "Existential-deposit safety guard"
epic: EPIC-8
status: done
priority: P1
points: 3
sprint:
version_shipped: 0.2.5
prd_ref: [FR-80]
arch_ref: [AD-02]
depends_on:
assignee: LeeW0ng
commit: 6ec77efe5c1528150a6250938ee94e59c4f5f36a
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Before a Substrate transfer that would drop the sender below the chain's
existential deposit, the wallet warns the user — because on Substrate an account
that falls below the ED is *reaped* and its remaining dust (and any dependent
on-chain state) is lost. The guard turns a silent fund-loss footgun into an
explicit, acknowledged decision.

## Background

The existential deposit is a Substrate-specific safety threshold: an account whose
free balance falls below the chain's ED is removed, taking its dust with it and
potentially breaking dependent state (e.g. references that keep an account alive).
A naive "send max" or a transfer sized without accounting for fee + ED silently
reaps the account. This guard computes, per chain, whether the post-transfer
balance would fall below the ED (using the chain's ED constant from `ChainService`,
[AD-02](../../ARCHITECTURE.md#architecture-decisions)) and forces an explicit
warning the user must acknowledge before submission.

This is the epic's **existential-deposit invariant** — every send flow (US-8.1,
US-8.3, US-8.4) routes its amount through this guard rather than re-deriving the
threshold, so the rule is enforced in exactly one place. The math is integer base
units (the epic's BigInt invariant). Sized 3 (one cross-chain guard with
per-chain ED constants, consumed by all send flows).
Materializes [FR-80](../../PRD.md#functional-requirements). This story is
**Retroactive** — the capability already ships; `commit` / `version_shipped` are
backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a Substrate transfer whose post-transfer free balance
  (after amount + fee) would fall below the chain's existential deposit, **When**
  the user reaches confirmation, **Then** an explicit ED warning is shown and the
  user must acknowledge it before the transfer can be submitted.
- [x] **AC-2** — **Given** a transfer that leaves the sender at or above the ED,
  **When** the user confirms, **Then** no ED warning is shown and the send proceeds
  normally.
- [x] **AC-3** — **Given** the ED check, **When** it runs, **Then** the threshold
  comparison is done in integer base units against the chain's ED constant
  (`bigint` / `BN`), with no float coercion.
- [x] **AC-4** — **Given** an account holding locked/reserved balance that would be
  affected by reaping, **When** a reaping transfer is attempted, **Then** the
  warning makes the consequence explicit (dust + dependent-state loss), not a
  generic message.

## Tasks

- [x] **TASK-8.7.1** — Per-chain ED computation: post-transfer balance vs ED constant via ChainService (AC: 1, 3)
- [x] **TASK-8.7.2** — Acknowledged-warning gate in the confirmation step (AC: 1, 4)
- [x] **TASK-8.7.3** — No warning on safe transfers; no false positives (AC: 2)
- [x] **TASK-8.7.4** — Expose the guard as the single shared check consumed by all send flows (AC: 1)
  - [x] Wired into US-8.1 / US-8.3 / US-8.4 rather than re-derived per flow.

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — the chain's existential-deposit constant is read from its `ChainService` API object; the guard does not hard-code ED values.
- This story does NOT introduce new AD entries. It is a validation step consumed by the send flows; submission stays in the EPIC-2 lifecycle (FR-12).

### Cross-story dependencies

- Required by [US-8.1](US-8.1-send-native-and-fungible-tokens.md), [US-8.3](US-8.3-custom-fee-and-tip.md), [US-8.4](US-8.4-pay-fees-with-non-native-token.md) — all Substrate send flows route their amount through this guard.
- Sibling [US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md) — the ED threshold math is covered by the BigInt regression guard.

### References

- [Source: PRD FR-80](../../PRD.md#functional-requirements) — existential-deposit safety guard
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects (ED constant)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: send amount that reaps the account → ED warning, must acknowledge to submit |
| AC-2 | Manual: send leaving balance ≥ ED → no warning, normal send |
| AC-3 | Test asserts ED comparison uses `bigint`/`BN` against the chain ED constant |
| AC-4 | Manual: account with locked balance → warning states dust + dependent-state loss |

## Changelog entry

### Added
- Existential-deposit safety guard: warns and requires acknowledgement before a
  Substrate transfer that would drop the sender below the chain's ED, computed in
  base units from the per-chain ED constant and shared across all send flows.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-80](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.1](US-8.1-send-native-and-fungible-tokens.md)
