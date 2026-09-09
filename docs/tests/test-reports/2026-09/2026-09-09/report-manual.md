# Manual Test Report — EPIC-42 — 2026-09-09

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-09 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.5, US-42.24.7 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| Status | in progress |

---

## US-42.24.5 — Web-runner 1.3.72 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). The proxy and chain-list halves were settled on [2026-09-08](../2026-09-08/report-manual.md); what was left is ParaSpell V5 ([#4908](https://github.com/Koniverse/SubWallet-Extension/issues/4908)).

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-40 | XCM transfers still work on the main routes, and the fee shown before sending matches what is actually taken — Android + iOS fresh | ✅ Pass | |
| AC-41 | Routes that existed before the upgrade are all still offered — none quietly disappeared — Android + iOS fresh | ✅ Pass | |
| AC-42 | AC-40 and AC-41 pass on Android + iOS upgrade | ✅ Pass | |
| AC-43 | After upgrading, proxy relationships set up before the upgrade are still listed and still usable — both platforms | ✅ Pass | |

The XCM library moving up a major version broke nothing: the routes are all still there and the fees match.

Every AC in this story now has a verdict — 41 pass, AC-19 and AC-27 skipped. The six bugs logged against it are all display problems on the proxy screens; none of them stopped a flow, so the AC covering those flows pass.

### Bugs

None.

## US-42.24.7 — Web-runner 1.3.74 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). Multisig account phase 1 ([#4855](https://github.com/Koniverse/SubWallet-Extension/issues/4855)).

Carried on from [2026-09-08](../2026-09-08/report-manual.md), where the AC were rewritten from the multisig QC checklist and BUG-42.24.7-01 was logged on the confirmation screen. No AC has a verdict yet.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|

## Summary

Session in progress.
