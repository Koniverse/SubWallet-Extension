# Manual Test Report — EPIC-42 — 2026-10-05

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-05 |
| Tester | MaiThuongNinni |
| Environment | Extension |
| Runner | manual (extension) |
| Build under test | to fill in — Extension version + chain-list version |
| Stories tested | US-42.28 |
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

## Summary

Session in progress.
