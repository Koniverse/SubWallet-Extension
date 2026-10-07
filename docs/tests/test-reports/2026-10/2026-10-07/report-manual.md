# Manual Test Report — EPIC-42 — 2026-10-07

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-07 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight and Google Play beta build numbers |
| Stories tested | US-42.27, US-42.28, US-42.29 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.27 — Release SubWallet Mobile

The fresh-install half of the beta stage closed on [2026-10-06](../2026-10-06/report-manual.md) at 81 of 82 lines on each build.

Left to run: the upgrade recheck on each beta build, then the two production stages. The upgrade rechecks need the previous production version installed with its data first.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None.

## US-42.28 — Maintenance of chainlist (ChainList #710)

At 166 of 201 lines. The RPC half, the 61 deactivated chains, the 24 new ones, the Bittensor table and two of the three 10-06 fixes are done.

Left to run: the Bittensor balance checks BIT-1 to BIT-10 and BIT-14, GEN-1 to GEN-6, RPC-X1 and RPC-X3, the upgrade runs, and FIX-4 to FIX-6. Everything that reads a balance against what it was before the change needs an upgrade carrying those figures.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None.

## US-42.29 — Improve multisig notification (#5093)

Not started. 22 AC against PR #5095, which is open and unreviewed.

The setup it needs: a multisig with at least three signatories, the wallet holding more than one of them, a second wallet to approve or cancel from outside, and a way to make the chain's RPC fail.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None.

## Summary

Session in progress.
