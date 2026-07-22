---
id: US-8.9
title: "Multi-step / one-sign signing"
epic: EPIC-8
status: done
priority: P1
points: 5
sprint:
version_shipped: 1.3.21
prd_ref: [FR-82]
arch_ref: [AD-21]
depends_on:
assignee: bluezdot
commit: 43109748d6f026293e4315de77e0b89b68b32b8f, 3e32fb425365f103caea93ba4c917d7c1f5a82f0, ff5b6b565ec79a6d23ed0d24680502a2aba5b8be
created: 2026-06-12
updated: 2026-06-12
---

## Goal

When an action requires several sequential transactions — e.g. an approve-then-spend,
or a multi-step earning/bridge path — the user can approve the whole sequence with a
single confirmation ("One Sign") instead of being interrupted by a popup at every
step, so that a multi-transaction flow feels like one action rather than a series of
disconnected approvals. This is the convenience-vs-control balance the wallet has to
get right.

## Background

Some flows are inherently multi-transaction: an ERC-20 `approve` followed by a
spend, an XCM hop followed by an earning deposit, a swap that decomposes into
several extrinsics. Confirming each one separately is friction and invites
approval-fatigue mistakes. One-Sign (multi-step signing, Round 1) lets the user
authorize the *sequence* once; the wallet then drives the steps through the
transaction lifecycle, presenting the batch through the RequestService
([AD-21](../../ARCHITECTURE.md#architecture-decisions)) so the user still sees what
the whole sequence does before approving. A user-facing toggle governs whether
One-Sign is enabled (the security side of that toggle is owned by
[EPIC-5](../epics/EPIC-5.md)).

The correctness risk is that batching must not hide a step from the user or let a
later step proceed after an earlier one fails. Sized 5 per §3a-bis for one-sign /
multi-step signing — sequencing logic across the lifecycle plus the
single-confirmation approval surface. Materializes
[FR-82](../../PRD.md#functional-requirements). This story is **Retroactive** —
the capability already ships; `commit` / `version_shipped` are backfilled during
version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** an action that decomposes into multiple sequential
  transactions, **When** One-Sign is enabled, **Then** the user approves the whole
  sequence with a single confirmation and each step is then submitted in order
  through the transaction lifecycle.
- [x] **AC-2** — **Given** the single confirmation, **When** it is presented,
  **Then** it discloses every step in the sequence (what each transaction does), not
  just the first — the user is not signing hidden steps.
- [x] **AC-3** — **Given** a step in the sequence fails, **When** the lifecycle runs
  the batch, **Then** subsequent steps do not silently proceed and the failure is
  surfaced with the sequence's partial state.
- [x] **AC-4** — **Given** One-Sign is disabled (toggle off), **When** a
  multi-step action runs, **Then** each step requires its own confirmation (the
  per-step approval behaviour is unchanged).

## Tasks

- [x] **TASK-8.9.1** — Sequence model: decompose an action into ordered lifecycle steps (AC: 1)
- [x] **TASK-8.9.2** — Single-confirmation approval surface that discloses every step (AC: 1, 2)
  - [x] Presented through the RequestService handler (AD-21).
- [x] **TASK-8.9.3** — Drive steps in order through the lifecycle; halt on failure (AC: 1, 3)
- [x] **TASK-8.9.4** — Honour the One-Sign toggle; per-step confirmation when off (AC: 4)

## Dev notes

### Architecture constraints

- [AD-21](../../ARCHITECTURE.md#architecture-decisions) — the batched confirmation is presented through the RequestService approval surface (owned by [EPIC-2](../epics/EPIC-2.md), FR-11); per-step submission rides the EPIC-2 transaction lifecycle (FR-12).
- This story does NOT introduce new AD entries. The One-Sign *security toggle* policy is owned by [EPIC-5](../epics/EPIC-5.md); this story consumes the toggle.

### Cross-story dependencies

- Sibling [US-8.8](US-8.8-metadata-hash-signing.md), [US-8.10](US-8.10-token-spending-approval-confirmation.md) — all render confirmations through the RequestService handlers; coordinate the shared approval surface.
- Consumed by multi-step feature flows (earning paths, bridge claim) — they express their step sequence and inherit the single-confirmation behaviour.

### What we explicitly did NOT do

- No silent cross-account or cross-origin batching — One-Sign authorizes a single user-initiated sequence; it is not a blanket pre-approval. Trigger to revisit: a later round (Round 2) explicitly extends scope.

### References

- [Source: PRD FR-82](../../PRD.md#functional-requirements) — multi-step / one-sign signing (Round 1)
- [Source: ARCHITECTURE AD-21](../../ARCHITECTURE.md#architecture-decisions) — per-ecosystem request-handler abstraction

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: multi-step action with One-Sign on → single confirmation → steps run in order |
| AC-2 | Manual: confirmation lists every step of the sequence |
| AC-3 | Manual: force a mid-sequence failure → later steps halt, failure surfaced |
| AC-4 | Manual: One-Sign off → each step prompts its own confirmation |

## Changelog entry

### Added
- One-Sign multi-step signing: approve a sequence of transactions with a single
  confirmation that discloses every step, driven in order through the transaction
  lifecycle with halt-on-failure and a per-step fallback when the toggle is off.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-82](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.8](US-8.8-metadata-hash-signing.md)
- [US-8.10](US-8.10-token-spending-approval-confirmation.md)
