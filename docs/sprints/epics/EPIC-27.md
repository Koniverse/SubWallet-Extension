---
id: EPIC-27
title: "Maintenance — Portfolio & Balances"
status: done
prd_ref: []
created: 2026-07-15
updated: 2026-07-15
generated_by: koni-docs-gen-maintenance
---

## Goal

Incremental work, fixes and chores for the **Portfolio & Balances** area ([EPIC-7](EPIC-7.md)) that materialize no FR of their own. One story per tracker issue, so the CHANGELOG and issue tracker are fully claimed
and the ERP can answer "who shipped what, under which issue" for this area. This epic is a
**ledger, not a plan** — it was generated from the tracker and CHANGELOG by a one-off local
generator (kept in the setup scratchpad, not the repo: it wipes and rebuilds every `generated_by`
file from six `/tmp` caches, so re-running it without those caches would destroy this provenance).

## Why separate from EPIC-7

The 21 product epics are the **FR map**: each story there is a requirement's contract. These
issues materialize no FR — they are fixes, chore bumps, and small increments. Keeping them here
leaves [EPIC-7](EPIC-7.md) readable as the requirement set, while
still giving every shipped issue exactly one owning story ([CONTEXT D107](../../CONTEXT.md) on
keeping the unit of status honest).

## What a story here is — and is not

- **It records the tracker, not the code.** Its acceptance criterion is a *coverage* assertion
  ("issue #N shipped in vX" / "closed on the tracker"), never an invented Given/When/Then — that
  is the [US-5.1](../stories/US-5.1-phishing-site-and-address-protection.md) failure this program
  exists to prevent ([LESSONS §68](../../LESSONS.md)).
- **`points: 1` is a count, not a Fibonacci estimate.** One story = one shipped issue. **Never
  sum these with the product stories' points** — a rollup here measures issue throughput.
- **`sprint` is a real month** (a single issue closed in one month), not a rollup ([D105](../../CONTEXT.md)).

## Scope

