# Story File — Full Template

> **File location**: `docs/sprints/stories/US-X.Y-<slug>.md`
>
> **Use when**: User asks to create or update a user story, when a planning
> tool (BMad / GStack / Superpowers) produces a story-shaped artifact, or
> when stub-creating a story before starting implementation (per SKILL.md §3a).
>
> **One rule above all others**: a story is the *contract* between the epic's
> functional requirement and the code that ships. It owns its own acceptance
> criteria, task breakdown, and verification commands. It does NOT own
> cross-cutting concerns (those belong to the epic) or system-wide invariants
> (those belong to ARCHITECTURE.md + CONTEXT.md).

---

## 1. Section index — what's required vs optional

Stories differ wildly in size. A 1-point chore can skip most sections; a
13-point cross-cutting refactor needs them all. Reviewers should be able to
tell *story size* from which sections are filled in.

| §   | Section                              | Tiny (1-2 pts) | Standard (3-5 pts) | Large (8-13 pts) |
| --- | ------------------------------------ | -------------- | ------------------ | ---------------- |
| 1   | Frontmatter                          | required       | required           | required         |
| 2   | Goal                                 | required       | required           | required         |
| 3   | Background                           | optional       | required           | required         |
| 4   | Acceptance criteria                  | required       | required           | required         |
| 5   | Tasks                                | required       | required           | required         |
| 6   | Dev notes — Architecture constraints | optional       | required           | required         |
| 7   | Dev notes — Cross-story dependencies | optional       | recommended        | required         |
| 8   | Dev notes — Performance budget       | optional       | optional           | required (if perf-sensitive) |
| 9   | Dev notes — What we did NOT do       | optional       | optional           | recommended      |
| 10  | Dev notes — References               | required       | required           | required         |
| 11  | Verification commands                | optional       | recommended        | required         |
| 12  | Changelog entry                      | required       | required           | required         |
| 13  | Implementation notes                 | filled during impl | filled during impl | filled during impl |
| 14  | Files modified                       | filled during impl | filled during impl | filled during impl |
| 15  | Cross-references                     | optional       | recommended        | required         |

---

## 2. Full template skeleton

````markdown
---
id: US-X.Y
title: "<Story title>"
epic: EPIC-X
status: backlog            # backlog | ready | in-progress | review | done | blocked | deprecated
priority: P1               # P0 | P1 | P2 | P3
points: 5                  # Fibonacci: 1 / 2 / 3 / 5 / 8 / 13 — see SKILL.md §3a-bis for scale + consult /sales-engineer or /marketing-ops on non-eng work
sprint:                    # nullable while backlog; set to sprint-YYYY-WNN when committed
version_shipped:           # MANDATORY (RULE-16) when status → done; bare semver e.g. `0.3.1`, NEVER `v0.3.1`
prd_ref: [FR-N]            # PRD Functional Requirements this story materializes — list of bare IDs only (RULE-17). FR-N / NFR-N here; AD-N goes in arch_ref. See references/frontmatter-spec.md.
arch_ref: [AD-N]           # OPTIONAL — ARCHITECTURE.md Architecture Decisions this story materializes (list of AD-N). Omit if none.
depends_on: [US-X.Y]       # OPTIONAL — other stories whose artifacts this story consumes (list of US-X.Y). Omit if none. Cross-story narrative belongs in §7.
assignee:                  # MANDATORY (RULE-15): commit AUTHOR — `git log -1 --format=%an <sha>`, NOT the session user (`gh api user`)
commit:                    # full SHA of landing commit (set at pre-commit). Multi-commit story: comma-separated SHAs, e.g. `47b4383, a76477c, 9a701de`
created: YYYY-MM-DD
updated: YYYY-MM-DD
external_deps:             # optional list of third-party systems / partners / legal reviews this story waits on. Example: [payment_gateway, resend_api, legal_review, sales_navigator_license]. Populate when story waits on calendar-time outside dev control — these stories are the most commonly undersized (SKILL.md §3a-bis).
---

## Story refresh — YYYY-MM-DD *(optional, recurring)*

<For mid-implementation re-scopes that don't warrant a brand-new story.
Append a dated block at the top of the body (after frontmatter, before
Goal) each time the story is re-scanned against new context. The
original Goal / AC numbering stays immutable; the refresh block records
what changed since the prior refresh and why. Koni-Finance-Final pattern.

