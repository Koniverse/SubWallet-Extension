---
id: EPIC-19
title: "Onboarding, Localization & Engagement"
status: in-progress
prd_ref:
  - FR-152
  - FR-153
  - FR-154
  - FR-155
  - FR-156
  - FR-157
  - FR-158
  - FR-159
arch_ref:
  - AD-23
  - AD-24
  - AD-25
created: 2026-06-12
updated: 2026-07-14
---

## Goal

The utilities epic owns the supporting surfaces wrapped *around* the core wallet:
the first-run onboarding wrapper that gets a user safely in (backup reminder + terms
acceptance), the bundled multi-language UI that lets non-English users read the
product, the in-app growth campaigns that reach and reward users (banners, quests,
NFT-mint, Mission Pools), and the notification center that keeps users informed of
transaction status, campaign alerts and system messages. None of these is the
wallet's core money-path; together they are the connective tissue that turns the
engine + read-surface epics into a product a real person can pick up, understand,
and stay engaged with.

## Overview

### Business context

This epic deliberately **gathers three previously-separate concerns under one
"utilities" umbrella**: (1) **onboarding & localization** — the first-run UX and the
bundled-language UI; (2) **campaigns & rewards** — the in-app growth surfaces; and
(3) **notifications** — the in-app message center. In the pre-restructure taxonomy
these lived as distinct onboarding, campaign/quest, and notification areas; the
2026-06-12 restructure merged them because each is a thin, cross-cutting *utility*
layered on top of the core wallet rather than a standalone product pillar, and
none on its own justified a dedicated epic.

What's missing before this epic: the engines (EPIC-2), the keyring/account model
(EPIC-3), the read surfaces (balance EPIC-7, etc.) and the core flows all exist,
but there is no standardized first-run wrapper, no bundled translations, no growth
surface to reach users, and no in-app place to see status and alerts. EPIC-19 adds
these as **read/display + light-orchestration** layers: the onboarding stories own
the *UX wrapper* (reminder + T&C gates), the i18n stories own the *language
content/UI*, the campaign stories own the *display + claim wiring* of remotely
configured campaigns, and the notification story owns the *in-app feed* that
surfaces events other services produce.

The architectural distinction this epic preserves: it owns the **utility
display/UX layers**, not the underlying mechanisms. It does **not** generate keys
(EPIC-3 owns the keyring create/restore flow; onboarding here is only the wrapper
around it), it does **not** own the online i18n hot-update *transport* (EPIC-1 owns
the FR-4 mechanism; EPIC-19 owns the bundled per-locale *content*), it does **not**
own the earning/staking positions a quest may link to (EPIC-12), and it does **not**
own fiat on-ramp (EPIC-14). The campaign and quest/mission data is fetched through
the SubWallet Services SDK backend (AD-24) and the static-data / cache-proxy layers
(AD-23, AD-25), so campaigns can be pushed and updated release-free; the
notification feed and bundled locale files ride the same delivery substrate.

### Feature pillars

| # | Pillar | Stories | Purpose |
|---|---|---|---|
| 1 | **Onboarding & localization** | [US-19.1](../stories/US-19.1-wallet-create-restore-onboarding-wrapper.md), [US-19.2](../stories/US-19.2-multi-language-i18n-round-1.md), [US-19.3](../stories/US-19.3-additional-ui-languages.md) | First-run UX wrapper (backup reminder + T&C) and the bundled multi-language UI (Round 1 VI/ZH/JA/RU, plus forward DE/FR/…) |
| 2 | **Campaigns & rewards** | [US-19.4](../stories/US-19.4-in-app-campaign-banners.md), [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md), [US-19.6](../stories/US-19.6-nft-mint-campaigns.md), [US-19.7](../stories/US-19.7-mission-pools-reward-program.md) | The in-app growth surfaces: marketing banners, airdrop/quest missions, NFT-mint campaigns, and the Mission Pools reward program |
| 3 | **Notifications** | [US-19.8](../stories/US-19.8-in-app-notification-center.md) | The in-app notification center surfacing transaction status, campaign alerts and system messages |

### Out of scope

