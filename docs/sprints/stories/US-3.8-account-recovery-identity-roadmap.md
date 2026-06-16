---
id: US-3.8
title: "Account recovery & identity (roadmap)"
epic: EPIC-3
status: backlog
priority: P3
points: 8
sprint:
version_shipped:
prd_ref: [FR-28, FR-29, FR-30]
arch_ref: [AD-04, AD-11]
depends_on: [US-3.5, US-2.1]
assignee:
commit:
created: 2026-06-11
updated: 2026-06-11
---

## Goal

Look past the seed-phrase-only recovery model: give users socially-recoverable
accounts, scoped session keys for dApps, and a decentralized identity they can
transact under — so that losing a backup is no longer catastrophic and an
account becomes a portable, delegable identity rather than just a key. This is a
**roadmap placeholder** that reserves the FR numbering and records the intended
shape; none of it ships yet.

## Background

This story is a **forward / planned roadmap bundle** — all three FRs are
`📋 planned` in the [PRD](../../PRD.md#functional-requirements), so the whole story is forward-looking,
not retroactive:

- **Social recovery ([FR-28](../../PRD.md#functional-requirements))** — recover account access through
  designated guardians instead of (or alongside) a seed backup.
- **Session keys ([FR-29](../../PRD.md#functional-requirements))** — issue scoped, time-/permission-
  limited keys so a dApp can act without the master key.
- **Decentralized identity ([FR-30](../../PRD.md#functional-requirements))** — DID integration (e.g.
  KILT) and DID-based transactions.

These are bundled into one numbered story to **reserve FR-28/29/30 under a single
roadmap ID** while the epic is locked; when any of them is scheduled, it will be
**split into its own implementation story** (per the §3a-bis splitting rule)
rather than built from this bundle. The bundle exists to hold the numbering and
the cross-cutting constraints, not to be implemented as a single unit.

Whatever ships here must still honor the [EPIC-3](../epics/EPIC-3.md) invariants:
key/recovery material stays in the background keyring
([AD-04](../../ARCHITECTURE.md#architecture-decisions)) and never crosses to the
UI ("no key on the message bus"), and recovery must not weaken the deterministic,
self-custodial guarantees of the Unified Account model
([AD-11](../../ARCHITECTURE.md#architecture-decisions)).

Reserves [FR-28](../../PRD.md#functional-requirements), [FR-29](../../PRD.md#functional-requirements) and [FR-30](../../PRD.md#functional-requirements).
**Forward / planned — nothing here is shipped.**

Tracked by [#1210](https://github.com/Koniverse/SubWallet-Extension/issues/1210) —
Integration Social recovery for SubWallet (FR-28),
[#618](https://github.com/Koniverse/SubWallet-Extension/issues/618) — Add session
keys feature (FR-29), and
[#3277](https://github.com/Koniverse/SubWallet-Extension/issues/3277) — Add support
for DID-based transactions within the wallet (FR-30).

## Acceptance criteria

> All ACs below are **forward-looking targets**, not yet runnable. Each will move
> into its own split story when scheduled.

- [ ] **AC-1** *(forward — FR-28)* — **Given** a user with designated guardians,
  **When** they trigger social recovery, **Then** account access is restored
  through the guardian quorum without exposing the seed, and without weakening the
  self-custodial model (AD-11).
- [ ] **AC-2** *(forward — FR-29)* — **Given** an issued session key with a
  defined scope and lifetime, **When** a dApp uses it, **Then** it can act only
  within that scope and expires as configured; key material stays in the
  background (AD-04).
- [ ] **AC-3** *(forward — FR-30)* — **Given** DID integration, **When** the user
  binds a DID (e.g. KILT) and transacts under it, **Then** DID-based transactions
  resolve and sign correctly.
- [ ] **AC-4** *(forward — abuse path)* — **Given** an unauthorized recovery
  attempt, an out-of-scope session-key call, or an unverifiable DID, **When** it
  is submitted, **Then** it is rejected and no account state changes.

## Tasks

> Tasks are roadmap placeholders. Each FR is split into its own story before
> implementation.

- [ ] **TASK-3.8.1** *(forward)* — Social recovery design + guardian quorum (AC: 1, 4)
- [ ] **TASK-3.8.2** *(forward)* — Session keys: scoped, time-limited delegation (AC: 2, 4)
- [ ] **TASK-3.8.3** *(forward)* — DID integration (e.g. KILT) + DID-based txs (AC: 3, 4)
- [ ] **TASK-3.8.4** *(forward)* — Split this bundle into per-FR implementation stories when scheduled

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — any recovery / session
  / DID key material stays in the background keyring; nothing on the message bus.
- [AD-11](../../ARCHITECTURE.md#architecture-decisions) — recovery and identity
  must not break the deterministic, single-seed, self-custodial guarantees.
- These features will likely introduce **new AD entries** (recovery model,
  session-key delegation, DID resolution) — to be authored in CONTEXT.md when the
  per-FR stories are scheduled. This roadmap bundle does NOT introduce them yet.

### Cross-story dependencies

- Builds on [US-3.5](US-3.5-the-unified-account-model.md) — recovery and identity
  operate on the Unified Account model.
- Builds on US-2.1 (keyring engine) — recovery / session material is custodied by
  the keyring.
- May intersect EPIC-5 (security) for the master-password / lock policy and
  EPIC-8 / EPIC-2 for signing under session keys and DIDs.

### What we explicitly did NOT do

- **Nothing in FR-28/29/30 is implemented.** This story reserves the numbering
  and records intent only. Trigger to act: any of the three FRs is scheduled — at
  which point it is split into its own implementation story (§3a-bis splitting
  rule) and this bundle's points are recalibrated down.

### References

- [Source: PRD FR-28](../../PRD.md#functional-requirements) — social recovery (planned)
- [Source: PRD FR-29](../../PRD.md#functional-requirements) — session keys (planned)
- [Source: PRD FR-30](../../PRD.md#functional-requirements) — DID integration / DID-based transactions (planned)
- [Source: ARCHITECTURE AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to background
- [Source: ARCHITECTURE AD-11](../../ARCHITECTURE.md#architecture-decisions) — unified account / self-custody
- [Roadmap: #1210](https://github.com/Koniverse/SubWallet-Extension/issues/1210) — Integration Social recovery for SubWallet (FR-28)
- [Roadmap: #618](https://github.com/Koniverse/SubWallet-Extension/issues/618) — Add session keys feature (FR-29)
- [Roadmap: #3277](https://github.com/Koniverse/SubWallet-Extension/issues/3277) — Add support for DID-based transactions within the wallet (FR-30)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | _(forward — FR-28)_ Not yet runnable; defended when social recovery ships |
| AC-2 | _(forward — FR-29)_ Not yet runnable; defended when session keys ship |
| AC-3 | _(forward — FR-30)_ Not yet runnable; defended when DID integration ships |
| AC-4 | _(forward)_ Not yet runnable; defended per-FR when each split story ships |

## Changelog entry

> Roadmap placeholder — no changelog entry until a per-FR story actually ships.

### Added
- _(planned — FR-28)_ Social recovery for wallet accounts.
- _(planned — FR-29)_ Session keys support.
- _(planned — FR-30)_ Decentralized identity (DID) integration and DID-based
  transactions.

**Commit**:

## Implementation notes

_Forward / roadmap story — nothing shipped. FR-28/29/30 are `📋 planned`. When
scheduled, split this bundle into per-FR implementation stories, author the new
AD entries in CONTEXT.md, and recalibrate this bundle's points down._

## Cross-references

- [PRD FR-28](../../PRD.md#functional-requirements), [PRD FR-29](../../PRD.md#functional-requirements), [PRD FR-30](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
- [#1210](https://github.com/Koniverse/SubWallet-Extension/issues/1210)
- [#618](https://github.com/Koniverse/SubWallet-Extension/issues/618)
- [#3277](https://github.com/Koniverse/SubWallet-Extension/issues/3277)