Skip entirely on first authoring — only add when the story actually
needs a refresh.>

After re-scanning the source on YYYY-MM-DD against branch `<branch>`,
the following decisions were locked into this story:

- <decision 1>
- <decision 2>

## Goal

<1 paragraph: what user outcome this delivers and why it matters now.
Maps to the BMad "So that..." clause — articulate the value, not the
mechanism. For platform / infrastructure stories, name the downstream
stories that get to *stop worrying about* what this delivers.>

## Background

<2-4 paragraphs: why now, what alternatives were considered, surrounding
context that informs the design. This is the section a future maintainer
reads to understand *why this story exists* — without it, the AC list
looks arbitrary.

Cite:
- The PRD FR / AD this story materializes.
- The CONTEXT.md decision (D<N>) that authorized this approach, if any.
- The LESSONS.md entry that motivated this story, if any.
- Sibling stories this story is a continuation of, or correction to.

For stories that are *scope-reduced replacements* of an earlier plan,
state explicitly: what was the original plan, what changed, why.>

## Acceptance criteria

<Use Given/When/Then (BMad standard) for behavioral ACs. Use declarative
form for data / constraint / schema ACs. Each AC must be:
- **Independently testable** — a single failing AC fails the story.
- **Bound to a verification command** in §11 — every AC has a runnable check.
- **Edge-case aware** — include error handling, empty states, race conditions.

Number ACs `AC-N`. Story files NEVER renumber ACs after creation — even if
one is deleted, the gap stays so cross-references survive.>

- [ ] **AC-1** — **Given** {precondition}, **When** {action}, **Then** {expected outcome} **And** {additional criteria}
- [ ] **AC-2** — <declarative criterion — for schema, constraints, or static properties>
- [ ] **AC-3** — **Given** {edge case precondition}, **When** {action}, **Then** {expected error handling}

> **AC quality bar**: cover the unhappy path. If this story has a design
> spec, cross-reference relevant interaction states (empty, loading,
> error, populated). For storage-touching stories, an AC must cover RLS
> isolation. For audit-touching stories, an AC must cover the
> transactional contract (FR-93).

## Tasks

<Tasks are grouped with AC cross-references (BMad pattern). Each task
references which AC(s) it fulfills. Sub-tasks are indented and reference
specific file paths or symbol names. Prefer 4-8 top-level tasks per story;
if you have more than 10, the story is too big — split it.>

- [ ] **TASK-X.Y.1** — <action> — <rationale> (AC: 1, 2)
  - [ ] Subtask X.Y.1.1 — <specific sub-action with file path>
  - [ ] Subtask X.Y.1.2 — <specific sub-action with file path>
- [ ] **TASK-X.Y.2** — <action> — <rationale> (AC: 3)

## Dev notes

### Architecture constraints

<Relevant Architecture Decisions (AD-N) and patterns that constrain the
implementation. Reference ARCHITECTURE.md sections and CONTEXT.md entries
by ID. State here *what choices are foreclosed* — that prevents reviewers
asking "why didn't you do it differently".>

