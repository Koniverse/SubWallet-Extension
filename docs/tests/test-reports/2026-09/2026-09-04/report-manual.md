# Manual Test Report — EPIC-42 — 2026-09-04

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-04 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.2, US-42.24.19, US-42.24.20 |
| Total bugs found | 1 |
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
| Status | in progress |

---

## US-42.24.2 — Web-runner 1.3.69 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). chain-list stable v0.2.122 ([#4827](https://github.com/Koniverse/SubWallet-Extension/issues/4827)) — 18 chain-list issues covering new networks, new tokens, transfers and XCM, removals, logos, explorer links, RPCs and on-ramp.

Continuing the session started on [2026-09-03](../2026-09-03/report-manual.md), where AC-1 (Acurast), AC-4 (TRAC) and AC-5 (vMANTA) passed. Three bugs were logged that day and are still open; none of them blocks an AC.

Still to run: AC-2, AC-3, AC-6 to AC-21.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-2 | Monad Mainnet and its native token appear with the right name, symbol, logo and decimals, and connect — Android + iOS fresh | ✅ Pass | chain-list [627](https://github.com/Koniverse/SubWallet-ChainList/issues/627) |
| AC-3 | Stable Mainnet and its token appear and connect, on both new RPCs — Android + iOS fresh | ✅ Pass | chain-list [628](https://github.com/Koniverse/SubWallet-ChainList/issues/628) |
| AC-6 | xAlpha tokens appear on Base Mainnet and on Subtensor EVM — Android + iOS fresh | ✅ Pass | chain-list [633](https://github.com/Koniverse/SubWallet-ChainList/issues/633), [634](https://github.com/Koniverse/SubWallet-ChainList/issues/634) |
| AC-7 | NIGHT appears on Cardano with the right symbol and balance — Android + iOS fresh | ⏭️ Skipped | Mobile does not support the Cardano ecosystem — chain-list [637](https://github.com/Koniverse/SubWallet-ChainList/issues/637) |
| AC-12 | Phala Network is gone from the network list and cannot be enabled — Android + iOS fresh | ✅ Pass | chain-list [630](https://github.com/Koniverse/SubWallet-ChainList/issues/630) |
| AC-14 | Avail Mainnet and Testnet show the new network and token logos — Android + iOS fresh | ✅ Pass | chain-list [626](https://github.com/Koniverse/SubWallet-ChainList/issues/626) |

### Bugs

None so far.

---

## US-42.24.19 — Web-runner 1.3.86 full regression on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). The full wallet regression, run alongside the version sub-tasks where the same screens come up.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.19-01 | The "Migrate to Unified Account" screen appears twice when importing an account (iOS) | On iOS, import an account → watch the screens after the import completes | The "Migrate to Unified Account" screen is shown, and then shown again | The screen appears once | P2 | todo | |

---

## US-42.24.20 — Verify the bugs found during the web-runner update

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). Rechecking bugs on a build with fixes, and rerunning the AC each bug had left unsettled.

### Verify results

| Bug | Found in | Fix verified | AC rerun |
|---|---|---|---|
| BUG-42.24.1-01 — EVM NFTs are not auto-detected when an account is imported or attached | US-42.24.1 | ✅ Pass | AC-7, AC-8, AC-9 — ✅ all pass |

The other four bugs are not fixed yet.

### Bugs

None found during the recheck.

---

## Summary

Session in progress.
