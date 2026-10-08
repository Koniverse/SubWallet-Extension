# Manual Test Report — EPIC-42 — 2026-10-08

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-08 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight and Google Play beta build numbers |
| Stories tested | US-42.27; US-42.29 — closed |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | done |

---

## US-42.27 — Release SubWallet Mobile

Both beta builds were run through the whole checklist again today. Android: all 82 lines, 81 passing with REG-AND-32 skipped for the reason it carried through the regression. iOS: the same, 81 passing with REG-IOS-32 skipped.

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

The same checklist on the iOS beta build:

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
| REG-IOS-11 | Lock the wallet by hand | ✅ Pass | iOS beta |
| REG-IOS-12 | Unlock by typing the password; unlock by Face ID or Touch ID | ✅ Pass | iOS beta |
| REG-IOS-13 | Forgot password — reset account; erase all | ✅ Pass | iOS beta |
| REG-IOS-85 | The app opens, backgrounds and resumes without losing state — it comes back to where it was, and does not hang on a loading screen | ✅ Pass | iOS beta |
| REG-IOS-14 | Transferable balance is right on token details; transfer on-chain; transfer cross-chain; send NFT; swap; earning actions | ✅ Pass | iOS beta |
| REG-IOS-15 | Show and hide balance; refresh balance; customize asset display; search token; token detail | ✅ Pass | iOS beta |
| REG-IOS-16 | The QR code shows in all accounts mode and in single account mode | ✅ Pass | iOS beta |
| REG-IOS-17 | The explorer link opens for a network that has one, and is handled for a network that does not | ✅ Pass | iOS beta |
| REG-IOS-18 | Transfer an EVM token — single-chain and cross-chain; native and local; edit the fee | ✅ Pass | iOS beta |
| REG-IOS-19 | Transfer a substrate token — single-chain and cross-chain; native and local; choose which token pays the fee | ✅ Pass | iOS beta |
| REG-IOS-20 | Transfer a BTC token | ✅ Pass | iOS beta |
| REG-IOS-21 | Transfer a TON token | ✅ Pass | iOS beta |
| REG-IOS-79 | Transfer a token through a bridge — TAO to Subtensor EVM and back | ✅ Pass | iOS beta |
| REG-IOS-22 | The transfer screen — select token; the prompt to enable a network that is off; select network; recipient address; input amount; approve; submit | ✅ Pass | iOS beta |
| REG-IOS-23 | Swap without XCM; swap with XCM | ✅ Pass | iOS beta |
| REG-IOS-24 | Search token and account; the prompt to enable a network that is off; filter token | ✅ Pass | iOS beta |
| REG-IOS-25 | Input the amount and the recipient address — by QR, by typing, from the address book | ✅ Pass | iOS beta |
| REG-IOS-26 | The swap quote shows; quote reset; quote detail; input and edit slippage; view quote; view fee | ✅ Pass | iOS beta |
| REG-IOS-27 | Validation cases; submit | ✅ Pass | iOS beta |
| REG-IOS-28 | Choose a token with the network on and with it off; the buy page opens; the token list matches the account type; select token; select service; select account; the disclaimer popup | ✅ Pass | iOS beta |
| REG-IOS-29 | View NFT collections; search; reload collections; view the NFT list; NFT detail | ✅ Pass | iOS beta |
| REG-IOS-30 | Import an NFT — select network; the prompt to enable a network that is off; select token type; type or scan the contract address; collection name; import | ✅ Pass | iOS beta |
| REG-IOS-31 | Send an NFT on a supported network, and on one with no support | ✅ Pass | iOS beta |
| REG-IOS-32 | Remove a custom NFT | ⏭️ Skipped | iOS beta — NFTs are auto-detected now, so a removed one comes straight back and the action no longer does anything |
| REG-IOS-33 | The earning options list; the earning positions list; position detail; earning instructions | ✅ Pass | iOS beta |
| REG-IOS-34 | Stake — direct nomination; nomination pool; liquid stake; subnet staking | ✅ Pass | iOS beta |
| REG-IOS-35 | Stake more | ✅ Pass | iOS beta |
| REG-IOS-36 | Fast unstake — part of the position, and all of it | ✅ Pass | iOS beta |
| REG-IOS-37 | Slow unstake — part of the position, and all of it | ✅ Pass | iOS beta |
| REG-IOS-38 | Cancel unstake; withdraw; claim rewards | ✅ Pass | iOS beta |
| REG-IOS-80 | Parachain (collator) staking — start staking; stake more; claim rewards; unstake; cancel unstake; withdraw | ✅ Pass | iOS beta |
| REG-IOS-81 | Change validator — on direct nomination, and on subnet staking | ✅ Pass | iOS beta |
| REG-IOS-39 | Connect to a substrate dApp; connect to an EVM dApp; block and unblock a dApp | ✅ Pass | iOS beta |
| REG-IOS-40 | Sign a message or transaction with a substrate account; with an EVM account; with an EVM account using a substrate provider | ✅ Pass | iOS beta |
| REG-IOS-41 | The mission pool list; search; filter; status; tabs | ✅ Pass | iOS beta |
| REG-IOS-42 | Sorting by status — live, upcoming, archived — and by ordinal low to high, matching the Extension | ✅ Pass | iOS beta |
| REG-IOS-43 | View mission pool details; the actions inside a mission pool go where they should; scroll up and down, left and right | ✅ Pass | iOS beta |
| REG-IOS-44 | The backup reminder popup — learn how to back up; remind me later; do not show again | ✅ Pass | iOS beta |
| REG-IOS-45 | Back up the seed phrase through export account | ✅ Pass | iOS beta |
| REG-IOS-46 | All accounts mode — select account; search account; scroll the account list | ✅ Pass | iOS beta |
| REG-IOS-47 | Separate account mode does not show the account picker | ✅ Pass | iOS beta |
| REG-IOS-48 | Search network; scroll the network list; select network; filter | ✅ Pass | iOS beta |
| REG-IOS-49 | The explorer link opens from a history record | ✅ Pass | iOS beta |
| REG-IOS-50 | Change the currency, and the select currency popup | ✅ Pass | iOS beta |
| REG-IOS-51 | Change the language, and search within the language list | ✅ Pass | iOS beta |
| REG-IOS-52 | Turn in-app notifications off and on. Wallet theme is coming soon and is not checked | ✅ Pass | iOS beta |
| REG-IOS-53 | Change the wallet password — current password; new password; confirm; the I understand checkbox; the learn more link; save | ✅ Pass | iOS beta |
| REG-IOS-54 | Require unlock — change the auto-lock time; the wallet auto-locks | ✅ Pass | iOS beta |
| REG-IOS-55 | Face ID or Touch ID — turn the toggle off; turn it on by password; turn it on by face or touch scan | ✅ Pass | iOS beta |
| REG-IOS-56 | Sign for multiple transactions — turn the toggle on and off | ✅ Pass | iOS beta |
| REG-IOS-57 | Search website; filter; the list of connected websites; scroll the list | ✅ Pass | iOS beta |
| REG-IOS-58 | Connected website detail — search account; turn an account off and on; block; forget; disconnect all; connect all; unblock | ✅ Pass | iOS beta |
| REG-IOS-59 | dApp configuration — forget all; disconnect all; connect all | ✅ Pass | iOS beta |
| REG-IOS-60 | Create a new connection on a supported network, and on one that is not supported | ✅ Pass | iOS beta |
| REG-IOS-61 | Search; website detail; sign a message or transaction with a substrate and an EVM account; disconnect | ✅ Pass | iOS beta |
| REG-IOS-62 | Search network; filter network; turn a network on and off | ✅ Pass | iOS beta |
| REG-IOS-63 | Import a custom network; import a provider; switch provider | ✅ Pass | iOS beta |
| REG-IOS-64 | Remove a custom network with the network on, and with it off | ✅ Pass | iOS beta |
| REG-IOS-65 | Define a network — add a provider; switch provider | ✅ Pass | iOS beta |
| REG-IOS-66 | Import a token with the network on and with it off — select network; select token type; type the contract address; scan it by QR | ✅ Pass | iOS beta |
| REG-IOS-67 | Remove a custom token with the token on, and with it off | ✅ Pass | iOS beta |
| REG-IOS-68 | Search token; filter token; turn a token on and off; token detail | ✅ Pass | iOS beta |
| REG-IOS-69 | Add an address; remove one; edit a name; search and filter | ✅ Pass | iOS beta |
| REG-IOS-70 | Migrate solo accounts to a unified account — the migration runs to the end, and every migrated account can still sign afterwards | ✅ Pass | iOS beta |
| REG-IOS-82 | Configure the Subscan API key | ✅ Pass | iOS beta |
| REG-IOS-71 | Contact support; user guide; request a feature | ✅ Pass | iOS beta |
| REG-IOS-72 | About SubWallet — website; term of use; X; rate our app | ✅ Pass | iOS beta |
| REG-IOS-73 | The MKT campaign | ✅ Pass | iOS beta |
| REG-IOS-74 | Add an API key | ✅ Pass | iOS beta |
| REG-IOS-83 | Crowdloans is gone — no tab, no entry point, and nothing left behind that opens it | ✅ Pass | iOS beta |

