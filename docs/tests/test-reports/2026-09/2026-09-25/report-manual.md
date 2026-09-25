# Manual Test Report — EPIC-42 — 2026-09-25

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-25 |
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

iOS started, ten lines run. Android added the migration line, taking it to 30. Android 30 of 82, iOS 10 of 82.

The checklist grew from 77 lines to 82 today. Reading the SubWallet user guide against it turned up four documented features with no line of their own — import from Trust Wallet, transfer through a bridge, parachain (collator) staking, and change validator — now REG-78 to REG-81 on both platforms.

The fifth change is a split. REG-70 read "Migrate account; configure the Subscan API key", two unrelated things on one line: migrating solo accounts to a unified account rewrites how keys are stored, while the Subscan key is a string typed into settings. REG-70 now covers the migration alone and the API key moves to REG-82. Governance is left out on purpose — Mobile has no governance screen.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-I-11 | Lock the wallet by hand | ✅ Pass | iOS |
| REG-I-12 | Unlock by typing the password; unlock by Face ID or Touch ID | ✅ Pass | iOS |
| REG-I-70 | Migrate solo accounts to a unified account | ✅ Pass | iOS |
| REG-A-70 | Migrate solo accounts to a unified account | ✅ Pass | Android |
| REG-I-50 | Change the currency, and the select currency popup | ✅ Pass | iOS |
| REG-I-51 | Change the language, and search within the language list | ✅ Pass | iOS |
| REG-I-52 | Turn in-app notifications off and on. Wallet theme is coming soon and is not checked | ✅ Pass | iOS |
| REG-I-53 | Change the wallet password — current password; new password; confirm; the I understand checkbox; the learn more link; save | ✅ Pass | iOS |
| REG-I-54 | Require unlock — change the auto-lock time; the wallet auto-locks | ✅ Pass | iOS |
| REG-I-56 | Sign for multiple transactions — turn the toggle on and off | ✅ Pass | iOS |
| REG-I-28 | Choose a token with the network on and with it off; the buy page opens; the token list matches the account type; select token; select service; select account; the disclaimer popup | ✅ Pass | iOS |

### Bugs

None.

## Summary

Regression round 2 started on iOS, the platform that had not been touched yet — ten lines pass there: lock and unlock, migrating solo accounts to a unified account, the three general settings lines, three of the four security settings lines, and buying a token. The same migration line passed on Android too. No bug found.

REG-I-55, Face ID or Touch ID, is the one security line left; it has not been run.

The checklist was also compared against the SubWallet user guide and went from 77 lines to 82: four documented features had no line of their own, and REG-70 was split because it carried two unrelated checks. Android is now 30 of 82 and iOS 10 of 82.
