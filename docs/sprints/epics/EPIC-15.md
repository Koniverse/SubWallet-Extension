---
id: EPIC-15
title: "On-Chain Governance"
status: backlog
prd_ref:
  - FR-141
  - FR-142
  - FR-143
  - FR-144
  - FR-145
arch_ref:
  - AD-07
  - AD-24
  - AD-03
  - AD-25
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The governance epic owns the wallet's **on-chain voice** — the surface where a
holder browses Polkadot OpenGov referenda, casts a conviction vote that locks
tokens for a chosen multiplier, tracks and unlocks those tokens when the period
ends, and (on legacy chains) reads Governance V1 / Democracy referenda. It turns
the chain's referendum state into a read-and-act surface so users can exercise
the say their tokens give them on chain decisions, without leaving the wallet for
a third-party governance UI.

## Overview

### Business context

Before this epic the wallet can hold and lock balances (EPIC-7 authors the
transferable/locked split) but offers no way to *participate* in chain
governance: a user holding DOT/KSM has voting power they cannot exercise inside
SubWallet. EPIC-15 closes that gap. It owns the **governance read-and-act path**:
the OpenGov referenda list + detail and conviction vote / revote / unvote
(FR-141), the locked-token detail view and the post-period unlock flow (FR-142),
the legacy Governance V1 (Democracy) display-only view for chains still on the
old pallet (FR-143), and the planned Phase-2 expansion of delegation + governance
tracks (FR-144) and a dedicated web-app governance surface (FR-145).

