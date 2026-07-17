# 2026-07-17 — EPIC-9 NFT: EPIC-29 merged, ledger consolidated & folded into capabilities

> **Structural change, docs-only** — the full same-day evolution of the NFT area, in one record.
> `check-ids` treats dated `notes/` files as archives, so retired `US-29.x` / intermediate
> `US-9.11`–`US-9.18` ids are named here freely — this is their forwarding table.

## Step 1 — `EPIC-29` "Maintenance — NFT" merged into `EPIC-9`

The separate NFT maintenance epic (`EPIC-29`, `US-29.1`…`US-29.116`) was dissolved and its 116
stories re-parented into `EPIC-9` (frontmatter `epic:` + in-body refs). `EPIC-29.md` was deleted.
Story ids were **not** renumbered ([AGENTS.md](../../AGENTS.md) rule 1).

## Step 2 — ledger consolidated, then folded into the capability stories

The flat one-issue-per-story ledger was grouped by capability and **folded into the capability
stories themselves** — one US per NFT capability, each carrying its requirement (where it
materializes an FR) *and* its incremental-work timeline. The FR capabilities keep their story
(`US-9.1`…`US-9.10`) and absorb their issues; capabilities with no FR — media pipeline, service
migration, client-side SDK, portfolio — are their own stories (`US-9.13`, `US-9.19`, `US-9.20`,
`US-9.21`). The intermediate consolidated ids (`US-9.11`/`9.12`/`9.14`/`9.15`/`9.16`/`9.17`/`9.18`)
were **retired** into these homes. Two mis-area issues stay under their retired `US-29.x` id.

Traceability is preserved **per issue** — every issue appears in a capability story's timeline and
in the map below.

## Capability stories (current state)

**Status** is the story's own status; **# issues** counts the retired `US-29.x` issues folded here
(FR-owned issues that predate the ledger are listed in each story, not counted here).

| Story | Capability | Status | # folded issues |
| --- | --- | --- | --- |
| [US-9.1](../sprints/stories/US-9.1-substrate-nft-display.md) | Substrate NFT display (RMRK / Unique / PSP-34) *(FR contract)* | ✅ done | 28 |
| [US-9.2](../sprints/stories/US-9.2-nested-bundled-nft-display.md) | Nested / bundled NFT display *(FR contract)* | ✅ done | 1 |
| [US-9.3](../sprints/stories/US-9.3-evm-nft-display.md) | EVM NFT display (ERC-721) *(FR contract)* | ✅ done | 9 |
| [US-9.4](../sprints/stories/US-9.4-erc-1155-nft-support.md) | ERC-1155 NFT support (display & transfer) *(FR contract)* | 📋 backlog | 0 |
| [US-9.5](../sprints/stories/US-9.5-nft-transfer-send.md) | NFT transfer (send) *(FR contract)* | ✅ done | 17 |
| [US-9.6](../sprints/stories/US-9.6-3d-and-video-nft-viewer.md) | 3D and video NFT viewer *(FR contract)* | ✅ done | 0 |
| [US-9.7](../sprints/stories/US-9.7-bitcoin-ordinals-display.md) | Bitcoin Ordinals / inscriptions display *(FR contract)* | 📋 backlog | 6 |
| [US-9.8](../sprints/stories/US-9.8-custom-nft-import.md) | Custom NFT import *(FR contract)* | ✅ done | 11 |
| [US-9.9](../sprints/stories/US-9.9-additional-collections-and-standards.md) | Additional NFT collections & standards (ERC-6551) *(FR contract)* | 📋 backlog | 0 |
| [US-9.10](../sprints/stories/US-9.10-nft-display-and-transfer-hardening.md) | NFT display & UI hardening | 📋 backlog | 25 |
| [US-9.13](../sprints/stories/US-9.13-nft-media-and-ipfs-gateway-pipeline.md) | NFT media & IPFS gateway pipeline | ✅ done | 14 |
| [US-9.19](../sprints/stories/US-9.19-nft-service-migration.md) | NFT service migration | ✅ done | 1 |
| [US-9.20](../sprints/stories/US-9.20-client-side-nft-service-and-sdk-migration.md) | Client-side NFT Service & SDK migration | 🚧 in-progress | 1 |
| [US-9.21](../sprints/stories/US-9.21-nft-portfolio-management.md) | NFT portfolio management | 📋 backlog | 1 |

