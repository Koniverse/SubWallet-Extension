# Manual Test Report — EPIC-42 — 2026-09-07

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-07 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.4 |
| Total bugs found | 1 |
| P0 | 0 |
| P1 | 1 |
| P2 | 0 |
| Status | in progress |

---

## US-42.24.4 — Web-runner 1.3.71 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). Three items in this version: token enabling round 2 ([#4247](https://github.com/Koniverse/SubWallet-Extension/issues/4247)), library updates ([#4808](https://github.com/Koniverse/SubWallet-Extension/issues/4808)), and import from Trust Wallet ([#4762](https://github.com/Koniverse/SubWallet-Extension/issues/4762)).

Token enabling passed on [2026-09-05](../2026-09-05/report-manual.md). Today covers the Trust Wallet import.

Both halves of this story had their AC rewritten today, and for the same reason: the originals came from the issue titles, and the real scope was somewhere else.

The Trust Wallet AC now follow the checklist actually used to test it — the screens the import is reached through, what the imported account may do afterwards, and what happens when the same seed arrives twice by two routes. Twenty AC in four groups, all of them run below.

The library AC now follow the test scope the developer wrote in [#4808](https://github.com/Koniverse/SubWallet-Extension/issues/4808): the whole user-facing surface across EVM, Substrate, Bitcoin and TON, in five areas. Fifteen AC, none run yet.

Still to run: AC-5 to AC-19, the library update scope.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-16 | History, prices and portfolio all load and keep updating — Android + iOS fresh | ❌ Fail | See BUG-42.24.4-01 |
| AC-20 | The Import from Trust Wallet screen opens from the welcome screen, asking for 12 words by default | ✅ Pass | |
| AC-21 | It opens the same way from the home screen | ✅ Pass | |
| AC-22 | A seed longer than 12 words is refused with "Invalid seed phrase. Please try again" | ✅ Pass | |
| AC-23 | Tapping Import opens the Solo account import modal; Go back returns, Import completes | ✅ Pass | |
| AC-24 | The account arrives as a solo DOT account, address matching Trust Wallet | ✅ Pass | |
| AC-25 | Derive account is disabled on the account details screen and in the Create a new account modal | ✅ Pass | |
| AC-26 | Export offers seed phrase and JSON file, and export all accounts works | ✅ Pass | |
| AC-27 | Migrate account is not offered for this account | ✅ Pass | |
| AC-28 | Importing back the exported JSON gives an account that behaves the same way | ✅ Pass | |
| AC-29 | The receive screen shows an address matching Trust Wallet | ✅ Pass | |
| AC-30 | Sending a token, sending an NFT, swapping and staking all work | ✅ Pass | |
| AC-31 | Signing from a dApp works | ✅ Pass | |
| AC-32 | Importing through the ordinary seed phrase option still behaves as it did | ✅ Pass | |
| AC-33 | An account already imported by seed phrase, imported again through Trust Wallet, arrives as a solo DOT account matching Trust Wallet | ✅ Pass | |
| AC-34 | The same account through the seed phrase option is refused with "Account already exists under the name {Account name}" | ✅ Pass | |
| AC-35 | A watch-only or QR account on a different ecosystem from the same seed can still be imported | ✅ Pass | |
| AC-36 | An account already imported from Trust Wallet, imported again the same way, is refused with the same message | ✅ Pass | |
| AC-37 | That account through the seed phrase option behaves as it did | ✅ Pass | |
| AC-38 | The watch-only or QR case works in that direction too | ✅ Pass | |
| AC-39 | AC-8 to AC-26 pass on Android + iOS upgrade | ✅ Pass | |

All twenty pass, on both platforms, fresh install and upgrade.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.4-01 | Transaction history does not load once a Subscan API key is saved | Settings → add a Subscan API key and save it → open an account with past transactions → open the history screen | The history does not load. Without the key saved it loads as usual | The history loads whether or not an API key is saved — the key is meant to raise the rate limit, not gate the feature | P1 | todo | |

---

## Summary

Session in progress.
