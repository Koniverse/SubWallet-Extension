# Manual Test Report — EPIC-42 — 2026-10-02

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-02 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS; Extension |
| Runner | manual (mobile + extension) |
| Build under test | to fill in — Mobile: build number + web-runner version; Extension: version + chain-list version |
| Stories tested | US-42.24.19, US-42.24.20 — both closed; US-42.24 parent closed; US-42.28 — started |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | done |

---

## US-42.24.19 — Full wallet regression, round 3

iOS finished on [2026-10-01](../2026-10-01/report-manual.md) at 83 of 85, with REG-I-32 and REG-I-76 skipped. Android starts round 3 today.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-A-11 | Lock the wallet by hand | ✅ Pass | Android |
| REG-A-12 | Unlock by typing the password; unlock by Face ID or Touch ID | ✅ Pass | Android |
| REG-A-13 | Forgot password — reset account; erase all | ✅ Pass | Android |
| REG-A-85 | The app opens, backgrounds and resumes without losing state — it comes back to where it was, and does not hang on a loading screen | ✅ Pass | Android |
| REG-A-14 | Transferable balance is right on token details; transfer on-chain; transfer cross-chain; send NFT; swap; earning actions | ✅ Pass | Android |
| REG-A-15 | Show and hide balance; refresh balance; customize asset display; search token; token detail | ✅ Pass | Android |
| REG-A-16 | The QR code shows in all accounts mode and in single account mode | ✅ Pass | Android |
| REG-A-17 | The explorer link opens for a network that has one, and is handled for a network that does not | ✅ Pass | Android |
| REG-A-18 | Transfer an EVM token — single-chain and cross-chain; native and local; edit the fee | ✅ Pass | Android |
| REG-A-19 | Transfer a substrate token — single-chain and cross-chain; native and local; choose which token pays the fee | ✅ Pass | Android |
| REG-A-20 | Transfer a BTC token | ✅ Pass | Android |
| REG-A-21 | Transfer a TON token | ✅ Pass | Android |
| REG-A-79 | Transfer a token through a bridge — TAO to Subtensor EVM and back | ✅ Pass | Android |
| REG-A-22 | The transfer screen — select token; the prompt to enable a network that is off; select network; recipient address; input amount; approve; submit | ✅ Pass | Android |
| REG-A-23 | Swap without XCM; swap with XCM | ✅ Pass | Android |
| REG-A-24 | Search token and account; the prompt to enable a network that is off; filter token | ✅ Pass | Android |
| REG-A-25 | Input the amount and the recipient address — by QR, by typing, from the address book | ✅ Pass | Android |
| REG-A-26 | The swap quote shows; quote reset; quote detail; input and edit slippage; view quote; view fee | ✅ Pass | Android |
| REG-A-27 | Validation cases; submit | ✅ Pass | Android |
| REG-A-28 | Choose a token with the network on and with it off; the buy page opens; the token list matches the account type; select token; select service; select account; the disclaimer popup | ✅ Pass | Android |
| REG-A-29 | View NFT collections; search; reload collections; view the NFT list; NFT detail | ✅ Pass | Android |
| REG-A-30 | Import an NFT — select network; the prompt to enable a network that is off; select token type; type or scan the contract address; collection name; import | ✅ Pass | Android |
| REG-A-31 | Send an NFT on a supported network, and on one with no support | ✅ Pass | Android |
| REG-A-32 | Remove a custom NFT | ⏭️ Skipped | Android — NFTs are auto-detected now, so a removed one comes straight back and the action no longer does anything |
| REG-A-33 | The earning options list; the earning positions list; position detail; earning instructions | ✅ Pass | Android |
| REG-A-34 | Stake — direct nomination; nomination pool; liquid stake; subnet staking | ✅ Pass | Android |
| REG-A-35 | Stake more | ✅ Pass | Android |
| REG-A-36 | Fast unstake — part of the position, and all of it | ✅ Pass | Android |
| REG-A-37 | Slow unstake — part of the position, and all of it | ✅ Pass | Android |
| REG-A-38 | Cancel unstake; withdraw; claim rewards | ✅ Pass | Android — the line BUG-42.24.19-28 was found on, now run on the fixed build |
| REG-A-80 | Parachain (collator) staking — start staking; stake more; claim rewards; unstake; cancel unstake; withdraw | ✅ Pass | Android |
| REG-A-81 | Change validator — on direct nomination, and on subnet staking | ✅ Pass | Android |
| REG-A-39 | Connect to a substrate dApp; connect to an EVM dApp; block and unblock a dApp | ✅ Pass | Android |
| REG-A-40 | Sign a message or transaction with a substrate account; with an EVM account; with an EVM account using a substrate provider | ✅ Pass | Android |
| REG-A-41 | The mission pool list; search; filter; status; tabs | ✅ Pass | Android |
| REG-A-42 | Sorting by status — live, upcoming, archived — and by ordinal low to high, matching the Extension | ✅ Pass | Android |
| REG-A-43 | View mission pool details; the actions inside a mission pool go where they should; scroll up and down, left and right | ✅ Pass | Android |
| REG-A-44 | The backup reminder popup — learn how to back up; remind me later; do not show again | ✅ Pass | Android |
| REG-A-45 | Back up the seed phrase through export account | ✅ Pass | Android |
| REG-A-1 | Create an account with a new seed phrase — unified account; TON account | ✅ Pass | Android |
| REG-A-2 | Derive an account from the create account screen — unified account; substrate type; ethereum type | ✅ Pass | Android |
| REG-A-3 | Derive an account from account details | ✅ Pass | Android |
| REG-A-4 | Import an account — seed phrase; JSON file single; JSON file multi covering normal, QR and watch-only; QR code substrate; QR code EVM; private key | ✅ Pass | Android |
| REG-A-78 | Import from Trust Wallet | ✅ Pass | Android |
| REG-A-5 | Attach an account — polkadot vault; keystone; watch-only | ✅ Pass | Android |
| REG-A-6 | Export an account — every account family and type, and the exported file imports back | ✅ Pass | Android |
| REG-A-7 | Proxy account — add a proxy; remove a proxy; view the proxy list; act through a proxy | ✅ Pass | Android |
| REG-A-8 | Multisig account — create one; open its details; approve and reject a pending transaction; sign for a multisig | ✅ Pass | Android |
| REG-A-9 | Remove an account | ✅ Pass | Android |
| REG-A-10 | Edit an account name | ✅ Pass | Android |
| REG-A-84 | Account details — the name, the address per network with QR and copy, the account family and type | ✅ Pass | Android |
| REG-A-46 | All accounts mode — select account; search account; scroll the account list | ✅ Pass | Android |
| REG-A-47 | Separate account mode does not show the account picker | ✅ Pass | Android |
| REG-A-48 | Search network; scroll the network list; select network; filter | ✅ Pass | Android |
| REG-A-49 | The explorer link opens from a history record | ✅ Pass | Android |
| REG-A-50 | Change the currency, and the select currency popup | ✅ Pass | Android |
| REG-A-51 | Change the language, and search within the language list | ✅ Pass | Android |
| REG-A-52 | Turn in-app notifications off and on | ✅ Pass | Android |
| REG-A-53 | Change the wallet password — current; new; confirm; the I understand checkbox; the learn more link; save | ✅ Pass | Android |
| REG-A-54 | Require unlock — change the auto-lock time; the wallet auto-locks | ✅ Pass | Android |
| REG-A-55 | Face ID or Touch ID — turn the toggle off; turn it on by password; turn it on by face or touch scan | ✅ Pass | Android |
| REG-A-56 | Sign for multiple transactions — turn the toggle on and off | ✅ Pass | Android |
| REG-A-57 | Search website; filter; the list of connected websites; scroll the list | ✅ Pass | Android |
| REG-A-58 | Connected website detail — search account; turn an account off and on; block; forget; disconnect all; connect all; unblock | ✅ Pass | Android |
| REG-A-59 | dApp configuration — forget all; disconnect all; connect all | ✅ Pass | Android |
| REG-A-60 | Create a new connection on a supported network, and on one that is not supported | ✅ Pass | Android |
| REG-A-61 | Search; website detail; sign a message or transaction with a substrate and an EVM account; disconnect | ✅ Pass | Android |
| REG-A-62 | Search network; filter network; turn a network on and off | ✅ Pass | Android |
| REG-A-63 | Import a custom network; import a provider; switch provider | ✅ Pass | Android |
| REG-A-64 | Remove a custom network with the network on, and with it off | ✅ Pass | Android |
| REG-A-65 | Define a network — add a provider; switch provider | ✅ Pass | Android |
| REG-A-66 | Import a token with the network on and with it off — select network; select token type; type the contract address; scan it by QR | ✅ Pass | Android |
| REG-A-67 | Remove a custom token with the token on, and with it off | ✅ Pass | Android |
| REG-A-68 | Search token; filter token; turn a token on and off; token detail | ✅ Pass | Android |
| REG-A-69 | Add an address; remove one; edit a name; search and filter | ✅ Pass | Android |
| REG-A-70 | Migrate solo accounts to a unified account — the migration runs to the end, and every migrated account can still sign afterwards | ✅ Pass | Android |
| REG-A-82 | Configure the Subscan API key | ✅ Pass | Android |
| REG-A-71 | Contact support; user guide; request a feature | ✅ Pass | Android |
| REG-A-72 | About SubWallet — website; term of use; X; rate our app | ✅ Pass | Android |
| REG-A-73 | The MKT campaign | ✅ Pass | Android |
| REG-A-74 | Add an API key | ✅ Pass | Android |
| REG-A-83 | Crowdloans is gone — no tab, no entry point, and nothing left behind that opens it | ✅ Pass | Android |
| REG-A-75 | After upgrading, accounts, balances, NFTs, staking and earning positions, dApp connections and settings are all still there and correct | ✅ Pass | Android |
| REG-A-76 | Transaction history from before the upgrade is still readable | ⏭️ Skipped | Android — the Polkadot API key that check needs no longer works. Adding a key still works (REG-A-74, REG-A-82) |
| REG-A-77 | No screen is broken where a removed feature used to be — Crowdloans, Polygon zkEVM, stDOT, the old Bittensor root claim | ✅ Pass | Android |

