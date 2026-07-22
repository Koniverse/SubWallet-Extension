---
id: US-5.11
title: "Two-factor authentication for outgoing transfers"
epic: EPIC-5
status: backlog
priority: P3
points: 1
sprint: 
version_shipped: 
prd_ref: []
assignee: 
commit: 
created: 2026-07-21
updated: 2026-07-21
---

## Goal

Add a **second authentication factor** in front of value leaving the wallet — 2FA verification,
and Google authentication for any crypto sent out ([#4125](https://github.com/Koniverse/SubWallet-Extension/issues/4125)).
Open, not started.

## Status

> **📋 backlog — nothing here has shipped.** The single row below is **open on the tracker**, and
> its one acceptance criterion is not ticked. `assignee`, `commit`, `sprint` and
> `version_shipped` stay empty until it ships.

## Scope

This is a **consolidated maintenance story**: it groups 1 tracker issue into one capability with a
clear boundary, replacing the former one-issue-per-story ledger. It materializes **no FR** — the
EPIC-5 requirement set is [US-5.1](US-5.1-phishing-site-and-address-protection.md)…[US-5.9](US-5.9-anti-scam-address-screening.md)
— and the PRD has not scoped this capability, so it earns an FR only when it is specified. Full
issue→story traceability is the table below and the
[consolidation note](../../notes/2026-07-21.md). **Not yet delivered** —
`assignee` / `commit` / `sprint` / `version_shipped` stay empty until it ships; `points: 1` marks
it as one backfill record.

It is distinct from the epic's two planned screening stories: [US-5.8](US-5.8-blockaid-transaction-risk-scanning.md)
and [US-5.9](US-5.9-anti-scam-address-screening.md) both judge *whether a transaction is safe*
from outside data. This one judges *whether the person approving it is the owner* — a second
factor, not a risk score. The master password ([US-5.2](US-5.2-master-password-and-strength-policy.md))
is today the only such gate, and it is single-factor.

> **Open design question, not a decision:** a browser-extension wallet is non-custodial, so a
> second factor cannot be enforced server-side without changing that property — a local TOTP check
> is bypassable by anyone holding the encrypted vault. The issue records the request; how (or
> whether) to satisfy it without weakening [AD-04](../../ARCHITECTURE.md#architecture-decisions)
> is unanswered and is an owner decision, not a docs one ([AGENTS.md](../../../AGENTS.md) rule 3).

## Incremental work, fixes & chores

Chronological by shipped release; `—` = not shipped. The former one-issue-per-story id (retired,
never reused — [AGENTS.md](../../../AGENTS.md) rule 1) is listed in the
[consolidation note](../../notes/2026-07-21.md).

| Shipped | Issue | Title | Status |
|---|---|---|---|
| — | [#4125](https://github.com/Koniverse/SubWallet-Extension/issues/4125) | Add another security layer — 2FA verification, Google authentication for outgoing transfers | 📋 backlog |

## Acceptance criteria

- [ ] **AC-1** — This capability is **open** — 1 issue tracked below, not yet started. No release delivers it.

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md) · [US-5.2](US-5.2-master-password-and-strength-policy.md) · [US-5.8](US-5.8-blockaid-transaction-risk-scanning.md) · [US-5.9](US-5.9-anti-scam-address-screening.md) · [consolidation note](../../notes/2026-07-21.md)
