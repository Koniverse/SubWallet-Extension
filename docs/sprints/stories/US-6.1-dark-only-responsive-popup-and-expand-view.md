---
id: US-6.1
title: "Dark-only responsive UI: popup and full-page expand view"
epic: EPIC-6
status: done
priority: P2
points: 3
sprint: sprint-2023-M03
version_shipped: 1.0.1
prd_ref: [FR-63]
arch_ref: [AD-05]
depends_on:
assignee: lw-cdm
commit: 973e1606114374148925b0d5868c263211251134, 659c3e2890ce58d50502d5cf66dced25f60658bb, ad2567d9ae57b640d85cf6b2cecd69e05e08fd53
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Give the wallet one coherent shell that every screen renders into: a single
dark-only theme and a responsive layout that adapts between the constrained
extension popup and the roomy full-page expand view. Downstream feature epics
stop re-solving theming and layout — they render into this shell and inherit
both for free.

## Status

> **✅ done — shipped in 1.0.1.** All acceptance criteria are ticked and the 22 rows below are
> settled, 19 of them with a release. The 1.0.2 design-system rewrite that replaced this layer's
> internals is [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md); what stays here is the **surface
> itself** — popup, expand view, and the browsers they run in.

## Background

This is the foundation of the experience layer: before it exists, every screen
re-invents its own colors, spacing, and breakpoints. FR-63 settles two product
decisions at once. First, the theme is **dark-only**: a `ThemeNames` enum exists
with `DARK` (default) and `LIGHT`, but the theme selector is **hidden in
Settings** — light is not user-selectable, so the design system optimizes for a
single palette rather than dual-theme parity. Second, the same UI must render in
two very different viewports — the narrow extension popup and the full-page
"expand view" — so the layout is **responsive**, not two separate code paths.

