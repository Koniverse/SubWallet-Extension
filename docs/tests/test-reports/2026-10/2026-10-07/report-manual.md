# Manual Test Report — EPIC-42 — 2026-10-07

| Field | Value |
|---|---|
| Epic | EPIC-42 — QA Coverage Tracking |
| Date | 2026-10-07 |
| Tester | MaiThuongNinni |
| Environment | Extension; Mobile — Android + iOS beta |
| Runner | manual (extension + mobile) |
| Build under test | to fill in — Extension: version + chain-list version; Mobile: TestFlight build number, and the newer Google Play beta build released today |
| Stories tested | US-42.27, US-42.29; US-42.28 — closed |
| Total bugs found | 0 |
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| Status | done |

---

## US-42.27 — Release SubWallet Mobile

The fresh-install half of the beta stage closed on [2026-10-06](../2026-10-06/report-manual.md) at 81 of 82 lines on each build.

A newer Android beta build came out today and the session ran on it as well. Nothing in the story changes — the checklist is the same and the lines already ticked stay ticked — but the build the run was made against is not the one 10-06 recorded, so it is noted here.

Left to run: the upgrade recheck on each beta build, then the two production stages. The upgrade rechecks need the previous production version installed with its data first.

### AC results

No line changed state today. The session re-ran against the newer Android beta build and the results held, so the ticks from 10-06 stand on that build too.

### Bugs

None.

## US-42.28 — Maintenance of chainlist (ChainList #710)

BIT-11 was one line covering all 102 subnets the resync changed, which meant a session could read fifty of them and still tick nothing. It is replaced today by SUB-2 to SUB-128, one line per netuid naming what changed on it — the same shape the new chains already had with NEW-M-1 to NEW-M-12.

The story goes from 201 lines to 302, re-pointed 36 to 42. Every netuid in the table is read and passes.

### AC results

