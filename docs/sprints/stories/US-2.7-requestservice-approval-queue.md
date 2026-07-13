---
id: US-2.7
title: "RequestService approval queue"
epic: EPIC-2
status: done
priority: P0
points: 8
sprint:
version_shipped: 1.0.1
prd_ref: [FR-11]
arch_ref: [AD-21]
depends_on: [US-2.1]
assignee: S2kael
commit: 581fe6a2ff, ad2567d9ae
created: 2026-06-12
updated: 2026-06-12
---

## Goal

RequestService is the single confirmation queue every dApp connect, signature and
transaction passes through — one approve/reject surface, with the per-ecosystem
differences (Substrate vs EVM vs Bitcoin vs TON vs Cardano signing payloads, plus
auth, metadata and WalletConnect) isolated behind dedicated handlers. Every
feature that needs user consent asks RequestService to enqueue a request and never
reimplements popup, approval state, or per-chain payload handling.

## Background

This story catalogues the **`request-service`** module
(`packages/extension-base/src/services/request-service`, with per-ecosystem
handlers under `handler/`). It realizes
[AD-21](../../ARCHITECTURE.md#architecture-decisions): `RequestService` fans
approval-required requests out to dedicated handlers — Auth, Metadata, Substrate,
EVM, Bitcoin, TON, Cardano, plus the WalletConnect connect/unsupported handlers —
behind a shared `PopupHandler`, each owning its own pending-request cache. Each
ecosystem has a different signing payload and approval shape, so isolating them
keeps one signing surface per chain family while sharing the popup / approve /
reject plumbing ([CONTEXT D13, D65](../../CONTEXT.md)).

It sits at the centre of the transaction & request subsystem described in
[ARCHITECTURE](../../ARCHITECTURE.md): in-app flows go
UI → TransactionService → RequestService → sign → submit; dApp-inject and
WalletConnect flows go straight to RequestService. Secret access for signing routes
through the background keyring (US-2.1, [AD-04](../../ARCHITECTURE.md#architecture-decisions));
no key bytes cross the popup or the message bus.

Sized 8 (multi-system: a confirmation queue spanning five signing ecosystems plus
auth, metadata and WalletConnect, each with its own payload shape and pending-request
cache, all sharing one popup / approve / reject surface and waking the MV3 worker
fully). Depends on US-2.1 for the keyring it signs through.

This story is **Retroactive** — the engine already ships; `commit` /
`version_shipped` are backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** a dApp connect, a sign-message or a sign-transaction
  request from any source (in-app, dApp-inject, WalletConnect), **When** it
  requires user consent, **Then** it is enqueued in RequestService and surfaced
  through the single approve/reject popup.
- [x] **AC-2** — **Given** a request for a specific ecosystem (Substrate / EVM /
  Bitcoin / TON / Cardano) or an auth/metadata/WalletConnect request, **When** it
  is processed, **Then** it is routed to that ecosystem's dedicated handler with
  its own pending-request cache, behind the shared `PopupHandler`.
- [x] **AC-3** — **Given** a pending request, **When** the user approves it,
  **Then** signing is performed through the background keyring (AD-04) and no key
  bytes are exposed to the popup or message bus.
- [x] **AC-4** — **Given** a pending request, **When** the user rejects it or the
  popup is dismissed, **Then** the request resolves as rejected, its cache entry
  is cleared, and no partial approval leaks to the caller.

## Tasks

- [x] **TASK-2.7.1** — Central request queue + shared `PopupHandler` approve/reject surface (AC: 1, 4)
- [x] **TASK-2.7.2** — Per-ecosystem handlers (Substrate / EVM / Bitcoin / TON / Cardano) with isolated pending-request caches (AC: 2)
  - [x] Auth, Metadata and WalletConnect connect/unsupported handlers under `handler/`.
- [x] **TASK-2.7.3** — Route approved signing through the background keyring; never expose key bytes (AC: 3)
- [x] **TASK-2.7.4** — Reject / dismiss path clears the cache and resolves the caller as rejected (AC: 4)

## Dev notes

### Architecture constraints

- [AD-21](../../ARCHITECTURE.md#architecture-decisions) — per-ecosystem request handlers behind a shared `PopupHandler`, each owning its own pending-request cache.
- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — signing on approval runs in the background keyring; the popup never receives key bytes.
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-2.1](US-2.1-unified-account-keyring-engine.md) — approved requests sign through the background keyring.
- Required by [US-2.8](US-2.8-transaction-lifecycle-engine.md) — the transaction lifecycle routes its sign step through this approval queue.
- Sibling: every dApp / WalletConnect feature epic enqueues through this surface rather than building its own approval flow.

### References

- [Source: PRD FR-11](../../PRD.md#functional-requirements) — RequestService approval queue
- [Source: ARCHITECTURE AD-21](../../ARCHITECTURE.md#architecture-decisions)
- [Source: ARCHITECTURE §Transaction & request subsystem](../../ARCHITECTURE.md)
- [Source: CONTEXT D13, D65](../../CONTEXT.md) — per-ecosystem request handlers

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Unit test: connect / sign-message / sign-tx from each source enqueues and surfaces one popup (`services/request-service` tests) |
| AC-2 | Test: an EVM vs Substrate vs Bitcoin/TON/Cardano request routes to its handler with an isolated cache |
| AC-3 | Test: approval signs via background keyring; assert no key bytes on the popup/message bus |
| AC-4 | Test: reject / dismiss → caller resolves rejected, cache entry cleared |

## Changelog entry

### Added
- RequestService approval queue: one approve/reject surface for every dApp
  connect, signature and transaction, with per-ecosystem handlers (Auth, Metadata,
  Substrate, EVM, Bitcoin, TON, Cardano, WalletConnect) behind a shared
  `PopupHandler`.

**Commit**:

## Implementation notes

_Retroactive story — engine already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-11](../../PRD.md#functional-requirements)
- [Epic EPIC-2](../epics/EPIC-2.md)
- [US-2.8](US-2.8-transaction-lifecycle-engine.md)