The shared UI lives in `@subwallet/extension-koni-ui` and is consumed by every
delivery target ([AD-05](../../ARCHITECTURE.md#architecture-decisions)), so the
design tokens and responsive rules defined here propagate to the web app
([US-6.2](US-6.2-web-app-feature-parity.md)) and the mobile web-runner
([US-6.3](US-6.3-mobile-web-runner-webview.md)) without duplication.

Materializes [FR-63](../../PRD.md#functional-requirements). This story is **retroactive** — the
capability already ships in the product; `commit` / `version_shipped` are
backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** any screen in the wallet, **When** it renders,
  **Then** it uses the dark theme palette and design tokens from
  `@subwallet/extension-koni-ui` (no per-screen ad-hoc colors).
- [x] **AC-2** — **Given** the same UI opened as the constrained extension popup
  versus the full-page expand view, **When** the viewport changes, **Then** the
  layout adapts responsively from a single code path (no popup-only / page-only
  duplicate screens).
- [x] **AC-3** — **Given** the Settings screen, **When** the user looks for a
  theme/appearance toggle, **Then** no user-selectable light-theme option is
  exposed (theme selector hidden — FR-63).
- [x] **AC-4** — **Given** the popup is open and the user triggers "expand",
  **When** the full page opens, **Then** the same route renders with the wider
  layout and no state is lost in the transition.

## Tasks

- [x] **TASK-6.1.1** — Define the dark-only theme palette + design tokens and
  wire the theme provider (AC: 1)
  - [x] Confirm `ThemeNames.DARK` is the applied default in
    `packages/extension-koni-ui/src/themes.ts` / `ThemeContext.tsx`.
- [x] **TASK-6.1.2** — Implement the responsive popup ↔ expand-view layout from a
  single component tree (AC: 2, 4)
  - [x] Verify the expand-view entry point reuses the popup routes at a wider
    breakpoint rather than a parallel screen set.
- [x] **TASK-6.1.3** — Hide the theme selector in Settings so light is not
  user-selectable (AC: 3)
- [x] **TASK-6.1.4** — Verify state continuity across the popup → expand
  transition (AC: 4)

## Dev notes

### Architecture constraints

- [AD-05](../../ARCHITECTURE.md#architecture-decisions) — the design system lives
  in the shared `@subwallet/extension-koni-ui` package so every delivery target
  inherits it; do not fork theme/layout per platform.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Required by [US-6.2](US-6.2-web-app-feature-parity.md) and
  [US-6.3](US-6.3-mobile-web-runner-webview.md) — both reuse the theme tokens and
  responsive rules defined here (web app via `extension-web-ui`, mobile via
  `extension-koni-ui`).
- Sibling [US-6.4](US-6.4-settings-management.md) — owns the Settings screen
  where the theme selector is hidden (AC-3); coordinate that surface.
- Hardened by [US-6.6](US-6.6-design-system-and-ux-hardening.md) — that story
  owns cross-platform breakpoint / token regression coverage.

### References

- [Source: PRD FR-63](../../PRD.md#functional-requirements) — dark-only UI + responsive popup and full-page expand view
- [Source: ARCHITECTURE AD-05](../../ARCHITECTURE.md#architecture-decisions) — shared UI package across delivery targets
- [Source: code] `packages/extension-koni-ui/src/themes.ts`, `ThemeContext.tsx`; `ThemeNames` enum in `packages/extension-base/src/background/KoniTypes.ts`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: open any screen → dark palette applied; grep `ThemeNames.DARK` default in `packages/extension-koni-ui/src/themes.ts` |
| AC-2 | Manual: resize / open as popup vs expand → single layout adapts responsively |
| AC-3 | Manual: Settings → no theme/appearance toggle is shown |
| AC-4 | Manual: open popup on a route → expand → same route renders wide, state preserved |

## Changelog entry

### Added
- Dark-only design system (theme tokens + provider) shared across all delivery targets.
- Responsive popup ↔ full-page expand-view layout from a single component tree.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Incremental work, fixes & chores

**22 tracker issues** landed on the shared surface — 19 with a release, 3 delivered with no line
naming them. Folded in from the former one-issue-per-story maintenance ledger (2026-07-23).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 0.4.1 | [#228](https://github.com/Koniverse/SubWallet-Extension/issues/228) | Do not update theme when change theme from popup view | ✅ done |
| 0.4.2 | [#224](https://github.com/Koniverse/SubWallet-Extension/issues/224) | Tooltip not showing on the popup view on firefox browser | ✅ done |
| 0.4.2 | [#258](https://github.com/Koniverse/SubWallet-Extension/issues/258) | Bug Style | ✅ done |
| 0.7.3 | [#830](https://github.com/Koniverse/SubWallet-Extension/issues/830) | Do not show tooltip on the Firefox browser | ✅ done |
| 1.0.5 | [#1336](https://github.com/Koniverse/SubWallet-Extension/issues/1336) | UI bug when scroll wallet | ✅ done |
| 1.0.5 | [#1393](https://github.com/Koniverse/SubWallet-Extension/issues/1393) | Do not show the Result screen after performing transaciton on the Firefox browser | ✅ done |
| 1.0.5 | [#1394](https://github.com/Koniverse/SubWallet-Extension/issues/1394) | Fix the "All accounts" on top in the List account (Firefox browser) | ✅ done |
| 1.0.11 | [#1229](https://github.com/Koniverse/SubWallet-Extension/issues/1229) | Update UI for expand view | ✅ done |
| 1.0.12 | [#1569](https://github.com/Koniverse/SubWallet-Extension/issues/1569) | UI bugs on the expand view | ✅ done |
| 1.1.2 | [#1243](https://github.com/Koniverse/SubWallet-Extension/issues/1243) | Sync configuration between expand view and popup view | ✅ done |
| 1.1.2 | [#1507](https://github.com/Koniverse/SubWallet-Extension/issues/1507) | UI bugs on the Firefox browser | ✅ done |
| 1.1.2 | [#1548](https://github.com/Koniverse/SubWallet-Extension/issues/1548) | UI bugs | ✅ done |
| 1.1.13 | [#1857](https://github.com/Koniverse/SubWallet-Extension/issues/1857) | Add the button on the empty list | ✅ done |
| 1.1.29 | [#2203](https://github.com/Koniverse/SubWallet-Extension/issues/2203) | WebApp \| Extension - Fix some UI bug (Round 1) | ✅ done |
| 1.1.36 | [#1238](https://github.com/Koniverse/SubWallet-Extension/issues/1238) | Display multi window in case multi request | ✅ done |
| 1.1.38 | [#2449](https://github.com/Koniverse/SubWallet-Extension/issues/2449) | Extension - Fix some UI bug | ✅ done |
| 1.2.7 | [#3202](https://github.com/Koniverse/SubWallet-Extension/issues/3202) | Extension - Add popup to remind user upgrade Firefox version | ✅ done |
| 1.2.10 | [#3131](https://github.com/Koniverse/SubWallet-Extension/issues/3131) | Extension - Screen flickering error when interacting with extensions | ✅ done |
| 1.3.37 | [#4023](https://github.com/Koniverse/SubWallet-Extension/issues/4023) | Extension - Turn off the update manifest v3 popup | ✅ done |
| — | [#70](https://github.com/Koniverse/SubWallet-Extension/issues/70) | Does not automatically turn off popup | ✅ done |
| — | [#566](https://github.com/Koniverse/SubWallet-Extension/issues/566) | Restyle Error screen | ✅ done |
| — | [#947](https://github.com/Koniverse/SubWallet-Extension/issues/947) | UI Bug when zoom in/ zoom out browser | ✅ done |

> **Firefox is a recurring cost with no feature behind it.** #224 (tooltip does not show on the
> popup view), #830 (do not show the tooltip on Firefox at all), #1393 (a Firefox bug), and #3202 —
> a popup asking the user to *upgrade their Firefox version*. Four of these 22 rows are one browser
> disagreeing with the popup surface.
>
> **The popup and the expand view drift apart, repeatedly.** #1229 (update the UI for expand view),
> #1243 (sync configuration between expand and popup), #1569 (UI bugs on the expand view), #1238
> (multiple windows for multiple requests), #1269 in
> [US-6.7](US-6.7-the-1-0-2-ui-upgrade-programme.md) (wrong popup size on Windows). One layout,
> several hosts — which is exactly what this story's acceptance criteria claim, and what these rows
> record it costing.
>
> **#4023 turns a popup off.** *"Turn off the update manifest v3 popup"* (1.3.37) is the MV3
> migration ([EPIC-20](../epics/EPIC-20.md)) leaving a message behind in this surface after it was
> no longer true.

## Cross-references

- [PRD FR-63](../../PRD.md#functional-requirements)
- [Epic EPIC-6](../epics/EPIC-6.md)
- [US-6.4](US-6.4-settings-management.md)
- [US-6.6](US-6.6-design-system-and-ux-hardening.md)
- [consolidation note](../../notes/2026-07-23.md#d-epic-26-maintenance--ui--ux-merged-into-epic-6)
