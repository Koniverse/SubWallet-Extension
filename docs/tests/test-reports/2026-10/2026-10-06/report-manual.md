# Manual Test Report — EPIC-42 — 2026-10-06

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-06 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight and Google Play beta build numbers |
| Stories tested | US-42.27, US-42.28 |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.27 — Release SubWallet Mobile

Carried on from [2026-10-05](../2026-10-05/report-manual.md), which reached 45 of 82 lines on each beta build with REG-32 skipped.

Left to run on the beta stage: manage account, lock and unlock, backup seed phrase, history, general settings, security settings, manage network, manage token, and REG-84 and REG-85. Then the upgrade rechecks, which need the previous production version installed with its data.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None.

## US-42.28 — Maintenance of chainlist (ChainList #710)

At 131 of 194 lines. The RPC half and all 61 deactivated chains are done.

Left to run: RPC-X1 and RPC-X3, the 24 new chains, the Bittensor subnets, GEN-1 to GEN-6, and the upgrade runs. GEN-1 to GEN-6 and RPC-X3 all need an upgrade carrying data from before the change.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|

### Bugs

None.

## Summary

Session in progress.
