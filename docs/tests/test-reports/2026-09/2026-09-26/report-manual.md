# Manual Test Report — EPIC-42 — 2026-09-26

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-26 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.19, US-42.24.20 |
| Total bugs found | 1 |
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| P3 | 0 |
| Status | in-progress |

---

## US-42.24.19 — Full wallet regression, round 2

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-I-78 | Import from Trust Wallet | ✅ Pass | iOS |
| REG-A-78 | Import from Trust Wallet | ✅ Pass | Android |
| REG-11 | Lock the wallet by hand | ✅ Pass | Android + iOS |
| REG-12 | Unlock by typing the password; unlock by Face ID or Touch ID | ✅ Pass | Android + iOS |
| REG-54 | Require unlock — change the auto-lock time; the wallet auto-locks | ✅ Pass | Android + iOS |
| REG-55 | Face ID or Touch ID — turn the toggle off; turn it on by password; turn it on by face or touch scan | ✅ Pass | Android + iOS |
| REG-46 | All accounts mode — select account; search account; scroll the account list | ✅ Pass | Android + iOS |
| REG-47 | Separate account mode does not show the account picker | ✅ Pass | Android + iOS |
| REG-48 | Search network; scroll the network list; select network; filter | ✅ Pass | Android + iOS |
| REG-49 | The explorer link opens from a history record | ✅ Pass | Android + iOS |
| REG-39 | Connect to a substrate dApp; connect to an EVM dApp; block and unblock a dApp | ✅ Pass | Android + iOS |
| REG-I-58 | Connected website detail — search account; turn an account off and on; block; forget; disconnect all; connect all; unblock | ✅ Pass | iOS. The Android line was already ticked on 2026-09-18 |
| REG-I-59 | dApp configuration — forget all; disconnect all; connect all | ✅ Pass | iOS. The Android line was already ticked on 2026-09-18 |
| REG-83 | Crowdloans is gone — no tab, no entry point, and nothing left behind that opens it | ✅ Pass | Android + iOS. New line, added today |
| REG-77 | No screen is broken where a removed feature used to be — Crowdloans, Polygon zkEVM, stDOT, the old Bittensor root claim | ✅ Pass | Android + iOS, on an upgrade |
| REG-I-16 | The QR code shows in all accounts mode and in single account mode | ✅ Pass | iOS. The Android line was already ticked on 2026-09-18 |
| REG-I-17 | The explorer link opens for a network that has one, and is handled for a network that does not | ✅ Pass | iOS. The Android line was already ticked on 2026-09-18 |
| REG-I-41 | The mission pool list; search; filter; status; tabs | ✅ Pass | iOS. The Android line was already ticked on 2026-09-18 |
| REG-I-42 | Sorting by status — live, upcoming, archived — and by ordinal low to high, matching the Extension | ✅ Pass | iOS. The Android line was already ticked on 2026-09-18 |
| REG-I-43 | View mission pool details; the actions inside a mission pool go where they should; scroll up and down, left and right | ✅ Pass | iOS. The Android line was already ticked on 2026-09-18 |
| REG-62 | Search network; filter network; turn a network on and off | ✅ Pass | Android + iOS |
| REG-63 | Import a custom network; import a provider; switch provider | ✅ Pass | Android + iOS |
| REG-64 | Remove a custom network with the network on, and with it off | ✅ Pass | Android + iOS |
| REG-65 | Define a network — add a provider; switch provider | ✅ Pass | Android + iOS |
| REG-60 | Create a new connection on a supported network, and on one that is not supported | ✅ Pass | Android + iOS |
| REG-61 | Search; website detail; sign a message or transaction with a substrate and an EVM account; disconnect | ✅ Pass | Android + iOS |
| REG-44 | The backup reminder popup — learn how to back up; remind me later; do not show again | ✅ Pass | Android + iOS |
| REG-45 | Back up the seed phrase through export account | ✅ Pass | Android + iOS |
| REG-66 | Import a token with the network on and with it off — select network; select token type; type the contract address; scan it by QR | ✅ Pass | Android + iOS |
| REG-67 | Remove a custom token with the token on, and with it off | ✅ Pass | Android + iOS |
| REG-68 | Search token; filter token; turn a token on and off; token detail | ✅ Pass | Android + iOS |
| REG-71 | Contact support; user guide; request a feature | ✅ Pass | Android + iOS |
| REG-72 | About SubWallet — website; term of use; X; rate our app | ✅ Pass | Android + iOS |
| REG-69 | Add an address; remove one; edit a name; search and filter | ✅ Pass | Android + iOS |
| REG-82 | Configure the Subscan API key | ✅ Pass | Android + iOS. Closes account settings, whose other line is the unified-account migration |
| REG-I-57 | Search website; filter; the list of connected websites; scroll the list | ✅ Pass | iOS. Closes manage website access on both platforms |
| REG-I-73 | The MKT campaign | ✅ Pass | iOS. The Android line was already ticked |
| REG-I-74 | Add an API key | ✅ Pass | iOS. The Android line was already ticked |
| REG-84 | Account details — the account name; its address on each network, with the QR code and the copy button; the account family, unified or solo; and the account type, such as QR-signer or watch-only | ✅ Pass | Android + iOS. New line, added today |
| REG-I-23 | Swap without XCM; swap with XCM | ✅ Pass | iOS. The Android lines were already ticked |
| REG-I-24 | Search token and account; the prompt to enable a network that is off; filter token | ✅ Pass | iOS |
| REG-I-25 | Input the amount and the recipient address — by QR, by typing, from the address book | ✅ Pass | iOS |
| REG-I-26 | The swap quote shows; quote reset; quote detail; input and edit slippage; view quote; view fee | ✅ Pass | iOS |
| REG-I-27 | Validation cases; submit | ✅ Pass | iOS |
| REG-I-29 | View NFT collections; search; reload collections; view the NFT list; NFT detail | ✅ Pass | iOS. Closes manage NFT on both platforms, REG-32 aside |

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.19-25 | The Account name popup is shown twice when saving the name while importing by seed phrase | Import an account by seed phrase → type an account name → save it → watch the screens that follow | The Account name popup appears, is saved, and then appears a second time, so the name has to be confirmed twice before the import carries on | The popup appears once, and saving the name takes the import to the next step | P2 | todo | |