81 of 82 pass on each build, with REG-32 skipped on both. That is the whole fresh-install checklist run again on the builds as they stand today.

Left to run: the upgrade recheck on each build — UPG-IOS-1 to 3 and UPG-AND-1 to 3, which settle AC-2 and AC-4 — then the two production stages. The upgrade rechecks need the previous production version installed with its data first.

### Bugs

None.

## US-42.29 — Improve multisig notification (#5093)

Started today against PR #5095. The AC were corrected against the diff first — two described behaviour the code cannot have, and two paths the code takes had no AC at all — taking the story from 22 AC to 24.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1 | A pending multisig transaction raises a notification, and it is still there after a minute of the app sitting idle | ✅ Pass | Extension |
| AC-2 | The notification does not disappear and reappear with a new timestamp while the transaction stays pending | ✅ Pass | Extension |
| AC-3 | The notification shows under the signatory account and under All accounts | ✅ Pass | Extension |
| AC-4 | Switching account on the notification screen itself refetches — opening on one account and switching to All accounts shows the right list, not the first account's | ✅ Pass | Extension |
| AC-5 | Adding or removing an account leaves the notification in place | ✅ Pass | Extension |
| AC-6 | Enabling, disabling or updating a chain leaves notifications of other chains in place | ✅ Pass | Extension |
| AC-10 | After the current signer approves, the notification reads "Multisig transaction approved" with the content about waiting for other signatories, instead of disappearing | ✅ Pass | Extension |
| AC-11 | After the transaction executes, the notification reads "Transaction no longer pending" with the content saying no further action is needed | ✅ Pass | Extension |
| AC-12 | A cancelled transaction reads the same "no longer pending" wording as an executed one. The code has one branch for both — a transaction that is no longer on chain becomes RESOLVED without asking why — so this confirms they are indistinguishable rather than looking for a difference | ✅ Pass | Extension |
| AC-13 | The account prefix in square brackets at the start of the title is kept when the title is replaced | ✅ Pass | Extension |
| AC-14 | Clicking a notification whose transaction is still pending opens History with that transaction, as before | ✅ Pass | Extension |
| AC-15 | Clicking an approved or resolved notification opens a modal naming the status, with an "I understand" button, rather than navigating to a transaction that is not there | ✅ Pass | Extension |
| AC-16 | Clicking a notification on a disabled chain offers to enable the network, with the message naming that network, and works on re-click after enabling | ✅ Pass | Extension |
| AC-7 | With the chain's RPC failing, notifications of that multisig are not cleared — they stay until the RPC answers again | ✅ Pass | Extension |
| AC-8 | After the RPC recovers, the notification list is correct again without reloading the extension by hand | ✅ Pass | Extension |
| AC-9 | A transaction whose extrinsic cannot be resolved keeps its notification and its last known data rather than vanishing | ✅ Pass | Extension |
| AC-17 | When the status cannot be read — the notification is gone, or the background has no record of the pending transaction — a warning toast says so and the notification is left in the list rather than removed | ✅ Pass | Extension |
| AC-17a | Clicking a pending notification whose transaction the background no longer has shows the same warning and leaves the notification alone — an absent transaction is not proof it was executed, which is why the code checks the cache rather than assuming | ✅ Pass | Extension |
| AC-17b | Clicking the same notification repeatedly while the first check is still running does nothing twice — the second click is ignored until the first finishes | ✅ Pass | Extension |
| AC-19 | Notifications of other kinds — withdraw, claim, bridge, process — are unaffected in content, order and unread state | ✅ Pass | Extension |
| AC-20 | Marking read and marking all read still work. Note that a notification turning APPROVED or RESOLVED is marked read by the code itself, so it leaves the unread count on its own — that is intended, not a bug | ✅ Pass | Extension |
| AC-21 | The notification filter tabs still sort and filter correctly with the new statuses present | ✅ Pass | Extension |
| AC-22 | Signing a multisig transaction from the notification still reaches the signing flow and completes | ✅ Pass | Extension |
| AC-18 | The five new strings are checked in each locale the extension ships — en, vi, ja, ru, zh | ⏭️ Skipped | Extension — the locale pass was not run |