Android finishes round 3 at 83 of 85, with REG-A-32 and REG-A-76 skipped. Both platforms now stand at 83 of 85 and round 3 is complete. REG-A-38 is the line BUG-42.24.19-28 was found on, so its tick stands on a run of the fixed build.

### Bugs

None.

## US-42.24.20 — Verify the bugs found during this update

Three bugs were open coming into today, all P3 and all logged on 10-01.

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|
| BUG-42.24.19-29 | US-42.24.19 | P3 | The dollar sign on Your balance was drawn too large | ✅ Fixed — verified on Android and iOS |
| BUG-42.24.19-30 | US-42.24.19 | P3 | The watch-only warning on NFT details was the wrong colour | ✅ Fixed — verified on Android and iOS |
| BUG-42.24.19-31 | US-42.24.19 | P3 | The app sometimes takes several seconds to move to the next screen | 👁️ Monitoring — intermittent, no reliable steps to reproduce yet |

BUG-42.24.19-31 is set to monitoring — intermittent, no reliable steps to reproduce yet. The programme reads 88 rows — 81 fixed, 6 closed no fix, 1 monitoring.

## US-42.28 — Maintenance of chainlist (ChainList #710)

Opened today. Every one of the 69 chains whose provider lists were rewritten has been run: 68 connect on their first RPC with that first RPC unchanged, and `shibuya` is skipped because the network is not in the wallet.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| RPC-1 | `polkadot` | ✅ Pass | Extension |
| RPC-2 | `kusama` | ✅ Pass | Extension |
| RPC-3 | `ethereum` | ✅ Pass | Extension |
| RPC-4 | `astarEvm` | ✅ Pass | Extension |
| RPC-5 | `statemint` | ✅ Pass | Extension |
| RPC-6 | `astar` | ✅ Pass | Extension |
| RPC-7 | `polygon` | ✅ Pass | Extension |
| RPC-8 | `optimism` | ✅ Pass | Extension |
| RPC-9 | `acala` | ✅ Pass | Extension |
| RPC-10 | `westend` | ✅ Pass | Extension |
| RPC-11 | `bifrost_dot` | ✅ Pass | Extension |
| RPC-12 | `hydradx_main` | ✅ Pass | Extension |
| RPC-13 | `darwinia2` | ✅ Pass | Extension |
| RPC-14 | `polkadex` | ✅ Pass | Extension |
| RPC-15 | `statemine` | ✅ Pass | Extension |
| RPC-16 | `unique_network` | ✅ Pass | Extension |
| RPC-17 | `encointer` | ✅ Pass | Extension |
| RPC-18 | `collectives` | ✅ Pass | Extension |
| RPC-19 | `ajunaPolkadot` | ✅ Pass | Extension |
| RPC-20 | `sora_substrate` | ✅ Pass | Extension |
| RPC-21 | `fantom` | ✅ Pass | Extension |
| RPC-22 | `bridgeHubPolkadot` | ✅ Pass | Extension |
| RPC-23 | `bridgeHubKusama` | ✅ Pass | Extension |
| RPC-24 | `bitlayer` | ✅ Pass | Extension |
| RPC-25 | `mythos` | ✅ Pass | Extension |
| RPC-26 | `paseoTest` | ✅ Pass | Extension |
| RPC-27 | `availTuringTest` | ✅ Pass | Extension |
| RPC-28 | `avail_mainnet` | ✅ Pass | Extension |
| RPC-29 | `hyperbridge` | ✅ Pass | Extension |
| RPC-30 | `peopleKusama` | ✅ Pass | Extension |
| RPC-31 | `base_sepolia` | ✅ Pass | Extension |
| RPC-32 | `arbitrum_sepolia` | ✅ Pass | Extension |
| RPC-33 | `zircuit` | ✅ Pass | Extension |
| RPC-34 | `polygon_amoy` | ✅ Pass | Extension |
| RPC-35 | `polkadot_people` | ✅ Pass | Extension |
| RPC-36 | `sophon` | ✅ Pass | Extension |
| RPC-37 | `paseo_assethub` | ✅ Pass | Extension |
| RPC-38 | `westend_assethub` | ✅ Pass | Extension |
| RPC-39 | `polkadot_coretime` | ✅ Pass | Extension |
| RPC-40 | `kusama_coretime` | ✅ Pass | Extension |
| RPC-41 | `subtensor_evm` | ✅ Pass | Extension |
| RPC-42 | `stable_testnet` | ✅ Pass | Extension |
| RPC-43 | `xode` | ✅ Pass | Extension |
| RPC-44 | `base_mainnet` | ✅ Pass | Extension |
| RPC-45 | `arbitrum_one` | ✅ Pass | Extension |
| RPC-46 | `binance` | ✅ Pass | Extension |
| RPC-47 | `avalanche_c` | ✅ Pass | Extension |
| RPC-48 | `lineaZkEvm` | ✅ Pass | Extension |
| RPC-49 | `scroll` | ✅ Pass | Extension |
| RPC-50 | `zksync_era` | ✅ Pass | Extension |
| RPC-51 | `blast_mainnet` | ✅ Pass | Extension |
| RPC-52 | `mantle` | ✅ Pass | Extension |
| RPC-53 | `gnosis` | ✅ Pass | Extension |
| RPC-54 | `sonic` | ✅ Pass | Extension |
| RPC-55 | `unichain` | ✅ Pass | Extension |
| RPC-56 | `celo` | ✅ Pass | Extension |
| RPC-57 | `world_chain` | ✅ Pass | Extension |
| RPC-58 | `soneium` | ✅ Pass | Extension |
| RPC-59 | `ink` | ✅ Pass | Extension |
| RPC-60 | `sepolia_ethereum` | ✅ Pass | Extension |
| RPC-61 | `acurast` | ✅ Pass | Extension |
| RPC-62 | `karura` | ✅ Pass | Extension |
| RPC-63 | `shiden` | ✅ Pass | Extension |
| RPC-64 | `shibuya` | ⏭️ Skipped | Extension — the network is not in the wallet, so there is nothing to connect |
| RPC-65 | `xx_network` | ✅ Pass | Extension |
| RPC-66 | `enjin_relaychain` | ✅ Pass | Extension |
| RPC-67 | `enjin_matrixchain` | ✅ Pass | Extension |
| RPC-68 | `peaq` | ✅ Pass | Extension |
| RPC-69 | `analog_timechain` | ✅ Pass | Extension |

