# Manual Test Report — EPIC-42 — 2026-10-09

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-09 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS, beta and production; Extension — chain-list 0.2.132-beta.5 |
| Runner | manual (mobile + extension) |
| Build under test | Mobile v1.2.45(534)b-v16; Extension on chain-list 0.2.132-beta.5 |
| Stories tested | US-42.27 — closed; US-42.30 — closed |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | done |

---

## US-42.27 — Release SubWallet Mobile

The last story in the window, and it closes today at every line.

The upgrade rechecks pass on each beta build, and the App Store and Google Play builds pass their quick recheck. That settles AC-2 and AC-4, then AC-5 to AC-8. REG-32 stays skipped on both lists for the reason it carried through the regression.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-2 | Stage 1, iOS beta — the upgrade recheck passes, UPG-IOS-1 to UPG-IOS-3 | ✅ Pass | Mobile |
| AC-4 | Stage 2, Android beta — the upgrade recheck passes, UPG-AND-1 to UPG-AND-3 | ✅ Pass | Mobile |
| AC-5 | Stage 3, iOS production on the App Store — the quick recheck passes | ✅ Pass | Mobile |
| AC-6 | Stage 4, Android production on Google Play — the quick recheck passes | ✅ Pass | Mobile |
| AC-7 | The version shown in the app matches the build published at each stage | ✅ Pass | Mobile |
| AC-8 | No bug found in an earlier stage is still open when a later stage starts | ✅ Pass | Mobile |
| UPG-IOS-1 | Accounts, balances, NFTs, staking and earning positions, dApp connections and settings are all still there and correct | ✅ Pass | Mobile |
| UPG-IOS-2 | Transaction history from before the upgrade is still readable, with the same figures | ✅ Pass | Mobile |
| UPG-IOS-3 | No screen is broken where a removed feature used to be — Crowdloans, Polygon zkEVM, stDOT, the old Bittensor root claim | ✅ Pass | Mobile |
| UPG-AND-1 | Accounts, balances, NFTs, staking and earning positions, dApp connections and settings are all still there and correct | ✅ Pass | Mobile |
| UPG-AND-2 | Transaction history from before the upgrade is still readable, with the same figures | ✅ Pass | Mobile |
| UPG-AND-3 | No screen is broken where a removed feature used to be — Crowdloans, Polygon zkEVM, stDOT, the old Bittensor root claim | ✅ Pass | Mobile |
| PROD-IOS | Quick recheck on the App Store build — the version shown in the app is the one published, the wallet opens and unlocks, balances load, and a transfer goes through | ✅ Pass | Mobile |
| PROD-AND | Quick recheck on the Google Play build — the version shown in the app is the one published, the wallet opens and unlocks, balances load, and a transfer goes through | ✅ Pass | Mobile |

### Bugs

None.

## US-42.30 — Chainlist final RPC re-check (ChainList #710)

Opened today. Two commits landed on the ChainList branch after US-42.28 closed on 10-07, and they touch chains that story already ticked — a 455-endpoint re-check that removed 28 RPCs and added 20, and two more Bittensor subnets resynced.

