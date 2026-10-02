# Manual Test Report — EPIC-42 — 2026-10-02

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-02 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.19, US-42.24.20 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

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

38 of 85 Android lines done, with REG-A-32 skipped. REG-A-38 is the line BUG-42.24.19-28 was found on, so the tick stands on a run of the fixed build.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|

## US-42.24.20 — Verify the bugs found during this update

Three bugs were open coming into today, all P3 and all logged on 10-01.

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|
| BUG-42.24.19-29 | US-42.24.19 | P3 | The dollar sign on Your balance was drawn too large | ✅ Fixed — verified on Android and iOS |
| BUG-42.24.19-30 | US-42.24.19 | P3 | The watch-only warning on NFT details was the wrong colour | ✅ Fixed — verified on Android and iOS |

One bug is left open: BUG-42.24.19-31, the app sometimes taking several seconds to move to the next screen. The programme reads 88 rows — 81 fixed, 6 closed no fix, 1 open.

## Summary

Session in progress.
