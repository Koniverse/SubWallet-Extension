---
id: US-1.4
title: "Online i18n hot-update (runtime remote translations)"
epic: EPIC-1
status: ready
priority: P0
points: 3
sprint: sprint-2026-W28
version_shipped:
prd_ref: [FR-4]
arch_ref: [AD-25]
depends_on: [US-1.3]
assignee: frenkie-ng
commit:
created: 2026-06-12
updated: 2026-07-15
---

## Status refresh — 2026-07-15

> Synced from GitHub Projects board #2 ("SubWallet.App – Development"): issue #4746 is **Ready to Implement** there, so this story moves `backlog` → `ready` (sprint `sprint-2026-W28`). Only status/sprint changed; Goal, AC and reasoning below are untouched. The board is the live source for workflow state.

## Goal

Let the extension fetch updated UI translations from an online channel at
runtime, so a fixed or improved string reaches users **without shipping a new
release**, falling back to the bundled locale files when the channel is
unreachable. This closes the last release-gated content path: today a typo in a
translation waits for a store review; with this it ships the moment the override
is published.

## Background

All user-facing strings are authored in English first and translations are
**bundled per locale** in the extension package, loaded from
`locales/{lng}/translation.json` (NFR-13). That bundling is owned by
[EPIC-19](../epics/EPIC-19.md) (FR-153, the VI/ZH/JA/RU multi-language UI). What is
*missing* is a way to update those translations between releases — exactly the
release-free delivery problem the chain-list already solved
([US-1.3](US-1.3-online-chain-list-hot-update.md)).

This story applies the same cache / CDN proxy pattern
([AD-25](../../ARCHITECTURE.md#architecture-decisions)) to i18n: at runtime the UI
fetches a remote translation payload that *overrides* bundled keys, and on any
fetch failure it falls back to the bundled `locales/{lng}/translation.json`. The
online channel may only override an existing English-canonical key — it never
invents a new string — so the English source of truth (NFR-13) stays intact.

Materializes [FR-4](../../PRD.md#functional-requirements), which is **📋 planned** in the PRD — this is a
*forward* story, not retroactive: the online i18n channel is not yet shipped, so
there is no `commit` to backfill. It builds on the fetch/fallback helper
established by [US-1.3](US-1.3-online-chain-list-hot-update.md) and consumes the
bundled locales owned by [EPIC-19](../epics/EPIC-19.md).

Tracked by [#4560](https://github.com/Koniverse/SubWallet-Extension/issues/4560) —
Extension - Feature Request: Online i18n Management with Texterify Integration, and
[#4746](https://github.com/Koniverse/SubWallet-Extension/issues/4746) —
[i18n][Research] Technical study & documentation for online i18n.

## Acceptance criteria

- [ ] **AC-1** — **Given** a published remote translation payload for a locale,
  **When** the UI loads in that locale, **Then** the updated strings are applied
  at runtime **without an extension release** (AD-25).
- [ ] **AC-2** — **Given** the remote i18n channel is unreachable, **When** the
  UI renders, **Then** it falls back to the bundled
  `locales/{lng}/translation.json` and shows no missing/broken strings (NFR-13) —
  the network-failure unhappy path.
- [ ] **AC-3** — **Given** a remote payload, **When** it is merged, **Then** it
  may only **override existing keys** of the English-canonical set; an unknown
  key is ignored so the remote channel cannot inject untranslated/invalid UI
  strings.
- [ ] **AC-4** — **Given** background error messages, **When** they surface,
  **Then** they remain internationalized through the same key set (NFR-13).

## Tasks

- [ ] **TASK-1.4.1** — Add a runtime remote-translation fetch (AC: 1)
  - [ ] Fetch the per-locale override payload via the AD-25 static-data/cache channel; reuse the US-1.3 fetch helper.
- [ ] **TASK-1.4.2** — Bundled-locale fallback (AC: 2)
  - [ ] On unreachable/failed fetch, fall back to bundled `locales/{lng}/translation.json`.
- [ ] **TASK-1.4.3** — Override-only merge against the English-canonical key set (AC: 3)
  - [ ] Merge remote strings over existing keys only; drop unknown keys (NFR-13).
- [ ] **TASK-1.4.4** — Keep background error messages internationalized (AC: 4)

## Dev notes

### Architecture constraints

- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — i18n hot-update rides the same static-data / cache proxy + bundled-fallback pattern as the chain-list (US-1.3).
- English-canonical rule (NFR-13): the remote channel overrides existing keys only; it does not become a second source of truth.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-1.3](US-1.3-online-chain-list-hot-update.md) — reuses the AD-25 fetch + bundled-fallback helper rather than rebuilding it.
- Consumes the bundled per-locale files owned by [EPIC-19](../epics/EPIC-19.md) (FR-153); this story adds only the *online override* layer on top.

### What we explicitly did NOT do

- No new bundled languages — that is FR-153 / [EPIC-19](../epics/EPIC-19.md). This story only adds the runtime override channel for languages that already ship.
- No translation-authoring tooling/CMS — out of scope; the channel consumes a published payload.

### References

- [Source: PRD FR-4](../../PRD.md#functional-requirements) — online i18n hot-update (planned)
- [Source: PRD NFR-13](../../PRD.md#non-functional-requirements) — English-canonical i18n, bundled per-locale, planned online hot-update
- [Source: PRD FR-153](../../PRD.md#functional-requirements) — bundled multi-language UI (EPIC-19, the language set this overrides)
- [Source: ARCHITECTURE AD-25](../../ARCHITECTURE.md#architecture-decisions)
- [Roadmap: #4560](https://github.com/Koniverse/SubWallet-Extension/issues/4560) — Online i18n Management with Texterify Integration
- [Roadmap: #4746](https://github.com/Koniverse/SubWallet-Extension/issues/4746) — [i18n][Research] Technical study & documentation for online i18n

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Publish a remote override for a locale; reload the UI in that locale → updated strings appear without rebuilding the extension |
| AC-2 | Block the i18n channel host; reload → UI renders bundled `locales/{lng}/translation.json` with no missing strings |
| AC-3 | Serve a payload containing an unknown key; confirm it is ignored and only existing keys are overridden |
| AC-4 | Trigger a background error in a non-English locale; confirm the message is internationalized |

## Changelog entry

### Added
- Online i18n hot-update: runtime fetch of per-locale translation overrides via the static-data / cache channel, falling back to bundled `locales/{lng}/translation.json`.

**Commit**:

## Implementation notes

_Forward (planned) story — FR-4 is not yet shipped. Fill `commit` /
`version_shipped` when implemented._

## Cross-references

- [PRD FR-4](../../PRD.md#functional-requirements)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [ARCHITECTURE AD-25](../../ARCHITECTURE.md#architecture-decisions)
- [US-1.3](US-1.3-online-chain-list-hot-update.md)
- [EPIC-19](../epics/EPIC-19.md)
- [#4560](https://github.com/Koniverse/SubWallet-Extension/issues/4560)
- [#4746](https://github.com/Koniverse/SubWallet-Extension/issues/4746)
