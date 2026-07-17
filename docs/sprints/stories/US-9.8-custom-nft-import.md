---
id: US-9.8
title: "Custom NFT import"
epic: EPIC-9
status: done
priority: P2
points: 3
sprint: sprint-2022-M05
version_shipped: 0.4.1
prd_ref: [FR-92]
arch_ref:
depends_on: [US-9.1, US-9.3]
assignee: nulllpc
commit: fee3068038, 1c6623c258, e8b62bc00e
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user can add an NFT collection that auto-detection missed by entering its
contract address, so collections from long-tail or just-launched projects still
show up in the wallet.

## Background

Backend-driven detection (US-9.1 / US-9.3) covers known collections, but not
every collection is indexed. The custom-import flow lets a user add a collection
by **contract address** for the standards that support it (ERC-721 on EVM,
PSP-34 on WASM-Substrate), choosing the chain and confirming the detected
collection name/symbol (PRD [FR-92](../../PRD.md#functional-requirements)). The
import validates the contract on-chain and persists it as a custom token so it
joins the shared `NftService` grid like any auto-detected collection.

Materializes [FR-92](../../PRD.md#functional-requirements). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** a valid ERC-721 / PSP-34 contract address on a supported chain, **When** the user submits the import form, **Then** the contract is validated, the collection is persisted, and it appears in the NFT grid.
- [x] **AC-2** — **Given** an address that is not a valid NFT contract (or wrong standard for the chosen chain), **When** the user submits, **Then** a clear validation error is shown and nothing is imported.
- [x] **AC-3** — **Given** a collection that is already present (auto-detected or previously imported), **When** the user imports the same contract, **Then** it is not duplicated.

## Tasks

- [x] **TASK-9.8.1** — Import form: contract address + chain + standard, with chain options filtered to NFT-capable chains (AC: 1)
- [x] **TASK-9.8.2** — On-chain contract validation + collection metadata read (AC: 1, 2)
- [x] **TASK-9.8.3** — Persist as custom token (`upsertCustomToken`) and surface in the grid (AC: 1)
- [x] **TASK-9.8.4** — Duplicate guard against existing collections (AC: 3)

## Dev notes

### Architecture constraints

- Imported collections persist as custom tokens and flow through the same `NftService` state — no separate "imported NFT" surface.
- Standard options are constrained per chain (`getNftTypeSupported` / supported-chains lookup); the form cannot offer a standard a chain does not support.

### Cross-story dependencies

- Builds on [US-9.1](US-9.1-substrate-nft-display.md) (PSP-34) and [US-9.3](US-9.3-evm-nft-display.md) (ERC-721) — imported collections render through their handlers.

### References

- [Source: PRD FR-92](../../PRD.md#functional-requirements) — custom NFT import
- `packages/extension-koni-ui/src/Popup/Home/Nfts/NftImport.tsx`

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: import a valid ERC-721 contract → appears in grid |
| AC-2 | Manual: import an invalid / wrong-standard address → validation error |
| AC-3 | Manual: import an already-present contract → no duplicate |

## Changelog entry

### Added
- Custom NFT import: add NFT collections by contract address (ERC-721 / PSP-34) with on-chain validation and duplicate guard.

**Commit**:

## Implementation notes

Traced 2026-07-13 (US-21.2 straggler pass — this story was never a batch-2 candidate; the PRD/story mismatch surfaced during the AC-4 reconcile). First delivery: **[0.4.1] — 2022-05-11**, "Support import ERC20 and ERC721 for EVM Networks (#160)" — the first import-by-contract-address capability anywhere in the CHANGELOG (earlier releases only ship per-chain NFT integrations and *account* import). `fee3068038` adds `ImportEvmNft.tsx` (contract-address form + chain selector → `upsertEvmToken`), `1c6623c258` adds `getERC721Contract` + on-chain validation, `e8b62bc00e` wires custom contracts into the NFT handlers; merged via PR #244 (branch `koni/dev/issue-160`). All commits verified contained in `v0.4.1`. **Scope note:** only the ERC-721 path shipped in 0.4.1 — PSP-34 custom import followed in 0.6.7 (#477) and ERC-1155 in 1.3.5 (#3726).

## Cross-references

- [PRD FR-92](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md) · [US-9.3](US-9.3-evm-nft-display.md)
