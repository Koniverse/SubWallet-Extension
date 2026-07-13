---
id: EPIC-18
title: "Multisig Accounts"
status: backlog
prd_ref:
  - FR-149
  - FR-150
  - FR-151
arch_ref:
  - AD-17
  - AD-04
  - AD-24
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Give users multi-party custody on Substrate/Polkadot chains without a custodial
backend: an M-of-N signatory set shares one deterministic multisig address, and a
transaction only executes once the threshold number of signatories have approved it
on-chain. The epic delivers shared-authority custody where no single key — and no
server — can move the funds alone.

## Overview

### Business context

Before this epic, every account is single-authority: one key signs, one key submits
([EPIC-3](EPIC-3.md)). EPIC-18 adds the **M-of-N shared-authority custody model** for
native Substrate multisig ([AD-17](../../ARCHITECTURE.md#architecture-decisions)). It
owns three things end-to-end: creating and managing a multisig account
(deterministic, off-chain — FR-149), detecting and approving the pending transactions
that multisig produces (on-chain, no indexer — FR-150), and the planned Phase-2
enrichment that auto-detects activated multisig accounts and pulls richer history from
an indexer (FR-151).

The design is deliberately infrastructure-free for Phase 1. The multisig address is
derived **off-chain** from the signatory set + threshold (no account-creation
transaction), and pending transactions are detected by reading on-chain pallet state
directly (`as_multi` / `approveAsMulti`), **without an indexer**. That is what lets
multi-party custody ship without standing up a custodial service or a backend
indexing pipeline. The indexer dependency only appears in Phase 2 (FR-151), and even
then only to *enrich* history and detail — the core approve/execute path never depends
on it.

This epic owns **the multisig authority model and the multisig-specific approval
flow** — not the underlying key custody, not transaction building/submission, and not
the generic approval queue those flows ride on. Multisig is one of two shared-authority
models in the product; the other is the proxy model ([EPIC-17](EPIC-17.md)), and the
two are explicitly *not* the same thing (see Out of scope).

### Feature pillars

| # | Pillar | Stories | Purpose |
|---|---|---|---|
| 1 | **Multisig account model** | [US-18.1](../stories/US-18.1-multisig-account-creation-and-management.md) | Deterministic off-chain creation + management of an M-of-N signatory set |
| 2 | **Pending-tx approval** | [US-18.2](../stories/US-18.2-pending-transaction-detection-and-approval.md) | On-chain (indexer-free) pending-tx detection with role-differentiated initiator/co-signer flows |
| 3 | **Phase-2 enrichment** | [US-18.3](../stories/US-18.3-auto-detection-indexer-history-and-optimization.md) | Auto-detect activated accounts + indexer-enriched history/detail (planned) |

### Out of scope

- **Single-key (single-authority) accounts** — owned by [EPIC-3](EPIC-3.md). Those accounts have exactly one signer whose key lives in the keyring; multisig is a *set* of signatories with a threshold, and its address holds no key of its own.
- **Hardware-device signing** — owned by [EPIC-16](EPIC-16.md). A multisig signatory may *be* a hardware account, but how a device completes a signature is EPIC-16's; this epic only collects approvals.
- **Proxy accounts (a DIFFERENT shared-authority model)** — owned by [EPIC-17](EPIC-17.md) ([AD-16](../../ARCHITECTURE.md#architecture-decisions)). The boundary is the authority semantics, not the surface: **proxy is *delegated* authority** — one delegate key acts *on behalf of* the proxied account within a permission class (Any / NonTransfer / Governance / Staking), and a single delegate signature executes immediately. **Multisig is *M-of-N* authority** — no single signatory can act; a transaction executes only after the threshold number of co-signatories independently approve it on-chain. EPIC-18 must never collapse a multisig into "a proxy with N delegates", and EPIC-17 must never model a proxy as "a 1-of-1 multisig".
- **Transaction building & submission** — owned by [EPIC-8](EPIC-8.md). This epic wraps the call in `as_multi` / `approveAsMulti` and decides *when* it may execute; EPIC-8 builds and submits the extrinsic.
- **The RequestService approval queue** — owned by [EPIC-2](EPIC-2.md). The multisig approval UI plugs into the generic request/approval queue; this epic does not own the queue itself.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-149 | [US-18.1](../stories/US-18.1-multisig-account-creation-and-management.md) | ✅ done |
| FR-150 | [US-18.2](../stories/US-18.2-pending-transaction-detection-and-approval.md) | ✅ done |
| FR-151 | [US-18.3](../stories/US-18.3-auto-detection-indexer-history-and-optimization.md) | 📋 backlog |

> FR statuses above are **story-planning** statuses (Stream B; all `📋 backlog`).
> Shipped state lives in [PRD](../../PRD.md#functional-requirements): FR-149/FR-150 are `✅ shipped`
> (retroactive stories), FR-151 is `📋 planned` (forward, Phase 2). `done` +
> `version_shipped` are backfilled in version reconciliation.

## AD Coverage

| AD | Title | Story |
|----|-------|-------|
| AD-17 | Multisig account model (native pallet, off-chain creation, indexer-free pending-tx detection) | [US-18.1](../stories/US-18.1-multisig-account-creation-and-management.md), [US-18.2](../stories/US-18.2-pending-transaction-detection-and-approval.md) |
| AD-04 | Non-custodial keyring confined to background | [US-18.1](../stories/US-18.1-multisig-account-creation-and-management.md) |
| AD-24 | Backend Services SDK for multi-chain data aggregation | [US-18.3](../stories/US-18.3-auto-detection-indexer-history-and-optimization.md) |

> AD-24 is *referenced* here only for the Phase-2 indexer-enriched history/detail in
> [US-18.3](../stories/US-18.3-auto-detection-indexer-history-and-optimization.md); its
> primary implementation lives in the data-aggregation epics. The Phase-1 approve/execute
> path ([US-18.2](../stories/US-18.2-pending-transaction-detection-and-approval.md)) is
> deliberately indexer-free and does NOT load AD-24.

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-18.1](../stories/US-18.1-multisig-account-creation-and-management.md) | Multisig account creation (deterministic off-chain) & management | Create/manage an M-of-N multisig whose address derives off-chain from signatories + threshold, no on-chain tx | ✅ done | 1.3.74 |
| [US-18.2](../stories/US-18.2-pending-transaction-detection-and-approval.md) | Pending-tx detection + role-differentiated approval | Detect pending multisig txs on-chain (no indexer) and approve/reject with initiator-vs-co-signer flows | ✅ done | 1.3.74 |
| [US-18.3](../stories/US-18.3-auto-detection-indexer-history-and-optimization.md) | Auto-detection + indexer history + Phase-2 optimization | Auto-detect activated multisig accounts and enrich history/detail via indexer (planned) | 📋 backlog | — |

> US-18.1/US-18.2 are retroactive (shipped); US-18.3 is forward (Phase 2) and absorbs
> the multisig auto-detection / indexer-history / optimization cluster
> (issues #4839, #4845).

## Cross-cutting invariants

- **Deterministic off-chain multisig address ([FR-149](../../PRD.md#functional-requirements), AD-17):** the same signatory set + the same threshold always derives the same multisig address, computed entirely client-side with **no account-creation transaction and no server**. Re-entering the same signatories and threshold on a fresh install reproduces the identical address. Enforced by [US-18.1](../stories/US-18.1-multisig-account-creation-and-management.md).
- **Threshold-before-submit ([FR-150](../../PRD.md#functional-requirements), AD-17):** an M-of-N transaction MUST collect the threshold number of distinct signatory approvals before it is submitted for execution; below threshold it stays pending, and a single signatory can never unilaterally execute. Enforced by [US-18.2](../stories/US-18.2-pending-transaction-detection-and-approval.md).
- **One approval per signatory ([FR-150](../../PRD.md#functional-requirements)):** each signatory's approval counts once toward the threshold; a repeated approval from the same signatory does not advance the count. Enforced by [US-18.2](../stories/US-18.2-pending-transaction-detection-and-approval.md).
- **Indexer-free core path ([FR-150](../../PRD.md#functional-requirements), AD-17):** Phase-1 pending-tx detection and approval read on-chain pallet state directly; no multisig flow in Phase 1 may depend on an indexer. The indexer dependency (AD-24) is confined to Phase-2 enrichment ([US-18.3](../stories/US-18.3-auto-detection-indexer-history-and-optimization.md)).
- **No key for the multisig address (AD-04):** the multisig address holds no private key of its own; authority is the signatory set, and each signatory signs with its own keyring/hardware key. The keyring never gains a "multisig key".

## Acceptance criteria (propagated from stories)

- [ ] A user can create and manage an M-of-N multisig whose address is derived off-chain (deterministically) from the signatory set + threshold, with no on-chain creation transaction — [US-18.1](../stories/US-18.1-multisig-account-creation-and-management.md)
- [ ] Pending multisig transactions are detected on-chain without an indexer, and the initiator and co-signers get role-differentiated approval/rejection flows that execute only once the threshold is reached — [US-18.2](../stories/US-18.2-pending-transaction-detection-and-approval.md)
- [ ] Activated multisig accounts are auto-detected and history/pending-tx detail is enriched via an indexer (call data, confirmations) — [US-18.3](../stories/US-18.3-auto-detection-indexer-history-and-optimization.md) (planned, Phase 2)
