---
id: EPIC-14
title: "Fiat On/Off-Ramp"
status: backlog
prd_ref:
  - FR-138
  - FR-139
  - FR-140
arch_ref:
  - AD-19
  - AD-23
  - AD-24
  - AD-25
created: 2026-06-12
updated: 2026-06-12
---

## Goal

The fiat-gateway epic owns the **fiat↔crypto bridge** — how a user funds the
wallet with a card and how they cash out. It turns the "I have money in my bank"
intent into on-chain assets (on-ramp) and back again (off-ramp) by routing the
user to a regulated third-party provider (Transak, Banxa, Coinbase Pay, Meld)
that runs the KYC, payment, and settlement. When this epic holds the line, no
feature epic has to think about card payments, KYC, or provider compliance: it
hands off to a provider through one provider-agnostic buy/sell surface and one
backend-built order URL.

## Overview

### Business context

Before this epic, a new user who has completed onboarding has an empty wallet
and no in-product path to fund it — they must acquire crypto on an exchange and
transfer it in. The fiat-gateway closes that gap: it owns the **fiat on-ramp**
(buy crypto with a card via Transak, Banxa, Coinbase Pay, and Meld — FR-138),
the **fiat off-ramp** (sell crypto for fiat via Transak — FR-139), and the
**forward expansion** to additional on-ramp providers and native payment rails
(MoonPay, Ramp.Network, Apple Pay / Google Pay — FR-140).

This epic was **split out of the old "onboarding" area**. Funding the wallet is
not part of creating or restoring it: onboarding/wallet-create is owned by
[EPIC-19](EPIC-19.md), and the fiat-gateway is the *first thing a funded wallet
does after* onboarding, with its own provider-integration concerns (KYC,
regional availability, payment compliance) that have nothing to do with seed
generation. Keeping them separate prevents the buy/sell surface from being
entangled with the create-account flow.

The capability this epic adds is a **hand-off path**, not a balance/write path.
SubWallet never takes custody of the fiat, never runs KYC, and never settles the
card payment — the provider does. The wallet's job is to (a) select an asset and
the user's receiving address, (b) ask the backend to mint a provider order URL
for the right provider and `action` (BUY / SELL), and (c) open that URL. The
resulting crypto arrives on-chain and is surfaced by the balance epic
([EPIC-7](EPIC-7.md)) like any other deposit — the fiat-gateway does not render
balances itself.

### Feature pillars

| # | Pillar | Stories | Purpose |
|---|---|---|---|
| 1 | **On-ramp (buy)** | [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md), [US-14.3](../stories/US-14.3-additional-on-ramp-providers.md) | Buy crypto with a card through aggregated regulated providers; expand the provider/payment-rail roster |
| 2 | **Off-ramp (sell)** | [US-14.2](../stories/US-14.2-fiat-off-ramp-sell-crypto-for-fiat.md) | Sell crypto for fiat via the same Transak hand-off with `action: SELL` |

### Out of scope

- **Token-to-token *swap*** — owned by [EPIC-11](EPIC-11.md). A swap is crypto↔crypto (one on-chain asset for another); the fiat-gateway is fiat↔crypto (card/bank money in or out). The explicit boundary: if no fiat leg is involved it is a swap, not a fiat-gateway flow. The two never share the order-URL path.
- **Cross-chain bridge / XCM transfers** — owned by [EPIC-13](EPIC-13.md). Moving an existing on-chain asset between chains is a bridge, not a fiat on/off-ramp.
- **Onboarding / wallet-create & restore flow** — owned by [EPIC-19](EPIC-19.md). The fiat-gateway was split OUT of the old onboarding area: funding a wallet is a post-onboarding action with its own provider/KYC concerns and shares no code with account creation.
- **Balance & price display of purchased assets** — owned by [EPIC-7](EPIC-7.md). The fiat-gateway opens the provider; the crypto that arrives is rendered by the portfolio read surface, not here.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-138 | [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md) | 📋 backlog |
| FR-139 | [US-14.2](../stories/US-14.2-fiat-off-ramp-sell-crypto-for-fiat.md) | 📋 backlog |
| FR-140 | [US-14.3](../stories/US-14.3-additional-on-ramp-providers.md) | 📋 backlog |

