---
id: US-4.27
title: "Network & token on the WebApp & Avail Space"
epic: EPIC-4
status: done
priority: P3
points: 5
sprint: sprint-2024-M01
version_shipped: 1.2.14
prd_ref: []
assignee:
commit:
created: 2026-07-24
updated: 2026-07-24
---

## Goal

Make network and token management work **on the WebApp & Avail Space** — managing networks by tab,
turning networks on/off, the token list and token-detail screens — the same chain/token model run as
a page, not a background.

## Status

> **✅ done — all 20 rows below are settled**: 17 delivered, 3 closed without shipping. It carries
> **no FR** — network and token management are FR-31 … FR-43; this story is the second surface they
> run on.
>
> **`version_shipped: 1.2.14` is a representative anchor, not the whole set** — the most recent
> constituent with a provable release. The WebApp has its own version space
> ([AGENTS.md](../../../AGENTS.md) rule 1b), which is why several rows carry `Shipped: —`.

## Scope

Folded in from the former one-issue-per-story maintenance ledger on 2026-07-24. Its own story because
the WebApp runs the chain/token model as a *page* — managing networks by tab, the responsive token
list, and token-detail footers that the extension's popup never needed.

The open WebApp network/token work is in [US-4.25](US-4.25-open-network-and-token-improvements.md)
([AGENTS.md](../../../AGENTS.md) rule 9).

## Incremental work, fixes & chores

**20 tracker issues** — 13 with a release, 4 delivered with no line naming them, 3 closed without
shipping.

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.1.24 | [#1791](https://github.com/Koniverse/SubWallet-Extension/issues/1791) | WebApp \| Extension - Update the default logo | ✅ done |
| 1.1.29 | [#2340](https://github.com/Koniverse/SubWallet-Extension/issues/2340) | [WebApp \| Extension] Update the Token details screen | ✅ done |
| 1.1.36 | [#1696](https://github.com/Koniverse/SubWallet-Extension/issues/1696) | WebApp - Bugs related to Manage network feature | ✅ done |
| 1.1.36 | [#1783](https://github.com/Koniverse/SubWallet-Extension/issues/1783) | WebApp - Update basic Metadata for WebApp (for sharing, SEO...) | ✅ done |
| 1.1.36 | [#1805](https://github.com/Koniverse/SubWallet-Extension/issues/1805) | WebApp - $value of token on History is incorrect | ✅ done |
| 1.1.36 | [#1807](https://github.com/Koniverse/SubWallet-Extension/issues/1807) | WebApp - UI bugs on the custom token detail | ✅ done |
| 1.1.36 | [#1845](https://github.com/Koniverse/SubWallet-Extension/issues/1845) | WebApp - Update token list (Hompage) by new design | ✅ done |
| 1.1.36 | [#2482](https://github.com/Koniverse/SubWallet-Extension/issues/2482) | WebApp - Add banner for token list page | ✅ done |
| 1.1.38 | [#2509](https://github.com/Koniverse/SubWallet-Extension/issues/2509) | WebApp - Do not show footer in token detail screen in case responsive | ✅ done |
| 1.1.62 | [#2954](https://github.com/Koniverse/SubWallet-Extension/issues/2954) | WebApp - Support NFTs on Asset Hub | ✅ done |
| 1.2.3 | [#3087](https://github.com/Koniverse/SubWallet-Extension/issues/3087) | WebApp - Add the "View on explorer" button on the Token details screen | ✅ done |
| 1.2.3 | [#3093](https://github.com/Koniverse/SubWallet-Extension/issues/3093) | WebApp - Support GRC-20 token | ✅ done |
| 1.2.14 | [#3149](https://github.com/Koniverse/SubWallet-Extension/issues/3149) | WebApp - Remove the logic that differentiates between Native tokens and Local tokens in case show sub-logo | ✅ done |
| — | [#2763](https://github.com/Koniverse/SubWallet-Extension/issues/2763) | WebApp - Sort the token by balance | ✅ done |
| — | [#3290](https://github.com/Koniverse/SubWallet-Extension/issues/3290) | WebApp - Change token type from GRC-20 to VFT | ⏸ deprecated |
| — | [#3291](https://github.com/Koniverse/SubWallet-Extension/issues/3291) | WebApp - Change token type from GRC-20 to VFT | ✅ done |
| — | [#4610](https://github.com/Koniverse/SubWallet-Extension/issues/4610) | WebApp - Proxy the mempools API via Cloudflare worker | ⏸ deprecated |
| — | [#4742](https://github.com/Koniverse/SubWallet-Extension/issues/4742) | WebApp - Update paseo asset hub migration | ✅ done |
| — | [#4747](https://github.com/Koniverse/SubWallet-Extension/issues/4747) | [WebApp / Network detail] - Unable to open network detail screen when clicking first time on edit button of network | ⏸ deprecated |
| — | [#4793](https://github.com/Koniverse/SubWallet-Extension/issues/4793) | WebApp - Update UI after Asset Hub Migration | ✅ done |

> **The WebApp re-implemented network and token management as a page**, and each surface is a row:
> manage-networks (#1696), the token-list redesign (#1845 new design, #2482 banner, #2763
> sort-by-balance), token detail (#1807 custom token, #2340, #2509 footer, #3087 view-on-explorer),
> logos (#1791), and the Asset Hub era reaching the WebApp (#2954 NFTs on Asset Hub, #4742 paseo,
> #4793 post-migration UI). It is the chain/token half of the same WebApp parity programme whose
> account half is [US-3.11](US-3.11-account-on-the-webapp-and-avail-space.md).

## Acceptance criteria

- [x] **AC-1** — Every row above is a WebApp / Avail Space network-or-token issue, closed on the tracker (17 `COMPLETED`, 3 not-planned).
- [x] **AC-2** — No row here is also a row in any EPIC-4 capability story: the WebApp surface's issues are partitioned from the extension's.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 1696` … `4793` → CLOSED |
| AC-2 | `comm -12 <(grep -o "issues/[0-9]*" docs/sprints/stories/US-4.27-*.md \| sort -u) <(cat docs/sprints/stories/US-4.[1-9]-*.md docs/sprints/stories/US-4.1[0-9]-*.md \| grep -o "issues/[0-9]*" \| sort -u)` → empty |

## Cross-references

- [Epic EPIC-4](../epics/EPIC-4.md) · [US-3.11](US-3.11-account-on-the-webapp-and-avail-space.md) · [US-4.25](US-4.25-open-network-and-token-improvements.md) · [consolidation note](../../notes/2026-07-24.md#d-epic-24-maintenance--network--token-merged-into-epic-4)
