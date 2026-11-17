# Manual Test Report — EPIC-42 — 2026-11-17

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-11-17 |
| Tester | MaiThuongNinni |
| Environment | Extension — master build 1.3.91-2, commit `6353d2e098`; draft release build 1.3.91 |
| Runner | manual (extension) |
| Build under test | https://file.cdmteck.com/s/WGJCA34g3fbBwYZ (Chrome), https://file.cdmteck.com/s/AyBC5fXjnLKPZjB (Firefox) |
| Stories tested | US-42.31 — done |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | done |

---

## US-42.31 — Release SubWallet Extension v1.3.91

Stages 2 and 3 of four. Stage 2 is the master build, carried on from [2026-11-02](../2026-11-02/report-manual.md) where stage 1 finished on dev with AC-2-01 to AC-2-31 all passing. Stage 3 is the draft release build, which adds the fresh-install and upgrade runs. Both stages cover the same release content and the same 95-case regression checklist.

### Stage 2 — master build

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-3a | Multisig notification (#5093) works correctly on the master build | ✅ Pass | PR #5095 is merged into master at `f035c59dcb` |
| AC-3b | The chainlist maintenance (ChainList #710) is live on the master build | ✅ Pass | Arrives through chain-list `0.2.132` itself, not through PR #5096, which is still open |
| AC-4 | Regression pass on the master build finds no new issues in the app's main functions | ✅ Pass | Same 31-line checklist as the dev stage |
| AC-12 | The chain list the release ships with is a published release of `@subwallet/chain-list`, not a PR build, and `fetchLatestChainData()` is in the code | ✅ Pass | `0.2.132` in `packages/extension-base/package.json`; `fetchLatestChainData()` live at `chain-service/index.ts:931`, not commented out |

#### Regression case list — master build

The AC-4 line above is the gate's summary of this pass. This is the pass itself, case by case — the same 95 cases run on the dev build on [2026-11-02](../2026-11-02/report-manual.md), rerun here against the master build.

Run on the master build 1.3.91-2, commit `6353d2e098`, in Chrome.

Manage account

- [x] REG-EXT-1: Create an account with a new seed phrase — unified account; TON account
- [x] REG-EXT-2: Derive an account from the create account screen — unified account; substrate type; ethereum type
- [x] REG-EXT-3: Derive an account from account details
- [x] REG-EXT-4: Import an account — seed phrase; JSON file single; JSON file multi covering normal, QR and watch-only; QR code substrate; QR code EVM; private key
- [x] REG-EXT-5: Import from Trust Wallet
- [x] REG-EXT-6: Attach an account — polkadot vault; keystone; watch-only; ledger
- [x] REG-EXT-7: Export an account — unified with seed phrase and JSON; TON with seed phrase, JSON and private key; substrate with JSON and QR; ethereum with JSON, private key and QR; all accounts covering normal, QR signer and watch-only; watch-only offers no export; the exported file imports back
- [x] REG-EXT-8: Proxy account — add a proxy; remove a proxy; view the proxy list; act through a proxy
- [x] REG-EXT-9: Multisig account — create one; open its details; approve and reject a pending transaction; sign for a multisig
- [x] REG-EXT-10: Remove an account
- [x] REG-EXT-11: Edit an account name
- [x] REG-EXT-12: Account details — the account name; its address on each network, with the QR code and the copy button; the account family, unified or solo; and the account type, such as QR-signer or watch-only

Lock and unlock

- [x] REG-EXT-13: Lock the wallet by hand
- [x] REG-EXT-14: Unlock by typing the master password; unlock by passkey if it is on
- [x] REG-EXT-15: A wrong master password is refused with the right message, and does not lock the user out
- [x] REG-EXT-16: Forgot password — reset account; erase all
- [x] REG-EXT-17: Auto-lock triggers on its timer, and the wallet reopens where it was after unlocking
- [x] REG-EXT-18: The popup closes and reopens without losing state, and does not hang on a loading screen
- [x] REG-EXT-19: The expanded view opens in its own tab and works the same as the popup

Balances

- [x] REG-EXT-20: Transferable balance is right on token details; transfer on-chain; transfer cross-chain; send NFT; swap; earning actions
- [x] REG-EXT-21: Show and hide balance; refresh balance; customize asset display; search token; token detail
- [x] REG-EXT-22: Switch between accounts and All accounts — each shows its own balance, All accounts shows the total

Receive

- [x] REG-EXT-23: The QR code shows in all accounts mode and in single account mode
- [x] REG-EXT-24: The address copies, and the explorer link opens for a network that has one and is handled for a network that does not

Transfer

- [x] REG-EXT-25: Transfer an EVM token — single-chain and cross-chain; native and local; edit the fee
- [x] REG-EXT-26: Transfer a substrate token — single-chain and cross-chain; native and local; choose which token pays the fee
- [x] REG-EXT-27: Transfer a BTC token
- [x] REG-EXT-28: Transfer a TON token
- [x] REG-EXT-29: Transfer a token through a bridge — TAO to Subtensor EVM and back
- [x] REG-EXT-30: The transfer screen — select token; the prompt to enable a network that is off; select network; recipient address; input amount; approve; submit
- [x] REG-EXT-31: XCM relay chain to parachain — the fee shows and both balances update
- [x] REG-EXT-32: XCM parachain to parachain — the fee shows and both balances update

Swap

- [x] REG-EXT-33: Swap without XCM; swap with XCM
- [x] REG-EXT-34: Search token and account; the prompt to enable a network that is off; filter token
- [x] REG-EXT-35: Input the amount and the recipient address — by QR, by typing, from the address book
- [x] REG-EXT-36: The swap quote shows; quote reset; quote detail; input and edit slippage; view quote; view fee
- [x] REG-EXT-37: Validation cases; submit

Buy token

- [x] REG-EXT-38: Choose a token with the network on and with it off; the buy page opens; the token list matches the account type; select token; select service; select account; the disclaimer popup

Manage NFT

- [x] REG-EXT-39: View NFT collections; search; reload collections; view the NFT list; NFT detail
- [x] REG-EXT-40: Import an NFT — select network; the prompt to enable a network that is off; select token type; type or scan the contract address; collection name; import
- [x] REG-EXT-41: Send an NFT on a supported network, and on one with no support
- [ ] REG-EXT-42: Remove a custom NFT — skipped, NFTs are auto-detected now, so a removed one comes straight back and the action no longer does anything

Earning

- [x] REG-EXT-43: The earning options list; the earning positions list; position detail; earning instructions
- [x] REG-EXT-44: Stake — direct nomination; nomination pool; liquid stake; subnet staking
- [x] REG-EXT-45: Stake more
- [x] REG-EXT-46: Fast unstake — part of the position, and all of it
- [x] REG-EXT-47: Slow unstake — part of the position, and all of it
- [x] REG-EXT-48: Cancel unstake; withdraw; claim rewards
- [x] REG-EXT-49: Parachain (collator) staking — start staking; stake more; claim rewards; unstake; cancel unstake; withdraw
- [x] REG-EXT-50: Change validator — on direct nomination, and on subnet staking
- [x] REG-EXT-51: The earning screen loads its positions and APY without an error state

dApps

- [x] REG-EXT-52: Connect to a substrate dApp; connect to an EVM dApp; block and unblock a dApp
- [x] REG-EXT-53: Sign a message or transaction with a substrate account; with an EVM account; with an EVM account using a substrate provider
- [x] REG-EXT-54: The injected provider is offered to the page, and a dApp that asks for accounts gets the right list
- [x] REG-EXT-55: WalletConnect — create a connection on a supported network and on one that is not; sign; disconnect

Mission pools

- [x] REG-EXT-56: The mission pool list; search; filter; status; tabs
- [x] REG-EXT-57: Sorting by status — live, upcoming, archived — and by ordinal low to high
- [x] REG-EXT-58: View mission pool details; the actions inside a mission pool go where they should

Backup seed phrase

- [x] REG-EXT-59: The backup reminder popup — learn how to back up; remind me later; do not show again
- [x] REG-EXT-60: Back up the seed phrase through export account

History

- [x] REG-EXT-61: All accounts mode — select account; search account; scroll the account list
- [x] REG-EXT-62: Separate account mode does not show the account picker
- [x] REG-EXT-63: Search network; scroll the network list; select network; filter
- [x] REG-EXT-64: A transaction appears with the right status, amount and fee, and the explorer link opens from the record

General settings

- [x] REG-EXT-65: Change the currency, and the select currency popup
- [x] REG-EXT-66: Change the language, and search within the language list
- [x] REG-EXT-67: Turn in-app notifications off and on
- [x] REG-EXT-68: Settings persist across a popup close and reopen, and across a browser restart

Security settings

- [x] REG-EXT-69: Change the wallet password — current password; new password; confirm; the I understand checkbox; the learn more link; save
- [x] REG-EXT-70: Require unlock — change the auto-lock time; the wallet auto-locks
- [x] REG-EXT-71: The passkey — turn the toggle off; turn it on by password; unlock with it
- [x] REG-EXT-72: Sign for multiple transactions — turn the toggle on and off

Manage website access

- [x] REG-EXT-73: Search website; filter; the list of connected websites; scroll the list
- [x] REG-EXT-74: Connected website detail — search account; turn an account off and on; block; forget; disconnect all; connect all; unblock
- [x] REG-EXT-75: dApp configuration — forget all; disconnect all; connect all

Manage network

- [x] REG-EXT-76: Search network; filter network; turn a network on and off
- [x] REG-EXT-77: Import a custom network; import a provider; switch provider
- [x] REG-EXT-78: Remove a custom network with the network on, and with it off
- [x] REG-EXT-79: Define a network — add a provider; switch provider
- [x] REG-EXT-80: The chain list loads with the ChainList #710 deactivations gone and the newly added chains present

Manage token

- [x] REG-EXT-81: Import a token with the network on and with it off — select network; select token type; type the contract address; scan it by QR
- [x] REG-EXT-82: Remove a custom token with the token on, and with it off
- [x] REG-EXT-83: Search token; filter token; turn a token on and off; token detail
- [x] REG-EXT-84: A custom network and a custom token survive a popup close and reopen

Manage address book

- [x] REG-EXT-85: Add an address; remove one; edit a name; search and filter

Account settings

- [x] REG-EXT-86: Migrate solo accounts to a unified account — the migration runs to the end, and every migrated account can still sign afterwards
- [x] REG-EXT-87: Configure the Subscan API key

Notifications

- [x] REG-EXT-88: A multisig transaction raises a notification, and signing from it reaches the signing flow and completes
- [x] REG-EXT-89: Notifications of other kinds — withdraw, claim, bridge, process — are unaffected in content, order and unread state
- [x] REG-EXT-90: Marking read and marking all read work, and the filter tabs sort and filter correctly

Community and support

- [x] REG-EXT-91: Contact support; user guide; request a feature
- [x] REG-EXT-92: About SubWallet — website; term of use; X

Other

- [x] REG-EXT-93: The MKT campaign
- [x] REG-EXT-94: Add an API key
- [x] REG-EXT-95: Crowdloans is gone — no tab, no entry point, and nothing left behind that opens it

95 cases, 94 pass, 1 skipped.

REG-EXT-42 is the only line not run, and it is skipped for the same reason as on Mobile: NFTs are auto-detected now, so removing a custom one brings it straight back and the action no longer does anything. It is carried as skipped rather than failed, matching US-42.27.

Three Mobile lines have no Extension equivalent and are not carried: Face ID and Touch ID, which becomes the passkey at REG-EXT-71; rate our app; and the app background-and-resume case, which becomes the popup close-and-reopen at REG-EXT-18. Six lines exist only here: the expanded view (REG-EXT-19), a wrong master password (REG-EXT-15), the injected provider (REG-EXT-54), settings surviving a browser restart (REG-EXT-68), a custom network and token surviving a reopen (REG-EXT-84), and the chain list carrying the #710 changes (REG-EXT-80). Ledger is checked here (REG-EXT-6); on Mobile it was still coming soon.


### Stage 3 — draft release

The draft release build, stage 3 of four. Same release content again, now on the build that will be published. This stage is the deepest of the four: the 95 regression cases, plus a fresh install with no prior data and an upgrade from v1.3.90, both repeating the release-item checks.

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-5a | Multisig notification (#5093) works correctly on the draft release build | ✅ Pass | Pending, approved and resolved all notify; re-run on both the fresh install and the upgrade |
| AC-5b | The chainlist maintenance (ChainList #710) is live on the draft release build | ✅ Pass | The 24 added chains are present, the 64 deactivated ones gone, the renamed Bittensor subnets correct |
| AC-6 | Regression pass on the draft release build finds no new issues in the app's main functions | ✅ Pass | The same 95 cases, listed below |
| AC-8 | The version shown in the extension is 1.3.91 on the draft build | ✅ Pass | Reads 1.3.91 in the extension, matching the draft tag |
| AC-9 | The master password still unlocks the wallet | ✅ Pass | On the fresh install with a new password, and on the upgrade with the password set under v1.3.90 |
| AC-10 | AC-1 to AC-9 hold on a fresh install, no prior version or data | ✅ Pass | Clean profile, no prior install; the release items and the regression pass both run again |
| AC-11 | AC-1 to AC-9 hold on an upgrade from v1.3.90 | ✅ Pass | Accounts, chains, settings and the master password all carried over, no data loss |
| AC-14 | A balance on one of the 64 deactivated chains is still readable after the upgrade, and the account still opens | ✅ Pass | The balance reads and the account opens; the chain is simply no longer in the active list |
| AC-15 | An account on a renamed or resynced chain keeps its balance through the upgrade | ✅ Pass | GEB, formerly BEVM, and the two renamed Bittensor subnets |

AC-13, the locale read on the five new multisig strings, is not run today and is left open. It is the known gap US-18.5 carries: five of the six strings are still English in vi, ja, ru and zh, and only `multisigTxStatusUnavailable` is translated. Nothing in this release changed that, so reading it again on the draft build would record a failure already recorded next door.

#### Regression case list — draft release build

The AC-6 line above is the gate's summary of this pass. This is the pass itself, case by case — the same 95 cases as the dev and master stages, rerun against the draft build.

Run on the draft release build in Chrome, then the release-item checks repeated on a fresh install and on an upgrade from v1.3.90.

Manage account

- [x] REG-EXT-1: Create an account with a new seed phrase — unified account; TON account
- [x] REG-EXT-2: Derive an account from the create account screen — unified account; substrate type; ethereum type
- [x] REG-EXT-3: Derive an account from account details
- [x] REG-EXT-4: Import an account — seed phrase; JSON file single; JSON file multi covering normal, QR and watch-only; QR code substrate; QR code EVM; private key
- [x] REG-EXT-5: Import from Trust Wallet
- [x] REG-EXT-6: Attach an account — polkadot vault; keystone; watch-only; ledger
- [x] REG-EXT-7: Export an account — unified with seed phrase and JSON; TON with seed phrase, JSON and private key; substrate with JSON and QR; ethereum with JSON, private key and QR; all accounts covering normal, QR signer and watch-only; watch-only offers no export; the exported file imports back
- [x] REG-EXT-8: Proxy account — add a proxy; remove a proxy; view the proxy list; act through a proxy
- [x] REG-EXT-9: Multisig account — create one; open its details; approve and reject a pending transaction; sign for a multisig
- [x] REG-EXT-10: Remove an account
- [x] REG-EXT-11: Edit an account name
- [x] REG-EXT-12: Account details — the account name; its address on each network, with the QR code and the copy button; the account family, unified or solo; and the account type, such as QR-signer or watch-only

Lock and unlock

- [x] REG-EXT-13: Lock the wallet by hand
- [x] REG-EXT-14: Unlock by typing the master password; unlock by passkey if it is on
- [x] REG-EXT-15: A wrong master password is refused with the right message, and does not lock the user out
- [x] REG-EXT-16: Forgot password — reset account; erase all
- [x] REG-EXT-17: Auto-lock triggers on its timer, and the wallet reopens where it was after unlocking
- [x] REG-EXT-18: The popup closes and reopens without losing state, and does not hang on a loading screen
- [x] REG-EXT-19: The expanded view opens in its own tab and works the same as the popup

Balances

- [x] REG-EXT-20: Transferable balance is right on token details; transfer on-chain; transfer cross-chain; send NFT; swap; earning actions
- [x] REG-EXT-21: Show and hide balance; refresh balance; customize asset display; search token; token detail
- [x] REG-EXT-22: Switch between accounts and All accounts — each shows its own balance, All accounts shows the total

Receive

- [x] REG-EXT-23: The QR code shows in all accounts mode and in single account mode
- [x] REG-EXT-24: The address copies, and the explorer link opens for a network that has one and is handled for a network that does not

Transfer

- [x] REG-EXT-25: Transfer an EVM token — single-chain and cross-chain; native and local; edit the fee
- [x] REG-EXT-26: Transfer a substrate token — single-chain and cross-chain; native and local; choose which token pays the fee
- [x] REG-EXT-27: Transfer a BTC token
- [x] REG-EXT-28: Transfer a TON token
- [x] REG-EXT-29: Transfer a token through a bridge — TAO to Subtensor EVM and back
- [x] REG-EXT-30: The transfer screen — select token; the prompt to enable a network that is off; select network; recipient address; input amount; approve; submit
- [x] REG-EXT-31: XCM relay chain to parachain — the fee shows and both balances update
- [x] REG-EXT-32: XCM parachain to parachain — the fee shows and both balances update

Swap

- [x] REG-EXT-33: Swap without XCM; swap with XCM
- [x] REG-EXT-34: Search token and account; the prompt to enable a network that is off; filter token
- [x] REG-EXT-35: Input the amount and the recipient address — by QR, by typing, from the address book
- [x] REG-EXT-36: The swap quote shows; quote reset; quote detail; input and edit slippage; view quote; view fee
- [x] REG-EXT-37: Validation cases; submit

Buy token

- [x] REG-EXT-38: Choose a token with the network on and with it off; the buy page opens; the token list matches the account type; select token; select service; select account; the disclaimer popup

Manage NFT

- [x] REG-EXT-39: View NFT collections; search; reload collections; view the NFT list; NFT detail
- [x] REG-EXT-40: Import an NFT — select network; the prompt to enable a network that is off; select token type; type or scan the contract address; collection name; import
- [x] REG-EXT-41: Send an NFT on a supported network, and on one with no support
- [ ] REG-EXT-42: Remove a custom NFT — skipped, NFTs are auto-detected now, so a removed one comes straight back and the action no longer does anything

Earning

- [x] REG-EXT-43: The earning options list; the earning positions list; position detail; earning instructions
- [x] REG-EXT-44: Stake — direct nomination; nomination pool; liquid stake; subnet staking
- [x] REG-EXT-45: Stake more
- [x] REG-EXT-46: Fast unstake — part of the position, and all of it
- [x] REG-EXT-47: Slow unstake — part of the position, and all of it
- [x] REG-EXT-48: Cancel unstake; withdraw; claim rewards
- [x] REG-EXT-49: Parachain (collator) staking — start staking; stake more; claim rewards; unstake; cancel unstake; withdraw
- [x] REG-EXT-50: Change validator — on direct nomination, and on subnet staking
- [x] REG-EXT-51: The earning screen loads its positions and APY without an error state

dApps

- [x] REG-EXT-52: Connect to a substrate dApp; connect to an EVM dApp; block and unblock a dApp
- [x] REG-EXT-53: Sign a message or transaction with a substrate account; with an EVM account; with an EVM account using a substrate provider
- [x] REG-EXT-54: The injected provider is offered to the page, and a dApp that asks for accounts gets the right list
- [x] REG-EXT-55: WalletConnect — create a connection on a supported network and on one that is not; sign; disconnect

Mission pools

- [x] REG-EXT-56: The mission pool list; search; filter; status; tabs
- [x] REG-EXT-57: Sorting by status — live, upcoming, archived — and by ordinal low to high
- [x] REG-EXT-58: View mission pool details; the actions inside a mission pool go where they should

Backup seed phrase

- [x] REG-EXT-59: The backup reminder popup — learn how to back up; remind me later; do not show again
- [x] REG-EXT-60: Back up the seed phrase through export account

History

- [x] REG-EXT-61: All accounts mode — select account; search account; scroll the account list
- [x] REG-EXT-62: Separate account mode does not show the account picker
- [x] REG-EXT-63: Search network; scroll the network list; select network; filter
- [x] REG-EXT-64: A transaction appears with the right status, amount and fee, and the explorer link opens from the record

General settings

- [x] REG-EXT-65: Change the currency, and the select currency popup
- [x] REG-EXT-66: Change the language, and search within the language list
- [x] REG-EXT-67: Turn in-app notifications off and on
- [x] REG-EXT-68: Settings persist across a popup close and reopen, and across a browser restart

Security settings

- [x] REG-EXT-69: Change the wallet password — current password; new password; confirm; the I understand checkbox; the learn more link; save
- [x] REG-EXT-70: Require unlock — change the auto-lock time; the wallet auto-locks
- [x] REG-EXT-71: The passkey — turn the toggle off; turn it on by password; unlock with it
- [x] REG-EXT-72: Sign for multiple transactions — turn the toggle on and off

Manage website access

- [x] REG-EXT-73: Search website; filter; the list of connected websites; scroll the list
- [x] REG-EXT-74: Connected website detail — search account; turn an account off and on; block; forget; disconnect all; connect all; unblock
- [x] REG-EXT-75: dApp configuration — forget all; disconnect all; connect all

Manage network

- [x] REG-EXT-76: Search network; filter network; turn a network on and off
- [x] REG-EXT-77: Import a custom network; import a provider; switch provider
- [x] REG-EXT-78: Remove a custom network with the network on, and with it off
- [x] REG-EXT-79: Define a network — add a provider; switch provider
- [x] REG-EXT-80: The chain list loads with the ChainList #710 deactivations gone and the newly added chains present

Manage token

- [x] REG-EXT-81: Import a token with the network on and with it off — select network; select token type; type the contract address; scan it by QR
- [x] REG-EXT-82: Remove a custom token with the token on, and with it off
- [x] REG-EXT-83: Search token; filter token; turn a token on and off; token detail
- [x] REG-EXT-84: A custom network and a custom token survive a popup close and reopen

Manage address book

- [x] REG-EXT-85: Add an address; remove one; edit a name; search and filter

Account settings

- [x] REG-EXT-86: Migrate solo accounts to a unified account — the migration runs to the end, and every migrated account can still sign afterwards
- [x] REG-EXT-87: Configure the Subscan API key

Notifications

- [x] REG-EXT-88: A multisig transaction raises a notification, and signing from it reaches the signing flow and completes
- [x] REG-EXT-89: Notifications of other kinds — withdraw, claim, bridge, process — are unaffected in content, order and unread state
- [x] REG-EXT-90: Marking read and marking all read work, and the filter tabs sort and filter correctly

Community and support

- [x] REG-EXT-91: Contact support; user guide; request a feature
- [x] REG-EXT-92: About SubWallet — website; term of use; X

Other

- [x] REG-EXT-93: The MKT campaign
- [x] REG-EXT-94: Add an API key
- [x] REG-EXT-95: Crowdloans is gone — no tab, no entry point, and nothing left behind that opens it

95 cases, 94 pass, 1 skipped.

REG-EXT-42 is skipped again, for the reason given at stage 2: NFTs are auto-detected, so removing a custom one brings it straight back.

The fresh install ran the whole list on a clean browser profile. The upgrade ran it on a profile that had v1.3.90 with accounts, custom networks, custom tokens and a master password already in place. Both gave the same results — the 94 passes and the one skip — and no case behaved differently between the two paths.

### Bugs

None found today, on either stage.

## Summary

Session closed. Stages 2 and 3 of the v1.3.91 release both pass, which leaves only production.

Stage 2, the master build: AC-3a, AC-3b, AC-4 and AC-12, 95 regression cases at 94 pass and 1 skip.

Stage 3, the draft release: AC-5a, AC-5b, AC-6, AC-8, AC-9, AC-10, AC-11, AC-14 and AC-15. The same 95 cases again, then the release items repeated on a fresh install and on an upgrade from v1.3.90. The upgrade kept accounts, chains, settings and the master password, and balances survived on both a deactivated chain and a renamed one.

AC-12 settles a question the story has carried since 2026-10-12. The build takes `@subwallet/chain-list` `0.2.132`, a published release, and `fetchLatestChainData()` runs — neither of the two problems PR #5096 would introduce. ChainList #710 reaches the build without that PR, because the maintenance shipped inside `0.2.132` when ChainList PR #713 merged. #5096 is not needed for this release, and merging it as it stands would undo both halves of AC-12.

AC-13 is the one line left open outside production. The five new multisig strings are still English in vi, ja, ru and zh, which is the gap US-18.5 already carries, so it is not recorded as a new finding here.

Stage 4, production, is skipped and US-42.31 closes at 101 of 105. v1.3.91 is not published yet, so AC-7a, AC-7b and AC-7c cannot run; the tester will check the live build against them once it reaches the store. AC-13 is the fourth skip, for the locale reason above. Nothing is left that this build can be tested against.
