# Manual Test Report — EPIC-42 — 2026-11-04

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-11-04 |
| Tester | MaiThuongNinni |
| Environment | Web App — https://7ae7468d.subwallet-webapp.pages.dev/ |
| Runner | manual (web app) |
| Build under test | PR #5011, Extension code up to v1.3.86 |
| Stories tested | US-42.32 — in progress |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | in progress |

---

## US-42.32 — Web App after PR #5011

Day two on the same Web App build. The [2026-11-03 report](../2026-11-03/report-manual.md) closed with 49 of 112 AC settled: turn off all networks 11 of 12, locked balance 8 of 8, crowdloan removed 4 of 4, import from Trust Wallet 14 of 14, subnet token names 4 of 4, asset display name 8 of 8. AC-12 is blocked in full by BUG-42.32-03.

### Left to run

| Feature | AC | State |
|---|---|---|
| Nested NFT | AC-5-01 to AC-5-16 | not run |
| Transfer an alpha token | AC-6-01 to AC-6-16 | not run |
| Earning terms in i18n | AC-7-01 to AC-7-03 | not run |
| Translation keys | AC-9-01 to AC-9-03 | not run |
| Chain enabling | AC-10-01, AC-10-02 | not run |
| Bittensor staked swap balance | AC-12-01 to AC-12-06 | blocked — BUG-42.32-03 |
| XCM destination fee | AC-13-01 to AC-13-07 | not run — BUG-42.32-02 came from a side-by-side check, not a run of AC-13 |
| NFT without tokenOfOwnerByIndex | AC-14-01 to AC-14-05 | not run |
| The merge itself | AC-15 to AC-18 | not run |
| Turn off all networks | AC-1-09 | fails — BUG-42.32-01 |

### Open bugs from 2026-11-03

| Bug | AC | Summary | Priority | Status |
| --- | --- | --- | --- | --- |
| BUG-42.32-01 | AC-1-09 | After turning off all networks, substrate networks stay on a spinning toggle when turned back on; EVM networks enable normally | P1 | open |
| BUG-42.32-02 | AC-13-01, AC-13-07 | Cross-chain fee rows wrong: DOT → Kusama Asset Hub has no cross-chain fee row, ASTR → Hydration leads with the dollar value and rounds the cross-chain fee to 0 | P1 | open |
| BUG-42.32-03 | AC-12 (all) | The Swap screen does not load and *Reload now* does not recover it | P1 | open |

Full steps and screenshots are in the 2026-11-03 report.

### AC results

Not run yet.

## Bugs found

None yet today.

## Summary

Session open. Web App only, US-42.32 day two. Nothing run yet.
