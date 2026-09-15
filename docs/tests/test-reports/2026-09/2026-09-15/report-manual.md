# Manual Test Report — EPIC-42 — 2026-09-15

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-15 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.13 — closed |
| Total bugs found | 2 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 2 |
| Status | done |

---

## US-42.24.13 — Web-runner 1.3.80 on Mobile

Carried over from [2026-09-14](../2026-09-14/report-manual.md), where 11 of its 16 AC were settled. Transfer max at the existential deposit, the network address on the XCM confirmation screen and token approve all passed yesterday, along with the Unique Network NFTs, which pass with three display defects noted against them.

The rest of NFTService phase 1 ([#4884](https://github.com/Koniverse/SubWallet-Extension/issues/4884)) ran today — EVM NFTs, sending an NFT, importing one by contract address — along with the two upgrade AC, which closes the story.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-10 | EVM NFTs are found and shown with the right image, name and collection — Android + iOS fresh | ✅ Pass | |
| AC-12 | An NFT can be sent, and it arrives — Android + iOS fresh | ✅ Pass | The confirmation screen is laid out differently, see BUG-42.24.13-04; the transfer itself goes through |
| AC-13 | Importing an NFT by contract address still works — Android + iOS fresh | ✅ Pass | |
| AC-14 | AC-10 to AC-13 pass on Android + iOS upgrade | ✅ Pass | |
| AC-15 | After upgrading, NFTs that were visible before the upgrade are still visible — the move to NFTService did not lose any — both platforms | ✅ Pass | |

AC-11 was settled yesterday. With these four the story is finished at 16 of 16.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.13-04 | The NFT transfer confirmation screen does not match the Extension | NFTs → open an NFT → Send → fill in a recipient → tap Send, then compare the confirmation screen with the same one on the Extension | Four differences. The title reads "NFT Transfer confirmation" where the Extension reads "Transfer confirmation". The rows are grouped into two cards — sender, recipient and network together, then NFT and fee — where the Extension uses three: account and network, then recipient and NFT, then the fee on its own. The labels differ: Send from, Send to and Estimated fee against the Extension's Account, Recipient and Network fee. And the recipient row also spells out the address, which the Extension does not show | The screen matches the Extension — the same title, the same three cards in the same order, the same row labels, and the recipient shown by name alone | P3 | todo | ![](img/BUG-42.24.13-04.png) |
| BUG-42.24.13-05 | The info icon in the Description popup is stretched down the height of the text | NFTs → open an NFT that has a long description → tap the info icon on the description row to open the Description popup → look at the icon on the left of the text | The icon is stretched into a tall rounded bar running almost the full height of the text block, with the "i" at the top of it. It should be a small circle | The info icon keeps its own size — a small circle beside the text, not scaled to the height of the block | P3 | todo | ![](img/BUG-42.24.13-05.png) |

## Summary

US-42.24.13 is closed. All 16 AC pass across two sessions — eleven settled yesterday, five today — on Android and iOS, fresh install and upgrade. The rest of NFTService phase 1 went through today: EVM NFTs are found and shown right, an NFT can be sent and arrives, importing by contract address still works, and nothing was lost in the upgrade.

Two bugs today, both P3 display defects. The NFT transfer confirmation screen differs from the Extension in its title, its grouping, its row labels and in spelling out the recipient address; and the info icon in the Description popup is stretched down the height of the text instead of staying a small circle. Neither stops an NFT being sent or read. Both are in US-42.24.20 waiting for a fixed build, which now holds 64 rows with 60 still open.

This closes the third version sub-task in two days. Every version sub-task is now done except 1.3.84 and 1.3.85, which are still in backlog, alongside the regression and bug-verification stories.
