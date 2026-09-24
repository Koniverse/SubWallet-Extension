# Manual Test Report — EPIC-42 — 2026-09-24

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-24 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.20, US-42.24.22, US-42.24.24 |
| Total bugs found | 1 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 1 |
| Status | in-progress |

---

## US-42.24.20 — Verify the bugs found during this update

Five bugs settled — one P2 and four P3. 69 of 79 verified, 4 closed no fix, 6 still open — one P1, four P2 and one P3, the P3 being BUG-42.24.24-02 logged today.

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|
| BUG-42.24.7-30 | US-42.24.7 | P2 | The Call data row on the Signature request screen had no info button when signing for a dApp through a multisig account | ✅ Fixed |
| BUG-42.24.13-04 | US-42.24.13 | P3 | The NFT transfer confirmation screen did not match the Extension | ✅ Fixed |
| BUG-42.24.19-21 | US-42.24.19 | P3 | The dApp logos in the Recent row were different sizes | ✅ Fixed |
| BUG-42.24.19-22 | US-42.24.19 | P3 | The Method and Info rows on Transaction details could not be collapsed | ✅ Fixed |
| BUG-42.24.11-04 | US-42.24.11 | P3 | The swap screen cut the alpha token names short on both the From and To rows | ⏭️ Closed no fix — the developer's note: "The name displayed on the swap screen will remain unchanged because this may affect other devices and tokens" |

## US-42.24.22 — Web-runner 1.3.88 on Mobile

Everything left over from the 2026-09-18 session ran today — ParaSpell API v2 itself ([#5051](https://github.com/Koniverse/SubWallet-Extension/issues/5051)) and the two upgrade checks on the chain-list half. All eight AC pass on Android and iOS, fresh install and upgrade, with no bug found. The story closes at 17 of 17.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1 | XCM transfers still work on the routes ParaSpell v2 still serves — Android + iOS fresh | ✅ Pass | |
| AC-2 | The fee quoted before sending matches what is actually taken — Android + iOS fresh | ✅ Pass | |
| AC-3 | The destination fee is still shown, and the amount that arrives matches the quote — Android + iOS fresh | ✅ Pass | |
| AC-4 | A route that cannot be served fails clearly, with a message rather than a stuck screen — Android + iOS fresh | ✅ Pass | |
| AC-5 | XCM history shows the same figures the confirmation screen did — Android + iOS fresh | ✅ Pass | |
| AC-6 | AC-1 to AC-5 pass on Android + iOS upgrade | ✅ Pass | |
| AC-16 | AC-12 to AC-15 pass on Android + iOS upgrade | ✅ Pass | PRDCTR and the TUSDT rename, on an upgrade |
| AC-17 | After upgrading, XCM history from before the upgrade is still readable and its figures are unchanged, including for routes that have since been removed — both platforms | ✅ Pass | |

17 of 17 AC pass, no bugs. Story closed.

### Bugs

None.

## US-42.24.24 — Web-runner 1.3.90 on Mobile

Still blocked on BUG-42.24.24-01. One display bug found on the claim rewards screen while looking at it again.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.24-02 | Available balance takes a long time to load on the claim rewards select account screen, in all accounts mode | Switch to all accounts mode → Earning → open a Bittensor position with rewards to claim → Claim rewards → look at the Available balance line under the account picker | The Available balance line sits on a loading spinner for a long time before the figure appears, and Continue stays greyed out while it does. It does show in the end, but the claim cannot be started in the meantime even though the reward amount is already on screen | Available balance loads promptly, the way it does on the other account pickers | P3 | todo | ![](img/BUG-42.24.24-02.png) |