- **Wallet-creation keyring flow (seed generation / restore / derivation)** — owned by [EPIC-3](EPIC-3.md). Onboarding here is the *first-run UX wrapper* only — the backup-reminder gate and terms-of-service acceptance around the create/restore flow — NOT key generation, mnemonic creation, or account derivation (AD-04, AD-11), which EPIC-3 owns.
- **Fiat on-ramp / buy-crypto onboarding** — owned by [EPIC-14](EPIC-14.md). The buy/on-ramp path was split out of the old onboarding area; EPIC-19's onboarding is the wallet-setup wrapper, not the funding step.
- **Earning / staking positions a quest may link to** — owned by [EPIC-12](EPIC-12.md) (EarningService surface). A Mission Pools or quest entry may deep-link into a staking position, but the position itself, its APR, and the stake/unstake flow are EPIC-12's.
- **Online i18n hot-update *transport* (runtime remote translations, no release)** — owned by [EPIC-1](EPIC-1.md) (FR-4, [US-1.4](../stories/US-1.4-online-i18n-hot-update.md), riding AD-25). EPIC-19's US-19.2 / US-19.3 own the language *content and the UI* (the bundled `locales/{lng}/translation.json` files and the language picker); EPIC-1 owns the generic hot-update *mechanism* that can later push translations release-free.
- **The chain-list online-config transport** — owned by [EPIC-1](EPIC-1.md) (FR-3) / [EPIC-4](EPIC-4.md) (chain-management feature). EPIC-19 consumes the same cache-proxy substrate (AD-25) for campaign/notification content but does not own the online-config channel.

## FR Coverage

| FR | Story | Status |
|----|-------|--------|
| FR-152 | [US-19.1](../stories/US-19.1-wallet-create-restore-onboarding-wrapper.md) | ✅ done |
| FR-153 | [US-19.2](../stories/US-19.2-multi-language-i18n-round-1.md) | ✅ done |
| FR-154 | [US-19.3](../stories/US-19.3-additional-ui-languages.md) | 📋 backlog |
| FR-155 | [US-19.4](../stories/US-19.4-in-app-campaign-banners.md) | ✅ done |
| FR-156 | [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md) | ✅ done |
| FR-157 | [US-19.6](../stories/US-19.6-nft-mint-campaigns.md) | 📋 backlog |
| FR-158 | [US-19.7](../stories/US-19.7-mission-pools-reward-program.md) | ✅ done |
| FR-159 | [US-19.8](../stories/US-19.8-in-app-notification-center.md) | ✅ done |

