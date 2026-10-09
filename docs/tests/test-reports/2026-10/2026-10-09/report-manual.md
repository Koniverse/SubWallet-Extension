# Manual Test Report — EPIC-42 — 2026-10-09

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-09 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS, beta and production |
| Runner | manual (mobile) |
| Build under test | Mobile v1.2.45(534)b-v16 |
| Stories tested | US-42.27 — closed |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | done |

---

## US-42.27 — Release SubWallet Mobile

The last story in the window, and it closes today at every line.

The upgrade rechecks pass on each beta build, and the App Store and Google Play builds pass their quick recheck. That settles AC-2 and AC-4, then AC-5 to AC-8. REG-32 stays skipped on both lists for the reason it carried through the regression.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-2 | Stage 1, iOS beta — the upgrade recheck passes, UPG-IOS-1 to UPG-IOS-3 | ✅ Pass | Mobile |
| AC-4 | Stage 2, Android beta — the upgrade recheck passes, UPG-AND-1 to UPG-AND-3 | ✅ Pass | Mobile |
| AC-5 | Stage 3, iOS production on the App Store — the quick recheck passes | ✅ Pass | Mobile |
| AC-6 | Stage 4, Android production on Google Play — the quick recheck passes | ✅ Pass | Mobile |
| AC-7 | The version shown in the app matches the build published at each stage | ✅ Pass | Mobile |
| AC-8 | No bug found in an earlier stage is still open when a later stage starts | ✅ Pass | Mobile |
| UPG-IOS-1 | Accounts, balances, NFTs, staking and earning positions, dApp connections and settings are all still there and correct | ✅ Pass | Mobile |
| UPG-IOS-2 | Transaction history from before the upgrade is still readable, with the same figures | ✅ Pass | Mobile |
| UPG-IOS-3 | No screen is broken where a removed feature used to be — Crowdloans, Polygon zkEVM, stDOT, the old Bittensor root claim | ✅ Pass | Mobile |
| UPG-AND-1 | Accounts, balances, NFTs, staking and earning positions, dApp connections and settings are all still there and correct | ✅ Pass | Mobile |
| UPG-AND-2 | Transaction history from before the upgrade is still readable, with the same figures | ✅ Pass | Mobile |
| UPG-AND-3 | No screen is broken where a removed feature used to be — Crowdloans, Polygon zkEVM, stDOT, the old Bittensor root claim | ✅ Pass | Mobile |
| PROD-IOS | Quick recheck on the App Store build — the version shown in the app is the one published, the wallet opens and unlocks, balances load, and a transfer goes through | ✅ Pass | Mobile |
| PROD-AND | Quick recheck on the Google Play build — the version shown in the app is the one published, the wallet opens and unlocks, balances load, and a transfer goes through | ✅ Pass | Mobile |

### Bugs

None.

## Summary

US-42.27 closes and with it the last QC story in the window. The Mobile release is v1.2.45(534)b-v16.

All four stages pass. The two beta builds ran the whole checklist on a fresh install — 81 of 82 lines each, with REG-32 skipped for the reason it carried through the regression — and then the upgrade recheck on each. Accounts, balances, NFTs, staking and earning positions, dApp connections and settings all survive the upgrade, history from before it is still readable with the same figures, and no screen is broken where Crowdloans, Polygon zkEVM, stDOT or the old Bittensor root claim used to be.

The App Store and Google Play builds both pass their quick recheck: the version shown in the app is the one published, the wallet opens and unlocks, balances load and a transfer goes through.

No bug found in an earlier stage was still open when a later one started, which is what AC-8 asks and what let each stage begin.

One thing carries past this story. AC-18 of US-42.29 was skipped on 10-08 — the locale pass on the five new multisig notification strings. Reading the diff of PR #5095 suggests they ship as English in vi, ja, ru and zh, with only the sixth string of the batch translated. That PR has not merged yet, so the check is still worth running.

No bugs found.
