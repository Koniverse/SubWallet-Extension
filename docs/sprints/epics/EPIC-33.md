---
id: EPIC-33
title: "Maintenance — XCM & Bridge"
status: in-progress
prd_ref: []
created: 2026-07-15
updated: 2026-07-15
generated_by: koni-docs-gen-maintenance
---

## Goal

Incremental work, fixes and chores for the **XCM & Bridge** area ([EPIC-13](EPIC-13.md)) that materialize no FR of their own. One story per tracker issue, so the CHANGELOG and issue tracker are fully claimed
and the ERP can answer "who shipped what, under which issue" for this area. This epic is a
**ledger, not a plan** — it was generated from the tracker and CHANGELOG by a one-off local
generator (kept in the setup scratchpad, not the repo: it wipes and rebuilds every `generated_by`
file from six `/tmp` caches, so re-running it without those caches would destroy this provenance).

## Why separate from EPIC-13

The 21 product epics are the **FR map**: each story there is a requirement's contract. These
issues materialize no FR — they are fixes, chore bumps, and small increments. Keeping them here
leaves [EPIC-13](EPIC-13.md) readable as the requirement set, while
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

**105 stories** — 87 done (shipped), 3 in flight (ready / in-progress /
review, from the Projects board), 6 backlog (open, not yet started), 9 deprecated
(closed **not-planned / duplicate** — never shipped). Open-issue status mirrors the GitHub
Projects board (#2); closed-issue status comes from the tracker's close reason. Per-issue
detail is the [CHANGELOG coverage index](../../notes/changelog-coverage.md) and each frontmatter.

## Stories

Every story in this ledger, in issue order — click a US to open its tracker link, evidence and
verification. **Assignee** is who the tracker or the `[Issue-N]` PR/commit names (`—` where nobody
is recorded); **Shipped** is the `(Koni)` release, `—` when no CHANGELOG line proves one.

| US | Status | Title | Issue | Assignee | Shipped |
|---|---|---|---|---|---|
| [US-33.1](../stories/US-33.1-integration-native-and-cross-chain-assets-for-acala.md) | ✅ done | Integration Native and Cross-chain assets for Acala | [#22](https://github.com/Koniverse/SubWallet-Extension/issues/22) | lw-cdm | — |
| [US-33.2](../stories/US-33.2-integration-cross-chain-assets-for-bifrost.md) | ✅ done | Integration cross-chain assets for Bifrost | [#23](https://github.com/Koniverse/SubWallet-Extension/issues/23) | lw-cdm | — |
| [US-33.3](../stories/US-33.3-integration-cross-chain-assets-for-moonbeam-moonriver.md) | ✅ done | Integration Cross-chain assets for Moonbeam, Moonriver | [#24](https://github.com/Koniverse/SubWallet-Extension/issues/24) | saltict | — |
| [US-33.4](../stories/US-33.4-support-send-receive-cross-chain-assets-update-some-lab.md) | ✅ done | Support Send / Receive cross-chain assets (update some label and variablea and xc logo) | [#35](https://github.com/Koniverse/SubWallet-Extension/issues/35) | saltict | 0.4.5 |
| [US-33.5](../stories/US-33.5-add-cross-chain-token-on-sora.md) | ✅ done | Add cross-chain token on SORA | [#189](https://github.com/Koniverse/SubWallet-Extension/issues/189) | S2kael | — |
| [US-33.6](../stories/US-33.6-fix-bug-display-incorrect-transferable-balance-in-the-s.md) | ✅ done | Fix bug display incorrect transferable balance in the Send Fund/Donate/XCM Transfer screen | [#303](https://github.com/Koniverse/SubWallet-Extension/issues/303) | lw-cdm | 0.4.4 |
| [US-33.7](../stories/US-33.7-fix-bug-can-not-send-fund-xcm-transfer-of-the-kintsugi.md) | ✅ done | Fix bug can not send fund/XCM transfer of the Kintsugi Chain | [#332](https://github.com/Koniverse/SubWallet-Extension/issues/332) | lw-cdm | 0.4.4 |
| [US-33.8](../stories/US-33.8-fix-bug-can-t-xcm-transfer-of-the-bifrost-chain.md) | ✅ done | Fix bug can't XCM Transfer of the Bifrost Chain | [#333](https://github.com/Koniverse/SubWallet-Extension/issues/333) | nulllpc | 0.5.6 |
| [US-33.9](../stories/US-33.9-support-sorting-the-default-token-list-in-the-send-fund.md) | ⏸️ deprecated | Support sorting the default token list in the send fund/xcm transfer screen by network, by assets that have balances | [#402](https://github.com/Koniverse/SubWallet-Extension/issues/402) | — | — |
| [US-33.10](../stories/US-33.10-update-xcm-transfer-support-for-relaychain-to-parachain.md) | ✅ done | Update XCM transfer support for Relaychain to Parachains | [#411](https://github.com/Koniverse/SubWallet-Extension/issues/411) | nulllpc | 0.5.5 |
| [US-33.11](../stories/US-33.11-support-sorting-the-default-token-list-in-the-send-fund.md) | ✅ done | Support sorting the default token list in the send fund/xcm transfer screen by network, by assets that have balances | [#418](https://github.com/Koniverse/SubWallet-Extension/issues/418) | — | — |
| [US-33.12](../stories/US-33.12-improve-ui-for-xcm-transaction-with-evm-provider.md) | ⏸️ deprecated | Improve UI for XCM transaction with EVM provider | [#462](https://github.com/Koniverse/SubWallet-Extension/issues/462) | S2kael | — |
| [US-33.13](../stories/US-33.13-update-ui-ux-for-xcm-transfer.md) | ✅ done | Update UI/UX for XCM transfer | [#486](https://github.com/Koniverse/SubWallet-Extension/issues/486) | hieudd | — |
| [US-33.14](../stories/US-33.14-xcm-transfers-for-interlay-kintsugi-moonbeam-moonriver.md) | ✅ done | XCM transfers for Interlay/Kintsugi <-> Moonbeam/Moonriver | [#526](https://github.com/Koniverse/SubWallet-Extension/issues/526) | nulllpc | — |
| [US-33.15](../stories/US-33.15-add-warning-for-xcm-transfer-feature.md) | ✅ done | Add warning for xcm transfer feature | [#528](https://github.com/Koniverse/SubWallet-Extension/issues/528) | nulllpc | — |
| [US-33.16](../stories/US-33.16-fix-support-xcm-transfer-on-kusama-polkadot-astar-shide.md) | ✅ done | Fix support Xcm transfer on Kusama, Polkadot, Astar, Shiden chain for QR Account | [#552](https://github.com/Koniverse/SubWallet-Extension/issues/552) | S2kael | 0.5.7 |
| [US-33.17](../stories/US-33.17-re-check-xcm-transfer-feature-for-astar.md) | ✅ done | Re-check XCM transfer feature for Astar | [#571](https://github.com/Koniverse/SubWallet-Extension/issues/571) | nulllpc | — |
| [US-33.18](../stories/US-33.18-fix-issue-display-lack-of-transaction-history-when-user.md) | ✅ done | Fix issue display lack of transaction history when user performs xcm transfer#586 | [#586](https://github.com/Koniverse/SubWallet-Extension/issues/586) | S2kael | 0.5.7 |
| [US-33.19](../stories/US-33.19-integrate-bit-country-token-and-xcm.md) | ✅ done | Integrate Bit.Country Token and XCM | [#621](https://github.com/Koniverse/SubWallet-Extension/issues/621) | nulllpc | 0.6.1 |
| [US-33.20](../stories/US-33.20-update-existential-deposit-for-xcm-transfer-feature-tra.md) | ✅ done | Update existential deposit for XCM transfer feature & transaction history | [#631](https://github.com/Koniverse/SubWallet-Extension/issues/631) | nulllpc | — |
| [US-33.21](../stories/US-33.21-integrate-polkaholic-api-for-xcm-transfer-history.md) | ✅ done | Integrate Polkaholic API for XCM transfer history | [#660](https://github.com/Koniverse/SubWallet-Extension/issues/660) | hieudd | — |
| [US-33.22](../stories/US-33.22-support-transfer-and-xcm-for-statemine-statemint.md) | ✅ done | Support transfer and XCM for Statemine/Statemint | [#684](https://github.com/Koniverse/SubWallet-Extension/issues/684) | nulllpc | 0.6.8 |
| [US-33.23](../stories/US-33.23-enable-xcm-transfer-for-acala-chain.md) | ✅ done | Enable xcm transfer for Acala chain | [#695](https://github.com/Koniverse/SubWallet-Extension/issues/695) | nulllpc | 0.6.7 |
| [US-33.24](../stories/US-33.24-add-support-for-xcm-transfer-between-bifrost-polkadot-a.md) | 📋 backlog | Add support for XCM transfer between Bifrost Polkadot and Moonbeam | [#855](https://github.com/Koniverse/SubWallet-Extension/issues/855) | PDTnhah | — |
| [US-33.25](../stories/US-33.25-fix-xcm-transfer-feature-for-the-some-chain.md) | ✅ done | Fix XCM transfer feature for the some chain | [#945](https://github.com/Koniverse/SubWallet-Extension/issues/945) | S2kael | 0.7.7 |
| [US-33.26](../stories/US-33.26-fix-bug-xcm-for-moonbeam-bifrost-kusama.md) | ✅ done | Fix bug XCM for Moonbeam, Bifrost Kusama | [#1000](https://github.com/Koniverse/SubWallet-Extension/issues/1000) | S2kael | 0.8.2 |
| [US-33.27](../stories/US-33.27-update-xcm-function-for-kintsugi-chain.md) | ✅ done | Update XCM function for Kintsugi chain | [#1085](https://github.com/Koniverse/SubWallet-Extension/issues/1085) | nulllpc | — |
| [US-33.28](../stories/US-33.28-add-xcm-for-kusama-statemint.md) | ✅ done | Add XCM for Kusama --> Statemint | [#1094](https://github.com/Koniverse/SubWallet-Extension/issues/1094) | nulllpc | 0.8.3 |
| [US-33.29](../stories/US-33.29-upgrade-ui-some-issues-related-to-xcm-feature.md) | ✅ done | Upgrade UI - Some issues related to XCM feature | [#1141](https://github.com/Koniverse/SubWallet-Extension/issues/1141) | nulllpc | 1.0.2 |
| [US-33.30](../stories/US-33.30-incorrect-fee-when-xcm-glmr-acala-to-moombeam.md) | ✅ done | Incorrect fee when XCM GLMR Acala to Moombeam | [#1218](https://github.com/Koniverse/SubWallet-Extension/issues/1218) | nulllpc | — |
| [US-33.31](../stories/US-33.31-support-for-transferring-xcm-for-kintsugi.md) | ⏸️ deprecated | Support for transferring xcm for Kintsugi | [#1264](https://github.com/Koniverse/SubWallet-Extension/issues/1264) | nulllpc | — |
| [US-33.32](../stories/US-33.32-add-xcm-support-between-picasso-and-statemine.md) | ⏸️ deprecated | Add XCM Support Between Picasso and Statemine | [#1302](https://github.com/Koniverse/SubWallet-Extension/issues/1302) | — | — |
| [US-33.33](../stories/US-33.33-add-support-for-usdt-on-more-chains-and-update-param-fo.md) | 🚧 in-progress | Add support for USDT on more chains and update param for XCM on Astar | [#1352](https://github.com/Koniverse/SubWallet-Extension/issues/1352) | PDTnhah | — |
| [US-33.34](../stories/US-33.34-bridge-tokens-from-octopus-network-to-near.md) | 📋 backlog | Bridge tokens from Octopus Network to Near | [#1367](https://github.com/Koniverse/SubWallet-Extension/issues/1367) | nulllpc | — |
| [US-33.35](../stories/US-33.35-integrate-bridge-asset-feature.md) | 📋 backlog | Integrate bridge asset feature | [#1378](https://github.com/Koniverse/SubWallet-Extension/issues/1378) | nulllpc | — |
| [US-33.36](../stories/US-33.36-temporarily-hide-xcm-channels-from-moonbeam.md) | ✅ done | Temporarily hide XCM channels from Moonbeam | [#1440](https://github.com/Koniverse/SubWallet-Extension/issues/1440) | S2kael | 1.0.6 |
| [US-33.37](../stories/US-33.37-add-support-new-xcm-channels.md) | ✅ done | Add support new XCM channels | [#1457](https://github.com/Koniverse/SubWallet-Extension/issues/1457) | PDTnhah | 1.3.55 |
| [US-33.38](../stories/US-33.38-fixed-bug-don-t-show-send-history-in-case-xcm-on-same-a.md) | ✅ done | Fixed bug Don’t show send history in case xcm on same account | [#1499](https://github.com/Koniverse/SubWallet-Extension/issues/1499) | S2kael | 1.0.8 |
| [US-33.39](../stories/US-33.39-fixed-bug-error-page-when-perform-xcm-on-firefox-browse.md) | ✅ done | Fixed bug error page when perform XCM on Firefox browser | [#1505](https://github.com/Koniverse/SubWallet-Extension/issues/1505) | S2kael | 1.0.8 |
| [US-33.40](../stories/US-33.40-re-check-and-update-xcm-feature-for-some-chains-polkado.md) | ✅ done | Re-check and update XCM feature for some chains: Polkadot, Statemint, Statemine, Bifrost Polkadot | [#1546](https://github.com/Koniverse/SubWallet-Extension/issues/1546) | nulllpc | 1.0.10 |
| [US-33.41](../stories/US-33.41-fixed-bug-show-incorrect-destination-chain-fee-on-xcm-h.md) | ✅ done | Fixed bug Show incorrect Destination Chain fee on XCM history detail | [#1550](https://github.com/Koniverse/SubWallet-Extension/issues/1550) | saltict | 1.0.10 |
| [US-33.42](../stories/US-33.42-check-the-flags-attribute-in-the-balance-of-polkadot-co.md) | ✅ done | Check the Flags attribute in the balance of Polkadot Collectives, Kusama Bridge Hub | [#1567](https://github.com/Koniverse/SubWallet-Extension/issues/1567) | nulllpc | — |
| [US-33.43](../stories/US-33.43-update-xcm-for-astar-interlay-hydradx.md) | ✅ done | Update XCM for Astar, Interlay, HydraDX | [#1579](https://github.com/Koniverse/SubWallet-Extension/issues/1579) | S2kael | 1.1.1 |
| [US-33.44](../stories/US-33.44-recheck-xcm-weekly.md) | ✅ done | Recheck XCM Weekly | [#1598](https://github.com/Koniverse/SubWallet-Extension/issues/1598) | nulllpc | — |
| [US-33.45](../stories/US-33.45-support-snowbridge.md) | ✅ done | Support SnowBridge | [#1984](https://github.com/Koniverse/SubWallet-Extension/issues/1984) | nulllpc | 1.2.9 |
| [US-33.46](../stories/US-33.46-fixed-bug-xcm-transfer-usdt-parallel-statemint.md) | ✅ done | Fixed bug XCM transfer USDT (Parallel —> Statemint) | [#2091](https://github.com/Koniverse/SubWallet-Extension/issues/2091) | S2kael | 1.1.20 |
| [US-33.47](../stories/US-33.47-recheck-xcm-problems-on-kusama.md) | ✅ done | Recheck XCM problems on Kusama | [#2171](https://github.com/Koniverse/SubWallet-Extension/issues/2171) | nulllpc | — |
| [US-33.48](../stories/US-33.48-update-xcm-for-astar-network.md) | ✅ done | Update XCM for Astar network | [#2196](https://github.com/Koniverse/SubWallet-Extension/issues/2196) | S2kael | 1.1.23 |
| [US-33.49](../stories/US-33.49-add-support-some-xcm-dot-channels.md) | ✅ done | Add support some XCM DOT channels | [#2233](https://github.com/Koniverse/SubWallet-Extension/issues/2233) | nulllpc | 1.1.26 |
| [US-33.50](../stories/US-33.50-support-some-xcm-transfer.md) | ✅ done | Support some XCM transfer | [#2353](https://github.com/Koniverse/SubWallet-Extension/issues/2353) | S2kael | 1.1.26 |
| [US-33.51](../stories/US-33.51-webapp-update-rpc-and-xcm-channels-online.md) | ✅ done | WebApp - Update RPC and XCM channels online | [#2523](https://github.com/Koniverse/SubWallet-Extension/issues/2523) | saltict | — |
| [US-33.52](../stories/US-33.52-check-xcm-channels.md) | ✅ done | Check XCM channels | [#2579](https://github.com/Koniverse/SubWallet-Extension/issues/2579) | nulllpc | — |
| [US-33.53](../stories/US-33.53-update-xcm-channel-online.md) | ✅ done | Update XCM channel online | [#2583](https://github.com/Koniverse/SubWallet-Extension/issues/2583) | nulllpc | — |
| [US-33.54](../stories/US-33.54-support-rococo-asset-hub.md) | ✅ done | Support Rococo asset hub | [#2604](https://github.com/Koniverse/SubWallet-Extension/issues/2604) | bluezdot | 1.1.41 |
| [US-33.55](../stories/US-33.55-fix-bug-not-updating-blocked-xcm-channels.md) | ✅ done | Fix bug not updating blocked XCM channels | [#2717](https://github.com/Koniverse/SubWallet-Extension/issues/2717) | nulllpc | 1.1.43 |
| [US-33.56](../stories/US-33.56-add-support-xcm-for-pink-token.md) | ✅ done | Add support XCM for PINK token | [#2786](https://github.com/Koniverse/SubWallet-Extension/issues/2786) | bluezdot | 1.1.47 |
| [US-33.57](../stories/US-33.57-handle-xcm-delivery-fee.md) | ⏸️ deprecated | Handle XCM delivery fee | [#2792](https://github.com/Koniverse/SubWallet-Extension/issues/2792) | — | — |
| [US-33.58](../stories/US-33.58-fixed-bug-when-performing-xcm-transfer-on-kusama.md) | ✅ done | Fixed bug when performing XCM transfer on Kusama | [#2814](https://github.com/Koniverse/SubWallet-Extension/issues/2814) | S2kael | 1.1.49 |
| [US-33.59](../stories/US-33.59-add-support-xcm-channels-for-ded.md) | ⏸️ deprecated | Add support XCM channels for DED | [#2831](https://github.com/Koniverse/SubWallet-Extension/issues/2831) | nulllpc | — |
| [US-33.60](../stories/US-33.60-support-xcm-for-pendulum.md) | ✅ done | Support XCM for Pendulum | [#3071](https://github.com/Koniverse/SubWallet-Extension/issues/3071) | nulllpc | — |
| [US-33.61](../stories/US-33.61-support-more-xcm-channels.md) | ✅ done | Support more XCM channels | [#3134](https://github.com/Koniverse/SubWallet-Extension/issues/3134) | nulllpc | 1.2.4 |
| [US-33.62](../stories/US-33.62-webapp-update-validate-for-popup-warning-cross-chain-pa.md) | ✅ done | WebApp - Update validate for popup warning cross-chain PAH --> KAH | [#3216](https://github.com/Koniverse/SubWallet-Extension/issues/3216) | frenkie-ng | 1.2.14 |
| [US-33.63](../stories/US-33.63-fix-bug-not-showing-popup-swap-confirmation-when-swap-w.md) | ✅ done | Fix bug not showing popup Swap confirmation when swap with Injected account | [#3230](https://github.com/Koniverse/SubWallet-Extension/issues/3230) | frenkie-ng | 1.2.12 |
| [US-33.64](../stories/US-33.64-xcm-version-error-on-pioneer.md) | ⏸️ deprecated | XCM version error on Pioneer | [#3252](https://github.com/Koniverse/SubWallet-Extension/issues/3252) | bluezdot | — |
| [US-33.65](../stories/US-33.65-improve-experience-when-users-wait-to-receive-tokens-af.md) | 📋 backlog | Improve experience when users wait to receive tokens after XCM | [#3288](https://github.com/Koniverse/SubWallet-Extension/issues/3288) | bluezdot | — |
| [US-33.66](../stories/US-33.66-extension-support-xcm-for-mythos.md) | ✅ done | Extension - Support XCM for Mythos | [#3389](https://github.com/Koniverse/SubWallet-Extension/issues/3389) | nulllpc | 1.2.24 |
| [US-33.67](../stories/US-33.67-implement-snowbridge-sdk-to-prevent-asset-loss.md) | ⏸️ deprecated | Implement SnowBridge sdk to prevent asset loss | [#3416](https://github.com/Koniverse/SubWallet-Extension/issues/3416) | S2kael | — |
| [US-33.68](../stories/US-33.68-extension-update-xcm-to-v4.md) | ✅ done | Extension - Update XCM to V4 | [#3474](https://github.com/Koniverse/SubWallet-Extension/issues/3474) | bluezdot | — |
| [US-33.69](../stories/US-33.69-support-snowbridge-transfer-from-ethereum-mythos-for-my.md) | ✅ done | Support Snowbridge transfer from Ethereum -> Mythos for MYTH | [#3502](https://github.com/Koniverse/SubWallet-Extension/issues/3502) | bluezdot | — |
| [US-33.70](../stories/US-33.70-fix-bug-xcm.md) | ✅ done | Fix bug XCM | [#3519](https://github.com/Koniverse/SubWallet-Extension/issues/3519) | bluezdot | 1.2.28 |
| [US-33.71](../stories/US-33.71-fix-bug-xcm-for-channel-dot-kah-pah.md) | ✅ done | Fix bug XCM for channel: DOT: KAH -> PAH | [#3561](https://github.com/Koniverse/SubWallet-Extension/issues/3561) | bluezdot | 1.2.29 |
| [US-33.72](../stories/US-33.72-fixed-bug-xcm-usdt-pah-astr.md) | ✅ done | Fixed bug XCM USDT: PAH -> ASTR | [#3606](https://github.com/Koniverse/SubWallet-Extension/issues/3606) | bluezdot | 1.3.31 |
| [US-33.73](../stories/US-33.73-integrate-xcm-extrinsic-dry-run-api.md) | ✅ done | Integrate XCM/extrinsic dry run API | [#3615](https://github.com/Koniverse/SubWallet-Extension/issues/3615) | bluezdot | 1.3.31 |
| [US-33.74](../stories/US-33.74-re-calculate-max-transferable-for-xcm-native-token.md) | ✅ done | Re-calculate max transferable for XCM native token | [#3617](https://github.com/Koniverse/SubWallet-Extension/issues/3617) | nulllpc | 1.2.30 |
| [US-33.75](../stories/US-33.75-fixed-bug-xcm-for-acala.md) | ✅ done | Fixed bug XCM for Acala | [#3725](https://github.com/Koniverse/SubWallet-Extension/issues/3725) | bluezdot | 1.3.31 |
| [US-33.76](../stories/US-33.76-extension-re-check-transfer-max-for-evm-account-when-xc.md) | ✅ done | Extension - Re-check Transfer Max for EVM account when XCM transfer | [#3876](https://github.com/Koniverse/SubWallet-Extension/issues/3876) | tunghp2002 | 1.3.8 |
| [US-33.77](../stories/US-33.77-add-validate-sufficient-token-for-xcm-transfer.md) | ✅ done | Add validate sufficient token for XCM transfer | [#3895](https://github.com/Koniverse/SubWallet-Extension/issues/3895) | S2kael | 1.3.29 |
| [US-33.78](../stories/US-33.78-fixed-bug-cannot-read-properties-of-undefined-when-perf.md) | ✅ done | Fixed bug Cannot read properties of undefined when performing XCM for Moonbeam | [#3903](https://github.com/Koniverse/SubWallet-Extension/issues/3903) | bluezdot | 1.3.31 |
| [US-33.79](../stories/US-33.79-fix-max-transferable-for-avail-bridge.md) | ✅ done | Fix max transferable for Avail Bridge | [#3911](https://github.com/Koniverse/SubWallet-Extension/issues/3911) | bluezdot | 1.3.12 |
| [US-33.80](../stories/US-33.80-support-across-bridge.md) | ✅ done | Support Across bridge | [#3918](https://github.com/Koniverse/SubWallet-Extension/issues/3918), [#4299](https://github.com/Koniverse/SubWallet-Extension/issues/4299) | tunghp2002 | 1.3.31 |
| [US-33.81](../stories/US-33.81-avail-space-support-avail-bridge-for-avail-space.md) | ✅ done | Avail Space - Support Avail bridge for Avail Space | [#3944](https://github.com/Koniverse/SubWallet-Extension/issues/3944) | lw-cdm | — |
| [US-33.82](../stories/US-33.82-extension-add-option-transfer-max-when-bridge-weth-poly.md) | 📋 backlog | Extension - Add option transfer Max when bridge WETH: Polygon -> Ethereum | [#3973](https://github.com/Koniverse/SubWallet-Extension/issues/3973) | — | — |
| [US-33.83](../stories/US-33.83-estimate-delivery-fee-when-xcm.md) | ✅ done | Estimate delivery fee when XCM | [#4133](https://github.com/Koniverse/SubWallet-Extension/issues/4133) | nulllpc | 1.3.31 |
| [US-33.84](../stories/US-33.84-dry-run-xcm.md) | ✅ done | Dry run XCM | [#4134](https://github.com/Koniverse/SubWallet-Extension/issues/4134) | nulllpc | 1.3.31 |
| [US-33.85](../stories/US-33.85-review-and-add-more-xcm-channels.md) | 🚧 in-progress | Review and add more XCM Channels | [#4157](https://github.com/Koniverse/SubWallet-Extension/issues/4157) | saltict | — |
| [US-33.86](../stories/US-33.86-support-bridge-without-xcm.md) | 🚧 in-progress | Support bridge without XCM | [#4188](https://github.com/Koniverse/SubWallet-Extension/issues/4188) | — | — |
| [US-33.87](../stories/US-33.87-support-exporting-creating-files-to-manage-xcm-pairs.md) | ✅ done | Support exporting/creating files to manage XCM pairs | [#4208](https://github.com/Koniverse/SubWallet-Extension/issues/4208) | PDTnhah | — |
| [US-33.88](../stories/US-33.88-subwallet-add-some-across-bridge-channels.md) | ✅ done | SubWallet - Add some Across bridge channels | [#4229](https://github.com/Koniverse/SubWallet-Extension/issues/4229) | PDTnhah | — |
| [US-33.89](../stories/US-33.89-improve-validate-recipient-when-make-xcm-transfer.md) | ✅ done | Improve validate recipient when make XCM transfer | [#4233](https://github.com/Koniverse/SubWallet-Extension/issues/4233) | PDTnhah | 1.3.31 |
| [US-33.90](../stories/US-33.90-extension-support-bridge-step-from-evm-address-to-subst.md) | ✅ done | Extension - Support bridge step from EVM address to Substrate | [#4267](https://github.com/Koniverse/SubWallet-Extension/issues/4267) | bluezdot | 1.3.79 |
| [US-33.91](../stories/US-33.91-extension-support-display-destination-fee-for-transfer.md) | ✅ done | Extension - Support display destination fee for transfer XCM | [#4278](https://github.com/Koniverse/SubWallet-Extension/issues/4278) | Thiendekaco | 1.3.78 |
| [US-33.92](../stories/US-33.92-refactor-across-bridge.md) | ✅ done | Refactor Across bridge | [#4282](https://github.com/Koniverse/SubWallet-Extension/issues/4282) | tunghp2002 | 1.3.35 |
| [US-33.93](../stories/US-33.93-improve-estimate-fee-through-across-bridge.md) | ✅ done | Improve estimate fee through Across Bridge | [#4310](https://github.com/Koniverse/SubWallet-Extension/issues/4310) | tunghp2002 | 1.3.65 |
| [US-33.94](../stories/US-33.94-extension-some-improvements-for-cross-chain-swaps-on-th.md) | ✅ done | Extension - Some improvements for cross-chain swaps on the EVM network | [#4315](https://github.com/Koniverse/SubWallet-Extension/issues/4315) | bluezdot | — |
| [US-33.95](../stories/US-33.95-making-sure-teleports-don-t-fail.md) | ✅ done | Making sure teleports don't fail | [#4387](https://github.com/Koniverse/SubWallet-Extension/issues/4387) | S2kael | 1.3.31 |
| [US-33.96](../stories/US-33.96-extension-improve-xcm-feature.md) | 📋 backlog | Extension - Improve XCM feature | [#4392](https://github.com/Koniverse/SubWallet-Extension/issues/4392) | bluezdot | — |
| [US-33.97](../stories/US-33.97-fixed-bug-unable-to-xcm-polkadot-asset-hub-kusama-asset.md) | ✅ done | Fixed bug Unable to XCM Polkadot Asset Hub -> Kusama Asset Hub | [#4416](https://github.com/Koniverse/SubWallet-Extension/issues/4416) | bluezdot | 1.3.41 |
| [US-33.98](../stories/US-33.98-remove-myth-pah-ethereum.md) | ✅ done | Remove MYTH (PAH -> Ethereum) | [#4444](https://github.com/Koniverse/SubWallet-Extension/issues/4444) | PDTnhah | 1.3.55 |
| [US-33.99](../stories/US-33.99-bug-prevent-bug-transfer-cross-chain-due-to-asset-hub-m.md) | ⏸️ deprecated | [Bug] Prevent bug transfer cross-chain due to Asset Hub Migration | [#4632](https://github.com/Koniverse/SubWallet-Extension/issues/4632) | bluezdot | — |
| [US-33.100](../stories/US-33.100-validate-xcm-amount-before-transfer-with-min-and-max.md) | ✅ done | Validate XCM amount before transfer with min and max | [#4676](https://github.com/Koniverse/SubWallet-Extension/issues/4676) | PDTnhah | — |
| [US-33.101](../stories/US-33.101-update-params-for-xcm-transfer-related-to-dot-ksm-xcm.md) | ✅ done | Update params for XCM transfer - Related to DOT/KSM XCM | [#4787](https://github.com/Koniverse/SubWallet-Extension/issues/4787) | bluezdot | 1.3.63 |
| [US-33.102](../stories/US-33.102-re-enable-cross-chain-transfer-related-to-relay-chain.md) | ✅ done | Re-enable Cross-chain transfer related to Relay-chain | [#4822](https://github.com/Koniverse/SubWallet-Extension/issues/4822) | bluezdot | 1.3.66 |
| [US-33.103](../stories/US-33.103-re-check-logic-approve-token-when-perform-xcm.md) | ✅ done | Re-check logic approve token when perform XCM | [#4830](https://github.com/Koniverse/SubWallet-Extension/issues/4830) | PDTnhah | 1.3.80 |
| [US-33.104](../stories/US-33.104-webapp-update-params-for-xcm-transfer-related-to-dot-ks.md) | ✅ done | WebApp - Update params for XCM transfer (Related to DOT/KSM XCM) | [#4836](https://github.com/Koniverse/SubWallet-Extension/issues/4836) | Thiendekaco | — |
| [US-33.105](../stories/US-33.105-bridge-native-tao-subtensor-evm.md) | ✅ done | Bridge native TAO <-> Subtensor EVM | [#4901](https://github.com/Koniverse/SubWallet-Extension/issues/4901) | tunghp2002 | 1.3.78 |

## Acceptance criteria

- [ ] **AC-1** — Every XCM & Bridge issue with no FR story has exactly one story here; its status matches the tracker (done = COMPLETED **and shipped**, backlog = open, deprecated = not-planned/duplicate **or closed-`completed` on GitHub but resolved by deprecation — feature/channel retired, fix unshipped, e.g. [US-33.64](../stories/US-33.64-xcm-version-error-on-pioneer.md)**).
- [x] **AC-2** — `npx koni-docs validate` and `node scripts/koni-docs-check-ids.mjs` exit 0.
