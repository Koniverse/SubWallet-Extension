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

BIT-11 was one line covering all 102 subnets the resync changed, which meant a session could read fifty of them and still tick nothing. It is replaced today by SUB-2 to SUB-128, one line per netuid naming what changed on it — the same shape the new chains already had with NEW-M-1 to NEW-M-12.

The story goes from 201 lines to 302, re-pointed 36 to 42. Netuids 2 to 55 are read and pass.

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

41 of 102 subnets read. The next is netuid 57.

Still open elsewhere: the Bittensor balance checks BIT-1 to BIT-10 and BIT-14, GEN-1 to GEN-6, RPC-X1 and RPC-X3, the upgrade runs, and FIX-4 to FIX-6.

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
