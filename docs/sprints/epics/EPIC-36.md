---
id: EPIC-36
title: "Maintenance — Hardware Wallet"
status: in-progress
prd_ref: []
created: 2026-07-15
updated: 2026-07-15
generated_by: koni-docs-gen-maintenance
---

## Goal

Incremental work, fixes and chores for the **Hardware Wallet** area ([EPIC-16](EPIC-16.md)) that materialize no FR of their own. One story per tracker issue, so the CHANGELOG and issue tracker are fully claimed
and the ERP can answer "who shipped what, under which issue" for this area. This epic is a
**ledger, not a plan** — it was generated from the tracker and CHANGELOG by a one-off local
generator (kept in the setup scratchpad, not the repo: it wipes and rebuilds every `generated_by`
file from six `/tmp` caches, so re-running it without those caches would destroy this provenance).

## Why separate from EPIC-16

The 21 product epics are the **FR map**: each story there is a requirement's contract. These
issues materialize no FR — they are fixes, chore bumps, and small increments. Keeping them here
leaves [EPIC-16](EPIC-16.md) readable as the requirement set, while
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

**81 stories** — 65 done (shipped), 0 in flight (ready / in-progress /
review, from the Projects board), 9 backlog (open, not yet started), 7 deprecated
(closed **not-planned / duplicate** — never shipped). Open-issue status mirrors the GitHub
Projects board (#2); closed-issue status comes from the tracker's close reason. Per-issue
detail is the [CHANGELOG coverage index](../../notes/changelog-coverage.md) and each frontmatter.

## Stories

Every story in this ledger, in issue order — click a US to open its tracker link, evidence and
verification. **Assignee** is who the tracker or the `[Issue-N]` PR/commit names (`—` where nobody
is recorded); **Shipped** is the `(Koni)` release, `—` when no CHANGELOG line proves one.

| US | Status | Title | Issue | Assignee | Shipped |
|---|---|---|---|---|---|
| [US-36.1](../stories/US-36.1-integrate-with-keystone.md) | ✅ done | Integrate with Keystone | [#435](https://github.com/Koniverse/SubWallet-Extension/issues/435) | S2kael | — |
| [US-36.2](../stories/US-36.2-integration-ledger-acala-account.md) | ✅ done | Integration Ledger Acala account | [#564](https://github.com/Koniverse/SubWallet-Extension/issues/564) | S2kael | 0.6.6 |
| [US-36.3](../stories/US-36.3-improve-ux-for-on-ramp-feature-with-ledger-account.md) | ✅ done | Improve UX for on-ramp feature with Ledger Account | [#607](https://github.com/Koniverse/SubWallet-Extension/issues/607) | S2kael | — |
| [US-36.4](../stories/US-36.4-keystone-new-ui-request.md) | ✅ done | Keystone new UI request | [#750](https://github.com/Koniverse/SubWallet-Extension/issues/750) | hieudd | — |
| [US-36.5](../stories/US-36.5-keystone-adding-brand-name.md) | ✅ done | Keystone - adding brand name | [#752](https://github.com/Koniverse/SubWallet-Extension/issues/752) | hieudd | 0.6.8 |
| [US-36.6](../stories/US-36.6-add-support-for-acala-on-ledger.md) | ✅ done | Add support for Acala on Ledger | [#841](https://github.com/Koniverse/SubWallet-Extension/issues/841) | hieudd | — |
| [US-36.7](../stories/US-36.7-handle-case-attach-and-send-asset-for-ledger-account-wi.md) | ✅ done | Handle case attach and send asset for Ledger account with addess index #0 | [#846](https://github.com/Koniverse/SubWallet-Extension/issues/846) | S2kael | 0.7.5 |
| [US-36.8](../stories/US-36.8-transaction-has-a-bad-signature-with-ledger-signature.md) | ✅ done | Transaction has a bad signature with Ledger signature | [#1096](https://github.com/Koniverse/SubWallet-Extension/issues/1096) | S2kael | — |
| [US-36.9](../stories/US-36.9-need-to-display-address-list-by-token-that-ledger-accou.md) | ✅ done | Need to display address list by token that Ledger account supports when receiving Ledger account address with 'All accou | [#1240](https://github.com/Koniverse/SubWallet-Extension/issues/1240) | S2kael | 1.0.2 |
| [US-36.10](../stories/US-36.10-add-warning-message-in-case-of-transferring-xcm-using-l.md) | ✅ done | Add warning message in case of transferring xcm using Ledger account | [#1256](https://github.com/Koniverse/SubWallet-Extension/issues/1256) | S2kael | 1.0.2 |
| [US-36.11](../stories/US-36.11-excluded-ledger-account-from-the-my-wallet-list-when-se.md) | ✅ done | Excluded Ledger account from the 'My Wallet' list when sending tokens that are not supported by the Ledger account | [#1454](https://github.com/Koniverse/SubWallet-Extension/issues/1454) | S2kael | 1.0.7 |
| [US-36.12](../stories/US-36.12-add-support-ledger-with-aleph-zero-network.md) | ✅ done | Add support Ledger with Aleph Zero network | [#1565](https://github.com/Koniverse/SubWallet-Extension/issues/1565) | S2kael | 1.0.12 |
| [US-36.13](../stories/US-36.13-an-error-when-sign-transaction-from-moonbeam-app-via-le.md) | ⏸️ deprecated | An error when sign transaction from moonbeam app via Ledger | [#1571](https://github.com/Koniverse/SubWallet-Extension/issues/1571) | S2kael | — |
| [US-36.14](../stories/US-36.14-improved-connection-experience-with-ledger.md) | ✅ done | Improved connection experience with Ledger | [#1573](https://github.com/Koniverse/SubWallet-Extension/issues/1573) | S2kael | 1.1.1 |
| [US-36.15](../stories/US-36.15-still-show-all-token-when-standing-all-accounts-mode-in.md) | ⏸️ deprecated | Still show all token when standing All accounts mode in case there is only Ledger account in wallet | [#1587](https://github.com/Koniverse/SubWallet-Extension/issues/1587) | — | — |
| [US-36.16](../stories/US-36.16-support-ledger-for-astar.md) | ✅ done | Support Ledger for Astar | [#1814](https://github.com/Koniverse/SubWallet-Extension/issues/1814) | S2kael | 1.1.11 |
| [US-36.17](../stories/US-36.17-handle-the-case-of-signing-transactions-from-dapp-using.md) | ✅ done | Handle the case of signing transactions from dApp using a Ledger account | [#1874](https://github.com/Koniverse/SubWallet-Extension/issues/1874) | S2kael | 1.1.12 |
| [US-36.18](../stories/US-36.18-support-ledger-for-more-chains.md) | ✅ done | Support Ledger for more chains | [#1942](https://github.com/Koniverse/SubWallet-Extension/issues/1942) | S2kael | 1.1.15 |
| [US-36.19](../stories/US-36.19-ledger-support-connect-ledger-device-for-centrifuge-dar.md) | ⏸️ deprecated | [Ledger] Support connect Ledger device for Centrifuge, Darwinia, Energy Web Chain | [#1962](https://github.com/Koniverse/SubWallet-Extension/issues/1962) | Quangdm-cdm | — |
| [US-36.20](../stories/US-36.20-webapp-update-ui-of-the-list-account-to-connect-ledger.md) | ✅ done | WebApp - Update UI of the List account to connect Ledger device screen | [#1971](https://github.com/Koniverse/SubWallet-Extension/issues/1971) | S2kael | 1.1.36 |
| [US-36.21](../stories/US-36.21-improve-ux-in-case-the-feature-is-not-supported-for-of.md) | 📋 backlog | Improve UX in case the feature is not supported for of Ledger account | [#1980](https://github.com/Koniverse/SubWallet-Extension/issues/1980) | — | — |
| [US-36.22](../stories/US-36.22-handle-case-connect-extension-with-ledger-account.md) | ✅ done | Handle case connect extension with Ledger account | [#2066](https://github.com/Koniverse/SubWallet-Extension/issues/2066) | S2kael | — |
| [US-36.23](../stories/US-36.23-fixed-bug-get-ledger-account-addresses-on-incompatible.md) | ✅ done | Fixed bug Get Ledger account addresses on incompatible networks | [#2075](https://github.com/Koniverse/SubWallet-Extension/issues/2075) | S2kael | 1.1.19 |
| [US-36.24](../stories/US-36.24-implement-offline-tool-to-recover-assets-from-ledger.md) | ✅ done | Implement offline tool to recover assets from Ledger | [#2200](https://github.com/Koniverse/SubWallet-Extension/issues/2200) | frenkie-ng | — |
| [US-36.25](../stories/US-36.25-support-staking-azero-with-ledger.md) | ✅ done | Support staking AZERO with Ledger | [#2219](https://github.com/Koniverse/SubWallet-Extension/issues/2219) | S2kael | 1.1.23 |
| [US-36.26](../stories/US-36.26-support-ledger-for-vara-network.md) | ⏸️ deprecated | Support Ledger for Vara network | [#2283](https://github.com/Koniverse/SubWallet-Extension/issues/2283) | S2kael | — |
| [US-36.27](../stories/US-36.27-add-support-for-ewt-token-energy-web-chain-on-ledger.md) | ✅ done | Add support for EWT token (Energy Web Chain) on Ledger | [#2357](https://github.com/Koniverse/SubWallet-Extension/issues/2357) | nulllpc | — |
| [US-36.28](../stories/US-36.28-support-xcm-for-ledger.md) | ✅ done | Support XCM for Ledger | [#2436](https://github.com/Koniverse/SubWallet-Extension/issues/2436) | Thiendekaco | 1.2.29 |
| [US-36.29](../stories/US-36.29-webapp-do-not-show-earning-position-of-the-ledger-evm-a.md) | ✅ done | WebApp - Do not show earning position of the Ledger EVM account | [#2494](https://github.com/Koniverse/SubWallet-Extension/issues/2494) | S2kael | — |
| [US-36.30](../stories/US-36.30-improve-ui-for-ledger-account-recovery-tool.md) | ✅ done | Improve UI for Ledger Account Recovery Tool | [#2521](https://github.com/Koniverse/SubWallet-Extension/issues/2521) | frenkie-ng | — |
| [US-36.31](../stories/US-36.31-fixed-bug-connect-a-ledger-device.md) | ✅ done | Fixed bug connect a Ledger device | [#2608](https://github.com/Koniverse/SubWallet-Extension/issues/2608) | Thiendekaco | 1.1.45 |
| [US-36.32](../stories/US-36.32-re-check-case-send-token-on-acala-evm-with-ledger-accou.md) | ✅ done | Re-check case send token on Acala-EVM with Ledger account | [#2625](https://github.com/Koniverse/SubWallet-Extension/issues/2625) | S2kael | 1.1.39 |
| [US-36.33](../stories/US-36.33-webapp-unable-to-scroll-list-account-when-connect-a-led.md) | ✅ done | WebApp - Unable to scroll list account when connect a Ledger device | [#2782](https://github.com/Koniverse/SubWallet-Extension/issues/2782) | Thiendekaco | — |
| [US-36.34](../stories/US-36.34-support-connect-ledger-device-for-asset-hub.md) | ✅ done | Support connect Ledger device for Asset Hub | [#2785](https://github.com/Koniverse/SubWallet-Extension/issues/2785) | Thiendekaco | 1.1.46 |
| [US-36.35](../stories/US-36.35-handle-duplicate-addresses-when-connecting-ledger-accou.md) | ⏸️ deprecated | Handle duplicate addresses when connecting Ledger accounts | [#2803](https://github.com/Koniverse/SubWallet-Extension/issues/2803) | Thiendekaco | — |
| [US-36.36](../stories/US-36.36-allows-signing-messages-with-ledger-substrate.md) | ✅ done | Allows signing messages with Ledger substrate | [#2834](https://github.com/Koniverse/SubWallet-Extension/issues/2834) | S2kael | — |
| [US-36.37](../stories/US-36.37-integrate-avail-ledger-app.md) | ✅ done | Integrate Avail Ledger app | [#2982](https://github.com/Koniverse/SubWallet-Extension/issues/2982) | S2kael | 1.2.22 |
| [US-36.38](../stories/US-36.38-add-ledger-support-for-a0-testnet.md) | ✅ done | Add Ledger support for A0 testnet | [#3080](https://github.com/Koniverse/SubWallet-Extension/issues/3080) | S2kael | — |
| [US-36.39](../stories/US-36.39-fixed-bug-sign-transaction-failed-for-some-tokens-with.md) | ✅ done | Fixed bug Sign transaction failed for some tokens with Aleph Zero Ledger account | [#3145](https://github.com/Koniverse/SubWallet-Extension/issues/3145) | S2kael | 1.2.5 |
| [US-36.40](../stories/US-36.40-extension-improve-perform-transaction-with-account-ledg.md) | ✅ done | Extension - Improve perform transaction with account Ledger of dApps utilizing both EVM and Substrate | [#3173](https://github.com/Koniverse/SubWallet-Extension/issues/3173) | Thiendekaco | — |
| [US-36.41](../stories/US-36.41-add-support-ledger-for-polkadex.md) | ✅ done | Add support Ledger for Polkadex | [#3231](https://github.com/Koniverse/SubWallet-Extension/issues/3231) | S2kael | 1.2.16 |
| [US-36.42](../stories/US-36.42-fix-bug-show-incorrect-screen-when-perform-earning-acti.md) | ✅ done | Fix bug Show incorrect screen when perform earning actions with Ledger's EVM account | [#3254](https://github.com/Koniverse/SubWallet-Extension/issues/3254) | S2kael | 1.2.11 |
| [US-36.43](../stories/US-36.43-webapp-review-and-support-polkadot-ledger-app-from-zond.md) | ✅ done | WebApp - Review and support Polkadot Ledger app from Zondax for WebApp | [#3256](https://github.com/Koniverse/SubWallet-Extension/issues/3256) | frenkie-ng | 1.2.14 |
| [US-36.44](../stories/US-36.44-add-validate-account-in-case-sign-transaction-with-ledg.md) | ✅ done | Add validate account in case sign transaction with Ledger account | [#3263](https://github.com/Koniverse/SubWallet-Extension/issues/3263) | S2kael | 1.2.15 |
| [US-36.45](../stories/US-36.45-allow-to-use-migration-polkadot-app-to-attach-ledger-ac.md) | ✅ done | Allow to use Migration Polkadot App to attach Ledger account | [#3307](https://github.com/Koniverse/SubWallet-Extension/issues/3307), [#3402](https://github.com/Koniverse/SubWallet-Extension/issues/3402) | S2kael | 1.2.24 |
| [US-36.46](../stories/US-36.46-support-account-ledger-import-by-json-from-another-wall.md) | 📋 backlog | Support account ledger import by JSON from another wallet | [#3319](https://github.com/Koniverse/SubWallet-Extension/issues/3319) | S2kael | — |
| [US-36.47](../stories/US-36.47-webapp-add-validate-account-in-case-sign-transaction-wi.md) | 📋 backlog | WebApp - Add validate account in case sign transaction with Ledger account | [#3340](https://github.com/Koniverse/SubWallet-Extension/issues/3340) | frenkie-ng | — |
| [US-36.48](../stories/US-36.48-extension-recheck-and-support-ledger-for-avail.md) | ✅ done | Extension - Recheck and support Ledger for Avail | [#3390](https://github.com/Koniverse/SubWallet-Extension/issues/3390) | S2kael | 1.2.22 |
| [US-36.49](../stories/US-36.49-extension-auto-migrate-account-ledger-from-the-old-app.md) | 📋 backlog | Extension - Auto migrate account Ledger from the old app to the new app | [#3392](https://github.com/Koniverse/SubWallet-Extension/issues/3392) | — | — |
| [US-36.50](../stories/US-36.50-webapp-support-avail-ledger-app.md) | ✅ done | WebApp - Support Avail Ledger app | [#3407](https://github.com/Koniverse/SubWallet-Extension/issues/3407) | lw-cdm | 1.2.26 |
| [US-36.51](../stories/US-36.51-support-xcm-for-ledger-polkadot-generic-app.md) | ✅ done | Support XCM for Ledger Polkadot generic app | [#3458](https://github.com/Koniverse/SubWallet-Extension/issues/3458) | Thiendekaco | 1.2.29 |
| [US-36.52](../stories/US-36.52-webapp-allow-to-use-migration-polkadot-app-to-attach-le.md) | ✅ done | WebApp - Allow to use Migration Polkadot App to attach Ledger account | [#3460](https://github.com/Koniverse/SubWallet-Extension/issues/3460) | Thiendekaco | — |
| [US-36.53](../stories/US-36.53-extension-add-validate-for-solochain-when-receive-trans.md) | ✅ done | Extension - Add validate for Solochain when receive, transfer with Generic ledger account | [#3463](https://github.com/Koniverse/SubWallet-Extension/issues/3463) | S2kael | 1.2.26 |
| [US-36.54](../stories/US-36.54-webapp-add-validate-for-solochain-when-receive-transfer.md) | ✅ done | WebApp - Add validate for Solochain when receive, transfer with Generic ledger account | [#3479](https://github.com/Koniverse/SubWallet-Extension/issues/3479) | Thiendekaco | — |
| [US-36.55](../stories/US-36.55-unified-account-review-and-update-for-ledger-account.md) | ✅ done | Unified account - Review and update for Ledger account | [#3491](https://github.com/Koniverse/SubWallet-Extension/issues/3491) | Thiendekaco | 1.3.1 |
| [US-36.56](../stories/US-36.56-webapp-support-xcm-for-ledger-polkadot-generic-app.md) | ✅ done | WebApp - Support XCM for Ledger Polkadot generic app | [#3531](https://github.com/Koniverse/SubWallet-Extension/issues/3531) | Thiendekaco | — |
| [US-36.57](../stories/US-36.57-avail-space-update-content-on-connect-ledger-screen.md) | 📋 backlog | Avail Space - Update content on Connect ledger screen | [#3594](https://github.com/Koniverse/SubWallet-Extension/issues/3594) | — | — |
| [US-36.58](../stories/US-36.58-support-generic-ledger-app-for-vara-network.md) | ✅ done | Support Generic ledger app for Vara network | [#3835](https://github.com/Koniverse/SubWallet-Extension/issues/3835) | PDTnhah | 1.3.9 |
| [US-36.59](../stories/US-36.59-extension-implement-custom-derivation-path-when-connect.md) | 📋 backlog | Extension - Implement custom derivation path when connect Ledger | [#3866](https://github.com/Koniverse/SubWallet-Extension/issues/3866) | — | — |
| [US-36.60](../stories/US-36.60-update-ledger-support-for-chains-with-updated-runtime.md) | ✅ done | Update Ledger support for chains with updated runtime | [#3884](https://github.com/Koniverse/SubWallet-Extension/issues/3884) | PDTnhah | — |
| [US-36.61](../stories/US-36.61-optimize-swap-pair-selection.md) | 📋 backlog | Optimize swap pair selection | [#3902](https://github.com/Koniverse/SubWallet-Extension/issues/3902) | — | — |
| [US-36.62](../stories/US-36.62-support-avail-recovery-app.md) | ✅ done | Support Avail Recovery app | [#3915](https://github.com/Koniverse/SubWallet-Extension/issues/3915) | PDTnhah | 1.3.12 |
| [US-36.63](../stories/US-36.63-unblock-when-perform-stake-on-bifrost-with-ledger-accou.md) | ✅ done | Unblock when perform stake on Bifrost with ledger account | [#3931](https://github.com/Koniverse/SubWallet-Extension/issues/3931) | Thiendekaco | 1.3.43 |
| [US-36.64](../stories/US-36.64-avail-space-support-avail-recovery-ledger-app.md) | 📋 backlog | Avail Space - Support Avail Recovery Ledger app | [#3994](https://github.com/Koniverse/SubWallet-Extension/issues/3994) | — | — |
| [US-36.65](../stories/US-36.65-support-avail-bridge-when-using-ledger-nano-s.md) | ✅ done | Support Avail bridge when using Ledger Nano S+ | [#4225](https://github.com/Koniverse/SubWallet-Extension/issues/4225) | nulllpc | — |
| [US-36.66](../stories/US-36.66-check-polkadot-generic-ledger-app-for-creditcoin.md) | ⏸️ deprecated | Check Polkadot Generic Ledger app for Creditcoin | [#4357](https://github.com/Koniverse/SubWallet-Extension/issues/4357) | S2kael | — |
| [US-36.67](../stories/US-36.67-update-ledger-substrate-js-library.md) | ✅ done | Update ledger-substrate-js library | [#4365](https://github.com/Koniverse/SubWallet-Extension/issues/4365) | Thiendekaco | 1.3.46 |
| [US-36.68](../stories/US-36.68-integrate-polkadot-ledger-app.md) | ✅ done | Integrate Polkadot Ledger App | [#4408](https://github.com/Koniverse/SubWallet-Extension/issues/4408) | — | — |
| [US-36.69](../stories/US-36.69-re-check-and-update-block-action-when-stake-with-ledger.md) | ✅ done | Re-check and update block action when stake with ledger account | [#4464](https://github.com/Koniverse/SubWallet-Extension/issues/4464) | Thiendekaco | 1.3.49 |
| [US-36.70](../stories/US-36.70-extension-update-metadata-for-ledger-app.md) | ✅ done | Extension - Update metadata for Ledger app | [#4480](https://github.com/Koniverse/SubWallet-Extension/issues/4480) | Thiendekaco | — |
| [US-36.71](../stories/US-36.71-extension-error-when-transfer-usdc-on-ethereum-sepolia.md) | ⏸️ deprecated | Extension - Error when transfer USDC on Ethereum Sepolia with Ledger EVM | [#4483](https://github.com/Koniverse/SubWallet-Extension/issues/4483) | Thiendekaco | — |
| [US-36.72](../stories/US-36.72-update-ledger-substrate-js-library-round-2.md) | ✅ done | Update ledger-substrate-js library (Round 2) | [#4501](https://github.com/Koniverse/SubWallet-Extension/issues/4501) | Thiendekaco | 1.3.56 |
| [US-36.73](../stories/US-36.73-block-networks-substrate-ethereum-without-runtime-updat.md) | ✅ done | Block networks (Substrate & Ethereum) without runtime update for Ledger Substrate accounts | [#4531](https://github.com/Koniverse/SubWallet-Extension/issues/4531) | Thiendekaco | 1.3.49 |
| [US-36.74](../stories/US-36.74-fixed-bug-unable-to-connect-to-ledger-apps-via-ledger-n.md) | ✅ done | Fixed bug Unable to connect to Ledger apps via Ledger Nano X 2.5.0 & Ledger Nano S+ 1.4.0 | [#4592](https://github.com/Koniverse/SubWallet-Extension/issues/4592) | Thiendekaco | 1.3.53 |
| [US-36.75](../stories/US-36.75-fixed-bug-unmatched-address-set-when-connecting-via-led.md) | ✅ done | Fixed bug Unmatched address set when connecting via Ledger Polkadot app & Ledger Avail Recovery app | [#4645](https://github.com/Koniverse/SubWallet-Extension/issues/4645) | Thiendekaco | 1.3.56 |
| [US-36.76](../stories/US-36.76-remove-polkadot-hw-ledger-from-ledger-connector.md) | 📋 backlog | Remove @polkadot/hw-ledger from ledger connector | [#4647](https://github.com/Koniverse/SubWallet-Extension/issues/4647) | Thiendekaco | — |
| [US-36.77](../stories/US-36.77-extension-update-metadata-runtime-for-ledger-app-round.md) | ✅ done | Extension - Update metadata runtime for Ledger app (Round 2) | [#4653](https://github.com/Koniverse/SubWallet-Extension/issues/4653) | PDTnhah | — |
| [US-36.78](../stories/US-36.78-extension-update-metadata-runtime-for-ledger-app-round.md) | ✅ done | [Extension] Update metadata runtime for Ledger app - Round 3 | [#4715](https://github.com/Koniverse/SubWallet-Extension/issues/4715) | PDTnhah | — |
| [US-36.79](../stories/US-36.79-extension-update-metadata-runtime-for-ledger-app-round.md) | ✅ done | [Extension] Update metadata runtime for Ledger app - Round 4 | [#4828](https://github.com/Koniverse/SubWallet-Extension/issues/4828) | PDTnhah | — |
| [US-36.80](../stories/US-36.80-extension-update-metadata-runtime-for-ledger-app-round.md) | ✅ done | [Extension] Update metadata runtime for Ledger app - Round 5 | [#4876](https://github.com/Koniverse/SubWallet-Extension/issues/4876) | PDTnhah | — |
| [US-36.81](../stories/US-36.81-recheck-ledger-signing-on-bittensor-network.md) | ✅ done | Recheck Ledger signing on Bittensor network | [#4980](https://github.com/Koniverse/SubWallet-Extension/issues/4980) | tunghp2002 | — |

## Acceptance criteria

- [ ] **AC-1** — Every Hardware Wallet issue with no FR story has exactly one story here; its status matches the tracker (done = COMPLETED, backlog = open, deprecated = not-planned/duplicate).
- [x] **AC-2** — `npx koni-docs validate` and `node scripts/koni-docs-check-ids.mjs` exit 0.
