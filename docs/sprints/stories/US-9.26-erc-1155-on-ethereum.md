---
id: US-9.26
title: "ERC-1155 on Ethereum (improvement on US-9.4)"
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

Extend ERC-1155 support to **Ethereum** ([#4881](https://github.com/Koniverse/SubWallet-Extension/issues/4881)) — the chain
[US-9.4](US-9.4-erc-1155-nft-support.md) did not reach when the standard shipped on RARI.

## Status

> **📋 backlog — not started.** Its single tracker issue is **open**, `In Backlog` on the board, and
> no release delivers it.

## Scope

Created under [AGENTS.md](../../../AGENTS.md) rule 9. US-9.4 carries #3726, *"Support ERC-1155
(RARI chain)"*, shipped in **1.3.5**; #4881 asks for the same standard on Ethereum and has not
started. Putting both in one table would mix a shipped row with an open one.

It materializes **no FR** — FR-88 is owned by US-9.4. Extending a shipped capability to another
chain earns its own FR only when someone specifies it
([D104](../../CONTEXT.md#d104-an-id-is-a-promise-that-a-document-exists--do-not-mint-one-for-an-intention)).

## Incremental work, fixes & chores

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#4881](https://github.com/Koniverse/SubWallet-Extension/issues/4881) | Extension — add support for the ERC-1155 token standard for NFTs on Ethereum | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — An account holding ERC-1155 NFTs on Ethereum sees them, and can transfer them, through the same `EvmNftHandler` branch RARI uses.

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | `gh issue view 4881` → state · manual: Ethereum account holding an ERC-1155 collection |

## Cross-references

- [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.4](US-9.4-erc-1155-nft-support.md) · [consolidation note](../../notes/2026-07-22.md#h-scope-that-never-reached-a-table)
