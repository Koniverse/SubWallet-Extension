---
id: EPIC-11
title: "swap"
status: in-progress
prd_ref:
  - FR-103
  - FR-104
  - FR-105
  - FR-106
  - FR-107
  - FR-108
  - FR-109
  - FR-110
  - FR-111
  - FR-112
  - FR-113
arch_ref:
  - AD-24
  - AD-18
created: 2026-06-11
updated: 2026-06-11
---

## Goal

Let users exchange tokens without leaving the wallet — a key DeFi convenience —
by aggregating many swap providers behind one quote / route / execute surface.

## Overview

### Business context

Before this epic a user must leave for an external DEX to trade. EPIC-11 owns the
**in-wallet exchange path**: every provider (Chainflip, Hydration, Uniswap,
KyberSwap, SimpleSwap, Asset Hub DEX, Bittensor dTAO, Optimex, plus incoming
PiperX / StellaSwap) plugs into the shared **SwapService routing engine** (PRD
[FR-8](../../PRD.md), EPIC-2) as a handler, and quote/fee data is aggregated
through the Services SDK backend (AD-24).

Swap **owns routing, not the primitives it composes**: the bridge step used in
cross-chain routes is owned by [EPIC-13](EPIC-13.md) (delegated to ParaSpell,
AD-18), and the SwapService engine itself lives in [EPIC-2](EPIC-2.md).

> FR statuses below are **story-planning** statuses. The shipped state of each
> provider lives in [PRD](../../PRD.md) (most are `✅ shipped`).

### Out of scope

- **Bridge construction (XCM / external bridges)** — owned by [EPIC-13](EPIC-13.md). Swap routing *consumes* it (AD-18).
- **The SwapService engine itself** — owned by [EPIC-2](EPIC-2.md) (core-platform); providers reuse it.
- **Fiat on/off-ramp** — owned by [EPIC-14](EPIC-14.md) (fiat-gateway); buying/selling crypto for fiat, not token-to-token swap.

## FR Coverage

> Every FR is assigned a story ID up front (in FR order) so the numbering is
> locked — no renumber when the remaining stories are authored. Links = story
> file exists (illustrative examples); `(planned)` = ID reserved, file authored
> when scheduled.

| FR | Story | Status |
|----|-------|--------|
| FR-103 | US-11.1 _(planned)_ | 📋 backlog |
| FR-104 | [US-11.2](../stories/US-11.2-in-wallet-swap-via-hydration-dex.md) | 📋 backlog |
| FR-105 | US-11.3 _(planned)_ | 📋 backlog |
| FR-106 | US-11.4 _(planned)_ | 📋 backlog |
| FR-107 | US-11.5 _(planned)_ | 📋 backlog |
| FR-108 | US-11.6 _(planned)_ | 📋 backlog |
| FR-109 | US-11.7 _(planned)_ | 📋 backlog |
| FR-110 | [US-11.8](../stories/US-11.8-cross-chain-swap-routing.md) | 📋 backlog |
| FR-111 | US-11.9 _(planned)_ | 📋 backlog |
| FR-112 | US-11.10 _(planned)_ | 📋 backlog |
| FR-113 | US-11.11 _(planned)_ | 📋 backlog |

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| US-11.1 | In-wallet swap via Chainflip | Native BTC↔Polkadot↔EVM swap | 📋 backlog | — |
| [US-11.2](../stories/US-11.2-in-wallet-swap-via-hydration-dex.md) | In-wallet swap via Hydration DEX | Substrate omnipool DEX swap | 📋 backlog | — |
| US-11.3 | In-wallet swap via Uniswap (V3/V4 + UniswapX) | EVM DEX swap | 📋 backlog | — |
| US-11.4 | In-wallet swap via KyberSwap | EVM aggregator swap | 📋 backlog | — |
| US-11.5 | In-wallet swap via SimpleSwap | Non-custodial cross-chain swap | 📋 backlog | — |
| US-11.6 | In-wallet swap via Asset Hub DEX | Polkadot Asset Hub swap | 📋 backlog | — |
| US-11.7 | In-wallet Bittensor dTAO swap | TAO↔alpha subnet-AMM swap | 📋 backlog | — |
| [US-11.8](../stories/US-11.8-cross-chain-swap-routing.md) | Cross-chain swap routing (Swap↔Bridge) | Multi-hop swap+bridge routing | 📋 backlog | — |
| US-11.9 | In-wallet swap via Optimex | Intent-based cross-chain swap | 📋 backlog | — |
| US-11.10 | In-wallet swap via PiperX | EVM DEX swap (in progress) | 📋 backlog | — |
| US-11.11 | In-wallet swap via StellaSwap | Moonbeam DEX swap (planned) | 📋 backlog | — |

> 2 illustrative example stories have files (US-11.1, US-11.2); US-11.3–11.11 are
> numbered here and authored when scheduled.

## Cross-cutting invariants

- **Provider-agnostic UI ([FR-8](../../PRD.md)):** a new provider is a new
  SwapService handler, never a new swap-UI branch. A provider PR that touches
  swap-UI conditionals is rejected.
- **API keys never ship in the bundle ([NFR-16](../../PRD.md)):** keyed providers
  (Chainflip, KyberSwap, SimpleSwap, Uniswap) route through the backend proxy.
- **Multi-hop resumability ([FR-110](../../PRD.md)):** a stalled cross-chain route
  must be recoverable; funds are never reported lost between hops. Enforced by
  US-11.8.

## Acceptance criteria (propagated from stories)

- [ ] A swap can be quoted and executed on a Substrate DEX (Hydration) through a
      SwapService handler — [US-11.2](../stories/US-11.2-in-wallet-swap-via-hydration-dex.md)
- [ ] A cross-chain pair resolves to a Swap→Bridge / Bridge→Swap multi-hop route
      with per-step tracking and recovery — [US-11.8](../stories/US-11.8-cross-chain-swap-routing.md)
- [ ] _(remaining providers — US-11.1, 11.3–11.7, 11.9–11.11, per FR Coverage)_
