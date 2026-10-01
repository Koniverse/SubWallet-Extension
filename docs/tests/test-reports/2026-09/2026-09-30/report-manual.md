# Manual Test Report — EPIC-42 — 2026-09-30

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-30 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.19, US-42.24.20 |
| Total bugs found | 1 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 1 |
| Status | done |

---

## US-42.24.19 — Full wallet regression, round 3

Round 2 closed on [2026-09-29](../2026-09-29/report-manual.md) at 83 of 85 lines on each platform, with no P1 left in the programme. Round 3 opened today on the build going to beta, with the ticks cleared and the lines unchanged.

Round 2 ran against web-runner versions as each one landed, over several weeks and several builds. The beta is one build carrying all of it, so a check that passed on the build where its feature landed has not yet been run on the build that ships. That is what this round is for, and it is the last run on the development build before [US-42.27](../../../../sprints/stories/US-42.27-qc-release-mobile.md) takes the same checklist to TestFlight and the Google Play beta track.

The two skipped lines stay skipped for the same reasons: REG-32, because NFTs are auto-detected so removing one no longer does anything, and REG-76, because the Polkadot API key that history check needs no longer works.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-I-33 | The earning options list; the earning positions list; position detail; earning instructions | ✅ Pass | iOS |
| REG-I-34 | Stake — direct nomination; nomination pool; liquid stake; subnet staking | ✅ Pass | iOS |
| REG-I-35 | Stake more | ✅ Pass | iOS |
| REG-I-36 | Fast unstake — part of the position, and all of it | ✅ Pass | iOS |
| REG-I-37 | Slow unstake — part of the position, and all of it | ✅ Pass | iOS — BUG-42.24.19-27 is on this screen, but it is the Max button flickering, not the unstake |
| REG-I-38 | Cancel unstake; withdraw; claim rewards | ✅ Pass | iOS |
| REG-I-80 | Parachain (collator) staking — start staking; stake more; claim rewards; unstake; cancel unstake; withdraw | ✅ Pass | iOS |
| REG-I-81 | Change validator — on direct nomination, and on subnet staking | ✅ Pass | iOS |
| REG-I-39 | Connect to a substrate dApp; connect to an EVM dApp; block and unblock a dApp | ✅ Pass | iOS |
| REG-I-40 | Sign a message or transaction with a substrate account; with an EVM account; with an EVM account using a substrate provider | ✅ Pass | iOS |
| REG-I-41 | The mission pool list; search; filter; status; tabs | ✅ Pass | iOS |
| REG-I-42 | Sorting by status — live, upcoming, archived — and by ordinal low to high, matching the Extension | ✅ Pass | iOS |
| REG-I-43 | View mission pool details; the actions inside a mission pool go where they should; scroll up and down, left and right | ✅ Pass | iOS |
| REG-I-44 | The backup reminder popup — learn how to back up; remind me later; do not show again | ✅ Pass | iOS |
| REG-I-45 | Back up the seed phrase through export account | ✅ Pass | iOS |
| REG-I-50 | Change the currency, and the select currency popup | ✅ Pass | iOS |
| REG-I-51 | Change the language, and search within the language list | ✅ Pass | iOS |
| REG-I-52 | Turn in-app notifications off and on. Wallet theme is coming soon and is not checked | ✅ Pass | iOS |
| REG-I-60 | Create a new connection on a supported network, and on one that is not supported | ✅ Pass | iOS |
| REG-I-61 | Search; website detail; sign a message or transaction with a substrate and an EVM account; disconnect | ✅ Pass | iOS |
| REG-I-57 | Search website; filter; the list of connected websites; scroll the list | ✅ Pass | iOS |
| REG-I-58 | Connected website detail — search account; turn an account off and on; block; forget; disconnect all; connect all; unblock | ✅ Pass | iOS |
| REG-I-59 | dApp configuration — forget all; disconnect all; connect all | ✅ Pass | iOS |
| REG-I-18 | Transfer an EVM token — single-chain and cross-chain; native and local; edit the fee | ✅ Pass | iOS |
| REG-I-19 | Transfer a substrate token — single-chain and cross-chain; native and local; choose which token pays the fee | ✅ Pass | iOS |
| REG-I-20 | Transfer a BTC token | ✅ Pass | iOS |
| REG-I-21 | Transfer a TON token | ✅ Pass | iOS |
| REG-I-79 | Transfer a token through a bridge — TAO to Subtensor EVM and back | ✅ Pass | iOS |
| REG-I-22 | The transfer screen — select token; the prompt to enable a network that is off; select network; recipient address; input amount; approve; submit | ✅ Pass | iOS |
| REG-I-29 | View NFT collections; search; reload collections; view the NFT list; NFT detail | ✅ Pass | iOS |
| REG-I-30 | Import an NFT — select network; the prompt to enable a network that is off; select token type; type or scan the contract address; collection name; import | ✅ Pass | iOS |
| REG-I-31 | Send an NFT on a supported network, and on one with no support | ✅ Pass | iOS |
| REG-I-32 | Remove a custom NFT | ⏭️ Skipped | iOS — NFTs are auto-detected now, so a removed one comes straight back and the action no longer does anything. Same reason as round 2 |
| REG-I-28 | Choose a token with the network on and with it off; the buy page opens; the token list matches the account type; select token; select service; select account; the disclaimer popup | ✅ Pass | iOS |
| REG-I-14 | Transferable balance is right on token details; transfer on-chain; transfer cross-chain; send NFT; swap; earning actions | ✅ Pass | iOS |
| REG-I-15 | Show and hide balance; refresh balance; customize asset display; search token; token detail | ✅ Pass | iOS |
| REG-I-16 | The QR code shows in all accounts mode and in single account mode | ✅ Pass | iOS |
| REG-I-17 | The explorer link opens for a network that has one, and is handled for a network that does not | ✅ Pass | iOS |
| REG-I-23 | Swap without XCM; swap with XCM | ✅ Pass | iOS |
| REG-I-24 | Search token and account; the prompt to enable a network that is off; filter token | ✅ Pass | iOS |
| REG-I-25 | Input the amount and the recipient address — by QR, by typing, from the address book | ✅ Pass | iOS |
| REG-I-26 | The swap quote shows; quote reset; quote detail; input and edit slippage; view quote; view fee | ✅ Pass | iOS |
| REG-I-27 | Validation cases; submit | ✅ Pass | iOS |
| REG-I-11 | Lock the wallet by hand | ✅ Pass | iOS |
| REG-I-12 | Unlock by typing the password; unlock by Face ID or Touch ID | ✅ Pass | iOS |
| REG-I-13 | Forgot password — reset account; erase all | ✅ Pass | iOS |
| REG-I-85 | The app opens, backgrounds and resumes without losing state — it comes back to where it was, and does not hang on a loading screen | ✅ Pass | iOS — the line BUG-42.24.19-06 was fixed against, passing again on the build going to beta |
| REG-I-71 | Contact support; user guide; request a feature | ✅ Pass | iOS |
| REG-I-72 | About SubWallet — website; term of use; X; rate our app | ✅ Pass | iOS |
| REG-I-73 | The MKT campaign | ✅ Pass | iOS |
| REG-I-74 | Add an API key | ✅ Pass | iOS |
| REG-I-83 | Crowdloans is gone — no tab, no entry point, and nothing left behind that opens it | ✅ Pass | iOS |
| REG-I-82 | Configure the Subscan API key | ✅ Pass | iOS |

