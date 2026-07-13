---
id: US-8.2
title: "Receive (QR + copyable address)"
epic: EPIC-8
status: done
priority: P1
points: 3
sprint:
version_shipped: 0.2.5
prd_ref: [FR-75]
arch_ref:
depends_on:
assignee: LeeW0ng
commit: 9a9b3b284c, 935d9ef04e, d3eb15347b
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can receive tokens by showing the right address for the selected token's
ecosystem — as a scannable QR code and a one-tap copyable string — so that a
counterparty can send to the correct chain without the user pasting the wrong
format. This is the read side of the money-movement surface: no transaction, but
the same correctness bar (right address for the right ecosystem) as a send.

## Background

Receive looks trivial but is a correctness surface: a Substrate address, an EVM
`0x` address, a Bitcoin address (Legacy / SegWit / Taproot per AD-12), a TON
address and a Cardano address are *not* interchangeable, and presenting the wrong
one for the selected token loses funds. The receive flow resolves the correct
address for the (account, token/ecosystem) pair, renders a QR encoding exactly that
string, and offers copy-to-clipboard. For Bitcoin the address type follows the
account's BTC address-type model.

No transaction lifecycle, no signing — this is pure presentation over data the
keyring/account layer already exposes. Sized 3 (per-ecosystem address resolution +
QR rendering across five ecosystems, with the BTC address-type nuance).
Materializes [FR-75](../../PRD.md#functional-requirements). This story is
**Retroactive** — the capability already ships; `commit` / `version_shipped` are
backfilled during version reconciliation.

## Acceptance criteria

- [x] **AC-1** — **Given** an account and a selected token, **When** the user opens
  Receive, **Then** the address shown is the correct one for that token's ecosystem
  and the QR code encodes exactly that address string.
- [x] **AC-2** — **Given** the receive screen, **When** the user taps copy, **Then**
  the exact displayed address is placed on the clipboard (no truncation, no
  checksum-case mangling) and a copied confirmation is shown.
- [x] **AC-3** — **Given** a Bitcoin account, **When** the user views Receive,
  **Then** the address reflects the account's BTC address type (Legacy / SegWit /
  Taproot) and switching type updates both the displayed address and the QR.
- [x] **AC-4** — **Given** an account that has no address for the selected
  ecosystem (e.g. a solo account of another ecosystem), **When** the user opens
  Receive, **Then** an explanatory empty state is shown instead of a wrong or blank
  address.

## Tasks

- [x] **TASK-8.2.1** — Resolve the correct address for the (account, token/ecosystem) pair (AC: 1, 4)
- [x] **TASK-8.2.2** — Render a QR code encoding exactly the displayed address (AC: 1, 3)
- [x] **TASK-8.2.3** — Copy-to-clipboard with confirmation; preserve exact string (AC: 2)
- [x] **TASK-8.2.4** — Bitcoin address-type selector wired to address + QR (AC: 3)
- [x] **TASK-8.2.5** — Empty state when no address exists for the ecosystem (AC: 4)

## Dev notes

### Architecture constraints

- This story does NOT introduce new AD entries. Addresses come from the
  account/keyring layer; receive performs no chain calls and no signing.
- Bitcoin address types follow the BTC integration model ([AD-12](../../ARCHITECTURE.md#architecture-decisions), owned by [EPIC-3](../epics/EPIC-3.md)); this story only *displays* the selected type.

### Cross-story dependencies

- Builds on the account/address surface (EPIC-3) — consumes per-ecosystem addresses; does not derive them.
- Sibling [US-8.1](US-8.1-send-native-and-fungible-tokens.md) — both share the per-ecosystem address-validation/formatting helpers.

### References

- [Source: PRD FR-75](../../PRD.md#functional-requirements) — receive: QR + copyable address per ecosystem
- [Source: ARCHITECTURE AD-12](../../ARCHITECTURE.md#architecture-decisions) — Bitcoin address-type model

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: open Receive per ecosystem → address + QR match the ecosystem |
| AC-2 | Manual: copy → paste; assert exact string (case/checksum preserved) |
| AC-3 | Manual: BTC account → switch Legacy/SegWit/Taproot → address + QR update |
| AC-4 | Manual: solo account of another ecosystem → empty state, no wrong address |

## Changelog entry

### Added
- Receive screen showing the correct per-ecosystem address as a QR code and a
  copyable string, with Bitcoin address-type selection and an empty state for
  ecosystems the account has no address for.

**Commit**:

## Implementation notes

Traced 2026-07-13 (US-21.2 straggler pass) — **this one is a documented compromise, read the caveat.** The CHANGELOG announces Receive in the founding release ([0.0.1] "Receive and send fund"), but 0.0.1's recorded release commit `0d78ecaf7e` **has no QR-of-address anywhere in its tree** — and it is provably an *ancestor* of the receive code (`git merge-base --is-ancestor 0d78ecaf7e 9a9b3b284c` → 0), so no commit set can ever be contained in it. Per this project's "code wins" rule the honest anchor is **0.2.5**, the earliest release with a verifiable anchor (tag `v0.2.5` + release commit `e72795334c`) whose tree provably contains the surface (`packages/extension-koni-ui/src/components/AccountQrModal.tsx`). Code chain: `9a9b3b284c` (2022-01-21) is the first QR-of-address in the repo (`react-qr-code` + `CopyToClipboard` + `reformatAddress` for the ecosystem's format); `935d9ef04e` renamed it `AccountQrModal`; `d3eb15347b` wired the Receive button on Home. **Caveat:** the true first ship is almost certainly 0.1.0 or 0.2.1 — both are commit-less *and* tagless in the early Koni block, so neither can be verified; 0.2.5 is the earliest provable release, not necessarily the first one.

## Cross-references

- [PRD FR-75](../../PRD.md#functional-requirements)
- [Epic EPIC-8](../epics/EPIC-8.md)
- [US-8.1](US-8.1-send-native-and-fungible-tokens.md)