> FR statuses above are **story-planning** statuses (Stream B; all `📋 backlog`).
> The shipped state of each capability lives in [PRD](../../PRD.md#functional-requirements): FR-152, FR-153,
> FR-155..161 are `✅ shipped` (retroactive stories), FR-154 is `📋 planned`
> (forward). `done` + `version_shipped` are backfilled in version reconciliation.
> FR-4 (online i18n hot-update *transport*) is **not** owned here — it is owned by
> [EPIC-1](EPIC-1.md) ([US-1.4](../stories/US-1.4-online-i18n-hot-update.md)) and
> listed only as a downstream dependent of US-19.2/US-19.3's bundled content.

## AD Coverage

| AD | Title | Story |
|----|-------|-------|
| AD-24 | Backend Services SDK for multi-chain data aggregation | [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md), [US-19.7](../stories/US-19.7-mission-pools-reward-program.md) |
| AD-23 | Static-data caching generated by a headless web-runner cron | [US-19.4](../stories/US-19.4-in-app-campaign-banners.md), [US-19.6](../stories/US-19.6-nft-mint-campaigns.md) |
| AD-25 | Cache / CDN proxy layer for market data, metadata and NFT media | [US-19.4](../stories/US-19.4-in-app-campaign-banners.md), [US-19.8](../stories/US-19.8-in-app-notification-center.md) |

> These ADs are the **release-free content-delivery substrate** EPIC-19 rides:
> campaigns, quests, mission pools and the notification feed are remotely
> configured and fetched through the Services SDK (AD-24) and the static-data /
> cache-proxy layers (AD-23, AD-25) so they can be pushed and updated without an
> extension release. AD-25 is *referenced* here for campaign/notification/locale
> content delivery; its primary i18n-transport materialization (FR-4) lives in
> [EPIC-1](EPIC-1.md). The onboarding and bundled-i18n stories (US-19.1, US-19.2,
> US-19.3) introduce no new AD — they are local UX/content layers and i18n is
> governed by [NFR-13](../../PRD.md#non-functional-requirements).

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-19.1](../stories/US-19.1-wallet-create-restore-onboarding-wrapper.md) | Wallet create/restore onboarding wrapper (backup reminder, T&C) | First-run UX wrapper around create/restore: backup reminder + terms acceptance gates | ✅ done | 1.1.68 |
| [US-19.2](../stories/US-19.2-multi-language-i18n-round-1.md) | Multi-language i18n (VI/ZH/JA/RU) | Bundled Round-1 localization with a language picker, English-canonical | ✅ done | 1.1.11 |
| [US-19.3](../stories/US-19.3-additional-ui-languages.md) | Additional UI languages (DE/FR/…) | Extend the bundled-locale set to more languages (forward) | 📋 backlog | — |
| [US-19.4](../stories/US-19.4-in-app-campaign-banners.md) | In-app campaign banners | Remotely configured marketing banners shown in-app | ✅ done | 1.1.18 |
| [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md) | Airdrop / quest mission display | Show airdrop and quest missions with progress and claim entry | ✅ done | 1.1.46 |
| [US-19.6](../stories/US-19.6-nft-mint-campaigns.md) | NFT mint campaigns | Display and enter NFT-mint campaigns from in-app surfaces | 📋 backlog | — |
| [US-19.7](../stories/US-19.7-mission-pools-reward-program.md) | Mission Pools reward program | The Mission Pools reward-program surface (eligibility, rewards, entry) | ✅ done | 1.1.46 |
| [US-19.8](../stories/US-19.8-in-app-notification-center.md) | In-app notification center | One feed for transaction status, campaign alerts and system messages | ✅ done | 1.3.4 |

> US-19.1, US-19.2, US-19.4..19.8 are **retroactive** (the capability already ships);
> US-19.3 is **forward** (📋 planned, FR-154). Each story materializes exactly one FR.

## Object map & user-story interactions

### US ↔ entity / subsystem matrix

| US | Primary entity / subsystem | FR / NFR |
|---|---|---|
| [US-19.1](../stories/US-19.1-wallet-create-restore-onboarding-wrapper.md) | First-run onboarding wrapper (backup-reminder + T&C gates) over EPIC-3 create/restore; settings-state acceptance/reminder flags | FR-152 |
| [US-19.2](../stories/US-19.2-multi-language-i18n-round-1.md) | `i18n` loader + bundled `locales/{lng}/translation.json` (VI/ZH/JA/RU) + language picker | FR-153 |
| [US-19.3](../stories/US-19.3-additional-ui-languages.md) | Additional bundled `locales/{lng}/translation.json` (DE/FR/…) on the US-19.2 loader | FR-154 |
| [US-19.4](../stories/US-19.4-in-app-campaign-banners.md) | `MktCampaignService` app-banners (`fetchStaticData('app-banners')` → `appBannerSubject`) | FR-155 |
| [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md) | Services-SDK mission feed (`subwalletApiSdk`) → `MissionInfo` display + earning deep-link | FR-156 |
| [US-19.6](../stories/US-19.6-nft-mint-campaigns.md) | `MintCampaignService` (`unlockDotCampaign`) + `fetchStaticData` mint-campaign config | FR-157 |
| [US-19.7](../stories/US-19.7-mission-pools-reward-program.md) | `MissionPool` reward-program surface (Services SDK → `MissionInfo`, eligibility + join deep-link) | FR-158 |
| [US-19.8](../stories/US-19.8-in-app-notification-center.md) | `InappNotificationService` feed (DB + read/unread) + `CampaignService` notification campaigns + `NotificationService` OS notify | FR-159 |

> Cell notation — `FR-N` / `FR-N (defends)` / `NFR-N` / `— (AD-N)` / `—`: [AGENTS.md §7 rule 8](../../../AGENTS.md).

### End-to-end happy path

Canonical remotely-driven-content flow: a campaign banner is fetched from the static-data / cache-proxy backend, stored in a service subject, and surfaced in-app — with the bundled `staticData` fallback when the fetch fails.

```mermaid
sequenceDiagram
  actor U as User
  participant UI as UI (AppOnlineContentProvider / banner slot)
  participant MKT as MktCampaignService (background)
  participant FSD as fetchStaticData
  participant Cache as static-data.subwallet.app (cache-proxy, AD-23/AD-25)

  MKT->>FSD: fetchBannerData()  (init / fetchMktCampaignData)
  FSD->>Cache: GET /app-banners/{list|preview}.json
  Cache-->>FSD: remote banner config
  Note over FSD: on failure → bundled staticData['app-banners'] fallback
  FSD-->>MKT: AppBannerData[]
  MKT->>MKT: handleMktCampaignData (active-window + platform + conditions)
  MKT->>UI: appBannerSubject.next(filtered)
  U->>UI: open surface hosting the banner slot
  UI-->>U: banner rendered (image/copy/CTA); tap CTA → configured deep-link
```

**Branches not shown:** airdrop/quest missions (US-19.5) and Mission Pools (US-19.7) fetch through the Services SDK aggregation (`subwalletApiSdk`, AD-24) into `MissionInfo` rather than `fetchStaticData`, and deep-link a `join`/`claim` into the EPIC-12 EarningService instead of routing a banner CTA; NFT-mint campaigns (US-19.6) ride the same `fetchStaticData` substrate via `MintCampaignService` (`unlockDotCampaign`) and hand off to the existing mint/transaction flow; the notification center (US-19.8) is a *fan-in* of the `InappNotificationService` DB feed, `CampaignService` `NOTIFICATION`-type campaigns and AD-25 system messages — not a single content fetch — with OS delivery via `NotificationService`. The onboarding wrapper (US-19.1) and bundled i18n (US-19.2/19.3) do **not** ride the content-delivery flow at all: onboarding only gates EPIC-3's create/restore with settings-state flags, and i18n loads from in-package `locales/{lng}/translation.json` with English fallback.

## Cross-cutting invariants

- **English-canonical, bundled-locale i18n ([NFR-13](../../PRD.md#non-functional-requirements), [FR-153](../../PRD.md#functional-requirements)):** every user-facing string is authored in English first; translations are bundled per locale in the extension package and loaded from `locales/{lng}/translation.json`. No story may ship a locale-only string with no English source, and a missing translation key MUST fall back to English rather than render the raw key. Enforced by [US-19.2](../stories/US-19.2-multi-language-i18n-round-1.md), extended by [US-19.3](../stories/US-19.3-additional-ui-languages.md).
- **Remote content is release-free and degrades gracefully (AD-23, AD-24, AD-25):** campaign banners, quests, mission pools and the notification feed are remotely configured and fetched through the Services SDK / cache-proxy substrate; a content fetch that fails MUST degrade to "no campaign / empty feed" without breaking the host screen — never a blank or crashed page. Enforced by [US-19.4](../stories/US-19.4-in-app-campaign-banners.md), [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md), [US-19.8](../stories/US-19.8-in-app-notification-center.md).
- **Onboarding wraps, it does not generate keys (FR-152):** the first-run flow only adds the backup-reminder and T&C *gates* around EPIC-3's create/restore; no key material, mnemonic, or derivation logic lives in EPIC-19 (AD-04 — keyring confined to background). Enforced by [US-19.1](../stories/US-19.1-wallet-create-restore-onboarding-wrapper.md).
- **Campaigns link out, they do not re-implement (FR-156, FR-158):** a quest or Mission Pools entry that targets earning/staking deep-links into the EPIC-12 EarningService surface and never re-implements stake/unstake; campaign claims that move funds route through the existing transaction flows. Enforced by [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md), [US-19.7](../stories/US-19.7-mission-pools-reward-program.md).

## Cross-story testing requirements

| Pattern | Stories that apply | Shared infra |
|---|---|---|
| **i18n fallback harness** | [US-19.2](../stories/US-19.2-multi-language-i18n-round-1.md), [US-19.3](../stories/US-19.3-additional-ui-languages.md) | A test that loads each `locales/{lng}/translation.json`, asserts key-parity against the English source, and asserts a missing key falls back to English (never renders the raw key) |
| **Remote-content mock** | [US-19.4](../stories/US-19.4-in-app-campaign-banners.md), [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md), [US-19.6](../stories/US-19.6-nft-mint-campaigns.md), [US-19.7](../stories/US-19.7-mission-pools-reward-program.md) | A stub Services-SDK / cache-proxy campaign endpoint (populated config + empty + failure mode) the campaign stories share so each can assert graceful degradation |
| **Notification-feed fixture** | [US-19.8](../stories/US-19.8-in-app-notification-center.md) | A mock notification stream (transaction-status, campaign-alert, system-message kinds + permission-denied path) the notification center renders against |

> The first campaign story (US-19.4) sets up the remote-content mock; US-19.5/19.6/19.7
> import it rather than rebuilding. US-19.2 sets up the i18n fallback harness; US-19.3
> extends it with the additional locales.

## Performance budgets & invariants

| Concern | Budget | Story | Rationale |
|---|---|---|---|
| **Remote content never blocks app start** | Campaign/banner fetches run async off service `init()` (`MktCampaignService.fetchMktCampaignData` is delayed; `CampaignService.fetchCampaign` is fire-and-forget `.catch`-guarded) — the wallet renders before any campaign resolves | [US-19.4](../stories/US-19.4-in-app-campaign-banners.md), [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md) | Growth content is connective tissue, not the money path; a slow/absent backend must never delay first paint (AD-23, AD-24, AD-25) |
| **Cached / bundled fallback on fetch failure** | `fetchStaticData(slug)` resolves to bundled `staticData[slug]` when `static-data.subwallet.app` is unreachable; an empty/failed config renders no banner / empty feed, never a blank or crashed host screen | [US-19.4](../stories/US-19.4-in-app-campaign-banners.md), [US-19.6](../stories/US-19.6-nft-mint-campaigns.md), [US-19.8](../stories/US-19.8-in-app-notification-center.md) | Remote content is release-free but must degrade gracefully — a content outage degrades to "no campaign / available kinds only", per-source (AD-23, AD-25) |
| **i18n: bundled, English-canonical, no raw keys** | Locales load from in-package `locales/{lng}/translation.json` (no network on the render path); a missing key falls back to the English value, never the raw key or an empty render | [US-19.2](../stories/US-19.2-multi-language-i18n-round-1.md), [US-19.3](../stories/US-19.3-additional-ui-languages.md) | Localization must be instant and complete offline; the online hot-update *transport* (FR-4) is EPIC-1's, layered over this bundled baseline (NFR-13) |

## Acceptance criteria (propagated from stories)

- [ ] First-run onboarding wraps create/restore with a backup-reminder gate and a terms-of-service acceptance the user must complete before reaching the wallet — [US-19.1](../stories/US-19.1-wallet-create-restore-onboarding-wrapper.md)
- [ ] The UI is available in Vietnamese, Chinese, Japanese and Russian from bundled locale files, with a missing key falling back to English — [US-19.2](../stories/US-19.2-multi-language-i18n-round-1.md)
- [ ] The bundled-locale set extends to additional languages (DE/FR/…) — [US-19.3](../stories/US-19.3-additional-ui-languages.md) (planned)
- [ ] In-app marketing banners are shown from remote config and degrade to no-banner when the fetch fails — [US-19.4](../stories/US-19.4-in-app-campaign-banners.md)
- [ ] Airdrop and quest missions are listed with progress and a claim/enter entry point — [US-19.5](../stories/US-19.5-airdrop-quest-mission-display.md)
- [ ] NFT-mint campaigns are displayed and enterable from in-app surfaces — [US-19.6](../stories/US-19.6-nft-mint-campaigns.md)
- [ ] The Mission Pools reward program shows eligibility, rewards and an entry point, deep-linking earning to EPIC-12 — [US-19.7](../stories/US-19.7-mission-pools-reward-program.md)
- [ ] One notification center surfaces transaction status, campaign alerts and system messages, handling the permission-denied path gracefully — [US-19.8](../stories/US-19.8-in-app-notification-center.md)
