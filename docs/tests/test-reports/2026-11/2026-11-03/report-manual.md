# Manual Test Report — EPIC-42 — 2026-11-03

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-11-03 |
| Tester | MaiThuongNinni |
| Environment | Extension — master build |
| Runner | manual (extension) |
| Build under test | master |
| Stories tested | US-42.31 — in progress |
| Cases run | — |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.31 — Release SubWallet Extension v1.3.91

Stage 2 of the gate — the master build. Dev finished on 11-02: the release content on both halves and the full regression pass, 88 of 105 AC, no bugs.

This stage repeats the release-item checks on a build made from master and runs the regression again on it. Where dev answered "the code works", master answers "the code works in the build that ships".

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-3a | Multisig notification (#5093) works correctly on the master build | — | not run |
| AC-3b | The chainlist maintenance (ChainList #710) is live on the master build | — | not run |
| AC-4 | Regression pass on the master build finds no new issues | — | not run |
| AC-12 | The build carries a published release of `@subwallet/chain-list`, not a PR build, and `fetchLatestChainData()` is not commented out | — | not run |

### Before the stage can start

Checked on 2026-11-03.

| Item | State |
|---|---|
| PR #5095 — multisig notification | merged 2026-10-29, merge commit `f035c59dcb` |
| PR #5096 — chainlist | still open, last touched 2026-10-09 |
| ChainList #713 | merged 2026-10-12, chain-list 0.2.132 published |
| A build from master carrying both items | not confirmed |

AC-12 is the one to settle first. The diff of PR #5096 still pins `@subwallet/chain-list` to `0.2.132-beta.5-pr-713-885df11c` instead of the published `0.2.132`, and still has `fetchLatestChainData()` commented out. Merged as it stands it would ship a PR build of the chain list and switch off the live chain-data fetch. Checking this before the rest of the stage saves re-running everything on a build that was never valid.

### Release content on the master build

Not run.

The checks are the same lines as dev: AC-1a-01 to AC-1a-23 for the multisig notification and AC-1b-01 to AC-1b-32 for the chainlist, recorded on the [2026-10-30](../2026-10/2026-10-30/report-manual.md) and [2026-11-02](../2026-11-02/report-manual.md) reports. They are re-run here against the master build rather than re-listed.

### Regression on the master build

Not run.

The list is REG-EXT-1 to REG-EXT-95, the same 95 cases run on dev and written out in full on the [2026-11-02 report](../2026-11-02/report-manual.md). REG-EXT-42 stays skipped — NFTs are auto-detected, so removing a custom one no longer does anything.

### Bugs

None yet.

## Summary

Session open. Stage 2 of the v1.3.91 gate, the master build, has not started.

The blocker to settle first is AC-12, re-checked today: PR #5096 is still open and untouched since 2026-10-09, still pins a chain-list PR build rather than the published `0.2.132`, and still has `fetchLatestChainData()` commented out. A master build made from it would not be the build that ships. PR #5095 is in — merged 2026-10-29 as `f035c59dcb`.

US-42.31 stands at 88 of 105, unchanged from 11-02.
