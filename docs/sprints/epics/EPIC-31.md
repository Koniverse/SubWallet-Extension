---
id: EPIC-31
title: "Maintenance — Swap"
status: in-progress
prd_ref: []
created: 2026-07-15
updated: 2026-07-15
generated_by: koni-docs-gen-maintenance
---

## Goal

Incremental work, fixes and chores for the **Swap** area ([EPIC-11](EPIC-11.md)) that materialize no FR of their own. One story per tracker issue, so the CHANGELOG and issue tracker are fully claimed
and the ERP can answer "who shipped what, under which issue" for this area. This epic is a
**ledger, not a plan** — it was generated from the tracker and CHANGELOG by a one-off local
generator (kept in the setup scratchpad, not the repo: it wipes and rebuilds every `generated_by`
file from six `/tmp` caches, so re-running it without those caches would destroy this provenance).

## Why separate from EPIC-11

The 21 product epics are the **FR map**: each story there is a requirement's contract. These
issues materialize no FR — they are fixes, chore bumps, and small increments. Keeping them here
leaves [EPIC-11](EPIC-11.md) readable as the requirement set, while
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

**109 stories** — 78 done (shipped), 9 in flight (ready / in-progress /
review, from the Projects board), 11 backlog (open, not yet started), 11 deprecated
(closed **not-planned / duplicate** — never shipped). Open-issue status mirrors the GitHub
Projects board (#2); closed-issue status comes from the tracker's close reason. Per-issue
detail is the [CHANGELOG coverage index](../../notes/changelog-coverage.md) and each frontmatter.

## Stories

Every story in this ledger, in issue order — click a US to open its tracker link, evidence and
verification. **Assignee** is who the tracker or the `[Issue-N]` PR/commit names (`—` where nobody
is recorded); **Shipped** is the `(Koni)` release, `—` when no CHANGELOG line proves one.

| US | Status | Title | Issue | Assignee | Shipped |
|---|---|---|---|---|---|
| [US-31.1](../stories/US-31.1-integrate-zenlink-for-swap-assets.md) | ⏸️ deprecated | Integrate Zenlink for Swap Assets | [#38](https://github.com/Koniverse/SubWallet-Extension/issues/38) | tunghp2002 | — |
| [US-31.2](../stories/US-31.2-integrate-acala-for-swap-assets.md) | ⏸️ deprecated | Integrate Acala for Swap Assets | [#39](https://github.com/Koniverse/SubWallet-Extension/issues/39) | — | — |
| [US-31.3](../stories/US-31.3-integrate-parallel-finance-for-swap-assets.md) | ⏸️ deprecated | Integrate Parallel Finance for Swap Assets | [#40](https://github.com/Koniverse/SubWallet-Extension/issues/40) | — | — |
| [US-31.4](../stories/US-31.4-integrate-subwallet-into-arthswap-wasm-dex-apolloswap.md) | ✅ done | Integrate SubWallet into ArthSwap WASM DEX (ApolloSwap) | [#961](https://github.com/Koniverse/SubWallet-Extension/issues/961) | nulllpc | — |
| [US-31.5](../stories/US-31.5-update-ui-for-the-approve-token-popup-when-swap-on-the.md) | ⏸️ deprecated | Update UI for the approve token popup when swap on the dApp | [#996](https://github.com/Koniverse/SubWallet-Extension/issues/996) | Sokol142196 | — |
| [US-31.6](../stories/US-31.6-integrate-axelar-for-swap-assets-feature.md) | 📋 backlog | Integrate Axelar for swap assets feature | [#1521](https://github.com/Koniverse/SubWallet-Extension/issues/1521) | nulllpc | — |
| [US-31.7](../stories/US-31.7-research-and-integrate-flexible-gas-fees-in-any-asset-v.md) | 📋 backlog | Research and integrate flexible gas fees in any asset via DEX Pallet | [#1951](https://github.com/Koniverse/SubWallet-Extension/issues/1951) | nulllpc | — |
| [US-31.8](../stories/US-31.8-research-chainflip-swapping-feature.md) | ✅ done | Research Chainflip swapping  feature | [#2310](https://github.com/Koniverse/SubWallet-Extension/issues/2310) | nulllpc | 1.1.55 |
| [US-31.9](../stories/US-31.9-research-swap-pallet-on-asset-hub.md) | ✅ done | Research swap pallet on asset hub | [#2512](https://github.com/Koniverse/SubWallet-Extension/issues/2512) | S2kael | 1.2.14 |
| [US-31.10](../stories/US-31.10-integrate-swap-feature-for-chainflip.md) | ✅ done | Integrate swap feature for Chainflip | [#2535](https://github.com/Koniverse/SubWallet-Extension/issues/2535) | nulllpc | 1.1.55 |
| [US-31.11](../stories/US-31.11-bug-can-t-start-uniswap-with-subwallet.md) | ✅ done | Bug can't start uniswap with SubWallet | [#2588](https://github.com/Koniverse/SubWallet-Extension/issues/2588) | saltict | 1.1.37 |
| [US-31.12](../stories/US-31.12-build-ui-for-swap-feature.md) | ✅ done | Build UI for swap feature | [#2646](https://github.com/Koniverse/SubWallet-Extension/issues/2646) | frenkie-ng | 1.1.55 |
| [US-31.13](../stories/US-31.13-integrate-hydradx-swap-sdk.md) | ✅ done | Integrate HydraDX swap SDK | [#2758](https://github.com/Koniverse/SubWallet-Extension/issues/2758) | nulllpc | 1.1.55 |
| [US-31.14](../stories/US-31.14-webapp-bug-related-to-swap-feature.md) | ✅ done | WebApp - Bug related to Swap feature | [#2780](https://github.com/Koniverse/SubWallet-Extension/issues/2780) | frenkie-ng | — |
| [US-31.15](../stories/US-31.15-add-swap-button.md) | ✅ done | Add Swap button | [#2784](https://github.com/Koniverse/SubWallet-Extension/issues/2784) | frenkie-ng | 1.1.50 |
| [US-31.16](../stories/US-31.16-implement-swap-feature-for-extension.md) | ✅ done | Implement Swap feature for extension | [#2823](https://github.com/Koniverse/SubWallet-Extension/issues/2823) | frenkie-ng | 1.1.55 |
| [US-31.17](../stories/US-31.17-webapp-do-not-navigate-to-swap-screen-in-case-connect-w.md) | ⏸️ deprecated | WebApp - Do not navigate to Swap screen in case connect WebApp with Extension | [#2825](https://github.com/Koniverse/SubWallet-Extension/issues/2825) | — | — |
| [US-31.18](../stories/US-31.18-optimize-swap-pair-selection.md) | ✅ done | Optimize swap pair selection | [#2902](https://github.com/Koniverse/SubWallet-Extension/issues/2902) | nulllpc | — |
| [US-31.19](../stories/US-31.19-webapp-show-incorrect-recipient-on-swap-confirmation-sc.md) | ✅ done | WebApp - Show incorrect recipient on Swap confirmation screen | [#2912](https://github.com/Koniverse/SubWallet-Extension/issues/2912) | frenkie-ng | 1.1.57 |
| [US-31.20](../stories/US-31.20-extension-improve-swap-feature-on-extension.md) | ⏸️ deprecated | Extension - Improve Swap feature on extension | [#2918](https://github.com/Koniverse/SubWallet-Extension/issues/2918) | — | — |
| [US-31.21](../stories/US-31.21-extension-do-not-get-swap-quote.md) | ✅ done | Extension - Do not get Swap quote | [#2925](https://github.com/Koniverse/SubWallet-Extension/issues/2925) | nulllpc | — |
| [US-31.22](../stories/US-31.22-extension-mv3-unable-to-get-quote-when-perform-swap.md) | ⏸️ deprecated | Extension MV3 - Unable to get quote when perform swap | [#2992](https://github.com/Koniverse/SubWallet-Extension/issues/2992) | Thiendekaco | — |
| [US-31.23](../stories/US-31.23-fixed-bug-can-t-hit-the-confirm-button-on-tos-of-the-sw.md) | ✅ done | Fixed bug Can't hit the 'Confirm' button on ToS of the Swap feature | [#3007](https://github.com/Koniverse/SubWallet-Extension/issues/3007) | frenkie-ng | 1.1.62 |
| [US-31.24](../stories/US-31.24-improve-swap-quote-fetching-speed.md) | ✅ done | Improve swap quote fetching speed | [#3104](https://github.com/Koniverse/SubWallet-Extension/issues/3104) | nulllpc | 1.2.3 |
| [US-31.25](../stories/US-31.25-extension-show-incorrect-fee-when-swap.md) | 🟢 ready | Extension - Show incorrect fee when swap | [#3160](https://github.com/Koniverse/SubWallet-Extension/issues/3160) | tunghp2002 | — |
| [US-31.26](../stories/US-31.26-webapp-update-some-message-related-to-earning-and-swap.md) | ✅ done | WebApp - Update some message related to earning and swap feature | [#3187](https://github.com/Koniverse/SubWallet-Extension/issues/3187) | frenkie-ng | 1.2.14 |
| [US-31.27](../stories/US-31.27-webapp-update-logo-for-hydration-provider-on-the-swap-s.md) | ✅ done | WebApp - Update logo for Hydration provider on the Swap screen | [#3192](https://github.com/Koniverse/SubWallet-Extension/issues/3192) | frenkie-ng | 1.2.26 |
| [US-31.28](../stories/US-31.28-research-uniswap-price-impact.md) | ✅ done | Research Uniswap price impact | [#3269](https://github.com/Koniverse/SubWallet-Extension/issues/3269) | bluezdot | 1.2.14 |
| [US-31.29](../stories/US-31.29-add-support-swap-asset-hub.md) | ✅ done | Add support Swap Asset Hub | [#3272](https://github.com/Koniverse/SubWallet-Extension/issues/3272) | frenkie-ng | 1.2.14 |
| [US-31.30](../stories/US-31.30-update-chainflip-version.md) | ✅ done | Update ChainFlip version | [#3274](https://github.com/Koniverse/SubWallet-Extension/issues/3274) | saltict | — |
| [US-31.31](../stories/US-31.31-support-xcm-channels.md) | ✅ done | Support XCM channels | [#3453](https://github.com/Koniverse/SubWallet-Extension/issues/3453) | bluezdot | 1.2.29 |
| [US-31.32](../stories/US-31.32-webapp-improve-ui-for-selecting-token-to-pay-transactio.md) | ⏸️ deprecated | WebApp - Improve UI for selecting token to pay transaction fee on Hydration | [#3465](https://github.com/Koniverse/SubWallet-Extension/issues/3465) | — | — |
| [US-31.33](../stories/US-31.33-research-usdt-usdc-swap-volume-on-hydration-stellaswap.md) | ✅ done | Research USDT, USDC swap volume on Hydration, Stellaswap | [#3482](https://github.com/Koniverse/SubWallet-Extension/issues/3482) | saltict | — |
| [US-31.34](../stories/US-31.34-add-chainflip-broker.md) | ✅ done | Add Chainflip broker | [#3483](https://github.com/Koniverse/SubWallet-Extension/issues/3483) | saltict | 1.2.30 |
| [US-31.35](../stories/US-31.35-unified-account-fix-bug-related-to-the-swap-feature.md) | ✅ done | Unified account - Fix bug related to the Swap feature | [#3503](https://github.com/Koniverse/SubWallet-Extension/issues/3503) | Thiendekaco | 1.3.1 |
| [US-31.36](../stories/US-31.36-checklist-and-testing-for-unified-account-earning-swap.md) | ✅ done | Checklist and Testing for Unified account: Earning, Swap... | [#3511](https://github.com/Koniverse/SubWallet-Extension/issues/3511) | haiyenvu23 | — |
| [US-31.37](../stories/US-31.37-extension-fees-displayed-incorrectly-on-swap-confirmati.md) | 📋 backlog | Extension - Fees displayed incorrectly on Swap Confirmation screen when reopening popup | [#3630](https://github.com/Koniverse/SubWallet-Extension/issues/3630) | — | — |
| [US-31.38](../stories/US-31.38-add-swap-pairs-for-hydration-and-chainflip.md) | ✅ done | Add swap pairs for Hydration and ChainFlip | [#3633](https://github.com/Koniverse/SubWallet-Extension/issues/3633), [#3651](https://github.com/Koniverse/SubWallet-Extension/issues/3651) | PDTnhah | 1.2.31 |
| [US-31.39](../stories/US-31.39-update-default-slippage-for-chainflip.md) | ✅ done | Update default slippage for ChainFlip | [#3634](https://github.com/Koniverse/SubWallet-Extension/issues/3634) | PDTnhah | 1.3.2 |
| [US-31.40](../stories/US-31.40-extension-add-custom-slippage-for-chainflip.md) | 📋 backlog | Extension - Add custom slippage for ChainFlip | [#3774](https://github.com/Koniverse/SubWallet-Extension/issues/3774) | — | — |
| [US-31.41](../stories/US-31.41-support-swap-tao-on-simpleswap.md) | ✅ done | Support swap TAO on SimpleSwap | [#3855](https://github.com/Koniverse/SubWallet-Extension/issues/3855) | tunghp2002 | 1.3.11 |
| [US-31.42](../stories/US-31.42-add-slippage-protection-for-chainflip.md) | ✅ done | Add slippage protection for Chainflip | [#3898](https://github.com/Koniverse/SubWallet-Extension/issues/3898) | tunghp2002 | — |
| [US-31.43](../stories/US-31.43-improve-select-provider-in-swap-feature.md) | ✅ done | Improve Select provider in Swap feature | [#3933](https://github.com/Koniverse/SubWallet-Extension/issues/3933) | nulllpc | 1.3.30 |
| [US-31.44](../stories/US-31.44-extension-show-incorrect-network-address-on-xcm-confirm.md) | ✅ done | Extension - Show incorrect network address on XCM confirmation screen when perform Swap, Earning | [#3936](https://github.com/Koniverse/SubWallet-Extension/issues/3936) | PDTnhah | 1.3.80 |
| [US-31.45](../stories/US-31.45-extension-implement-paid-token-exchange-feature-for-swa.md) | ⏸️ deprecated | Extension - Implement paid token exchange feature for Swap | [#3966](https://github.com/Koniverse/SubWallet-Extension/issues/3966) | frenkie-ng | — |
| [US-31.46](../stories/US-31.46-support-uniswap.md) | ✅ done | Support Uniswap | [#3977](https://github.com/Koniverse/SubWallet-Extension/issues/3977) | tunghp2002 | 1.3.23 |
| [US-31.47](../stories/US-31.47-error-when-swap-on-hydration.md) | ✅ done | Error when swap on hydration | [#3993](https://github.com/Koniverse/SubWallet-Extension/issues/3993) | S2kael | 1.3.30 |
| [US-31.48](../stories/US-31.48-setup-swap-bi-report-for-subwallet.md) | ✅ done | Setup swap BI report for SubWallet | [#4009](https://github.com/Koniverse/SubWallet-Extension/issues/4009) | anhntk54 | — |
| [US-31.49](../stories/US-31.49-improve-swap-feature.md) | ✅ done | Improve swap feature | [#4069](https://github.com/Koniverse/SubWallet-Extension/issues/4069) | lw-cdm | 1.3.30 |
| [US-31.50](../stories/US-31.50-support-dynamic-swap-pair.md) | ⏸️ deprecated | Support dynamic swap pair | [#4078](https://github.com/Koniverse/SubWallet-Extension/issues/4078) | bluezdot | — |
| [US-31.51](../stories/US-31.51-add-validation-to-swap-handlers.md) | ✅ done | Add validation to swap handlers | [#4082](https://github.com/Koniverse/SubWallet-Extension/issues/4082) | nulllpc | — |
| [US-31.52](../stories/US-31.52-review-uniswap-fee.md) | ✅ done | Review Uniswap fee | [#4088](https://github.com/Koniverse/SubWallet-Extension/issues/4088) | bluezdot | 1.3.36 |
| [US-31.53](../stories/US-31.53-integrate-bitcoin-into-subwallet-and-support-crosschain.md) | 🚧 in-progress | Integrate Bitcoin into SubWallet and support Crosschain swap BTC ↔ DOT | [#4096](https://github.com/Koniverse/SubWallet-Extension/issues/4096) | nulllpc | — |
| [US-31.54](../stories/US-31.54-support-1inch-dex-aggregator.md) | ✅ done | Support 1inch dex aggregator | [#4105](https://github.com/Koniverse/SubWallet-Extension/issues/4105) | tunghp2002 | — |
| [US-31.55](../stories/US-31.55-recheck-swap-quote-with-asset-hub.md) | ✅ done | Recheck swap quote with asset hub | [#4113](https://github.com/Koniverse/SubWallet-Extension/issues/4113) | nulllpc | 1.3.30 |
| [US-31.56](../stories/US-31.56-fixed-bug-swap-from-dot-eth-arbitrum.md) | ✅ done | Fixed bug Swap from DOT -> ETH(Arbitrum) | [#4141](https://github.com/Koniverse/SubWallet-Extension/issues/4141) | tunghp2002 | 1.3.27 |
| [US-31.57](../stories/US-31.57-support-kyberswap-aggregator.md) | ✅ done | Support KyberSwap Aggregator | [#4144](https://github.com/Koniverse/SubWallet-Extension/issues/4144) | tunghp2002 | 1.3.36 |
| [US-31.58](../stories/US-31.58-add-more-swap-provider.md) | ✅ done | Add more Swap Provider | [#4155](https://github.com/Koniverse/SubWallet-Extension/issues/4155) | nulllpc | — |
| [US-31.59](../stories/US-31.59-1-click-cross-chain-swap.md) | 🚧 in-progress | 1 Click cross chain Swap | [#4156](https://github.com/Koniverse/SubWallet-Extension/issues/4156) | saltict | — |
| [US-31.60](../stories/US-31.60-extension-allows-calculation-of-xcm-swap-balance-based.md) | 📋 backlog | Extension - Allows calculation of XCM/Swap balance based on current account balance | [#4194](https://github.com/Koniverse/SubWallet-Extension/issues/4194) | bluezdot | — |
| [US-31.61](../stories/US-31.61-update-new-ui-for-swap-quote.md) | ✅ done | Update New UI for Swap quote | [#4204](https://github.com/Koniverse/SubWallet-Extension/issues/4204) | lw-cdm | 1.3.30 |
| [US-31.62](../stories/US-31.62-manage-supported-xcm-pairs-swap-pairs.md) | ✅ done | Manage supported XCM pairs & Swap pairs | [#4207](https://github.com/Koniverse/SubWallet-Extension/issues/4207) | PDTnhah | — |
| [US-31.63](../stories/US-31.63-support-exporting-creating-files-to-manage-swap-pairs.md) | 🚧 in-progress | Support exporting/creating files to manage Swap pairs | [#4209](https://github.com/Koniverse/SubWallet-Extension/issues/4209) | PDTnhah | — |
| [US-31.64](../stories/US-31.64-swap-support-and-direct-cross-chain-swap-on-more-evm-ch.md) | ✅ done | Swap support and direct cross-chain swap on more EVM chains | [#4219](https://github.com/Koniverse/SubWallet-Extension/issues/4219) | bluezdot | 1.3.32 |
| [US-31.65](../stories/US-31.65-support-swap-bridge-for-evm-chains.md) | ✅ done | Support swap-bridge for EVM chains | [#4220](https://github.com/Koniverse/SubWallet-Extension/issues/4220) | bluezdot | 1.3.32 |
| [US-31.66](../stories/US-31.66-round-3-extension-improve-ux-for-swap-cross-chain.md) | 📋 backlog | [Round 3] Extension - Improve UX for swap cross-chain | [#4227](https://github.com/Koniverse/SubWallet-Extension/issues/4227) | — | — |
| [US-31.67](../stories/US-31.67-fixed-bug-error-page-when-perform-sign-permit-from-unis.md) | ✅ done | Fixed bug Error page when perform sign permit from Uniswap | [#4248](https://github.com/Koniverse/SubWallet-Extension/issues/4248) | nulllpc | 1.3.30 |
| [US-31.68](../stories/US-31.68-update-content-in-app-for-swap.md) | ✅ done | Update content in-app for swap | [#4259](https://github.com/Koniverse/SubWallet-Extension/issues/4259) | bluezdot | 1.3.35 |
| [US-31.69](../stories/US-31.69-extension-improve-some-ux-for-swap.md) | 📋 backlog | Extension - Improve some UX for swap | [#4260](https://github.com/Koniverse/SubWallet-Extension/issues/4260) | Quangdm-cdm | — |
| [US-31.70](../stories/US-31.70-support-asset-hub-testnet-swap-for-chainflip.md) | ✅ done | Support Asset Hub Testnet swap for Chainflip | [#4265](https://github.com/Koniverse/SubWallet-Extension/issues/4265) | bluezdot | 1.3.41 |
| [US-31.71](../stories/US-31.71-extension-apply-new-i18n-format-for-transfer-swap-scree.md) | ✅ done | Extension - Apply new i18n format for Transfer, Swap screens | [#4279](https://github.com/Koniverse/SubWallet-Extension/issues/4279) | — | — |
| [US-31.72](../stories/US-31.72-support-gigadot-token-for-hydration.md) | ✅ done | Support GIGADOT token for Hydration | [#4283](https://github.com/Koniverse/SubWallet-Extension/issues/4283) | bluezdot | 1.3.31 |
| [US-31.73](../stories/US-31.73-support-uniswapx-dutch-swap.md) | ✅ done | Support UniswapX Dutch Swap | [#4293](https://github.com/Koniverse/SubWallet-Extension/issues/4293) | bluezdot | 1.3.36 |
| [US-31.74](../stories/US-31.74-add-more-swap-pairs-from-simple-swap.md) | ✅ done | Add more swap pairs from Simple swap | [#4306](https://github.com/Koniverse/SubWallet-Extension/issues/4306) | bluezdot | — |
| [US-31.75](../stories/US-31.75-remove-all-swap-asset-ref-on-subwallet-cms.md) | ✅ done | Remove all swap asset ref on SubWallet CMS | [#4313](https://github.com/Koniverse/SubWallet-Extension/issues/4313) | PDTnhah | — |
| [US-31.76](../stories/US-31.76-support-bridge-swap-process-for-cross-chain-swap-on-evm.md) | ✅ done | Support Bridge-Swap process for cross-chain swap on EVM | [#4321](https://github.com/Koniverse/SubWallet-Extension/issues/4321) | bluezdot | 1.3.38 |
| [US-31.77](../stories/US-31.77-update-api-for-simpleswap.md) | ⏸️ deprecated | Update API for SimpleSwap | [#4336](https://github.com/Koniverse/SubWallet-Extension/issues/4336) | — | — |
| [US-31.78](../stories/US-31.78-update-latest-hydration-sdk.md) | ✅ done | Update latest Hydration SDK | [#4342](https://github.com/Koniverse/SubWallet-Extension/issues/4342) | saltict | — |
| [US-31.79](../stories/US-31.79-extension-update-content-in-app-for-swap-round-2.md) | 🟢 ready | Extension - Update content in-app for Swap (Round 2) | [#4349](https://github.com/Koniverse/SubWallet-Extension/issues/4349) | Quangdm-cdm | — |
| [US-31.80](../stories/US-31.80-extension-show-total-fee-for-swap-feature.md) | 📋 backlog | Extension - Show Total fee for swap feature | [#4376](https://github.com/Koniverse/SubWallet-Extension/issues/4376) | bluezdot | — |
| [US-31.81](../stories/US-31.81-update-fee-for-uniswap.md) | ✅ done | Update fee for UniSwap | [#4385](https://github.com/Koniverse/SubWallet-Extension/issues/4385) | bluezdot | 1.3.37 |
| [US-31.82](../stories/US-31.82-update-hydration-unified-address-formatting.md) | ✅ done | Update Hydration Unified address formatting | [#4388](https://github.com/Koniverse/SubWallet-Extension/issues/4388) | PDTnhah | — |
| [US-31.83](../stories/US-31.83-support-swap-for-unichain.md) | ✅ done | Support swap for Unichain | [#4389](https://github.com/Koniverse/SubWallet-Extension/issues/4389) | tunghp2002 | 1.3.54 |
| [US-31.84](../stories/US-31.84-extension-can-t-reset-quote-on-swap-features.md) | 🚧 in-progress | Extension - Can't reset quote on Swap features | [#4390](https://github.com/Koniverse/SubWallet-Extension/issues/4390) | tunghp2002 | — |
| [US-31.85](../stories/US-31.85-integrate-swap-providers.md) | ✅ done | Integrate swap providers | [#4407](https://github.com/Koniverse/SubWallet-Extension/issues/4407) | — | — |
| [US-31.86](../stories/US-31.86-extension-update-warning-low-liquidity-for-some-provide.md) | 📋 backlog | Extension - Update warning low liquidity for some provider on Swap features | [#4411](https://github.com/Koniverse/SubWallet-Extension/issues/4411) | — | — |
| [US-31.87](../stories/US-31.87-backend-swap-filtering-supportable-swap-pair-by-metadat.md) | ✅ done | [Backend - Swap] Filtering Supportable Swap Pair by Metadata | [#4420](https://github.com/Koniverse/SubWallet-Extension/issues/4420) | bluezdot | — |
| [US-31.88](../stories/US-31.88-extension-support-crosschain-swap-btc-dot.md) | ✅ done | Extension - Support Crosschain swap BTC <-> DOT | [#4467](https://github.com/Koniverse/SubWallet-Extension/issues/4467) | bluezdot | — |
| [US-31.89](../stories/US-31.89-review-swap-logic.md) | ✅ done | Review Swap logic | [#4491](https://github.com/Koniverse/SubWallet-Extension/issues/4491) | Quangdm-sw | — |
| [US-31.90](../stories/US-31.90-extension-don-t-show-list-token-to-choose-to-paid-fee-o.md) | ✅ done | Extension - Don't show list token to choose to paid fee on Hydration network | [#4494](https://github.com/Koniverse/SubWallet-Extension/issues/4494) | — | — |
| [US-31.91](../stories/US-31.91-support-for-new-swap-pairs-on-chainflip.md) | ✅ done | Support for New Swap Pairs on Chainflip | [#4495](https://github.com/Koniverse/SubWallet-Extension/issues/4495) | bluezdot | 1.3.50 |
| [US-31.92](../stories/US-31.92-integrate-optimex-into-btc-swap-flow.md) | ✅ done | Integrate Optimex into BTC Swap Flow | [#4496](https://github.com/Koniverse/SubWallet-Extension/issues/4496) | bluezdot | 1.3.63 |
| [US-31.93](../stories/US-31.93-update-new-content-to-submitted-screen-when-swap.md) | ✅ done | Update new content to submitted screen when swap | [#4512](https://github.com/Koniverse/SubWallet-Extension/issues/4512) | lw-cdm | 1.3.48 |
| [US-31.94](../stories/US-31.94-update-chain-list-stable-v0-2-112.md) | 🚧 in-progress | Update chain-list stable v0.2.112 | [#4517](https://github.com/Koniverse/SubWallet-Extension/issues/4517) | bluezdot | — |
| [US-31.95](../stories/US-31.95-support-for-bitcoin-swap-on-chainflip.md) | ✅ done | Support for Bitcoin swap on ChainFlip | [#4573](https://github.com/Koniverse/SubWallet-Extension/issues/4573) | bluezdot | 1.3.51 |
| [US-31.96](../stories/US-31.96-update-ux-ui-when-support-swap-for-bitcoin-on-chainflip.md) | ✅ done | Update UX/UI when support Swap for Bitcoin on Chainflip | [#4581](https://github.com/Koniverse/SubWallet-Extension/issues/4581) | bluezdot | 1.3.53 |
| [US-31.97](../stories/US-31.97-check-swap-tao-bittensor-with-simpleswap-provider.md) | ✅ done | Check swap TAO (Bittensor) with SimpleSwap Provider | [#4590](https://github.com/Koniverse/SubWallet-Extension/issues/4590) | bluezdot | — |
| [US-31.98](../stories/US-31.98-support-bridge-tbtc-ethereum-to-tbtc-hydration-via-snow.md) | ✅ done | Support bridge tBTC (Ethereum) to tBTC (Hydration) via Snowbridge | [#4593](https://github.com/Koniverse/SubWallet-Extension/issues/4593) | bluezdot | 1.3.54 |
| [US-31.99](../stories/US-31.99-support-swap-between-native-btc-tbtc-on-hydration.md) | 📋 backlog | Support swap between native BTC & tBTC on Hydration | [#4595](https://github.com/Koniverse/SubWallet-Extension/issues/4595) | — | — |
| [US-31.100](../stories/US-31.100-apply-dry-run-to-validate-bridge-step-for-swap-feature.md) | ✅ done | Apply dry-run to validate bridge step for swap feature | [#4644](https://github.com/Koniverse/SubWallet-Extension/issues/4644) | bluezdot | 1.3.55 |
| [US-31.101](../stories/US-31.101-improve-swap-validation-by-dry-run-preview-api-from-par.md) | ✅ done | Improve Swap validation by Dry-run-preview API from ParaSpell | [#4671](https://github.com/Koniverse/SubWallet-Extension/issues/4671) | bluezdot | 1.3.67 |
| [US-31.102](../stories/US-31.102-extension-support-hollar-hydration-token-in-list-token.md) | 🚧 in-progress | Extension - Support Hollar (Hydration) token in list token to paid fee | [#4709](https://github.com/Koniverse/SubWallet-Extension/issues/4709) | bluezdot | — |
| [US-31.103](../stories/US-31.103-swap-update-chainflip-chainflip-sdk-v1-11-0.md) | ✅ done | [Swap] Update Chainflip @chainflip/sdk v1.11.0 | [#4724](https://github.com/Koniverse/SubWallet-Extension/issues/4724) | bluezdot | — |
| [US-31.104](../stories/US-31.104-remove-support-swap-to-dot-ksm-on-polkadot-kusama.md) | ✅ done | Remove support swap to DOT/KSM on Polkadot/Kusama | [#4733](https://github.com/Koniverse/SubWallet-Extension/issues/4733) | bluezdot | — |
| [US-31.105](../stories/US-31.105-improve-the-algorithm-to-support-more-swap-path.md) | 🚧 in-progress | Improve the algorithm to support more swap path | [#4791](https://github.com/Koniverse/SubWallet-Extension/issues/4791) | bluezdot | — |
| [US-31.106](../stories/US-31.106-extension-improve-for-optimex-provider-on-swap-features.md) | 📋 backlog | Extension - Improve for Optimex provider on Swap features | [#4796](https://github.com/Koniverse/SubWallet-Extension/issues/4796) | — | — |
| [US-31.107](../stories/US-31.107-refactor-swap-service-interface-and-redundant-code.md) | ✅ done | Refactor Swap Service interface and redundant code | [#4826](https://github.com/Koniverse/SubWallet-Extension/issues/4826) | bluezdot | 1.3.79 |
| [US-31.108](../stories/US-31.108-support-bittensor-on-chain-swap.md) | ✅ done | Support bittensor on-chain swap | [#4899](https://github.com/Koniverse/SubWallet-Extension/issues/4899) | tunghp2002 | 1.3.78 |
| [US-31.109](../stories/US-31.109-extension-display-error-message-when-swapping-chainflip.md) | ✅ done | [Extension] Display error message when swapping Chainflip | [#5014](https://github.com/Koniverse/SubWallet-Extension/issues/5014) | — | — |

## Acceptance criteria

- [ ] **AC-1** — Every Swap issue with no FR story has exactly one story here; its status matches the tracker (done = COMPLETED, backlog = open, deprecated = not-planned/duplicate).
- [x] **AC-2** — `npx koni-docs validate` and `node scripts/koni-docs-check-ids.mjs` exit 0.