52 of 85 iOS lines done, with REG-I-32 skipped. Android has not started this round.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.19-27 | The amount field flickers several times when Max is tapped on the Unstake screen (iOS) | Earning → open a Bittensor native staking position → Unstake → select a validator → tap Max | The field flashes several times before it settles on the staked amount, rather than filling once. It lands on the right figure, so this is what the user sees rather than what is sent | Tapping Max fills the field once, with no flicker | P3 | todo | ![](img/BUG-42.24.19-27.png) |

The first bug of round 3, and the first on the Unstake screen. BUG-42.24.19-19 was the same symptom — a spinner on every keystroke — but on the subnet staking change-validator screen and driven by typing, not by the Max button; it was fixed and verified in round 2.

## US-42.24.20 — Verify the bugs found during this update

Nothing was rechecked today. One bug was open coming into the session — BUG-42.24.19-26, P2 on iOS, the close button on Settings often not responding to the first tap — and it stayed open; BUG-42.24.19-27, logged today, joined it. Both were verified fixed on [2026-10-01](../../2026-10/2026-10-01/report-manual.md).

## Summary

Round 3 of the regression opened today on the build going to beta, with the ticks cleared and the lines unchanged, and reached 52 of 85 on iOS in one session. Transfer, Manage NFT, Buy token, Balances, Receive, Swap, Earning, dApps, Mission pools, Backup seed phrase, General settings, WalletConnect, Manage website access, Lock and unlock, Community and support and Other all pass. Android has not started this round.

REG-I-85 passing is worth noting: it is the line added at the end of round 2 to confirm BUG-42.24.19-06, the last P1 in the programme, and it holds on the build going to beta.

One bug logged: BUG-42.24.19-27, P3 on iOS — the amount field flickers when Max is tapped on the Unstake screen. The figure it lands on is right, so this is what the user sees rather than what is sent.

US-42.27 was opened today as well, the release gate that takes this checklist to TestFlight and the Google Play beta track once round 3 finishes.

Read against what came after: REG-I-38 was ticked in this session, and that tick was cleared on 2026-10-01 when a P1 was found on the same line — withdrawing from a nomination pool could not be encoded. The count of 52 above is what this session saw; from 10-01 the story reads 51.
