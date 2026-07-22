---
id: US-1.8
title: "Firefox CORS follow-up & dev-build test tooling (improvement on US-1.5)"
epic: EPIC-1
status: backlog
priority: P3
points: 1
sprint:
version_shipped:
prd_ref: []
assignee: saltict
commit:
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Close the two build-and-packaging items [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md)
did not deliver: the **Firefox cross-origin block that was reopened after its fix**
([#1934](https://github.com/Koniverse/SubWallet-Extension/issues/1934)) and a way to **test a
development build inside the Koni browser runner**
([#4602](https://github.com/Koniverse/SubWallet-Extension/issues/4602)). Both open, neither
started.

## Status

> **📋 backlog — nothing here has shipped.** Both rows below are **open on the tracker**, and
> none of the 2 acceptance criteria is ticked. `assignee`, `commit`, `sprint` and
> `version_shipped` stay empty until it ships.

## Scope

This is an **improvement story on a hardening one**. US-1.5 carries the shipped build/CI work; its
two open rows moved here on 2026-07-22 so that story can pass its done-pass on what it actually
delivered. It materializes **no FR** — US-1.5 defends NFR-8 / NFR-9 / NFR-19 and keeps them — and
it carries no `version_shipped` until it ships.

**#1934 is a reopen, not a fresh report.** The tracker records it `OPEN / REOPENED`. US-1.5's
table already holds [#3992](https://github.com/Koniverse/SubWallet-Extension/issues/3992)
*"WebApp — fix CORS bug on Firefox (extension and WebApp)"* as `done`, so the fix landed and the
symptom came back. **That is the fact this story exists to keep visible** — a done row and a
reopened row for the same defect class, sitting in one table, read as "solved".

The two issues are grouped because both are Firefox/packaging follow-ups on the same build
surface, not because they are the same defect: **#1934 is a runtime CORS behaviour**, **#4602 is
test tooling**. Either may leave for its own story once someone starts it.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#1934](https://github.com/Koniverse/SubWallet-Extension/issues/1934) | Handling the Cross-Origin Request Blocked on the Firefox browser *(reopened)* | 📋 backlog |
| — | [#4602](https://github.com/Koniverse/SubWallet-Extension/issues/4602) | Add logic for testing a development build with the Koni Browser Runner | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — The Firefox cross-origin block reported in #1934 no longer reproduces on a current build, and the regression that reopened it after #3992 is covered by a check.
- [ ] **AC-2** — A development build can be loaded and exercised in the Koni Browser Runner through a documented, repeatable procedure (#4602).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 1934` → state · manual: load the extension on Firefox and exercise the blocked request path |
| AC-2 | `gh issue view 4602` → state · run the documented dev-build procedure end to end |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.5](US-1.5-build-ci-and-cross-browser-packaging-hardening.md) · [consolidation note](../../notes/2026-07-22-epic-1-consolidation.md)
