# Manual Test Report — EPIC-42 — 2026-09-18

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-18 |
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

## US-42.24.19 — Full wallet regression, round 2

Carried on from [2026-09-17](../2026-09-17/report-manual.md), which reached 9 of 77 Android lines and found two P1 bugs on WalletConnect. iOS has not started.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-A-14 | Transferable balance is right on token details; transfer on-chain; transfer cross-chain; send NFT; swap; earning actions | ✅ Pass | Android |
| REG-A-15 | Show and hide balance; refresh balance; customize asset display; search token; token detail | ✅ Pass | Android |
| REG-A-16 | The QR code shows in all accounts mode and in single account mode | ✅ Pass | Android |
| REG-A-17 | The explorer link opens for a network that has one, and is handled for a network that does not | ✅ Pass | Android |
| REG-A-18 | Send an EVM token — local normal and max; native normal and max; a token with no support | ✅ Pass | Android |
| REG-A-19 | Send a substrate token — local normal and max; local into an account with zero native token; native normal and max; a token with no support | ✅ Pass | Android |
| REG-A-23 | Swap without XCM; swap with XCM | ✅ Pass | Android |
| REG-A-24 | Search token and account; the prompt to enable a network that is off; filter token | ✅ Pass | Android |
| REG-A-25 | Input the amount and the recipient address — by QR, by typing, from the address book | ✅ Pass | Android |
| REG-A-26 | The swap quote shows; quote reset; quote detail; input and edit slippage; view quote; view fee | ✅ Pass | Android |
| REG-A-27 | Validation cases; submit | ✅ Pass | Android |
| REG-A-28 | Choose a token with the network on and with it off; the buy page opens; the token list matches the account type; select token; select service; select account; the disclaimer popup | ✅ Pass | Android |
| REG-A-41 | The mission pool list; search; filter; status; tabs | ✅ Pass | Android |
| REG-A-42 | Sorting by status — live, upcoming, archived — and by ordinal low to high, matching the Extension | ✅ Pass | Android |
| REG-A-43 | View mission pool details; the actions inside a mission pool go where they should; scroll up and down, left and right | ✅ Pass | Android |
| REG-A-57 | Search website; filter; the list of connected websites; scroll the list | ✅ Pass | Android |
| REG-A-58 | Connected website detail — search account; turn an account off and on; block; forget; disconnect all; connect all; unblock | ✅ Pass | Android |
| REG-A-59 | dApp configuration — forget all; disconnect all; connect all | ✅ Pass | Android |

27 of 77 Android lines done. iOS has not started.

### Bugs

None found yet.

## US-42.24.20 — Verify the bugs found during this update

55 of 73 bugs verified, 3 closed no fix, 15 still open — four P1, six P2 and five P3. The four P1s: the app loading forever after being left in the background, the History crash after the Multisig tab, and the two WalletConnect bugs logged yesterday.

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|
| BUG-42.24.7-16 | US-42.24.7 | P2 | The toast on a pending multisig transaction was hidden behind the detail sheet | ✅ Fixed — the toast is visible |

## Summary

Session in progress.
