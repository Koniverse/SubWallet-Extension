# Manual Test Report — EPIC-42 — 2026-10-08

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-08 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight and Google Play beta build numbers |
| Stories tested | US-42.27, US-42.29 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.27 — Release SubWallet Mobile

The whole Android checklist was run again today on the beta build: all 82 lines, 81 passing with REG-AND-32 skipped for the reason it carried through the regression. The iOS beta build was run on the Manage account section, twelve lines, all passing.

This is recorded here only. The story's checklist is unchanged.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-AND-1 | Create an account with a new seed phrase — unified account; TON account | ✅ Pass | Android beta |
| REG-AND-2 | Derive an account from the create account screen — unified account; substrate type; ethereum type | ✅ Pass | Android beta |
| REG-AND-3 | Derive an account from account details | ✅ Pass | Android beta |
| REG-AND-4 | Import an account — seed phrase; JSON file single; JSON file multi covering normal, QR and watch-only; QR code substrate; QR code EVM; private key | ✅ Pass | Android beta |
| REG-AND-78 | Import from Trust Wallet | ✅ Pass | Android beta |
| REG-AND-5 | Attach an account — polkadot vault; keystone; watch-only. Ledger is coming soon and is not checked | ✅ Pass | Android beta |
| REG-AND-6 | Export an account — unified with seed phrase and JSON; TON with seed phrase, JSON and private key; substrate with JSON and QR; ethereum with JSON, private key and QR; all accounts covering normal, QR signer and watch-only; watch-only offers no export; the exported file imports back | ✅ Pass | Android beta |
| REG-AND-7 | Proxy account — add a proxy; remove a proxy; view the proxy list; act through a proxy | ✅ Pass | Android beta |
| REG-AND-8 | Multisig account — create one; open its details; approve and reject a pending transaction; sign for a multisig | ✅ Pass | Android beta |
| REG-AND-9 | Remove an account | ✅ Pass | Android beta |
| REG-AND-10 | Edit an account name | ✅ Pass | Android beta |
| REG-AND-84 | Account details — the account name; its address on each network, with the QR code and the copy button; the account family, unified or solo; and the account type, such as QR-signer or watch-only | ✅ Pass | Android beta |
| REG-AND-11 | Lock the wallet by hand | ✅ Pass | Android beta |
| REG-AND-12 | Unlock by typing the password; unlock by Face ID or Touch ID | ✅ Pass | Android beta |
| REG-AND-13 | Forgot password — reset account; erase all | ✅ Pass | Android beta |
| REG-AND-85 | The app opens, backgrounds and resumes without losing state — it comes back to where it was, and does not hang on a loading screen | ✅ Pass | Android beta |
| REG-AND-14 | Transferable balance is right on token details; transfer on-chain; transfer cross-chain; send NFT; swap; earning actions | ✅ Pass | Android beta |
| REG-AND-15 | Show and hide balance; refresh balance; customize asset display; search token; token detail | ✅ Pass | Android beta |
| REG-AND-16 | The QR code shows in all accounts mode and in single account mode | ✅ Pass | Android beta |
| REG-AND-17 | The explorer link opens for a network that has one, and is handled for a network that does not | ✅ Pass | Android beta |
| REG-AND-18 | Transfer an EVM token — single-chain and cross-chain; native and local; edit the fee | ✅ Pass | Android beta |
| REG-AND-19 | Transfer a substrate token — single-chain and cross-chain; native and local; choose which token pays the fee | ✅ Pass | Android beta |
| REG-AND-20 | Transfer a BTC token | ✅ Pass | Android beta |
| REG-AND-21 | Transfer a TON token | ✅ Pass | Android beta |
| REG-AND-79 | Transfer a token through a bridge — TAO to Subtensor EVM and back | ✅ Pass | Android beta |
| REG-AND-22 | The transfer screen — select token; the prompt to enable a network that is off; select network; recipient address; input amount; approve; submit | ✅ Pass | Android beta |
| REG-AND-23 | Swap without XCM; swap with XCM | ✅ Pass | Android beta |
| REG-AND-24 | Search token and account; the prompt to enable a network that is off; filter token | ✅ Pass | Android beta |
| REG-AND-25 | Input the amount and the recipient address — by QR, by typing, from the address book | ✅ Pass | Android beta |
| REG-AND-26 | The swap quote shows; quote reset; quote detail; input and edit slippage; view quote; view fee | ✅ Pass | Android beta |
| REG-AND-27 | Validation cases; submit | ✅ Pass | Android beta |
| REG-AND-28 | Choose a token with the network on and with it off; the buy page opens; the token list matches the account type; select token; select service; select account; the disclaimer popup | ✅ Pass | Android beta |
| REG-AND-29 | View NFT collections; search; reload collections; view the NFT list; NFT detail | ✅ Pass | Android beta |
| REG-AND-30 | Import an NFT — select network; the prompt to enable a network that is off; select token type; type or scan the contract address; collection name; import | ✅ Pass | Android beta |
| REG-AND-31 | Send an NFT on a supported network, and on one with no support | ✅ Pass | Android beta |
| REG-AND-32 | Remove a custom NFT | ⏭️ Skipped | Android beta — NFTs are auto-detected now, so a removed one comes straight back and the action no longer does anything |
| REG-AND-33 | The earning options list; the earning positions list; position detail; earning instructions | ✅ Pass | Android beta |
| REG-AND-34 | Stake — direct nomination; nomination pool; liquid stake; subnet staking | ✅ Pass | Android beta |
| REG-AND-35 | Stake more | ✅ Pass | Android beta |
| REG-AND-36 | Fast unstake — part of the position, and all of it | ✅ Pass | Android beta |
| REG-AND-37 | Slow unstake — part of the position, and all of it | ✅ Pass | Android beta |
| REG-AND-38 | Cancel unstake; withdraw; claim rewards | ✅ Pass | Android beta |
| REG-AND-80 | Parachain (collator) staking — start staking; stake more; claim rewards; unstake; cancel unstake; withdraw | ✅ Pass | Android beta |
| REG-AND-81 | Change validator — on direct nomination, and on subnet staking | ✅ Pass | Android beta |
| REG-AND-39 | Connect to a substrate dApp; connect to an EVM dApp; block and unblock a dApp | ✅ Pass | Android beta |
| REG-AND-40 | Sign a message or transaction with a substrate account; with an EVM account; with an EVM account using a substrate provider | ✅ Pass | Android beta |
| REG-AND-41 | The mission pool list; search; filter; status; tabs | ✅ Pass | Android beta |
| REG-AND-42 | Sorting by status — live, upcoming, archived — and by ordinal low to high, matching the Extension | ✅ Pass | Android beta |
| REG-AND-43 | View mission pool details; the actions inside a mission pool go where they should; scroll up and down, left and right | ✅ Pass | Android beta |
| REG-AND-44 | The backup reminder popup — learn how to back up; remind me later; do not show again | ✅ Pass | Android beta |
| REG-AND-45 | Back up the seed phrase through export account | ✅ Pass | Android beta |
| REG-AND-46 | All accounts mode — select account; search account; scroll the account list | ✅ Pass | Android beta |
| REG-AND-47 | Separate account mode does not show the account picker | ✅ Pass | Android beta |
| REG-AND-48 | Search network; scroll the network list; select network; filter | ✅ Pass | Android beta |
| REG-AND-49 | The explorer link opens from a history record | ✅ Pass | Android beta |
| REG-AND-50 | Change the currency, and the select currency popup | ✅ Pass | Android beta |
| REG-AND-51 | Change the language, and search within the language list | ✅ Pass | Android beta |
| REG-AND-52 | Turn in-app notifications off and on. Wallet theme is coming soon and is not checked | ✅ Pass | Android beta |
| REG-AND-53 | Change the wallet password — current password; new password; confirm; the I understand checkbox; the learn more link; save | ✅ Pass | Android beta |
| REG-AND-54 | Require unlock — change the auto-lock time; the wallet auto-locks | ✅ Pass | Android beta |
| REG-AND-55 | Face ID or Touch ID — turn the toggle off; turn it on by password; turn it on by face or touch scan | ✅ Pass | Android beta |
| REG-AND-56 | Sign for multiple transactions — turn the toggle on and off | ✅ Pass | Android beta |
| REG-AND-57 | Search website; filter; the list of connected websites; scroll the list | ✅ Pass | Android beta |
| REG-AND-58 | Connected website detail — search account; turn an account off and on; block; forget; disconnect all; connect all; unblock | ✅ Pass | Android beta |
| REG-AND-59 | dApp configuration — forget all; disconnect all; connect all | ✅ Pass | Android beta |
| REG-AND-60 | Create a new connection on a supported network, and on one that is not supported | ✅ Pass | Android beta |
| REG-AND-61 | Search; website detail; sign a message or transaction with a substrate and an EVM account; disconnect | ✅ Pass | Android beta |
| REG-AND-62 | Search network; filter network; turn a network on and off | ✅ Pass | Android beta |
| REG-AND-63 | Import a custom network; import a provider; switch provider | ✅ Pass | Android beta |
| REG-AND-64 | Remove a custom network with the network on, and with it off | ✅ Pass | Android beta |
| REG-AND-65 | Define a network — add a provider; switch provider | ✅ Pass | Android beta |
| REG-AND-66 | Import a token with the network on and with it off — select network; select token type; type the contract address; scan it by QR | ✅ Pass | Android beta |
| REG-AND-67 | Remove a custom token with the token on, and with it off | ✅ Pass | Android beta |
| REG-AND-68 | Search token; filter token; turn a token on and off; token detail | ✅ Pass | Android beta |
| REG-AND-69 | Add an address; remove one; edit a name; search and filter | ✅ Pass | Android beta |
| REG-AND-70 | Migrate solo accounts to a unified account — the migration runs to the end, and every migrated account can still sign afterwards | ✅ Pass | Android beta |
| REG-AND-82 | Configure the Subscan API key | ✅ Pass | Android beta |
| REG-AND-71 | Contact support; user guide; request a feature | ✅ Pass | Android beta |
| REG-AND-72 | About SubWallet — website; term of use; X; rate our app | ✅ Pass | Android beta |
| REG-AND-73 | The MKT campaign | ✅ Pass | Android beta |
| REG-AND-74 | Add an API key | ✅ Pass | Android beta |
| REG-AND-83 | Crowdloans is gone — no tab, no entry point, and nothing left behind that opens it | ✅ Pass | Android beta |

