---
id: US-4.12
title: "Token registry enable/disable"
epic: EPIC-4
status: done
priority: P1
points: 2
sprint: sprint-2023-M03
version_shipped: 1.0.1
prd_ref: [FR-43]
arch_ref: [AD-02]
depends_on: [US-4.11]
assignee: nulllpc
commit: 5c82ff0bea9f68c2c48a62e00da2d101a1605631, 83e8c110419850de1b91618d21e0ebf5055b823a
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can show or hide individual tokens so the portfolio displays only the
assets they care about, keeping a multi-chain wallet legible without removing the
underlying chain or token data.

## Status

> **✅ done — shipped in 1.0.1.** All acceptance criteria are ticked and the 67 rows below are
> settled: 65 delivered, 2 closed without shipping. **This is the third-largest story in the epic.**

## Background

With 200+ chains and auto-detected tokens, the asset list can grow noisy. Token
registry management lets the user toggle per-token **visibility** — a presentation
flag on the asset-registry entry, distinct from enabling/disabling the chain
itself ([US-4.1](US-4.1-add-remove-networks-and-custom-rpc.md)). Hiding a token
does not delete it or stop the chain connection; it only removes the token from
the balance/portfolio views. The flag applies equally to registry tokens
(populated via AD-25 / [US-4.3](US-4.3-auto-update-chain-list-and-token-metadata.md))
and to custom-imported tokens ([US-4.11](US-4.11-custom-token-import.md)).

