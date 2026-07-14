---
id: US-9.6
title: "3D and video NFT viewer"
epic: EPIC-9
status: done
priority: P2
points: 5
sprint: sprint-2022-M09
version_shipped: 0.6.5
prd_ref: [FR-90]
arch_ref: [AD-25]
depends_on: [US-9.1]
assignee: nulllpc
commit: bf810b9a187f08cd875edb5c5a827629167717c8, b6f96a6db3, 0695046c7cc81c33dca6a0f0124e968306f79c4e
created: 2026-06-12
updated: 2026-06-12
---

## Goal

A user opening an NFT whose media is a 3D model or a video sees it rendered
natively — an interactive model-viewer or a playable video — instead of a
broken image, so rich-media collectibles look the way their creators intended.

## Background

Not all NFT media is a flat image. Some collections ship `.glb`/`.gltf` 3D
models (rendered via a model-viewer with rotation / camera controls) and some
ship video (PRD [FR-90](../../PRD.md#functional-requirements)). The item-detail
renderer must detect the media type and pick the right renderer, falling back to
the static image/preview when the rich-media asset cannot load. All media URLs
resolve through the IPFS gateway proxy
([AD-25](../../ARCHITECTURE.md#architecture-decisions), NFR-21). This is a render
layer on top of the display established in
[US-9.1](US-9.1-substrate-nft-display.md).

Materializes [FR-90](../../PRD.md#functional-requirements). **Retroactive** —
already shipped.

## Acceptance criteria

- [x] **AC-1** — **Given** an NFT whose media is a 3D model, **When** the user opens item detail, **Then** an interactive model-viewer renders it (rotation / camera controls).
- [x] **AC-2** — **Given** an NFT whose media is a video, **When** the user opens item detail, **Then** the video renders and can be played.
- [x] **AC-3** — **Given** an NFT whose rich-media asset fails to load, **When** the user opens item detail, **Then** the renderer falls back to the static image/preview rather than showing a broken element.

## Tasks

- [x] **TASK-9.6.1** — Media-type detection in item detail (3D model / video / image) (AC: 1, 2, 3)
- [x] **TASK-9.6.2** — 3D model-viewer render path with rotation / camera-controls props (AC: 1)
- [x] **TASK-9.6.3** — Video render path (AC: 2)
- [x] **TASK-9.6.4** — Fallback to static image/preview when rich media fails (AC: 3)

## Dev notes

### Architecture constraints

- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — all media (model / video / image) resolves through the `ipfs-files` gateway pipeline.
- Render variant of the shared item-detail view from [US-9.1](US-9.1-substrate-nft-display.md); no separate "3D NFT" screen.

### Cross-story dependencies

- Builds on [US-9.1](US-9.1-substrate-nft-display.md) — extends item detail.
- Sibling [US-9.10](US-9.10-nft-display-and-transfer-hardening.md) — NFT display & transfer hardening; coordinate the failed-media error-state contract.

### References

- [Source: PRD FR-90](../../PRD.md#functional-requirements) — 3D and video NFT viewer
- `packages/extension-koni-ui/src/Popup/Home/Nfts/NftItemDetail.tsx`
- `packages/extension-koni-ui/src/constants/nft.ts` (model-viewer props)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: open a 3D-model NFT → interactive model-viewer renders |
| AC-2 | Manual: open a video NFT → video plays |
| AC-3 | Manual: break the media URL → falls back to static preview |

## Changelog entry

### Added
- 3D model and video NFT viewer in item detail, with static-image fallback when rich media fails to load.

**Commit**:

## Implementation notes

Backfilled by US-21.2 (multi-agent trace + adversarial verify, run `wf_6b56f4cd-d08`; trace confidence: high, rule: completion).

**Evidence:** CHANGELOG [0.6.5] — 2022-09-24: "Support 3D viewer for NFT (#662)". Title enumerates two components (3D + video); the video render path shipped much earlier (commit 0695046c7c, 2022-02-09, first tagged v0.2.5 — never named in a bullet; the 1.1.3 bullet "Fixed bug video NFT size (#1651)" proves prior existence), so the 3D viewer in 0.6.5 completes the enumeration. Verified at tag v0.6.5 that NftItem.tsx contains both the model-viewer and video render paths; all commits pass merge-base --is-ancestor v0.6.5. ("Support display 3D NFT (#1516)" in 1.0.10 is a re-delivery after the v1.0 UI rewrite.)

Commits `bf810b9a187f08cd875edb5c5a827629167717c8, b6f96a6db3, 0695046c7cc81c33dca6a0f0124e968306f79c4e` verified contained in the v0.6.5 anchor via `git merge-base --is-ancestor`; assignee resolved through the [US-21.1 contributor map](../../notes/contributor-map.md).

## Cross-references

- [PRD FR-90](../../PRD.md#functional-requirements) · [Epic EPIC-9](../epics/EPIC-9.md) · [US-9.1](US-9.1-substrate-nft-display.md) · [US-9.10](US-9.10-nft-display-and-transfer-hardening.md)
</content>
