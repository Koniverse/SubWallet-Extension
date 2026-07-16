# test-automation — the loop that makes authored specs run and self-update

> **Load when**: you have authored `test-cases/EPIC-N/` specs (TC-IDs + AC↔TC
> matrix) and now need to **automate** them end-to-end. The authoring refs
> ([`traceability.md`](traceability.md), [`test-design.md`](test-design.md),
> [`edge-coverage.md`](edge-coverage.md)) produce the specs; **this file is the
> chain that turns a spec into a running, self-reporting, CI-gated suite.**
> Without it koni-qc stops at "specs written, `— (manual)`, `test-reports/` empty".

**Contents**: [The automation spine](#the-automation-spine) ·
[1. Generate](#1-generate-spec--runnable-test) · [2. Report](#2-the-reporter-contract) ·
[3. Sync](#3-story-write-back-code--story) · [4. CI gate](#4-ci-gate--runner-bootstrap) ·
[Ownership](#ownership--why-a-contract-not-a-vendored-tool)

## The automation spine

Five steps; **1→2→3 is the unbroken spine** (generate → report → sync), tree-scaffold
is a prerequisite of 1, CI makes it enforced:

```
authored spec (TC-IDs)               ← authoring refs (done)
   │  §1 GENERATE
   ▼
tests/epic/EPIC-NN/<slug>.<cadence>.spec.ts   (test name STARTS with the TC-ID)
   │  run with the repo runner (vitest / jest / pytest / playwright) → JSON
   ▼  §2 REPORT (the reporter contract)
docs/tests/test-reports/YYYY-MM-DD/EPIC-N/report.md   (reporter is the ONLY writer)
   │  §3 SYNC (story write-back)
   ▼
docs/sprints/stories/US-*.md   ← Status + coverage% + report link updated
   │  §4 CI GATE
   ▼
.github/workflows/*.yml   ← runs the suite + coverage threshold on every push/PR
```

> **Do NOT delegate this to "gstack `qa`".** gstack `qa` / `/design-review` is
> interactive **browser** QA — it does not generate unit/integration tests, parse a
> TC-ID → pass/fail, or write `report.md`. Those are the contracts below.

## 1. Generate: spec → runnable test

For each `TC-<EPIC>.<TYPE>-<n>` row in `test-cases/EPIC-N/US-x.y.md` (legacy single `EPIC-NN.md` accepted):

- **Materialize the code tree** first (it is NOT created by the doc scaffold in
  [`test-organization.md`](test-organization.md) §6): `mkdir -p <app>/tests/epic/EPIC-NN`.
- **Emit one test whose name STARTS with the TC-ID** so the reporter (§2) can parse
  it — `test('TC-2.SEC-1 — tampered ciphertext is rejected', …)`. File:
  `<app>/tests/epic/EPIC-NN/<slug>.<cadence>.spec.ts`, where the **cadence-suffix is
  how/when the case runs** (`.integration` per-commit · `.e2e` per-PR · `.smoke`
  per-deploy) — **not** the TC-ID TYPE (suffix ≠ TYPE, per
  [`test-organization.md`](test-organization.md) §2). This step generates the AC↔TC
  spec tests only; it does **not** emit `.unit.test.ts` files (those are Dev-authored,
  see the Ownership note below).
- **Map the canonical columns → arrange/act/assert**: `Test data` + `Preconditions`
  → arrange/fixtures; `Action/Request` → act; `Expected` → assert; `Side-effects` →
  post-assert. Group cases by feature with `describe`.
- **Write the `Covered-by` handle back** into the spec row: `<path>.spec.ts::<name>`
  (per [`traceability.md`](traceability.md)); flip the row from `— (manual)`.

**Ownership.** The **AC↔TC-spec tests** (integration/e2e/smoke authored from
the `EPIC-N/` spec) are **koni-qc-driven generation** — the agent generates them under this
step. The **per-function unit tests** ([`unit-coverage.md`](unit-coverage.md)) stay
**Dev-authored** alongside the code. Two authorship models, one runner + reporter.

## 2. The reporter contract

Turns a run into `report.md` — deterministic, no hand-editing.

- **Input**: the runner's machine output — `vitest run --reporter=json`,
  `jest --json`, `pytest --json-report` (needs the `pytest-json-report` plugin
  installed — it is **not** in pytest core), or `playwright test --reporter=json`.
- **Parse rule (per test) — FROZEN as an exact regex, not prose**: the TC token is
  `TC-[0-9A-Z]+\.[A-Z][A-Z0-9]*-\d+` — the TYPE slot is `[A-Z][A-Z0-9]*`, **digits allowed
  after the first letter**. A `[A-Z]+` TYPE regex silently drops every `E2E` and `A11Y`
  case (a real field bug — ERP lost 9 cases before catching it). Match the **first TC
  token in the runner's full test name** — runners prefix `describe` titles, so a strict
  leading anchor breaks on `fullName`; §1's naming rule (test title STARTS with the
  TC-ID) is what keeps "first token" and "the case's own ID" the same thing. Extract →
  `{tcId, result: passed|failed|skipped, durationMs, error?}`. A test whose
  name has no TC-ID is an **orphan test**; a test whose TC-ID is **absent from the spec**
  is an **orphan ID**, and one whose TC-ID exists in the spec but asserts a *different*
  case is a **collision** (the ERP-02 F-12 bug) — flag all three, the spec is the sole
  authority for TC-IDs (test-organization §3).
- **Spec-scan rule — only real TC rows count**: when enumerating spec tables, a row counts
  as a case **only if its first cell matches the frozen TC regex** — the `| TC-ID |`
  header, separator rows, and prose lines are skipped (counting them inflated ERP's
  total by 30). The parse contract MUST ship with a **self-test fixture** so a regressed
  reporter is caught, not discovered in production counts.
- **The broken-handle enforcer (what makes any "100%" trustworthy)**: every `Covered-by`
  handle in **automated form** MUST resolve to a test that exists in the run **and
  passed** — a cited test that is missing or failing is a **broken handle**, the report
  exits non-zero, and the gate goes red. **Broken = 0 is the bar.** From the moment this
  runs, coverage cannot be faked by editing a spec cell (the ERP drive ran ~40 report
  cycles at broken = 0). Duplicate TC-IDs across files are flagged the same way.
- **The enforcer is LANE-AWARE (env-pending, the field refinement)**: an
  automated-form handle whose file cadence is `*.integration/*.e2e/*.smoke` needs a
  live env — in a lane that lacks it (the unit/Docker gate, a DB-less local run) a
  missing such test folds to **⏳ `env-pending`** (its own bucket; still *covered*),
  **never broken** — it is verified in its own CI lane
  ([`live-harness.md`](live-harness.md), §4 item 4). In the **full lane** (CI job with
  services / a local live-stack run) the same handle IS enforced: missing or failing
  ⇒ broken. This is what lets a repo flip `— (manual)` rows to live handles without
  false-reding the unit gate (the ERP drive ran 244 env-pending handles this way).
  The lane is an explicit reporter input, never guessed from "did anything fail" —
  and a **closed set that fails closed**: only `unit` and `full` are valid; any other
  label (a typo, a CI job name like `integration`) must refuse to run rather than
  silently un-enforce (the reference reporter exits 2).
- **Conformance flag**: a suite file living **outside `<app>/tests/epic/EPIC-NN/`** (a
  flat `tests/*.test.ts`) is **non-conformant** — surface it in the report so the
  unmigrated layout (test-organization §2) is visible, not silent.
- **Aggregate to one row per TC-ID** (a TC-ID can back several tests — a `describe`
  group or parametrized cases). Fold its tests: **any `failed` ⇒ the TC is `failed`**;
  else **any `skipped` ⇒ `blocked`**; else **`passed`**. One TC-ID → one report row.
- **Reconcile against the spec, not just the run.** Enumerate every `TC-<EPIC>.<TYPE>-<n>`
  under `test-cases/EPIC-N/` — `index.md` + every `US-x.y.md` + any layered siblings
  ([`layered-suites.md`](layered-suites.md); legacy single `EPIC-NN.md` accepted —
  the scan is **recursive** over `test-cases/`);
  a TC with **no test in the JSON** is `not-written` (or, if
  the spec row is flagged manual-only `📋`, `manual`; or, if its `Covered-by` is
  `PROPOSED:<path>::name`, **planned automation** — still counts as *uncovered*, see
  [`traceability.md`](traceability.md)) — emit the row anyway. This is mandatory:
  coverage % (§3) is computed over the **spec's** TC list, so an un-generated TC must
  count as uncovered instead of silently vanishing (a fresh adoption is mostly this).
- **Status mapping** — one canonical table from the TC outcome → `report.md` icon → the
  US plain-word legend (test-organization §5), so the write-back (§3) is deterministic
  and **lossless** (each report status has a *distinct* US plain-word — `blocked` and
  `not-written` do not both collapse to `pending`):

  | TC outcome | Source | `report.md` icon | US plain-word |
  |---|---|---|---|
  | all tests `passed` | fold (§2) | ✅ pass | `done` |
  | any `failed` | fold (§2) | ❌ fail | `failed` |
  | any `skipped` (precondition/dependency unmet) | fold (§2) | ⏸️ blocked | `blocked` |
  | no test for a spec TC | spec-reconcile | — not-written | `pending` |
  | spec row flagged manual-only `📋` | spec flag | 📋 manual-only | `manual` |
  | spec row flagged impl-gap `🚧` | spec flag | 🚧 impl-gap | `impl-gap` |
  | `Covered-by` = `OPS-DEPLOY:<runbook>` | spec handle | 🏗️ ops-deploy | `ops-deploy` |
  | automated handle, live cadence, env absent in THIS lane | lane rule (below) | ⏳ env-pending | `env-pending` |
  | `Covered-by` = `DESIGN-REVIEW:<ref>` | spec handle | 🎨 design | `design` |

  The runner's fold (§2) only ever yields `passed`/`failed`/`blocked`; `manual` and
  `impl-gap` come from a **spec-row flag** (like manual-only), never guessed from an
  error string; `not-written` comes from the spec-reconcile step; `ops-deploy` comes
  from the fourth `Covered-by` form ([`traceability.md`](traceability.md)) and is
  **counted in its own column — never lumped with `manual`, never claimed as
  CI-automated**; `design` comes from the fifth form and is resolved by the
  `/design-review` + design-lint pass, not the runner. `broken` (missing/failing cited test, out-of-set cell, duplicate
  TC-ID) deliberately has **no row here**: a broken handle turns the gate red and the
  run stops — it lives in `report.md`'s BROKEN section + the `broken` counter and
  **never reaches the story write-back (§3)**.

- **Output (date-first)**: write `docs/tests/test-reports/<YYYY-MM-DD>/auto-coverage.md`
  (the whole-repo machine report: suite totals, the coverage formula — canonical in
  [`test-organization.md`](test-organization.md) §5 — per-epic bucket table,
  broken list) + `<YYYY-MM-DD>/EPIC-N/report.md` per epic in the koni-docs
  `test-report.md` template shape — a row per TC (id · status icon · time · failure
  detail) + the run header (commit, env, runner) — and refresh the latest-state
  rollups `test-reports/summary/{system-test-report,us-coverage-summary}.md`
  ([`test-organization.md`](test-organization.md) §1). These are the **reporter's
  exclusive artifacts**; manual `MAN-*` runs go in `report-manual.md`.
  These rows are the reporter's *minimum*; a decision-grade report also carries the
  content bar of [`report-quality.md`](report-quality.md) (overview %, results by
  group, skipped/blocked reason+action, perf stats, evidence links).
- **Path validator (MUST)**: the output path must match the **date-first** shape
  `test-reports/\d{4}-\d{2}-\d{2}/(auto-coverage\.md|report(-manual|-notes)?\.md|EPIC-[0-9A-Z]+/(report(-manual|-notes)?\.md|US-[\d.]+/(api|functional)-test-cases\.md))`
  or `test-reports/summary/(system-test-report|us-coverage-summary)\.md` — the
  **legacy** epic-first `test-reports/EPIC-NN/<MMDDYYYY>/report*.md` is also accepted
  on repos that already use it (never for a new adoption). Reject anything else
  before writing — this is the #1 fresh-adoption drift (test-organization §1).
- **Build it from the reference implementation**: koni-qc ships
  [`scripts/qc-report.mjs`](../scripts/qc-report.mjs) (node stdlib, + its contract
  self-test in `scripts/__tests__/qc-report-test.mjs`) — copy it into the repo and adapt
  paths, or wrap it in a `/run-test EPIC-NN` skill. The *contract* above stays canonical;
  the repo owns its copy. (This supersedes the earlier "no vendored reporter" stance —
  CONTEXT D30, reversing D21 on this point: field experience showed every repo re-implementing the contract from
  prose re-introduces the parse bugs; a reference implementation with a frozen self-test
  does not.)

## 3. Story write-back (Code → story)

The second half of the reporter — this is what the 3-place sync's "Code → story is
automated" ([`test-organization.md`](test-organization.md) §3) actually **is**:

- After `report.md`, patch each covered `docs/sprints/stories/US-*.md`: set the TC's
  **Status** — always the **plain-word** value from the §2 mapping table (`done` /
  `failed` / `blocked` / `pending` / `impl-gap` / `manual`), never an icon in a US file
  (test-organization §5) — the **coverage %** (per US = its covered ACs ÷ its ACs,
  where a TC with no passing test is *not* covered), and the **report link**. Runs are
  automated → never hand-edit these back.
- This makes [`quality-bar.md`](quality-bar.md)'s Band-A **"Coverage % reported"**
  tickable at Execute — it was un-satisfiable before because nothing computed it.

## 4. CI gate + runner bootstrap

The local koni-harness git-hook gate is the fast path; **CI is the enforced gate for
a cloud repo** (a fresh repo has neither by default — bootstrap both):

1. **Coverage script**: add a `test:cov` script that **enforces** the unit-coverage bar
   ([`unit-coverage.md`](unit-coverage.md), default ≥80% line-and-branch). The threshold
   lives in **config**, not a dotted CLI flag — for vitest/jest set
   `test.coverage.thresholds` / `coverageThreshold` in `vitest.config`/`jest.config`
   (then `test:cov` = `vitest run --coverage` / `jest --coverage`); only pytest takes it
   on the CLI (`pytest --cov --cov-fail-under=80`). A run below the bar must exit non-zero.
2. **CI workflow — match the repo's CI, don't assume GitHub Actions**:
   - **GitHub Actions repo** → emit `.github/workflows/test.yml` running the TC suite +
     `test:cov` on every push/PR (optionally typecheck — `tsc --noEmit` — if the repo is
     typed); it fails the PR below the bar.
   - **Container-/Docker-built repo (no `.github/workflows`, like ERP-02)** → wire the
     same `test:cov` into the build gate: a `RUN npm run test:cov` layer in the
     `Dockerfile` (build fails below the bar) and/or the platform's CI step (GitLab CI,
     Cloud Build, etc.). The **rule is "the coverage bar runs on every push/PR/build"**;
     the *file* is whatever that repo's CI actually is — do not leave a repo un-gated just
     because it isn't on GitHub Actions.
   This is the server-side counterpart to koni-harness's `pre-push` hook.
3. **Local gate rows**: add the `tests` + `unit-coverage` `passthrough` rows to
   `.koni-harness/gates.conf` (koni-harness [`gate-catalog.md`](../../koni-harness/references/gate-catalog.md)),
   **plus a `typecheck` passthrough row** (`tsc --noEmit`) — the vitest/esbuild `tests`
   gate does NOT type-check, so a TS error in a generated test can pass the git gate and
   fail only at deploy (ERP hit 6 such build-breakers).
4. **Integration + e2e run in a CI job with services, not the deploy gate**: a container
   build can't host a DB or a browser, so the live suites run in a CI job that (a) boots
   the local stack (with the boot exclusions of [`live-harness.md`](live-harness.md)),
   (b) **self-seeds** its own e2e user (never gates on hand-configured secrets), (c) runs
   the integration + e2e suites on every push/PR, and (d) exposes a `test:all` script for
   the same run locally. **The live lane must fail if it skipped everything**: the
   `hasIntegrationEnv` skip-guard ([`live-harness.md`](live-harness.md) property 4) is for
   env-less lanes — in the *designated* live job, env absent / all live suites skipped
   (`blocked > 0` for them) is a red run, otherwise a misconfigured env yields a green
   gate that asserted nothing live. Note: actually *blocking* a merge additionally
   requires branch protection — a repo setting, not a workflow file.

> **Monorepo / multi-app.** `<app>` is the epic's owning package, not the repo root:
> `test:cov` goes in **that package's** `package.json`, its `tests/epic/` tree and
> config live under the package, and the workflow runs it per-app (a matrix or a
> per-package job). Report paths stay repo-rooted at
> `docs/tests/test-reports/YYYY-MM-DD/EPIC-N/`.

**"A CI test gate exists"** is a Release-stage exit criterion (see
[`qc-workflow.md`](qc-workflow.md) §5) — without it the suite silently rots.

## Ownership — the contract is canonical, the reference makes it safe

koni-qc **defines these contracts + the procedure** (portable across vitest / jest /
pytest / playwright); the **repo's runner executes**; **koni-harness / CI enforces**.
The skill **ships the reference implementation** ([`scripts/qc-report.mjs`](../scripts/qc-report.mjs)
+ its self-test) precisely because "specified tightly enough that an agent rebuilds it
from prose" proved false in the field — two rebuilt reporters re-introduced the parse
bugs (CONTEXT D30, reversing D21 on this point). The repo owns its *copy* (adapted
paths, extra rollups); the contract in §2 stays the single source of truth, and any
copy must keep the self-test green. What this section must **not** do is what the
old wording did: assert that "gstack `qa` or a repo `/run-test`" already automates this
when a fresh repo has neither.
