---
id: US-8.10
title: "Token spending-approval confirmation"
epic: EPIC-8
status: done
priority: P1
points: 3
sprint: sprint-2024-M02
version_shipped: 1.1.36
prd_ref: [FR-83]
arch_ref: [AD-21]
depends_on:
assignee: S2kael
commit: 75fdb07167, c6faf2e744, 3f0a3b125b
created: 2026-06-12
updated: 2026-06-12
---

## Goal

When a flow needs to grant a contract an allowance to move the user's tokens —
the ERC-20 / PSP-22 `approve` step that precedes a swap, bridge or dApp spend — the
wallet surfaces an explicit spending-approval confirmation showing *which contract*
gets to spend *how much* of *which token*, so the user understands the allowance
they are granting rather than rubber-stamping an opaque approval. Unbounded
approvals are a top cause of drained wallets; this confirmation is the guardrail.

## Background

ERC-20 (and PSP-22) spends by a contract require a prior `approve` that sets an
allowance the spender can later pull. The danger is the *unlimited* approval pattern
and the opacity of "approve this contract" — users routinely grant max allowances
without realizing the standing risk. This story renders a dedicated approval
confirmation (token, spender contract, amount/allowance) through the RequestService
approval surface ([AD-21](../../ARCHITECTURE.md#architecture-decisions)) so the
allowance is a visible, deliberate decision and the requested amount is shown in the
token's real units.

The surface is focused — one confirmation step in front of an existing approve
extrinsic — hence sized 3. Materializes
[FR-83](../../PRD.md#functional-requirements). This story is **Retroactive** —
the capability already ships; `commit` / `version_shipped` are backfilled during
version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a flow that requires an ERC-20 / PSP-22 allowance,
  **When** the approval step is reached, **Then** a dedicated confirmation shows the
  token, the spender contract, and the requested allowance amount before any
  `approve` is signed.
- [x] **AC-2** — **Given** the approval confirmation, **When** the user reviews it,
  **Then** the allowance amount is displayed in the token's real units (base units
  formatted by decimals), not a raw integer or a hidden max value.
- [x] **AC-3** — **Given** the confirmation, **When** the user rejects it, **Then**
  no `approve` extrinsic is submitted and the dependent spend does not proceed.
- [x] **AC-4** — **Given** an existing sufficient allowance, **When** the same spend
  is attempted again, **Then** a redundant approval is not requested (no
  unnecessary second `approve`).

## Tasks

- [x] **TASK-8.10.1** — Spending-approval confirmation: token + spender + allowance amount (AC: 1, 2)
  - [x] Presented through the RequestService handler (AD-21).
- [x] **TASK-8.10.2** — Format the allowance in token real units; no hidden max (AC: 2)
- [x] **TASK-8.10.3** — Reject path: no `approve` submitted, dependent spend halted (AC: 3)
- [x] **TASK-8.10.4** — Skip approval when a sufficient allowance already exists (AC: 4)

## Dev notes

### Architecture constraints

- [AD-21](../../ARCHITECTURE.md#architecture-decisions) — the approval confirmation is presented through the RequestService approval surface (owned by [EPIC-2](../epics/EPIC-2.md), FR-11); the `approve` extrinsic submits through the EPIC-2 transaction lifecycle (FR-12).
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Sibling [US-8.8](US-8.8-metadata-hash-signing.md), [US-8.9](US-8.9-multi-step-one-sign-signing.md) — all render confirmations through the RequestService handlers; coordinate the shared approval surface.
- Often the first step of a One-Sign sequence ([US-8.9](US-8.9-multi-step-one-sign-signing.md)) — approve-then-spend; the disclosed allowance must remain visible inside the batch confirmation.

### References

- [Source: PRD FR-83](../../PRD.md#functional-requirements) — token spending-approval (ERC-20 / PSP-22 allowance) confirmation
- [Source: ARCHITECTURE AD-21](../../ARCHITECTURE.md#architecture-decisions) — per-ecosystem request-handler abstraction

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: trigger an allowance-requiring spend → confirmation shows token/spender/amount |
| AC-2 | Manual: allowance shown in token real units; no hidden max |
| AC-3 | Manual: reject → no `approve` submitted, spend halted |
| AC-4 | Manual: with a sufficient existing allowance → no redundant `approve` prompt |

## Changelog entry

### Added
- Token spending-approval confirmation: an explicit ERC-20 / PSP-22 allowance step
  showing token, spender contract and amount (in real units) before any `approve`,
  with reject handling and skip when a sufficient allowance already exists.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-83](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.9](US-8.9-multi-step-one-sign-signing.md)
