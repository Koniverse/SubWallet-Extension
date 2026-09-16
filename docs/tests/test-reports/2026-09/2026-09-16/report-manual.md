# Manual Test Report — EPIC-42 — 2026-09-16

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-16 |
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

## US-42.24.20 — Verify the bugs found during this update

Carried on from [2026-09-15](../2026-09-15/report-manual.md), which took the story from 4 verified to 28 with one closed no fix. Thirty-eight bugs are still open, and twenty-two of those are the multisig batch from US-42.24.7.

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|
| BUG-42.24.7-10 | US-42.24.7 | P2 | Swap was still offered on a multisig account | ✅ Fixed — swap is disabled |
| AC-14 | US-42.24.7 | — | Swap is disabled for a multisig account, both with and without XCM | ✅ Rerun, passes — BUG-42.24.7-10 now settled both ways |
| BUG-42.24.7-11 | US-42.24.7 | P2 | Liquid staking was still listed in Earning options on a multisig account (MANTA) | ✅ Fixed — the option is hidden |
| AC-15 | US-42.24.7 | — | Earning — nomination pool and direct nomination follow the transfer logic; liquid staking and subnet staking are hidden | ✅ Rerun, passes — BUG-42.24.7-11 now settled both ways |
| BUG-42.24.7-12 | US-42.24.7 | P2 | Notification settings had no Pending multisig approvals option | ✅ Fixed — the option is there |
| BUG-42.24.7-13 | US-42.24.7 | P2 | Multisig accounts had no multisig badge on their avatar | ✅ Fixed — the badge is shown |

## US-42.24.19 — Full wallet regression

### Bugs

None found yet.

## Summary

Session in progress.