## Kept in place — mis-area, pending relocation

| Prev. ID | Issue | Note |
| --- | --- | --- |
| `US-29.38` | #639 | USDC & stEWT -- token support -> EPIC-7 |
| `US-29.79` | #1967 | Grab 100 MDOT Mint NFT -- campaign -> EPIC-19 |

## Full issue -> capability map (the 116 retired `US-29.x`, by issue #)

| Issue | Title | Prev. ID | Capability |
| --- | --- | --- | --- |
| [#12](https://github.com/Koniverse/SubWallet-Extension/issues/12) | Integrate Snow EVM network | `US-29.1` | US-9.3 |
| [#27](https://github.com/Koniverse/SubWallet-Extension/issues/27) | Update RPC endpoint for Mangata | `US-29.2` | US-9.3 |
| [#28](https://github.com/Koniverse/SubWallet-Extension/issues/28) | Send / Receive NFT: Acala & Karura | `US-29.3` | US-9.1 |
| [#29](https://github.com/Koniverse/SubWallet-Extension/issues/29) | Update Zeitgeist and Subsocial integration | `US-29.4` | US-9.1 |
| [#30](https://github.com/Koniverse/SubWallet-Extension/issues/30) | Send / Receive NFT: Statemine / Statemint | `US-29.5` | US-9.1 |
| [#34](https://github.com/Koniverse/SubWallet-Extension/issues/34) | Send & Receive Moonbeam / Moonriver NFT | `US-29.6` | US-9.3 |
| [#44](https://github.com/Koniverse/SubWallet-Extension/issues/44) | Integrate Astar NFT | `US-29.7` | US-9.1 |
| [#52](https://github.com/Koniverse/SubWallet-Extension/issues/52) | Integrate Bit.Country NFT: Display, Send, Receive | `US-29.8` | US-9.1 |
| [#95](https://github.com/Koniverse/SubWallet-Extension/issues/95) | Display incorrect screen when click on “Back to Homepa | `US-29.9` | US-9.10 |
| [#97](https://github.com/Koniverse/SubWallet-Extension/issues/97) | Can't open or takes a long time to open the extension  | `US-29.10` | US-9.10 |
| [#102](https://github.com/Koniverse/SubWallet-Extension/issues/102) | Improve get NFT flow | `US-29.11` | US-9.10 |
| [#105](https://github.com/Koniverse/SubWallet-Extension/issues/105) | Some problems related to NFT function | `US-29.12` | US-9.10 |
| [#109](https://github.com/Koniverse/SubWallet-Extension/issues/109) | Improve NFT display with extending mode | `US-29.13` | US-9.10 |
| [#175](https://github.com/Koniverse/SubWallet-Extension/issues/175) | Update Astar NFT: Astar Pass & Astar Cats | `US-29.14` | US-9.1 |
| [#184](https://github.com/Koniverse/SubWallet-Extension/issues/184) | Integrate new cross-chain tokens on Karura (RMRK, ARIS | `US-29.15` | US-9.1 |
| [#194](https://github.com/Koniverse/SubWallet-Extension/issues/194) | Collect NFT on Singular.app but it doesnt show on SubW | `US-29.16` | US-9.1 |
| [#200](https://github.com/Koniverse/SubWallet-Extension/issues/200) | Fix bug can not load NFT | `US-29.17` | US-9.10 |
| [#205](https://github.com/Koniverse/SubWallet-Extension/issues/205) | Add Polka Potions NFT collection | `US-29.18` | US-9.1 |
| [#209](https://github.com/Koniverse/SubWallet-Extension/issues/209) | Fix bug can not send EVM NFT | `US-29.19` | US-9.5 |
| [#230](https://github.com/Koniverse/SubWallet-Extension/issues/230) | Integrate NFTs on Altair NFT Playground | `US-29.20` | US-9.1 |
| [#250](https://github.com/Koniverse/SubWallet-Extension/issues/250) | Add NFT portfolio management feature | `US-29.21` | US-9.21 |
| [#265](https://github.com/Koniverse/SubWallet-Extension/issues/265) | Bug Send NFT when balance is too low | `US-29.22` | US-9.5 |
| [#289](https://github.com/Koniverse/SubWallet-Extension/issues/289) | Update ipfs gateway for rmrk | `US-29.23` | US-9.13 |
| [#321](https://github.com/Koniverse/SubWallet-Extension/issues/321) | Fix bug 'Encountered an error, please try again' when  | `US-29.24` | US-9.5 |
| [#350](https://github.com/Koniverse/SubWallet-Extension/issues/350) | [QR] [Transfer] [NFT] Support transfer NFT via QR | `US-29.25` | US-9.5 |
| [#380](https://github.com/Koniverse/SubWallet-Extension/issues/380) | Bug happens when user perform import tokens, import NF | `US-29.26` | US-9.8 |
| [#415](https://github.com/Koniverse/SubWallet-Extension/issues/415) | Error parsing JSON from RMRK NFT | `US-29.27` | US-9.13 |
| [#467](https://github.com/Koniverse/SubWallet-Extension/issues/467) | Integration MoonFit NFT | `US-29.28` | US-9.3 |
| [#480](https://github.com/Koniverse/SubWallet-Extension/issues/480) | Optimize NFT loading with <https://nft.storage/> | `US-29.29` | US-9.13 |
| [#517](https://github.com/Koniverse/SubWallet-Extension/issues/517) | Add Moonpets NFT | `US-29.30` | US-9.3 |
| [#557](https://github.com/Koniverse/SubWallet-Extension/issues/557) | Fix bug happens when NFT image error | `US-29.31` | US-9.13 |
| [#603](https://github.com/Koniverse/SubWallet-Extension/issues/603) | Integrate Gromlins NFT | `US-29.32` | US-9.1 |
| [#614](https://github.com/Koniverse/SubWallet-Extension/issues/614) | Bug happens when get NFT from ipfs-gateway.cloud | `US-29.33` | US-9.13 |
| [#619](https://github.com/Koniverse/SubWallet-Extension/issues/619) | Improved handling for case the NFT's source failure | `US-29.34` | US-9.13 |
| [#620](https://github.com/Koniverse/SubWallet-Extension/issues/620) | Import NFT button not showing after viewing NFT detail | `US-29.35` | US-9.8 |
| [#622](https://github.com/Koniverse/SubWallet-Extension/issues/622) | Support Bit.Country'NFT Trading and Land Portfolio | `US-29.36` | US-9.1 |
| [#635](https://github.com/Koniverse/SubWallet-Extension/issues/635) | Integration ArtZero NFT | `US-29.37` | US-9.1 |
| [#639](https://github.com/Koniverse/SubWallet-Extension/issues/639) | Add support for USDC & stEWT | `US-29.38` | **US-29.38** (kept — mis-area) |
| [#643](https://github.com/Koniverse/SubWallet-Extension/issues/643) | Add more attributes to NFT collection and item | `US-29.39` | US-9.10 |
| [#649](https://github.com/Koniverse/SubWallet-Extension/issues/649) | Integrate Pioneer Network NFT | `US-29.40` | US-9.1 |
| [#654](https://github.com/Koniverse/SubWallet-Extension/issues/654) | Add owner attribute to Pioneer NFT | `US-29.41` | US-9.1 |
| [#688](https://github.com/Koniverse/SubWallet-Extension/issues/688) | Support Zeitgeist NFT | `US-29.42` | US-9.1 |
| [#729](https://github.com/Koniverse/SubWallet-Extension/issues/729) | Show incorrect NFT quantity on All Accounts mode in ca | `US-29.43` | US-9.5 |
| [#747](https://github.com/Koniverse/SubWallet-Extension/issues/747) | Issue sending Bit.Country NFT and displaying BIT token | `US-29.44` | US-9.5 |
| [#759](https://github.com/Koniverse/SubWallet-Extension/issues/759) | Unable to send NFT with QR Account in case of network  | `US-29.45` | US-9.5 |
| [#779](https://github.com/Koniverse/SubWallet-Extension/issues/779) | Update parsing IPFS link for NFT | `US-29.46` | US-9.13 |
| [#864](https://github.com/Koniverse/SubWallet-Extension/issues/864) | Fix bug NFT displays an error after update function pa | `US-29.47` | US-9.10 |
| [#893](https://github.com/Koniverse/SubWallet-Extension/issues/893) | Update RMRK NFT endpoints | `US-29.48` | US-9.13 |
| [#950](https://github.com/Koniverse/SubWallet-Extension/issues/950) | Do not show sub0 Lisbon 2022 NFT | `US-29.49` | US-9.1 |
| [#963](https://github.com/Koniverse/SubWallet-Extension/issues/963) | Update RMRK NFT endpoints | `US-29.50` | US-9.13 |
| [#967](https://github.com/Koniverse/SubWallet-Extension/issues/967) | Migrate NFT feature | `US-29.51` | US-9.19 |
| [#1006](https://github.com/Koniverse/SubWallet-Extension/issues/1006) | Upgrade UI - Screen Home / NFT | `US-29.52` | US-9.10 |
| [#1095](https://github.com/Koniverse/SubWallet-Extension/issues/1095) | Update logic for ink 4.0 and delete old PSP token | `US-29.53` | US-9.1 |
| [#1132](https://github.com/Koniverse/SubWallet-Extension/issues/1132) | An error occurs when send WASM NFT | `US-29.54` | US-9.5 |
| [#1151](https://github.com/Koniverse/SubWallet-Extension/issues/1151) | Upgrade UI - Still show NFT when turning off the netwo | `US-29.55` | US-9.10 |
| [#1154](https://github.com/Koniverse/SubWallet-Extension/issues/1154) | Upgrade UI - Still shows NFT sent | `US-29.56` | US-9.10 |
| [#1172](https://github.com/Koniverse/SubWallet-Extension/issues/1172) | Upgrade UI - Improve some issues related to the NFT fe | `US-29.57` | US-9.10 |
| [#1216](https://github.com/Koniverse/SubWallet-Extension/issues/1216) | Do not save Collection name input when import NFT | `US-29.58` | US-9.8 |
| [#1235](https://github.com/Koniverse/SubWallet-Extension/issues/1235) | Still showing sent NFT when using 2 different browser | `US-29.59` | US-9.10 |
| [#1258](https://github.com/Koniverse/SubWallet-Extension/issues/1258) | Show duplicate network enable message in the import to | `US-29.60` | US-9.10 |
| [#1285](https://github.com/Koniverse/SubWallet-Extension/issues/1285) | Add ArtZero API for Astar's NFT | `US-29.61` | US-9.1 |
| [#1300](https://github.com/Koniverse/SubWallet-Extension/issues/1300) | Bug when URL NFT collection fails | `US-29.62` | US-9.10 |
| [#1335](https://github.com/Koniverse/SubWallet-Extension/issues/1335) | Integrate Land/Estate NFT on Pioneer's metaverses | `US-29.63` | US-9.1 |
| [#1404](https://github.com/Koniverse/SubWallet-Extension/issues/1404) | Fix bug show Moonfit’s NFT | `US-29.64` | US-9.3 |
| [#1414](https://github.com/Koniverse/SubWallet-Extension/issues/1414) | Update RMRK API | `US-29.65` | US-9.13 |
| [#1430](https://github.com/Koniverse/SubWallet-Extension/issues/1430) | Crash app in case import NFT by ERC20, PSP22 contract | `US-29.66` | US-9.8 |
| [#1441](https://github.com/Koniverse/SubWallet-Extension/issues/1441) | Integrate Unique's NFT into SubWallet | `US-29.67` | US-9.1 |
| [#1602](https://github.com/Koniverse/SubWallet-Extension/issues/1602) | Fixed NFT Gateway problems with non-extension environm | `US-29.68` | US-9.13 |
| [#1646](https://github.com/Koniverse/SubWallet-Extension/issues/1646) | Support Zk Assets NFT | `US-29.69` | US-9.1 |
| [#1656](https://github.com/Koniverse/SubWallet-Extension/issues/1656) | Fix IPFS resolver NFT Problems | `US-29.70` | US-9.13 |
| [#1672](https://github.com/Koniverse/SubWallet-Extension/issues/1672) | Can not load another NFTs when collection contain any  | `US-29.71` | US-9.13 |
| [#1683](https://github.com/Koniverse/SubWallet-Extension/issues/1683) | WebApp - Bugs related Manage NFT feature | `US-29.72` | US-9.10 |
| [#1784](https://github.com/Koniverse/SubWallet-Extension/issues/1784) | Show collection ID and NFT Id in the NFT detail screen | `US-29.73` | US-9.10 |
| [#1817](https://github.com/Koniverse/SubWallet-Extension/issues/1817) | Fix a few minor bugs with NFT | `US-29.74` | US-9.10 |
| [#1830](https://github.com/Koniverse/SubWallet-Extension/issues/1830) | WebApp - Error page in case send NFT | `US-29.75` | US-9.5 |
| [#1835](https://github.com/Koniverse/SubWallet-Extension/issues/1835) | WebApp - Still showing sent NFT | `US-29.76` | US-9.10 |
| [#1909](https://github.com/Koniverse/SubWallet-Extension/issues/1909) | WebApp - Re- check NFT of the Statemine network | `US-29.77` | US-9.10 |
| [#1957](https://github.com/Koniverse/SubWallet-Extension/issues/1957) | WebApp - Can't navigate Address book screen when send  | `US-29.78` | US-9.5 |
| [#1967](https://github.com/Koniverse/SubWallet-Extension/issues/1967) | [Grab 100 MDOT] Mint NFT | `US-29.79` | **US-29.79** (kept — mis-area) |
| [#1978](https://github.com/Koniverse/SubWallet-Extension/issues/1978) | WebApp - NFT isn't displayed after import successfully | `US-29.80` | US-9.10 |
| [#2029](https://github.com/Koniverse/SubWallet-Extension/issues/2029) | Fixed bug Do not show Acala, Karura NFT | `US-29.81` | US-9.1 |
| [#2106](https://github.com/Koniverse/SubWallet-Extension/issues/2106) | Do not delete NFT data when reset wallet | `US-29.82` | US-9.10 |
| [#2195](https://github.com/Koniverse/SubWallet-Extension/issues/2195) | Recheck the impact on NFT features when ArtZero update | `US-29.83` | US-9.1 |
| [#2373](https://github.com/Koniverse/SubWallet-Extension/issues/2373) | Fixed bug show transfer NFT history details | `US-29.84` | US-9.5 |
| [#2380](https://github.com/Koniverse/SubWallet-Extension/issues/2380) | Showing ordinals on webapp | `US-29.85` | US-9.7 |
| [#2399](https://github.com/Koniverse/SubWallet-Extension/issues/2399) | Add more inscriptions on SubWallet Web app | `US-29.86` | US-9.7 |
| [#2695](https://github.com/Koniverse/SubWallet-Extension/issues/2695) | WebApp - Adjust showing/validating address on Send tok | `US-29.87` | US-9.5 |
| [#2748](https://github.com/Koniverse/SubWallet-Extension/issues/2748) | Fixed bug error page on NFT details screen | `US-29.88` | US-9.10 |
| [#2858](https://github.com/Koniverse/SubWallet-Extension/issues/2858) | WebApp - Adjust showing/validating address on Send tok | `US-29.89` | US-9.10 |
| [#3115](https://github.com/Koniverse/SubWallet-Extension/issues/3115) | Fix error when fetching with Avail network | `US-29.90` | US-9.1 |
| [#3126](https://github.com/Koniverse/SubWallet-Extension/issues/3126) | Support Avail light client NFT | `US-29.91` | US-9.1 |
| [#3133](https://github.com/Koniverse/SubWallet-Extension/issues/3133) | Fix bug Show incorrect Amount on Transaction history,  | `US-29.92` | US-9.5 |
| [#3191](https://github.com/Koniverse/SubWallet-Extension/issues/3191) | Support Avail Light Client NFT | `US-29.93` | US-9.1 |
| [#3287](https://github.com/Koniverse/SubWallet-Extension/issues/3287) | WebApp - Show incorrect Amount on Transaction confirma | `US-29.94` | US-9.5 |
| [#3537](https://github.com/Koniverse/SubWallet-Extension/issues/3537) | Unified account - Update address input component for N | `US-29.95` | US-9.5 |
| [#3559](https://github.com/Koniverse/SubWallet-Extension/issues/3559) | Support Ternoa NFT | `US-29.96` | US-9.1 |
| [#3609](https://github.com/Koniverse/SubWallet-Extension/issues/3609) | Add validate tokenOfOwnerByIndex when import NFT | `US-29.97` | US-9.8 |
| [#3699](https://github.com/Koniverse/SubWallet-Extension/issues/3699) | Extension - Add validate when import NFT in case there | `US-29.98` | US-9.8 |
| [#3716](https://github.com/Koniverse/SubWallet-Extension/issues/3716) | Extension - Don't show transferable balance when send  | `US-29.99` | US-9.5 |
| [#3762](https://github.com/Koniverse/SubWallet-Extension/issues/3762) | Fixed bug send NFT on Ethereum network | `US-29.100` | US-9.5 |
| [#3791](https://github.com/Koniverse/SubWallet-Extension/issues/3791) | Fix bug show OG WUD BURN NFT Collection | `US-29.101` | US-9.10 |
| [#3818](https://github.com/Koniverse/SubWallet-Extension/issues/3818) | Fixed bug import NFT (#3837) | `US-29.102` | US-9.8 |
| [#3841](https://github.com/Koniverse/SubWallet-Extension/issues/3841) | Extension - Don't show NFT although imported successfu | `US-29.103` | US-9.8 |
| [#3850](https://github.com/Koniverse/SubWallet-Extension/issues/3850) | Extension - Integration NFT for Story Protocol | `US-29.104` | US-9.3 |
| [#3854](https://github.com/Koniverse/SubWallet-Extension/issues/3854) | Integration NFT for Story Protocol | `US-29.105` | US-9.3 |
| [#3990](https://github.com/Koniverse/SubWallet-Extension/issues/3990) | Extension - Unable to import NFT | `US-29.106` | US-9.8 |
| [#4028](https://github.com/Koniverse/SubWallet-Extension/issues/4028) | Extension - Follow display NFT for Story Odyssey Testn | `US-29.107` | US-9.3 |
| [#4132](https://github.com/Koniverse/SubWallet-Extension/issues/4132) | Fixed bug Do not display NFT images on Vara network, P | `US-29.108` | US-9.13 |
| [#4246](https://github.com/Koniverse/SubWallet-Extension/issues/4246) | Extension - Support RUNE & Ordinal for Bitcoin | `US-29.109` | US-9.7 |
| [#4295](https://github.com/Koniverse/SubWallet-Extension/issues/4295) | Support showing Rune and Inscription | `US-29.110` | US-9.7 |
| [#4568](https://github.com/Koniverse/SubWallet-Extension/issues/4568) | Support show NFT haven't method tokenOfOwnerByIndex | `US-29.111` | US-9.8 |
| [#4625](https://github.com/Koniverse/SubWallet-Extension/issues/4625) | Unable to import NFT ERC-721 on Rari chain | `US-29.112` | US-9.8 |
| [#4768](https://github.com/Koniverse/SubWallet-Extension/issues/4768) | Implement UI to support the Nested NFT standard | `US-29.113` | US-9.2 |
| [#4883](https://github.com/Koniverse/SubWallet-Extension/issues/4883) | Implement Client-side NFT Service & Migrate Existing L | `US-29.114` | US-9.20 |
| [#4991](https://github.com/Koniverse/SubWallet-Extension/issues/4991) | Replace hosted BTC APIs with Blockstream API and evalu | `US-29.115` | US-9.7 |
| [#4997](https://github.com/Koniverse/SubWallet-Extension/issues/4997) | Bitcoin on-chain data mismatch on host API (Fees, Insc | `US-29.116` | US-9.7 |

## Verification

- 116 retired ids accounted for: 114 folded into 11 capability stories; 2 kept in place.
- Every retired id (`US-29.x` + intermediate `US-9.11`–`US-9.18`) remapped on the live surface.
- `node scripts/koni-docs-check-ids.mjs` and `npx koni-docs validate` exit 0.
