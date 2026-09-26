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

### Bugs

None.

## Summary

Importing from Trust Wallet passes on both platforms, closing the first of the four lines added on 2026-09-25 after the checklist was compared against the user guide.

Lock and unlock were rerun across both platforms — by hand, by password, and by Face ID, Touch ID or fingerprint, along with the auto-lock time and the biometric toggle. All four lines were already ticked from earlier sessions, so the count does not move; this run confirms them.

History was then run in full on both platforms — all four lines pass, closing the section on each.

The dApp lines followed — connecting to a substrate and an EVM dApp with block and unblock on both platforms, and the connected-website detail and dApp configuration screens on iOS, whose Android counterparts were already ticked. REG-I-57, the connected-website list with its search and filter, has not been run.

Android 43 of 82, iOS 29 of 82.
