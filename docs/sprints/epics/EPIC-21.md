---
id: EPIC-21
title: "Docs & Conformance Infrastructure"
status: done
prd_ref: []
created: 2026-07-09
updated: 2026-07-13
---

## Goal

This epic ships **no end-user feature on its own** — its deliverable is a truthful,
verifiable documentation system where every story carries a real version, every
commit SHA is resolved, every contributor is mapped to a GitHub login, and the
five-layer consistency check (PRD ↔ Epic ↔ Story ↔ Sprint ↔ STATUS) passes
`koni-docs validate`. When this epic holds the line, downstream epics and
maintainers get to trust the doc layers as a reliable source of truth rather than a
stale approximation.

## Overview

### Business context

Before this epic the project has 169 stories across 20 epics, a CHANGELOG that
reaches version 1.3.79, and a koni-docs CLI (`0.8.1`) installed and ready. Yet the
doc layers are inconsistent: many stories lack `version_shipped`, CHANGELOG
entries carry `pending` instead of a real commit SHA, git history shows dozens of
committers whose GitHub logins are unknown, and the 5-layer propagation from PRD
FR → Epic → Story → Sprint → STATUS has never been verified end-to-end.

EPIC-21 owns the **doc conformance program** — the work that makes the doc
artifacts truthful. It is deliberately positioned before any feature work that
depends on reliable docs (multi-repo canon, mobile bridge contract, reference
pointers). It materializes no FR because it is operational infrastructure: FR
re-writing, status backfill, and identity resolution cross-cut every epic without
owning any single feature requirement.

### What this epic is allowed to change — the map, never the territory

> **This charter was rewritten on 2026-07-13, after the epic falsified it.** The original
> read: *"EPIC-21 enriches and verifies existing doc artifacts — it never changes the product
> scope, the PRD's functional requirements, or any epic's story set."* By the time the three
> stories closed, the epic had deleted stories describing work that never existed, withdrawn
> two FRs, retired an NFR, renumbered the FR table, and carved out a new story. **The
> prohibition was violated on day one, because it was impossible to keep:** an epic whose job
> is to check the docs against the code *must* be able to fix the docs it proves wrong. A
> charter that forbids correcting the lies it finds is a charter that guarantees stale docs.
>
> The original *intent* was right and survives below. Only the mechanism was wrong — it was
> phrased as a **fact about scope** ("never touches X"), and a fact about scope expires the
> moment scope moves. It is restated below as a **principle**, which does not expire. See
> [LESSONS §65](../../LESSONS.md) and [CONTEXT D97](../../CONTEXT.md).

EPIC-21 may change the **description** of the product. It may not change the **product**.

| | |
| --- | --- |
| **In bounds** — the map | Correct a doc that the code proves wrong. Delete a story describing work that never existed. Mark an FR that never shipped. Backfill versions, SHAs, assignees. Renumber IDs (once — [D94](../../CONTEXT.md)). Add an FR for a capability that **demonstrably shipped** without one. |
| **Out of bounds** — the territory | Decide what the product *should* do. Add, drop, or reprioritise a requirement on judgement rather than on evidence. Change any line of shipped code. |

**The seam between them is escalation.** Every product decision this epic surfaced went to
the owner and landed in CONTEXT as a dated `D` entry — withdrawing FR-120 / FR-157
([D92](../../CONTEXT.md)), retiring NFR-11 ([D96](../../CONTEXT.md)), closing the PRD gaps
([D98](../../CONTEXT.md)). None was decided inside a story.

**And that rule is checkable**, which is the whole point of restating it: *an FR or NFR whose
status this epic changed, with no `D` entry to cite, is a violation.* The old prohibition
could not be checked — which is why nobody noticed it being broken eight times.

After this epic, `koni-docs validate` exits zero, and every subsequent PR's pre-commit
checklist enforces the five-layer invariant.

### Feature pillars

| # | Pillar | Stories | Purpose |
| --- | -------- | --------- | --------- |
| 1 | **Identity resolution** | [US-21.1](../stories/US-21.1-contributor-identity-map.md) | Resolve every `git shortlog` identity to one GitHub login, produce the contributor map that feeds the backfill's `assignee` field |
| 2 | **History backfill** | [US-21.2](../stories/US-21.2-history-backfill.md) | Backfill `version_shipped` into story files, CHANGELOG SHAs, sprint statuses, epic statuses, and bump VERSION → 1.3.83 |
| 3 | **Conformance verification** | [US-21.3](../stories/US-21.3-conformance-close-out.md) | Run the 5-layer invariant check, graduate durable notes into CONTEXT/LESSONS, regenerate STATUS.md, and make `koni-docs validate` exit zero |

### Out of scope

- **Branch rename (`master → main`, `subwallet-dev → dev`)** — explicitly dropped from the roadmap. Existing branches are kept unchanged for stability.
- **Build re-standardization (webapp/web-runner build targets)** — owned by [EPIC-1](EPIC-1.md) as part of the platform infrastructure.
- **Multi-repo canon (Chainlist, Mobile)** — owned by a separate downstream effort that consumes EPIC-21's verified doc surface.
- **Writing new feature documentation** — EPIC-21 backfills what exists; new feature doc is authored per existing convention.

## Stories