All 69 RPC lines are done: 68 pass and RPC-64 is skipped. RPC-X1 to RPC-X3 — the IBP sweep, switching provider, and a custom provider surviving the upgrade — have not run. The deactivated chains, the new chains and the Bittensor subnets have not started.

### Bugs

None.

## Summary

A long session on two fronts: the web-runner programme closed, and the chainlist QC opened.

Android ran the whole of round 3 in one session and finished at 83 of 85. iOS had finished at the same figure yesterday, so round 3 is complete on both platforms and US-42.24.19 is closed.

The two lines left on each list are REG-32 and REG-76, skipped for the reasons they carried from round 2: NFTs are auto-detected so removing one no longer does anything, and the Polkadot API key the history check needs no longer works. Both sit outside the build.

REG-A-38 is worth naming. It is the line BUG-42.24.19-28 was found on — the P1 that stopped a nomination pool withdrawal from being built — and the Android run came after the fix. iOS had its tick cleared and rerun for the same reason, so both platforms now carry that line on a fixed build.

Two bugs verified fixed on both platforms: the dollar sign on Your balance drawn too large, and the watch-only warning on NFT details in the wrong colour.

BUG-42.24.19-31 is set to monitoring rather than left open. It is intermittent, with no reliable steps to reproduce yet, so it is watched in US-42.24.20 until it can be pinned down. The programme reads 88 rows: 81 fixed, 6 closed no fix, 1 monitoring.

US-42.24.20 and the parent US-42.24 close with it. The whole web-runner programme is settled: 23 sub-tasks, 22 done and one closed unrun.

US-42.28 started in the same session, on the chainlist maintenance from ChainList #710. All 69 of its per-chain RPC lines ran: 68 pass and one is skipped, `shibuya`, which is not in the wallet. The deactivated chains, the new chains and the Bittensor subnets have not started.

What comes next is US-42.27, the release gate, which takes the regression checklist to the TestFlight and Google Play beta builds.
