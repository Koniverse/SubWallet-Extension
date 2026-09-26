# Manual Test Report — EPIC-42 — 2026-09-26

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-26 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.19 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
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

### Bugs

None.

## Summary

Importing from Trust Wallet passes on both platforms, closing the first of the four lines added on 2026-09-25 after the checklist was compared against the user guide.

Lock and unlock were rerun across both platforms — by hand, by password, and by Face ID, Touch ID or fingerprint, along with the auto-lock time and the biometric toggle. All four lines were already ticked from earlier sessions, so the count does not move; this run confirms them.

History was then run in full on both platforms — all four lines pass, closing the section on each.

The dApp lines followed — connecting to a substrate and an EVM dApp with block and unblock on both platforms, and the connected-website detail and dApp configuration screens on iOS, whose Android counterparts were already ticked. REG-I-57, the connected-website list with its search and filter, has not been run.

The checklist gained one line, REG-83: Crowdloans, removed in 1.3.73, must be gone from the build. It was already named in REG-77, but that line only looks after an upgrade and covers four removed features at once, so a fresh install had no check that the tab is absent. The new line checks it on its own and passes on both platforms — no tab, no entry point, nothing left behind that opens it. Each list now holds 83 lines.

REG-77 passes on both platforms as well, so all four removed features are now checked from both sides: REG-83 confirms Crowdloans is absent on a fresh install, and REG-77 confirms none of the four leaves a broken screen behind after an upgrade.

Receive and mission pools close on iOS too, their Android halves having passed on 2026-09-18. Manage network and WalletConnect both run in full on both platforms. WalletConnect matters here because round 2 found two P1s on it — no account offered on an EVM network, and a popup that could not be dismissed — and both were verified fixed on 2026-09-18; these two lines confirm the screen works end to end.

Android 51 of 83, iOS 42 of 83.
