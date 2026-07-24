---
id: US-8.7
title: "Existential-deposit safety guard"
epic: EPIC-8
status: done
priority: P1
points: 3
sprint: sprint-2022-M02
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

## Status

> **✅ done — shipped in 0.2.5.** All acceptance criteria are ticked and the 8 rows below are
> settled: 7 delivered, 1 closed without shipping.

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

## Incremental work, fixes & chores

**8 tracker issues** — 6 with a release, 1 delivered with no line naming it, 1 closed without
shipping. Folded in from the former one-issue-per-story maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.6.6 | [#681](https://github.com/Koniverse/SubWallet-Extension/issues/681) | Change transfer warning when the account cannot be reaped | ✅ done |
| 0.7.7 | [#874](https://github.com/Koniverse/SubWallet-Extension/issues/874) | Add the warning message for invalid Amount input cases (for send fund feature) | ✅ done |
| 1.0.8 | [#1479](https://github.com/Koniverse/SubWallet-Extension/issues/1479) | Add validate for case: the transaction amount is too small to keep the destination account alive | ✅ done |
| 1.1.3 | [#1657](https://github.com/Koniverse/SubWallet-Extension/issues/1657) | Do not validate amount of the recipient address when send on-chain | ✅ done |
| 1.1.49 | [#2798](https://github.com/Koniverse/SubWallet-Extension/issues/2798) | Check transfer logic that can potentially affect ED | ✅ done |
| 1.2.25 | [#2783](https://github.com/Koniverse/SubWallet-Extension/issues/2783) | Do not allow send to empty account (Native token balance = 0) on Asset Hub | ✅ done |
| — | [#64](https://github.com/Koniverse/SubWallet-Extension/issues/64) | Still showing warning message not enough balance in case of network transfer | ✅ done |
| — | [#3473](https://github.com/Koniverse/SubWallet-Extension/issues/3473) | Extension - Improve block transfer to empty account | ⏸ deprecated |

> **The guard is asked in two directions and both are here.** #681 and #1479 protect the *sender*
> from dropping below the existential deposit; #2783 (*"do not allow sending to an empty account"*)
> and #3473 protect the *recipient* from receiving an amount too small to exist. #2798 —
> *"check transfer logic that can potentially affect ED"* — is the audit of both.
>
> **#3473 closed without shipping**: *"improve block transfer to empty account"*. Blocking is a
> blunt guard, and softening it was proposed and not taken — which is why the block is still what
> the user meets.

## Cross-references

- [PRD FR-80](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.1](US-8.1-send-native-and-fungible-tokens.md)
- [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
