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

## Cross-references

- [PRD FR-63](../../PRD.md#functional-requirements)
- [Epic EPIC-6](../epics/EPIC-6.md)
- [US-6.4](US-6.4-settings-management.md)
- [US-6.6](US-6.6-design-system-and-ux-hardening.md)
