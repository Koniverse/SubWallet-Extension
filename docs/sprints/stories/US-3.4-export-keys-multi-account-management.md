---
id: US-3.4
title: "Export keys & multi-account management"
epic: EPIC-3
status: backlog
priority: P1
points: 3
sprint:
version_shipped:
prd_ref: [FR-19, FR-20]
arch_ref: [AD-04]
depends_on: [US-3.1, US-3.2, US-2.1]
assignee:
commit:
created: 2026-06-11
updated: 2026-06-11
---

## Goal

A user can recover their own keys (export seed phrase and private key from
settings) and run several named accounts inside one wallet instance — so that
they keep an exit path for their funds and can organize personal, trading, and
shared addresses without spinning up separate wallets.

## Background

This story owns the two day-to-day management capabilities that bracket the
import stories:

- **Export ([FR-19](../../PRD.md#functional-requirements))** — reveal the seed phrase and private key
  from settings. This is the one place secret bytes are *deliberately* surfaced,
  so it is the most security-sensitive flow in the epic: the reveal is gated by
  the master password ([FR-53](../../PRD.md#functional-requirements), owned by EPIC-5) and the bytes are
  produced **only in the background keyring**
  ([AD-04](../../ARCHITECTURE.md#architecture-decisions)) and handed to the
  reveal UI under that gate — never broadcast on the `pri(…)`/`pub(…)` bus, the
  "no key on the message bus" invariant from [EPIC-3](../epics/EPIC-3.md).
- **Multi-account management ([FR-20](../../PRD.md#functional-requirements))** — create, name/rename, and
  switch between multiple accounts within a single wallet instance; the active
  account drives the rest of the UI.

Materializes [FR-19](../../PRD.md#functional-requirements) and [FR-20](../../PRD.md#functional-requirements). **Retroactive** —
both already ship; `commit` / `version_shipped` are backfilled during version
reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** an unlocked wallet, **When** the user requests an
  export and re-enters the correct master password, **Then** the seed phrase /
  private key is revealed (produced in the background, AD-04) and is never
  emitted on the message bus.
- [ ] **AC-2** — **Given** an export request, **When** the user enters the
  **wrong** master password, **Then** the secret is not revealed and a clear
  error is shown (no reveal-without-gate path).
- [ ] **AC-3** — **Given** a wallet with several accounts, **When** the user
  creates, renames, and switches accounts, **Then** each account keeps its own
  name and the active account drives the rest of the UI.
- [ ] **AC-4** — **Given** a multi-account wallet, **When** an account is
  removed, **Then** only that account is removed and the remaining accounts and
  the wallet itself are unaffected.

## Tasks

- [ ] **TASK-3.4.1** — Export seed phrase + private key, master-password-gated (AC: 1, 2)
  - [ ] Produce secret in background keyring; assert nothing on the `pri(…)`/`pub(…)` bus.
- [ ] **TASK-3.4.2** — Wrong-password rejection on export (AC: 2)
- [ ] **TASK-3.4.3** — Multi-account create / rename / switch (AC: 3)
- [ ] **TASK-3.4.4** — Account removal isolation (AC: 4)

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — export bytes are
  produced in the background and surfaced only under the master-password gate;
  the keyring stays the sole holder of secrets.
- Master-password gate ([FR-53](../../PRD.md#functional-requirements)) is **owned by EPIC-5**; this story
  consumes it for the export reveal, it does not define or weaken it.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md) /
  [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md) — exports the
  secrets those stories landed; manages the accounts they created.
- Builds on US-2.1 (keyring engine) — reuses the background secret-retrieval
  path.
- Sibling [US-3.3](US-3.3-import-account-via-json-qr-trust-wallet.md) — the JSON
  keystore export format is the inverse of keystore import; coordinate the
  format.

### References

- [Source: PRD FR-19](../../PRD.md#functional-requirements) — export seed phrase and private key
- [Source: PRD FR-20](../../PRD.md#functional-requirements) — manage multiple named accounts
- [Source: PRD FR-53](../../PRD.md#functional-requirements) — master password gate (owned by EPIC-5)
- [Source: ARCHITECTURE AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to background

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: unlock → export → re-enter correct password → secret revealed; keyring test asserts no secret on the bus |
| AC-2 | Manual: export with wrong master password → reveal blocked, error shown |
| AC-3 | Manual: create / rename / switch accounts → names persist, active account drives UI |
| AC-4 | Manual: remove one account → others and wallet unaffected |

## Changelog entry

### Added
- Export seed phrase and private key from settings (master-password-gated,
  background-produced).
- Multi-account management: create, rename, switch, and remove named accounts
  within a single wallet instance.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`,
`version_shipped` and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-19](../../PRD.md#functional-requirements), [PRD FR-20](../../PRD.md#functional-requirements)
- [Epic EPIC-3](../epics/EPIC-3.md)
- [US-3.1](US-3.1-create-a-new-wallet-via-seed-phrase.md)
- [US-3.2](US-3.2-import-account-via-seed-phrase-or-private-key.md)
