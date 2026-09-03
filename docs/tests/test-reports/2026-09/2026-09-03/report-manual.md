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
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
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
| AC-11 | An NFT on a contract without tokenOfOwnerByIndex shows up in the NFT list — Android fresh | ✅ Pass | |
| AC-12 | AC-11 passes on Android upgrade | ✅ Pass | |
| AC-13 | AC-11 passes on iOS fresh | ✅ Pass | |
| AC-14 | AC-11 passes on iOS upgrade | ✅ Pass | |
| AC-15 | After upgrading, existing accounts, balances, NFTs and settings are still there and correct — both platforms | ⬜ Not run | |

### Bugs

None so far.

---

## Summary

Session in progress, no bugs found. Transak widget URL (#4835) and NFT without tokenOfOwnerByIndex (#4568) both pass on all four combinations. The five NFT-import-on-Rari checks (#4625) are skipped because Rari Chain shut down in June 2026. Only AC-15, the post-upgrade data check, is left.
