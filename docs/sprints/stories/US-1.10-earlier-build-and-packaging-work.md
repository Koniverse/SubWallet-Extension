---
id: US-1.10
title: "Earlier build & packaging work (2023–2025)"
epic: EPIC-1
status: done
priority: P3
points: 1
sprint: sprint-2023-M06
version_shipped: 1.1.36
prd_ref: []
assignee:
commit:
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Hold the build and packaging work that **shipped before the current hardening scope was written** —
removing `webRequest` from the manifest, the WebApp build number, and the Firefox CORS fix. Three
issues, all settled.

## Status

> **✅ done — all three rows below are settled.** It carries **no FR**: NFR-8 / NFR-9 / NFR-19 are
> defended by [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md), whose own scope is
> still open. `version_shipped: 1.1.36` is a **representative anchor** — the most recent constituent
> with a provable release.

## Scope

Created under [AGENTS.md](../../../AGENTS.md) rule 9. These three sat in US-1.5's table beside the
eight **open** items its acceptance criteria name. No AC of that story names any of these three.

**The table follows the acceptance criteria** — whichever side the ACs name is the side that stays.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| 1.0.6 | [#1406](https://github.com/Koniverse/SubWallet-Extension/issues/1406) | Try to remove `webRequest` from the manifest | ✅ done |
| 1.1.36 | [#2231](https://github.com/Koniverse/SubWallet-Extension/issues/2231) | WebApp — update build number | ✅ done |
| — | [#3992](https://github.com/Koniverse/SubWallet-Extension/issues/3992) | WebApp — fix the CORS bug on Firefox (extension and WebApp) | ✅ done |

> **#3992 fixed a defect that came back.** [#1934](https://github.com/Koniverse/SubWallet-Extension/issues/1934), the same Firefox cross-origin block,
> is `OPEN / REOPENED` and lives in
> [US-1.8](US-1.8-firefox-cors-follow-up-and-dev-build-test-tooling.md). A done row and a reopened
> row for one defect class in a single table would read as solved, which is why they are apart.

## Acceptance criteria

- [x] **AC-1** — All three issues above are closed on the tracker with board `Status = Done`, and each carries the release the evidence supports or `—` where none exists.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 1406` `2231` `3992` → all CLOSED · board `Status` per [rule 12](../../../AGENTS.md) |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md) · [US-1.8](US-1.8-firefox-cors-follow-up-and-dev-build-test-tooling.md) · [consolidation note](../../notes/2026-07-22.md#h-scope-that-never-reached-a-table)