The story is separate rather than a reopening of US-42.28, so each result stays attached to the day it was true. It carries a table naming the US-42.28 ticks each item invalidates.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| SUB2-58 | `bittensor-LOCAL-ح` — name Unknown → Attune, new icon | ✅ Pass | Extension |
| SUB2-113 | `bittensor-LOCAL-ƒ` — name LongShort → Unknown, default icon | ✅ Pass | Extension |
| SUB2-X | The balance on each of the two is unchanged — only the name and icon moved | ✅ Pass | Extension |
| RPC2-1 | `polkadot` — Helixstreet removed | ✅ Pass | Extension |
| RPC2-2 | `kusama` — Helixstreet removed | ✅ Pass | Extension |
| RPC2-3 | `statemint` — Helixstreet and Rotko removed | ✅ Pass | Extension |
| RPC2-4 | `polkadot_people` — Helixstreet removed | ✅ Pass | Extension |
| RPC2-5 | `shiden` — OnFinality removed | ✅ Pass | Extension |
| RPC2-6 | `basilisk` — Dwellir 2 removed | ✅ Pass | Extension |
| RPC2-7 | `acurast` — the papers.tech endpoint removed | ✅ Pass | Extension |
| RPC2-8 | `sepolia_ethereum` — 0xrpc removed, it was 61 hours behind | ✅ Pass | Extension |
| RPC2-9 | `polkadotHub_evm` — OpsLayer removed | ✅ Pass | Extension |
| RPC2-10 | `polkadotHub_evm_testnet` — OpsLayer removed | ✅ Pass | Extension |
| RPC2-11 | `polkadot` — `wss://rpc-polkadot.stakeworld.io` | ✅ Pass | Extension |
| RPC2-12 | `kusama` — `wss://rpc-kusama.stakeworld.io` | ✅ Pass | Extension |
| RPC2-13 | `statemint` — `wss://rpc-asset-hub-polkadot.stakeworld.io` | ✅ Pass | Extension |
| RPC2-14 | `collectives` — `wss://rpc-collectives-polkadot.stakeworld.io` | ✅ Pass | Extension |
| RPC2-15 | `bridgeHubPolkadot` — `wss://rpc-bridge-hub-polkadot.stakeworld.io` | ✅ Pass | Extension |
| RPC2-16 | `peopleKusama` — `wss://rpc-people-kusama.stakeworld.io` | ✅ Pass | Extension |
| RPC2-17 | `kusama_coretime` — `wss://rpc-coretime-kusama.stakeworld.io` | ✅ Pass | Extension |
| RPC2-18 | `sepolia_ethereum` — ethPandaOps answers and can be selected | ✅ Pass | Extension |
| RPC2-19 | `sepolia_ethereum` — ZAN answers and can be selected | ✅ Pass | Extension |
| OFF2-1 | `robonomics` — the para head halted on Kusama | ✅ Pass | Extension |
| OFF2-2 | `bounceBitEvm` — the L1 was retired after the 2026-08 exploit | ✅ Pass | Extension |
| OFF2-3 | `dentnet` — the RPC domain was removed and it is not on telemetry | ✅ Pass | Extension |
| OFF2-4 | A balance held on any of the three is still readable and the account opens | ✅ Pass | Extension |
| GEB-1 | The chain reads GEB in Manage networks and in the token picker, not BEVM | ✅ Pass | Extension |
| GEB-2 | Its icon is the new one | ✅ Pass | Extension |
| GEB-3 | It connects on `rpc-mainnet-1.geb.network` and on `rpc-mainnet-2.geb.network` | ✅ Pass | Extension |
| GEB-4 | A balance held on it before the rename is still there | ✅ Pass | Extension |
| GEB-5 | The explorer link opens `scan.geb.network` and finds a transaction | ✅ Pass | Extension |
| GEB-6 | A transfer goes through and appears in history | ✅ Pass | Extension |
| RESET-1 | `atletaOlympia_testnet` connects on its new genesis hash with no mismatch warning | ✅ Pass | Extension |

33 of 33. The story closes today. Every RPC line holds — the ten chains with dead RPCs removed still connect, the seven Stakeworld chains connect on the new domain with the old one gone, and Sepolia takes both endpoints added to it. The three newly deactivated chains are out of the lists while a balance held on them is still readable, taking the count to 64. GEB carries its new name, icon, endpoints and explorer with the balance untouched, since the chainId did not change. Atleta Olympia connects on its new genesis hash without a mismatch warning.


### Bugs

None.

## Full RPC change list, checked on a dev build — pass

All 72 chains pass: each still connects, every endpoint listed under Removed is gone from its provider list, and every endpoint listed under Added is there and answers when selected.

The point of this run is which build it was done on. Chain-list is delivered online, so any dev build takes the published list on its own without being rebuilt. Checking on any one dev build is enough to show the update has gone out — there is no way to check every build, and no need to. What it must not be is a build made from the pull request: that one carries the change because the change is in it, so a pass there says nothing about whether the online update works at all.

