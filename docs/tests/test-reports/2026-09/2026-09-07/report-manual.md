# Manual Test Report — EPIC-42 — 2026-09-07

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-07 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.4, US-42.24.5, US-42.24.19 |
| Total bugs found | 5 |
| P0 | 0 |
| P1 | 1 |
| P2 | 4 |
| Status | in progress |

---

## US-42.24.4 — Web-runner 1.3.71 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). Three items in this version: token enabling round 2 ([#4247](https://github.com/Koniverse/SubWallet-Extension/issues/4247)), library updates ([#4808](https://github.com/Koniverse/SubWallet-Extension/issues/4808)), and import from Trust Wallet ([#4762](https://github.com/Koniverse/SubWallet-Extension/issues/4762)).

Token enabling passed on [2026-09-05](../2026-09-05/report-manual.md). Today covers the Trust Wallet import.

Both halves of this story had their AC rewritten today, and for the same reason: the originals came from the issue titles, and the real scope was somewhere else.

The Trust Wallet AC now follow the checklist actually used to test it — the screens the import is reached through, what the imported account may do afterwards, and what happens when the same seed arrives twice by two routes. Twenty AC in four groups, all of them run below.

The library AC now follow the test scope the developer wrote in [#4808](https://github.com/Koniverse/SubWallet-Extension/issues/4808): the whole user-facing surface across EVM, Substrate, Bitcoin and TON, in five areas. Fifteen AC, fourteen of them passing and one skipped.

Both halves ran today. AC-1 to AC-4 (token enabling) passed on 2026-09-05, so every AC in this story now has a verdict: 38 pass and one skipped.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-5 | Creating an account works on EVM, Substrate, Bitcoin and TON — Android + iOS fresh | ✅ Pass | |
| AC-6 | Importing works by JSON, seed phrase and private key on each ecosystem — Android + iOS fresh | ✅ Pass | |
| AC-7 | Exporting and deriving accounts work on each ecosystem — Android + iOS fresh | ✅ Pass | |
| AC-8 | Accounts that existed before the upgrade are still visible and usable | ✅ Pass | |
| AC-9 | Signing works for every account type — Android + iOS fresh | ✅ Pass | |
| AC-10 | A transaction can be sent on EVM, Substrate, Bitcoin and TON — Android + iOS fresh | ✅ Pass | |
| AC-11 | Fee, gas or fee rate is right per chain and matches what is taken — Android + iOS fresh | ✅ Pass | |
| AC-12 | Message and typed-data signing from a dApp works, including EIP-712 — Android + iOS fresh | ✅ Pass | |
| AC-13 | The wallet connects to dApps and can connect, sign and send — Android + iOS fresh | ✅ Pass | |
| AC-14 | Balances load and the token list is right on each chain — Android + iOS fresh | ✅ Pass | |
| AC-15 | Switching network across the four ecosystems is smooth — Android + iOS fresh | ✅ Pass | |
| AC-16 | History, prices and portfolio all load and keep updating — Android + iOS fresh | ⏭️ Skipped | See BUG-42.24.4-01 — the fix ships in a later Extension version than this web-runner carries |
| AC-17 | The app updates to the new version cleanly and works afterwards | ✅ Pass | |
| AC-18 | AC-5 to AC-16 pass on Android + iOS upgrade | ✅ Pass | |
| AC-19 | After upgrading, imported accounts, enabled tokens and network settings are all still there | ✅ Pass | |
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
| BUG-42.24.4-01 | Past transaction history does not load unless a Subscan API key is saved | Install the app fresh, or import an account into an existing install → open that account history without a Subscan API key saved → then save a key in Settings and look again | Without a key, the history is empty — past transactions the account really has do not appear. They show up once a key is saved | The history loads without the user having to supply their own API key. The key is meant to raise the rate limit for heavy use, not to be the price of seeing your own past transactions<br><br>Developer note, not verified here: Subscan tightened its query limit, and the app still asks for 100 records at a time where only 25 are now allowed. The fix is to drop the page size to 25 | P1 | skipped, cannot be checked here | |

Why BUG-42.24.4-01 is skipped rather than failed:

The bug is real and reproduces. What cannot be done here is decide whether it is fixed. The developer is fixing it in a newer Extension version than the one this web-runner carries — Mobile runs the Extension code through the web-runner, and the runner is pinned to 1.3.86, so a fix landing after that does not reach this build at all.

So AC-16 cannot get a verdict on this build either way: the code with the fix is not in it. That is the definition of a skip rather than a fail. It gets run when a web-runner carrying the fixed Extension version arrives.



---

## US-42.24.5 — Web-runner 1.3.72 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). Proxy accounts ([#4725](https://github.com/Koniverse/SubWallet-Extension/issues/4725)), chain-list v0.2.123 ([#4861](https://github.com/Koniverse/SubWallet-Extension/issues/4861)) and ParaSpell V5 ([#4908](https://github.com/Koniverse/SubWallet-Extension/issues/4908)).

The AC for this story were written out today from their real scope — the proxy checklist and the 22 ChainList issues rolled into v0.2.123 — so it now runs to 43 AC. The session has started on the Add proxy screen.

### AC results

Nothing settled yet — the session is on the Add proxy screen and the bug below came out of it.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.5-01 | The Add proxy screen shows an Available balance line the Extension does not | Account detail → Manage proxies → Add proxy → look at the lines under the form | Two lines are shown: Available balance and Proxy deposit. The Extension shows only Proxy deposit | Only the Proxy deposit line, matching the Extension | P2 | todo | ![](img/BUG-42.24.5-01.png) |
| BUG-42.24.5-02 | The Transaction details sheet on Add proxy confirmation cannot be scrolled | Account detail → Manage proxies → Add proxy → fill the form → Approve → on the Add proxy confirmation screen open Transaction details → try to scroll the JSON | The JSON is longer than the sheet and is cut off at the bottom. Swiping up or down inside the sheet does not move it, so the end of the call data cannot be read | The sheet scrolls to the end of the JSON | P2 | todo | ![](img/BUG-42.24.5-02.png) |

## US-42.24.19 — Web-runner 1.3.86 full regression on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). The full wallet regression, run alongside the version sub-tasks where the same screens come up.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-11 | The locked balance breakdown opens and its figures add up | ❌ Fail | See BUG-42.24.19-08 — the figures are right, the tooltip text is not |

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.19-08 | The info tooltip on the Others row of the locked balance breakdown says something different on Mobile than on the Extension | Open a token with a locked balance → tap Locked to expand the breakdown → tap the (i) next to Others → compare with the same tooltip on the Extension | Mobile says "Other locks are the remainder after deducting the greater of the staking and governance locks from the total locked balance". The Extension says "Balances locked due to unique on-chain actions on the network" | Both platforms explain the Others row the same way. One of the two texts is wrong and the developer needs to say which | P2 | todo | ![](img/BUG-42.24.19-08.jpg) |
| BUG-42.24.19-09 | The Account name field on the Create derived account screen is indented out of line (Android) | Open an account → Create derived account → look at the Account name field | The label and the input below it do not line up — the input sits indented from the label above it, and from the rest of the form | The field lines up with the labels and fields around it | P2 | todo | ![](img/BUG-42.24.19-09.png) |

## Summary

Session in progress.