## US-42.24.20 — Verify the bugs found during this update

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|
| BUG-42.24.19-24 | US-42.24.19 | P2 | The "Pay attention!" popup on Claim rewards confirm did not match the Extension (iOS) | ✅ Fixed |

73 of 82 verified, 5 closed no fix, 4 open — one P1, two P2 and one P3.

## Summary

Swap and manage NFT close on iOS, their Android halves having passed earlier. Manage NFT is complete on both platforms now, REG-32 aside, which is skipped.

Sections closed on both platforms: history, manage network, manage token, WalletConnect, backup seed phrase, community and support, the address book, account settings, manage website access, the MKT campaign and API key, Trust Wallet import, and the removed-feature checks. Receive and mission pools closed on iOS, their Android halves having passed earlier.

Two lines are new. REG-83 — Crowdloans must be gone on a fresh install, which REG-77 only checked after an upgrade — passes on both. REG-84 checks the account details screen itself: the name, the address per network with its QR code and copy button, and the badges for account family and type. The screen was only ever reached on the way somewhere else, so what it displays had no check of its own. It passes on both platforms. Each list now holds 84 lines.

BUG-42.24.19-24 verified fixed. One bug logged, BUG-42.24.19-25 at P2: the Account name popup is shown twice when importing by seed phrase, on both platforms. Four bugs open: BUG-42.24.19-06 at P1, BUG-42.24.19-03 and -25 at P2, BUG-42.24.19-23 at P3.

Android 61 of 84, iOS 61 of 84.