Taken from [ChainList #710](https://github.com/Koniverse/SubWallet-ChainList/issues/710), section 1, Provider — RPC changes.


> Major EVM chains: every public RPC on chainlist.org was benchmarked (5 rounds of `eth_chainId` / `eth_blockNumber` / `eth_getBalance` + `eth_estimateGas` + `eth_getLogs`); only reputable providers with zero errors were added, and the default (first) RPC of each chain is unchanged. 1RPC was not added because its public quota ran out during testing.

> Substrate chains: candidates from polkadot-js/apps plus provider URL patterns (Dwellir, OnFinality, PublicNode, LuckyFriday, Rotko, Gatotech, Helixstreet) were matched to each chain by genesis hash and kept only if they passed 3 rounds 60s apart (correct genesis, block lag < 3 min, new blocks between rounds, not syncing), one endpoint per provider. Bifrost Polkadot: the Liebi EU node was stuck (35 min behind, no new blocks) and was replaced by the Liebi HK and US nodes.

> Re-checked 06/10/2026: all 190 RPCs added on this branch were re-benchmarked (3 rounds, 60s apart): 183 healthy. Removed the 5 that failed every round — Blast Pocket (stuck at block 0), Blast Tenderly (404), Kaia 1RPC (520 / timeout), Cronos Testnet Tatum (5 req/min, always 429), Karura LuckyFriday (502) — and replaced them with RPCs that passed the same benchmark (Blast: Thirdweb; Kaia: Ankr, dRPC; Cronos Testnet: dRPC).

> Final re-check 09/10/2026: all 455 RPCs of the 208 active chains (failures retried 2 more rounds; DNS via Cloudflare/Google; reachability from 5 other countries via check-host). Removed: Helixstreet on polkadot / kusama / statemint / polkadot_people (TLS drop or 500, "Broken pipe" from abroad too), OnFinality on shiden (gateway timeout from abroad too), Dwellir on basilisk and papers.tech on acurast (domains removed), 0xrpc on Sepolia (61h behind), OpsLayer on Polkadot Hub EVM (domain removed). Stakeworld moved to the new `rpc-<chain>.stakeworld.io` domains used by polkadot-js ([#12100](https://github.com/polkadot-js/apps/pull/12100)) on 7 chains. Sepolia: + ethPandaOps, ZAN. BEVM → GEB: RPCs moved to `rpc-mainnet-1/2.geb.network`. Basilisk, Acurast Canary and Shiden have no other working public RPC.

| Chain | Removed | Added |
|---|---|---|
| `polkadot` | `wss://polkadot.public.curie.radiumblock.co/ws`<br>`wss://dot-rpc.stakeworld.io`<br>`wss://polkadot-rpc-tn.dwellir.com`<br>`wss://rpc.ibp.network/polkadot`<br>`wss://polkadot-public-rpc.blockops.network/ws`<br>`wss://rpc-polkadot.helixstreet.io`<br>`wss://polkadot.dotters.network` | `wss://rpc-polkadot.stakeworld.io`<br>`wss://polkadot.gatotech.network`<br>`wss://polkadot-rpc.n.dwellir.com`<br>`wss://rockx-dot.w3node.com/polka-public-dot/ws`<br>`wss://rpc.interweb-it.com/polkadot`<br>`wss://spectrum-03.simplystaking.xyz/cG9sa2Fkb3QtMDMtOTFkMmYwZGYtcG9sa2Fkb3Q/LjwBJpV3dIKyWQ/polkadot/mainnet/` |
| `kusama` | `wss://kusama.public.curie.radiumblock.co/ws`<br>`wss://kusama-rpc-tn.dwellir.com`<br>`wss://ksm-rpc.stakeworld.io`<br>`wss://rpc.ibp.network/kusama`<br>`wss://rpc-kusama.helixstreet.io`<br>`wss://kusama.dotters.network` | `wss://rpc-kusama.stakeworld.io`<br>`wss://kusama.gatotech.network`<br>`wss://kusama-rpc.n.dwellir.com`<br>`wss://rockx-ksm.w3node.com/polka-public-ksm/ws`<br>`wss://spectrum-03.simplystaking.xyz/cG9sa2Fkb3QtMDMtOTFkMmYwZGYtcG9sa2Fkb3Q/QXq7QZ6Q60NDzA/kusama/mainnet/` |
| `ethereum` | `https://eth.llamarpc.com` | `https://gateway.tenderly.co/public/mainnet`<br>`https://ethereum.public.blockpi.network/v1/rpc/public`<br>`https://eth.api.pocket.network`<br>`https://mainnet.rpc.sentio.xyz` |
| `astarEvm` | `https://astar-rpc.dwellir.com` | — |
| `statemint` | `wss://statemint-rpc-tn.dwellir.com`<br>`wss://dot-rpc.stakeworld.io/assethub`<br>`wss://asset-hub-polkadot.dotters.network`<br>`wss://statemint.public.curie.radiumblock.co/ws` | `wss://rpc-asset-hub-polkadot.stakeworld.io`<br>`wss://asset-hub-polkadot.gatotech.network`<br>`wss://asset-hub-polkadot.rotko.net` |
| `astar` | `wss://astar.public.curie.radiumblock.co/ws` | `wss://astar-rpc.n.dwellir.com` |
| `polygon` | `https://polygon-rpc.com/`<br>`https://polygon-bor.publicnode.com` | `https://polygon-bor-rpc.publicnode.com`<br>`https://polygon.drpc.org`<br>`https://gateway.tenderly.co/public/polygon`<br>`https://poly.api.pocket.network`<br>`https://matic.rpc.sentio.xyz` |
| `optimism` | `https://endpoints.omniatech.io/v1/op/mainnet/public`<br>`https://1rpc.io/op` | `https://mainnet.optimism.io`<br>`https://gateway.tenderly.co/public/optimism`<br>`https://optimism.public.blockpi.network/v1/rpc/public` |
| `acala` | `wss://acala.ibp.network`<br>`wss://acala.dotters.network` | — |
| `westend` | `wss://westend-rpc-tn.dwellir.com`<br>`wss://westend.public.curie.radiumblock.co/ws` | `wss://westend.api.onfinality.io/public-ws`<br>`wss://westend-rpc.n.dwellir.com` |
| `bifrost_dot` | `wss://bifrost-polkadot.ibp.network`<br>`wss://bifrost-polkadot.dotters.network`<br>`wss://eu.bifrost-polkadot-rpc.liebi.com/ws` | `wss://hk.bifrost-polkadot-rpc.liebi.com/ws`<br>`wss://us.bifrost-polkadot-rpc.liebi.com/ws` |
| `hydradx_main` | `wss://hydration.ibp.network`<br>`wss://rpc.helikon.io/hydradx`<br>`wss://hydration.dotters.network` | `wss://hydration.rotko.net` |
| `darwinia2` | `wss://darwinia.rpc.subquery.network/public/ws` | — |
| `polkadex` | `wss://polkadex.public.curie.radiumblock.co/ws` | — |
| `statemine` | `wss://sys.ibp.network/asset-hub-kusama`<br>`wss://statemine.public.curie.radiumblock.co/ws`<br>`wss://statemine-rpc-tn.dwellir.com`<br>`wss://asset-hub-kusama.dotters.network` | `wss://asset-hub-kusama.rotko.net` |
| `unique_network` | `wss://unique.ibp.network`<br>`wss://unique.dotters.network` | — |
| `encointer` | `wss://sys.ibp.network/encointer-kusama`<br>`wss://encointer-kusama.dotters.network` | `wss://encointer-kusama.rotko.net`<br>`wss://encointer-kusama-rpc.n.dwellir.com`<br>`wss://rpc-encointer-kusama.luckyfriday.io` |
| `collectives` | `wss://polkadot-collectives-rpc-tn.dwellir.com`<br>`wss://sys.ibp.network/collectives-polkadot`<br>`wss://collectives-polkadot.dotters.network`<br>`wss://collectives.public.curie.radiumblock.co/ws`<br>`wss://dot-rpc.stakeworld.io/collectives` | `wss://rpc-collectives-polkadot.stakeworld.io`<br>`wss://collectives-polkadot.rotko.net`<br>`wss://collectives-polkadot-rpc.n.dwellir.com`<br>`wss://collectives.api.onfinality.io/public-ws` |
| `ajunaPolkadot` | `wss://ajuna.ibp.network`<br>`wss://ajuna.dotters.network` | `wss://rpc-para.ajuna.network` |
| `sora_substrate` | `wss://mof3.sora.org`<br>`wss://sora.api.onfinality.io/public-ws` | — |
| `fantom` | `https://fantom-pokt.nodies.app/` | — |
| `bridgeHubPolkadot` | `wss://dot-rpc.stakeworld.io/bridgehub`<br>`wss://polkadot-bridge-hub-rpc-tn.dwellir.com`<br>`wss://sys.ibp.network/bridgehub-polkadot`<br>`wss://bridge-hub-polkadot.dotters.network`<br>`wss://bridgehub-polkadot.public.curie.radiumblock.co/ws` | `wss://rpc-bridge-hub-polkadot.stakeworld.io`<br>`wss://bridge-hub-polkadot.rotko.net`<br>`wss://bridge-hub-polkadot-rpc.n.dwellir.com`<br>`wss://spectrum-03.simplystaking.xyz/cG9sa2Fkb3QtMDMtOTFkMmYwZGYtcG9sa2Fkb3Q/mgX--uWlEtmNKw/polkadotbridgehub/mainnet/` |
| `bridgeHubKusama` | `wss://ksm-rpc.stakeworld.io/bridgehub`<br>`wss://sys.ibp.network/bridgehub-kusama`<br>`wss://kusama-bridge-hub-rpc-tn.dwellir.com` | `wss://bridge-hub-kusama.rotko.net`<br>`wss://bridge-hub-kusama-rpc.n.dwellir.com`<br>`wss://spectrum-03.simplystaking.xyz/cG9sa2Fkb3QtMDMtOTFkMmYwZGYtcG9sa2Fkb3Q/balkpUVauqyv8g/kusamabridgehub/mainnet/`<br>`wss://bridgehub-kusama.api.onfinality.io/public-ws` |
| `bitlayer` | `https://rpc.bitlayer-rpc.com`<br>`https://rpc.ankr.com/bitlayer` | — |
| `mythos` | `wss://polkadot-mythos-rpc.polkadot.io` | `wss://mythos-rpc.dmarket.com/` |
| `paseoTest` | `wss://rpc.ibp.network/paseo`<br>`wss://rpc.dotters.network/paseo` | `wss://paseo-rpc.n.dwellir.com`<br>`wss://rpc-paseo.stakeworld.io`<br>`wss://paseo-v2.rpc.turboflakes.io`<br>`genesisHash` → `0x374057be…` (Paseo re-genesis)<br>`wss://rpc.interweb-it.com/paseo` |
| `availTuringTest` | `wss://turing-testnet.avail-rpc.com/`<br>`wss://avail-turing.bountyblok.io/` | — |
| `avail_mainnet` | `wss://mainnet.avail-rpc.com/`<br>`wss://avail.rpc.bountyblok.io/` | `wss://avail-rpc.publicnode.com`<br>`wss://rpc-avail.luckyfriday.io` |
| `hyperbridge` | `wss://hyperbridge-nexus-rpc.blockops.network`<br>`wss://nexus.ibp.network`<br>`wss://nexus.dotters.network` | `wss://nexus.rpc.polytope.technology` |
| `peopleKusama` | `wss://ksm-rpc.stakeworld.io/people`<br>`wss://sys.ibp.network/people-kusama`<br>`wss://people-kusama.dotters.network` | `wss://rpc-people-kusama.stakeworld.io`<br>`wss://people-kusama.rotko.net`<br>`wss://people-kusama.api.onfinality.io/public-ws`<br>`wss://people-kusama-rpc.n.dwellir.com` |
| `base_sepolia` | `https://base-sepolia.blockpi.network/v1/rpc/public` | — |
| `arbitrum_sepolia` | `https://arbitrum-sepolia.blockpi.network/v1/rpc/public`<br>`https://endpoints.omniatech.io/v1/arbitrum/sepolia/public` | — |
| `zircuit` | `https://zircuit-mainnet.drpc.org/`<br>`https://zircuit1-mainnet.p2pify.com/`<br>`https://zircuit1-mainnet.liquify.com/` | `https://mainnet.zircuit.com`<br>`https://zircuit.rpc.sentio.xyz` |
| `polygon_amoy` | `https://rpc-amoy.polygon.technology/` | `https://polygon-amoy.drpc.org`<br>`https://polygon-amoy.gateway.tenderly.co` |
| `polkadot_people` | `wss://people-polkadot.public.curie.radiumblock.co/ws`<br>`wss://sys.ibp.network/people-polkadot`<br>`wss://sys.dotters.network/people-polkadot`<br>`wss://people-polkadot.dotters.network` | `wss://people-polkadot.rotko.net`<br>`wss://people-polkadot-rpc.n.dwellir.com`<br>`wss://rpc-people-polkadot.stakeworld.io`<br>`wss://people-polkadot.api.onfinality.io/public-ws` |
| `sophon` | `https://sophon-mainnet-public.unifra.io/` | — |
| `paseo_assethub` | `wss://sys.ibp.network/asset-hub-paseo`<br>`wss://asset-hub-paseo.dotters.network`<br>`wss://pas-rpc.stakeworld.io/assethub` | `wss://asset-hub-paseo-rpc.n.dwellir.com` |
| `westend_assethub` | `wss://westmint-rpc-tn.dwellir.com` | `wss://asset-hub-westend-rpc.n.dwellir.com` |
| `polkadot_coretime` | `wss://sys.ibp.network/coretime-polkadot`<br>`wss://coretime-polkadot.dotters.network` | `wss://coretime-polkadot.rotko.net`<br>`wss://coretime-polkadot-rpc.n.dwellir.com`<br>`wss://rpc-coretime-polkadot.stakeworld.io`<br>`wss://coretime-polkadot.api.onfinality.io/public-ws` |
| `kusama_coretime` | `wss://sys.ibp.network/coretime-kusama`<br>`wss://coretime-kusama.dotters.network`<br>`wss://ksm-rpc.stakeworld.io/coretime` | `wss://rpc-coretime-kusama.stakeworld.io`<br>`wss://coretime-kusama.rotko.net`<br>`wss://coretime-kusama.api.onfinality.io/public-ws`<br>`wss://coretime-kusama-rpc.n.dwellir.com` |
| `subtensor_evm` | `https://bittensor-lite-public.nodies.app/` | — |
| `stable_testnet` | `https://stable-jsonrpc.testnet.chain0.dev/`<br>`https://stable-jsonrpc-ar.testnet.chain0.dev/` | `https://rpc.testnet.stable.xyz` |
| `xode` | `wss://xode-polkadot-rpc-01.zeeve.net/y0yxg038wn1fncc/rpc` | — |
| `base_mainnet` | — | `https://mainnet.base.org`<br>`https://base.drpc.org`<br>`https://gateway.tenderly.co/public/base`<br>`https://base.public.blockpi.network/v1/rpc/public` |
| `arbitrum_one` | `https://arbitrum.meowrpc.com` | `https://arb1.arbitrum.io/rpc`<br>`https://arbitrum-one-rpc.publicnode.com`<br>`https://arbitrum.drpc.org`<br>`https://arbitrum.gateway.tenderly.co` |
| `binance` | — | `https://bsc-rpc.publicnode.com`<br>`https://bsc.api.pocket.network` |
| `avalanche_c` | `https://avalanche-c-chain.publicnode.com` | `https://avalanche-c-chain-rpc.publicnode.com`<br>`https://avalanche-mainnet.gateway.tenderly.co` |
| `lineaZkEvm` | — | `https://linea-rpc.publicnode.com`<br>`https://linea.rpc.sentio.xyz`<br>`https://linea.api.pocket.network` |
| `scroll` | — | `https://scroll.drpc.org`<br>`https://scroll-rpc.publicnode.com`<br>`https://scroll.api.pocket.network` |
| `zksync_era` | — | `https://zksync-era.rpc.sentio.xyz`<br>`https://zksync-era.api.pocket.network` |
| `blast_mainnet` | — | `https://blast-rpc.publicnode.com`<br>`https://81457.rpc.thirdweb.com` |
| `mantle` | — | `https://mantle-rpc.publicnode.com`<br>`https://5000.rpc.thirdweb.com` |
| `gnosis` | — | `https://gnosis.drpc.org`<br>`https://gnosis-rpc.publicnode.com`<br>`https://rpc.gnosis.gateway.fm` |
| `sonic` | — | `https://sonic.drpc.org`<br>`https://sonic-rpc.publicnode.com`<br>`https://sonic.api.pocket.network` |
| `unichain` | — | `https://unichain.drpc.org`<br>`https://unichain-rpc.publicnode.com`<br>`https://unichain-mainnet.rpc.sentio.xyz` |
| `celo` | — | `https://rpc.ankr.com/celo`<br>`https://celo-json-rpc.stakely.io` |
| `world_chain` | — | `https://worldchain.drpc.org`<br>`https://worldchain-mainnet.gateway.tenderly.co` |
| `soneium` | — | `https://soneium-mainnet.rpc.sentio.xyz`<br>`https://1868.rpc.thirdweb.com` |
| `ink` | — | `https://ink-rpc.publicnode.com`<br>`https://ink.api.pocket.network` |
| `sepolia_ethereum` | `https://1rpc.io/sepolia`<br>`https://0xrpc.io/sep` | `https://sepolia.rpc.sentio.xyz`<br>`https://eth-sepolia-testnet.api.pocket.network`<br>`https://rpc.sepolia.ethpandaops.io`<br>`https://api.zan.top/eth-sepolia` |
| `karura` | — | `wss://karura-rpc.n.dwellir.com` |
| `shiden` | `wss://shiden.api.onfinality.io/public-ws` | `wss://shiden-rpc.n.dwellir.com` |
| `shibuya` | — | `wss://shibuya-rpc.n.dwellir.com` |
| `xx_network` | — | `wss://xxnetwork-rpc.n.dwellir.com` |
| `enjin_relaychain` | — | `wss://enjin-relay-rpc.n.dwellir.com` |
| `enjin_matrixchain` | — | `wss://enjin-matrix-rpc.n.dwellir.com` |
| `peaq` | — | `wss://peaq-rpc.publicnode.com` |
| `analog_timechain` | — | `wss://analog-rpc.publicnode.com` |
| `basilisk` | `wss://basilisk-rpc.n.dwellir.com` | — |
| `polkadotHub_evm` | `https://services.polkadothub-rpc.com/mainnet/` | — |
| `polkadotHub_evm_testnet` | `https://services.polkadothub-rpc.com/testnet/` | — |
| `bevm` | `https://rpc-mainnet-1.bevm.io`<br>`https://rpc-mainnet-2.bevm.io` | `https://rpc-mainnet-1.geb.network`<br>`https://rpc-mainnet-2.geb.network` |

---

## Summary

Two stories close today, one on Mobile and one on the Extension, with no bug found in either.

US-42.27 is the Mobile release gate for v1.2.45(534)b-v16, and all four stages pass. The two beta builds ran the whole checklist on a fresh install — 81 of 82 lines each, with REG-32 skipped for the reason it carried through the regression — and then the upgrade recheck on each. Accounts, balances, NFTs, staking and earning positions, dApp connections and settings all survive the upgrade, history from before it is still readable with the same figures, and no screen is broken where Crowdloans, Polygon zkEVM, stDOT or the old Bittensor root claim used to be. The App Store and Google Play builds both pass their quick recheck: the version shown in the app is the one published, the wallet opens and unlocks, balances load and a transfer goes through. No bug found in an earlier stage was still open when a later one started, which is what AC-8 asks and what let each stage begin.

US-42.30 opened and closed the same day at 33 of 33. It covers the two commits that landed on the ChainList #710 branch after US-42.28 closed on 10-07, so the ticks in that story mean something again. Every RPC line holds on beta.5: the ten chains with dead endpoints removed still connect, the seven Stakeworld chains connect on the new rpc-<chain>.stakeworld.io domain with the old one gone, and Sepolia takes both endpoints added to it. Three more chains are deactivated — robonomics, bounceBitEvm, dentnet — out of Manage networks, the token picker and the send and swap flows, while a balance held on them is still readable. That takes the deactivated count from the 61 US-42.28 recorded to 64. GEB carries its new name, icon, two endpoints and explorer with the balance untouched, since chainId 11501 did not change, and Atleta Olympia connects on its new genesis hash without a mismatch warning.

The full provider change list was also checked on a dev build and all 72 chains pass. What matters there is the build it was done on. Chain-list is delivered online, so any dev build takes the published list without being rebuilt, and one such build showing it is enough to say the update has gone out. A build made from the pull request would not show that: it carries the change because the change is in it. The full list is in the section above.

Three things carry past today. The first: PR #5096 comments out fetchLatestChainData(), the call that does this online fetching, so a build carrying that PR will not update at all. It is still open.

The second: AC-18 of US-42.29 was skipped on 10-08 — the locale pass on the five new multisig notification strings. Reading the diff of PR #5095 suggests they ship as English in vi, ja, ru and zh, with only the sixth string of the batch translated. That PR has not merged yet, so the check is still worth running.

The third: the ChainList branch has now had five betas and three rounds of RPC checking, each round finding more dead endpoints and each one invalidating ticks in a story already closed. Worth asking the developer whether the list is settling or a sixth round is expected.

No bugs found.
