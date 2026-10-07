# Manual Test Report — EPIC-42 — 2026-10-06

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-06 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight and Google Play beta build numbers |
| Stories tested | US-42.27, US-42.28 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | done |

---

## US-42.27 — Release SubWallet Mobile

Carried on from [2026-10-05](../2026-10-05/report-manual.md), which reached 45 of 82 lines on each beta build with REG-32 skipped.

Nine sections close today on each platform: manage account with all twelve of its lines, manage network, manage token, history, general settings, security settings, lock and unlock, backup seed phrase, and the background-and-resume check.

The fresh-install half of the beta stage finishes today. What remains is the upgrade recheck on each build.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-IOS-1 / REG-AND-1 | Create an account with a new seed phrase — unified account; TON account | ✅ Pass | iOS beta + Android beta |
| REG-IOS-2 / REG-AND-2 | Derive an account from the create account screen — unified account; substrate type; ethereum type | ✅ Pass | iOS beta + Android beta |
| REG-IOS-3 / REG-AND-3 | Derive an account from account details | ✅ Pass | iOS beta + Android beta |
| REG-IOS-4 / REG-AND-4 | Import an account — seed phrase; JSON file single; JSON file multi covering normal, QR and watch-only; QR code substrate; QR code EVM; private key | ✅ Pass | iOS beta + Android beta |
| REG-IOS-78 / REG-AND-78 | Import from Trust Wallet | ✅ Pass | iOS beta + Android beta |
| REG-IOS-5 / REG-AND-5 | Attach an account — polkadot vault; keystone; watch-only. Ledger is coming soon and is not checked | ✅ Pass | iOS beta + Android beta |
| REG-IOS-6 / REG-AND-6 | Export an account — unified with seed phrase and JSON; TON with seed phrase, JSON and private key; substrate with JSON and QR; ethereum with JSON, private key and QR; all accounts covering normal, QR signer and watch-only; watch-only offers no export; the exported file imports back | ✅ Pass | iOS beta + Android beta |
| REG-IOS-7 / REG-AND-7 | Proxy account — add a proxy; remove a proxy; view the proxy list; act through a proxy | ✅ Pass | iOS beta + Android beta |
| REG-IOS-8 / REG-AND-8 | Multisig account — create one; open its details; approve and reject a pending transaction; sign for a multisig | ✅ Pass | iOS beta + Android beta |
| REG-IOS-9 / REG-AND-9 | Remove an account | ✅ Pass | iOS beta + Android beta |
| REG-IOS-10 / REG-AND-10 | Edit an account name | ✅ Pass | iOS beta + Android beta |
| REG-IOS-84 / REG-AND-84 | Account details — the account name; its address on each network, with the QR code and the copy button; the account family, unified or solo; and the account type, such as QR-signer or watch-only | ✅ Pass | iOS beta + Android beta |
| REG-IOS-62 / REG-AND-62 | Search network; filter network; turn a network on and off | ✅ Pass | iOS beta + Android beta |
| REG-IOS-63 / REG-AND-63 | Import a custom network; import a provider; switch provider | ✅ Pass | iOS beta + Android beta |
| REG-IOS-64 / REG-AND-64 | Remove a custom network with the network on, and with it off | ✅ Pass | iOS beta + Android beta |
| REG-IOS-65 / REG-AND-65 | Define a network — add a provider; switch provider | ✅ Pass | iOS beta + Android beta |
| REG-IOS-66 / REG-AND-66 | Import a token with the network on and with it off — select network; select token type; type the contract address; scan it by QR | ✅ Pass | iOS beta + Android beta |
| REG-IOS-67 / REG-AND-67 | Remove a custom token with the token on, and with it off | ✅ Pass | iOS beta + Android beta |
| REG-IOS-68 / REG-AND-68 | Search token; filter token; turn a token on and off; token detail | ✅ Pass | iOS beta + Android beta |
| REG-IOS-46 / REG-AND-46 | All accounts mode — select account; search account; scroll the account list | ✅ Pass | iOS beta + Android beta |
| REG-IOS-47 / REG-AND-47 | Separate account mode does not show the account picker | ✅ Pass | iOS beta + Android beta |
| REG-IOS-48 / REG-AND-48 | Search network; scroll the network list; select network; filter | ✅ Pass | iOS beta + Android beta |
| REG-IOS-49 / REG-AND-49 | The explorer link opens from a history record | ✅ Pass | iOS beta + Android beta |
| REG-IOS-50 / REG-AND-50 | Change the currency, and the select currency popup | ✅ Pass | iOS beta + Android beta |
| REG-IOS-51 / REG-AND-51 | Change the language, and search within the language list | ✅ Pass | iOS beta + Android beta |
| REG-IOS-52 / REG-AND-52 | Turn in-app notifications off and on. Wallet theme is coming soon and is not checked | ✅ Pass | iOS beta + Android beta |
| REG-IOS-53 / REG-AND-53 | Change the wallet password — current password; new password; confirm; the I understand checkbox; the learn more link; save | ✅ Pass | iOS beta + Android beta |
| REG-IOS-54 / REG-AND-54 | Require unlock — change the auto-lock time; the wallet auto-locks | ✅ Pass | iOS beta + Android beta |
| REG-IOS-55 / REG-AND-55 | Face ID or Touch ID — turn the toggle off; turn it on by password; turn it on by face or touch scan | ✅ Pass | iOS beta + Android beta |
| REG-IOS-56 / REG-AND-56 | Sign for multiple transactions — turn the toggle on and off | ✅ Pass | iOS beta + Android beta |
| REG-IOS-11 / REG-AND-11 | Lock the wallet by hand | ✅ Pass | iOS beta + Android beta |
| REG-IOS-12 / REG-AND-12 | Unlock by typing the password; unlock by Face ID or Touch ID | ✅ Pass | iOS beta + Android beta |
| REG-IOS-13 / REG-AND-13 | Forgot password — reset account; erase all | ✅ Pass | iOS beta + Android beta |
| REG-IOS-44 / REG-AND-44 | The backup reminder popup — learn how to back up; remind me later; do not show again | ✅ Pass | iOS beta + Android beta |
| REG-IOS-45 / REG-AND-45 | Back up the seed phrase through export account | ✅ Pass | iOS beta + Android beta |
| REG-IOS-85 / REG-AND-85 | The app opens, backgrounds and resumes without losing state — it comes back to where it was, and does not hang on a loading screen | ✅ Pass | iOS beta + Android beta |
| AC-1 | Stage 1, iOS beta on TestFlight — every REG-IOS line passes on a fresh install | ✅ Pass | 81 of 82, REG-32 skipped |
| AC-3 | Stage 2, Android beta on Google Play beta — every REG-AND line passes on a fresh install | ✅ Pass | 81 of 82, REG-32 skipped |