| AC | Description | Result | Notes |
|---|---|---|---|
| SUB-2 | `bittensor-LOCAL-β` — new logo | ✅ Pass | Extension |
| SUB-3 | `bittensor-LOCAL-γ` — name Τemplar → Teutonic; new logo | ✅ Pass | Extension |
| SUB-4 | `bittensor-LOCAL-δ` — new logo | ✅ Pass | Extension |
| SUB-6 | `bittensor-LOCAL-ζ` — priceId `infinite-games` → `numinous` | ✅ Pass | Extension |
| SUB-7 | `bittensor-LOCAL-η` — name Subvortex → Allways; new logo | ✅ Pass | Extension |
| SUB-9 | `bittensor-LOCAL-ι` — name Iota → iota | ✅ Pass | Extension |
| SUB-10 | `bittensor-LOCAL-κ` — name Swap → Pareton; symbol κ → Ⱂ; new logo | ✅ Pass | Extension |
| SUB-11 | `bittensor-LOCAL-λ` — new logo | ✅ Pass | Extension |
| SUB-12 | `bittensor-LOCAL-μ` — name Compute horde → Compute Horde | ✅ Pass | Extension |
| SUB-13 | `bittensor-LOCAL-ν` — name Data universe → Data Universe | ✅ Pass | Extension |
| SUB-14 | `bittensor-LOCAL-テ` — name TAOHash → Cacheon; symbol テ → ㄷ; new logo | ✅ Pass | Extension |
| SUB-15 | `bittensor-LOCAL-ο` — name Bitquant → ORO; new logo | ✅ Pass | Extension |
| SUB-16 | `bittensor-LOCAL-π` — name Bitads → kenju; default icon | ✅ Pass | Extension |
| SUB-17 | `bittensor-LOCAL-ρ` — name 404—gen → 404—GEN | ✅ Pass | Extension |
| SUB-19 | `bittensor-LOCAL-t` — new logo | ✅ Pass | Extension |
| SUB-20 | `bittensor-LOCAL-υ` — name GroundLayer → Witness; new logo | ✅ Pass | Extension |
| SUB-21 | `bittensor-LOCAL-φ` — name OMEGA.inc: The Awakening → AdTAO; new logo | ✅ Pass | Extension |
| SUB-23 | `bittensor-LOCAL-ψ` — new logo | ✅ Pass | Extension |
| SUB-25 | `bittensor-LOCAL-א` — name Mainframe → UR; new logo | ✅ Pass | Extension |
| SUB-26 | `bittensor-LOCAL-ඞ` — name Kinitro → Perturb; symbol ඞ → ב; new logo | ✅ Pass | Extension |
| SUB-27 | `bittensor-LOCAL-ג` — name Nodexo → Orion; default icon | ✅ Pass | Extension |
| SUB-28 | `bittensor-LOCAL-ד` — name Oracle → SayGM; priceId `dtao-28` → `gm-3`; new logo | ✅ Pass | Extension |
| SUB-29 | `bittensor-LOCAL-ה` — name Coldint → hoτfloaτ; default icon | ✅ Pass | Extension |
| SUB-30 | `bittensor-LOCAL-ו` — name Wahoot → Endure Network; new logo | ✅ Pass | Extension |
| SUB-31 | `bittensor-LOCAL-ז` — name Halftime → rec4ll; default icon | ✅ Pass | Extension |
| SUB-35 | `bittensor-LOCAL-ך` — name Cartha → Unknown; default icon | ✅ Pass | Extension |
| SUB-36 | `bittensor-LOCAL-כ` — name Web-agents → Epago; new logo | ✅ Pass | Extension |
| SUB-37 | `bittensor-LOCAL-ל` — new logo | ✅ Pass | Extension |
| SUB-38 | `bittensor-LOCAL-ם` — name colosseum → ChronoLLM; new logo | ✅ Pass | Extension |
| SUB-39 | `bittensor-LOCAL-מ` — name Basilica → deprecated; default icon | ✅ Pass | Extension |
| SUB-40 | `bittensor-LOCAL-ן` — name Chunking → Ralph; new logo | ✅ Pass | Extension |
| SUB-41 | `bittensor-LOCAL-נ` — new logo | ✅ Pass | Extension |
| SUB-42 | `bittensor-LOCAL-ס` — name Gopher → Unknown; default icon | ✅ Pass | Extension |
| SUB-45 | `bittensor-LOCAL-פ` — name Talisman AI → AlphaRidge.ai; new logo | ✅ Pass | Extension |
| SUB-46 | `bittensor-LOCAL-ץ` — name Resi → Instant; new logo | ✅ Pass | Extension |
| SUB-47 | `bittensor-LOCAL-צ` — name EvolAI → GPUForge; new logo | ✅ Pass | Extension |
| SUB-48 | `bittensor-LOCAL-ק` — new logo | ✅ Pass | Extension |
| SUB-49 | `bittensor-LOCAL-ר` — new logo | ✅ Pass | Extension |
| SUB-53 | `bittensor-LOCAL-ب` — name Efficientfrontier → engy; new logo | ✅ Pass | Extension |
| SUB-54 | `bittensor-LOCAL-ت` — name Yanez MIID → Yanez; new logo | ✅ Pass | Extension |
| SUB-55 | `bittensor-LOCAL-ث` — new logo | ✅ Pass | Extension |
| SUB-57 | `bittensor-LOCAL-ح` — name Sparket.AI → Unknown; default icon | ✅ Pass | Extension |
| SUB-58 | `bittensor-LOCAL-خ` — name Handshake → Unknown; default icon | ✅ Pass | Extension |
| SUB-59 | `bittensor-LOCAL-د` — name Babelbit → Unknown; default icon | ✅ Pass | Extension |
| SUB-61 | `bittensor-LOCAL-ر` — name Redteam → RedTeam | ✅ Pass | Extension |
| SUB-63 | `bittensor-LOCAL-س` — name Quantum innovate → Enigma; new logo | ✅ Pass | Extension |
| SUB-65 | `bittensor-LOCAL-ص` — name Tao private network → True Performance Network | ✅ Pass | Extension |
| SUB-66 | `bittensor-LOCAL-ض` — name AlphaCore → conjectures; new logo | ✅ Pass | Extension |
| SUB-67 | `bittensor-LOCAL-ط` — name Ta → Harnyx; priceId `dtao-67` → `tenex`; new logo | ✅ Pass | Extension |
| SUB-68 | `bittensor-LOCAL-ظ` — name Nova → NOVA; new logo | ✅ Pass | Extension |
| SUB-69 | `bittensor-LOCAL-ع` — name Ain → Herald; priceId `dtao-69` → `herald`; new logo | ✅ Pass | Extension |
| SUB-70 | `bittensor-LOCAL-غ` — name Vericore → Unknown; default icon | ✅ Pass | Extension |
| SUB-72 | `bittensor-LOCAL-ق` — name Streetvision by natix → StreetVision by NATIX | ✅ Pass | Extension |
| SUB-73 | `bittensor-LOCAL-ك` — name Metahash → Parked; default icon | ✅ Pass | Extension |
| SUB-74 | `bittensor-LOCAL-ل` — priceId `dtao-74` → `gittensor` | ✅ Pass | Extension |
| SUB-75 | `bittensor-LOCAL-م` — new logo | ✅ Pass | Extension |
| SUB-76 | `bittensor-LOCAL-ن` — name Safe scan → Ormas; new logo | ✅ Pass | Extension |
| SUB-78 | `bittensor-LOCAL-و` — name Loosh → Umi; priceId `dtao-78` → `loosh`; new logo | ✅ Pass | Extension |
| SUB-80 | `bittensor-LOCAL-ى` — name dogelayer → OpenRoboto; new logo | ✅ Pass | Extension |
| SUB-81 | `bittensor-LOCAL-ᚠ` — name grail → Reliquary; new logo | ✅ Pass | Extension |
| SUB-82 | `bittensor-LOCAL-ᚢ` — name Hermes → Unknown; priceId `dtao-82` → `hermes-3` | ✅ Pass | Extension |
| SUB-83 | `bittensor-LOCAL-ᚦ` — priceId `dtao-83` → `null` | ✅ Pass | Extension |
| SUB-84 | `bittensor-LOCAL-モ` — name Chipforge (tatsu) → Unknown; symbol モ → ᚨ; default icon | ✅ Pass | Extension |
| SUB-86 | `bittensor-LOCAL-ᚳ` — name Miao → Unknown; default icon | ✅ Pass | Extension |
| SUB-87 | `bittensor-LOCAL-Ы` — name Luminar Network → Provenonce; new logo | ✅ Pass | Extension |
| SUB-89 | `bittensor-LOCAL-ᛒ` — name InfiniteHash → InfiniteQuant; new logo | ✅ Pass | Extension |
| SUB-90 | `bittensor-LOCAL-U+1680` — name Brain → KubeTEE; symbol U+1680 → テ; new logo | ✅ Pass | Extension |
| SUB-91 | `bittensor-LOCAL-ᚁ` — name Bitstarter → cascade; new logo | ✅ Pass | Extension |
| SUB-92 | `bittensor-LOCAL-ᚂ` — name LUCID → Available; default icon | ✅ Pass | Extension |
| SUB-94 | `bittensor-LOCAL-ᚄ` — name Bitsota → Cathedral; new logo | ✅ Pass | Extension |
| SUB-95 | `bittensor-LOCAL-ᚅ` — name Nion → Actual; priceId `dtao-95` → `null`; new logo | ✅ Pass | Extension |
| SUB-96 | `bittensor-LOCAL-᚛` — name Flock off → Verathos; priceId `flock-off` → `verathos`; new logo | ✅ Pass | Extension |
| SUB-97 | `bittensor-LOCAL-ა` — name Flamewire → Albedo; new logo | ✅ Pass | Extension |
| SUB-98 | `bittensor-LOCAL-ბ` — name ForeverMoney → NeverPlayAlone; new logo | ✅ Pass | Extension |
| SUB-99 | `bittensor-LOCAL-გ` — name Problems → Thirty Spokes; default icon | ✅ Pass | Extension |
| SUB-100 | `bittensor-LOCAL-დ` — name Plaτform → Cortex; priceId `dtao-100` → `pla-form`; new logo | ✅ Pass | Extension |
| SUB-101 | `bittensor-LOCAL-ე` — name Eni → Tag101; priceId `dtao-101` → `null` | ✅ Pass | Extension |
| SUB-102 | `bittensor-LOCAL-ვ` — name ViewCast → ConnitoAI; new logo | ✅ Pass | Extension |
| SUB-103 | `bittensor-LOCAL-Ա` — name Djinn → Capcomp; new logo | ✅ Pass | Extension |
| SUB-104 | `bittensor-LOCAL-Բ` — name Ben → TAOstatus; priceId `dtao-104` → `masx-ai` | ✅ Pass | Extension |
| SUB-105 | `bittensor-LOCAL-Գ` — name Soundsright → Beam; new logo | ✅ Pass | Extension |
| SUB-106 | `bittensor-LOCAL-Դ` — name Voidai → Nodexo; new logo | ✅ Pass | Extension |
| SUB-107 | `bittensor-LOCAL-ミ` — new logo | ✅ Pass | Extension |
| SUB-108 | `bittensor-LOCAL-Զ` — name TalkHead → ChipForge; symbol Զ → モ; new logo | ✅ Pass | Extension |
| SUB-109 | `bittensor-LOCAL-՞` — name Reserved → Finsight; default icon | ✅ Pass | Extension |
| SUB-110 | `bittensor-LOCAL-Ѐ` — name Rich Kids of TAO → Green Compute; priceId `dtao-110` → `rich-kids-of-tao`; new logo | ✅ Pass | Extension |
| SUB-111 | `bittensor-LOCAL-Ё` — name Oneoneone → Claims; new logo | ✅ Pass | Extension |
| SUB-112 | `bittensor-LOCAL-Ђ` — name minotaur → for sale; priceId `dtao-112` → `minotaur-2`; default icon | ✅ Pass | Extension |
| SUB-113 | `bittensor-LOCAL-Ѓ` — name TensorUSD → LongShort; default icon | ✅ Pass | Extension |
| SUB-114 | `bittensor-LOCAL-Є` — priceId `dtao-114` → `level-114`; new logo | ✅ Pass | Extension |
| SUB-115 | `bittensor-LOCAL-Ѕ` — name HashiChain → MoirAI; new logo | ✅ Pass | Extension |
| SUB-116 | `bittensor-LOCAL-ⴵ` — name TaoLend → for sale; symbol ⴵ → ъ; default icon | ✅ Pass | Extension |
| SUB-117 | `bittensor-LOCAL-Ⲁ` — name BrainPlay → everyframe.studio; new logo | ✅ Pass | Extension |
| SUB-118 | `bittensor-LOCAL-ⲁ-118` — name HODL ETF → Ditto; priceId `dtao-118` → `hodl-etf`; new logo | ✅ Pass | Extension |
| SUB-119 | `bittensor-LOCAL-Ⲃ` — name Satori → CapabilityForge Next; priceId `dtao-119` → `satori`; new logo | ✅ Pass | Extension |
| SUB-121 | `bittensor-LOCAL-Ⲅ` — name Sundae_bar → sundae_bar | ✅ Pass | Extension |
| SUB-122 | `bittensor-LOCAL-ⲅ-122` — name Bitrecs → CookingTAO; new logo | ✅ Pass | Extension |
| SUB-123 | `bittensor-LOCAL-𑀀` — name Mantis → MANTIS | ✅ Pass | Extension |
| SUB-125 | `bittensor-LOCAL-𑀂` — name 8 Ball → Refinery; priceId `dtao-125` → `8-ball`; default icon | ✅ Pass | Extension |
| SUB-126 | `bittensor-LOCAL-𑀃` — name Poker44 → Attelier; priceId `dtao-126` → `poker44`; new logo | ✅ Pass | Extension |
| SUB-127 | `bittensor-LOCAL-𑀅` — new logo | ✅ Pass | Extension |
| SUB-128 | `bittensor-LOCAL-න` — name Byteleap → ByteLeap; priceId `dtao-128` → `byteleap` | ✅ Pass | Extension |
| GEN-1 | A balance held on a deactivated chain is still readable after upgrading, and the account opens without error | ✅ Pass | Extension |
| GEN-2 | No chain that is still active went missing — compare against the enabled list taken before the upgrade | ✅ Pass | Extension |
| GEN-3 | Transaction history from a deactivated chain is still readable, with the same figures as before the upgrade | ✅ Pass | Extension |
| GEN-4 | The token list, history, NFT list and earning positions all render with no crash or blank screen where a deactivated chain used to be | ✅ Pass | Extension |
| GEN-5 | A deactivated chain that was enabled before the upgrade does not come back as enabled, and does not reappear after a restart | ✅ Pass | Extension |
| GEN-6 | Custom networks and custom tokens the user added themselves survive the upgrade untouched | ✅ Pass | Extension |
| RPC-X1 | No `*.ibp.network` or `*.dotters.network` endpoint is left anywhere in the provider lists | ✅ Pass | Extension |
| RPC-X3 | A custom provider the user added before the upgrade is still there and still selected | ✅ Pass | Extension |
| FIX-5 | Subnet 111 (`bittensor-LOCAL-Ё`) shows its alpha balance, which it could not while its assetType was null | ✅ Pass | Extension |
| FIX-6 | The subnets listed after 111 are correct — they were never validated by the tooling, since it crashed on 111 | ✅ Pass | Extension |
| BIT-1 | Subnet tokens the user had enabled are still enabled after the upgrade, and none disappeared | ✅ Pass | Extension |
| BIT-2 | The balance on each subnet is unchanged after the upgrade | ✅ Pass | Extension |
| BIT-3 | The balance matches the chain, read against an explorer or a runtime query rather than the app's own display | ✅ Pass | Extension |
| BIT-4 | Netuid 10 shows the right balance under the right netuid after its symbol change | ✅ Pass | Extension |
| BIT-5 | Netuid 14 shows the right balance — its symbol moved to netuid 90, so a balance must not move with it | ✅ Pass | Extension |
| BIT-6 | Netuid 26 shows the right balance after its symbol change | ✅ Pass | Extension |
| BIT-7 | Netuid 84 shows the right balance — its symbol moved to netuid 108 | ✅ Pass | Extension |
| BIT-8 | Netuid 90 shows the right balance, holding the symbol that came from netuid 14 | ✅ Pass | Extension |
| BIT-9 | Netuid 108 shows the right balance, holding the symbol that came from netuid 84 | ✅ Pass | Extension |
| BIT-10 | Netuid 116 shows the right balance after its symbol change | ✅ Pass | Extension |
| BIT-14 | Staking on a Bittensor subnet still works — stake, unstake, claim, change validator | ✅ Pass | Extension |
| UPG-1 | The deactivated-chain checks hold on an upgrade from the previous version, not only on a fresh install | ✅ Pass | Extension |
| UPG-2 | The new chains appear after an upgrade as well as on a fresh install | ✅ Pass | Extension |
| UPG-3 | The RPC checks hold after an upgrade | ✅ Pass | Extension |
| FIX-4a | A multisig transaction on Bittensor is created and signed by the initiating signatory | ✅ Pass | Extension |
| FIX-4b | Another signatory approves it, and the approval count goes up | ✅ Pass | Extension |
| FIX-4c | The transaction executes once the threshold is reached, and the result lands on chain | ✅ Pass | Extension |
| FIX-4d | The multisig notification fires at each step — pending approval, and again when the transaction resolves | ✅ Pass | Extension |
| FIX-4e | The multisig transaction appears in history with the right status and figures | ✅ Pass | Extension |

