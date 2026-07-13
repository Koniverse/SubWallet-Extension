---
id: US-6.6
title: "Design-system & UX hardening: cross-platform consistency and responsive regressions"
epic: EPIC-6
status: backlog
priority: P2
points: 5
sprint:
version_shipped:
prd_ref: [FR-63, FR-64]
arch_ref: [AD-05]
depends_on: [US-6.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Keep the shared UI honest as features ship into it. This story is the standing
anchor for the real-world UI/UX defects that accumulate across the extension and
web app — display breaks at non-100% zoom, device-specific border artifacts,
scroll-induced rendering glitches, mobile-layout gaps, incomplete-list displays,
mis-formatted numbers, and Confirmation-screen polish. Users keep seeing a
coherent, correctly-rendered wallet across viewports and platforms instead of a
UI that silently drifts apart screen-by-screen.

## Background

US-6.1 builds the dark-only, responsive shell every screen renders into. This is
the epic's **hardening story** — it owns no new FR capability; it defends the
shared experience layer against the steady stream of UI/UX bug and iteration
issues that real usage surfaces. Because the design system lives once in the
shared UI packages and is consumed across the extension and web app
([AD-05](../../ARCHITECTURE.md#architecture-decisions)), a layout, scaling, or
display-rule defect can regress on one surface while looking fine on another —
exactly the class of drift that is hardest to catch one screen at a time.

This story re-grounds that risk in concrete, reported issues rather than abstract
"consistency". They cluster into four facets:

- **Rendering / scaling regressions** — display breaks when the browser is
  scaled above 100% ([#1286](https://github.com/Koniverse/SubWallet-Extension/issues/1286)),
  device-specific border artifacts on some hardware
  ([#1345](https://github.com/Koniverse/SubWallet-Extension/issues/1345)), and
  UI glitches that appear while scrolling
  ([#3988](https://github.com/Koniverse/SubWallet-Extension/issues/3988)).
- **Responsive / mobile layout** — a second round of mobile-UI improvements
  ([#2141](https://github.com/Koniverse/SubWallet-Extension/issues/2141)) and a
  sweep of screens that display incomplete list information at narrow widths
  ([#2832](https://github.com/Koniverse/SubWallet-Extension/issues/2832)).
- **Cross-surface UI bug sweeps** — batched fix passes on the extension
  ([#2568](https://github.com/Koniverse/SubWallet-Extension/issues/2568)) and on
  the WebApp ([#3341](https://github.com/Koniverse/SubWallet-Extension/issues/3341)).
- **Confirmation & number display** — UI updates for the Confirmation screen
  ([#3766](https://github.com/Koniverse/SubWallet-Extension/issues/3766)) and an
  update to the number/amount display rules
  ([#4236](https://github.com/Koniverse/SubWallet-Extension/issues/4236)).

These are kept as **one story** on purpose: every item is the same kind of work —
UI-consistency / responsive / display-polish on the shared experience layer,
fixed in the shared UI packages and verified across viewports and surfaces.
Splitting them would scatter identical logic across micro-stories and lose the
cross-platform verification that is the whole point.

This is a **retroactive / ongoing** hardening anchor: the shipped UI already
embodies most of these fixes; the story formalizes the rules they establish and
defends them against regression. `commit` / `version_shipped` are backfilled
during version reconciliation; per-issue fixes are credited as they land.

## Acceptance criteria

- [ ] **AC-1** — **Given** any core screen across the extension and web app,
  **When** the browser is rendered at zoom levels above 100% and on devices that
  previously showed border artifacts, **Then** the layout stays intact with no
  scaling break ([#1286](https://github.com/Koniverse/SubWallet-Extension/issues/1286)),
  no spurious borders ([#1345](https://github.com/Koniverse/SubWallet-Extension/issues/1345)),
  and no scroll-induced rendering glitches
  ([#3988](https://github.com/Koniverse/SubWallet-Extension/issues/3988)).
- [ ] **AC-2** — **Given** the responsive layout, **When** rendered at mobile and
  narrow viewports, **Then** mobile-UI screens present correctly
  ([#2141](https://github.com/Koniverse/SubWallet-Extension/issues/2141)) and
  list-bearing screens show complete information with no truncated or clipped
  rows ([#2832](https://github.com/Koniverse/SubWallet-Extension/issues/2832)).
- [ ] **AC-3** — **Given** the batched UI-bug sweeps for the extension
  ([#2568](https://github.com/Koniverse/SubWallet-Extension/issues/2568)) and the
  WebApp ([#3341](https://github.com/Koniverse/SubWallet-Extension/issues/3341)),
  **When** a shared screen is rendered on each surface, **Then** the reported
  defects no longer reproduce and the screen presents consistently across both,
  with only intended host-layer adaptations differing (AD-05).
- [ ] **AC-4** — **Given** the Confirmation screen and the number/amount display
  rules, **When** a confirmation is shown and amounts are formatted, **Then** the
  Confirmation UI matches the updated design
  ([#3766](https://github.com/Koniverse/SubWallet-Extension/issues/3766)) and
  numbers render per the updated display rules
  ([#4236](https://github.com/Koniverse/SubWallet-Extension/issues/4236))
  consistently wherever amounts appear.
- [ ] **AC-5** *(unhappy path)* — **Given** an extreme viewport or zoom (very
  small width, high zoom, long content list, very large or very small numeric
  value), **When** a screen renders, **Then** content degrades gracefully — it
  wraps, scrolls, ellipsizes, or applies the number rule — rather than
  overflowing, clipping, breaking layout, or mis-formatting; no regression of the
  symptoms in #1286 / #2832 / #4236.

## Tasks

- [ ] **TASK-6.6.1** — Fix scaling / rendering regressions: restore layout
  integrity above 100% zoom (#1286), eliminate device-specific border artifacts
  (#1345), and remove scroll-induced rendering glitches (#3988) (AC: 1)
- [ ] **TASK-6.6.2** — Harden responsive / mobile layout: land the round-2 mobile
  UI improvements (#2141) and fix screens displaying incomplete list info at
  narrow widths (#2832) (AC: 2, 5)
- [ ] **TASK-6.6.3** — Land the cross-surface UI bug sweeps for the extension
  (#2568) and the WebApp (#3341); keep platform-specific deviations in the
  host/UI layer, not in shared design tokens (AC: 3)
- [ ] **TASK-6.6.4** — Update the Confirmation screen UI (#3766) and apply the
  updated number/amount display rules wherever amounts render (#4236) (AC: 4, 5)
- [ ] **TASK-6.6.5** — Add cross-platform / responsive regression coverage that
  pins the reported symptoms (zoom, device borders, scroll, narrow-width lists,
  number formatting) so they do not silently return (AC: 1, 2, 3, 4, 5)

## Dev notes

### Architecture constraints

- [AD-05](../../ARCHITECTURE.md#architecture-decisions) — the design system is
  shared across delivery targets; UI-consistency, responsive, and display-rule
  fixes belong in the shared UI packages, and any platform-specific deviation
  stays in the host/UI layer, never in `extension-base`.
- This story does NOT introduce new AD entries — it hardens existing UI behavior
  under AD-05.

### Cross-story dependencies

- Builds on [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md) — it
  hardens the dark-only theme, the responsive breakpoints, and the popup/expand
  layout that story ships; every fix here lands in that shared shell.

### What we explicitly did NOT do

- No new user-facing UI capability — this is bug/iteration hardening only. New
  surfaces belong to their feature epics.
- No light theme — dark-only stays the product decision (US-6.1); none of these
  fixes reintroduce a theme toggle.
- No change to *how amounts are computed* — #4236 changes display/formatting
  rules only; currency-converted amounts remain owned by the balance epic
  ([EPIC-7](../epics/EPIC-7.md)).

### Points justification

5 pts — sized per SKILL §3a-bis as a multi-area production hardening story. Unlike
a single-concern 3-pt hardening anchor (cf.
[US-4.21](US-4.21-asset-hub-migration-hardening.md)), this story spans four
distinct UI facets across two delivery surfaces (extension + WebApp) — scaling /
rendering, responsive / mobile, cross-surface bug sweeps, and Confirmation /
number-display — each anchored to its own reported issues, plus cross-platform
regression coverage that must be verified at multiple viewports. That breadth
(nine issues, two surfaces, five tasks) calibrates at 5; it is intentionally not
split because every facet is the same UI-consistency / responsive / display-polish
work on the same shared layer, and the value is verifying them together.

### References

- [Issue #1286](https://github.com/Koniverse/SubWallet-Extension/issues/1286) — Extension breaks when scaling > 100%
- [Issue #1345](https://github.com/Koniverse/SubWallet-Extension/issues/1345) — Border bug on some devices
- [Issue #2568](https://github.com/Koniverse/SubWallet-Extension/issues/2568) — Fix some UI bug (extension)
- [Issue #3341](https://github.com/Koniverse/SubWallet-Extension/issues/3341) — Fix some UI bug (WebApp)
- [Issue #3988](https://github.com/Koniverse/SubWallet-Extension/issues/3988) — UI bug when scrolling
- [Issue #2141](https://github.com/Koniverse/SubWallet-Extension/issues/2141) — Improve UI for mobile (round 2)
- [Issue #2832](https://github.com/Koniverse/SubWallet-Extension/issues/2832) — Re-check screens displaying incomplete list info
- [Issue #3766](https://github.com/Koniverse/SubWallet-Extension/issues/3766) — Update UI for Confirmation screen
- [Issue #4236](https://github.com/Koniverse/SubWallet-Extension/issues/4236) — Update number display rules
- [Source: ARCHITECTURE AD-05](../../ARCHITECTURE.md#architecture-decisions) — shared UI across delivery targets

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: render core screens above 100% zoom, on the devices from #1345, and while scrolling → no scaling break, no border artifact, no scroll glitch (#1286 / #1345 / #3988) |
| AC-2 | Manual: render at mobile / narrow viewports → mobile screens correct (#2141), list screens show complete info, no truncated rows (#2832) |
| AC-3 | Manual: compare a shared screen on extension vs WebApp → #2568 / #3341 defects gone, consistent presentation, only host-layer adaptations differ |
| AC-4 | Manual: open the Confirmation screen and format amounts → matches updated design (#3766), numbers follow updated rules everywhere (#4236) |
| AC-5 | Manual: extreme viewport / zoom / long list / extreme numeric value → graceful degradation, no overflow/clip/mis-format; regression checks for #1286 / #2832 / #4236 pass |

## Changelog entry

### Fixed
- Extension no longer breaks when the browser is scaled above 100% (#1286).
- Removed device-specific border artifacts on affected hardware (#1345).
- Fixed UI rendering glitches that appeared while scrolling (#3988).
- Fixed screens that displayed incomplete list information at narrow widths (#2832).
- Resolved batched UI defects on the extension (#2568) and the WebApp (#3341).

### Changed
- Improved mobile UI layout, round 2 (#2141).
- Updated the Confirmation screen UI (#3766).
- Updated number/amount display rules across screens that render amounts (#4236).

**Commit**:

## Implementation notes

_Hardening story — re-grounded in real UI/UX issues (#1286, #1345, #2568, #3341,
#3988, #2141, #2832, #3766, #4236). Fill `commit` / `version_shipped` and credit
per-issue fix SHAs during version reconciliation._

## Files modified

_Filled during version reconciliation._

## Cross-references

- [Epic EPIC-6](../epics/EPIC-6.md)
- [US-6.1](US-6.1-dark-only-responsive-popup-and-expand-view.md)
- [Issue #1286](https://github.com/Koniverse/SubWallet-Extension/issues/1286) · [#1345](https://github.com/Koniverse/SubWallet-Extension/issues/1345) · [#2568](https://github.com/Koniverse/SubWallet-Extension/issues/2568) · [#3341](https://github.com/Koniverse/SubWallet-Extension/issues/3341) · [#3988](https://github.com/Koniverse/SubWallet-Extension/issues/3988) · [#2141](https://github.com/Koniverse/SubWallet-Extension/issues/2141) · [#2832](https://github.com/Koniverse/SubWallet-Extension/issues/2832) · [#3766](https://github.com/Koniverse/SubWallet-Extension/issues/3766) · [#4236](https://github.com/Koniverse/SubWallet-Extension/issues/4236)
- [ARCHITECTURE AD-05](../../ARCHITECTURE.md#architecture-decisions)
