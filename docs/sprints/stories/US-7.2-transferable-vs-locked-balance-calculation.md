---
id: US-7.2
title: "Transferable vs locked/frozen balance calculation"
epic: EPIC-7
status: done
priority: P1
points: 3
sprint:
version_shipped: 0.2.5
prd_ref: [FR-69]
arch_ref: [AD-07]
depends_on: [US-7.1]
assignee: Quangdm-cdm
commit: 9a9b3b284c, 8ea62e7e9f
created: 2026-06-12
updated: 2026-06-12
---

> **⚠️ Corrected 2026-07-13 — AD-07's mechanism does not exist.** Wherever this file says
> reads ride a *"lightweight WsProvider"* and that a full `ApiPromise` is deferred to
> extrinsic construction, that is inherited from [AD-07](../../ARCHITECTURE.md#architecture-decisions),
> which was **decided in 2022 and never implemented**: `SubstrateApi` builds a full
> `ApiPromise` eagerly per enabled chain and the read path reads off it. Every memory figure
> here (~72 MB / ~264 MB) is a 2022 MV2-era claim with **no probe behind it**. The gap is
> owned by [US-20.3](US-20.3-read-path-memory-budget.md); the decision trail is
> [CONTEXT D95](../../CONTEXT.md).


## Goal

For every token the user holds, split the raw balance into a **transferable**
amount and a **locked/frozen** amount, and display both correctly everywhere —
the home screen and every send flow — so that a user always knows how much they
can actually move and never tries to send funds that are reserved or frozen.

## Background

A raw balance is not a spendable balance: Substrate accounts carry
reserved/frozen amounts (existential deposit, staking locks, vesting), and EVM/UTXO
chains have their own notions of unavailable balance. The transferable figure is the
number the **send flow trusts** — it gates the max-send affordance and feeds the
existential-deposit safety guard in [EPIC-8](../epics/EPIC-8.md) (FR-80). This is
why FR-69 is co-owned: EPIC-7 *authors* the calculation and the home display;
EPIC-8 *consumes* the same figure at send time. Computing it twice (one number for
display, another for send) is the classic source of "it said I had X but the send
failed" bugs, so the invariant is one calculation, one source of truth.

The underlying per-chain balance breakdown comes from the `BalanceService` read
path on the lightweight WsProvider ([AD-07](../../ARCHITECTURE.md#architecture-decisions));
this story renders the transferable/locked split into the dashboard set up by
[US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md).

Materializes [FR-69](../../PRD.md#functional-requirements) (shared with [EPIC-8](../epics/EPIC-8.md)). This
story is **retroactive** — the capability already ships; `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a Substrate account with reserved/frozen amounts (ED,
  staking lock, vesting), **When** the token detail is shown, **Then** transferable
  and locked/frozen are displayed separately and transferable = free − max(frozen,
  reserved-as-applicable) per the chain's balance model.
- [x] **AC-2** — **Given** the home screen shows a transferable figure, **When** the
  user opens the send flow for that token, **Then** the max-sendable amount derives
  from the *same* transferable calculation (no second computation).
- [x] **AC-3** — **Given** a token whose entire balance is locked/frozen, **When**
  the user views it, **Then** transferable shows 0 and the send affordance is
  disabled with an explanation, rather than offering a send that would fail.
- [x] **AC-4** — **Given** EVM and UTXO tokens (no Substrate lock model), **When**
  displayed, **Then** transferable reflects that chain's available-balance rule
  without misapplying Substrate reserve semantics.

## Tasks

- [x] **TASK-7.2.1** — Render transferable vs locked/frozen split per token in the dashboard (AC: 1, 4)
  - [x] Consume the per-chain balance breakdown from the aggregated subject (US-7.1); apply per-ecosystem available-balance rules.
- [x] **TASK-7.2.2** — Expose a single transferable calculation reused by the send flow (AC: 2)
  - [x] Ensure EPIC-8 send-validation imports the same helper; no duplicate math.
- [x] **TASK-7.2.3** — Fully-locked / zero-transferable handling (AC: 3)
  - [x] Show transferable 0; disable send with a reason (locked/frozen).

## Dev notes

### Architecture constraints

- [AD-07](../../ARCHITECTURE.md#architecture-decisions) — the per-chain balance breakdown is read on the lightweight WsProvider path; this story renders it, it does not force a full ApiPromise.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md) — renders into the dashboard and reuses the aggregated-balance subject fixture.
- Required by [EPIC-8](../epics/EPIC-8.md) send flow — it consumes the transferable figure authored here for max-send and the existential-deposit guard (FR-80).

### What we explicitly did NOT do

- No earning/staking position breakdown — the locked amount surfaces here, but the staking-position detail is owned by [EPIC-12](../epics/EPIC-12.md).

### References

- [Source: PRD FR-69](../../PRD.md#functional-requirements) — transferable vs locked/frozen calculation
- [Source: PRD FR-80](../../PRD.md#functional-requirements) — existential-deposit safety guard (EPIC-8 consumer)
- [Source: ARCHITECTURE AD-07](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Unit test: transferable calculation over a Substrate balance with frozen/reserved fixtures |
| AC-2 | Manual: home transferable figure equals send-flow max for the same token |
| AC-3 | Manual: fully-locked token → transferable 0, send disabled with reason |
| AC-4 | Unit test: EVM + UTXO available-balance rules do not apply Substrate reserve semantics |

## Changelog entry

### Added
- Transferable-vs-locked/frozen split per token on the home screen and in token
  detail, with the transferable figure reused by the send flow.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-69](../../PRD.md#functional-requirements)
- [Epic EPIC-7](../epics/EPIC-7.md)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md)
</content>
