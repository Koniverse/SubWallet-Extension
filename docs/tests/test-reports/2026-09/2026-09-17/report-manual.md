# Manual Test Report — EPIC-42 — 2026-09-17

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-17 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS; Extension for US-42.25 |
| Runner | manual |
| Build under test | to fill in — build number + web-runner version; US-42.25 ran a PR #5076 build from the link in the issue comment |
| Stories tested | US-42.24.19, US-42.24.20, US-42.25, US-42.26 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.24.19 — Full wallet regression, round 2

Round 2 starts today on the rewritten checklist — 77 lines each for Android and iOS, covering ground round 1 did not. Results go against REG-A for Android and REG-I for iOS.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None found yet.

## US-42.24.20 — Verify the bugs found during this update

Carried on from [2026-09-16](../2026-09-16/report-manual.md), which took the story from 28 verified to 54 with two closed no fix. Fifteen bugs are still open: two P1, eight P2 and five P3.

### Bugs rechecked

| Item | Found in | Severity | What it is | State |
|---|---|---|---|---|

## US-42.25 — sr25519 VRF signing for dApp key derivation (#5072)

Extension, not Mobile. First run of the new story, against a PR [#5076](https://github.com/Koniverse/SubWallet-Extension/pull/5076) build. Test dApp was Orbinum Hub at `https://feat-subwallet-substrate.app-m9y.pages.dev`, through Shielded Pool → Private Vault → Sign and unlock.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1 | A dApp asks for a VRF signature, the confirmation appears, and approving returns a result | ✅ Pass | |
| AC-2 | Rejecting returns an error and no signature | ✅ Pass | |
| AC-3 | The same request twice gives the same derived key | ✅ Pass | |
| AC-4 | The screen shows the full origin, scheme included | ✅ Pass | The fix for the review finding that an earlier version showed a stripped domain |
| AC-5 | The header reads Key derivation request | ✅ Pass | |
| AC-6 | The screen names the account and warns that the key is permanent | ✅ Pass | |
| AC-7 | View details shows Bound to and Context | ✅ Pass | |
| AC-8 | Ordinary dApp connect and signing still work | ✅ Pass | |
| AC-9 | The passkey unlock setup modal that rides in this PR behaves | ✅ Pass | |
| AC-10 | All of the above on a fresh install | ✅ Pass | |
| AC-11 | All of the above on an upgrade | ✅ Pass | |

11 of 11 pass, no bugs. Story closed.

The whole path works: the dApp asks for a derived key, the wallet shows the Key derivation request screen naming `https://feat-subwallet-substrate.app-m9y.pages.dev` and the account, and after approving, Orbinum Hub derives its own privacy address `orbpriv3:0x2b2bc3e…b:fc15d64d` and shields 1 ORB into a note with a commitment and a created tx. The signature is real, not a screen that only looks right.

### What this session does not cover

Three groups of checks were dropped from the story's scope rather than left open, so nobody tested them:

- Two origins were never compared. The dApp was reachable at one address only, so the property the feature exists for — one site cannot obtain another site's key — has no manual test behind it. The PR's own unit tests cover it.
- The five locales on the confirmation screen.
- The refusal cases: non-sr25519 account, oversized data or context, non-hex input, non-HTTP(S) origin.

Evidence: video and screenshots posted to [issue #5072](https://github.com/Koniverse/SubWallet-Extension/issues/5072).

### Bugs

None.

## US-42.26 — Release gate, Extension v1.3.90

Stage 1 of four. Both release items were merged into the extension on dev and checked there, along with a regression pass over the app's main functions.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1a | sr25519 VRF signing (#5072) works correctly after merge into the dev environment | ✅ Pass | [#5076](https://github.com/Koniverse/SubWallet-Extension/pull/5076) merged as `a4799cfbb1` |
| AC-1b | Bittensor manual claim (#5064) works correctly after merge into the dev environment | ✅ Pass | [#5065](https://github.com/Koniverse/SubWallet-Extension/pull/5065) merged as `1b7abee917` |
| AC-2 | Regression pass on dev finds no new issues in the app's main functions | ✅ Pass | |

This is the first time either item has been checked on merged code. US-42.25 ran the VRF signing against an unmerged PR build earlier today, and US-42.23 ran the Bittensor claim three weeks ago on a build that has not been rebuilt since, so neither result carries into the release on its own.

Three stages left: master build, draft release, production.

### Bugs

None found on dev.

## Summary

Session in progress. US-42.25 done: 11 of 11 AC pass, no bugs.
