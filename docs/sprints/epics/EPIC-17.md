---
id: EPIC-17
title: "Proxy Accounts"
status: done
prd_ref:
  - FR-148
arch_ref:
  - AD-16
  - AD-04
  - AD-21
created: 2026-06-12
updated: 2026-07-14
---

## Goal

Power users delegate signing authority on Substrate the way the chain itself
models it: a **proxy account** signs and submits with its own key but the
extrinsic executes *on behalf of* another (proxied) account, scoped to a named
Polkadot proxy-pallet type (Any, NonTransfer, Governance, Staking, …). The epic
delivers both halves of that capability — the authority *model* (add a proxy,
pick its type, manage the relationship) and the signing-time *behaviour* (a Sign
Selector that picks which controlling account actually signs, with the
"proxied-by" provenance shown end to end).

## Overview

### Business context

Before this epic, every signature is direct: the account shown as the sender is
the account whose key signs. There is no way to act under delegated authority —
to hold a cold "stash" account and let a hot "controller" proxy sign governance
or staking extrinsics for it. EPIC-17 adds the **proxy authority model** on top
of the existing account and signing stack: it teaches the wallet that one
account can be authorised to sign on behalf of another, constrained to the
named proxy types the Polkadot `proxy` pallet defines ([AD-16](../../ARCHITECTURE.md#architecture-decisions)).

This epic adds an **account-authority capability**, not a new signing transport
and not a new transaction surface. The key that signs a proxied transaction is
still an ordinary software key in the background keyring — proxy reuses the
non-custodial keyring boundary ([AD-04](../../ARCHITECTURE.md#architecture-decisions))
rather than introducing a new custody path. And proxy signing is surfaced as a
**Sign Selector popup on the *existing* transaction flows**
([AD-16](../../ARCHITECTURE.md#architecture-decisions)) wired through the same
per-ecosystem RequestService handlers ([AD-21](../../ARCHITECTURE.md#architecture-decisions),
[US-2.7](../stories/US-2.7-requestservice-approval-queue.md)) — deliberately
*not* a parallel "proxy-initiated transaction" builder.

The architectural distinction the epic preserves: proxy is a **shared-authority
model where one account signs for another**, which is easy to confuse with
**multisig** ([EPIC-18](EPIC-18.md)). They are different models and must not be
conflated. Proxy delegates authority to a *single* controlling key that signs a
*normal* extrinsic wrapped as `proxy.proxy(...)`; multisig requires *M-of-N*
signatories to each approve a *pending* extrinsic via `as_multi` / `approveAsMulti`
([AD-17](../../ARCHITECTURE.md#architecture-decisions)). One proxy signature
executes immediately; a multisig needs threshold approvals collected over time.
The proxy-vs-multisig boundary is drawn explicitly in Out of scope below.

> FR statuses below are **story-planning** statuses; the shipped state of the
> capability lives in [PRD](../../PRD.md#functional-requirements) (FR-148 is `✅ shipped` — these are
> retroactive stories). `done` + `version_shipped` are backfilled in version
> reconciliation.

### Out of scope

- **Software-key accounts (creating / importing / deriving the keys themselves)** — owned by [EPIC-3](EPIC-3.md). Proxy *uses* those keyring accounts as the controlling signer; it does not create them.
- **Hardware-wallet accounts as the proxy account** — owned by [EPIC-16](EPIC-16.md). Per [AD-16](../../ARCHITECTURE.md#architecture-decisions) the proxy model is scoped to Substrate software accounts (no EVM-solo, no Ledger-EVM); hardware-device signing is a separate transport.
- **Multisig (a *different* shared-authority model)** — owned by [EPIC-18](EPIC-18.md). Multisig is M-of-N threshold approval of a *pending* extrinsic (`as_multi` / `approveAsMulti`, [AD-17](../../ARCHITECTURE.md#architecture-decisions)); proxy is single-key delegated authority that signs a normal extrinsic on behalf of another account. Same "act for another account" intuition, fundamentally different mechanism — do not merge the two.
- **Transaction building & submission** — owned by [EPIC-8](EPIC-8.md). This epic only decides *who signs and on whose behalf*; the extrinsic construction, fee handling, and submit path are EPIC-8's.
- **The RequestService approval / sign queue** — owned by [EPIC-2](EPIC-2.md) ([US-2.7](../stories/US-2.7-requestservice-approval-queue.md)). The Sign Selector plugs into the existing sign queue and per-ecosystem handlers ([AD-21](../../ARCHITECTURE.md#architecture-decisions)); it does not build a new approval surface.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-148 | [US-17.1](../stories/US-17.1-proxy-types-and-authority-management.md) | ✅ done |
| FR-148 | [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md) | ✅ done |

> FR-148 is a single functional requirement split across two stories by
> capability: US-17.1 owns the account/authority **model** (add a proxy, choose
> a proxy type, manage the relationship); US-17.2 owns the signing-time
> **behaviour** (the Sign Selector picks which controlling account signs, and
> the proxied-by provenance is displayed). Both must ship for FR-148 to be
> complete.

## AD Coverage

| AD | Title | Story |
|----|-------|-------|
| AD-16 | Proxy account model (named pallet types, Substrate-only, Sign Selector) | [US-17.1](../stories/US-17.1-proxy-types-and-authority-management.md), [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md) |
| AD-04 | Non-custodial keyring confined to background | [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md) |
| AD-21 | Per-ecosystem request-handler abstraction in RequestService | [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md) |

> AD-21 is *referenced* here because the Sign Selector rides the existing
> RequestService signing surface; its primary implementation lives in
> [EPIC-2](EPIC-2.md) ([US-2.7](../stories/US-2.7-requestservice-approval-queue.md)).
> EPIC-17 reuses that surface rather than re-deriving it.

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-17.1](../stories/US-17.1-proxy-types-and-authority-management.md) | Proxy types & authority management | Add a proxy to a Substrate account, choose a named pallet proxy type, and manage the delegated-authority relationship | ✅ done | 1.3.72 |
| [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md) | Proxy signing (Sign Selector) + proxied-by display | At signing time a Sign Selector picks which controlling account signs, and the proxied-by provenance is shown end to end | ✅ done | 1.3.72 |

## Cross-cutting invariants

- **Proxy signs with its own key; executes on behalf of the proxied account ([FR-148](../../PRD.md#functional-requirements), [AD-16](../../ARCHITECTURE.md#architecture-decisions)):** a proxied transaction is signed by the *proxy* account's key but executes *for* the proxied account (wrapped as `proxy.proxy(...)`). The sender of the signature and the on-behalf-of account are two distinct accounts and must never be collapsed into one. Enforced by [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md).
- **Proxied-by provenance is always visible ([FR-148](../../PRD.md#functional-requirements)):** wherever a proxied transaction appears — Sign Selector, confirmation screen, and resulting history entry — the UI must show *both* the signing proxy account and the proxied (on-behalf-of) account. A proxied transaction that renders as an ordinary self-signed one is a defect, not a cosmetic gap. Enforced by [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md).
- **Only named pallet proxy types, Substrate-only ([AD-16](../../ARCHITECTURE.md#architecture-decisions)):** the wallet supports only the proxy types the Polkadot `proxy` pallet defines (no custom types) and only for Substrate software accounts (no EVM-solo, no Ledger-EVM). Authority that the chosen proxy type does not grant must be rejected before signing, not after submit. Enforced by [US-17.1](../stories/US-17.1-proxy-types-and-authority-management.md) (type model) and [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md) (signing-time authority check).
- **Key stays in the background keyring ([AD-04](../../ARCHITECTURE.md#architecture-decisions)):** proxy reuses the non-custodial keyring boundary — the controlling key never leaves the background service worker; proxy introduces no new custody path. Enforced by [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md).

## Acceptance criteria (propagated from stories)

- [ ] A user can add a proxy to a Substrate account, pick a named pallet proxy type (Any / NonTransfer / Governance / Staking / …), and manage the delegated-authority relationship — [US-17.1](../stories/US-17.1-proxy-types-and-authority-management.md)
- [ ] At signing time the Sign Selector lets the user pick which controlling account signs on behalf of the proxied account, and the proxied-by provenance is shown through confirmation and history — [US-17.2](../stories/US-17.2-proxy-signing-sign-selector-and-proxied-by-display.md)