> FR statuses above are **story-planning** statuses (Stream B; all `📋 backlog`).
> The shipped state of each capability lives in [PRD](../../PRD.md#functional-requirements): FR-138 and
> FR-139 are `✅ shipped` (retroactive stories), FR-140 is `📋 planned` (forward).
> `done` + `version_shipped` are backfilled during version reconciliation.

## AD Coverage

| AD | Title | Story |
|----|-------|-------|
| AD-24 | Backend Services SDK for multi-chain data aggregation | [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md), [US-14.2](../stories/US-14.2-fiat-off-ramp-sell-crypto-for-fiat.md) |
| AD-19 | Backend proxy for third-party API keys | [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md), [US-14.3](../stories/US-14.3-additional-on-ramp-providers.md) |
| AD-23 | Static-data caching generated by a headless web-runner cron | [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md), [US-14.3](../stories/US-14.3-additional-on-ramp-providers.md) |
| AD-25 | Cache / CDN proxy layer for market data, metadata and NFT media | [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md) |

> AD-24 is the primary anchor: the Transak order URL is minted by the SubWallet
> Services SDK (`transakApi.generateOrderUrl`) so the partner secret never ships
> in the bundle — this is AD-19 (backend proxy for keys) realized through the
> Services-SDK substrate (AD-24, NFR-20). AD-19 and AD-24 are *anchored* here for
> the order-URL path; their primary implementation lives in
> [EPIC-2](EPIC-2.md). AD-23 / AD-25 are *referenced*: the provider/token roster
> (`buyServiceInfos`, `buyTokenConfigs`) is served via `fetchStaticData` so a
> provider can be enabled or suspended without an extension release.

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md) | Fiat on-ramp: buy crypto with card | Buy crypto with a card via aggregated regulated providers (Transak, Banxa, Coinbase Pay, Meld) | 📋 backlog | — |
| [US-14.2](../stories/US-14.2-fiat-off-ramp-sell-crypto-for-fiat.md) | Fiat off-ramp: sell crypto for fiat | Sell crypto for fiat via the Transak hand-off (`action: SELL`) | 📋 backlog | — |
| [US-14.3](../stories/US-14.3-additional-on-ramp-providers.md) | Additional on-ramp providers | Add MoonPay, Ramp.Network and native Apple Pay / Google Pay rails as new adapters | 📋 backlog | — |

> US-14.1 and US-14.2 are retroactive (capability already ships); US-14.3 is
> forward/planned. Each story materializes exactly one FR.

## Cross-cutting invariants

- **Secret provider keys never ship in the bundle ([NFR-16](../../PRD.md#non-functional-requirements), AD-19, AD-24):** any provider whose order URL requires a *secret* credential (e.g. Transak) must have that URL minted server-side through the SubWallet Services SDK (`transakApi.generateOrderUrl`) / backend proxy — never assembled in-client from a bundled secret. Provider *publishable* keys that the provider intends to be client-side (e.g. Meld's `publicKey` wizard key) are the documented exception and may appear in client URL builders. Enforced by [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md); reviewers reject any new adapter that bundles a secret credential.
- **Provider-agnostic buy/sell surface ([FR-138](../../PRD.md#functional-requirements), [FR-140](../../PRD.md#functional-requirements)):** a new on-ramp provider is a **new adapter** (`CreateBuyOrderFunction` keyed by `SupportService`), not a new buy-UI branch. The buy/sell screen selects asset + address + provider and dispatches through the adapter map; it MUST NOT grow a per-provider `if` ladder. Enforced by [US-14.3](../stories/US-14.3-additional-on-ramp-providers.md); the adapter contract is set up by [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md).
- **Provider/token roster is release-free config ([FR-138](../../PRD.md#functional-requirements), AD-23, AD-25):** which providers are available, which tokens each supports, and per-provider `isSuspended` state are served from `buyServiceInfos` / `buyTokenConfigs` via `fetchStaticData` — not hard-coded — so a provider outage or a new supported token is a config change, not an extension release. Enforced by [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md).
- **SubWallet never takes fiat custody (FR-138, FR-139):** the wallet only opens the provider's hosted flow; KYC, payment capture, and settlement all live with the provider. No story in this epic moves fiat or stores payment data. Enforced across [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md) and [US-14.2](../stories/US-14.2-fiat-off-ramp-sell-crypto-for-fiat.md).

## Acceptance criteria (propagated from stories)

- [ ] A user can buy crypto with a card by selecting an asset + provider and being handed off to the provider's hosted flow with a backend-minted order URL — [US-14.1](../stories/US-14.1-fiat-on-ramp-buy-crypto-with-card.md)
- [ ] A user can sell crypto for fiat via the same Transak hand-off with `action: SELL` — [US-14.2](../stories/US-14.2-fiat-off-ramp-sell-crypto-for-fiat.md)
- [ ] New on-ramp providers (MoonPay, Ramp.Network) and native pay rails (Apple Pay / Google Pay) plug in as adapters with no change to the buy-UI dispatch — [US-14.3](../stories/US-14.3-additional-on-ramp-providers.md) (planned)
