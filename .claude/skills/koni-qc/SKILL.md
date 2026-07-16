---
name: koni-qc
description: >
  Use when building test docs or running quality control — writing test cases, a
  test plan, a coverage matrix, traceability; edge cases, every AC needing
  positive/negative/boundary tests; security / performance /
  accessibility (NFR) testing; QA-ing a release, "is testing thorough / the suite
  too thin?"; where test files/reports go (docs/tests layout, per-US); the unit-test/coverage bar (a test misclassified, env-pending, or broken
  in the unit gate); automating
  the test loop (generate tests from specs, run → report → sync, CI gate, broken
  Covered-by handles, a reporter dropping cases); standing up the
  integration/e2e live-stack harness (RLS as a real user, seed e2e users); QC-ing
  a whole repo (QA epic, "is our testing done?"); making a run report
  decision-grade ("is our 100% honest?"); a bug escaped or a
  hotfix landed (bugs → regression tests, sweep CHANGELOG/git log for missed
  cases); verifying UI against DESIGN.md + the
  shadcn standard; or grading a skill ("score this SKILL.md") — even without naming koni-qc.
---
# koni-qc — QC methodology & coverage intelligence

> koni-qc is the **intelligence to derive exhaustive, traceable coverage from
> requirements** — the one thing koni-docs (templates), gstack (execution), and
> koni-harness (gate) don't provide. It *fills* those templates and *drives* that
> engine; it never reproduces them (the ownership split is §1).

---

## 1. What this owns vs. delegates

