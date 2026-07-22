---
id: US-9.25
title: "NFT display & UI open defects (improvement on US-9.10)"
epic: EPIC-9
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

Carry the five NFT display and transfer defects [US-9.10](US-9.10-nft-display-and-transfer-hardening.md)
records but has not fixed — an error page, a transfer message, a chain-specific display failure on
Firefox, a wrong amount on confirmation, and import validation.

## Status

> **📋 backlog — none of the five has started.** All are **open** on the tracker; the `Status`
> column is the Projects board's ([AGENTS.md](../../../AGENTS.md) rule 12). No release delivers any
> of them.

## Scope

Created under [AGENTS.md](../../../AGENTS.md) rule 9. US-9.10 holds **24 settled** display and UI
fixes spanning 0.3.3 → 1.3.3; these five were cited in its references and belonged to no row. Adding
them there would have mixed 24 shipped rows with 5 open ones in one table.

**US-9.10's acceptance criteria are generic hardening statements**, not one-per-issue, so neither
side is AC-bound. The canonical direction of rule 9 applies: **the settled work stays in the story
that shipped it, and the open work becomes an improvement story on it.**

It materializes **no FR** — US-9.10 defends FR-85 / FR-89 / FR-92 and keeps them.

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#2124](https://github.com/Koniverse/SubWallet-Extension/issues/2124) | WebApp — error page when opening NFT detail | 📋 backlog |
| — | [#2946](https://github.com/Koniverse/SubWallet-Extension/issues/2946) | Extension — update the message when transferring an NFT | 📋 backlog |
| — | [#3030](https://github.com/Koniverse/SubWallet-Extension/issues/3030) | Extension — do not show Kusama Asset Hub NFTs on Firefox | 📋 backlog |
| — | [#3241](https://github.com/Koniverse/SubWallet-Extension/issues/3241) | WebApp — incorrect amount on the transaction confirmation for an NFT transfer | 📋 backlog |
| — | [#4859](https://github.com/Koniverse/SubWallet-Extension/issues/4859) | Extension — improve validation when importing an NFT | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — Each defect above no longer reproduces on its reported surface, or the issue is closed with the reason recorded.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 2124` `2946` `3030` `3241` `4859` → state for each |

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.10](US-9.10-nft-display-and-transfer-hardening.md) · [US-9.23](US-9.23-webapp-address-display-and-validation-round-2.md) · [consolidation note](../../notes/2026-07-22.md#h-scope-that-never-reached-a-table)
