---
id: US-9.22
title: "Runes & Ordinals on the extension (improvement on US-9.7)"
epic: EPIC-9
status: backlog
priority: P3
points: 1
sprint:
version_shipped:
prd_ref: []
arch_ref: [AD-25]
assignee:
commit:
created: 2026-07-22
updated: 2026-07-22
---

## Goal

Bring **Runes and Ordinals/inscriptions to the browser extension**
([#4246](https://github.com/Koniverse/SubWallet-Extension/issues/4246),
[#4295](https://github.com/Koniverse/SubWallet-Extension/issues/4295)) — the surface
[US-9.7](US-9.7-bitcoin-ordinals-display.md) shipped on the **WebApp** and not here. Both open
since April 2025, neither started.

## Status

> **📋 backlog — nothing here has shipped.** Both rows below are **open on the tracker**, and
> its one acceptance criterion is not ticked. `assignee`, `commit`, `sprint` and
> `version_shipped` stay empty until it ships.

## Scope

This is an **improvement story on a display one**. US-9.7 owns FR-91 and carries the shipped
inscription work — #2380 and #2399 on the WebApp in 1.1.36, plus the 2026 Bitcoin-API rounds
(#4991, #4997). These two issues ask for the same capability **on the extension**, which no
release delivers, so they moved here on 2026-07-22.

It materializes **no FR**. FR-91 is US-9.7's, and extending a shipped capability to another
surface earns its own FR only when someone specifies it — an ID is a promise that a document
exists ([D104](../../CONTEXT.md#d104-an-id-is-a-promise-that-a-document-exists--do-not-mint-one-for-an-intention)).

**#4246 and #4295 overlap and are deliberately not merged.** #4246 names *"Extension — Support
RUNE & Ordinal for Bitcoin"*; #4295 names *"Support showing Rune and Inscription"*. They may turn
out to be the same work — that is for whoever starts them to decide on the tracker, not for the
docs to decide by deleting a row.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#4246](https://github.com/Koniverse/SubWallet-Extension/issues/4246) | Extension — Support RUNE & Ordinal for Bitcoin | 📋 backlog |
| — | [#4295](https://github.com/Koniverse/SubWallet-Extension/issues/4295) | Support showing Rune and Inscription | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — A Bitcoin account holding Runes and inscriptions sees them in the **extension**, through the same media/gateway pipeline the WebApp surface uses ([AD-25](../../ARCHITECTURE.md#architecture-decisions)).

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 4246` · `gh issue view 4295` → both OPEN · manual: extension, Bitcoin account with Runes/inscriptions |

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.7](US-9.7-bitcoin-ordinals-display.md) · [consolidation note](../../notes/2026-07-17-epic-9-consolidation.md)
