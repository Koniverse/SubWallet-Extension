# Manual Test Report — EPIC-42 — 2026-09-11

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-11 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.7, US-42.24.9 |
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
| AC-16 | Unstake, stake more, withdraw and change validator all follow the same logic — Android + iOS fresh | ✅ Pass | |
| AC-18 | Buy token is unaffected, and adding or removing a proxy follows the transfer logic — Android + iOS fresh | ✅ Pass | |
| AC-26 | A pending record appears on the multisig tab whatever kind the signatories are — normal, QR, ledger, proxy, multisig — Android + iOS fresh | ✅ Pass | |
| AC-27 | With a watch-only signatory, applying gives "The account you are using is Watch-only account, you cannot use this feature with it" — Android + iOS fresh | ✅ Pass | |
| AC-28 | Opening a pending transaction offers the right actions for who is looking: the initiator can reject, an in-between signatory can approve, the last signatory with call data can approve and execute — Android + iOS fresh | ✅ Pass | |
| AC-29 | A completed transaction offers view on explorer, and it opens that transaction on Subscan — Android + iOS fresh | ✅ Pass | |
| AC-30 | Reject, approve, and approve and execute each open their own confirmation screen — Android + iOS fresh | ✅ Pass | |
| AC-31 | AC-1 to AC-30 pass on Android + iOS upgrade | ❌ Fail | AC-13, AC-14 and AC-15 fail on upgrade too |
| AC-32 | After upgrading, multisig accounts, their pending transactions and their notifications are all still there and still correct — both platforms | ✅ Pass | |

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|

## US-42.24.9 — Web-runner 1.3.76 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). Carried on from [2026-09-09](../2026-09-09/report-manual.md), where the network toggle without an API key passed. Today covers the subnet token naming ([#4892](https://github.com/Koniverse/SubWallet-Extension/issues/4892)).

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-4 | Subnet tokens show as `{subnetId} \| {tokenName} {symbol}` in the token list — Android + iOS fresh | ✅ Pass | |
| AC-5 | The same format appears in token detail and in the transfer form — Android + iOS fresh | ✅ Pass | |
| AC-6 | Searching by subnet ID finds the token — Android + iOS fresh | ✅ Pass | |
| AC-7 | AC-4 to AC-6 pass on Android + iOS upgrade | ✅ Pass | |

What is left in this story is the Bittensor root staking group, AC-8 to AC-14.

### Bugs

None.

## Summary

Session in progress.
