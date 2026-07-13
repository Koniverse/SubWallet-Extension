---
id: US-7.7
title: "Balance-cache invalidation hardening"
epic: EPIC-7
status: backlog
priority: P2
points: 3
sprint:
version_shipped:
prd_ref: [NFR-12, FR-69, FR-68]
arch_ref: [AD-25, AD-07]
depends_on: [US-7.1, US-7.2]
assignee:
commit:
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

Make the home-screen balance cache **correct under change** — recompose and
invalidate it on the events that actually move the numbers — so the daily-home
screen never shows a stale or wrong figure after the user (or the chain) changes
something. This is the balance-correctness hardening cluster that lets every other
home-screen story stop re-defending freshness: it owns the "the cached number is
the right number" contract, not the rendering of it.

## Background

The home screen rides a cached-first read path: US-7.1 serves last-known balances
immediately over the lightweight WsProvider aggregation
([AD-07](../../ARCHITECTURE.md#architecture-decisions)) and US-7.2 publishes the
transferable-vs-locked split every send flow trusts. Prices and market data front
the upstream through the `api-cache` proxy
([AD-25](../../ARCHITECTURE.md#architecture-decisions)). "Show stale over blank"
is the right default *while waiting*, but it becomes a defect the moment the
underlying balance changes and the cache does not recompose or invalidate.

There are real, reported correctness gaps in exactly this seam, and this story is
re-grounded on them rather than on a generic "caches should be fresh" claim:

- **Multi-step balance changes are not listened for**
  ([#4337](https://github.com/Koniverse/SubWallet-Extension/issues/4337)): when an
  operation moves a balance in several steps, the cached figure must follow the
  *final* settled balance, not a mid-sequence snapshot — the cache has to subscribe
  to balance-change events, not poll once.
- **Locked-balance composition is incomplete**
  ([#1583](https://github.com/Koniverse/SubWallet-Extension/issues/1583)): crowdloan
  contributions must be folded into the *locked* portion of the balance. If the
  cached locked figure omits a component (e.g. crowdloan), the transferable/locked
  split US-7.2 publishes is wrong, and the home total and send-max affordance
  inherit the error.
- **Stale cache survives account removal**
  ([#2410](https://github.com/Koniverse/SubWallet-Extension/issues/2410)): after all
  accounts holding a token are removed, the WebApp still shows that token — the
  per-account/per-token cache was never invalidated on account removal, so a
  dangling entry renders.

Around these three anchors the story keeps the cross-cutting **invalidation-on-event
invariant** the epic already defends: balance caches MUST invalidate on account
switch, chain enable/disable, and transfer submit (EPIC-7 cross-cutting invariant,
NFR-driven). This story owns **no new FR** — it is the epic's balance-correctness
hardening cluster, defending the freshness/composition contract the feature stories
(US-7.1, US-7.2) depend on. The balance area has few open issues; the three above
are the real ones, and they are anchored rather than padded with invented work.

## Acceptance criteria

- [ ] **AC-1** — **Given** an operation that moves a balance in multiple steps,
  **When** the steps settle, **Then** the cached balance is driven by a
  balance-change subscription and reflects the *final* settled figure, not a
  mid-sequence snapshot (#4337).
- [ ] **AC-2** — **Given** an account with a crowdloan contribution, **When** the
  balance is composed, **Then** the crowdloan amount is folded into the **locked**
  portion so the transferable-vs-locked split (US-7.2) and the home total are
  correct (#1583).
- [ ] **AC-3** — **Given** the home screen is showing account A's portfolio, **When**
  the user switches to account B, **Then** the cache invalidates and recomputes to
  B — no carry-over of A's cached figure beyond the skeleton window (cross-cutting
  invalidation invariant).
- [ ] **AC-4** — **Given** a chain is enabled or disabled, or a transfer is
  submitted/confirmed, **When** the event fires, **Then** the affected aggregate and
  token rows invalidate and refresh so the home figure reflects the change (no stale
  pre-event balance).
- [ ] **AC-5** *(unhappy path)* — **Given** all accounts holding a token have been
  removed, **When** the account list updates, **Then** that token's cached row is
  invalidated and disappears from the home screen — no dangling token from a deleted
  account (#2410).
- [ ] **AC-6** — **Given** the invalidation/composition wiring, **When** the
  event-driven test harness runs, **Then** it asserts that a balance-change event,
  account-switch, chain-toggle, transfer-submit, and account-removal each fire the
  correct recompose/invalidate, and fails if any handler is missing.

## Tasks

- [ ] **TASK-7.7.1** — Subscribe the balance cache to balance-change events so the cached figure follows the final settled balance through multi-step operations (AC: 1)
  - [ ] Replace any one-shot read of the multi-step path with a balance-change subscription; debounce to the settled value (#4337).
- [ ] **TASK-7.7.2** — Fold crowdloan contributions into the locked-balance composition consumed by the US-7.2 transferable/locked split (AC: 2)
  - [ ] Ensure the cached locked figure includes the crowdloan component so the split and home total are correct (#1583).
- [ ] **TASK-7.7.3** — Wire account-switch / chain-toggle / transfer-submit invalidation to the aggregate + token-row caches (AC: 3, 4)
  - [ ] Each event invalidates only the affected rows (no thundering-herd full refetch on a single switch).
- [ ] **TASK-7.7.4** — Invalidate per-account/per-token cache rows on account removal so no token lingers after its last holder is deleted (AC: 5)
  - [ ] On account-list change, drop cache entries whose owning account(s) no longer exist (#2410).
- [ ] **TASK-7.7.5** — Event-driven cache-invalidation / composition regression harness (AC: 6)
  - [ ] Assert each of: balance-change, account-switch, chain-toggle, transfer-submit, account-removal fires the correct recompose/invalidate; a missing handler fails the test.

## Dev notes

### Architecture constraints

- [AD-07](../../ARCHITECTURE.md#architecture-decisions) — balance recomposition rides the lightweight WsProvider read path; the balance-change subscription (#4337) and locked composition (#1583) MUST NOT force a full `@polkadot/api` ApiPromise on the read path.
- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — market/price data fronts the upstream through `api-cache`; this story keeps the stale-if-error default from leaking past a real balance state change.
- This story does NOT introduce new AD entries; it hardens the cache behavior the feature stories rely on.

### Cross-story dependencies

- Builds on [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md) — hardens the cached-first aggregate read path; consumes its aggregated-balance subject fixture.
- Builds on [US-7.2](US-7.2-transferable-vs-locked-balance-calculation.md) — the crowdloan locked-composition fix (#1583) corrects the transferable/locked figure this story authors there; both touch the locked-balance calculation, coordinate review.
- Defends the freshness/correctness contract consumed by every home-screen story (US-7.1–7.6).

### Performance budget

- Invalidation adds no extra full re-aggregation beyond the single recompose the
  triggering event requires (no thundering-herd refetch on a single account switch
  or account removal). The balance-change subscription debounces to the settled
  value rather than re-rendering on every intermediate step.

### What we explicitly did NOT do

- No change to the "stale-over-blank" default *during load* — this story fixes
  wrongness/staleness *after a state change*; the cached-first paint behavior of
  US-7.1 stays.
- No new balance-engine work — multi-chain balance/locked detection is the EPIC-2
  engine (US-2.5); this story corrects how its output is composed and cached on the
  read surface, not how it is fetched.

### Points justification

3 pts — a single-concern balance-correctness hardening story scoped to the cache
seam: a balance-change subscription (#4337), a locked-composition fix (#1583), an
account-removal invalidation (#2410), plus the existing account-switch / chain-toggle
/ transfer-submit invariant and a regression harness. Per §3a-bis this is a
multi-anchor internal-integration story (~2 days) on an existing read path with no
external dependency — calibrated identically to the sibling EPIC-4 hardening story
(US-4.21, 3 pts). It carries no FR.

### References

- [Issue #4337](https://github.com/Koniverse/SubWallet-Extension/issues/4337) — Listen for balance changes to better handle multi-steps (balance-change subscription)
- [Issue #1583](https://github.com/Koniverse/SubWallet-Extension/issues/1583) — Calculate crowdloan data into Locked balance (locked composition)
- [Issue #2410](https://github.com/Koniverse/SubWallet-Extension/issues/2410) — [WebApp] Still show token although all accounts removed (stale-cache after account removal)
- [Source: ARCHITECTURE AD-25](../../ARCHITECTURE.md#architecture-decisions) — cache / CDN proxy layer for market data
- [Source: ARCHITECTURE AD-07](../../ARCHITECTURE.md#architecture-decisions) — lightweight WsProvider read path for balance queries

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: run a multi-step balance operation → cached balance follows the final settled figure, no mid-sequence stale snapshot |
| AC-2 | Manual: account with a crowdloan contribution → crowdloan amount appears in the locked portion; transferable/locked split correct |
| AC-3 | Manual: switch accounts → total recomputes to the new account, no stale carry-over |
| AC-4 | Manual: enable/disable a chain or submit a transfer → affected tokens/total invalidate and refresh |
| AC-5 | Manual: remove all accounts holding a token → token disappears from the home screen, no dangling row |
| AC-6 | Test: cache-invalidation harness asserts recompose/invalidate on balance-change / account-switch / chain-toggle / transfer-submit / account-removal |

## Changelog entry

### Fixed
- Balance cache now subscribes to balance-change events so multi-step operations
  settle to the final figure (#4337).
- Crowdloan contributions are folded into the locked balance, correcting the
  transferable/locked split and home total (#1583).
- Cached token rows are invalidated when their last holding account is removed, so a
  removed account no longer leaves a stale token on the home screen (#2410).
- Balance caches invalidate on account switch, chain enable/disable and transfer
  submit, preventing stale home-screen figures after a state change.

**Commit**:

## Implementation notes

_Hardening cluster — owns no FR; defends the balance freshness/composition contract.
Fill `commit`, `version_shipped` and caveats when the hardening lands._

## Cross-references

- [Issue #4337](https://github.com/Koniverse/SubWallet-Extension/issues/4337) · [Issue #1583](https://github.com/Koniverse/SubWallet-Extension/issues/1583) · [Issue #2410](https://github.com/Koniverse/SubWallet-Extension/issues/2410)
- [Epic EPIC-7](../epics/EPIC-7.md)
- [US-7.1](US-7.1-aggregate-portfolio-across-accounts-and-chains.md)
- [US-7.2](US-7.2-transferable-vs-locked-balance-calculation.md)
