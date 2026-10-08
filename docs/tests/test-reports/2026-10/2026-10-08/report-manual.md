# Manual Test Report — EPIC-42 — 2026-10-08

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-08 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight and Google Play beta build numbers |
| Stories tested | US-42.27, US-42.29 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.27 — Release SubWallet Mobile

At 81 of 82 lines on each beta build, with REG-32 skipped. AC-1 and AC-3 are settled.

Left to run: the upgrade recheck on each build — UPG-IOS-1 to 3 and UPG-AND-1 to 3, which settle AC-2 and AC-4 — then the two production stages. The upgrade rechecks need the previous production version installed with its data first.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None.

## US-42.29 — Improve multisig notification (#5093)

Not started. 22 AC against PR #5095, which is open and unreviewed.

The setup it needs: a multisig with at least three signatories, the wallet holding more than one of them, a second wallet to approve or cancel from outside, and a way to make the chain's RPC fail.

## Summary

Session in progress.