81 of 82 lines done on each platform, with REG-32 skipped. That settles AC-1 and AC-3: the fresh-install regression passes on both beta builds.

What the beta stage still owes is the upgrade recheck on each build, AC-2 and AC-4. Those need the previous production version installed with its data first. Stages 3 and 4, the production rechecks, only begin once the beta stage has passed in full.

### Bugs

None.

## US-42.28 — Maintenance of chainlist (ChainList #710)

Three commits landed on the branch today, after the RPC half and the deactivated chains had already been checked. The story gains a FIX group for them, taking it to 201 lines.

The developer flagged two of the three. The third, 07dec91840, is the one that unblocks `validate-tokens` — subnet 111's assetType went from null to LOCAL, and the tooling had been crashing on it, leaving every subnet after it unvalidated.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| FIX-1 | The four chains whose broken RPCs were replaced still connect — Blast, Kaia, Cronos Testnet and Karura | ✅ Pass | Extension |
| FIX-2 | The removed endpoints are gone from the provider lists — Pocket and Tenderly on Blast, 1RPC on Kaia, Tatum on Cronos Testnet, LuckyFriday on Karura | ✅ Pass | Extension |
| FIX-3 | Multisig is offered on Bittensor and Bittensor testnet — creating a multisig, opening its details, and the signatory picker all appear where they did not before | ✅ Pass | Extension |
| NEW-M-1 | XGRChain (`xgr`, chain ID 1643, native XGR) | ✅ Pass | Extension |
| NEW-M-2 | Robinhood Chain (`robinhood_chain`, chain ID 4663, native ETH) | ✅ Pass | Extension |
| NEW-M-3 | MegaETH (`megaeth`, chain ID 4326, native ETH) | ✅ Pass | Extension |
| NEW-M-4 | Plasma (`plasma`, chain ID 9745, native XPL) | ✅ Pass | Extension |
| NEW-M-5 | Somnia (`somnia`, chain ID 5031, native SOMI) | ✅ Pass | Extension |
| NEW-M-6 | Arc (`arc`, chain ID 5042, native USDC) | ✅ Pass | Extension |
| NEW-M-7 | Sei EVM (`sei_evm`, chain ID 1329, native SEI) | ✅ Pass | Extension |
| NEW-M-8 | Kaia (`kaia`, chain ID 8217, native KAIA) | ✅ Pass | Extension |
| NEW-M-9 | Cronos (`cronos`, chain ID 25, native CRO) | ✅ Pass | Extension |
| NEW-M-10 | Berachain (`berachain`, chain ID 80094, native BERA) | ✅ Pass | Extension |
| NEW-M-11 | Ronin (`ronin`, chain ID 2020, native RON) | ✅ Pass | Extension |
| NEW-M-12 | Flow EVM (`flow_evm`, chain ID 747, native FLOW) | ✅ Pass | Extension |
| NEW-T-1 | XGR Testnet (`xgr_testnet`, chain ID 1879, native XGR) | ✅ Pass | Extension |
| NEW-T-2 | Robinhood Chain Testnet (`robinhood_chain_testnet`, chain ID 46630, native ETH) | ✅ Pass | Extension |
| NEW-T-3 | MegaETH Testnet (`megaeth_testnet`, chain ID 6343, native ETH) | ✅ Pass | Extension |
| NEW-T-4 | Plasma Testnet (`plasma_testnet`, chain ID 9746, native XPL) | ✅ Pass | Extension |
| NEW-T-5 | Somnia Testnet (`somnia_testnet`, chain ID 50312, native STT) | ✅ Pass | Extension |
| NEW-T-6 | Arc Testnet (`arc_testnet`, chain ID 5042002, native USDC) | ✅ Pass | Extension |
| NEW-T-7 | Sei EVM Testnet (`sei_evm_testnet`, chain ID 1328, native SEI) | ✅ Pass | Extension |
| NEW-T-8 | Kaia Kairos Testnet (`kaia_kairos`, chain ID 1001, native KAIA) | ✅ Pass | Extension |
| NEW-T-9 | Cronos Testnet (`cronos_testnet`, chain ID 338, native TCRO) | ✅ Pass | Extension |
| NEW-T-10 | Berachain Bepolia (`berachain_bepolia`, chain ID 80069, native BERA) | ✅ Pass | Extension |
| NEW-T-11 | Ronin Saigon Testnet (`ronin_saigon`, chain ID 202601, native RON) | ✅ Pass | Extension |
| NEW-T-12 | Flow EVM Testnet (`flow_evm_testnet`, chain ID 545, native FLOW) | ✅ Pass | Extension |
| NEW-1 | A transfer goes through on at least two new chains, and the explorer link opens the transaction | ✅ Pass | Extension |
| NEW-2 | Each new chain's native token shows the right symbol and price | ✅ Pass | Extension |
| NEW-3 | The ETH on Robinhood Chain and MegaETH is the same `ETH-Ethereum` multi-chain asset rather than a separate token, and Robinhood Chain Testnet uses `ETH-EthereumSepolia` | ✅ Pass | Extension |
| NEW-4 | Arc shows USDC as its native token — unusual, so confirm it on the balance screen and in a transfer | ✅ Pass | Extension |
| BIT-11 | Renamed subnets show their new name and icon | ✅ Pass | Extension |
| BIT-12 | Subnets with placeholder names from taostats — Unknown, for sale, deprecated, Parked, Available — render without breaking the list | ✅ Pass | Extension |
| BIT-13 | Netuids 83, 95 and 101 have no price and show no price rather than zero or a stale figure | ✅ Pass | Extension |
| FIX-7 | Subnet 103 reads Deprecated with the default icon, and subnet 116 reads Carbon with its own logo | ✅ Pass | Extension |