| Concern | Owner |
|---|---|
| Test-design techniques, edge taxonomy, AC↔TC matrix, NFR/security, risk priority, the quality rubric | **koni-qc** (this) |
| Test-doc templates / structure / `docs/tests/` layout | **koni-docs** — `references/templates/test-cases.md`, `test-report.md` (invoke; fill, don't redefine) |
| Execution (browser / systematic QA, bug reports) | **gstack** — `qa` / `qa-only` / `investigate` / `browse` (invoke) |
| UI verification against the repo's design | **gstack** `/design-review` — for any UI-bearing case, check it tracks the repo's `DESIGN.md` **and the shadcn standard** (both mandatory; criteria in `references/nfr.md` §UI) (invoke) |
| Commit/release gate, loop, epic selection | **koni-harness** — `gate-runner.sh`, `loop.sh`, `sprint.sh` (invoke) |
| Plan artifacts (brief → PRD → story) | **BMAD** (invoke) |
| Repo scaffold incl. the `docs/tests/` tree at setup | **koni-setup** (invoke) — koni-qc self-scaffolds the tree only when koni-setup isn't used (see [`test-organization.md`](references/test-organization.md)) |
| Skill-QC eval engines (when grading a *skill*) | **skill-creator** (triggering eval) · **writing-skills** (pressure-tests + best-practices rubric) · **`superpowers:code-reviewer`** (author-blind content) — invoked by [`skill-grading.md`](references/skill-grading.md) |

koni-qc is the **Review / QA stage** of the koni-harness loop, made rigorous. It
never re-implements the right-column owners.

---

## 2. Modes

> **`EPIC-N` is the container; the user story is the coverage unit.** Specs group
> per epic **directory** (`test-cases/EPIC-N/` — `index.md` + `US-x.y.md` per story)
> but coverage, traceability, and planning are measured **per US** (each TC
> `maps_to.us`) — see [`test-organization.md`](references/test-organization.md) §0–§1.

| Mode | What it does | Uses |
|---|---|---|
| **Author test-cases for EPIC-N** | Read the epic's koni-docs inputs (PRD/stories/AC/ARCH) → produce a complete `docs/tests/test-cases/EPIC-N/` (index.md frame + per-US row files) with the canonical rich-TC table + the AC↔TC coverage matrix + edge + NFR/security cases, risk-ordered; a mixed API+UI surface splits into **layered suites** (API by-endpoint + functional) with the orthogonal coverage matrices | `test-design.md` · `edge-coverage.md` · `nfr.md` · `traceability.md` · `layered-suites.md` + koni-docs template |
| **Run QC execution for EPIC-N** | Drive gstack per test case (for UI cases, run `/design-review` against the repo's `DESIGN.md` **+ the shadcn standard** — both mandatory); record results into koni-docs `test-report.md` run files with execution instrumentation (coverage % by AC/type, pass/fail, perf vs SLA) | `qc-workflow.md` §Execute + `report-quality.md` (the report content bar) + gstack (`qa`/`/design-review`) + koni-docs |
| **Release gate for vX.Y.Z** | Check entry/exit criteria; produce the koni-docs release report + ship decision; run the koni-harness gate | `qc-workflow.md` §Release + `quality-bar.md` + koni-harness |
| **Grade a skill (skill-QC)** | QC a *skill artifact* (not a product feature): score it /100 across 4 independent dimensions — triggering, rule-robustness, content, best-practices — to the **≥95 catalog standard** (re-grade the whole skill after any change, not just the diff) | `skill-grading.md` + skill-creator · writing-skills · `superpowers:code-reviewer` |
| **Set up / standardize test docs** | Apply the standard `docs/tests/` taxonomy + by-epic test-code layout + the 3-place sync rule; if the repo wasn't bootstrapped by koni-setup, self-scaffold the missing tree | `test-organization.md` (+ koni-setup scaffolds at setup; koni-docs owns the templates) |
| **Set the unit-coverage standard** | Own the per-function unit-test rule + coverage bar (the layer *below* the AC↔TC matrix); Dev authors the tests, koni-harness Self-verify enforces the bar | `unit-coverage.md` (+ koni-harness Execute/Self-verify; the repo's runner executes) |
| **Automate the test loop** | Turn authored specs into a running, self-reporting, CI-gated suite: generate TC-ID-named tests → run → reporter writes `report.md` → sync Status/coverage% to the story → CI gate. Closes the "specs written, `— (manual)`, no reports" stall | `test-automation.md` (+ the repo's runner + `.github/workflows`; koni-harness gate) |
| **Run the learning loop** | Operate koni-qc as a standing harness: turn every escaped bug into a REG test + a class finding + a generalization sweep; run the CHANGELOG + git-log change sweep so shipped changes never outrun the suite | `regression-learning.md` (+ `test-design.md` step 9 · `test-automation.md` signals · findings.md/bug-bash) |
| **QC a whole project** | Stand up QC across an existing repo (not one epic): create the **QA-tracking epic** (a coverage story per app epic + infra/process stories + the QA ownership model), author the strategy, enforce artifact locations, require ≥1 execution, and gate on a whole-project **Definition-of-Done** + a **depth bar** (never ship thin stubs) | `whole-project-qc.md` (+ koni-docs stories · koni-setup scaffold · gstack execution · koni-harness gate) |

---

## 3. Activation — intent → reference

| User intent | Load |
|---|---|
| "how do I turn this AC into test cases?" | `references/test-design.md` |
| "structure the suite" / "API test cases" / "functional/UI test cases" / "status-code / error-code coverage" / "test-data registry / fixtures **in the suite doc**" / "bug-fix retest rounds" | `references/layered-suites.md` |
| "what goes in the test report?" / "make the report decision-grade" / "report quality" / "skipped/blocked reasons" / "is our 100% honest?" (report content) | `references/report-quality.md` |
| "stand up the integration/e2e harness" / "test RLS as a real user" / "e2e can't log in" / "the local stack won't boot for tests" | `references/live-harness.md` |
| "a bug escaped / got hotfixed — now what?" / "turn this bug into tests" / "bug bash → tests" / "make the suite learn" / "what shipped since the last QC round?" / "sweep the changelog for missed cases" | `references/regression-learning.md` |
| "am I missing edge cases?" / "make coverage thorough" | `references/edge-coverage.md` |
| "trace AC to tests" / "TC IDs" / "coverage matrix" / "mark a TC deploy-only / ops-deploy" / "mark a TC verified-by-design-review / record the verification method" | `references/traceability.md` |
| "security / performance / accessibility / i18n testing" | `references/nfr.md` |
| "unit tests" / "test each function" / "unit coverage" / "TDD per function" / "why is my integration test failing/broken in the unit gate?" (lane scoping: `test-automation.md` §2) | `references/unit-coverage.md` |
| "automate the tests" / "generate tests from the spec" / "run + report + sync coverage" / "self-updating / CI-gated suite" / "set up CI for tests" / "test-reports empty, nothing runs" / "the reporter is dropping cases" / "broken Covered-by handles / coverage honesty" (pipeline/handle integrity) | `references/test-automation.md` |
| "set up QC for this project" / "audit our test coverage" / "stand up QA tracking" / "QA epic" / "is our testing done?" / "specs written but is QC complete?" / "QC the whole repo" (**across the whole repo, not one epic** — a single epic/release is the qc-workflow row above) | `references/whole-project-qc.md` |
| "does the UI match the design?" / "check against DESIGN.md" / "shadcn conformance" | `references/nfr.md` §UI / visual conformance (DESIGN.md + shadcn) → gstack `/design-review` |
| "run the whole QC process for **an epic / release**" (a whole *repo* → `whole-project-qc.md`) | `references/qc-workflow.md` |
| "is this test doc good enough?" / "grade it" | `references/quality-bar.md` |
| "grade this skill" / "score this SKILL.md" / "is this skill good enough?" / "QC a skill" | `references/skill-grading.md` |
| "where do test files/reports go?" / "test-reports folder layout (date-first vs epic-first)" / "set up test folders" / "test directory structure" / "test organization" | `references/test-organization.md` |
| "show me a worked example" | `references/customize-network-test-cases.example.md` |

---

## 4. The quality bar

koni-qc's promise is **test docs better than both** the weak hand-made Koniverse
suites *and* the best deliberately-authored ones. A suite is graded in three
bands (A beat the manual baseline · B match the production standard · C close
even its residual gaps) and passes only when it clears all of Band A and
demonstrably exceeds B and C. The bands, their items, and the pass rule live in
[`references/quality-bar.md`](references/quality-bar.md) — self-grade against it
before review; do not restate the bands here.

---

## 5. Reference index

| File | When to load |
|---|---|
| [`references/qc-workflow.md`](references/qc-workflow.md) | Running the QC lifecycle end-to-end (frame → design → review → execute → release gate); how it composes koni-docs / gstack / koni-harness |
| [`references/test-design.md`](references/test-design.md) | Deriving positive/negative/boundary cases from an AC (partitioning, BVA, decision tables, state-transition, pairwise, error-guessing) |
| [`references/layered-suites.md`](references/layered-suites.md) | Structuring the suite **by layer** to the exemplar bar — API by-endpoint tables (headers/payload/DB-changes/response-time), functional category-prefixed cases + UI-component rollups, the orthogonal coverage matrices (endpoint/status-code/error-code · pages/components/a11y), the named test-data registry, Open Questions, bug-fix retest rounds |
| [`references/report-quality.md`](references/report-quality.md) | The execution-report **content bar** — honest actuals + denominator honesty, skipped/blocked with reason+action, failed-by-category root cause, perf stats, density telemetry, evidence links. Load when producing or grading a run report |
| [`references/live-harness.md`](references/live-harness.md) | Standing up the **live-stack harness** — 2-credential RLS-as-user testing, per-test tenant isolation, self-seeding e2e, boot resilience, prod-safety rules. Load when integration/e2e needs a real stack that doesn't exist yet |
| [`references/edge-coverage.md`](references/edge-coverage.md) | The edge-case taxonomy applied to every feature so coverage stops at thorough, not happy-path |
| [`references/traceability.md`](references/traceability.md) | The TC-ID scheme, the canonical rich-TC table, and the **mandatory AC↔TC coverage matrix** + risk/regression tagging |
| [`references/unit-coverage.md`](references/unit-coverage.md) | The **per-function unit-test** layer below the AC↔TC matrix — the per-function rule, the TDD cycle, and the unit-coverage bar (koni-qc owns the bar · Dev authors · harness Self-verify enforces) |
| [`references/test-automation.md`](references/test-automation.md) | Load the moment specs are authored but `test-reports/` is empty — the generate → report → sync → CI spine (frozen parse contract + the **broken-handle enforcer** + the runner/CI bootstrap; reference reporter shipped at [`scripts/qc-report.mjs`](scripts/qc-report.mjs) with its contract self-test) |
| [`references/regression-learning.md`](references/regression-learning.md) | The **QC harness loop** — every escaped bug becomes a REG test + a class finding + a generalization sweep; the mandatory CHANGELOG/git-log change sweep + change-coverage ledger; the miss post-mortem. Load on any real bug, hotfix, bug-bash, or round start |
| [`references/whole-project-qc.md`](references/whole-project-qc.md) | Load when **standing up or auditing QC for a whole repo** (not one epic) — the layer above `qc-workflow.md`; the Modes row lists what it does |
| [`references/nfr.md`](references/nfr.md) | Non-functional coverage — security (lead), performance/SLA, accessibility, i18n, reliability, compatibility, observability |
| [`references/quality-bar.md`](references/quality-bar.md) | Grading a test doc against the three-band "better than both" rubric |
| [`references/skill-grading.md`](references/skill-grading.md) | Grading a **skill artifact** /100 across 4 dimensions (triggering · rule-robustness · content · best-practices); the harness Review stage uses it when building a skill |
| [`references/test-organization.md`](references/test-organization.md) | The standard `docs/tests/` taxonomy + by-epic/suffix test-code layout + the 3-place sync rule + status legend + scaffolding (koni-setup at setup, koni-qc self-scaffold fallback) |
| [`references/customize-network-test-cases.example.md`](references/customize-network-test-cases.example.md) | A worked pilot showing the standard + the uplift over a manual suite |

**Boundary reminder**: anything about the *doc template shape* is koni-docs';
anything about *running* a test is gstack's; the *gate* is koni-harness'. koni-qc
brings the method and the coverage — invoke the others, don't reproduce them.
