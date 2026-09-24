# Manual Test Report — EPIC-42 — 2026-09-24

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-24 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.20, US-42.24.22 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in-progress |

---

## US-42.24.20 — Verify the bugs found during this update

Two P3 bugs settled. 66 of 77 verified, 4 closed no fix, 7 still open — one P1, four P2 and two P3.

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|
| BUG-42.24.13-04 | US-42.24.13 | P3 | The NFT transfer confirmation screen did not match the Extension | ✅ Fixed — the screen matches |
| BUG-42.24.11-04 | US-42.24.11 | P3 | The swap screen cut the alpha token names short on both the From and To rows | ⏭️ Closed no fix — the developer is keeping the name shown on the swap screen as it is, because changing it may affect other devices and tokens |

## US-42.24.22 — Web-runner 1.3.88 on Mobile

ParaSpell API v2 itself ran today ([#5051](https://github.com/Koniverse/SubWallet-Extension/issues/5051)) — the half left over from the 2026-09-18 session. All six AC pass on Android and iOS, fresh install and upgrade, with no bug found.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1 | XCM transfers still work on the routes ParaSpell v2 still serves — Android + iOS fresh | ✅ Pass | |
| AC-2 | The fee quoted before sending matches what is actually taken — Android + iOS fresh | ✅ Pass | |
| AC-3 | The destination fee is still shown, and the amount that arrives matches the quote — Android + iOS fresh | ✅ Pass | |
| AC-4 | A route that cannot be served fails clearly, with a message rather than a stuck screen — Android + iOS fresh | ✅ Pass | |
| AC-5 | XCM history shows the same figures the confirmation screen did — Android + iOS fresh | ✅ Pass | |
| AC-6 | AC-1 to AC-5 pass on Android + iOS upgrade | ✅ Pass | |

15 of 17 AC done. Left to run: AC-16 and AC-17, both upgrade checks on the chain-list half — PRDCTR and the TUSDT rename on an upgrade, and old XCM history still readable after it.

### Bugs

None.
