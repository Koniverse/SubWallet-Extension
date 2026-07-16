# qc-workflow — the QC lifecycle (frame → design → review → execute → release gate)

> **Load when**: you are running QC end-to-end for an epic or release. This is the
> spine that sequences the other references and the delegated skills. koni-qc owns
> the **methodology**; every concrete action below **invokes** a delegate
> (koni-docs / gstack / koni-harness / BMAD) and never reproduces it.

The five stages are gated: a stage's exit is the next stage's entry. The matrix
from [`traceability.md`](traceability.md) is the artifact that flows through all of them.

---

**Contents**: [1. Frame](#1-frame) · [2. Design](#2-design) ·
[3. Self-review](#3-self-review) · [3b. Generate](#3b-generate--spec--runnable-tests) ·
[4. Execute](#4-execute) · [5. Release gate](#5-release-gate) ·
[Entry / exit criteria](#entry--exit-criteria) ·
[Test-data & fixtures strategy](#test-data--fixtures-strategy) ·
[Test lifecycle](#test-lifecycle)

---

## 1. Frame

Decide *what* is under test and *when* it is done.

- **Pick the user story (the unit)** — invoke **koni-harness `sprint.sh`** to select
  the target **US** (do not hand-pick). The **US is the unit of coverage and
  planning, not the epic** (see [`test-organization.md`](test-organization.md) §0);
  the epic is just the file container. For a backlog, build a **per-US, risk-tiered
  coverage plan** (every shipped `done` story with no covering TC, ordered
  Tier 1 security/money/external → Tier 2 core/perf → Tier 3 UI) and attack in
  that order — not "epic by epic". **For a whole repo** (not one epic), first stand
  up the QA-tracking epic + strategy + Definition-of-Done via
  [`whole-project-qc.md`](whole-project-qc.md) — this per-epic lifecycle then runs
  inside it, and QC is not "done" on specs alone (that file's §5 done-bar).
- **Read the system-design docs IN DETAIL — BEFORE any test design (MANDATORY).**
  Invoke **koni-docs** to read the PRD FRs, the **story + its AC**, ARCHITECTURE,
  `DESIGN.md`, and every per-US design artifact (technical design, UI/UX spec) —
  **in full, not skimmed**. These are the source of truth; AC are the units the
  matrix traces, and each TC will `maps_to` this US.
- **Secure the two enumeration inputs (author them from code if absent).** 10× density
  cannot be conjured from a 17-line AC list — the exemplar's 154 rows are *mechanically
  derived* from richer per-US docs. Before Design, the US must have:
  1. a **technical-design contract** — routes/RPCs/RLS policies + request/response
     schemas + an **error-code table** (feeds the endpoint/status/error enumerations);
  2. a **UI-state inventory** — components × states (loading/disabled/empty/error/
     toast/focus) (feeds the functional enumerations).
  If either doesn't exist as a doc, **derive and write it from the code first** (a
  stub in `docs/design/` or the story), then design tests from it. Skipping this is
  how density silently defaults to the AC list. **Scope the inputs to the surfaces the
  US actually has** — a US with no UI owes no UI-state inventory, a US with no API/RPC
  surface owes no endpoint contract; only the inputs for surfaces that exist are
  mandatory.
- **Derive ACs if none are written** — the whole method is AC-anchored, so if the
  story has FRs but no story-level acceptance criteria, derive them first: turn
  each FR / user-facing behaviour into one testable, observable AC (a *Given →
  When → Then* the matrix can trace). Prefer invoking **BMAD** to author the
  missing ACs back into the story; never invent untracked ACs that live only in
  the test doc. If an FR is too vague to yield an AC, raise it as a PRD/story gap.
- **Run the change sweep (MANDATORY on any repo with a prior QC round)** — read the
  CHANGELOG **and** `git log` since the last round, verify every feat has covering
  TCs and every fix has a `REG` TC, and update the change-coverage ledger —
  [`regression-learning.md`](regression-learning.md) §change-sweep. A fix with no
  REG TC is a confirmed miss and enters the miss post-mortem before new authoring
  starts (the miss tells you where the derivation is blind).
- **Define scope** — in / out of scope; which surfaces; regression blast radius.
- **Define entry / exit** — the criteria below; written before any case is authored.
- **Define environment** — target build, data, accounts, feature flags.

**Exit**: target US chosen (or a per-US tiered backlog), **design docs read in full +
the two enumeration inputs present** (TD contract + UI-state inventory), **change
sweep done + ledger updated** (when a prior round exists), scope + entry/exit +
environment written. **Design may not start without them.**

---

## 2. Design

Author the cases into the koni-docs container — fill its template, never copy it.

- **Container** — author into **`docs/tests/test-cases/EPIC-N/`** (koni-docs
  templates; [`test-organization.md`](test-organization.md) §1): the epic frame +
  AC↔TC matrix into `index.md`, the TC rows into that story's `US-x.y.md` — never
  rows into the index, never scope into a US file. (Legacy single `EPIC-NN.md`
  repos: keep the file until the next epic-wide pass.)
- **Derive cases** — for each AC, apply [`test-design.md`](test-design.md)
  (partitioning, BVA, decision tables, state, pairwise) to enumerate
  positive + negative + boundary; apply [`edge-coverage.md`](edge-coverage.md) so
  coverage stops at thorough, not happy-path; apply [`nfr.md`](nfr.md) for the
  security / perf / a11y / etc. rows that the trigger requires.
- **UI ACs get a mandatory design-review case** — for any UI-bearing AC, add the
  `TC-<EPIC>.UI-<n>` conformance case (`test-design.md` step 8): it must **pass gstack
  `/design-review` against `DESIGN.md` AND the shadcn standard** ([`nfr.md`](nfr.md) §UI).
  The Design stage is not complete for a UI AC until this case exists.
- **Fill the canonical table** — every case is one rich-TC row per
  [`traceability.md`](traceability.md) (TC-ID · priority · test-data · preconditions ·
  action · expected · perf · side-effects · covered-by).
- **Shape the suite by layer** — a US with an API surface and/or UI splits into the
  API + functional suites of [`layered-suites.md`](layered-suites.md): by-endpoint
  tables, category-prefixed functional cases, the orthogonal coverage matrices
  (endpoint/status-code/error-code · pages/components/a11y), the named test-data
  registry, and an `## Open Questions` section for every spec ambiguity found.
- **Build the AC↔TC matrix** — the mandatory artifact, per
  [`traceability.md`](traceability.md): every AC → ≥1 positive AND ≥1 negative AND
  ≥1 **boundary-or-edge** TC (a `BND` *or* `EDGE` case fills the third slot),
  each a distinct case (no double-counting).

**Exit**: every AC mapped; the canonical table + the AC↔TC matrix are complete.

---

## 3. Self-review

Grade the suite before anyone executes it.

- **Grade against [`quality-bar.md`](quality-bar.md)** — all of Band A **and Band D
  (density/exhaustiveness)**; demonstrably exceed Band B and Band C.
- **No orphans** — no AC without a TC; no TC without an AC (per the completeness
  rule in [`traceability.md`](traceability.md)).
- **Coverage classes present** — edge taxonomy applied; required NFR sections filled.
- **Density sanity check (warn, not a gate)** — the 3-slot matrix is a floor; a US
  with an API surface and/or UI that lands **under ~30 atomic cases** is presumed
  **under-derived** until justified: re-run [`test-design.md`](test-design.md) step 9
  (cross-multiply shared classes × surfaces — the exemplar density is ~150/US) and
  either derive the missing products or record *why* this US is genuinely small in
  `## Open Questions`. A green matrix with an unmultiplied surface still fails this
  check.

**Exit**: Band A fully cleared; **Band D cleared or explicitly justified**; zero
orphans. Fail → return to **Design**.

---

## 3b. Generate — spec → runnable tests

A graded spec is not automated until each TC is a **runnable test**. This is the
step that was missing when the loop stalled at "specs written, `— (manual)`,
`test-reports/` empty".

- **Generate a test per TC**, named starting with its TC-ID, into
  `<app>/tests/epic/EPIC-NN/…` — the full contract is
  [`test-automation.md`](test-automation.md) §1 (it also materialises the
  `tests/epic/` tree, which the doc scaffold does not create).
- **Write the `Covered-by` handle back** into each spec row (flip `— (manual)`).
- Per-function **unit** tests remain Dev-authored ([`unit-coverage.md`](unit-coverage.md));
  the AC↔TC **integration/e2e/smoke** tests are generated here.

**Exit**: every Critical/High TC has a runnable, TC-ID-named test; no spec row
left `— (manual)` for an automatable case.

---

## 4. Execute

Run the generated tests and instrument the results — **koni-qc drives + gates;
the repo's runner executes** (koni-qc never runs tests itself).

- **Code tests (unit / integration / e2e / smoke)** — run with the repo runner and
  the **reporter contract** ([`test-automation.md`](test-automation.md) §2): run →
  parse the TC-ID from each test name → write `test-reports/YYYY-MM-DD/EPIC-N/report.md` (+ `auto-coverage.md`, `summary/`)
  → **write back Status + coverage % + link to the story** (§3 sync). This is the
  automation, not a hand-fill.
- **UI-bearing cases** — additionally drive gstack `/design-review` against the repo's
  `DESIGN.md` **and the shadcn standard** ([`nfr.md`](nfr.md) §UI); a UI case isn't done
  until it passes **both** (record any `DESIGN.md`-or-shadcn deviation as a failure with
  the TC-ID). gstack `qa` / `qa-only` / `investigate` / `browse` remain the tools for
  interactive/browser flows a headless runner can't cover.
- **Instrumentation** — coverage % **per US** and by type, pass / fail / blocked, and
  perf vs SLA ([`nfr.md`](nfr.md)) — emitted by the reporter, not typed by hand.
- **The report meets the content bar** — honest actuals, skipped/blocked with
  reason + action, failed-by-category root cause, perf stats, evidence links
  ([`report-quality.md`](report-quality.md)); a bare pass/fail tally does not exit
  this stage.
- **Scaling a whole-repo conversion: fan out per epic/domain with a repoint
  contract.** The pattern that took ERP 9.3%→100% in ~34h: spawn **one agent per
  epic/domain** (koni-harness [`parallel-orchestration.md`](../../koni-harness/references/parallel-orchestration.md)
  Tier B), each authoring real tests against the live stack
  ([`live-harness.md`](live-harness.md)) + self-verifying, returning a **JSON repoint
  contract** — `{tcId → handle, deferred[], prodBugs[]}` — while the **orchestrator
  alone** re-points the specs centrally, re-runs the full suites under the
  broken-handle enforcer, fixes surfaced bugs through the gate, and commits per
  round. Workers never edit specs directly (single-writer, no repoint races).

**Exit**: every Critical/High case executed via the runner/reporter (or `/design-review`
for UI); `report.md` written; stories synced.

---

## 5. Release gate

Turn results into a ship decision.

- **Check entry / exit** — exit criteria met (below). If not, the gate fails.
- **A CI test gate exists** — the suite + coverage threshold run on every push/PR
  (bootstrap it if absent: [`test-automation.md`](test-automation.md) §4). Without it
  the suite silently rots — the #1 finding of the koni-erp-02 audit.
- **Release report** — invoke **koni-docs** to produce the release report + ship
  decision from the run.
- **Commit / gate** — invoke **koni-harness `gate`** to commit and gate the release.

- **Close the learning loop** — every bug this cycle surfaced (failed TC, bug-bash,
  prod escape during the round) has its three things (REG TC + class finding +
  generalization sweep) per [`regression-learning.md`](regression-learning.md);
  the change-coverage ledger has this round's row. A release gate that ships bugs
  forward without REG cases re-arms them.

**Exit**: exit criteria met, release report produced, learning loop closed
(REG cases + ledger row), koni-harness gate green.

---

## Entry / exit criteria

| | Entry | Exit |
|---|---|---|
| **Inputs** | PRD/stories/AC/ARCH read; env ready | — |
| **Coverage** | scope agreed | AC↔TC matrix complete, no orphans |
| **Generation** | spec graded | every Critical/High TC has a runnable TC-ID-named test; no automatable case left `— (manual)` |
| **Execution** | suite generated | all Critical/High run via runner/reporter; `report.md` written; stories synced; 0 Critical failures open |
| **CI gate** | runner + coverage script exist | the repo's CI runs the suite + coverage threshold on every push/PR/build (Actions, or the container build gate — `test-automation.md` §4) |
| **NFR** | required triggers identified | required NFR sections executed |
| **Perf** | SLA budgets set | p95 within budget or waiver logged |
| **Decision** | — | release report + ship decision recorded |

---

## Test-data & fixtures strategy

Decide once, in **Frame**; the backup had none.

- **Concrete + reusable** — every TC carries a real value (no "valid input").
- **Fixtures** — seed data, accounts, and tokens defined as named, re-creatable
  fixtures; teardown restores state.
- **Isolation** — each run starts from a known state; no cross-run contamination.
- **Sensitive data** — secrets injected from env, never committed.

---

## Test lifecycle

Every case has a state; the suite is curated, not append-only.

- **active** — in the current suite; runs each relevant cycle.
- **deprecated** — superseded or feature removed; keep the TC-ID (never renumber),
  mark deprecated, stop running.
- **archived** — moved out of the active file but retained for history; referenced
  by ID in reports / lessons.

`RC-` regression cases ([`traceability.md`](traceability.md)) stay **active** every
release by definition — they are the regression scope.