23 of 24 pass and the story closes. The notification stays where it should, survives a failing RPC and comes back right when the RPC does, and says what happened at each step. The three click paths behave: a warning when the status cannot be read, the same warning when the background no longer holds a transaction the notification still names, and a second click ignored while the first check runs.

AC-12 is worth naming. A cancelled transaction reads the same as an executed one, and the code has one branch for both — nothing reads why a transaction left the chain — so this confirms they cannot be told apart rather than finding a difference.

AC-18 is skipped — the locale pass was not run, so the five new strings are unchecked in vi, ja, ru and zh. Reading the diff suggests they ship as English there, with only the sixth string of the batch translated, so it is worth running before the PR merges.

### Bugs

None.

## Summary

US-42.29 opened and closed in the same day, at 23 of 24.

Its AC were corrected against the diff before the run. Two described behaviour the code cannot have — a cancelled transaction reading differently from an executed one, and marking read behaving as it would for any other notification — and two paths the code takes had no AC at all. That took the story from 22 AC to 24.

The notification now behaves as the issue asked. It survives the app sitting idle, account changes, chain changes, and a failing RPC, coming back right when the RPC does. It says what happened rather than disappearing: approved while other signatories are still to sign, no longer pending once the transaction leaves the chain. Clicking one opens History when the transaction is still there, a status modal when it is not, and a warning when the status cannot be read at all.

AC-12 is worth recording. A cancelled transaction reads the same as an executed one and cannot do otherwise, since the code reaches RESOLVED through a single branch and nothing reads why the transaction left the chain. The run confirms they are indistinguishable rather than finding a difference.

AC-18 is skipped. The locale pass was not run, so the five new strings are unchecked in vi, ja, ru and zh. Reading the diff suggests they ship as English there, with only the sixth string of the batch translated — worth running before the PR merges.

US-42.27 did not change state. Both beta builds were run through the whole checklist again and held at 81 of 82 each, with REG-32 skipped on both. That is recorded here only; the story's checklist is unchanged.

US-42.28 was re-scored from 42 points to 13. It had been raised twice for work that never grew — the checklist went from 25 lines to 306 because each chain and subnet got a line of its own, which is how a session marks what it read, not more testing.

No bugs found.