**54 stories** — 48 done (shipped), 0 in flight (ready / in-progress /
review, from the Projects board), 0 backlog (open, not yet started), 6 deprecated
(closed **not-planned / duplicate** — never shipped). Open-issue status mirrors the GitHub
Projects board (#2); closed-issue status comes from the tracker's close reason. Per-issue
detail is the [CHANGELOG coverage index](../../notes/changelog-coverage.md) and each frontmatter.

## Stories

Every story in this ledger, in issue order — click a US to open its tracker link, evidence and
verification. **Assignee** is who the tracker or the `[Issue-N]` PR/commit names (`—` where nobody
is recorded); **Shipped** is the `(Koni)` release, `—` when no CHANGELOG line proves one.

| US | Status | Title | Issue | Assignee | Shipped |
|---|---|---|---|---|---|
| [US-27.1](../stories/US-27.1-chrome-extension-wallet-not-showing-correct-balance-of.md) | ✅ done | Chrome extension wallet not showing correct balance of my crust mainnet address. | [#3](https://github.com/Koniverse/SubWallet-Extension/issues/3) | Quangdm-cdm | — |
| [US-27.2](../stories/US-27.2-the-screen-is-loading-when-click-on-show-hide-balance.md) | ✅ done | The screen is loading when click on Show/Hide balance | [#212](https://github.com/Koniverse/SubWallet-Extension/issues/212) | Quangdm-cdm | 0.4.1 |
| [US-27.3](../stories/US-27.3-wrong-balance-display-due-to-data-caching.md) | ✅ done | Wrong balance display due to data caching | [#481](https://github.com/Koniverse/SubWallet-Extension/issues/481) | huukhai | — |
| [US-27.4](../stories/US-27.4-fix-bug-showing-balance-on-very-small-balance.md) | ✅ done | Fix bug showing balance on very small balance | [#556](https://github.com/Koniverse/SubWallet-Extension/issues/556) | nulllpc | 0.5.6 |
| [US-27.5](../stories/US-27.5-update-price-for-kbtc.md) | ✅ done | Update price for KBTC | [#785](https://github.com/Koniverse/SubWallet-Extension/issues/785) | nulllpc | 0.6.9 |
| [US-27.6](../stories/US-27.6-update-balance-logic-for-equilibrium.md) | ✅ done | Update balance logic for Equilibrium | [#902](https://github.com/Koniverse/SubWallet-Extension/issues/902) | Quangdm-cdm | 0.7.7 |
| [US-27.7](../stories/US-27.7-update-get-balance-function-for-kusama.md) | ✅ done | Update get balance function for Kusama | [#916](https://github.com/Koniverse/SubWallet-Extension/issues/916) | nulllpc | 0.7.5 |
| [US-27.8](../stories/US-27.8-update-price-for-ibtc.md) | ✅ done | Update price for iBTC | [#921](https://github.com/Koniverse/SubWallet-Extension/issues/921) | Quangdm-cdm | 0.7.5 |
| [US-27.9](../stories/US-27.9-update-equilibrium-balance-structure.md) | ✅ done | Update Equilibrium balance structure | [#975](https://github.com/Koniverse/SubWallet-Extension/issues/975) | nulllpc | 0.7.8 |
| [US-27.10](../stories/US-27.10-fix-bug-getting-multiple-balances-for-equilibrium.md) | ✅ done | Fix bug getting multiple balances for Equilibrium | [#981](https://github.com/Koniverse/SubWallet-Extension/issues/981) | nulllpc | 0.7.9 |
| [US-27.11](../stories/US-27.11-upgrade-ui-re-check-the-increase-decrease-of-the-total.md) | ✅ done | Upgrade UI - Re-check the % increase/ decrease of the Total balance | [#1166](https://github.com/Koniverse/SubWallet-Extension/issues/1166) | saltict | — |
| [US-27.12](../stories/US-27.12-add-validate-in-case-the-recipient-does-not-enough-bala.md) | ✅ done | Add validate in case the recipient does not enough balance to keep alive | [#1167](https://github.com/Koniverse/SubWallet-Extension/issues/1167) | S2kael | — |
| [US-27.13](../stories/US-27.13-fixed-bug-get-balance.md) | ✅ done | Fixed bug get balance | [#1360](https://github.com/Koniverse/SubWallet-Extension/issues/1360) | S2kael | 1.0.5 |
| [US-27.14](../stories/US-27.14-fix-bug-get-balance-when-send-token.md) | ✅ done | Fix bug get balance when send token | [#1428](https://github.com/Koniverse/SubWallet-Extension/issues/1428) | S2kael | 1.0.6 |
| [US-27.15](../stories/US-27.15-re-check-case-get-balance-error.md) | ✅ done | Re-check case 'Get balance error' | [#1459](https://github.com/Koniverse/SubWallet-Extension/issues/1459) | saltict | 1.0.11 |
| [US-27.16](../stories/US-27.16-support-show-hide-balance.md) | ✅ done | Support show/hide balance | [#1582](https://github.com/Koniverse/SubWallet-Extension/issues/1582) | S2kael | 1.1.3 |
| [US-27.17](../stories/US-27.17-fixed-bug-still-send-local-token-in-case-the-native-tok.md) | ✅ done | Fixed bug still send local token in case the native token balance = 0 | [#1667](https://github.com/Koniverse/SubWallet-Extension/issues/1667) | S2kael | 1.1.5 |
| [US-27.18](../stories/US-27.18-webapp-update-usebalance-for-compute-some-common-factor.md) | ✅ done | WebApp - Update useBalance for compute some common factor of balances | [#1679](https://github.com/Koniverse/SubWallet-Extension/issues/1679) | lw-cdm | 1.1.36 |
| [US-27.19](../stories/US-27.19-webapp-still-show-balance-when-user-select-hide-balance.md) | ✅ done | WebApp - Still show balance when user select hide balance | [#1690](https://github.com/Koniverse/SubWallet-Extension/issues/1690) | lw-cdm | 1.1.36 |
| [US-27.20](../stories/US-27.20-webapp-wrong-portfolio-balance-ui.md) | ✅ done | WebApp - Wrong portfolio balance UI | [#1802](https://github.com/Koniverse/SubWallet-Extension/issues/1802) | lw-cdm | 1.1.36 |
| [US-27.21](../stories/US-27.21-webapp-implement-portfolio-statistic.md) | ✅ done | WebApp - Implement Portfolio Statistic | [#1843](https://github.com/Koniverse/SubWallet-Extension/issues/1843) | lw-cdm | 1.1.36 |
| [US-27.22](../stories/US-27.22-add-refresh-button-for-balance-screen.md) | ⏸️ deprecated | Add refresh button for balance screen | [#2194](https://github.com/Koniverse/SubWallet-Extension/issues/2194) | saltict | — |
| [US-27.23](../stories/US-27.23-re-check-balance-after-withdrawing-successfully.md) | ⏸️ deprecated | Re-check balance after withdrawing successfully | [#2367](https://github.com/Koniverse/SubWallet-Extension/issues/2367) | ThaoNguyen998 | — |
| [US-27.24](../stories/US-27.24-add-reload-balance-feature.md) | ✅ done | Add reload balance feature | [#2381](https://github.com/Koniverse/SubWallet-Extension/issues/2381) | saltict | 1.1.29 |
| [US-27.25](../stories/US-27.25-fixed-enforcing-the-minimum-miner-tip-1-wei.md) | ✅ done | Fixed enforcing the minimum miner tip 1 wei | [#2393](https://github.com/Koniverse/SubWallet-Extension/issues/2393) | Thiendekaco | 1.3.30 |
| [US-27.26](../stories/US-27.26-update-balance-service.md) | ✅ done | Update balance service | [#2416](https://github.com/Koniverse/SubWallet-Extension/issues/2416) | S2kael | 1.1.52 |
| [US-27.27](../stories/US-27.27-balance-psp-convert-free-type-from-number-to-string.md) | ✅ done | [Balance] [PSP] Convert free type from number to string | [#2418](https://github.com/Koniverse/SubWallet-Extension/issues/2418) | bluezdot | 1.1.65 |
| [US-27.28](../stories/US-27.28-enable-price-id-online.md) | ✅ done | Enable price-id online | [#2664](https://github.com/Koniverse/SubWallet-Extension/issues/2664) | bluezdot | 1.1.41 |
| [US-27.29](../stories/US-27.29-auto-detect-balance.md) | ✅ done | Auto detect balance | [#2732](https://github.com/Koniverse/SubWallet-Extension/issues/2732) | S2kael | 1.1.51 |
| [US-27.30](../stories/US-27.30-update-priceid-and-block-explorer-for-polimec.md) | ✅ done | Update priceId and block explorer for Polimec | [#2772](https://github.com/Koniverse/SubWallet-Extension/issues/2772) | bluezdot | 1.1.45 |
| [US-27.31](../stories/US-27.31-support-auto-detect-balance-for-evm.md) | ✅ done | Support auto detect balance for EVM | [#2836](https://github.com/Koniverse/SubWallet-Extension/issues/2836) | S2kael | 1.3.29 |
| [US-27.32](../stories/US-27.32-do-not-detect-balance-after-reset-wallet.md) | ⏸️ deprecated | Do not detect balance after reset wallet | [#2880](https://github.com/Koniverse/SubWallet-Extension/issues/2880) | PDTnhah | — |
| [US-27.33](../stories/US-27.33-update-fallback-api-for-subwallet-api-price-exchange-ra.md) | ✅ done | Update fallback API for SubWallet API (Price, Exchange rate) | [#3183](https://github.com/Koniverse/SubWallet-Extension/issues/3183) | Thiendekaco | 1.2.15 |
| [US-27.34](../stories/US-27.34-webapp-show-incorrect-available-balance.md) | ✅ done | WebApp - Show incorrect Available balance | [#3189](https://github.com/Koniverse/SubWallet-Extension/issues/3189) | frenkie-ng | 1.2.14 |
| [US-27.35](../stories/US-27.35-fix-bug-calculating-balance-for-relaychain.md) | ✅ done | Fix bug calculating balance for relaychain | [#3312](https://github.com/Koniverse/SubWallet-Extension/issues/3312) | nulllpc | 1.2.15 |
| [US-27.36](../stories/US-27.36-fix-balance-calculation-formula.md) | ✅ done | Fix balance calculation formula | [#3440](https://github.com/Koniverse/SubWallet-Extension/issues/3440) | nulllpc | 1.2.24 |
| [US-27.37](../stories/US-27.37-update-balance-calculation-for-deepbrainchain.md) | ✅ done | Update balance calculation for DeepBrainChain | [#3481](https://github.com/Koniverse/SubWallet-Extension/issues/3481) | bluezdot | 1.2.27 |
| [US-27.38](../stories/US-27.38-move-auto-detect-balance-to-backend.md) | ⏸️ deprecated | Move auto-detect balance to backend | [#3954](https://github.com/Koniverse/SubWallet-Extension/issues/3954) | saltict | — |
| [US-27.39](../stories/US-27.39-update-api-to-detect-user-s-balance.md) | ⏸️ deprecated | Update API to detect user's balance | [#3991](https://github.com/Koniverse/SubWallet-Extension/issues/3991) | — | — |
| [US-27.40](../stories/US-27.40-unable-to-load-tao-balance.md) | ✅ done | Unable to load TAO balance | [#4032](https://github.com/Koniverse/SubWallet-Extension/issues/4032) | tunghp2002 | 1.3.17 |
| [US-27.41](../stories/US-27.41-support-price-chart.md) | ✅ done | Support price chart | [#4122](https://github.com/Koniverse/SubWallet-Extension/issues/4122), [#4266](https://github.com/Koniverse/SubWallet-Extension/issues/4266) | lw-cdm | 1.3.33 |
| [US-27.42](../stories/US-27.42-update-logic-fetching-bitcoin-balance.md) | ⏸️ deprecated | Update logic fetching Bitcoin balance | [#4161](https://github.com/Koniverse/SubWallet-Extension/issues/4161) | — | — |
| [US-27.43](../stories/US-27.43-update-logic-fetching-bitcoin-balance.md) | ✅ done | Update logic fetching Bitcoin balance | [#4162](https://github.com/Koniverse/SubWallet-Extension/issues/4162) | S2kael | 1.3.42 |
| [US-27.44](../stories/US-27.44-price-portfolio-chart.md) | ✅ done | Price & Portfolio Chart | [#4186](https://github.com/Koniverse/SubWallet-Extension/issues/4186) | — | — |
| [US-27.45](../stories/US-27.45-extension-handle-fallback-for-price-chart.md) | ✅ done | Extension - Handle fallback for price chart | [#4318](https://github.com/Koniverse/SubWallet-Extension/issues/4318) | lw-cdm | — |
| [US-27.46](../stories/US-27.46-support-the-price-chart-ui-on-the-web-app.md) | ✅ done | Support the price chart UI on the web app | [#4380](https://github.com/Koniverse/SubWallet-Extension/issues/4380) | lw-cdm | — |
| [US-27.47](../stories/US-27.47-extension-don-t-show-balance-for-ton-testnet.md) | ✅ done | Extension - Don't show balance for TON testnet | [#4455](https://github.com/Koniverse/SubWallet-Extension/issues/4455) | PDTnhah | — |
| [US-27.48](../stories/US-27.48-fixed-bug-incorrect-price-history-chart-display-when-ch.md) | ✅ done | Fixed bug Incorrect price history chart display when changing currency in popup mode | [#4586](https://github.com/Koniverse/SubWallet-Extension/issues/4586) | Thiendekaco | 1.3.55 |
| [US-27.49](../stories/US-27.49-update-api-for-bitcoin-testnet-balance-display.md) | ✅ done | Update API for Bitcoin Testnet balance display | [#4619](https://github.com/Koniverse/SubWallet-Extension/issues/4619) | frenkie-ng | — |
| [US-27.50](../stories/US-27.50-locked-balance-display.md) | ✅ done | Locked Balance Display | [#4708](https://github.com/Koniverse/SubWallet-Extension/issues/4708) | tunghp2002 | 1.3.68 |
| [US-27.51](../stories/US-27.51-research-locked-balance-display.md) | ✅ done | Research locked balance display | [#4718](https://github.com/Koniverse/SubWallet-Extension/issues/4718) | tunghp2002 | — |
| [US-27.52](../stories/US-27.52-standardize-the-module-price-history-according-to-the-n.md) | ✅ done | Standardize the Module Price History according to the new standard | [#4784](https://github.com/Koniverse/SubWallet-Extension/issues/4784) | Thiendekaco | 1.3.68 |
| [US-27.53](../stories/US-27.53-price-history-api-returns-empty-data-on-production-but.md) | ✅ done | Price history API returns empty data on Production but works on Dev environment | [#4977](https://github.com/Koniverse/SubWallet-Extension/issues/4977) | tunghp2002 | — |
| [US-27.54](../stories/US-27.54-alpha-price-calculation-mismatch-vs-taostats.md) | ✅ done | Alpha price calculation mismatch vs TaoStats | [#4987](https://github.com/Koniverse/SubWallet-Extension/issues/4987) | tunghp2002 | 1.3.79 |

## Acceptance criteria

- [x] **AC-1** — Every Portfolio & Balances issue with no FR story has exactly one story here; its status matches the tracker (done = COMPLETED, backlog = open, deprecated = not-planned/duplicate).
- [x] **AC-2** — `npx koni-docs validate` and `node scripts/koni-docs-check-ids.mjs` exit 0.
