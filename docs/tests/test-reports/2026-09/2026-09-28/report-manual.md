# Manual Test Report — EPIC-42 — 2026-09-28

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-28 |
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
| Status | done |

---

## US-42.24.19 — Full wallet regression, round 2

Carried on from [2026-09-26](../2026-09-26/report-manual.md), which left Android 61 of 84 and iOS 61 of 84.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-33 | The earning options list; the earning positions list; position detail; earning instructions | ✅ Pass | Android + iOS |
| REG-34 | Stake — direct nomination; nomination pool; liquid stake; subnet staking | ✅ Pass | Android + iOS |
| REG-35 | Stake more | ✅ Pass | Android + iOS |
| REG-36 | Fast unstake — part of the position, and all of it | ✅ Pass | Android + iOS |
| REG-37 | Slow unstake — part of the position, and all of it | ✅ Pass | Android + iOS |
| REG-38 | Cancel unstake; withdraw; claim rewards | ✅ Pass | Android + iOS |
| REG-80 | Parachain (collator) staking — start staking; stake more; claim rewards; unstake; cancel unstake; withdraw | ✅ Pass | Android + iOS |
| REG-81 | Change validator — on direct nomination, and on subnet staking | ✅ Pass | Android + iOS |

### Bugs

None.

## Summary

Earning runs in full on both platforms, all eight lines. That includes REG-80 and REG-81, the parachain staking and change-validator lines added after the checklist was compared against the user guide, so three of the four features found missing then are now covered on both platforms.

Android 69 of 84, iOS 69 of 84.