Materializes [FR-43](../../PRD.md#epic-4--chain-management). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** the token-management screen, **When** the user hides a
  token, **Then** it is removed from the balance/portfolio views and the
  visibility flag persists across restarts.
- [x] **AC-2** — **Given** a hidden token, **When** the user re-enables it,
  **Then** it reappears in the portfolio with its current balance.
- [x] **AC-3** — **Given** a token is hidden, **When** the portfolio aggregates,
  **Then** the underlying chain stays connected and the token data is retained
  (hide is presentation-only, not deletion).
- [x] **AC-4** — **Given** a custom-imported token, **When** the user hides it,
  **Then** the same visibility flag applies (registry and custom tokens behave
  identically).

## Tasks

- [x] **TASK-4.12.1** — Per-token visibility flag on the asset-registry entry; persist + re-apply on restart (AC: 1, 2)
- [x] **TASK-4.12.2** — Filter balance/portfolio aggregation by visibility without dropping the chain connection (AC: 3)
- [x] **TASK-4.12.3** — Apply the flag uniformly to registry and custom tokens (AC: 4)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — visibility is a registry-entry flag; it does not tear down or create a chain API object.
- Visibility is a presentation concern only — the balance engine (EPIC-2) still tracks the token; hide filters the view.
- This story introduces no new AD entries.

### Cross-story dependencies

- Builds on [US-4.11](US-4.11-custom-token-import.md) — extends the same asset-registry entry with a visibility flag; custom and registry tokens share the flag.
- Sibling of the balance views (EPIC-7) — they read the visibility flag when aggregating the portfolio.

### Dev notes — points

2 pts — a small config feature: a single persisted visibility flag with a view
filter, no external system and no new chain object, per SKILL §3a-bis (single
file / internal review).

### References

- [Source: PRD FR-43](../../PRD.md#epic-4--chain-management) — enable/disable tokens (visibility)
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: hide a token, restart → stays hidden in the portfolio |
| AC-2 | Manual: re-enable → reappears with balance |
| AC-3 | Manual: hide a token → chain still connected, data retained |
| AC-4 | Manual: hide a custom-imported token → behaves like a registry token |

## Changelog entry

### Added
- Token registry management: per-token show/hide (visibility) for registry and custom-imported tokens.

**Commit**:

## Implementation notes

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: medium, rule: first-delivery).

**Evidence:** No changelog bullet ever names token show/hide; it shipped inside 1.0.1's generic rewrite entry "## [1.0.1] — 2023-03-31 — Upgrade: All extension UI" (release commit ad2567d9ae, which contains AssetSetting). Git evidence: Issue-1016 commits 83e8c11041 "setup assetSetting" and 5c82ff0bea "done basic logic for AssetSetting" (Feb 2023) introduce the per-token visibility flag (stores/AssetSetting.ts, ChainService, ManageTokens toggle UI); pre-rewrite v0.8.4 TokenSetting screen only deleted custom tokens, no visibility toggle. Both commits pass ancestry: in 1.0.1 release commit ad2567d9ae and in v1.0.2 (v1.0.1 was never tagged — tags start at v1.0.2). Later bullet "Enable native token automatically when enabling local token from the transfer screen (#1289)" (1.0.4) confirms the capability already existed. Medium confidence per rule 8: no explicit bullet, resolved via git.

Commits `5c82ff0bea9f68c2c48a62e00da2d101a1605631, 83e8c110419850de1b91618d21e0ebf5055b823a` verified contained in the v1.0.1 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Incremental work, fixes & chores

**67 tracker issues** landed on the token registry — visibility, auto-detection and search — 49 with a release, 16 delivered with no line naming them, 2 closed without shipping. Folded in from the former one-issue-per-story maintenance ledger (2026-07-24).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.3.4 | [#117](https://github.com/Koniverse/SubWallet-Extension/issues/117) | Integrate assets on Statemine and Statemint | ✅ done |
| 0.4.3 | [#301](https://github.com/Koniverse/SubWallet-Extension/issues/301) | Integrate SubSpace Token | ✅ done |
| 0.5.2 | [#206](https://github.com/Koniverse/SubWallet-Extension/issues/206) | Total Balance was wrong due to DOT Crowd loan for Acala & Parallel Token Price was wrong | ✅ done |
| 0.5.3 | [#468](https://github.com/Koniverse/SubWallet-Extension/issues/468) | Integration MoonFit token | ✅ done |
| 0.5.3 | [#485](https://github.com/Koniverse/SubWallet-Extension/issues/485) | Integrate tokens for dapps on Moonbeam/Moonriver | ✅ done |
| 0.6.6 | [#671](https://github.com/Koniverse/SubWallet-Extension/issues/671) | Update $ price for ZTG token | ✅ done |
| 0.6.7 | [#714](https://github.com/Koniverse/SubWallet-Extension/issues/714) | An error occurs when a user deletes tokens in case the tokens to be deleted have the same address contract | ✅ done |
| 0.6.8 | [#742](https://github.com/Koniverse/SubWallet-Extension/issues/742) | Support sending PSP tokens | ✅ done |
| 0.6.9 | [#760](https://github.com/Koniverse/SubWallet-Extension/issues/760) | Add top token on ETH and BSC | ✅ done |
| 0.6.9 | [#773](https://github.com/Koniverse/SubWallet-Extension/issues/773) | Support sending BIT token for Bit.Country Alpha Net | ✅ done |
| 0.7.4 | [#854](https://github.com/Koniverse/SubWallet-Extension/issues/854) | Integrate Watr Protocol and Token | ✅ done |
| 0.7.6 | [#928](https://github.com/Koniverse/SubWallet-Extension/issues/928) | Integrate $TFA token into SubWallet | ✅ done |
| 1.0.5 | [#1355](https://github.com/Koniverse/SubWallet-Extension/issues/1355) | WND token balance displayed incorrectly | ✅ done |
| 1.1.1 | [#1525](https://github.com/Koniverse/SubWallet-Extension/issues/1525) | Support viewing zkAssets on Manta | ✅ done |
| 1.1.3 | [#1444](https://github.com/Koniverse/SubWallet-Extension/issues/1444) | Sort the order of tokens displayed in the list | ✅ done |
| 1.1.20 | [#2104](https://github.com/Koniverse/SubWallet-Extension/issues/2104) | UI bug when scrolling on the Token Detail screen | ✅ done |
| 1.1.22 | [#2154](https://github.com/Koniverse/SubWallet-Extension/issues/2154) | Can not get balance of the ENJ token | ✅ done |
| 1.1.22 | [#2185](https://github.com/Koniverse/SubWallet-Extension/issues/2185) | Pooled assets are not included in locked balance | ✅ done |
| 1.1.24 | [#1997](https://github.com/Koniverse/SubWallet-Extension/issues/1997) | Update the Token detail screen | ✅ done |
| 1.1.27 | [#2201](https://github.com/Koniverse/SubWallet-Extension/issues/2201) | Handle the case of display large balance in Token detail screen | ✅ done |
| 1.1.31 | [#2452](https://github.com/Koniverse/SubWallet-Extension/issues/2452) | Extension - Show custom network on the token list when nominate | ✅ done |
| 1.1.34 | [#2540](https://github.com/Koniverse/SubWallet-Extension/issues/2540) | Fix bug not showing GENS token from Genshiro | ✅ done |
| 1.1.36 | [#1236](https://github.com/Koniverse/SubWallet-Extension/issues/1236) | Re-check condition Delete token | ✅ done |
| 1.1.50 | [#2791](https://github.com/Koniverse/SubWallet-Extension/issues/2791) | Extension - Do not show balance in case standing on History list to search token | ✅ done |
| 1.2.4 | [#3053](https://github.com/Koniverse/SubWallet-Extension/issues/3053) | Extension - Add the "View on explorer" button on the Token details screen | ✅ done |
| 1.2.13 | [#3268](https://github.com/Koniverse/SubWallet-Extension/issues/3268) | Change token type from GRC-20 to VFT | ✅ done |
| 1.2.16 | [#3270](https://github.com/Koniverse/SubWallet-Extension/issues/3270) | Check Vara token sdk version | ✅ done |
| 1.2.24 | [#3297](https://github.com/Koniverse/SubWallet-Extension/issues/3297) | Refactor pallet parsing for token balance | ✅ done |
| 1.2.30 | [#3612](https://github.com/Koniverse/SubWallet-Extension/issues/3612) | FIx bug not showing balance of VFT tokens | ✅ done |
| 1.3.2 | [#3756](https://github.com/Koniverse/SubWallet-Extension/issues/3756) | Extension - Improve UI related to Select token screen | ✅ done |
| 1.3.9 | [#3713](https://github.com/Koniverse/SubWallet-Extension/issues/3713) | Fix bug validating recipient balance when sending Substrate token | ✅ done |
| 1.3.13 | [#3958](https://github.com/Koniverse/SubWallet-Extension/issues/3958) | Extension - Re-enable search token feature | ✅ done |
| 1.3.17 | [#3920](https://github.com/Koniverse/SubWallet-Extension/issues/3920) | Show well-known tokens on top | ✅ done |
| 1.3.24 | [#3786](https://github.com/Koniverse/SubWallet-Extension/issues/3786) | Extension - Can't reset data when search on select token popup | ✅ done |
| 1.3.28 | [#4081](https://github.com/Koniverse/SubWallet-Extension/issues/4081) | Show value of derivative token relative to the origin tokens | ✅ done |
| 1.3.28 | [#4150](https://github.com/Koniverse/SubWallet-Extension/issues/4150) | Display dTAO balance like another token | ✅ done |
| 1.3.28 | [#4151](https://github.com/Koniverse/SubWallet-Extension/issues/4151) | Add dTao tokens | ✅ done |
| 1.3.29 | [#2339](https://github.com/Koniverse/SubWallet-Extension/issues/2339) | Extension - Sort the token by balance | ✅ done |
| 1.3.31 | [#3960](https://github.com/Koniverse/SubWallet-Extension/issues/3960) | Improve token enabling | ✅ done |
| 1.3.41 | [#3917](https://github.com/Koniverse/SubWallet-Extension/issues/3917) | Support asset migration on Moonbeam | ✅ done |
| 1.3.41 | [#4413](https://github.com/Koniverse/SubWallet-Extension/issues/4413) | Fix bug show Moonbeam local token balance | ✅ done |
| 1.3.47 | [#4481](https://github.com/Koniverse/SubWallet-Extension/issues/4481) | Extension - Don't show list address type for BTC token when get address on Token details screen | ✅ done |
| 1.3.48 | [#4475](https://github.com/Koniverse/SubWallet-Extension/issues/4475) | Extension - Turn off default enabled tokens | ✅ done |
| 1.3.48 | [#4525](https://github.com/Koniverse/SubWallet-Extension/issues/4525) | [Extension] Bug auto-enable chain for popular tokens | ✅ done |
| 1.3.49 | [#4468](https://github.com/Koniverse/SubWallet-Extension/issues/4468) | Filter To token Based on Selected From token | ✅ done |
| 1.3.65 | [#4542](https://github.com/Koniverse/SubWallet-Extension/issues/4542) | Extension - Improve detect assets & optimize enabled tokens on EVM chains | ✅ done |
| 1.3.71 | [#4247](https://github.com/Koniverse/SubWallet-Extension/issues/4247) | Extension - Improve token enabling(Round 2) | ✅ done |
| 1.3.72 | [#639](https://github.com/Koniverse/SubWallet-Extension/issues/639) | Can't see the NFT in case NFT Collection is on multi-page | ✅ done |
| 1.3.76 | [#4892](https://github.com/Koniverse/SubWallet-Extension/issues/4892) | [Bittensor] Display token name and subnet ID for subnet tokens | ✅ done |
| — | [#25](https://github.com/Koniverse/SubWallet-Extension/issues/25) | Compatible with Metamask and Integration Moonbeam/Moonriver ecosystem assets | ✅ done |
| — | [#87](https://github.com/Koniverse/SubWallet-Extension/issues/87) | Implement xcToken asset conversion APIs from available APIs | ✅ done |
| — | [#281](https://github.com/Koniverse/SubWallet-Extension/issues/281) | Display wrong tokens on Interlay and Kintsuigi | ✅ done |
| — | [#304](https://github.com/Koniverse/SubWallet-Extension/issues/304) | Add the feature that allows users to show/hide zero balance of tokens, or delete/hide tokens inside each chain | ✅ done |
| — | [#308](https://github.com/Koniverse/SubWallet-Extension/issues/308) | Distinguishing the Network's Coingecko Key and Token's Coingecko Key | ✅ done |
| — | [#888](https://github.com/Koniverse/SubWallet-Extension/issues/888) | Integrate Watr Mainnet and token (Updating...) | ✅ done |
| — | [#1208](https://github.com/Koniverse/SubWallet-Extension/issues/1208) | Adjust the display order of tokens | ✅ done |
| — | [#1248](https://github.com/Koniverse/SubWallet-Extension/issues/1248) | Incorrect balance display of some tokens | ✅ done |
| — | [#1357](https://github.com/Koniverse/SubWallet-Extension/issues/1357) | Re-check the token price status (increase/decrease) and change rate in 24h | ✅ done |
| — | [#1410](https://github.com/Koniverse/SubWallet-Extension/issues/1410) | Sort tokens in order of value or balance of tokens held | ✅ done |
| — | [#1455](https://github.com/Koniverse/SubWallet-Extension/issues/1455) | Automatically enable native tokens when enabling local tokens from the Manage tokens screen | ✅ done |
| — | [#2481](https://github.com/Koniverse/SubWallet-Extension/issues/2481) | UI bug when token name is long on the Select token when click on search token icon on header | ✅ done |
| — | [#2824](https://github.com/Koniverse/SubWallet-Extension/issues/2824) | Integrate asset online ( Round 2) | ⏸ deprecated |
| — | [#2848](https://github.com/Koniverse/SubWallet-Extension/issues/2848) | Support new assets on Moonbeam | ✅ done |
| — | [#3135](https://github.com/Koniverse/SubWallet-Extension/issues/3135) | Implement asset-pallet touch to prevent loss of funds | ✅ done |
| — | [#4288](https://github.com/Koniverse/SubWallet-Extension/issues/4288) | Extension - Improve token enabling(Round 2) | ✅ done |
| — | [#4308](https://github.com/Koniverse/SubWallet-Extension/issues/4308) | Extension - Don't automatically enable common tokens when doing eraser all | ✅ done |
| — | [#4695](https://github.com/Koniverse/SubWallet-Extension/issues/4695) | Support Minting DOT and POAP at Token2049 | ⏸ deprecated |

> **A wallet that auto-detects tokens across N chains spends most of its token maintenance on what
> to show and what to hide.** Auto-enable / detect assets (#2589, #2800), show/hide zero-balance
> (#304), search (#3961), distinguishing similar symbols (#2667), per-token price and logo — the
> registry's job is curation, and curation is never finished.

## Cross-references

- [PRD FR-43](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.11](US-4.11-custom-token-import.md)
- [consolidation note](../../notes/2026-07-24.md#d-epic-24-maintenance--network--token-merged-into-epic-4)
