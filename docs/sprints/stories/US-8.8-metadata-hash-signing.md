---
id: US-8.8
title: "Metadata-hash signing"
epic: EPIC-8
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: [FR-81]
arch_ref: [AD-21]
depends_on:
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user signing a Substrate extrinsic can review it on a verified basis — the
transaction is signed with the runtime metadata hash so a hardware signer (the
Polkadot Generic Ledger app) can decode and display *exactly* what is being signed,
instead of a blind blob. This is the difference between "approve this opaque hash"
and "approve this transfer of X to Y", and it is the foundation of trustworthy
hardware signing.

## Background

The Polkadot "check-metadata-hash" signed extension lets a signer commit to the
hash of the chain's runtime metadata, so a hardware device with the **Generic
Ledger app** can decode the extrinsic against verified metadata and render
human-readable details. Without it, the Generic Ledger app cannot show what the
transaction does and falls back to blind signing. This story builds extrinsics with
the metadata-hash extension populated and routes the signing request through the
RequestService's per-ecosystem Substrate handler
([AD-21](../../ARCHITECTURE.md#architecture-decisions)) so the verified-review path
reaches the device.

This is a protocol-level signing integration (metadata-hash construction +
hardware-app compatibility + the approval handler) with cross-version metadata
correctness concerns, which is why it is sized 5 per §3a-bis for metadata-hash
signing. Materializes [FR-81](../../PRD.md#functional-requirements). This story
is **Retroactive** — the capability already ships; `commit` / `version_shipped`
are backfilled during version reconciliation.

## Acceptance criteria

- [ ] **AC-1** — **Given** a Substrate extrinsic to be signed, **When** the signing
  request is built, **Then** the check-metadata-hash signed extension is populated
  with the correct runtime metadata hash for the target chain.
- [ ] **AC-2** — **Given** a Polkadot Generic Ledger app, **When** the user signs
  the extrinsic, **Then** the device decodes and displays the extrinsic's
  human-readable details (call, amount, destination) rather than a blind hash.
- [ ] **AC-3** — **Given** the signing flow, **When** the request is presented,
  **Then** it is routed through the RequestService per-ecosystem Substrate handler
  (AD-21), not signed inline in the feature flow.
- [ ] **AC-4** — **Given** a chain whose metadata hash cannot be obtained or
  verified, **When** the user attempts metadata-hash signing, **Then** the flow
  surfaces a clear unsupported/error state instead of producing an extrinsic that
  the device will reject or mis-decode.

## Tasks

- [ ] **TASK-8.8.1** — Populate the check-metadata-hash signed extension with the correct chain metadata hash (AC: 1)
- [ ] **TASK-8.8.2** — Route the signing request through the RequestService Substrate handler (AC: 3)
- [ ] **TASK-8.8.3** — Verify Generic Ledger app decodes the extrinsic to human-readable detail (AC: 2)
- [ ] **TASK-8.8.4** — Unsupported/error state when the metadata hash is unavailable or unverifiable (AC: 4)

## Dev notes

### Architecture constraints

- [AD-21](../../ARCHITECTURE.md#architecture-decisions) — the signing request is presented through the per-ecosystem RequestService Substrate handler (owned by [EPIC-2](../epics/EPIC-2.md), FR-11); this story renders the verified-review confirmation, it does not rebuild the approval queue.
- This story does NOT introduce new AD entries. Hardware-device signing transport is owned by [EPIC-16](../epics/EPIC-16.md); this story produces the metadata-hash-bearing payload the device consumes.

### Cross-story dependencies

- Sibling [US-8.9](US-8.9-multi-step-one-sign-signing.md), [US-8.10](US-8.10-token-spending-approval-confirmation.md) — all three render confirmations through the RequestService handlers; coordinate the shared approval surface.
- Consumed by hardware-wallet signing (EPIC-16) — the Generic Ledger app relies on the metadata hash this story populates.

### References

- [Source: PRD FR-81](../../PRD.md#functional-requirements) — metadata-hash signing (Polkadot Generic Ledger app)
- [Source: ARCHITECTURE AD-21](../../ARCHITECTURE.md#architecture-decisions) — per-ecosystem request-handler abstraction
- [Source: ARCHITECTURE §Transaction & request subsystem](../../ARCHITECTURE.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Test: signing payload carries the correct check-metadata-hash extension for the chain |
| AC-2 | Manual (device): Generic Ledger app shows call/amount/destination, not a blind hash |
| AC-3 | Test: signing request enqueues in the RequestService Substrate handler |
| AC-4 | Manual: chain with no obtainable metadata hash → unsupported/error state |

## Changelog entry

### Added
- Metadata-hash signing: populates the check-metadata-hash signed extension so the
  Polkadot Generic Ledger app can render verified human-readable extrinsic details,
  routed through the RequestService Substrate handler, with an unsupported state
  when the metadata hash is unavailable.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any implementation caveats during version reconciliation._

## Cross-references

- [PRD FR-81](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.9](US-8.9-multi-step-one-sign-signing.md)
