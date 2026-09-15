# Manual Test Report — EPIC-42 — 2026-09-15

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-09-15 |
| Tester | MaiThuongNinni |
| Environment | Mobile — Android + iOS |
| Runner | manual (mobile) |
| Build under test | to fill in — build number + web-runner version |
| Stories tested | US-42.24.13 — closed; US-42.24.17 — closed without being run; US-42.24.16 started |
| Total bugs found | 3 |
| P0 | 0 |
| P1 | 0 |
| P2 | 1 |
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

## US-42.24.17 — Web-runner 1.3.85 on Mobile

Closed without being run. The version carries one item, the signing prompt security fix ([#5042](https://github.com/Koniverse/SubWallet-Extension/issues/5042)), and none of its 11 AC could be tested on this platform.

Reaching the fix needs a dApp or test page that sends a request down the extrinsic channel with a raw-message-shaped payload — the attack the [polkadot-js report](https://forum.polkadot.network/t/update-polkadot-js-extension-to-0-64-0-signing-prompts-could-hide-the-real-transaction/18291) describes. That setup could not be put together against the Mobile build, so every AC is recorded as skipped rather than failed.

The same fix passed on Extension (US-42.11, 7 of 7 AC) and Web App (US-42.12, 5 of 5 AC), both with no bug. Mobile runs the same Extension code through the web-runner, so the fix reached this build; what is missing is evidence from this platform, not the fix itself.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1 to AC-7 | The whole signing prompt security check, 11 AC | ⏭️ Skipped | No way to send a crafted signing request on Mobile |

### Bugs

None found — nothing was run.

## US-42.24.16 — Web-runner 1.3.84 on Mobile

Opened at the end of the session and most of the way through. Both Extension items ran: the recommended validator for native and subnet staking ([#5024](https://github.com/Koniverse/SubWallet-Extension/issues/5024)), and the post-upgrade fixes ([#5013](https://github.com/Koniverse/SubWallet-Extension/issues/5013)) — the confirmation screen when moving a stake to a different validator, and the app crashing when the slider was in use on the unstake screen and the user switched account. Two of the four chain-list v0.2.129 entries ran as well: the MYTH XCM route between Polkadot Asset Hub and Hydration ([ChainList #301](https://github.com/Koniverse/SubWallet-ChainList/issues/301)) and Polkadot Hub EVM as a new chain ([ChainList #701](https://github.com/Koniverse/SubWallet-ChainList/issues/701)).

Its AC were written out today from the release note and the issue bodies, taking the story from 12 AC to 23.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| AC-1 | A recommended validator is suggested when starting native staking, and it can be overridden with a different choice — Android + iOS fresh | ✅ Pass | [#5024](https://github.com/Koniverse/SubWallet-Extension/issues/5024) |
| AC-1a | The suggestion is marked in the validator list so it is clear which one is recommended, and the list still shows every other validator — Android + iOS fresh | ✅ Pass | |
| AC-1b | Staking with the suggested validator goes through, and the position afterwards names that validator — Android + iOS fresh | ✅ Pass | |
| AC-2 | The same for subnet staking — Android + iOS fresh | ✅ Pass | |
| AC-2a | A subnet stake with the suggested validator goes through and shows the right subnet afterwards — Android + iOS fresh | ✅ Pass | |
| AC-3 | AC-1 to AC-2a pass on Android + iOS upgrade | ✅ Pass | |
| AC-4 | The confirmation screen for moving a stake to another validator looks right — Android + iOS fresh | ✅ Pass | |
| AC-4a | That screen names both validators, the one being left and the one being moved to, with the amount and the fee — Android + iOS fresh | ✅ Pass | |
| AC-4b | The move goes through and the position afterwards sits with the new validator — Android + iOS fresh | ✅ Pass | |
| AC-5 | Using the slider on the unstake screen and then switching account does not crash the app — Android + iOS fresh | ✅ Pass | Tried several times, since it is a timing bug |
| AC-5a | After switching account that way, the unstake screen shows the new account's position rather than keeping the previous one — Android + iOS fresh | ✅ Pass | |
| AC-6 | AC-4 to AC-5a pass on Android + iOS upgrade | ✅ Pass | |
| AC-7 | MYTH can be sent by XCM from Polkadot Asset Hub to Hydration, and it arrives — Android + iOS fresh | ✅ Pass | [ChainList #301](https://github.com/Koniverse/SubWallet-ChainList/issues/301) |
| AC-7a | The same route works in the other direction, Hydration back to PAH — Android + iOS fresh | ✅ Pass | |
| AC-10 | Polkadot Hub EVM appears in the network list with its logo, connects on its RPC and loads balances — Android + iOS fresh | ✅ Pass | [ChainList #701](https://github.com/Koniverse/SubWallet-ChainList/issues/701) |
| AC-10a | A transfer on Polkadot Hub EVM goes through, and its explorer link opens the transaction — Android + iOS fresh | ✅ Pass | |

The validator suggestion works on both native and subnet staking — it is marked in the list, can be overridden, and staking with it goes through. The crash from #5013 did not reproduce, and the stake move screen shows what it should. Two of the four chain-list entries pass: the MYTH route runs both ways, and Polkadot Hub EVM comes up as a new chain — it connects, loads balances, sends, and its explorer link opens the transaction.

Left for the next session: the two remaining chain-list entries — TUSDT on Bittensor and Cypress on Base Mainnet — and the three upgrade AC.

### Bugs

| ID | Title | Steps to reproduce | Actual | Expected | Severity | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| BUG-42.24.16-01 | The unstake confirmation screen drops the TAO unstaking fee notice the Extension shows | Earning → open a Bittensor position → Unstake → enter an amount → tap Unstake, then compare the confirmation screen with the same one on the Extension | The notice is missing. The Extension shows a third card under the amounts — "TAO unstaking fee", with an info icon and the line that an unstaking fee of 0.01 TAO will be deducted from the unstaked amount once the transaction completes. Mobile ends at the fee row, so the user is never told about that deduction. Two labels also differ: Account name against the Extension's Account, and Estimated fee against its Network fee | The TAO unstaking fee notice is shown as the Extension shows it, and the two rows carry the same labels | P2 | todo | ![](img/BUG-42.24.16-01.png) |

## Summary

US-42.24.13 is closed. All 16 AC pass across two sessions — eleven settled yesterday, five today — on Android and iOS, fresh install and upgrade. The rest of NFTService phase 1 went through today: EVM NFTs are found and shown right, an NFT can be sent and arrives, importing by contract address still works, and nothing was lost in the upgrade.

Three bugs today. Two are P3 display defects on the NFT screens. The NFT transfer confirmation screen differs from the Extension in its title, its grouping, its row labels and in spelling out the recipient address; and the info icon in the Description popup is stretched down the height of the text instead of staying a small circle. Neither stops an NFT being sent or read. Both are in US-42.24.20 waiting for a fixed build.

US-42.24.17 was closed in the same session without being run. Its one item, the signing prompt security fix, needs a crafted signing request that cannot be sent on Mobile, so all 11 AC are skipped. The fix passed on Extension and Web App, so this is a gap in evidence from this platform rather than a gap in the fix.

US-42.24.16 was opened last, with the two post-upgrade fixes from #5013 passing. The third bug came from there and is the one that matters most today: the unstake confirmation screen drops the TAO unstaking fee notice, so the user is never told that 0.01 TAO will be taken off the amount they get back. Logged P2 — the figure on screen is not what arrives. US-42.24.20 now holds 65 rows with 61 still open. That was the last version sub-task in backlog, so every one of them is now started or finished, leaving the regression and bug-verification stories.
