# Manual Test Report — EPIC-42 — 2026-10-05

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-05 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight and Google Play beta build numbers |
| Stories tested | US-42.28, US-42.27 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.28 — Maintenance of chainlist (ChainList #710)

Carried on from [2026-10-02](../2026-10-02/report-manual.md), which ran the per-chain RPC half and passed 68 of the 69 chains.

`shibuya` was recorded as skipped that day for not being in the wallet. A recheck today found it there, so the skip was wrong: RPC-64 is open again and still to run.

What is left: RPC-64, the three provider checks that are not per-chain, the 61 deactivated chains, the 24 new ones, the Bittensor subnets, and the upgrade runs.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| RPC-64 | `shibuya` | ✅ Pass | Extension — the line reopened today after the 10-02 skip turned out to be wrong |
| RPC-X2 | Switching provider works on a chain whose list changed, and the new endpoints respond | ✅ Pass | Extension |
| OFF-M-1 | 3DPass (`3dpass`) | ✅ Pass | Extension |
| OFF-M-2 | 5ireChain Mainnet (`5irechain_mainnet`) | ✅ Pass | Extension |
| OFF-M-3 | Amplitude (`amplitude`) | ✅ Pass | Extension |
| OFF-M-4 | Centrifuge (`centrifuge`) | ✅ Pass | Extension |
| OFF-M-5 | Chain X (`chainx`) | ✅ Pass | Extension |
| OFF-M-6 | Crab2 Parachain (`crabParachain`) | ✅ Pass | Extension |
| OFF-M-7 | Crust (`crust`) | ✅ Pass | Extension |
| OFF-M-8 | Crust Shadow (`shadow`) | ✅ Pass | Extension |
| OFF-M-9 | DAO IPCI (`ipci`) | ✅ Pass | Extension |
| OFF-M-10 | Edgeware (`edgeware`) | ✅ Pass | Extension |
| OFF-M-11 | Exosama (`exosama`) | ✅ Pass | Extension |
| OFF-M-12 | Interlay (`interlay`) | ✅ Pass | Extension |
| OFF-M-13 | Joystream (`joystream`) | ✅ Pass | Extension |
| OFF-M-14 | KILT Spiritnet (`kilt`) | ✅ Pass | Extension |
| OFF-M-15 | Kintsugi (`kintsugi`) | ✅ Pass | Extension |
| OFF-M-16 | Krest Network (`krest_network`) | ✅ Pass | Extension |
| OFF-M-17 | LAOS Network (`laos_network`) | ✅ Pass | Extension |
| OFF-M-18 | Mangata X (`mangatax_para`) | ✅ Pass | Extension |
| OFF-M-19 | Manta Atlantic (`manta_network`) | ✅ Pass | Extension |
| OFF-M-20 | Moonbeam (`moonbeam`) | ✅ Pass | Extension |
| OFF-M-21 | Moonriver (`moonriver`) | ✅ Pass | Extension |
| OFF-M-22 | Quartz (`quartz`) | ✅ Pass | Extension |
| OFF-M-23 | RARI Chain (`rari`) | ✅ Pass | Extension |
| OFF-M-24 | SORA Kusama (`sora_ksm`) | ✅ Pass | Extension |
| OFF-M-25 | Tangle EVM Mainnet (`tangle_evm`) | ✅ Pass | Extension |
| OFF-M-26 | Tangle Mainnet (`tangle`) | ✅ Pass | Extension |
| OFF-M-27 | Tanssi Mainnet (`tanssi`) | ✅ Pass | Extension |
| OFF-M-28 | Ternoa zkEVM+ (`ternoaZkEvm`) | ✅ Pass | Extension |
| OFF-M-29 | Xcavate (`xcavate`) | ✅ Pass | Extension |
| OFF-M-30 | Zeitgeist (`zeitgeist`) | ✅ Pass | Extension |
| OFF-T-1 | Aleph Zero Testnet (`alephTest`) | ✅ Pass | Extension |
| OFF-T-2 | Analog Testnet (`analog_testnet`) | ✅ Pass | Extension |
| OFF-T-3 | Berachain bArtio (`berachain_testnet`) | ✅ Pass | Extension |
| OFF-T-4 | BEVM OP Testnet (`bevm_testnet`) | ✅ Pass | Extension |
| OFF-T-5 | BEVM Testnet (`bevmTest`) | ✅ Pass | Extension |
| OFF-T-6 | Bifrost Paseo (`bifrostPaseo`) | ✅ Pass | Extension |
| OFF-T-7 | Bitlayer Testnet (`bitlayerTest`) | ✅ Pass | Extension |
| OFF-T-8 | Botanix Testnet (`botanixEvmTest`) | ✅ Pass | Extension |
| OFF-T-9 | BounceBit Testnet (`bounceBitEvmTest`) | ✅ Pass | Extension |
| OFF-T-10 | B² Network Testnet (`b2_testnet`) | ✅ Pass | Extension |
| OFF-T-11 | Celo Alfajores (`celo_alfajores`) | ✅ Pass | Extension |
| OFF-T-12 | CESS Testnet (`cess_testnet`) | ✅ Pass | Extension |
| OFF-T-13 | Dancelight (`dancelight`) | ✅ Pass | Extension |
| OFF-T-14 | Fantom Testnet (`fantom_testnet`) | ✅ Pass | Extension |
| OFF-T-15 | Hydration Hollarnet (`hydradx_hollarnet`) | ✅ Pass | Extension |
| OFF-T-16 | Hydration Paseo Testnet (`hydrationPaseo`) | ✅ Pass | Extension |
| OFF-T-17 | Mandala Testnet (`mandalaTest`) | ✅ Pass | Extension |
| OFF-T-18 | Melodie Testnet Live (`melodie_testnet`) | ✅ Pass | Extension |
| OFF-T-19 | Moonbase Alpha (`moonbase`) | ✅ Pass | Extension |
| OFF-T-20 | Muse Testnet (`muse_testnet`) | ✅ Pass | Extension |
| OFF-T-21 | Passet Hub EVM (`passetHub_evm`) | ✅ Pass | Extension |
| OFF-T-22 | passet-hub (`passetHub`) | ✅ Pass | Extension |
| OFF-T-23 | Polygon zkEVM Cardona Testnet (`polygonzkEvm_cardona`) | ✅ Pass | Extension |
| OFF-T-24 | Quantum Fusion Testnet (`quantum_fusion`) | ✅ Pass | Extension |
| OFF-T-25 | Rollux Testnet (`rollux_testnet`) | ✅ Pass | Extension |
| OFF-T-26 | Sophon Testnet (`sophon_testnet`) | ✅ Pass | Extension |
| OFF-T-27 | Tangle Testnet (`tangleTest`) | ✅ Pass | Extension |
| OFF-T-28 | Ternoa zkEVM+ Testnet (`ternoaZkEvm_testnet`) | ✅ Pass | Extension |
| OFF-T-29 | Vara Network Testnet (`vara_testnet`) | ✅ Pass | Extension |
| OFF-T-30 | Verisense Beta Testnet (`verisenseTest`) | ✅ Pass | Extension |
| OFF-T-31 | X Layer testnet (`okxTest`) | ✅ Pass | Extension |

All 69 per-chain RPC lines now pass. RPC-X1 and RPC-X3 are still open; RPC-X3 needs an upgrade rather than a fresh install.

All 61 deactivated chains are gone from Manage networks, the token picker, and the send and swap flows — 30 mainnet and 31 testnet. GEN-1 to GEN-6 have not run: those are the lines that say what deactivation must not break, and they need an upgrade carrying balances and history from before it.

### Bugs

None.

## US-42.27 — Release SubWallet Mobile

Started today on the beta builds. Forty lines pass on each platform, the same set on the TestFlight build and on the Google Play beta build, with REG-32 skipped on both.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-IOS-69 / REG-AND-69 | Add an address; remove one; edit a name; search and filter | ✅ Pass | iOS beta + Android beta |
| REG-IOS-70 / REG-AND-70 | Migrate solo accounts to a unified account — the migration runs to the end, and every migrated account can still sign afterwards | ✅ Pass | iOS beta + Android beta |
| REG-IOS-82 / REG-AND-82 | Configure the Subscan API key | ✅ Pass | iOS beta + Android beta |
| REG-IOS-71 / REG-AND-71 | Contact support; user guide; request a feature | ✅ Pass | iOS beta + Android beta |
| REG-IOS-72 / REG-AND-72 | About SubWallet — website; term of use; X; rate our app | ✅ Pass | iOS beta + Android beta |
| REG-IOS-73 / REG-AND-73 | The MKT campaign | ✅ Pass | iOS beta + Android beta |
| REG-IOS-74 / REG-AND-74 | Add an API key | ✅ Pass | iOS beta + Android beta |
| REG-IOS-83 / REG-AND-83 | Crowdloans is gone — no tab, no entry point, and nothing left behind that opens it | ✅ Pass | iOS beta + Android beta |
| REG-IOS-18 / REG-AND-18 | Transfer an EVM token — single-chain and cross-chain; native and local; edit the fee | ✅ Pass | iOS beta + Android beta |
| REG-IOS-19 / REG-AND-19 | Transfer a substrate token — single-chain and cross-chain; native and local; choose which token pays the fee | ✅ Pass | iOS beta + Android beta |
| REG-IOS-20 / REG-AND-20 | Transfer a BTC token | ✅ Pass | iOS beta + Android beta |
| REG-IOS-21 / REG-AND-21 | Transfer a TON token | ✅ Pass | iOS beta + Android beta |
| REG-IOS-79 / REG-AND-79 | Transfer a token through a bridge — TAO to Subtensor EVM and back | ✅ Pass | iOS beta + Android beta |
| REG-IOS-22 / REG-AND-22 | The transfer screen — select token; the prompt to enable a network that is off; select network; recipient address; input amount; approve; submit | ✅ Pass | iOS beta + Android beta |
| REG-IOS-23 / REG-AND-23 | Swap without XCM; swap with XCM | ✅ Pass | iOS beta + Android beta |
| REG-IOS-24 / REG-AND-24 | Search token and account; the prompt to enable a network that is off; filter token | ✅ Pass | iOS beta + Android beta |
| REG-IOS-25 / REG-AND-25 | Input the amount and the recipient address — by QR, by typing, from the address book | ✅ Pass | iOS beta + Android beta |
| REG-IOS-26 / REG-AND-26 | The swap quote shows; quote reset; quote detail; input and edit slippage; view quote; view fee | ✅ Pass | iOS beta + Android beta |
| REG-IOS-27 / REG-AND-27 | Validation cases; submit | ✅ Pass | iOS beta + Android beta |
| REG-IOS-28 / REG-AND-28 | Choose a token with the network on and with it off; the buy page opens; the token list matches the account type; select token; select service; select account; the disclaimer popup | ✅ Pass | iOS beta + Android beta |
| REG-IOS-29 / REG-AND-29 | View NFT collections; search; reload collections; view the NFT list; NFT detail | ✅ Pass | iOS beta + Android beta |
| REG-IOS-30 / REG-AND-30 | Import an NFT — select network; the prompt to enable a network that is off; select token type; type or scan the contract address; collection name; import | ✅ Pass | iOS beta + Android beta |
| REG-IOS-31 / REG-AND-31 | Send an NFT on a supported network, and on one with no support | ✅ Pass | iOS beta + Android beta |
| REG-IOS-32 / REG-AND-32 | Remove a custom NFT | ⏭️ Skipped | Both — NFTs are auto-detected now, so a removed one comes straight back and the action no longer does anything |
| REG-IOS-14 / REG-AND-14 | Transferable balance is right on token details; transfer on-chain; transfer cross-chain; send NFT; swap; earning actions | ✅ Pass | iOS beta + Android beta |
| REG-IOS-15 / REG-AND-15 | Show and hide balance; refresh balance; customize asset display; search token; token detail | ✅ Pass | iOS beta + Android beta |
| REG-IOS-16 / REG-AND-16 | The QR code shows in all accounts mode and in single account mode | ✅ Pass | iOS beta + Android beta |
| REG-IOS-17 / REG-AND-17 | The explorer link opens for a network that has one, and is handled for a network that does not | ✅ Pass | iOS beta + Android beta |
| REG-IOS-33 / REG-AND-33 | The earning options list; the earning positions list; position detail; earning instructions | ✅ Pass | iOS beta + Android beta |
| REG-IOS-34 / REG-AND-34 | Stake — direct nomination; nomination pool; liquid stake; subnet staking | ✅ Pass | iOS beta + Android beta |
| REG-IOS-35 / REG-AND-35 | Stake more | ✅ Pass | iOS beta + Android beta |
| REG-IOS-36 / REG-AND-36 | Fast unstake — part of the position, and all of it | ✅ Pass | iOS beta + Android beta |
| REG-IOS-37 / REG-AND-37 | Slow unstake — part of the position, and all of it | ✅ Pass | iOS beta + Android beta |
| REG-IOS-38 / REG-AND-38 | Cancel unstake; withdraw; claim rewards | ✅ Pass | iOS beta + Android beta |
| REG-IOS-80 / REG-AND-80 | Parachain (collator) staking — start staking; stake more; claim rewards; unstake; cancel unstake; withdraw | ✅ Pass | iOS beta + Android beta |
| REG-IOS-81 / REG-AND-81 | Change validator — on direct nomination, and on subnet staking | ✅ Pass | iOS beta + Android beta |
| REG-IOS-39 / REG-AND-39 | Connect to a substrate dApp; connect to an EVM dApp; block and unblock a dApp | ✅ Pass | iOS beta + Android beta |
| REG-IOS-40 / REG-AND-40 | Sign a message or transaction with a substrate account; with an EVM account; with an EVM account using a substrate provider | ✅ Pass | iOS beta + Android beta |
| REG-IOS-41 / REG-AND-41 | The mission pool list; search; filter; status; tabs | ✅ Pass | iOS beta + Android beta |
| REG-IOS-42 / REG-AND-42 | Sorting by status — live, upcoming, archived — and by ordinal low to high, matching the Extension | ✅ Pass | iOS beta + Android beta |
| REG-IOS-43 / REG-AND-43 | View mission pool details; the actions inside a mission pool go where they should; scroll up and down, left and right | ✅ Pass | iOS beta + Android beta |

40 of 82 lines done on each platform, with REG-32 skipped — transfer, swap, buy token, manage NFT, balances, receive, earning, dApps and mission pools. AC-1 and AC-3 need the full list, so they are not settled yet. The upgrade rechecks have not started, and stages 3 and 4 only begin once the beta stage has passed in full.

### Bugs

None.

## Summary

Session in progress.
