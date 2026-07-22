---
id: US-1.9
title: "Out-of-repo tooling not yet started (improvement on US-1.6)"
epic: EPIC-1
status: backlog
priority: P3
points: 1
sprint:
version_shipped:
prd_ref: []
assignee:
commit:
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Hold the two **out-of-repo platform items that were never started** — the ChainList page
([#2131](https://github.com/Koniverse/SubWallet-Extension/issues/2131)) and a cross-platform
tracking dashboard ([#2529](https://github.com/Koniverse/SubWallet-Extension/issues/2529)).
Open since 2023-11 and 2024-01.

## Scope

This is the **unfinished half of [US-1.6](US-1.6-platform-operations-and-out-of-repo-tooling.md)**,
split out on 2026-07-22 so that story records only settled work. Like its parent it materializes
**no FR**, and it never will — an FR describes what the *wallet* does, and neither of these is in
the wallet. It carries **no `version_shipped`**: a release of this extension delivers neither a
website nor a dashboard.

**Why these two and not the other four.** US-1.6's remaining rows are settled — a support system
and two deploys `done`, one middleware proposal closed not-planned. These two are `OPEN` with no
work recorded against them anywhere. Keeping settled and unstarted work in one table is what let
US-1.1 read `done` while holding an unstarted issue; this split applies the same correction one
story over.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#2131](https://github.com/Koniverse/SubWallet-Extension/issues/2131) | Build the ChainList page *(separate repo — SubWallet-ChainList)* | 📋 backlog |
| — | [#2529](https://github.com/Koniverse/SubWallet-Extension/issues/2529) | Build a tracking dashboard across platforms | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — Both issues above are **open and unstarted**, and **neither carries a `version_shipped`** — no release of this extension delivers out-of-repo tooling.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 2131` · `gh issue view 2529` → both OPEN · `grep -c "^version_shipped: .\+"` on this file → 0 |

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md) · [US-1.6](US-1.6-platform-operations-and-out-of-repo-tooling.md) · [consolidation note](../../notes/2026-07-22-epic-1-consolidation.md)
