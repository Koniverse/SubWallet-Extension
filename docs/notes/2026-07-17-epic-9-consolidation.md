# 2026-07-17 — EPIC-9 NFT ledger consolidated (116 issues -> 11 capability stories)

> **Structural change, docs-only.** Follows the same-day `EPIC-29` -> `EPIC-9` merge
> ([2026-07-17-epic-29-merged-into-epic-9](2026-07-17-epic-29-merged-into-epic-9.md)).
> The flat one-issue-per-story NFT ledger (`US-29.1`...`US-29.116`) is consolidated into
> capability-scoped stories. `check-ids` treats dated `notes/` files as archives, so the
> retired `US-29.x` ids are named here freely -- this file is their forwarding table.

**What changed:** the 116 `US-29.x` NFT maintenance stories are grouped by capability into
**11 new consolidated stories** (`US-9.11`...`US-9.21`), with 4 issues folded into existing FR
stories and 2 mis-area issues kept in place pending relocation. Per-issue `US-29.x` files are
deleted.

**Why:** the owner's call -- one-issue-per-story was too fragmented to review, and a newcomer
could not read the NFT development arc from 116 stubs. Consolidated stories have a clear
capability boundary and a chronological timeline, so the arc is legible. This **relaxes the
strict 1-issue-1-US rule** ([CONTEXT D107](../CONTEXT.md) / [LESSONS s68](../LESSONS.md)) for the
maintenance layer: traceability is preserved **per issue** (every issue number appears in a
consolidated story's timeline and in the map below), just no longer one file each.

**ID policy:** `US-29.x` ids are **retired, never reused** ([AGENTS.md](../../AGENTS.md) rule 1).
New ids `US-9.11`...`US-9.21` are minted (numbers not reused). `points`/`version_shipped`/`sprint`
are empty on consolidated done stories -- each capability grew across many releases; the timeline
carries the per-issue versions.

## Consolidated stories

| Story | Capability | # issues | done / backlog / deprecated |
| --- | --- | --- | --- |
| [US-9.11](../sprints/stories/US-9.11-substrate-nft-collection-and-chain-integrations.md) | Substrate NFT collection & chain integrations | 25 | 22✅ / 0📋 / 3⏸ |
| [US-9.12](../sprints/stories/US-9.12-evm-nft-collection-integrations.md) | EVM NFT collection integrations | 9 | 8✅ / 0📋 / 1⏸ |
| [US-9.13](../sprints/stories/US-9.13-nft-media-and-ipfs-gateway-pipeline.md) | NFT media & IPFS gateway pipeline | 14 | 14✅ / 0📋 / 0⏸ |
| [US-9.14](../sprints/stories/US-9.14-nft-send-transfer-hardening.md) | NFT send / transfer hardening | 17 | 15✅ / 0📋 / 2⏸ |
| [US-9.15](../sprints/stories/US-9.15-nft-import-and-validation-hardening.md) | NFT import & validation hardening | 11 | 8✅ / 0📋 / 3⏸ |
| [US-9.16](../sprints/stories/US-9.16-nft-display-detail-and-webapp-ui-hardening.md) | NFT display, detail & webapp UI hardening | 24 | 20✅ / 0📋 / 4⏸ |
| [US-9.17](../sprints/stories/US-9.17-bitcoin-ordinals-and-inscriptions-shipped.md) | Bitcoin Ordinals & inscriptions (shipped) | 4 | 4✅ / 0📋 / 0⏸ |
| [US-9.18](../sprints/stories/US-9.18-avail-light-client-nft.md) | Avail Light Client NFT | 3 | 3✅ / 0📋 / 0⏸ |
| [US-9.19](../sprints/stories/US-9.19-nft-service-migration.md) | NFT service migration | 1 | 1✅ / 0📋 / 0⏸ |
| [US-9.20](../sprints/stories/US-9.20-client-side-nft-service-and-sdk-migration.md) | Client-side NFT Service & SDK migration | 1 | 0✅ / 1📋 / 0⏸ |
| [US-9.21](../sprints/stories/US-9.21-nft-portfolio-management.md) | NFT portfolio management | 1 | 0✅ / 1📋 / 0⏸ |
| [US-9.2](../sprints/stories/US-9.2-nested-bundled-nft-display.md) | Nested / bundled NFT display *(existing FR anchor)* | 1 | 1✅ / 0📋 / 0⏸ |
| [US-9.7](../sprints/stories/US-9.7-bitcoin-ordinals-display.md) | Bitcoin Ordinals / inscriptions display *(existing FR anchor)* | 2 | 0✅ / 2📋 / 0⏸ |
| [US-9.10](../sprints/stories/US-9.10-nft-display-and-transfer-hardening.md) | NFT display & transfer hardening *(existing FR anchor)* | 1 | 0✅ / 1📋 / 0⏸ |

## Kept in place -- mis-area, pending relocation

| Prev. ID | Issue | Note |
| --- | --- | --- |
| `US-29.38` | #639 | USDC & stEWT -- token support -> EPIC-7 |
| `US-29.79` | #1967 | Grab 100 MDOT Mint NFT -- campaign -> EPIC-19 |

## Full issue -> new-home map (all 116, by issue #)

| Issue | Title | Prev. ID | New home |
| --- | --- | --- | --- |
| [#12](https://github.com/Koniverse/SubWallet-Extension/issues/12) | Integrate Snow EVM network | `US-29.1` | US-9.12 |
| [#27](https://github.com/Koniverse/SubWallet-Extension/issues/27) | Update RPC endpoint for Mangata | `US-29.2` | US-9.12 |
| [#28](https://github.com/Koniverse/SubWallet-Extension/issues/28) | Send / Receive NFT: Acala & Karura | `US-29.3` | US-9.11 |
| [#29](https://github.com/Koniverse/SubWallet-Extension/issues/29) | Update Zeitgeist and Subsocial integration | `US-29.4` | US-9.11 |
| [#30](https://github.com/Koniverse/SubWallet-Extension/issues/30) | Send / Receive NFT: Statemine / Statemint | `US-29.5` | US-9.11 |
| [#34](https://github.com/Koniverse/SubWallet-Extension/issues/34) | Send & Receive Moonbeam / Moonriver NFT | `US-29.6` | US-9.12 |
| [#44](https://github.com/Koniverse/SubWallet-Extension/issues/44) | Integrate Astar NFT | `US-29.7` | US-9.11 |
| [#52](https://github.com/Koniverse/SubWallet-Extension/issues/52) | Integrate Bit.Country NFT: Display, Send, Receive | `US-29.8` | US-9.11 |
| [#95](https://github.com/Koniverse/SubWallet-Extension/issues/95) | Display incorrect screen when click on “Back to Homepage”  | `US-29.9` | US-9.16 |
| [#97](https://github.com/Koniverse/SubWallet-Extension/issues/97) | Can't open or takes a long time to open the extension if I | `US-29.10` | US-9.16 |
| [#102](https://github.com/Koniverse/SubWallet-Extension/issues/102) | Improve get NFT flow | `US-29.11` | US-9.16 |
| [#105](https://github.com/Koniverse/SubWallet-Extension/issues/105) | Some problems related to NFT function | `US-29.12` | US-9.16 |
| [#109](https://github.com/Koniverse/SubWallet-Extension/issues/109) | Improve NFT display with extending mode | `US-29.13` | US-9.16 |
| [#175](https://github.com/Koniverse/SubWallet-Extension/issues/175) | Update Astar NFT: Astar Pass & Astar Cats | `US-29.14` | US-9.11 |
| [#184](https://github.com/Koniverse/SubWallet-Extension/issues/184) | Integrate new cross-chain tokens on Karura (RMRK, ARIS, QT | `US-29.15` | US-9.11 |
| [#194](https://github.com/Koniverse/SubWallet-Extension/issues/194) | Collect NFT on Singular.app but it doesnt show on SubWalle | `US-29.16` | US-9.11 |
| [#200](https://github.com/Koniverse/SubWallet-Extension/issues/200) | Fix bug can not load NFT | `US-29.17` | US-9.16 |
| [#205](https://github.com/Koniverse/SubWallet-Extension/issues/205) | Add Polka Potions NFT collection | `US-29.18` | US-9.11 |
| [#209](https://github.com/Koniverse/SubWallet-Extension/issues/209) | Fix bug can not send EVM NFT | `US-29.19` | US-9.14 |
| [#230](https://github.com/Koniverse/SubWallet-Extension/issues/230) | Integrate NFTs on Altair NFT Playground | `US-29.20` | US-9.11 |
| [#250](https://github.com/Koniverse/SubWallet-Extension/issues/250) | Add NFT portfolio management feature | `US-29.21` | US-9.21 |
| [#265](https://github.com/Koniverse/SubWallet-Extension/issues/265) | Bug Send NFT when balance is too low | `US-29.22` | US-9.14 |
| [#289](https://github.com/Koniverse/SubWallet-Extension/issues/289) | Update ipfs gateway for rmrk | `US-29.23` | US-9.13 |
| [#321](https://github.com/Koniverse/SubWallet-Extension/issues/321) | Fix bug 'Encountered an error, please try again' when Send | `US-29.24` | US-9.14 |
| [#350](https://github.com/Koniverse/SubWallet-Extension/issues/350) | [QR] [Transfer] [NFT] Support transfer NFT via QR | `US-29.25` | US-9.14 |
| [#380](https://github.com/Koniverse/SubWallet-Extension/issues/380) | Bug happens when user perform import tokens, import NFT | `US-29.26` | US-9.15 |
| [#415](https://github.com/Koniverse/SubWallet-Extension/issues/415) | Error parsing JSON from RMRK NFT | `US-29.27` | US-9.13 |
| [#467](https://github.com/Koniverse/SubWallet-Extension/issues/467) | Integration MoonFit NFT | `US-29.28` | US-9.12 |
| [#480](https://github.com/Koniverse/SubWallet-Extension/issues/480) | Optimize NFT loading with <https://nft.storage/> | `US-29.29` | US-9.13 |
| [#517](https://github.com/Koniverse/SubWallet-Extension/issues/517) | Add Moonpets NFT | `US-29.30` | US-9.12 |
| [#557](https://github.com/Koniverse/SubWallet-Extension/issues/557) | Fix bug happens when NFT image error | `US-29.31` | US-9.13 |
| [#603](https://github.com/Koniverse/SubWallet-Extension/issues/603) | Integrate Gromlins NFT | `US-29.32` | US-9.11 |
| [#614](https://github.com/Koniverse/SubWallet-Extension/issues/614) | Bug happens when get NFT from ipfs-gateway.cloud | `US-29.33` | US-9.13 |
| [#619](https://github.com/Koniverse/SubWallet-Extension/issues/619) | Improved handling for case the NFT's source failure | `US-29.34` | US-9.13 |
| [#620](https://github.com/Koniverse/SubWallet-Extension/issues/620) | Import NFT button not showing after viewing NFT details | `US-29.35` | US-9.15 |
| [#622](https://github.com/Koniverse/SubWallet-Extension/issues/622) | Support Bit.Country'NFT Trading and Land Portfolio | `US-29.36` | US-9.11 |
| [#635](https://github.com/Koniverse/SubWallet-Extension/issues/635) | Integration ArtZero NFT | `US-29.37` | US-9.11 |
| [#639](https://github.com/Koniverse/SubWallet-Extension/issues/639) | Add support for USDC & stEWT | `US-29.38` | **US-29.38** (kept — mis-area) |
| [#643](https://github.com/Koniverse/SubWallet-Extension/issues/643) | Add more attributes to NFT collection and item | `US-29.39` | US-9.16 |
| [#649](https://github.com/Koniverse/SubWallet-Extension/issues/649) | Integrate Pioneer Network NFT | `US-29.40` | US-9.11 |
| [#654](https://github.com/Koniverse/SubWallet-Extension/issues/654) | Add owner attribute to Pioneer NFT | `US-29.41` | US-9.11 |
| [#688](https://github.com/Koniverse/SubWallet-Extension/issues/688) | Support Zeitgeist NFT | `US-29.42` | US-9.11 |
| [#729](https://github.com/Koniverse/SubWallet-Extension/issues/729) | Show incorrect NFT quantity on All Accounts mode in case s | `US-29.43` | US-9.14 |
| [#747](https://github.com/Koniverse/SubWallet-Extension/issues/747) | Issue sending Bit.Country NFT and displaying BIT token | `US-29.44` | US-9.14 |
| [#759](https://github.com/Koniverse/SubWallet-Extension/issues/759) | Unable to send NFT with QR Account in case of network not  | `US-29.45` | US-9.14 |
| [#779](https://github.com/Koniverse/SubWallet-Extension/issues/779) | Update parsing IPFS link for NFT | `US-29.46` | US-9.13 |
| [#864](https://github.com/Koniverse/SubWallet-Extension/issues/864) | Fix bug NFT displays an error after update function parses | `US-29.47` | US-9.16 |
| [#893](https://github.com/Koniverse/SubWallet-Extension/issues/893) | Update RMRK NFT endpoints | `US-29.48` | US-9.13 |
| [#950](https://github.com/Koniverse/SubWallet-Extension/issues/950) | Do not show sub0 Lisbon 2022 NFT | `US-29.49` | US-9.11 |
| [#963](https://github.com/Koniverse/SubWallet-Extension/issues/963) | Update RMRK NFT endpoints | `US-29.50` | US-9.13 |
| [#967](https://github.com/Koniverse/SubWallet-Extension/issues/967) | Migrate NFT feature | `US-29.51` | US-9.19 |
| [#1006](https://github.com/Koniverse/SubWallet-Extension/issues/1006) | Upgrade UI - Screen Home / NFT | `US-29.52` | US-9.16 |
| [#1095](https://github.com/Koniverse/SubWallet-Extension/issues/1095) | Update logic for ink 4.0 and delete old PSP token | `US-29.53` | US-9.11 |
| [#1132](https://github.com/Koniverse/SubWallet-Extension/issues/1132) | An error occurs when send WASM NFT | `US-29.54` | US-9.14 |
| [#1151](https://github.com/Koniverse/SubWallet-Extension/issues/1151) | Upgrade UI - Still show NFT when turning off the network | `US-29.55` | US-9.16 |
| [#1154](https://github.com/Koniverse/SubWallet-Extension/issues/1154) | Upgrade UI - Still shows NFT sent | `US-29.56` | US-9.16 |
| [#1172](https://github.com/Koniverse/SubWallet-Extension/issues/1172) | Upgrade UI - Improve some issues related to the NFT featur | `US-29.57` | US-9.16 |
| [#1216](https://github.com/Koniverse/SubWallet-Extension/issues/1216) | Do not save Collection name input when import NFT | `US-29.58` | US-9.15 |
| [#1235](https://github.com/Koniverse/SubWallet-Extension/issues/1235) | Still showing sent NFT when using 2 different browser | `US-29.59` | US-9.16 |
| [#1258](https://github.com/Koniverse/SubWallet-Extension/issues/1258) | Show duplicate network enable message in the import token, | `US-29.60` | US-9.16 |
| [#1285](https://github.com/Koniverse/SubWallet-Extension/issues/1285) | Add ArtZero API for Astar's NFT | `US-29.61` | US-9.11 |
| [#1300](https://github.com/Koniverse/SubWallet-Extension/issues/1300) | Bug when URL NFT collection fails | `US-29.62` | US-9.16 |
| [#1335](https://github.com/Koniverse/SubWallet-Extension/issues/1335) | Integrate Land/Estate NFT on Pioneer's metaverses | `US-29.63` | US-9.11 |
| [#1404](https://github.com/Koniverse/SubWallet-Extension/issues/1404) | Fix bug show Moonfit’s NFT | `US-29.64` | US-9.12 |
| [#1414](https://github.com/Koniverse/SubWallet-Extension/issues/1414) | Update RMRK API | `US-29.65` | US-9.13 |
| [#1430](https://github.com/Koniverse/SubWallet-Extension/issues/1430) | Crash app in case import NFT by ERC20, PSP22 contract | `US-29.66` | US-9.15 |
| [#1441](https://github.com/Koniverse/SubWallet-Extension/issues/1441) | Integrate Unique's NFT into SubWallet | `US-29.67` | US-9.11 |
| [#1602](https://github.com/Koniverse/SubWallet-Extension/issues/1602) | Fixed NFT Gateway problems with non-extension environment | `US-29.68` | US-9.13 |
| [#1646](https://github.com/Koniverse/SubWallet-Extension/issues/1646) | Support Zk Assets NFT | `US-29.69` | US-9.11 |
| [#1656](https://github.com/Koniverse/SubWallet-Extension/issues/1656) | Fix IPFS resolver NFT Problems | `US-29.70` | US-9.13 |
| [#1672](https://github.com/Koniverse/SubWallet-Extension/issues/1672) | Can not load another NFTs when collection contain any NFT  | `US-29.71` | US-9.13 |
| [#1683](https://github.com/Koniverse/SubWallet-Extension/issues/1683) | WebApp - Bugs related Manage NFT feature | `US-29.72` | US-9.16 |
| [#1784](https://github.com/Koniverse/SubWallet-Extension/issues/1784) | Show collection ID and NFT Id in the NFT detail screen | `US-29.73` | US-9.16 |
| [#1817](https://github.com/Koniverse/SubWallet-Extension/issues/1817) | Fix a few minor bugs with NFT | `US-29.74` | US-9.16 |
| [#1830](https://github.com/Koniverse/SubWallet-Extension/issues/1830) | WebApp - Error page in case send NFT | `US-29.75` | US-9.14 |
| [#1835](https://github.com/Koniverse/SubWallet-Extension/issues/1835) | WebApp - Still showing sent NFT | `US-29.76` | US-9.16 |
| [#1909](https://github.com/Koniverse/SubWallet-Extension/issues/1909) | WebApp - Re- check NFT of the Statemine network | `US-29.77` | US-9.16 |
| [#1957](https://github.com/Koniverse/SubWallet-Extension/issues/1957) | WebApp - Can't navigate Address book screen when send NFT | `US-29.78` | US-9.14 |
| [#1967](https://github.com/Koniverse/SubWallet-Extension/issues/1967) | [Grab 100 MDOT] Mint NFT | `US-29.79` | **US-29.79** (kept — mis-area) |
| [#1978](https://github.com/Koniverse/SubWallet-Extension/issues/1978) | WebApp - NFT isn't displayed after import successfully | `US-29.80` | US-9.16 |
| [#2029](https://github.com/Koniverse/SubWallet-Extension/issues/2029) | Fixed bug Do not show Acala, Karura NFT | `US-29.81` | US-9.11 |
| [#2106](https://github.com/Koniverse/SubWallet-Extension/issues/2106) | Do not delete NFT data when reset wallet | `US-29.82` | US-9.16 |
| [#2195](https://github.com/Koniverse/SubWallet-Extension/issues/2195) | Recheck the impact on NFT features when ArtZero updates it | `US-29.83` | US-9.11 |
| [#2373](https://github.com/Koniverse/SubWallet-Extension/issues/2373) | Fixed bug show transfer NFT history details | `US-29.84` | US-9.14 |
| [#2380](https://github.com/Koniverse/SubWallet-Extension/issues/2380) | Showing ordinals on webapp | `US-29.85` | US-9.17 |
| [#2399](https://github.com/Koniverse/SubWallet-Extension/issues/2399) | Add more inscriptions on SubWallet Web app | `US-29.86` | US-9.17 |
| [#2695](https://github.com/Koniverse/SubWallet-Extension/issues/2695) | WebApp - Adjust showing/validating address on Send token,  | `US-29.87` | US-9.14 |
| [#2748](https://github.com/Koniverse/SubWallet-Extension/issues/2748) | Fixed bug error page on NFT details screen | `US-29.88` | US-9.16 |
| [#2858](https://github.com/Koniverse/SubWallet-Extension/issues/2858) | WebApp - Adjust showing/validating address on Send token,  | `US-29.89` | US-9.10 |
| [#3115](https://github.com/Koniverse/SubWallet-Extension/issues/3115) | Fix error when fetching with Avail network | `US-29.90` | US-9.18 |
| [#3126](https://github.com/Koniverse/SubWallet-Extension/issues/3126) | Support Avail light client NFT | `US-29.91` | US-9.18 |
| [#3133](https://github.com/Koniverse/SubWallet-Extension/issues/3133) | Fix bug Show incorrect Amount on Transaction history, Tran | `US-29.92` | US-9.14 |
| [#3191](https://github.com/Koniverse/SubWallet-Extension/issues/3191) | Support Avail Light Client NFT | `US-29.93` | US-9.18 |
| [#3287](https://github.com/Koniverse/SubWallet-Extension/issues/3287) | WebApp - Show incorrect Amount on Transaction confirmation | `US-29.94` | US-9.14 |
| [#3537](https://github.com/Koniverse/SubWallet-Extension/issues/3537) | Unified account - Update address input component for NFT t | `US-29.95` | US-9.14 |
| [#3559](https://github.com/Koniverse/SubWallet-Extension/issues/3559) | Support Ternoa NFT | `US-29.96` | US-9.11 |
| [#3609](https://github.com/Koniverse/SubWallet-Extension/issues/3609) | Add validate tokenOfOwnerByIndex when import NFT | `US-29.97` | US-9.15 |
| [#3699](https://github.com/Koniverse/SubWallet-Extension/issues/3699) | Extension - Add validate when import NFT in case there is  | `US-29.98` | US-9.15 |
| [#3716](https://github.com/Koniverse/SubWallet-Extension/issues/3716) | Extension - Don't show transferable balance when send NFT  | `US-29.99` | US-9.14 |
| [#3762](https://github.com/Koniverse/SubWallet-Extension/issues/3762) | Fixed bug send NFT on Ethereum network | `US-29.100` | US-9.14 |
| [#3791](https://github.com/Koniverse/SubWallet-Extension/issues/3791) | Fix bug show OG WUD BURN NFT Collection | `US-29.101` | US-9.16 |
| [#3818](https://github.com/Koniverse/SubWallet-Extension/issues/3818) | Fixed bug import NFT (#3837) | `US-29.102` | US-9.15 |
| [#3841](https://github.com/Koniverse/SubWallet-Extension/issues/3841) | Extension - Don't show NFT although imported successfully | `US-29.103` | US-9.15 |
| [#3850](https://github.com/Koniverse/SubWallet-Extension/issues/3850) | Extension - Integration NFT for Story Protocol | `US-29.104` | US-9.12 |
| [#3854](https://github.com/Koniverse/SubWallet-Extension/issues/3854) | Integration NFT for Story Protocol | `US-29.105` | US-9.12 |
| [#3990](https://github.com/Koniverse/SubWallet-Extension/issues/3990) | Extension - Unable to import NFT | `US-29.106` | US-9.15 |
| [#4028](https://github.com/Koniverse/SubWallet-Extension/issues/4028) | Extension - Follow display NFT for Story Odyssey Testnet a | `US-29.107` | US-9.12 |
| [#4132](https://github.com/Koniverse/SubWallet-Extension/issues/4132) | Fixed bug Do not display NFT images on Vara network, PAH | `US-29.108` | US-9.13 |
| [#4246](https://github.com/Koniverse/SubWallet-Extension/issues/4246) | Extension - Support RUNE & Ordinal for Bitcoin | `US-29.109` | US-9.7 |
| [#4295](https://github.com/Koniverse/SubWallet-Extension/issues/4295) | Support showing Rune and Inscription | `US-29.110` | US-9.7 |
| [#4568](https://github.com/Koniverse/SubWallet-Extension/issues/4568) | Support show NFT haven't method tokenOfOwnerByIndex | `US-29.111` | US-9.15 |
| [#4625](https://github.com/Koniverse/SubWallet-Extension/issues/4625) | Unable to import NFT ERC-721 on Rari chain | `US-29.112` | US-9.15 |
| [#4768](https://github.com/Koniverse/SubWallet-Extension/issues/4768) | Implement UI to support the Nested NFT standard | `US-29.113` | US-9.2 |
| [#4883](https://github.com/Koniverse/SubWallet-Extension/issues/4883) | Implement Client-side NFT Service & Migrate Existing Logic | `US-29.114` | US-9.20 |
| [#4991](https://github.com/Koniverse/SubWallet-Extension/issues/4991) | Replace hosted BTC APIs with Blockstream API and evaluate  | `US-29.115` | US-9.17 |
| [#4997](https://github.com/Koniverse/SubWallet-Extension/issues/4997) | Bitcoin on-chain data mismatch on host API (Fees, Inscript | `US-29.116` | US-9.17 |

## Verification

- 116 issues in, 116 accounted for: 114 -> 11 consolidated + 3 FR anchors; 2 kept in place.
- Every retired `US-29.x` reference on the live surface remapped (STATUS regenerated;
  `changelog-coverage.md` + 2 sub-issue cross-links repointed to the new home).
- `node scripts/koni-docs-check-ids.mjs` and `npx koni-docs validate` exit 0.