This epic adds both a *read path* (referenda indexing, conviction-lock status)
and a constrained *write path* (the vote / unlock extrinsics). Referendum and
track data across chains is **aggregated through the backend** — the Services SDK
([AD-24](../../ARCHITECTURE.md#architecture-decisions)) — rather than indexed
on-device per chain, while the conviction-lock balance figure is read over the
lightweight WsProvider path ([AD-07](../../ARCHITECTURE.md#architecture-decisions))
that keeps the wallet memory-bounded. The vote and unlock extrinsics are
constructed and signed in the background and surfaced to the UI only through the
typed `pri()` message bus ([AD-03](../../ARCHITECTURE.md#architecture-decisions)):
governance never holds key material in the UI process.

The architectural distinction this epic preserves: it owns **the governance
surface** (browse referenda, cast/manage a vote, see and release the conviction
lock) — not **the balance model** and not **the home-screen display of locked
amounts**. The conviction lock is a balance *reservation*; EPIC-15 authors the
lock by submitting the vote, but the transferable-vs-locked split and its
home-screen rendering are owned by [EPIC-7](EPIC-7.md). Governance reads that
split to show "how much is locked by your votes"; it does not re-derive the
balance.

### Feature pillars

| # | Pillar | Stories | Purpose |
|---|---|---|---|
| 1 | **OpenGov core** | [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md), [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md) | Browse referenda + conviction vote/revote/unvote; see the conviction lock and unlock it after the period |
| 2 | **Legacy governance** | [US-15.3](../stories/US-15.3-governance-v1-democracy-display-only.md) | Display-only Governance V1 (Democracy) referenda on chains still on the old pallet |
| 3 | **OpenGov Phase 2** | [US-15.4](../stories/US-15.4-opengov-delegation-and-governance-tracks.md) | Delegation support and per-track governance for fuller OpenGov participation |
| 4 | **Web-app surface** | [US-15.5](../stories/US-15.5-web-app-governance-surface.md) | The full OpenGov governance experience inside the standalone web app |

### Out of scope

- **The conviction-LOCKED balance figure (home-screen display of locked amounts)** — owned by [EPIC-7](EPIC-7.md). Balance owns the transferable/locked split and its home-screen rendering (FR-69); governance *authors* the conviction lock by submitting the vote and reads the figure back, but the daily-home display of locked amounts is EPIC-7's.
- **Staking / nomination locks** — owned by [EPIC-12](EPIC-12.md) (earning). A staking bond is a *different* lock than a conviction-vote lock; the locked-token detail view here (US-15.2) covers governance vote locks only, while staking/nomination lock semantics live with EarningService in EPIC-12.
- **The web-app shell / cross-platform parity itself** — owned by [EPIC-6](EPIC-6.md) (ui-ux, FR-64). EPIC-6 ships the standalone web app and its parity guarantee; the governance *surface within it* is [US-15.5](../stories/US-15.5-web-app-governance-surface.md) here. EPIC-15 renders governance into the web-app shell EPIC-6 provides; it does not build the shell.
- **General transaction history & balance reads** — owned by [EPIC-8](EPIC-8.md) (HistoryService) and [EPIC-7](EPIC-7.md). Governance shows vote/unlock actions as referendum state, not as a generic tx-history list.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-141 | [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md) | 📋 backlog |
| FR-142 | [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md) | 📋 backlog |
| FR-143 | [US-15.3](../stories/US-15.3-governance-v1-democracy-display-only.md) | 📋 backlog |
| FR-144 | [US-15.4](../stories/US-15.4-opengov-delegation-and-governance-tracks.md) | 📋 backlog |
| FR-145 | [US-15.5](../stories/US-15.5-web-app-governance-surface.md) | 📋 backlog |

> FR statuses above are **story-planning** statuses (Stream B; all `📋 backlog`).
> The shipped state of each capability lives in [PRD](../../PRD.md#functional-requirements): FR-141..143
> are `✅ shipped` (retroactive stories), FR-144 is `📋 planned`, FR-145 is
> `📋 planned` (forward). `done` + `version_shipped` are backfilled in version
> reconciliation. The conviction-LOCKED *balance* figure (FR-69) is owned by
> [EPIC-7](EPIC-7.md), referenced here only as a downstream dependent.

## AD Coverage

| AD | Title | Story |
|----|-------|-------|
| AD-24 | Backend Services SDK for multi-chain data aggregation | [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md), [US-15.3](../stories/US-15.3-governance-v1-democracy-display-only.md), [US-15.4](../stories/US-15.4-opengov-delegation-and-governance-tracks.md) |
| AD-07 | Lightweight WsProvider for balance queries; full ApiPromise deferred | [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md), [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md) |
| AD-03 | Background / UI message-bus isolation | [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md), [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md) |
| AD-25 | Cache / CDN proxy layer for market data, metadata and NFT media | [US-15.5](../stories/US-15.5-web-app-governance-surface.md) |

> AD-07 and AD-24 are *referenced* here for the governance read path; their
> primary implementation lives in [EPIC-2](EPIC-2.md) (engines) and is consumed
> here rather than re-derived. AD-03 (message-bus isolation) is referenced for
> the vote/unlock *signing* path; it is anchored by the keyring/request epics.
> The conviction-lock *balance* figure rides the EPIC-7 balance model (AD-07);
> EPIC-15 reads it.

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md) | OpenGov referenda + conviction voting | Browse OpenGov referenda and cast/revote/unvote with conviction multipliers | 📋 backlog | — |
| [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md) | Locked-token detail & unlock flow | See conviction-vote locks and unlock tokens once the lock period ends | 📋 backlog | — |
| [US-15.3](../stories/US-15.3-governance-v1-democracy-display-only.md) | Governance V1 (Democracy) display-only | Read legacy Democracy referenda on chains still on the old pallet | 📋 backlog | — |
| [US-15.4](../stories/US-15.4-opengov-delegation-and-governance-tracks.md) | OpenGov Phase 2: delegation & tracks | Delegate voting power and participate per governance track | 📋 backlog | — |
| [US-15.5](../stories/US-15.5-web-app-governance-surface.md) | Web-app governance surface | The full OpenGov governance experience inside the standalone web app | 📋 backlog | — |

> US-15.1–15.5 each materialize exactly one FR. US-15.1–15.3 are retroactive
> (capability already ships), US-15.4 is planned / forward (Phase 2), US-15.5 is
> forward (planned web-app surface).

## Cross-cutting invariants

- **Referendum/track data comes through the backend, not on-device indexing ([FR-141](../../PRD.md#functional-requirements), AD-24):** OpenGov and Democracy referendum lists, detail, and track metadata are aggregated through the Services SDK backend across chains; no governance story may stand up a per-chain on-device referendum indexer. Enforced by [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md), reused by [US-15.3](../stories/US-15.3-governance-v1-democracy-display-only.md), [US-15.4](../stories/US-15.4-opengov-delegation-and-governance-tracks.md).
- **The conviction lock is read from the balance model, never re-derived ([FR-142](../../PRD.md#functional-requirements), [FR-69](../../PRD.md#functional-requirements)):** the locked figure governance shows is the same `locked` reservation EPIC-7 authors in the transferable/locked split; the unlock flow releases it, but governance never computes a second balance figure. Enforced by [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md); the home-screen display of that figure is owned by [EPIC-7](EPIC-7.md).
- **Vote and unlock extrinsics are signed in the background only ([FR-141](../../PRD.md#functional-requirements), AD-03):** the conviction-vote, revote/unvote, and unlock extrinsics are constructed and signed in the background service worker and surfaced to the UI through the typed `pri()` bus; no key material or raw extrinsic signing path is exposed in the governance UI. Enforced by [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md), [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md).
- **Conviction-lock reads stay on the lightweight read path ([FR-142](../../PRD.md#functional-requirements), AD-07, NFR-11):** reading a vote-lock status / unlockable amount rides the lightweight WsProvider read path and must not force a full `@polkadot/api` ApiPromise; the full ApiPromise is instantiated only to *construct* the vote/unlock extrinsic. Enforced by [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md).
- **Shared background logic renders identically across surfaces ([FR-145](../../PRD.md#functional-requirements), NFR-17):** the web-app governance surface (US-15.5) consumes the same `extension-base` governance logic and RxJS subjects as the extension popup; it re-renders, it does not re-implement, the OpenGov flow. Enforced by [US-15.5](../stories/US-15.5-web-app-governance-surface.md).

## Cross-story testing requirements

| Pattern | Stories that apply | Shared infra |
|---|---|---|
| **Referenda subject fixture** | [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md), [US-15.3](../stories/US-15.3-governance-v1-democracy-display-only.md), [US-15.4](../stories/US-15.4-opengov-delegation-and-governance-tracks.md) | A mock Services-SDK referenda subject (OpenGov + Democracy referenda, tracks, vote status) the list/detail render tests share |
| **Conviction-lock fixture** | [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md) | A mock balance-with-vote-lock subject (lock amount, conviction multiplier, unlock-at block) plus an "already unlockable" state |
| **Vote/unlock extrinsic mock** | [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md), [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md), [US-15.4](../stories/US-15.4-opengov-delegation-and-governance-tracks.md) | A stub background signing path asserting the vote/unvote/unlock/delegate extrinsics route through `pri()` and never expose keys to the UI |
| **Cross-surface render parity** | [US-15.5](../stories/US-15.5-web-app-governance-surface.md) | A render harness that runs the governance components against the same `extension-base` subjects in both extension and web-app shells |

> The first OpenGov story (US-15.1) sets up the referenda subject fixture and the
> vote/unlock extrinsic mock; US-15.3/15.4 import them rather than rebuilding.

## Acceptance criteria (propagated from stories)

- [ ] User can browse OpenGov referenda (list + detail) and cast / revote / unvote a conviction vote, with insufficient-balance and closed-referendum cases handled — [US-15.1](../stories/US-15.1-opengov-referenda-and-conviction-voting.md)
- [ ] User can see each conviction-vote lock (amount + unlock block) and unlock tokens once the period ends, with a not-yet-unlockable case handled — [US-15.2](../stories/US-15.2-locked-token-detail-and-unlock-flow.md)
- [ ] User can read legacy Governance V1 (Democracy) referenda on chains still on the old pallet, with no vote action exposed — [US-15.3](../stories/US-15.3-governance-v1-democracy-display-only.md)
- [ ] User can delegate voting power and participate per governance track in OpenGov Phase 2 — [US-15.4](../stories/US-15.4-opengov-delegation-and-governance-tracks.md) (planned)
- [ ] User can complete the full OpenGov governance experience inside the standalone web app — [US-15.5](../stories/US-15.5-web-app-governance-surface.md) (planned)