- [AD-N](../../ARCHITECTURE.md#architecture-decisions): <one-line summary of the decision and how it applies to this story>
- This story does NOT introduce new AD entries. <Or: "Introduces AD-N — see CONTEXT D<N>".>

### Cross-story dependencies

<Bullets in three groups:
- **Builds on:** stories whose output this story consumes.
- **Required by:** stories that cannot start until this lands.
- **Sibling:** stories shipping concurrently that touch shared code.

For each dependency, name the *artifact* (file, function, schema, fixture)
the dependency is on — not just the story ID.>

- Builds on [US-X.Y](US-X.Y-<slug>.md) — uses `<helper>` from `<file path>`.
- Required by [US-X.Z](US-X.Z-<slug>.md) — that story extends `<entity>` added here.
- Sibling [US-X.W](US-X.W-<slug>.md) — both touch `<file path>`; coordinate review.

### Performance budget

<Only include for stories where the epic publishes a performance budget
(see epic §14) OR where the story sits on a hot path. State the budget,
state how it is measured, and link to the test that defends it.>

- <Operation> overhead: ≤ <p95 number> ms p95.
- Measured by <test file> using <approach>.
- Story PR description must explicitly confirm this budget is met.

### What we explicitly did NOT do

<For stories that are scope-reduced or take a deliberate "do less now"
posture. List the alternatives that were considered and rejected, with the
trigger that would justify revisiting. This section prevents reviewers
from re-litigating the scope decision.>

- No <abstraction> — the registry stays light. Trigger to revisit: <number / event>.
- No <feature> — deferred to <story / phase>. Reason: <one sentence>.

### References

<Cite every technical reference with source path and section. Reviewers
chase these — a broken or missing reference is a reject signal.>

- [Issue #<N>](<URL>)
- [Source: PRD §8 FR-N](../../PRD.md#8-functional-requirements)
- [Source: ARCHITECTURE §<section>](../../ARCHITECTURE.md)
- [Source: CONTEXT D<N>](../../CONTEXT.md) <if a decision was recorded>
- [Source: LESSONS §<N>](../../LESSONS.md) <if a prior trap is being avoided>
- [Source: Design spec](../../design/US-X.Y-<slug>-design.md) <if applicable>

## Verification commands

<Every AC maps to a runnable command. Reviewers paste these into a
terminal — if they don't all pass, the story is not done. For declarative
ACs (e.g. "no file imports X"), use `rg` / `grep` and assert the line
count. For behavioral ACs, name the test file and case.>

| AC | Command |
|---|---|
| AC-1 | `pnpm --filter @workspace/<pkg> test <test-path>` |
| AC-2 | `rg "<pattern>" packages/ apps/ --type ts -l \| grep -v __tests__` returns only <expected files> |
| AC-3 | `grep -l "<marker>" <dir>` returns <expected count> files |

## Changelog entry

> This is the *exact* text that goes into CHANGELOG.md when the story
> ships. Draft it when the story nears completion. On ship, copy this
> into CHANGELOG.md under the new version header (see
> [templates/changelog.md](changelog.md)).
>
> Only include sections that have content. Omit empty sections.

### Added
- <Feature / component added>

### Changed
- <Behavior or API changed — old vs new>

### Fixed
- <Bug description + root cause in one sentence>

### Deprecated
- <What is still exported but JSDoc-marked `@deprecated`, with the replacement>

### Removed
- <What was dropped and why>

**Commit**: <full SHA>

## Implementation notes

<Filled *during* implementation. Workarounds, design tradeoffs, library
quirks, security notes, performance observations discovered along the
way. This is the section that gets harvested into LESSONS.md when a
trap or pattern emerges.>

<Initial draft: empty. Fill incrementally as you ship.>

## Files modified

<Filled *during* implementation. Group by package / app / area. One line
per file explaining what changed and why — not just what was added.>

**Created (<package>):**
- `<path/to/file.ts>` — <purpose>

**Modified (<package>):**
- `<path/to/file.ts>` — <what changed and why>

**Deleted:**
- `<path/to/file.ts>` — <reason for deletion>

## Cross-references

- [PRD FR-N](../../PRD.md#8-functional-requirements)
- [Epic EPIC-X](../epics/EPIC-X.md)
- [CHANGELOG vX.Y.Z](../../CHANGELOG.md)
- [CONTEXT D<N>](../../CONTEXT.md) <if a decision was recorded>
- [LESSONS §<N>](../../LESSONS.md) <if a pattern was codified>
- [Design spec](../../design/US-X.Y-<slug>-design.md) <if applicable>
````

---

## 3. Per-section guidance

### §1 Frontmatter

- `id` MUST match the filename prefix: `US-1.16-...md` → `id: US-1.16`.
  RULE-6 enforces this.
- `epic` MUST match an existing `EPIC-N.md` and the story MUST be listed
  in that epic's Stories table. `agile-sync-up.mjs` validates this.
- `status` lifecycle: `backlog → ready → in-progress → review → done`.
  `blocked` is a sub-state of `in-progress` (document the reason in
  Implementation notes). `deprecated` is a terminal state for stories
  retired before shipping (typically driven by a CONTEXT decision);
  cross-reference the deciding `D<N>` in the story body. Set
  `version_shipped` only on `done` transition; never before.
- `points`: Fibonacci only (1 / 2 / 3 / 5 / 8 / 13). A 13-pt story should
  almost always be split — large stories merge code without ever being
  reviewed in full. **For non-engineering stories (sales / marketing /
  content / ops), consult `/sales-engineer` or `/marketing-ops` before
  sizing** — gut-feel + Fibonacci alone systematically undersizes ~30-40%
  on these tracks (see SKILL.md §3a + §3a-bis for the routing matrix and
  calibration scale).
- `prd_ref` / `arch_ref` / `depends_on`: ID-typed list fields. Each
  entry MUST be a bare canonical ID matching the regex for its namespace
  (`^FR-\d+$` or `^NFR-\d+$` for `prd_ref`; `^AD-\d+$` for `arch_ref`;
  `^US-\d+\.\d+$` for `depends_on`). **Use YAML list form**
  (`prd_ref: [FR-04, FR-10]`) — the legacy CSV-string form invites
  prose contamination that breaks `koni-docs sync`. Prose, qualifiers,
  parenthetical scope notes, and ranges (`FR-28 .. FR-45`) all belong
  in the body (Background, Cross-story dependencies, Architecture
  constraints), NEVER in frontmatter. See RULE-17 and
  [`frontmatter-spec.md`](../frontmatter-spec.md) for the full
  contract and migration playbook.
- `commit`: stays empty until the landing commit exists. Filled at
  pre-commit time (RULE-2). Never `pending`.
- `assignee`: the person who **authored the work**, not whoever is writing
  the doc. For a **retroactive / codebase-discovered** story, derive it from
  the git author of the story's `commit` SHA — run
  `git log -1 --format='%an <%ae>' <sha>` — and **never** default to the
  current session's git user (that silently mis-credits another contributor).
  When the story spans commits by multiple authors (e.g. main work by one
  person + a follow-up fix by another), set `assignee` to the primary-work
  author and credit the others explicitly in Background / Tasks next to their
  SHA.
- `external_deps` *(optional)*: list of third-party systems, partners, or
  legal-review queues this story waits on. Populate when calendar wait time
  (outside dev control) is in the critical path — e.g.
  `[payment_gateway, resend_api, legal_review, sales_navigator_license,
  partner_signature]`. These stories are the most commonly undersized;
  surfacing the dep in frontmatter lets sprint planning account for the
  buffer and lets STATUS dashboards flag blocking risk. Stories with no
  external waits leave this field empty or omit it entirely.

### §2 Goal

- 1 paragraph, value-focused. Write it so a reviewer who knows nothing
  about this story can answer "what does the user gain when this ships?"
  in one sentence.

### §3 Background

- Write Background *before* the AC list. The AC list looks arbitrary
  without it.
- For scope-reduced stories: state the original plan, why it was
  rescoped, and where the deferred plan is preserved. Future maintainers
  often re-find this section when the trigger to revisit fires.

### §4 Acceptance criteria

- AC numbering is *immutable* after creation. If AC-3 is deleted, AC-4
  does NOT become AC-3. Cross-references in commits, PR descriptions,
  and downstream stories rely on stable AC IDs.
- Prefer Given/When/Then for behavioral ACs. Declarative form is fine
  for schema, constraints, lint guards.
- Each AC must be defended by exactly one command in §11 Verification.
- The unhappy path is a first-class AC, not an afterthought. Empty
  states, error responses, race conditions, RLS isolation, audit
  rollback — pick the ones that apply.

### §5 Tasks

- Tasks have AC cross-references in `(AC: N, M)` form. A task with no AC
  reference either fulfills no AC (cut it) or is missing an AC (add it).
- Subtasks name specific paths or symbols. "Update auth middleware" is
  not a subtask; "Update `packages/api/src/middleware/auth.ts` to call
  `permissionCache.get()` before DB fallback" is.
- Mark tasks `[x]` *as you complete them*, not all at the end (RULE-10).
  Reviewers use this to gauge progress mid-sprint.

### §6 Architecture constraints

- One bullet per AD that constrains the implementation. State *how* the
  AD applies, not just that it does.
- If the story introduces a *new* architecture decision (rare), name it
  here and append a CONTEXT.md entry in the same commit. RULE-7.

### §7 Cross-story dependencies

- Three groups: builds-on / required-by / sibling. Each names the
  *artifact* the dependency is on (file, function, schema, fixture)
  — not just the story ID.

### §8 Performance budget

- Required when the epic publishes a budget for this story, or when the
  story sits on a hot path (auth check, request-path middleware, dashboard
  aggregate, etc.).
- Budgets are numbers, not adjectives. Name the test that defends them.

### §9 What we explicitly did NOT do

- For stories that take a deliberate "do less now" posture. List the
  rejected alternatives and the trigger that would justify revisiting.
- This section prevents reviewers from re-litigating the scope decision
  and protects future-you from re-discovering the same trade-off.

### §10 References

- Every reference has a source path. Bare URLs without context belong
  in PR descriptions, not in story Dev Notes.

### §11 Verification commands

- Every AC has a runnable command. Reviewers paste them — if any
  command does not pass, the story is not done.
- For "no X exists" ACs, use `rg` / `grep` with an explicit expected
  output (file count, allowlist of paths).
- For "this test passes" ACs, name the test file *and the test case*
  if the file has more than one.

### §12 Changelog entry

- Drafted when the story is nearing `done`. Reviewers copy it verbatim
  into CHANGELOG.md at ship time — keep it ship-ready.
- Only include `### Added` / `### Changed` / `### Fixed` / `### Deprecated`
  / `### Removed` / `### Security` sections that have content.
- `**Commit**: pending` is NEVER acceptable. Fill the full SHA at
  pre-commit (RULE-2).

### §13 Implementation notes

- Filled *during* implementation, not before. Captures workarounds,
  library quirks, security notes, perf observations.
- When a note describes a pattern that will recur, also append a
  LESSONS.md entry and cross-reference.

### §14 Files modified

- Filled *during* implementation. Group by package; one line per file
  describing what changed and why.
- This section is harvested for code-review PR descriptions — write it
  for the reviewer, not for yourself.

### §15 Cross-references

- Link upward (PRD FR, Epic) and laterally (CHANGELOG, CONTEXT, LESSONS,
  Design spec) so a reader landing on the story can navigate the
  surrounding docs without re-grepping.

---

## 4. Filled mini-example (condensed)

```markdown
---
id: US-1.16
title: "Add Typed Per-Queue Helpers + Zod Validation Boundary on pg-boss"
epic: EPIC-1
status: done
priority: P1
points: 2
sprint: sprint-2026-W19
version_shipped: 0.3.1
prd_ref: [FR-93, FR-94]
arch_ref: [AD-06]
assignee: 
commit: a1b2c3d4e5f6...
created: 2026-05-09
updated: 2026-05-09
---

## Goal

Close the producer-side typing gap on top of the existing pg-boss runtime
(US-1.6) without introducing a registry/`defineConsumer` abstraction. Ship
`packages/api/src/queues/` containing Zod schemas for every queue payload
plus typed `enqueue*` helpers. Add a defensive Zod parse at the top of every
consumer handler. The producer-side typing problem is solved; downstream
stories adding new queues add one schema + one helper, no abstraction work.

## Background

[US-1.6](US-1.6-...md) shipped the pg-boss lifecycle wrapper and the
`enqueueAuditAppend` helper. Since then the project grew to **five queues**
with three production gaps (duplicate consts, unsafe `as` cast, no runtime
validation). This is the **scope-reduced replacement** for the original
Option X plan ([spec](../../superpowers/specs/2026-05-09-typed-queue-service-design.md));
the user pushed back ("we already have `getPgBoss` standardized") and we
re-scoped to fix only the highest-value gap (#4: no runtime validation)
without the larger abstraction.

## Acceptance criteria

- [x] **AC-1** — **Given** the new `packages/api/src/queues/` directory,
  **When** the package is built, **Then** it exports `QUEUE_NAMES`, 5 Zod
  payload schemas, and 4 new typed `enqueue*` helpers.
- [x] **AC-2** — **Given** any helper invoked with a payload missing a
  required field, **When** the call runs, **Then** it throws `ApiError`
  with `code === "VALIDATION_ERROR"`, and `getPgBoss().send` is **never**
  invoked.
- [x] **AC-3** — **Given** every direct `getPgBoss().send` / `boss.send`
  call site, **When** they are migrated to typed helpers, **Then**
  `rg "(getPgBoss\(\)|boss)\.send\(" packages/ apps/ --type ts -l | grep -v __tests__`
  returns only the helper implementation files.

## Tasks

- [x] **TASK-1.16.1** — `packages/api/src/queues/` scaffold (AC: 1)
  - [x] Subtask 1.16.1.1 — Create `schemas.ts` with 5 Zod schemas + `QUEUE_NAMES`.
  - [x] Subtask 1.16.1.2 — Create `helpers.ts` with 4 new typed helpers.
- [x] **TASK-1.16.2** — Migrate all direct producer call sites (AC: 3)
  - [x] Subtask 1.16.2.1 — `routes/safes.route.ts`: use `enqueueSafeDeployMonitor`.

## Dev notes

### Architecture constraints

- [AD-06](../../ARCHITECTURE.md#architecture-decisions) — pg-boss as event bus; this story does NOT change the substrate.
- Helper file location is centralized at `queues/helpers.ts`; **`enqueueAuditAppend` deliberately stays in `services/audit.service.ts`** because it owns the redaction wrap (FR-94).

### Cross-story dependencies

- Builds on [US-1.6](US-1.6-...md) — uses `getPgBoss()` and the `enqueueAuditAppend` precedent.
- Required by future EPIC-3 / 4 / 5 stories that introduce new queues — they add a schema + helper in one PR diff.

### Performance budget

- Helper overhead vs raw `boss.send`: ≤ 0.5 ms p95.
- Measured by `__tests__/queues/helpers.unit.test.ts`.

### What we explicitly did NOT do (vs Option X)

- No central typed registry — `QUEUE_NAMES` is the only registry, intentionally light.
- No `defineConsumer` / `defineBatchConsumer` wrappers — `boss.work` stays inline in each job file.
- No 100% coverage gate on `queues/` — ordinary unit tests + integration regression suite.

### References

- [Original spec (Option X, deferred)](../../superpowers/specs/2026-05-09-typed-queue-service-design.md)
- [Source: ARCHITECTURE §Component architecture](../../ARCHITECTURE.md)

## Verification commands

| AC | Command |
|---|---|
| AC-1, AC-2 | `pnpm --filter @workspace/api test packages/api/__tests__/queues` |
| AC-3 | `rg "(getPgBoss\(\)\|boss)\.send\(" packages/ apps/ --type ts -l \| grep -v __tests__` returns only `queues/helpers.ts` and `services/audit.service.ts` |

## Changelog entry

### Added
- `packages/api/src/queues/`: Zod schemas for all 5 pg-boss payload types; `QUEUE_NAMES` const; 4 typed `enqueue*` helpers.
- Defensive Zod parse at the entry of every consumer handler.

### Changed
- `enqueueAuditAppend` now Zod-validates after redaction (drops unsafe `as unknown as object` cast).
- 5 direct `getPgBoss().send` call sites migrated to typed helpers.

### Deprecated
- `AUDIT_APPEND_QUEUE`, `SAFE_DEPLOY_QUEUE`, ... consts — JSDoc-marked `@deprecated`, point at `QUEUE_NAMES.X`.

**Commit**: a1b2c3d4e5f6...

## Implementation notes

Shipped Option Y (helpers + Zod) instead of Option X (full registry +
`defineConsumer`) after a YAGNI challenge revealed that 4 of 5 identified
gaps were low-severity. Implementation took ~150 LoC across 5 new files +
11 modified; 38 new tests pass; zero new typecheck errors.

## Files modified

**Created (api package):**
- `packages/api/src/queues/schemas.ts`
- `packages/api/src/queues/helpers.ts`

**Modified (api package):**
- `packages/api/src/services/audit.service.ts` — Zod parse + drop cast.
- `packages/api/src/routes/safes.route.ts` — use helper.

## Cross-references

- [PRD AD-06](../../PRD.md)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [CHANGELOG v0.3.1](../../CHANGELOG.md)
```

See [US-1.16](https://github.com/Koniverse/Koni-Finance-Final/blob/main/docs/sprints/stories/US-1.16-design-and-implement-typed-queue-service-thin-typed-producer-on-pg-boss.md) and [US-1.1](https://github.com/Koniverse/Koni-Finance-Final/blob/main/docs/sprints/stories/US-1.1-extend-docker-compose-dev-infrastructure-with-redis-config-and-optional-services.md) in the Koni-Finance-Final repository for full reference stories.
