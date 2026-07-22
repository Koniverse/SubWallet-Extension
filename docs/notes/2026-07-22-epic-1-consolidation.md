# EPIC-22 (Maintenance — Build & Platform) merged into EPIC-1 — 2026-07-22

`EPIC-22` is gone. Its 19 tracker issues now live in the EPIC-1 capability they belong to — the
fourth maintenance epic dissolved, after [EPIC-29 → EPIC-9](2026-07-17-epic-9-consolidation.md),
[EPIC-25 → EPIC-5](2026-07-21-epic-5-consolidation.md) and
[EPIC-37 → EPIC-17](2026-07-22-epic-17-consolidation.md).

This ledger was the **messiest so far**, and usefully so: a third of it was not extension work at
all, and two issues were filed under the browser they broke on rather than the capability they
broke.

## Where each issue went

| Issue | Title | Status | Shipped | Retired id | Now lives in |
|---|---|---|---|---|---|
| [#334](https://github.com/Koniverse/SubWallet-Extension/issues/334) | Make the wallet extension in chrome persist it's state when changing focus | ✅ done | — | `US-22.1` | US-1.1 |
| [#1406](https://github.com/Koniverse/SubWallet-Extension/issues/1406) | Try to remove 'webRequest' from manifest.xml | ✅ done | 1.0.6 | `US-22.2` | US-1.5 |
| [#1934](https://github.com/Koniverse/SubWallet-Extension/issues/1934) | Handling the Cross-Origin Request Blocked on Firefox browser | 📋 backlog | — | `US-22.3` | US-1.5 |
| [#1938](https://github.com/Koniverse/SubWallet-Extension/issues/1938) | WebApp - Re-check camera detection on the Firefox browser | ✅ done | — | `US-22.4` | US-5.7 *(relocated)* |
| [#1995](https://github.com/Koniverse/SubWallet-Extension/issues/1995) | Fixed bug IPFS in Firefox browser | ✅ done | 1.1.18 | `US-22.5` | US-9.13 *(relocated)* |
| [#2131](https://github.com/Koniverse/SubWallet-Extension/issues/2131) | Build Chainlist page | 📋 backlog | — | `US-22.6` | US-1.6 |
| [#2231](https://github.com/Koniverse/SubWallet-Extension/issues/2231) | WebApp | Update build number for WebApp | ✅ done | 1.1.36 | `US-22.7` | US-1.5 |
| [#2276](https://github.com/Koniverse/SubWallet-Extension/issues/2276) | Web Runner | Backup and restore indexed DB | ✅ done | 1.1.26 | `US-22.8` | US-1.2 |
| [#2455](https://github.com/Koniverse/SubWallet-Extension/issues/2455) | Build some middleware services | ⏸️ deprecated | — | `US-22.9` | US-1.6 |
| [#2471](https://github.com/Koniverse/SubWallet-Extension/issues/2471) | Do not navigate the Chrome store in case disable Extension SubWallet yet | ⏸️ deprecated | — | `US-22.10` | US-1.1 |
| [#2529](https://github.com/Koniverse/SubWallet-Extension/issues/2529) | Build tracking dashboard across platforms | 📋 backlog | — | `US-22.11` | US-1.6 |
| [#2534](https://github.com/Koniverse/SubWallet-Extension/issues/2534) | Build a user support system | ✅ done | — | `US-22.12` | US-1.6 |
| [#3222](https://github.com/Koniverse/SubWallet-Extension/issues/3222) | Extension - Recheck time of stop background on Firefox browser | 📋 backlog | — | `US-22.13` | US-1.1 |
| [#3455](https://github.com/Koniverse/SubWallet-Extension/issues/3455) | Build Ton chainlist | ✅ done | 1.2.26 | `US-22.14` | US-1.3 |
| [#3992](https://github.com/Koniverse/SubWallet-Extension/issues/3992) | WebApp - Fix bug CORS on Firefox's extension and WebApp | ✅ done | — | `US-22.15` | US-1.5 |
| [#4118](https://github.com/Koniverse/SubWallet-Extension/issues/4118) | Setup github action để deploy cho SubWallet backend | ✅ done | — | `US-22.16` | US-1.6 |
| [#4189](https://github.com/Koniverse/SubWallet-Extension/issues/4189) | Deploying Bittensor ecosystem features | ✅ done | — | `US-22.17` | US-1.6 |
| [#4239](https://github.com/Koniverse/SubWallet-Extension/issues/4239) | Build chainlist stable v0.2.103 | ✅ done | — | `US-22.18` | US-1.3 |
| [#4602](https://github.com/Koniverse/SubWallet-Extension/issues/4602) | Add logic for testing development build with Koni Brower Runner | 📋 backlog | — | `US-22.19` | US-1.5 |

**3 → US-1.1** · **1 → US-1.2** · **2 → US-1.3** · **5 → US-1.5** · **6 → US-1.6 (new)** ·
**2 relocated to other epics**.

## A new story for work whose code is not in this repository

Six issues — a ChainList site, backend middleware, a backend deploy pipeline, an analytics
dashboard, a user support system, an ecosystem deployment — are real work the team tracked here
and have **no code in `packages/`**. They become
[US-1.6](../sprints/stories/US-1.6-platform-operations-and-out-of-repo-tooling.md).

Filing them against a capability would make that capability's history read as if the wallet had
gained something it did not. Filing them under *Uncategorized* would be wrong the other way: they
are not unclassifiable, they are **classified as out-of-repo**. None carries a `version_shipped`
even where `done`, because no release of this extension delivers a backend deploy — the
`prd_ref: []` branch of the done-gate ([AGENTS.md](../../AGENTS.md) rule 4).

Worth recording: **#2455 is the ancestor of the Services SDK.** It proposed fetching balances and
earning statistics from a backend instead of per-chain RPC — exactly what
[D66](../CONTEXT.md#d66-aggregate-multi-chain-data-through-the-subwallet-services-sdk-backend-rather-than-computing-it-on-device)
later decided — and was itself closed not-planned. The capability arrived through the Services SDK,
not through this issue.

## Two issues were filed under the browser, not the capability

Both name Firefox in the title, and neither is a build problem:

- **[#1938](https://github.com/Koniverse/SubWallet-Extension/issues/1938)** *"WebApp - Re-check
  camera detection on the Firefox browser"* — actual symptom *"do not detect camera"*. That is the
  camera-access toggle (FR-59) failing on one browser →
  [US-5.7](../sprints/stories/US-5.7-camera-access-and-one-sign-toggles.md).
- **[#1995](https://github.com/Koniverse/SubWallet-Extension/issues/1995)** *"Bug IPFS in Firefox
  browser"* — actual symptom *"do not show NFT of some NFT collection"*. That is the IPFS media
  pipeline failing on one browser →
  [US-9.13](../sprints/stories/US-9.13-nft-media-and-ipfs-gateway-pipeline.md).

**The browser was the condition; the capability was the thing that broke.** Routing on the word
*Firefox* is the same failure as routing #4610 on the word *proxy* — the title heuristic
[D108](../CONTEXT.md#d108-every-tracker-issue-gets-a-story--in-a-maintenance-epic-layer-so-the-fr-map-stays-the-fr-map)
labelled *"capability area (guess)"* from the start. Genuine cross-browser work — the two CORS
defects, the manifest-permission reduction, the dev-build tooling — stayed in
[US-1.5](../sprints/stories/US-1.5-build-ci-and-cross-browser-packaging-hardening.md), where the
browser *is* the subject.

## Verification

- `node scripts/koni-docs-check-ids.mjs` — exit 0; every ID, link and anchor resolves.
- `npx koni-docs validate --docs-path docs/` — exit 0.
- No `US-22.` token remains on the live doc surface; this dated note is the only place they appear.

## Correction — 2026-07-22: #4189 was not out-of-repo work

[#4189](https://github.com/Koniverse/SubWallet-Extension/issues/4189) *"Deploying Bittensor
ecosystem features"* was folded into US-1.6 with `Shipped: —`. That was wrong. It is a **cross-epic
umbrella over six sub-issues, every one of them closed COMPLETED with a CHANGELOG line and a
release**:

| Shipped | Issue | Title | Area |
|---|---|---|---|
| 1.3.28 | [#4140](https://github.com/Koniverse/SubWallet-Extension/issues/4140) | Extension — Bug related to subnet staking features | EPIC-12 |
| 1.3.28 | [#4150](https://github.com/Koniverse/SubWallet-Extension/issues/4150) | Display dTAO balance like another token | EPIC-4 |
| 1.3.28 | [#4151](https://github.com/Koniverse/SubWallet-Extension/issues/4151) | Add dTAO tokens | EPIC-4 |
| 1.3.30 | [#4145](https://github.com/Koniverse/SubWallet-Extension/issues/4145) | Extension — Support custom slippage for TAO subnet staking | EPIC-12 |
| 1.3.43 | [#4358](https://github.com/Koniverse/SubWallet-Extension/issues/4358) | TAO On-ramp Integration in SubWallet | EPIC-14 |
| 1.3.48 | [#4359](https://github.com/Koniverse/SubWallet-Extension/issues/4359) | Stake TAO with Seamless Validator Switching | EPIC-12 |

**How it got there.** The title starts with *"Deploying"*, and the maintenance generator's area
heuristic reads that as a deploy chore — the same class of error
[D108](../CONTEXT.md#d108-every-tracker-issue-gets-a-story--in-a-maintenance-epic-layer-so-the-fr-map-stays-the-fr-map)
predicted and that already sent #4610 to the wrong area. It then survived the EPIC-22 fold, because
that fold read the ledger's own area labels rather than the tracker.

**How to catch the class.** An out-of-repo issue has **no sub-issues in this tracker and no
CHANGELOG line**. `gh api repos/Koniverse/SubWallet-Extension/issues/<N>/sub_issues` returns empty
for #2131, #2455, #2529, #2534 and #4118 — and returned six for #4189. That check now runs in
US-1.6's own verification command.

**Where it went.** [US-32.373](../sprints/stories/US-32.373-deploying-bittensor-ecosystem-features.md),
the Earning ledger, which owns three of the six children — the plurality. The story states that
EPIC-4 and EPIC-14 own the other three, so no area is over-claimed. Its `version_shipped` is
**1.3.48**, the release by which every child had shipped; the board closed #4189 on 2025-04-14,
when two children were still ahead of it.

**Six child stories were repointed.** US-32.324, US-32.325, US-32.335, US-24.294, US-24.295 and
US-34.35 each said *"Sub-issue of #4189 (now US-1.6)"* — telling a reader that Bittensor feature
work's parent was a platform-operations story. They now name US-32.373.

**US-1.6 is down to three rows** — #2455 (closed not-planned), #2534 and #4118 — and stays `done`
under the done-gate's third branch.
