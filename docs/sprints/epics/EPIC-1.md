---
id: EPIC-1
title: "Build & Platform Infrastructure"
status: in-progress
prd_ref:
  - FR-1
  - FR-2
  - FR-3
  - FR-4
arch_ref:
  - AD-05
  - AD-06
  - AD-08
  - AD-09
  - AD-20
  - AD-25
created: 2026-06-12
updated: 2026-06-12
---

## Goal

This epic ships **no end-user feature on its own** — its deliverable is the
runnable platform every other epic builds on: a Manifest V3 service-worker
background that Chrome and Firefox accept, a Yarn 3 monorepo whose
`extension-base` core is reused verbatim by the extension, the web app and the
mobile web-runner, and an online hot-update channel that lets the team push new
networks and translations **without shipping a new extension release**. When
this epic holds the line, downstream epics get to stop worrying about packaging,
cross-platform portability, and release-gated data changes.

## Overview

### Business context

Before this epic there is no product surface at all: the wallet cannot load in a
modern Chrome (which enforces MV3 and evicts persistent background pages), cannot
share a single line of background logic between the browser extension and the
mobile WebView, and cannot add a chain or fix a translation without a full
store-review release cycle. EPIC-1 owns the **build, packaging and runtime
substrate** that closes all three gaps.

The epic adds a *runtime + delivery* capability, not a user-facing one. It owns
(a) the MV3 service-worker background and its shutdown/wake lifecycle (AD-08,
AD-20), (b) the twelve-package Yarn 3 monorepo whose boundaries let
`@subwallet/extension-base` run unchanged in the extension service worker, the
standalone web app, and the mobile web-runner WebView (AD-05, NFR-17), and
(c) the online hot-update channel that serves the chain-list and (planned)
runtime i18n from SubWallet's static-data / CDN proxy layer (AD-25) so networks,
tokens, logos and per-route XCM toggles change without a release.

The architectural distinction this epic preserves: it owns **how code is packaged
and how data is delivered**, not **what the code does**. The engines that consume
this substrate — keyring, ChainService, EarningService, the balance/fee/request/
transaction engines — are owned by [EPIC-2](EPIC-2.md). The *feature* that
auto-updates chain metadata and the per-chain network registry is owned by
[EPIC-4](EPIC-4.md); EPIC-1 owns only the generic hot-update *mechanism* it rides
on. Bundled per-locale UI translations (the VI/ZH/JA/RU localization shipped in
the package) are owned by [EPIC-19](EPIC-19.md); EPIC-1 owns only the *online
runtime* translation channel (FR-4).

### Out of scope

- **The wallet engines (keyring, ChainService, EarningService, balance/fee/request/transaction)** — owned by [EPIC-2](EPIC-2.md). EPIC-1 provides the monorepo and runtime they live in; it does not implement them.
- **The per-network registry and chain auto-update feature** (add/remove networks, token metadata refresh) — owned by [EPIC-4](EPIC-4.md) (FR-34). EPIC-1 owns only the generic online hot-update *mechanism*; EPIC-4 owns the chain-management *feature* that consumes it.
- **Bundled per-locale UI translations** (VI/ZH/JA/RU and the multi-language UI) — owned by [EPIC-19](EPIC-19.md) (FR-155). EPIC-1 owns only the online runtime i18n hot-update (FR-4); the shipped-in-package locale files are EPIC-19's.
- **Per-chain XCM route configuration as a transfer feature** — owned by [EPIC-13](EPIC-13.md). EPIC-1 owns only the release-free toggle *delivery* via the chain-list channel (AD-09, NFR-15).
- **The backend Services SDK and market-data cache proxies for balances/prices/NFT media** — owned by their consuming engine epics ([EPIC-2](EPIC-2.md), [EPIC-7](EPIC-7.md)). EPIC-1 anchors only the static-data / chain-list slice of the CDN proxy layer (AD-25).

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-1 | [US-1.1](../stories/US-1.1-mv3-service-worker-background.md) | 📋 backlog |
| FR-2 | [US-1.2](../stories/US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md) | 📋 backlog |
| FR-3 | [US-1.3](../stories/US-1.3-online-chain-list-hot-update.md) | 📋 backlog |
| FR-4 | [US-1.4](../stories/US-1.4-online-i18n-hot-update.md) | 📋 backlog |

