# whole-project-qc — QC an entire repo, not one epic

> **Load when**: QC-ing a **whole existing repo** (not a single epic) — "set up QC
> for this project", "audit our test coverage", "stand up QA tracking", "is our
> testing done?". The per-epic lifecycle is [`qc-workflow.md`](qc-workflow.md); **this
> file is the layer above it** — the QA-tracking backlog, the artifact-location rules,
> and the Definition-of-Done that stops whole-project QC being declared finished when
> only *specs* exist. Written from a real deployment (Koni-ERP-02) that ran koni-qc
> end-to-end yet came out **worse than the reference repo (Senti-Quant)** because these
> steps were left to operator memory and forgotten.

**Contents**: [The gap](#the-gap) · [1. Stand up the QA tracking epic](#1-stand-up-the-qa-tracking-epic) ·
[2. Author the strategy + plans](#2-author-the-strategy--plans) ·
[3. Artifact-location MUSTs](#3-artifact-location-musts) ·
[4. Execution is required](#4-execution-is-required-not-specs-only) ·
[5. Definition of Done](#5-definition-of-done-whole-project-qc) ·
[6. The depth bar — never ship thin stubs](#6-the-depth-bar--never-ship-thin-stubs) ·
[Ownership](#ownership)

## The gap

Running koni-qc on a repo correctly produces the audit, the `docs/tests/` tree, the
`test-cases/EPIC-N/` specs + AC↔TC matrices, and automation. But koni-qc's *method*
does not, on its own, **prescribe standing up the QA-tracking epic**, **author the
strategy**, **enforce where artifacts land**, **require ≥1 execution**, or **hold every
authored artifact to a depth bar** before whole-project QC is "done". Left implicit,
all five get skipped — QC then looks tracked but is a pile of specs with no backlog
home, no strategy, misplaced plans, zero real run reports, and stub stories. This file
makes each an explicit step + gate.

## 1. Stand up the QA tracking epic

QC work needs a **home in the backlog and per-epic visibility** — otherwise it hides as
a couple of stories under a feature epic. Create a dedicated tracking epic (the
Senti-Quant `EPIC-37 "Test & QA Coverage Tracking"` model):

- **`EPIC-NN "Test & QA Coverage Tracking"`** — a visibility layer that holds **no
  product code and no source-of-truth spec**; it *tracks* coverage, it doesn't own it.
  **Numbering**: `NN` = the highest existing app EPIC number **+ 1** (never reuse a
  retired number, never insert between existing ones) — pick it once, deterministically,
  so two agents don't diverge.
- **One coverage story per app epic** — `US-NN.X ↔ EPIC-MM`, 1-to-1 with
  `<app>/tests/epic/EPIC-MM/` + `test-cases/EPIC-MM.md`. This is what makes coverage
  visible **per epic** instead of "the project is ~40% tested". A coverage story is
  **`done`** when its `## Coverage snapshot` target % is met **and** EPIC-MM has ≥1
  execution report (§4); otherwise it stays **`in-progress`** carrying the current
  baseline % — never "done" on specs alone.
- **Infra / process stories** — one story per line that applies. The first three are
  **mandatory**: foundation (the `docs/tests/` standard + tooling), test-strategy
  (§2), CI / build gate (§4). The rest **as the audit warrants**: the unit / component /
  integration / e2e harnesses, execution + reporter, bug-bash cadence, spec
  remediation, coverage triage.
- **QA ownership model** (state it in the epic): **dev authors** the spec + the test
  code; **koni-qc (AI) owns the review side** — the risk / edge / NFR checklist, the
  AC↔TC matrix, gap-flagging, and fix-requests. The tracking epic records status; the
  real specs live in `test-cases/`, the real tests in `tests/epic/`.

Each coverage story carries a **`## Coverage snapshot`** table — one row per highest-risk
US, e.g.:

| US | Current `Covered-by` | Target harness + TC-IDs | Coverage |
|---|---|---|---|
| US-4.3 | `— (manual)` | `subscription.integration.spec.ts` · TC-04.SEC-1, TC-04.NEG-2 | 0% → 80% |

## 2. Author the strategy + plans

koni-qc has an "author test-cases" mode but the strategy folder is otherwise left
empty. Author it — do not scaffold-and-forget:

- **`docs/tests/STRATEGY.md`** (the whole-repo strategy home, per
  [`test-organization.md`](test-organization.md) §1) — test types + the gate, risk
  tiers, per-epic priority, automation-wave order, cadence.
- **Per-epic framing in `test-cases/EPIC-N/index.md`** — that epic's scope,
  out-of-scope, risk map, priority order, stories-in-scope table (there is **no
  `test-plan/` folder** — [`test-organization.md`](test-organization.md) §1; the
  whole-repo strategy stays `STRATEGY.md`).

## 3. Artifact-location MUSTs

Enforce where things land — misplaced artifacts read as "not done" and break tooling:

- **`audits/QC-PLAN-BY-US-<date>.md`** — the per-US risk-tiered coverage plan lives in
  `docs/tests/audits/`, **never at the tests root**. Same for the coverage audit.
- **Run reports** at `test-reports/YYYY-MM-DD/EPIC-N/report.md` (auto) /
  `report-manual.md`, with `auto-coverage.md` at the date level and the latest-state
  `summary/` rollups — date-first per [`test-organization.md`](test-organization.md)
  §1 (the epic-first `EPIC-NN/<MMDDYYYY>/` shape is legacy-accepted only); never
  hand-editing the auto files (the validator is [`test-automation.md`](test-automation.md) §2).
- **`findings.md`** populated at the tests root; dated one-offs in `audits/`.

## 4. Execution is required (not specs-only)

QC is **not** "done" when the specs are written. koni-qc's Execute stage
([`qc-workflow.md`](qc-workflow.md) §4) must actually run: at least **one execution
report** per covered epic — the automated `report.md` from the reporter, and for
UI-bearing cases the gstack `/design-review` / browser-QA pass with `img/` (vs DESIGN.md
+ the shadcn standard, [`nfr.md`](nfr.md) §UI). Shipping specs-only and calling it
"tested" is the failure this rule closes.

## 5. Definition of Done (whole-project QC)

Whole-project QC is **NOT done** until every box is true. Add this to the completion
check and refuse to declare done otherwise:

- [ ] **QA tracking epic** + a coverage story per app epic exist and are in the sprint (§1).
- [ ] **`STRATEGY.md`** authored + per-epic framing in `test-cases/EPIC-N/index.md` where the epic warrants it (§2).
- [ ] **`QC-PLAN-BY-US-<date>.md`** + the coverage audit in `audits/`; `findings.md` populated (§3).
- [ ] **`Covered-by` handles are honest** — every cell is one of the **five fixed
  forms** ([`traceability.md`](traceability.md)): automated (`<path>::<name>` — and the
  cited test **exists and passes** under the broken-handle enforcer,
  [`test-automation.md`](test-automation.md) §2), `PROPOSED:<path>::name`, `— (manual)`,
  `OPS-DEPLOY:<runbook>`, or `DESIGN-REVIEW:<ref>`. **No phantom automation** (the ERP
  run had 24 fabricated citations, finding F-8) and no free-text sixth form.
- [ ] **≥1 execution report per covered epic** at `test-reports/YYYY-MM-DD/EPIC-N/report.md`
  (§4) — not specs-only. (This is the **Execute/Release** bar: a repo still in
  authoring-mode — specs written, nothing run yet — is *in-progress*, not *done*; that
  authoring artifact legitimately defers the execution items per the
  [`quality-bar.md`](quality-bar.md) author-mode carve-out until it is run.)
- [ ] **TC-IDs don't collide across layers** — pure-unit vs DB/endpoint cases must not
  reuse the same ID (the ERP F-12 bug; the reservation rule is [`test-organization.md`](test-organization.md) §3).
- [ ] **Every authored artifact hits the depth bar** (§6) — no thin stubs. Spot-check 3
  random outputs **against the §6 section list**; any file missing a required section or
  not grounded in ≥1 real file/commit citation **fails the batch**.

## 6. The depth bar — never ship thin stubs

**Creating a file is not authoring it.** A story or spec that is a title + a Goal line +
3-4 bullets looks tracked but carries no decision value to someone reading it in six
months. The ERP run bulk-generated 21 stories as ~30-line stubs and called them "done";
they had to be rewritten to 123-140 lines each, grounded in real files and commits.

Hold every artifact koni-qc authors (or asks a generator to author) to this bar:

- **Every story**, in full: `## Goal` (1 para) · `## Background` (2-3 paras — *why* it
  exists, what the audit surfaced, dependencies) · `## Acceptance criteria` (specific,
  checkable — not "make it work") · `## Tasks` (`TASK-X.Y.N`, one per AC) ·
  `## Implementation notes` (done work: *what was actually built* + decisions/traps,
  cite LESSONS/findings; backlog: the design/approach) · `## Files modified` (real
  paths) · `## Cross-references`. **Coverage stories** add the `## Coverage snapshot`
  table (§1).
- **koni-qc's own outputs** clear the same bar — a `test-cases/EPIC-N/` spec with an empty
  matrix, an audit with bullet-only findings, or a one-sentence `STRATEGY.md` all fail
  it exactly as a stub story does (grade with [`quality-bar.md`](quality-bar.md)).
- **Ground it, don't template it.** For *done* stories read the actual files + `git log`
  and describe reality; for *backlog* write a real plan with named files + approach. A
  per-item template filled with the same generic sentence is still a stub.
- **Bulk generation is fine for the skeleton, not the content.** Script-creating N files
  is step 1; each must then be authored to depth before the batch is "done". **"Below the
  bar" is decidable**: a file fails if **any required section above is missing** OR it is
  **not grounded in ≥1 real file/commit citation**. **koni-qc refuses to close a create
  step while any artifact fails, and spot-checks 3 random outputs** before declaring
  completion.

## Ownership

The delegation split is SKILL.md §1 (koni-docs = story/doc bodies · koni-setup = scaffold
· gstack + repo runner = execution · koni-harness = gate). The **whole-project delta**:
koni-qc supplies the **QA-epic shape, the Definition-of-Done, and the depth bar** —
koni-docs still owns each story's *body*. This file is the *whole-project orchestration +
completion gate* above the per-epic [`qc-workflow.md`](qc-workflow.md); it invokes those
delegates, never reproduces them.
