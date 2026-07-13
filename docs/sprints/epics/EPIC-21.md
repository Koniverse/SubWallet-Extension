---
id: EPIC-21
title: "Docs & Conformance Infrastructure"
status: backlog
prd_ref: []
created: 2026-07-09
updated: 2026-07-09
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

The architectural distinction this epic preserves: EPIC-21 **enriches and verifies**
existing doc artifacts — it never changes the product scope, the PRD's functional
requirements, or any epic's story set. After this epic, `koni-docs validate`
exits zero, and every subsequent PR's pre-commit checklist actually enforces
that invariant.

### Feature pillars

| # | Pillar | Stories | Purpose |
| --- | -------- | --------- | --------- |
| 1 | **Identity resolution** | [US-21.1](../stories/US-21.1-contributor-identity-map.md) | Resolve every `git shortlog` identity to one GitHub login, produce the contributor map that feeds the backfill's `assignee` field |
| 2 | **History backfill** | [US-21.2](../stories/US-21.2-history-backfill.md) | Backfill `version_shipped` into story files, CHANGELOG SHAs, sprint statuses, epic statuses, and bump VERSION → 1.3.82 |
| 3 | **Conformance verification** | [US-21.3](../stories/US-21.3-conformance-close-out.md) | Run the 5-layer invariant check, graduate durable notes into CONTEXT/LESSONS, regenerate STATUS.md, and make `koni-docs validate` exit zero |

### Out of scope

- **Branch rename (`master → main`, `subwallet-dev → dev`)** — explicitly dropped from the roadmap. Existing branches are kept unchanged for stability.
- **Build re-standardization (webapp/web-runner build targets)** — owned by [EPIC-1](EPIC-1.md) as part of the platform infrastructure.
- **Multi-repo canon (Chainlist, Mobile)** — owned by a separate downstream effort that consumes EPIC-21's verified doc surface.
- **Writing new feature documentation** — EPIC-21 backfills what exists; new feature doc is authored per existing convention.

## Stories

| ID | Title | Goal | Status | Version |
| --- | --- | --- | --- | --- |
| [US-21.1](../stories/US-21.1-contributor-identity-map.md) | Contributor identity map | Resolve every git identity to one GitHub login, producing the canonical contributor map | 👀 review | — |
| [US-21.2](../stories/US-21.2-history-backfill.md) | History backfill | Backfill version_shipped, CHANGELOG SHAs, sprint/status history, and bump VERSION | 👀 review | — |
| [US-21.3](../stories/US-21.3-conformance-close-out.md) | Conformance close-out | Run the 5-layer invariant check, graduate notes, make `koni-docs validate` exit zero | 📋 backlog | — |

## Cross-cutting invariants

- **Every identity maps to exactly one GitHub login ([RULE-15](../../../.agents/skills/koni-docs/references/rules.md)):** the contributor map is definitive; `assignee` in every story frontmatter uses the mapped login, never `git user.name`. Enforced by [US-21.1](../stories/US-21.1-contributor-identity-map.md).
- **Every story has a `version_shipped` ([RULE-16](../../../.agents/skills/koni-docs/references/rules.md)):** bare semver, no `v`-prefix. A story whose status is `done` without `version_shipped` is a defect. Enforced by [US-21.2](../stories/US-21.2-history-backfill.md).
- **Every CHANGELOG entry has a real commit SHA ([RULE-2](../../../.agents/skills/koni-docs/references/rules.md)):** `pending` is not a valid SHA. `npx koni-docs backfill-commits` resolves them from `git log`. Enforced by [US-21.2](../stories/US-21.2-history-backfill.md).
- **5-layer consistency holds ([RULE-5](../../../.agents/skills/koni-docs/references/rules.md), [RULE-6](../../../.agents/skills/koni-docs/references/rules.md)):** every story's `prd_ref` resolves to an FR in PRD's `Functional Requirements`; every epic's story list matches the file system; every sprint file's scope table is current; STATUS.md is auto-generated, never hand-edited; `npx koni-docs validate` exits zero. Enforced by [US-21.3](../stories/US-21.3-conformance-close-out.md).

## Acceptance criteria (propagated from stories)

- [ ] The contributor map exists as `docs/notes/contributor-map.md` with every git identity resolved to a GitHub login — [US-21.1](../stories/US-21.1-contributor-identity-map.md)
- [ ] Every `done` story has `version_shipped` set, every CHANGELOG entry has a real SHA, VERSION is bumped to 1.3.82, and PRD.md reflects the current state — [US-21.2](../stories/US-21.2-history-backfill.md)
- [ ] `npx koni-docs validate` exits zero; STATUS.md is regenerated; durable notes are graduated into CONTEXT.md / LESSONS.md — [US-21.3](../stories/US-21.3-conformance-close-out.md)
