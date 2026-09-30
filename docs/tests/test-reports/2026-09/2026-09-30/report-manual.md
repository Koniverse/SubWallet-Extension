# Manual Test Report — EPIC-42 — 2026-09-30

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-30 |
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

## US-42.24.19 — Full wallet regression, round 3

Round 2 closed on [2026-09-29](../2026-09-29/report-manual.md) at 83 of 85 lines on each platform, with no P1 left in the programme. Round 3 opened today on the build going to beta, with the ticks cleared and the lines unchanged.

Round 2 ran against web-runner versions as each one landed, over several weeks and several builds. The beta is one build carrying all of it, so a check that passed on the build where its feature landed has not yet been run on the build that ships. That is what this round is for, and it is the last run on the development build before [US-42.27](../../../../sprints/stories/US-42.27-qc-release-mobile.md) takes the same checklist to TestFlight and the Google Play beta track.

The two skipped lines stay skipped for the same reasons: REG-32, because NFTs are auto-detected so removing one no longer does anything, and REG-76, because the Polkadot API key that history check needs no longer works.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None yet.

## US-42.24.20 — Verify the bugs found during this update

One bug is open coming into today: BUG-42.24.19-26, P2 on iOS, the close button on Settings often not responding to the first tap.

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|

## Summary

Session in progress.
