---
id: US-4.28
title: "Chains, tokens & data recovered from Uncategorized"
epic: EPIC-4
status: done
priority: P3
points: 5
sprint:
version_shipped: 1.3.61
prd_ref: []
arch_ref:
depends_on:
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

The chain integrations, token additions, chain-list release train and data-indexer work (Subscan / SubQuery / SubSquid / explorers / logos) that the triage bucket held — all network & token maintenance the generator could not read from a bare chain name.

## Status

> **✅ done — all 130 rows below are settled**: 119 delivered, 11 closed without shipping. Recovered from the former **Uncategorized** maintenance ledger (the triage bucket) on 2026-07-24 and homed here, where they belong. `version_shipped: 1.3.61` is a representative anchor.

## Scope

Folded in from the former **Uncategorized** (triage) maintenance ledger on 2026-07-24, whose issues the
generator could not classify by title. This story is where the chain / token / chain-list / data-indexer issues landed once read.
It materializes **no FR**.

## Incremental work, fixes & chores

**130 tracker issues** — 97 with a release, 22 delivered with no line naming them, 11 closed without shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.1 | [#50](https://github.com/Koniverse/SubWallet-Extension/issues/50) | Some bugs with AlephZero | ✅ done |
| 0.3.1 | [#101](https://github.com/Koniverse/SubWallet-Extension/issues/101) | Adding Phala, Oak, Dolphin, Mangata X to the extension | ✅ done |
| 0.3.1 | [#125](https://github.com/Koniverse/SubWallet-Extension/issues/125) | Update Polkadex Paraid | ✅ done |
| 0.4.7 | [#361](https://github.com/Koniverse/SubWallet-Extension/issues/361) | Update Darwinia & Darwinia Crab | ✅ done |
| 0.4.9 | [#392](https://github.com/Koniverse/SubWallet-Extension/issues/392) | Bug report from Moonbeam team | ✅ done |
| 0.5.3 | [#417](https://github.com/Koniverse/SubWallet-Extension/issues/417) | Add taiKSM and 3USD on Karura and tDOT on Acala | ✅ done |
| 0.5.6 | [#450](https://github.com/Koniverse/SubWallet-Extension/issues/450) | Add support for DOT on Astar Native and on Astar EVM | ✅ done |
| 0.5.6 | [#553](https://github.com/Koniverse/SubWallet-Extension/issues/553) | Add Suspace testnets into SubWallet | ✅ done |
| 0.6.1 | [#628](https://github.com/Koniverse/SubWallet-Extension/issues/628) | Update default provider for Subspace Gemini 1 | ✅ done |
| 0.6.4 | [#704](https://github.com/Koniverse/SubWallet-Extension/issues/704) | Remove Subspace testnet | ✅ done |
| 0.6.7 | [#426](https://github.com/Koniverse/SubWallet-Extension/issues/426) | Add other EVM chains | ✅ done |
| 0.6.7 | [#679](https://github.com/Koniverse/SubWallet-Extension/issues/679) | Add USDT on Polkadot | ✅ done |
| 0.6.9 | [#783](https://github.com/Koniverse/SubWallet-Extension/issues/783) | Error while try to subscribe event data with ETH, BNB or another https provider | ✅ done |
| 0.7.1 | [#794](https://github.com/Koniverse/SubWallet-Extension/issues/794) | Bug parsing IPFS link | ✅ done |
| 0.7.2 | [#815](https://github.com/Koniverse/SubWallet-Extension/issues/815) | Migrate to new SubSquid API | ✅ done |
| 0.7.4 | [#875](https://github.com/Koniverse/SubWallet-Extension/issues/875) | Add Subspace Gemini 3 Testnet | ✅ done |
| 0.7.9 | [#983](https://github.com/Koniverse/SubWallet-Extension/issues/983) | Add the coingecko key for Nodle | ✅ done |
| 0.8.2 | [#1077](https://github.com/Koniverse/SubWallet-Extension/issues/1077) | Add support Gemini 3c testnet | ✅ done |
| 0.8.3 | [#1089](https://github.com/Koniverse/SubWallet-Extension/issues/1089) | Update explorer for Gemini 3c, 2a | ✅ done |
| 0.8.4 | [#1117](https://github.com/Koniverse/SubWallet-Extension/issues/1117) | Update Azero block explorer | ✅ done |
| 1.0.2 | [#1282](https://github.com/Koniverse/SubWallet-Extension/issues/1282) | Update some new logos | ✅ done |
| 1.0.5 | [#1307](https://github.com/Koniverse/SubWallet-Extension/issues/1307) | Add more search criteria | ✅ done |
| 1.0.11 | [#1556](https://github.com/Koniverse/SubWallet-Extension/issues/1556) | Update chainlist | ✅ done |
| 1.0.12 | [#1576](https://github.com/Koniverse/SubWallet-Extension/issues/1576) | Update chainlist (w26) | ✅ done |
| 1.1.1 | [#1590](https://github.com/Koniverse/SubWallet-Extension/issues/1590) | Update chainlist (w27) | ✅ done |
| 1.1.3 | [#1661](https://github.com/Koniverse/SubWallet-Extension/issues/1661) | Update chainlist (w29) | ✅ done |
| 1.1.5 | [#1708](https://github.com/Koniverse/SubWallet-Extension/issues/1708) | Update chainlist (w30) | ✅ done |
| 1.1.10 | [#1839](https://github.com/Koniverse/SubWallet-Extension/issues/1839) | Update chainlist (w34) | ✅ done |
| 1.1.15 | [#1941](https://github.com/Koniverse/SubWallet-Extension/issues/1941) | Update chainlist (w38-39) | ✅ done |
| 1.1.17 | [#1998](https://github.com/Koniverse/SubWallet-Extension/issues/1998) | Update chainlist (w41) | ✅ done |
| 1.1.19 | [#2033](https://github.com/Koniverse/SubWallet-Extension/issues/2033) | Update chainlist (w43) | ✅ done |
| 1.1.20 | [#2105](https://github.com/Koniverse/SubWallet-Extension/issues/2105) | Update chainlist (w44) | ✅ done |
| 1.1.21 | [#2145](https://github.com/Koniverse/SubWallet-Extension/issues/2145) | Update chainlist (w45) | ✅ done |
| 1.1.22 | [#2178](https://github.com/Koniverse/SubWallet-Extension/issues/2178) | Update chainlist (w46) | ✅ done |
| 1.1.30 | [#2447](https://github.com/Koniverse/SubWallet-Extension/issues/2447) | Update Chainlist | ✅ done |
| 1.1.31 | [#2465](https://github.com/Koniverse/SubWallet-Extension/issues/2465) | Update chainlist | ✅ done |
| 1.1.32 | [#2489](https://github.com/Koniverse/SubWallet-Extension/issues/2489) | Update chainlist | ✅ done |
| 1.1.33 | [#2508](https://github.com/Koniverse/SubWallet-Extension/issues/2508) | Update chainlist | ✅ done |
| 1.1.36 | [#2586](https://github.com/Koniverse/SubWallet-Extension/issues/2586) | Update Chainlist | ✅ done |
| 1.1.38 | [#2570](https://github.com/Koniverse/SubWallet-Extension/issues/2570) | Update chainlist | ✅ done |
| 1.1.41 | [#2658](https://github.com/Koniverse/SubWallet-Extension/issues/2658) | Update Chainlist | ✅ done |
| 1.1.42 | [#2698](https://github.com/Koniverse/SubWallet-Extension/issues/2698) | Update chainlist 0.2.43 | ✅ done |
| 1.1.44 | [#2694](https://github.com/Koniverse/SubWallet-Extension/issues/2694) | Update chainlist | ✅ done |
| 1.1.44 | [#2731](https://github.com/Koniverse/SubWallet-Extension/issues/2731) | Update Subscan Service | ✅ done |
| 1.1.45 | [#2767](https://github.com/Koniverse/SubWallet-Extension/issues/2767) | Update explorer for Avail testnet | ✅ done |
| 1.1.56 | [#2931](https://github.com/Koniverse/SubWallet-Extension/issues/2931) | Update chainlist | ✅ done |
| 1.1.61 | [#2993](https://github.com/Koniverse/SubWallet-Extension/issues/2993) | Support Avail mainnet | ✅ done |
| 1.1.64 | [#2882](https://github.com/Koniverse/SubWallet-Extension/issues/2882) | [Extension] Re check function `enableChains` | ✅ done |
| 1.1.64 | [#2968](https://github.com/Koniverse/SubWallet-Extension/issues/2968) | Update chainlist | ✅ done |
| 1.1.65 | [#3040](https://github.com/Koniverse/SubWallet-Extension/issues/3040) | Update chainlist | ✅ done |
| 1.1.66 | [#3055](https://github.com/Koniverse/SubWallet-Extension/issues/3055) | Update chainlist | ✅ done |
| 1.1.66 | [#3085](https://github.com/Koniverse/SubWallet-Extension/issues/3085) | Update new chainlist interface | ✅ done |
| 1.1.68 | [#3088](https://github.com/Koniverse/SubWallet-Extension/issues/3088) | Update chainlist | ✅ done |
| 1.2.3 | [#3094](https://github.com/Koniverse/SubWallet-Extension/issues/3094) | Update chainlist | ✅ done |
| 1.2.4 | [#3161](https://github.com/Koniverse/SubWallet-Extension/issues/3161) | Update chainlist | ✅ done |
| 1.2.6 | [#3185](https://github.com/Koniverse/SubWallet-Extension/issues/3185) | Update chainlist | ✅ done |
| 1.2.9 | [#3214](https://github.com/Koniverse/SubWallet-Extension/issues/3214) | Update chainlist | ✅ done |
| 1.2.14 | [#3227](https://github.com/Koniverse/SubWallet-Extension/issues/3227) | WebApp - Remove Interlay lending | ✅ done |
| 1.2.14 | [#3229](https://github.com/Koniverse/SubWallet-Extension/issues/3229) | Update chainlist | ✅ done |
| 1.2.15 | [#3170](https://github.com/Koniverse/SubWallet-Extension/issues/3170) | Update chainlist health-check script | ✅ done |
| 1.2.18 | [#3369](https://github.com/Koniverse/SubWallet-Extension/issues/3369) | Update chainlist for Avail | ✅ done |
| 1.2.21 | [#3378](https://github.com/Koniverse/SubWallet-Extension/issues/3378) | Fix a few bugs for Avail | ✅ done |
| 1.2.22 | [#3385](https://github.com/Koniverse/SubWallet-Extension/issues/3385) | Update chainlist | ✅ done |
| 1.2.23 | [#3403](https://github.com/Koniverse/SubWallet-Extension/issues/3403) | Update chainlist | ✅ done |
| 1.2.24 | [#3157](https://github.com/Koniverse/SubWallet-Extension/issues/3157) | Update chainlist | ✅ done |
| 1.2.24 | [#3425](https://github.com/Koniverse/SubWallet-Extension/issues/3425) | Update chainlist | ✅ done |
| 1.2.27 | [#3478](https://github.com/Koniverse/SubWallet-Extension/issues/3478) | Update chainlist | ✅ done |
| 1.2.28 | [#3518](https://github.com/Koniverse/SubWallet-Extension/issues/3518) | Update chainlist | ✅ done |
| 1.2.29 | [#3558](https://github.com/Koniverse/SubWallet-Extension/issues/3558) | Update chainlist | ✅ done |
| 1.2.30 | [#3637](https://github.com/Koniverse/SubWallet-Extension/issues/3637) | Update chainlist | ✅ done |
| 1.2.31 | [#3680](https://github.com/Koniverse/SubWallet-Extension/issues/3680) | Update chainlist | ✅ done |
| 1.3.1 | [#3450](https://github.com/Koniverse/SubWallet-Extension/issues/3450) | Update chainlist | ✅ done |
| 1.3.2 | [#3760](https://github.com/Koniverse/SubWallet-Extension/issues/3760) | Update chainlist | ✅ done |
| 1.3.3 | [#3794](https://github.com/Koniverse/SubWallet-Extension/issues/3794) | Update chainlist | ✅ done |
| 1.3.4 | [#3806](https://github.com/Koniverse/SubWallet-Extension/issues/3806) | Update chainlist | ✅ done |
| 1.3.5 | [#3815](https://github.com/Koniverse/SubWallet-Extension/issues/3815) | Update chainlist | ✅ done |
| 1.3.6 | [#3828](https://github.com/Koniverse/SubWallet-Extension/issues/3828) | Update chainlist | ✅ done |
| 1.3.7 | [#3846](https://github.com/Koniverse/SubWallet-Extension/issues/3846) | Update chainlist | ✅ done |
| 1.3.12 | [#3897](https://github.com/Koniverse/SubWallet-Extension/issues/3897) | Update chainlist stable version | ✅ done |
| 1.3.14 | [#3974](https://github.com/Koniverse/SubWallet-Extension/issues/3974) | Update chainlist stable v0.2.98 | ✅ done |
| 1.3.21 | [#4007](https://github.com/Koniverse/SubWallet-Extension/issues/4007) | Extension - Update chainlist stable v0.2.99 | ✅ done |
| 1.3.27 | [#4058](https://github.com/Koniverse/SubWallet-Extension/issues/4058) | Extension - Update chainlist stable Version 0.2.102 | ✅ done |
| 1.3.30 | [#4195](https://github.com/Koniverse/SubWallet-Extension/issues/4195) | Extension - Cannot read properties of undefined (reading 'destinationTokenInfo') | ✅ done |
| 1.3.31 | [#4163](https://github.com/Koniverse/SubWallet-Extension/issues/4163) | Update chainlist stable v0.2.103 | ✅ done |
| 1.3.32 | [#4100](https://github.com/Koniverse/SubWallet-Extension/issues/4100) | Support CIP-30 on Cardano | ✅ done |
| 1.3.38 | [#4352](https://github.com/Koniverse/SubWallet-Extension/issues/4352) | Check CIP-30 Feedback from Cardano Foundation | ✅ done |
| 1.3.40 | [#4273](https://github.com/Koniverse/SubWallet-Extension/issues/4273) | Extension - Update chainlist stable v0.2.105 | ✅ done |
| 1.3.42 | [#4410](https://github.com/Koniverse/SubWallet-Extension/issues/4410) | Extension - Update chainlist stable v0.2.107 | ✅ done |
| 1.3.48 | [#4521](https://github.com/Koniverse/SubWallet-Extension/issues/4521) | Extension - Update chainlist stable v0.2.110 | ✅ done |
| 1.3.52 | [#4546](https://github.com/Koniverse/SubWallet-Extension/issues/4546) | Extension - Update chainlist stable v0.2.111 | ✅ done |
| 1.3.55 | [#4616](https://github.com/Koniverse/SubWallet-Extension/issues/4616) | Extension - Update chainlist stable v0.2.113 | ✅ done |
| 1.3.56 | [#4651](https://github.com/Koniverse/SubWallet-Extension/issues/4651) | Extension - Update chainlist stable v0.2.114 | ✅ done |
| 1.3.58 | [#4668](https://github.com/Koniverse/SubWallet-Extension/issues/4668) | Extension - Update chainlist stable v0.2.115 | ✅ done |
| 1.3.59 | [#4692](https://github.com/Koniverse/SubWallet-Extension/issues/4692) | Support HOLLAR mainnet | ✅ done |
| 1.3.59 | [#4704](https://github.com/Koniverse/SubWallet-Extension/issues/4704) | Extension - Update chainlist stable v0.2.116 | ✅ done |
| 1.3.60 | [#4693](https://github.com/Koniverse/SubWallet-Extension/issues/4693) | Extension - Update chainlist stale v0.2.117 | ✅ done |
| 1.3.61 | [#4507](https://github.com/Koniverse/SubWallet-Extension/issues/4507) | Extension - Re-check for Paseo after migrated | ✅ done |
| — | [#214](https://github.com/Koniverse/SubWallet-Extension/issues/214) | Get Data subtoken from Subquery: | ⏸ deprecated |
| — | [#451](https://github.com/Koniverse/SubWallet-Extension/issues/451) | USDC does not show on Moonbeam | ✅ done |
| — | [#452](https://github.com/Koniverse/SubWallet-Extension/issues/452) | MoonFit support | ✅ done |
| — | [#534](https://github.com/Koniverse/SubWallet-Extension/issues/534) | Non-Evm | ✅ done |
| — | [#610](https://github.com/Koniverse/SubWallet-Extension/issues/610) | Add Gemini Stress Test | ✅ done |
| — | [#674](https://github.com/Koniverse/SubWallet-Extension/issues/674) | Documenting queries from SubSquid for update | ✅ done |
| — | [#680](https://github.com/Koniverse/SubWallet-Extension/issues/680) | Convert Subquery API to Subsquid API | ✅ done |
| — | [#748](https://github.com/Koniverse/SubWallet-Extension/issues/748) | Support query with SubScan | ✅ done |
| — | [#868](https://github.com/Koniverse/SubWallet-Extension/issues/868) | Summarize the list of data requirement from Subsquid | ✅ done |
| — | [#1131](https://github.com/Koniverse/SubWallet-Extension/issues/1131) | Update handling ink! 4.0 for Astar related chains | ✅ done |
| — | [#1255](https://github.com/Koniverse/SubWallet-Extension/issues/1255) | Add Gemini3d - Subspace testnet | ✅ done |
| — | [#1315](https://github.com/Koniverse/SubWallet-Extension/issues/1315) | Support Subspace Gemini 3d on version 0.8.x | ✅ done |
| — | [#1614](https://github.com/Koniverse/SubWallet-Extension/issues/1614) | Update chainlist (w28) | ⏸ deprecated |
| — | [#1722](https://github.com/Koniverse/SubWallet-Extension/issues/1722) | Update chainlist (w31) | ⏸ deprecated |
| — | [#2278](https://github.com/Koniverse/SubWallet-Extension/issues/2278) | Simple chainlist report | ✅ done |
| — | [#2884](https://github.com/Koniverse/SubWallet-Extension/issues/2884) | Extension - Handle bug provider undefined | ⏸ deprecated |
| — | [#3335](https://github.com/Koniverse/SubWallet-Extension/issues/3335) | Add KOL / Kolkadot | ✅ done |
| — | [#3790](https://github.com/Koniverse/SubWallet-Extension/issues/3790) | Research Cardano | ✅ done |
| — | [#3827](https://github.com/Koniverse/SubWallet-Extension/issues/3827) | Update chainlist | ⏸ deprecated |
| — | [#3869](https://github.com/Koniverse/SubWallet-Extension/issues/3869) | Update chainlist | ✅ done |
| — | [#3879](https://github.com/Koniverse/SubWallet-Extension/issues/3879) | Extension - Update chainlist | ✅ done |
| — | [#3883](https://github.com/Koniverse/SubWallet-Extension/issues/3883) | Update chainlist | ✅ done |
| — | [#3909](https://github.com/Koniverse/SubWallet-Extension/issues/3909) | Update chainlist | ✅ done |
| — | [#3921](https://github.com/Koniverse/SubWallet-Extension/issues/3921) | Fix 405 error for TON api | ✅ done |
| — | [#3941](https://github.com/Koniverse/SubWallet-Extension/issues/3941) | Patch chainlist | ⏸ deprecated |
| — | [#3985](https://github.com/Koniverse/SubWallet-Extension/issues/3985) | WebApp - Some update Chainlist for WebApp | ✅ done |
| — | [#3995](https://github.com/Koniverse/SubWallet-Extension/issues/3995) | Update chainlist stable | ⏸ deprecated |
| — | [#4003](https://github.com/Koniverse/SubWallet-Extension/issues/4003) | Bug related to update chainlist and patch | ⏸ deprecated |
| — | [#4012](https://github.com/Koniverse/SubWallet-Extension/issues/4012) | Update chainlist | ⏸ deprecated |
| — | [#4112](https://github.com/Koniverse/SubWallet-Extension/issues/4112) | Research Bitcoin Indexer | ✅ done |
| — | [#4518](https://github.com/Koniverse/SubWallet-Extension/issues/4518) | Support for PolkaVM Compatibility | ✅ done |
| — | [#4732](https://github.com/Koniverse/SubWallet-Extension/issues/4732) | Extension - Default enable DOT (PAH) & KSM (KAH) | ⏸ deprecated |
| — | [#4745](https://github.com/Koniverse/SubWallet-Extension/issues/4745) | Webapp - Default enable DOT (PAH) & KSM (KAH) | ⏸ deprecated |

> **This is the largest single recovery from the triage bucket — 130 rows of pure network & token work.** *"Update chainlist (wNN)"* is a weekly release train; *"Add X network / token"* names a chain the classifier could not recognise; and the Subscan→SubSquid data-indexer migration (#674, #680, #815, #868) is the read-path underneath balances. It joins the Network & Token fold ([note](../../notes/2026-07-24.md#d-epic-24-maintenance--network--token-merged-into-epic-4)).

## Acceptance criteria

- [x] **AC-1** — Every row above is closed on the tracker, shipped or closed without shipping.
- [x] **AC-2** — Each belongs to EPIC-4; none is a row in another epic (verified during the Uncategorized fold).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view <N>` for each row |
| AC-2 | Manual: routing recorded in the [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics) |

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.3](US-4.3-auto-update-chain-list-and-token-metadata.md) · [US-4.25](US-4.25-open-network-and-token-improvements.md) · [consolidation note](../../notes/2026-07-24.md#f-epic-41-maintenance--uncategorized-distributed-across-the-fr-epics)
