# 2026-07-13 — Gapless ID renumber (FR + EPIC-12 stories)

**What changed:** the two ID gaps left by the 2026-07-10 duplicate-story deletion
were closed by renumbering. Every ID below its gap keeps its number; every ID
above shifts down. **This is the only renumber in the project's history** — IDs
are otherwise permanent.

**Why now:** the docs tree lives only on `ai-development` (never merged to
`master`), so the blast radius is at its minimum. The cost only grows once the
tree ships; the alternative was two permanent holes in a 159-row FR table.

**Scope:** docs-only. No source file, CI script or automation references an `FR-`
or `US-x.y` ID (verified by a repo-wide grep) — nothing outside `docs/` moved.

**⚠️ Reading an old number:** anything written before 2026-07-13 (git commit
messages, review comments, chat, the earlier notes in this folder) uses the OLD
numbering. Translate through the tables below before trusting it. Numbers at or
below FR-123 and US-12.10 are unchanged.

## Deleted IDs (2026-07-10, never reused)

| Old ID | What it was | Absorbed into |
| --- | --- | --- |
| FR-124 / US-12.11 | "Alpha index auto-rebalancing delegate staking" — extrapolated from tracker child issue #4946 | FR-124 (new) / US-12.11 (new) = Trusted Stake, tracker parent #4879 |
| FR-126 / US-12.13 | "Backprop (alpha subnet trading)" — extrapolated from tracker issue #4880 | FR-109 / US-11.7 — in-wallet dTAO swap (already shipped 1.3.78) |

> Note the collision hazard: the *new* FR-124 / US-12.11 are the Trusted Stake
> rows, not the deleted ones. An old reference to "FR-124" means the deleted
> delegate-staking row.

## Story mapping — EPIC-12 only

| Old ID | New ID | Story |
| --- | --- | --- |
| US-12.12 | **US-12.11** | Trusted Stake (alpha index) |
| US-12.14 | **US-12.12** | Staking for additional networks (Enjin, Phala, xx) |
| US-12.15 | **US-12.13** | Earning reward and APY accuracy hardening |
| US-12.16 | **US-12.14** | Earning performance and cache hardening |
| US-12.17 | **US-12.15** | Earning term and condition display |

US-12.1 … US-12.10 unchanged. No other epic is affected.

## FR mapping — FR-124 and up

FR-125 → FR-124 (−1, past the first hole); FR-127 … FR-161 → −2 (past both holes).
FR-01 … FR-123 unchanged. New maximum: **FR-159** (was FR-161).

| Old ID | New ID |
| --- | --- |
| FR-125 | **FR-124** |
| FR-127 | **FR-125** |
| FR-128 | **FR-126** |
| FR-129 | **FR-127** |
| FR-130 | **FR-128** |
| FR-131 | **FR-129** |
| FR-132 | **FR-130** |
| FR-133 | **FR-131** |
| FR-134 | **FR-132** |
| FR-135 | **FR-133** |
| FR-136 | **FR-134** |
| FR-137 | **FR-135** |
| FR-138 | **FR-136** |
| FR-139 | **FR-137** |
| FR-140 | **FR-138** |
| FR-141 | **FR-139** |
| FR-142 | **FR-140** |
| FR-143 | **FR-141** |
| FR-144 | **FR-142** |
| FR-145 | **FR-143** |
| FR-146 | **FR-144** |
| FR-147 | **FR-145** |
| FR-148 | **FR-146** |
| FR-149 | **FR-147** |
| FR-150 | **FR-148** |
| FR-151 | **FR-149** |
| FR-152 | **FR-150** |
| FR-153 | **FR-151** |
| FR-154 | **FR-152** |
| FR-155 | **FR-153** |
| FR-156 | **FR-154** |
| FR-157 | **FR-155** |
| FR-158 | **FR-156** |
| FR-159 | **FR-157** |
| FR-160 | **FR-158** |
| FR-161 | **FR-159** |

## Verification

- FR ref count before/after: 1933 → 1933 · US-12.x ref count: 473 → 473 (no ref lost or invented)
- PRD master table: FR-01 … FR-159, no gap · story files: no gap in any epic
- Every story's frontmatter `id` matches its filename; every `US-12.*` link resolves
- `npx koni-docs validate` exits zero
