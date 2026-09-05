# Manual Test Report — EPIC-42 — 2026-09-05

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-05 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.2, US-42.24.19 |
| Total bugs found | 1 |
| P0 | 0 |
| P1 | 1 |
| P2 | 0 |
| Status | in progress |

---

## US-42.24.2 — Web-runner 1.3.69 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). chain-list stable v0.2.122 ([#4827](https://github.com/Koniverse/SubWallet-Extension/issues/4827)) — 18 chain-list issues covering new networks, new tokens, transfers and XCM, removals, logos, explorer links, RPCs and on-ramp.

Third day on this story, after [2026-09-03](../2026-09-03/report-manual.md) and [2026-09-04](../2026-09-04/report-manual.md). Nine AC pass so far and one is skipped; three bugs were logged on the first day and are all still open, none of them blocking an AC.

Still to run: AC-8 (ARIAIP transfer), AC-9 (cACU transfer), AC-10 (DOT by XCM on Xode), AC-13 (removed RPCs), AC-15 to AC-18 (Aventus and Subtensor EVM explorer links, updated RPCs, Banxa on-ramp), AC-19 to AC-21 (the upgrade runs).

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None so far.

---

## US-42.24.19 — Web-runner 1.3.86 full regression on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md). The full wallet regression, run alongside the version sub-tasks where the same screens come up.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| REG-34 | NFTs load on EVM and on Unique Network, including nested ones | ❌ Fail | See BUG-42.24.19-05 |

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.19-05 | NFTs on substrate networks do not show on Mobile (Android and iOS) | On either platform, use an account holding NFTs on a substrate network such as Polkadot Asset Hub or Kusama Asset Hub → open the NFT screen on Mobile → then open the same account on the Extension | No NFTs are shown on Mobile. The same account on the Extension shows them | The substrate NFTs show on Mobile, the same as on the Extension | P1 | todo | |

---

## Summary

Session in progress.
