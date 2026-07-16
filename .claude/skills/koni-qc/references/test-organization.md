# test-organization — the standard test-doc & test-code layout

> **Load when**: setting up a repo's test surface, or deciding *where* a test
> doc / test file goes. This is the **compass** — the folder taxonomy, the
> by-epic + suffix code layout, the 3-place sync rule, and the status legend.
> It is the standing standard; [`traceability.md`](traceability.md) owns the
> TC-ID scheme and the AC↔TC matrix, this owns *where things live*.

**Contents**: [Granularity: the unit is the US](#0-granularity-the-unit-is-the-user-story-not-the-epic) ·
[docs/tests taxonomy](#1-the-docstests-taxonomy) ·
[Test-code layout](#2-test-code-layout-by-epic-type-in-the-suffix) ·
[The 3-place sync rule](#3-the-3-place-sync-rule) ·
[State cleanup](#4-state-cleanup--idempotent-tests) ·
[Status legend](#5-status-legend) · [Scaffolding](#6-scaffolding-who-creates-the-tree) ·
[Ownership](#7-ownership-boundary)

Synthesized from the matured Senti-Quant QA reorg (2026-06-30) and generalized
for any Koniverse repo.

## 0. Granularity: the unit is the **user story**, not the epic

**Coverage, traceability, and QC planning are measured and tracked per US — not
per epic.** An epic is too coarse: "EPIC-04 is tested" hides that only 14 of its N
stories have a case. The honest, actionable unit is the story.

- **Coverage %** = (done stories with ≥1 covering TC) ÷ (done stories). Never
  "epics tested". A story counts as covered only when a real TC's `maps_to.us`
  points at it (see [`traceability.md`](traceability.md)).
- **The QC backlog is a per-US, risk-tiered list** — every shipped (`done`) story
  with no covering TC is a row, ordered Tier 1 (security / money / external
  surface) → Tier 2 (core data / perf) → Tier 3 (UI / lower-risk). This *by-US
  coverage plan* is the planning artifact, which **MUST live at
  `audits/QC-PLAN-BY-US-<date>.md`** (never the tests root), not an epic checklist.
  Standing up whole-repo coverage (the QA-tracking epic + this plan + the
  done-bar) is [`whole-project-qc.md`](whole-project-qc.md).
- **The AC↔TC matrix is anchored per story** (one block per US, its ACs → TCs) —
  this is already how `traceability.md` works.

**Case *volume* per US is doc-driven, not invented at the keyboard**: authoring for a
US may only start once Frame has secured its enumeration inputs — the technical-design
contract + UI-state inventory for the surfaces the US has
([`qc-workflow.md`](qc-workflow.md) §1) — because density is *derived* from those docs
([`test-design.md`](test-design.md) step 9), and a US authored straight from its AC
list silently lands at 1/10 density.

**Epic stays the *container*, US is the tracked *unit*.** Specs group by epic
(`test-cases/EPIC-N/` — a directory: `index.md` + one `US-x.y.md` per story, §1),
test code by epic (`…/epic/EPIC-NN/`), reports by date→epic — but inside them every
TC carries its `maps_to.us`, and what you *measure and plan* is the story. Don't
confuse the folder grouping (epic) with the coverage unit (US).

## 1. The `docs/tests/` taxonomy

Adopted from the ERP-02 field reorg (2026-07-02, at ~430–450 authored TCs and
264→531 passing tests) — **specs split per-US, reports date-first**:

```
docs/tests/
├── README.md             ← QA hub (entry point; links the coverage epic)
├── test-organization.md  ← STANDING: this standard (points here)
├── STRATEGY.md           ← STANDING: whole-repo test strategy (scope · risk posture · priority order · tooling)
├── findings.md           ← STANDING: open QA findings / impl-gap tracker (+ the change-coverage ledger, regression-learning.md)
├── test-cases/           ← CANONICAL source specs (machine-read by the reporter)
│   └── EPIC-N/           ← one DIRECTORY per epic (not a single file)
│       ├── index.md         epic overview: scope · out-of-scope · stories-in-scope
│       │                    table · AC↔TC matrix · US index · open/deferred scenarios
│       └── US-x.y.md        that story's rich TC rows + Covered-by handles
│                            (split further into US-x.y-api/functional siblings inside
│                             the epic dir when a layer exceeds ~15 cases, layered-suites.md)
├── test-reports/         ← per-run output, DATE-FIRST (regenerated; never hand-edited)
│   ├── YYYY-MM-DD/          one folder per run day (a run day covers MANY epics)
│   │   ├── auto-coverage.md    the machine coverage report (whole-repo, reporter-written)
│   │   └── EPIC-N/
│   │       ├── report.md          per-US index (summary + links)
│   │       ├── report-notes.md    QC-driver narrative (report-quality.md)
│   │       ├── report-manual.md / img-manual/   manual runs
│   │       └── US-x.y/            detailed per-US execution docs, ONE format for
│   │           │                  every epic (generated from the spec + the run):
│   │           ├── functional-test-cases.md   (UI / e2e)
│   │           └── api-test-cases.md          (backend / RLS / pure-helper)
│   └── summary/             LATEST-STATE roll-ups (regenerated each run):
│       ├── system-test-report.md    every TC + status, EPIC→US, for total review
│       └── us-coverage-summary.md   per-US coverage rollup
├── bug-bash/             ← end-of-sprint bug-bash reports — sprint-YYYY-WNN.md
└── audits/               ← point-in-time analyses (dated, historical; not maintained)
```

| Folder / file | Owner | Purpose |
|---|---|---|
| `STRATEGY.md` | QA | **whole-repo** test strategy — cross-epic scope, risk posture, priority order, tooling (a repo MAY instead keep strategy in dedicated stories, the ERP-02 variant — but then README must link them) |
| `test-cases/EPIC-N/` | koni-qc (Dev/PM) | the source specs — `index.md` (epic frame + AC↔TC matrix) + per-US TC-row files; the **single source of truth** for TC-IDs and `Covered-by` handles |
| `test-reports/` | the reporter (auto) | per-run output + latest-state `summary/`; **never hand-edited** (manual runs use `report-manual.md`) |
| `bug-bash/` | whole team | end-of-sprint break-it-together findings — feeds [`regression-learning.md`](regression-learning.md) |
| `audits/` | QA | dated one-off analyses (e.g. a koni-qc quality-bar grade); kept for history |

> **No `test-plan/` folder.** The per-epic plan content (scope, out-of-scope, risk
> map, priority order) lives in that epic's `test-cases/EPIC-N/index.md` — one place,
> next to the cases it frames (ERP-02 removed the folder 2026-07-02 after it went
> stale against the index files). Whole-repo strategy stays `STRATEGY.md` (or the
> stories variant above).

> **Why per-US spec files**: the US is the coverage unit (§0) and at real density
> (~40–150 cases/US) a single `EPIC-N.md` blows past what a reviewer or an agent can
> hold — the epic file's job (frame + matrix + index) and the story files' job (the
> rows) are different documents. `index.md` NEVER carries TC rows; a `US-x.y.md`
> NEVER re-frames scope.
>
> **Legacy accepted**: a repo already on the single-file `test-cases/EPIC-NN.md`
> layout keeps working (the reporter scans both); migrate to `EPIC-N/` on the next
> authoring pass that touches the epic. New adoptions use the directory layout.

> **The report path is a MUST, not a suggestion.** A run folder is
> **`test-reports/YYYY-MM-DD/`** (ISO date, one per run day) with per-epic subfolders
> — a run day covers many epics, so the date owns the folder and each epic nests
> inside (the old epic-first `EPIC-NN/<MMDDYYYY>/` shape created N duplicate date
> folders per run; it is **legacy-accepted**, and the validator in
> [`test-automation.md`](test-automation.md) §2 accepts both — new adoptions are
> date-first). `auto-coverage.md` (the whole-repo machine report) lives at the date
> level, not inside an epic. The first run must not invent its own layout.

> **Relationship to koni-docs (report layout vs report body).** koni-qc owns this
> **layout**; **koni-docs owns the report *body* templates** (per-execution +
> per-release aggregate). This layout supersedes koni-docs' older
> `test-reports/{runs,releases}/` path wherever koni-qc is adopted; a release-level
> rollup is still a koni-docs per-release report, placed under the same tree.
> (koni-docs' own `sprint-system.md`/`templates.md` still reference the legacy
> path — reconciling them to this layout is a tracked koni-docs follow-up.)

## 2. Test-code layout: by epic, type in the suffix

Test **code** (not docs) is organized **by epic, never by test type**:

```
<app>/tests/epic/EPIC-NN/<slug>.<cadence>.spec.ts
```

The **run cadence** is encoded in the file SUFFIX (not a sub-folder):

| Suffix | Cadence / runner | When |
|---|---|---|
| `*.integration.spec.ts` | API / server-side (calls actions directly) | per commit |
| `*.e2e.spec.ts` | end-to-end via real UI | per PR |
| `*.smoke.spec.ts` | light post-deploy smoke (real anchor) | per deploy / release |
| `*.unit.test.ts` | pure logic, per function (**Dev authors; koni-qc owns the unit-coverage bar, harness Self-verify enforces** — see [`unit-coverage.md`](unit-coverage.md)) | — |

- **No `integration/` or `e2e/` sub-folders** — keep files flat in the epic folder;
  group cases inside a file with `describe`.
- **A flat repo-root `tests/*.test.ts` layout is non-conformant — migrate it, don't
  tolerate it.** On adoption, if the repo already has flat suites (common in
  OpenSaaS/Vite-inherited repos), **generate the `<app>/tests/epic/EPIC-NN/` tree and
  move (or re-export) each suite into its epic folder** — do not leave "migrate as you
  go" open-ended, because it becomes "never" (the ERP-02 drift). The reporter
  ([`test-automation.md`](test-automation.md) §2) flags any suite living outside
  `tests/epic/` as non-conformant so the gap is visible, not silent.
- **Suffix ≠ TC-ID TYPE.** The TC-ID TYPE (`FUNC`/`NEG`/`BND`/`SEC`/`EDGE`/… per
  [`traceability.md`](traceability.md)) says *what the case tests*; the file suffix
  says *how/when it runs*. A `TC-NN.SEC-1` can live in an `.integration.spec.ts`
  or `.e2e.spec.ts` file depending on its cadence. Keep koni-qc's TYPE-based TC-ID;
  feature grouping (LINK/CRED/…) is expressed via the domain-prefix allowance in
  `traceability.md`, not by moving type out of the code.

## 3. The 3-place sync rule

One TC-ID threads through **three** places; change one → change all three:

> **The spec is the *sole authority* for a TC-ID.** A TC-ID means **one** thing across
> all three places. A Dev-authored unit file must **not coin its own** `TC-<EPIC>.<TYPE>-<n>`
> for a *different* case — reusing a spec ID for a different behaviour (the ERP-02 F-12
> collision, where `crypto.test.ts` `FUNC-3/BND-1/NEG-1` meant something other than the
> same IDs in `EPIC-2.md`) breaks sync silently. If a unit test asserts a spec'd case,
> reuse that case's ID; if it covers something the spec doesn't, it is a per-function
> unit test — name it by function+behaviour, **not** a TC-ID ([`unit-coverage.md`](unit-coverage.md)).
> The reporter flags any code TC-ID absent from the spec (orphan) or bound to a different
> case (collision).

1. **Source spec** — `docs/tests/test-cases/EPIC-N/US-x.y.md` (the source of truth: TC-ID + gherkin + yaml **`maps_to {us, fr, ac}`** — the `us` is mandatory; it's what makes per-US coverage computable, §0; legacy single `EPIC-NN.md` accepted, §1). Written *before* coding.
2. **Test code** — `…/tests/epic/EPIC-NN/<slug>.<cadence>.spec.ts`; the test name **starts with the TC-ID** so the reporter can parse it.
3. **Coverage story** — the `docs/sprints/stories/US-*.md` row: TC-ID → Status + coverage % + report link.

- **Spec → code** is a **generation step**, not manual copying — see
  [`test-automation.md`](test-automation.md) §1 (spec → runnable TC-ID-named test;
  it also materialises the `tests/epic/EPIC-NN/` tree, which the doc scaffold §6
  does *not* create).
- **Code → story** is automated by the **reporter contract**
  ([`test-automation.md`](test-automation.md) §2–§3): run → parse the TC-ID from each
  test name → write `report.md` → write back Status + coverage % + link to the story.
  koni-qc defines that contract (it is *not* gstack `qa`, which is browser QA only).
  Never hand-edit `test-reports/`.

## 4. State cleanup / idempotent tests

**What a test creates, the same test removes.** A test that links an account,
deploys, or creates a share-link MUST delete exactly that data when done, in an
`afterEach`/`finally` (runs even on mid-test failure) via a fixture cleanup
helper — only what it created, never pre-existing data. Tests must be idempotent:
same outcome every run. Read-only cases need no cleanup. (This is the operational
half of the reliability axis in [`nfr.md`](nfr.md).)

## 5. Status legend

- **Test-case spec files** (`test-cases/EPIC-N/*.md`) — icons OK: ✅ pass · ❌ fail
  (reproducible) · ⚠️ flaky · ⏸️ blocked · ⏳ env-pending · 🎨 design · 🚧 impl-gap ·
  📋 manual-only · 🏗️ ops-deploy · ⊘ retired · — not-written. (The word set `Not Executed / Pass / Fail / Blocked /
  Skipped` in [`traceability.md`](traceability.md)'s canonical Status column is the
  **pre-run** vocabulary for the same cell — `Not Executed` ≙ `— not-written` before a
  run, `Skipped` ≙ ⏸️ blocked; after a run the reporter's icon set above is
  authoritative. ⚠️ flaky and ⊘ retired are curation states the reporter never emits.)
- **US story files** (`sprints/stories/US-*.md`) — **plain words, no icons**
  (machine-parsed, diff-able): `done` · `failed` · `blocked` · `pending` ·
  `env-pending` · `design` · `impl-gap` · `manual` · `ops-deploy` · `covered-by X` ·
  `in-progress`. (`blocked` = a test ran
  but a precondition/dependency was unmet, distinct from `pending` = no test yet —
  the reporter write-back keeps them separate, see
  [`test-automation.md`](test-automation.md) §2.)
- **Run reports** — icons follow what the reporter emits; do not hand-edit.
- **The coverage formula (what counts as covered)** — field-proven at the ERP 100%
  drive: **covered = 🟢 automated + ⏳ env-pending + 🎨 design + 🏗️ ops-deploy**.
  `env-pending` is a **derived, lane-aware status**, not a Covered-by form: an
  automated-form handle whose file cadence is `*.integration/*.e2e/*.smoke` counts
  env-pending in a lane without that env (unit/Docker gate) — it is **verified in its
  own CI lane** ([`test-automation.md`](test-automation.md) §2/§4) and never counted
  broken locally. `design` comes from the fifth Covered-by form
  ([`traceability.md`](traceability.md)). `manual` and `PROPOSED:` are the two
  buckets that count as **uncovered** — driving them to zero is the 100% target.

## 6. Scaffolding: who creates the tree

- **If the repo is set up with koni-setup** — koni-setup creates **both** skeletons at
  bootstrap: the `docs/tests/` doc tree **and** the `<app>/tests/epic/` **code** root
  (it owns the directory skeleton; bodies come from koni-docs templates and this
  standard). Scaffolding *only* the doc tree — the historical gap — is what let a repo
  keep flat `tests/*.test.ts` with no forcing function to migrate (see §2).
- **If the repo does NOT use koni-setup** — koni-qc **self-scaffolds** the missing
  trees (additive, only writes absent paths — **both** the doc tree and the code root):

```sh
mkdir -p docs/tests/test-cases docs/tests/bug-bash docs/tests/audits   # spec dirs test-cases/EPIC-N/ are created per epic at authoring time
[ -f docs/tests/README.md ]            || printf '# docs/tests — QA hub\n\n> See test-organization.md for the standard.\n' > docs/tests/README.md
[ -f docs/tests/test-organization.md ] || printf '# Test organization\n\n> Follows koni-qc references/test-organization.md.\n' > docs/tests/test-organization.md
[ -f docs/tests/STRATEGY.md ]          || printf '# Test strategy\n\n> Whole-repo test strategy: scope · risk posture · priority order · tooling. Per-epic framing lives in test-cases/EPIC-N/index.md.\n' > docs/tests/STRATEGY.md
[ -f docs/tests/findings.md ]          || printf '# Open QA findings\n' > docs/tests/findings.md
[ -f docs/tests/test-cases/README.md ] || printf '# Test cases\n\n> One EPIC-N/ dir per epic: index.md (frame + matrix) + US-x.y.md (rows) — via koni-docs templates/test-cases.md\n' > docs/tests/test-cases/README.md
# the CODE tree — the doc scaffold historically stopped here; create it too (<app> = the package that owns tests):
mkdir -p "${APP:-.}/tests/epic" && [ -e "${APP:-.}/tests/epic/.gitkeep" ] || : > "${APP:-.}/tests/epic/.gitkeep"
# report folders are created on first run: docs/tests/test-reports/YYYY-MM-DD/ (+ summary/)
```

> **READMEs**: the three root standing docs always exist; `test-cases/` also
> carries a one-line `README.md` (it's the most-edited subdir). The other empty
> framework dirs (`bug-bash/`, `audits/`) are kept in git with a `.gitkeep` rather
> than a stub, and `test-reports/` isn't created until a run.

Only create `test-reports/YYYY-MM-DD/` when a run actually produces a report —
don't pre-create empty dated folders.

## 7. Ownership boundary

koni-qc owns this **standard** (where test docs live + the conventions);
**koni-docs** owns the doc-body **templates** that fill `test-cases/` /
`test-report.md`; **koni-setup** **scaffolds** the tree at setup; the **repo's test
runner + the reporter contract** ([`test-automation.md`](test-automation.md) §2) run
the code tests and emit `report.md` (**gstack** runs only interactive/browser QA +
`/design-review`, not the automated suite); **koni-harness** gates the commit. koni-qc
composes them — it never reproduces a template, a runner, or the scaffolder.