| ID | Title | Goal | Status | Version |
| --- | --- | --- | --- | --- |
| [US-21.1](../stories/US-21.1-contributor-identity-map.md) | Contributor identity map | Resolve every git identity to one GitHub login, producing the canonical contributor map | ✅ done | — (docs) |
| [US-21.2](../stories/US-21.2-history-backfill.md) | History backfill | Backfill version_shipped, CHANGELOG SHAs, sprint/status history, and bump VERSION | ✅ done | — (docs) |
| [US-21.3](../stories/US-21.3-conformance-close-out.md) | Conformance close-out | Run the 5-layer invariant check, graduate notes, make `koni-docs validate` exit zero | ✅ done | — (docs) |

The Version column is empty by design: **these stories ship in no release.** Their delivery
artifact is a commit, and the done-gate they are held to is the FR-less one below.

## Cross-cutting invariants

- **Every identity maps to exactly one GitHub login ([RULE-15](../../../.agents/skills/koni-docs/references/rules.md)):** the contributor map is definitive; `assignee` in every story frontmatter uses the mapped login, never `git user.name`. Enforced by [US-21.1](../stories/US-21.1-contributor-identity-map.md).
- **Every *FR-materializing* story has a `version_shipped` ([RULE-16](../../../.agents/skills/koni-docs/references/rules.md)):** bare semver, no `v`-prefix. A story that materializes a requirement and is `done` without `version_shipped` is a defect. **A story in an epic that materializes no requirement (`prd_ref: []` at the epic — docs, tooling, infra) ships in no release: its done-gate is all ACs ticked + a real `commit` + `validate` green.** Without that carve-out, a docs story can never leave `review`, and `review` ends up meaning two different things — "awaiting a reviewer" and "finished, but unrepresentable" — which is how a kanban column dies. See [CONTEXT D97](../../CONTEXT.md). Enforced by [US-21.2](../stories/US-21.2-history-backfill.md).
- **Every CHANGELOG entry has a real commit SHA ([RULE-2](../../../.agents/skills/koni-docs/references/rules.md)):** `pending` is not a valid SHA. `npx koni-docs backfill-commits` resolves them from `git log`. Enforced by [US-21.2](../stories/US-21.2-history-backfill.md).
- **5-layer consistency holds ([RULE-5](../../../.agents/skills/koni-docs/references/rules.md), [RULE-6](../../../.agents/skills/koni-docs/references/rules.md)):** every story's `prd_ref` resolves to **an `FR-N` *or* an `NFR-N`** in the PRD — a story can materialize a quality attribute instead of a feature, and pretending otherwise pushed real work (performance, accuracy, hardening) into `prd_ref: []` limbo ([CONTEXT D93](../../CONTEXT.md)); every epic's story list matches the file system; every sprint file's scope table is current; STATUS.md is auto-generated, never hand-edited; `npx koni-docs validate` exits zero. Enforced by [US-21.3](../stories/US-21.3-conformance-close-out.md).

## Acceptance criteria (propagated from stories)

- [x] The contributor map exists as `docs/notes/contributor-map.md` with every git identity resolved to a GitHub login — [US-21.1](../stories/US-21.1-contributor-identity-map.md)
- [x] Every FR-materializing `done` story has `version_shipped` set, every CHANGELOG entry has a real SHA, VERSION is bumped to **1.3.83**, and PRD.md reflects the current state — [US-21.2](../stories/US-21.2-history-backfill.md)
- [x] `npx koni-docs validate` exits zero; STATUS.md is regenerated; durable notes are graduated into CONTEXT.md / LESSONS.md — [US-21.3](../stories/US-21.3-conformance-close-out.md)

## What this epic actually found

The deliverable was supposed to be *tidy metadata*. What the verification pass produced was a
list of things the docs asserted and the code denied — which is the real output, and the
reason the charter above had to be rewritten:

| Found | Was | Is |
| --- | --- | --- |
| **AD-07** — "lightweight WsProvider read path, shipped v1.1.64" | recorded as shipped since 2022 | **never built**; the string `lightweight` has zero hits in `packages/*/src` at v0.4.1, v1.1.64 and v1.3.83 → [D95](../../CONTEXT.md), [D96](../../CONTEXT.md) |
| **NFR-11** — ≤72 MB memory budget | a stated requirement | **retired** — an MV2-era number for a mechanism that never existed, unmeasured in 302 releases |
| **FR-120** (Interlay lending), **FR-157** (NFT mint) | ✅ shipped | **⏸️ withdrawn** — removed from the product; a new status the PRD had no word for → [D92](../../CONTEXT.md) |
| **FR-23** (unified → solo split) | ✅ shipped | **📋 planned** — it was a *forward* AC inside a `done` multi-FR story → carved out as [US-3.9](../stories/US-3.9-unified-to-solo-account-split.md) |
| **EPIC-20** | 🔵 roadmap, untraced | **🟡 partially shipped** — 4 items had shipped and nobody recorded it; the epic was excluded from the trace set *because it was classified as roadmap* |
| **Earning T&C** (shipped 1.3.83) | a story with `prd_ref: []` | **FR-160** — the product shipped a capability the PRD never asked for → [D98](../../CONTEXT.md) |
| **2 duplicate stories**, 1 phantom integration ("Backprop") | in the story set | deleted — they described work that never existed |

Seven corrections, none of which the original charter permitted.