81 of 82 pass on the Android beta build, with REG-AND-32 skipped.

The iOS beta build was run on the Manage account section as well, all twelve lines:

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-IOS-1 | Create an account with a new seed phrase — unified account; TON account | ✅ Pass | iOS beta |
| REG-IOS-2 | Derive an account from the create account screen — unified account; substrate type; ethereum type | ✅ Pass | iOS beta |
| REG-IOS-3 | Derive an account from account details | ✅ Pass | iOS beta |
| REG-IOS-4 | Import an account — seed phrase; JSON file single; JSON file multi covering normal, QR and watch-only; QR code substrate; QR code EVM; private key | ✅ Pass | iOS beta |
| REG-IOS-78 | Import from Trust Wallet | ✅ Pass | iOS beta |
| REG-IOS-5 | Attach an account — polkadot vault; keystone; watch-only. Ledger is coming soon and is not checked | ✅ Pass | iOS beta |
| REG-IOS-6 | Export an account — unified with seed phrase and JSON; TON with seed phrase, JSON and private key; substrate with JSON and QR; ethereum with JSON, private key and QR; all accounts covering normal, QR signer and watch-only; watch-only offers no export; the exported file imports back | ✅ Pass | iOS beta |
| REG-IOS-7 | Proxy account — add a proxy; remove a proxy; view the proxy list; act through a proxy | ✅ Pass | iOS beta |
| REG-IOS-8 | Multisig account — create one; open its details; approve and reject a pending transaction; sign for a multisig | ✅ Pass | iOS beta |
| REG-IOS-9 | Remove an account | ✅ Pass | iOS beta |
| REG-IOS-10 | Edit an account name | ✅ Pass | iOS beta |
| REG-IOS-84 | Account details — the account name; its address on each network, with the QR code and the copy button; the account family, unified or solo; and the account type, such as QR-signer or watch-only | ✅ Pass | iOS beta |

Left to run: the upgrade recheck on each build — UPG-IOS-1 to 3 and UPG-AND-1 to 3, which settle AC-2 and AC-4 — then the two production stages. The upgrade rechecks need the previous production version installed with its data first.

### Bugs

None.

## US-42.29 — Improve multisig notification (#5093)

Started today, against PR #5095. The first two lines cover the symptom the issue opens with: a notification that appeared and then disappeared on its own, sometimes coming back later as a new unread one with a new timestamp.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1 | A pending multisig transaction raises a notification, and it is still there after a minute of the app sitting idle | ✅ Pass | Extension |
| AC-2 | The notification does not disappear and reappear with a new timestamp while the transaction stays pending | ✅ Pass | Extension |

2 of 22. What is left needs the conditions provoked on purpose — a failing RPC for AC-7 to AC-9, and a transaction driven through approve, execute and cancel for AC-10 to AC-17.

### Bugs

None.

## Summary

Session in progress.
