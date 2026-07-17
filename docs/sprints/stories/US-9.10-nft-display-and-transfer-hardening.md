---
id: US-9.10
title: "NFT display & transfer hardening"
epic: EPIC-9
status: backlog
priority: P2
points: 5
sprint:
version_shipped:
prd_ref: [FR-85, FR-89, FR-92]
arch_ref: [AD-24, AD-25]
depends_on: [US-9.1, US-9.5]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Keep the collectibles surface correct end-to-end: opening an NFT renders its
detail without an error page, every NFT collection that an account holds shows
up regardless of browser, and the transfer flow tells the user the right amount
and the right message before they sign. This story defends the NFT detail /
display / transfer correctness that the feature stories in this epic assemble,
so users never see a broken detail page, a missing collection, or a confirmation
screen that contradicts what they are sending.

## Background

This is a cross-cutting hardening story for EPIC-9 with **no FR** — it
consolidates the real-world NFT bug/iteration issues that hit the *display* and
*transfer-correctness* path the feature stories build, rather than inventing a
new capability. It anchors five reported issues that share one root concern: the
NFT read + transfer surface must be correct (right detail render, right
visibility across browsers, right amount/message on transfer), not just present.

The anchored issues group into three facets:

- **Detail render correctness** — opening an NFT item must never land on an error
  page ([#2124](https://github.com/Koniverse/SubWallet-Extension/issues/2124)).
- **Transfer correctness** — the transfer confirmation must show the correct
  amount ([#3241](https://github.com/Koniverse/SubWallet-Extension/issues/3241))
  and the correct, NFT-appropriate message
  ([#2946](https://github.com/Koniverse/SubWallet-Extension/issues/2946)) so the
  user signs what they intend.
- **Display reach + import validation** — an NFT collection (e.g. Kusama Asset
  Hub) must show up cross-browser, including Firefox
  ([#3030](https://github.com/Koniverse/SubWallet-Extension/issues/3030)), and
  importing a custom NFT must be validated so a bad contract/standard is rejected
  with a clear error rather than silently producing a broken collection
  ([#4859](https://github.com/Koniverse/SubWallet-Extension/issues/4859)).

> **Scope correction.** An earlier draft of this story framed it as an "IPFS
> gateway & rendering" hardening concern. No anchored NFT issue is about IPFS
> gateways — the real bug/iteration issues are about NFT **detail render,
> cross-browser display, transfer amount/message, and import validation**. This
> story re-grounds US-9.10 on those actual issues; the same single-story shape
> (one NFT display/transfer-correctness hardening anchor) is kept.

The display side rides the Services SDK NFT aggregation
([AD-24](../../ARCHITECTURE.md#architecture-decisions), NFR-20) and the
`ipfs-files` media proxy ([AD-25](../../ARCHITECTURE.md#architecture-decisions),
NFR-21) — this story hardens how the UI consumes them (detail render, browser
reach) rather than changing the providers. The transfer side builds the
NFT-shaped transfer request that [US-9.5](US-9.5-nft-transfer-send.md) owns;
correctness of amount/message is fixed in the request-build + confirmation layer
here, while signing/broadcast stay owned by EPIC-8/EPIC-2.

## Acceptance criteria

- [ ] **AC-1** — **Given** any NFT item the account holds (across the supported standards/chains), **When** the user opens its detail view, **Then** the detail renders the item (media, attributes, actions) without an error page, including on the WebApp build (#2124).
- [ ] **AC-2** — **Given** an NFT transfer being prepared, **When** the user reaches the transaction confirmation screen, **Then** the displayed amount/quantity matches the NFT being sent and the confirmation message is the correct NFT-transfer message, not a token-transfer message (#3241, #2946).
- [ ] **AC-3** — **Given** an account that holds an NFT collection on a supported chain (e.g. Kusama Asset Hub), **When** the collectibles surface loads on Firefox, **Then** the collection is shown — display reach does not differ by browser (#3030).
- [ ] **AC-4** — **Given** a custom NFT import by contract, **When** the user submits the form, **Then** the contract/standard is validated and a valid collection is added, while an invalid or unsupported contract is rejected with a clear inline error (#4859).
- [ ] **AC-5** *(unhappy path)* — **Given** an NFT whose detail data or media fails to resolve, **When** the user opens its detail, **Then** the view degrades to a clear error/placeholder state inside the detail view (no full error page, no blank screen) and the rest of the grid stays interactive; an invalid import never persists a broken collection.

## Tasks

- [ ] **TASK-9.10.1** — Fix NFT detail render so opening any held item never lands on an error page, including the WebApp build (AC: 1)
- [ ] **TASK-9.10.2** — Correct the transfer confirmation: show the right NFT amount/quantity and the right NFT-transfer message in the request-build + confirmation layer (AC: 2)
- [ ] **TASK-9.10.3** — Guarantee cross-browser display reach so held collections (e.g. Kusama Asset Hub) show on Firefox the same as other browsers (AC: 3)
- [ ] **TASK-9.10.4** — Harden custom NFT import validation: accept valid contracts, reject invalid/unsupported ones with a clear inline error and no persisted broken collection (AC: 4)
- [ ] **TASK-9.10.5** — Degrade-on-failure for NFT detail (error/placeholder inside the detail view, grid stays interactive) (AC: 5)
- [ ] **TASK-9.10.6** — Regression coverage for the five anchored issues (#2124, #2946, #3030, #3241, #4859) so they do not reproduce (AC: 1, 2, 3, 4, 5)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — NFT collection/item display is sourced through the SubWallet Services SDK aggregation; this story hardens how the detail/display UI consumes that data (render correctness, browser reach), not the aggregation provider.
- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — NFT media is fetched through the `ipfs-files` proxy; the detail-render fix consumes that pipeline and falls back to a placeholder rather than introducing a new gateway.
- Transfer assembly only: the amount/message fix lands in the NFT-transfer request-build + confirmation layer ([US-9.5](US-9.5-nft-transfer-send.md)); signing/broadcast stay owned by EPIC-8/EPIC-2 (epic invariant "Transfer assembly only, never signing here").
- This story introduces no new AD entries — it hardens existing ones.

### Cross-story dependencies

- Builds on [US-9.1](US-9.1-substrate-nft-display.md) — hardens the NFT detail/display path (detail render, cross-browser reach) that the Substrate NFT display feature surfaces.
- Builds on [US-9.5](US-9.5-nft-transfer-send.md) — corrects the amount/message in the NFT-transfer request + confirmation that story builds.
- Touches the custom-import surface owned by [US-9.8](US-9.8-custom-nft-import.md) — coordinate review on import validation.

### What we explicitly did NOT do

- No new NFT standard, chain or media format — display/transfer correctness only; new standards remain "new handler, not new screen" per the epic invariant.
- No IPFS-gateway routing/fallback redesign — that earlier framing was dropped; this story consumes the existing media pipeline (AD-25) and only adds a detail-level placeholder fallback.
- No signing/broadcast changes — transfer execution stays in EPIC-8/EPIC-2.

### References

- [Issue #2124](https://github.com/Koniverse/SubWallet-Extension/issues/2124) — [WebApp] Error page when opening NFT detail
- [Issue #2946](https://github.com/Koniverse/SubWallet-Extension/issues/2946) — Update message when transferring NFT
- [Issue #3030](https://github.com/Koniverse/SubWallet-Extension/issues/3030) — Do not show NFT Kusama Asset Hub on Firefox
- [Issue #3241](https://github.com/Koniverse/SubWallet-Extension/issues/3241) — [WebApp] Incorrect Amount on transaction confirmation for transfer NFT
- [Issue #4859](https://github.com/Koniverse/SubWallet-Extension/issues/4859) — Improve validation when importing NFT
- [Source: ARCHITECTURE AD-24](../../ARCHITECTURE.md#architecture-decisions) — Backend Services SDK NFT aggregation
- [Source: ARCHITECTURE AD-25](../../ARCHITECTURE.md#architecture-decisions) — `ipfs-files` NFT media proxy

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: open the detail of every held NFT (incl. WebApp build) → detail renders, no error page (#2124) |
| AC-2 | Manual: prepare an NFT transfer → confirmation shows correct amount/quantity + NFT-transfer message (#3241, #2946) |
| AC-3 | Manual: load collectibles on Firefox with a Kusama Asset Hub NFT → collection is shown (#3030) |
| AC-4 | Manual: import a valid NFT contract → added; import an invalid/unsupported one → rejected with inline error, nothing persisted (#4859) |
| AC-5 | Manual: NFT with failing detail data/media → in-view error/placeholder, grid stays interactive; invalid import never persists |

## Changelog entry

### Fixed
- NFT detail no longer shows an error page when opened (including the WebApp build) (#2124).
- NFT transfer confirmation now shows the correct amount/quantity and the correct NFT-transfer message (#3241, #2946).
- NFT collections (e.g. Kusama Asset Hub) now display on Firefox the same as other browsers (#3030).
- Custom NFT import now validates the contract/standard and rejects invalid/unsupported imports with a clear inline error instead of persisting a broken collection (#4859).

**Commit**:

## Implementation notes

_Hardening story — no FR; consolidates NFT display/transfer-correctness issues #2124, #2946, #3030, #3241, #4859. Re-grounded from an earlier mis-scoped "IPFS gateway & rendering" framing. Fill `commit` / `version_shipped` on delivery._

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md) · [US-9.5](US-9.5-nft-transfer-send.md) · [US-9.8](US-9.8-custom-nft-import.md) · [#2124](https://github.com/Koniverse/SubWallet-Extension/issues/2124) · [#2946](https://github.com/Koniverse/SubWallet-Extension/issues/2946) · [#3030](https://github.com/Koniverse/SubWallet-Extension/issues/3030) · [#3241](https://github.com/Koniverse/SubWallet-Extension/issues/3241) · [#4859](https://github.com/Koniverse/SubWallet-Extension/issues/4859)