166 of 201 lines done. The 24 new chains are in and working, and the four checks that go with them pass — a transfer on two of them with the explorer link opening, the native symbols and prices, the shared ETH-Ethereum asset on Robinhood Chain and MegaETH, and USDC as the native token on Arc.

The Bittensor table was read against taostats as well: the renamed subnets carry their new names and icons, the placeholder names from taostats render without breaking the list, the three netuids with no CoinGecko coin show no price rather than zero, and SN103 and SN116 read Deprecated and Carbon.

FIX-4, FIX-5 and FIX-6 have not run — a multisig transaction on Bittensor end to end, subnet 111 showing its alpha balance, and the subnets after it that the tooling never validated.

Still open elsewhere: RPC-X1 and RPC-X3, the Bittensor balance checks BIT-1 to BIT-10 and BIT-14, GEN-1 to GEN-6, and the upgrade runs. GEN-1 to GEN-6 and RPC-X3 all need an upgrade carrying data from before the change.

### Bugs

None.

## Summary

Two stories moved and a third opened.

US-42.27 finished the fresh-install half of its beta stage. Both builds now run the full checklist and pass at 81 of 82 lines each, the same set on TestFlight and on Google Play beta, with REG-32 skipped for the reason it carried through the regression. Nine sections closed in this session alone, manage account among them. That settles AC-1 and AC-3.

What the beta stage still owes is the upgrade recheck on each build. Those need the previous production version installed with its data first, and the two production stages only begin once the beta stage has passed in full.

US-42.28 had three commits land on its branch mid-run, after the RPC half and the deactivated chains were already checked. The story gained a FIX group for them and went from 184 lines to 201, re-pointed 34 to 36.

Two of the three were flagged by the developer and pass: five endpoints that failed every round of a re-benchmark are gone, and multisig is now offered on Bittensor and its testnet. The third was not flagged and matters more than it looks — subnet 111's assetType went from null to LOCAL, which is the entry validate-tokens crashed on, so every subnet after it went unvalidated and the balance was never fetched either. The issue records that fault as pre-existing on dev rather than arriving with this branch.

Also done: all 24 new chains with the four checks that go with them, and the Bittensor table read against taostats for names, icons and prices. 166 of 201.

US-42.29 opened for the multisig notification work on PR #5095. 22 AC written from the issue's three symptoms and five root causes, 13 points. The weight sits in the error conditions rather than the screens, so several ACs ask for a flaky RPC or an unreadable block to be provoked deliberately.

No bugs found.
