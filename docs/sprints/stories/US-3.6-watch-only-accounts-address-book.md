---
id: US-3.6
title: "Watch-only accounts & address book"
epic: EPIC-3
status: done
priority: P2
points: 3
sprint:
version_shipped: 1.0.2
prd_ref: [FR-24, FR-25]
arch_ref: [AD-04]
depends_on: [US-3.1, US-2.1]
assignee: saltict
commit: dbbbe616a0, 174fcd48d8, 35ec52daac
created: 2026-06-11
updated: 2026-06-11
---

## Goal

A user can add any address for read-only balance monitoring without importing a
private key, and can save and label the recipient addresses they send to most —
so that they can track wallets they don't control and stop pasting raw addresses
every time they transfer.

## Background

Both capabilities in this story are **keyless** — they store addresses, never
secrets — which is what lets them sit comfortably under the
[EPIC-3](../epics/EPIC-3.md) "no key on the message bus" invariant by simply
never having a key to leak:

- **Watch-only accounts ([FR-24](../../PRD.md#functional-requirements))** — add an address for read-only
  balance monitoring with no private key. A watch-only account can be viewed but
  **cannot sign**; it is the unhappy path's anchor here.
- **Address book ([FR-25](../../PRD.md#functional-requirements))** — save and label frequently used
  recipient addresses so they can be picked by name when sending.

Neither touches the keyring's secret material, but both still resolve and store
addresses through the background ([AD-04](../../ARCHITECTURE.md#architecture-decisions)),
keeping the UI free of any account internals it should not hold.

Materializes [FR-24](../../PRD.md#functional-requirements) and [FR-25](../../PRD.md#functional-requirements). **Retroactive** —
both already ship; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** any valid address, **When** the user adds it as
  watch-only, **Then** an account is created that shows balances read-only, with
  no private key imported.
- [x] **AC-2** — **Given** a watch-only account, **When** the user attempts to
  sign or send from it, **Then** the action is blocked with a clear "watch-only —
  cannot sign" message.
- [x] **AC-3** — **Given** the address book, **When** the user saves a recipient
  with a label, **Then** it persists and is selectable by label when sending.
- [x] **AC-4** — **Given** an invalid / malformed address, **When** the user
  tries to add it (watch-only or address book), **Then** it is rejected with a
  clear error and nothing is persisted.

## Tasks

- [x] **TASK-3.6.1** — Add watch-only account (read-only, no key) (AC: 1, 4)
- [x] **TASK-3.6.2** — Block signing/sending from a watch-only account (AC: 2)
- [x] **TASK-3.6.3** — Address book: save / label / select recipient (AC: 3, 4)
- [x] **TASK-3.6.4** — Address validation for both flows (AC: 4)

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — these are keyless
  features; there is no secret to confine, but address resolution/storage still
  goes through the background.
- Signing is **owned by EPIC-8 / EPIC-2**; this story only enforces that a
  watch-only account is rejected *before* any signing path is reached.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md) — reuses the
  account list / storage surface.
- Builds on US-2.1 (keyring engine) — watch-only accounts register through the
  same account registry, flagged signing-disabled.
- Sibling: send/transfer stories in EPIC-8 consume the address book.

### References

- [Source: PRD FR-24](../../PRD.md#functional-requirements) — watch-only accounts
- [Source: PRD FR-25](../../PRD.md#functional-requirements) — address book
- [Source: ARCHITECTURE AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to background

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: add an address as watch-only → balances show, no key imported |
| AC-2 | Manual: attempt to send from a watch-only account → blocked with message |
| AC-3 | Manual: save a labeled recipient → selectable by label when sending |
| AC-4 | Unit test: malformed address → rejected, nothing persisted |

## Changelog entry

### Added
- Watch-only accounts: add any address for read-only balance monitoring with no
  private key; signing is blocked.
- Address book: save and label frequently used recipient addresses, selectable
  by label when sending.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`,
`version_shipped` and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-24](../../PRD.md#functional-requirements), [PRD FR-25](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