> FR statuses above are **story-planning** statuses (Stream B; all `📋 backlog`).
> The shipped state of each capability lives in [PRD](../../PRD.md#functional-requirements): FR-1/2/3 are
> `✅ shipped`, FR-4 is `📋 planned`. `done` + `version_shipped` are backfilled in
> version reconciliation. US-1.5 is a hardening cluster and owns no FR.

## AD Coverage

| AD | Title | Story |
|----|-------|-------|
| AD-08 | Manifest V3 migration with service worker background | [US-1.1](../stories/US-1.1-mv3-service-worker-background.md) |
| AD-20 | Four-state MV3 background lifecycle with heartbeat | [US-1.1](../stories/US-1.1-mv3-service-worker-background.md) |
| AD-05 | Yarn 3 monorepo package boundaries | [US-1.2](../stories/US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md) |
| AD-06 | Webpack 5 bundle splitting (Firefox per-file limit) | [US-1.2](../stories/US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md), [US-1.5](../stories/US-1.5-build-ci-and-cross-browser-packaging-hardening.md) |
| AD-09 | Per-chain XCM route toggle (release-free) | [US-1.3](../stories/US-1.3-online-chain-list-hot-update.md) |
| AD-25 | Cache / CDN proxy layer (static-data / chain-list slice) | [US-1.3](../stories/US-1.3-online-chain-list-hot-update.md), [US-1.4](../stories/US-1.4-online-i18n-hot-update.md) |

> AD-25 is *anchored* here only for its static-data / chain-list slice. Its
> market-data (`api-cache`) and NFT-media (`ipfs-files`) slices are referenced
> but materialized by the engine epics ([EPIC-2](EPIC-2.md), [EPIC-7](EPIC-7.md),
> [EPIC-9](EPIC-9.md)).

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-1.1](../stories/US-1.1-mv3-service-worker-background.md) | MV3 service-worker background | Run the background as an MV3 service worker that survives shutdown/wake and is accepted by Chrome and Firefox | 📋 backlog | — |
| [US-1.2](../stories/US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md) | Yarn 3 monorepo shared across extension/web/mobile | One `extension-base` core reused by extension, web app and mobile web-runner | 📋 backlog | — |
| [US-1.3](../stories/US-1.3-online-chain-list-hot-update.md) | Online chain-list hot-update | Add networks/tokens/logos and toggle XCM routes without a release | 📋 backlog | — |
| [US-1.4](../stories/US-1.4-online-i18n-hot-update.md) | Online i18n hot-update | Fetch updated UI translations at runtime without a release | 📋 backlog | — |
| [US-1.5](../stories/US-1.5-build-ci-and-cross-browser-packaging-hardening.md) | Build, CI & cross-browser packaging hardening | Keep the build/webpack and packaging pipeline shippable across browsers (Firefox MV3, Brave uninstall, Jest env, online-resource fallback) | 📋 backlog | — |

> US-1.1–1.4 each materialize one FR; US-1.5 is the epic's bug/iteration
> (hardening) cluster and owns no FR — it enforces the build/compliance NFRs.

## Cross-cutting invariants

- **MV3 service-worker compliance ([FR-1](../../PRD.md#functional-requirements), AD-08):** the background MUST run as an event-driven MV3 service worker with WASM loaded via `wasm-unsafe-eval` CSP — never as a persistent MV2 page. Enforced by [US-1.1](../stories/US-1.1-mv3-service-worker-background.md); regressions caught when the extension fails to load in Chrome 102+.
- **State survives service-worker eviction (NFR-8, AD-20):** because MV3 evicts an idle worker (~5 min), all background state MUST be rehydratable from `chrome.storage.local` / dexie on wake through the four-state lifecycle (Init → Start-Partially → Start-Fully → Sleep). Enforced by [US-1.1](../stories/US-1.1-mv3-service-worker-background.md).
- **`extension-base` is platform-agnostic ([FR-2](../../PRD.md#functional-requirements), AD-05, NFR-17):** the core package MUST NOT import extension-only, webapp-only or web-runner-only APIs — the same background logic runs in all three contexts. Enforced by [US-1.2](../stories/US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md); violations surface as a build break in one of the three targets.
- **Firefox per-file size cap ([FR-2](../../PRD.md#functional-requirements), AD-06, NFR-9):** every emitted Webpack chunk MUST stay below Firefox's ~4 MB per-file submission limit. Enforced by [US-1.2](../stories/US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md) and defended in [US-1.5](../stories/US-1.5-build-ci-and-cross-browser-packaging-hardening.md) by build/CI packaging hardening.
- **Release-free data delivery ([FR-3](../../PRD.md#functional-requirements), AD-09, AD-25):** chain-list, token/asset metadata and per-route XCM toggles MUST be updatable at runtime from the static-data channel with a bundled JSON fallback — no extension release required. Enforced by [US-1.3](../stories/US-1.3-online-chain-list-hot-update.md).
- **English-canonical strings ([FR-4](../../PRD.md#functional-requirements), NFR-13):** all user-facing strings are authored in English first; the online i18n channel only *overrides* an existing key, never invents one. Enforced by [US-1.4](../stories/US-1.4-online-i18n-hot-update.md).

## Acceptance criteria (propagated from stories)

- [ ] The background runs as an MV3 service worker accepted by Chrome and Firefox, and rehydrates state after a worker eviction — [US-1.1](../stories/US-1.1-mv3-service-worker-background.md)
- [ ] `@subwallet/extension-base` builds and runs unchanged in the extension, the web app and the mobile web-runner, with no chunk exceeding Firefox's per-file limit — [US-1.2](../stories/US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md)
- [ ] New networks/tokens/logos and per-route XCM toggles take effect from the online chain-list without an extension release, with a bundled fallback when the channel is unreachable — [US-1.3](../stories/US-1.3-online-chain-list-hot-update.md)
- [ ] Updated UI translations are fetched at runtime without a release, falling back to bundled locales on failure — [US-1.4](../stories/US-1.4-online-i18n-hot-update.md)
- [ ] The build/webpack and packaging pipeline stays shippable across supported browsers — Firefox MV3 build, cross-browser (Brave) uninstall, the Jest test/build environment, and the online-resource bundled fallback are all hardened — [US-1.5](../stories/US-1.5-build-ci-and-cross-browser-packaging-hardening.md)