All 306 lines pass and the story closes. The upgrade half ran last: balances, history and screens hold on every deactivated chain, the Bittensor balances stayed with their netuids rather than following the symbols that moved, and custom networks and tokens survive untouched. Subnet 111 shows its alpha balance now its assetType reads LOCAL, and the subnets the tooling never reached are correct.

### Bugs

None.

## US-42.29 — Improve multisig notification (#5093)

Not started. 22 AC against PR #5095, which is open and unreviewed.

The setup it needs: a multisig with at least three signatories, the wallet holding more than one of them, a second wallet to approve or cancel from outside, and a way to make the chain's RPC fail.

## Summary

US-42.28 closed today at all 306 of its lines.

The Bittensor table was the thing that had to change first. BIT-11 was a single line covering all 102 subnets the resync touched, so a session could read fifty of them and tick nothing — which is exactly what happened across two days. It was replaced by SUB-2 to SUB-128, one line per netuid naming what changed on it, and all 102 then read and passed.

FIX-4 had the same shape in miniature: one line for a whole multisig transaction. It became FIX-4a to FIX-4e — created and signed, approved by another signatory with the count going up, executed on reaching the threshold, the notification firing at each step, and the entry landing in history. All five pass, so multisig on Bittensor is settled.

The upgrade half ran last. Balances, history and screens hold on every deactivated chain, the chains still active are all there, and custom networks and tokens survive untouched. The Bittensor balances stayed with their netuids rather than following the symbols that moved — netuid 14 to 90 and netuid 84 to 108 are the pairs that would have shown a plausible wrong number otherwise. Subnet 111 shows its alpha balance now its assetType reads LOCAL, and the subnets after it, which the tooling never reached, are correct.

US-42.27 did not change state. The session re-ran its checklist against the newer Android beta build released today and the results held, so the ticks from 10-06 stand on that build as well.

US-42.29 has not started.

No bugs found.
