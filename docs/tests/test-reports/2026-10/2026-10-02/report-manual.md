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

20 of 85 Android lines done.

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
