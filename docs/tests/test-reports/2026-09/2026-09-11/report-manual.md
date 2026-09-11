# Manual Test Report — EPIC-42 — 2026-09-11

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-11 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.7 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| Status | in progress |

---

## US-42.24.7 — Web-runner 1.3.74 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). Multisig account phase 1 ([#4855](https://github.com/Koniverse/SubWallet-Extension/issues/4855)).

Carried on from [2026-09-10](../2026-09-10/report-manual.md), where 18 AC passed and 3 failed. What is left is the multisig tab checks (AC-26 to AC-30) and the upgrade runs.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-11 | Transfer on a single chain — a multisig with at least two signable signatories can transfer, and the signatory picker behaves as designed — Android + iOS fresh | ✅ Pass | |
| AC-12 | Transfer max — transfer all equals the transferable amount, and when the fee is paid in the native token the signatory paying it is shown — Android + iOS fresh | ✅ Pass | |
| AC-27 | With a watch-only signatory, applying gives "The account you are using is Watch-only account, you cannot use this feature with it" — Android + iOS fresh | ✅ Pass | |

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|

## Summary

Session in progress.
