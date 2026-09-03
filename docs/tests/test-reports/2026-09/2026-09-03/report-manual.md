# Manual Test Report — EPIC-42 — 2026-09-03

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-03 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.1 |
| Total bugs found | 1 |
| P0 | 0 |
| P1 | 1 |
| P2 | 0 |
| Status | in progress |

---

## US-42.24.1 — Web-runner 1.3.68 on Mobile

Part of [US-42.24](../../../../sprints/stories/US-42.24-qc-web-runner-1-3-86.md) — updating the web-runner to 1.3.86, one sub-task per version.

Three items in this session: Transak widget URL ([#4835](https://github.com/Koniverse/SubWallet-Extension/issues/4835)), NFT ERC-721 import on Rari ([#4625](https://github.com/Koniverse/SubWallet-Extension/issues/4625)), NFT without tokenOfOwnerByIndex ([#4568](https://github.com/Koniverse/SubWallet-Extension/issues/4568)).

Locked balance display ([#4708](https://github.com/Koniverse/SubWallet-Extension/issues/4708)) also shipped in 1.3.68 but is tested in [US-42.24.3](../../../../sprints/stories/US-42.24.3-qc-web-runner-1-3-70.md) alongside OpenGov, since its breakdown has a Governance row.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1 | The buy flow opens the Transak widget correctly — Android fresh | ✅ Pass | |
| AC-2 | When the widget URL cannot be fetched, the toast reads "Unable to redirect you to the selected supplier at the moment. Try again later" — Android fresh | ✅ Pass | |
| AC-3 | AC-1 and AC-2 pass on Android upgrade | ✅ Pass | |
| AC-4 | AC-1 and AC-2 pass on iOS fresh | ✅ Pass | |
| AC-5 | AC-1 and AC-2 pass on iOS upgrade | ✅ Pass | |
| AC-6 | An ERC-721 NFT on Rari imports successfully, no "Incompatible NFT" error — Android fresh | ⏭️ Skipped | Rari Chain has shut down |
| AC-7 | An ERC-1155 NFT on Rari imports successfully — Android fresh | ⏭️ Skipped | Rari Chain has shut down |
| AC-8 | AC-6 and AC-7 pass on Android upgrade | ⏭️ Skipped | Rari Chain has shut down |
| AC-9 | AC-6 and AC-7 pass on iOS fresh | ⏭️ Skipped | Rari Chain has shut down |
| AC-10 | AC-6 and AC-7 pass on iOS upgrade | ⏭️ Skipped | Rari Chain has shut down |
| AC-11 | An NFT on a contract without tokenOfOwnerByIndex shows up in the NFT list — Android fresh | ❌ Fail | See BUG-42.24.1-01 |
| AC-12 | AC-11 passes on Android upgrade | ❌ Fail | See BUG-42.24.1-01 |
| AC-13 | AC-11 passes on iOS fresh | ❌ Fail | See BUG-42.24.1-01 |
| AC-14 | AC-11 passes on iOS upgrade | ❌ Fail | See BUG-42.24.1-01 |
| AC-15 | After upgrading, existing accounts, balances, NFTs and settings are still there and correct — both platforms | 🚫 Blocked | Accounts, balances and settings all carry over correctly. Only the NFT half is blocked by BUG-42.24.1-01 |

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.1-01 | No auto-detect of EVM ERC-721 NFTs when importing or attaching an account that holds them | Import or attach account `0x66666F58dE1bcD762A5E5c5aFf9cc3C906D66666` on Mobile → open the NFT screen → the account holds NFTs on several EVM chains (Ethereum, Optimism, Gnosis) | No NFTs are shown on Mobile. The same account on the Extension shows them | The NFTs are auto-detected and shown on Mobile, the same as on the Extension | P1 | todo | |

---

## Summary

1 bug found, P1. 5 AC pass, 4 fail, 5 skipped, 1 blocked.

Transak widget URL (#4835) passes on all four combinations. NFT without tokenOfOwnerByIndex (#4568) fails on all four — BUG-42.24.1-01: an imported or attached account holding EVM NFTs shows none of them on Mobile, while the same account shows them on the Extension. The five NFT-import-on-Rari checks (#4625) are skipped because Rari Chain shut down in June 2026.

AC-15 is blocked only in part. After an upgrade, accounts, balances and settings all carry over correctly on both platforms; the NFT half cannot be verified while no NFTs appear at all, so the AC stays open on that one point.

The session cannot close until BUG-42.24.1-01 is fixed: AC-11 to AC-15 need a retest on the fixed build.
