---
id: US-8.4
title: "Pay fees with a non-native token"
epic: EPIC-8
status: done
priority: P1
points: 5
sprint: sprint-2025-M02
version_shipped: 1.3.18
prd_ref: [FR-77]
arch_ref: [AD-02, AD-24]
depends_on: [US-8.3]
assignee: bluezdot
commit: f964b504bd, 38d890fa7f
created: 2026-06-12
updated: 2026-06-12
---

## Goal

On chains that support it — Asset Hub, Hydration — a user can pay the transaction
fee in a non-native token they already hold (e.g. USDT) instead of being forced to
keep a native-token balance just for gas, so that a user with only stablecoins can
still transact. This removes the "you have funds but can't move them because you
have no native token" trap.

## Status

> **✅ done — shipped in 1.3.18.** All acceptance criteria are ticked and the 4 rows below are
> settled, 3 with a release.

## Background

Paying fees in a non-native asset is a chain-feature integration, not a generic
capability: it relies on each chain's fee-payment mechanism (Asset Hub's
`ChargeAssetTxPayment` / asset-conversion path, Hydration's fee-currency model), so
the available fee-asset list and the conversion math are sourced per chain. The
multi-chain fee/asset data is aggregated through the Backend Services SDK
([AD-24](../../ARCHITECTURE.md#architecture-decisions)) rather than computed
entirely on-device; the extrinsic is built against the chain's `ChainService` API
([AD-02](../../ARCHITECTURE.md#architecture-decisions)).

This is an **external system integration** (the chain's fee-asset feature + the
Services SDK aggregation), which is why it is sized 5 per §3a-bis rather than 3 —
the surface depends on partner-chain behaviour and a backend data source, not just
local UI. It extends the fee step from [US-8.3](US-8.3-custom-fee-and-tip.md).
Materializes [FR-77](../../PRD.md#functional-requirements). This story is
**Retroactive** — the capability already ships; `commit` / `version_shipped` are
backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a chain that supports non-native fee payment (Asset Hub,
  Hydration), **When** the user opens the fee step, **Then** they can choose a fee
  asset from the tokens they hold that the chain accepts, and the fee is quoted in
  that asset.
- [x] **AC-2** — **Given** a selected non-native fee asset, **When** the user
  confirms, **Then** the extrinsic is built to charge the fee in that asset and the
  transaction submits through the shared lifecycle.
- [x] **AC-3** — **Given** a chain that does NOT support non-native fees, **When**
  the user opens the fee step, **Then** only the native fee path is offered (no
  non-native selector) — the feature degrades cleanly per chain.
- [x] **AC-4** — **Given** a chosen fee asset whose balance is insufficient to
  cover the quoted fee, **When** the user attempts to confirm, **Then** the
  selection is rejected with an inline error and no transaction is submitted.

## Tasks

- [x] **TASK-8.4.1** — Resolve per-chain supported fee-asset list via the Services SDK (AC: 1, 3)
- [x] **TASK-8.4.2** — Fee-asset selector in the fee step; quote the fee in the chosen asset (AC: 1)
- [x] **TASK-8.4.3** — Build the extrinsic to charge the fee in the selected asset via ChainService (AC: 2)
- [x] **TASK-8.4.4** — Gate the selector to supporting chains only; native-only fallback elsewhere (AC: 3)
- [x] **TASK-8.4.5** — Validate fee-asset balance vs quoted fee; reject insufficient (AC: 4)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — supported fee assets and the conversion quote are aggregated through the Backend Services SDK, not recomputed on-device per chain.
- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — the fee-in-asset extrinsic is built against the chain's `ChainService` API object.
- This story does NOT introduce new AD entries. It consumes the fee engine (FR-10, EPIC-2) and the chain's native fee-payment feature.

### Cross-story dependencies

- Builds on [US-8.3](US-8.3-custom-fee-and-tip.md) — extends the fee step with the non-native fee-asset selector.
- Sibling [US-8.12](US-8.12-fee-bigint-and-gas-estimation-hardening.md) — fee-conversion math is covered by the BigInt/fee regression guard.

### What we explicitly did NOT do

- No non-native fee on chains without a fee-asset mechanism — feature is gated per chain, native-only elsewhere. Trigger to revisit: a new chain ships an asset-fee pallet.

### References

- [Source: PRD FR-77](../../PRD.md#functional-requirements) — pay fees with a non-native token (Asset Hub, Hydration)
- [Source: ARCHITECTURE AD-24](../../ARCHITECTURE.md#architecture-decisions) — Backend Services SDK aggregation
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: on Asset Hub / Hydration → choose a held fee asset; fee quoted in it |
| AC-2 | Manual: confirm → extrinsic charges fee in the asset; tx submitted |
| AC-3 | Manual: on a non-supporting chain → no non-native selector shown |
| AC-4 | Manual: choose an asset with insufficient balance → inline error, no submit |

## Changelog entry

### Added
- Non-native fee payment: choose a held token (Asset Hub, Hydration) to pay the
  transaction fee, with per-chain supported-asset resolution via the Services SDK,
  fee-in-asset extrinsic build, native-only fallback, and balance validation.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Incremental work, fixes & chores

**4 tracker issues** — 3 with a release, 1 delivered with no line naming it. Folded in from the
former one-issue-per-story maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.55 | [#2895](https://github.com/Koniverse/SubWallet-Extension/issues/2895) | WebApp - Allow selecting token to pay transaction fee on HydraDX | ✅ done |
| 1.3.18 | [#3590](https://github.com/Koniverse/SubWallet-Extension/issues/3590) | Support paying fee with non-native tokens on Asset Hub | ✅ done |
| 1.3.24 | [#4045](https://github.com/Koniverse/SubWallet-Extension/issues/4045) | Support custom fee token when sending token on Hydradx | ✅ done |
| — | [#2959](https://github.com/Koniverse/SubWallet-Extension/issues/2959) | WebApp - Implement UI for selecting token to pay transaction fee on HydraDX | ✅ done |

> **The WebApp got there first.** #2959 implemented the fee-token selection UI and #2895 allowed
> selecting a fee token on HydraDX — both WebApp, both in the 1.1.x window — while the extension's
> Asset Hub support (#3590) landed in 1.3.18 and Hydration (#4045) in 1.3.24. The surface with the
> looser release cadence is where this capability was tried out.
>
> **The open continuation is Hollar** ([#4709](https://github.com/Koniverse/SubWallet-Extension/issues/4709)),
> tracked in [US-11.17](US-11.17-swap-coverage-expansion.md) because it arrived through the swap
> tracker — the same fee-token question reaching a different queue.

## Cross-references

- [PRD FR-77](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.3](US-8.3-custom-fee-and-tip.md)
- [consolidation note](../../notes/2026-07-24.md#a-epic-28-maintenance--transactions-merged-into-epic-8)
