---
id: US-1.7
title: "Firefox background-lifecycle recheck (improvement on US-1.1)"
epic: EPIC-1
status: backlog
priority: P3
points: 1
sprint:
version_shipped:
prd_ref: []
assignee: Thiendekaco
commit:
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Recheck **when Firefox stops the background page** and whether the MV3 background delivered by
[US-1.1](US-1.1-mv3-service-worker-background.md) survives it
([#3222](https://github.com/Koniverse/SubWallet-Extension/issues/3222)). Open, not started.

## Status

> **📋 backlog — nothing here has shipped.** The single row below is **open on the tracker**, and
> its one acceptance criterion is not ticked. `assignee`, `commit`, `sprint` and
> `version_shipped` stay empty until it ships.

## Scope

This is an **improvement story on a shipped one**. US-1.1 shipped the MV3 service-worker
background in **1.2.7** and is `done`; this issue asks for something it did not deliver and has
been open since 2024-06-24. It materializes **no FR** — FR-1 is owned by US-1.1 — and it carries
no `version_shipped` until it ships.

**Why it is its own story and not a row in US-1.1.** A `done` story may not carry unfinished
work: [AGENTS.md](../../../AGENTS.md) rule 4 already forbids a `done` story an unticked AC, and an
open row in its incremental-work table is the same claim through a different field. Until
2026-07-22 this issue sat inside US-1.1, which read `✅ done @ 1.2.7` while holding work nobody
had started.

**What is genuinely unknown here.** Firefox has run on **MV2** since `5c46c04e2e` (2024-08-21,
released 1.2.28), so it has a persistent background page, not a service worker — the issue predates
that switch by two months. Whether the reported symptom still exists on the MV2 path is exactly
what the recheck must establish; this story does not assume either answer.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#3222](https://github.com/Koniverse/SubWallet-Extension/issues/3222) | Extension — recheck the time the background stops on the Firefox browser | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — The Firefox background-stop timing is measured on the current MV2 build, the result is recorded on #3222, and either the issue is closed as no-longer-reproducing or a defect story is opened with the measurement attached.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 3222` → state and the recorded measurement · `git show 5c46c04e2e --stat` → the MV2 switch this recheck runs against |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.1](US-1.1-mv3-service-worker-background.md) · [consolidation note](../../notes/2026-07-22.md#b-epic-22-maintenance--build--platform-merged-into-epic-1)
