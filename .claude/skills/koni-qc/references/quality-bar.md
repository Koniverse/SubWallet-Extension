# quality-bar — the scored rubric ("better than both corpora")

> **Load when**: the **Self-review** stage of [`qc-workflow.md`](qc-workflow.md),
> and again in author-blind review. This is the bar koni-qc must clear: it must
> **beat** the weak manual backup, **match** the Koni-Finance production standard,
> and **close** Koni-Finance's residual gaps. Grade a suite against all three bands.

Score each item as a checkbox. The **Pass rule** at the bottom is the gate.

**Contents**: [Band A — beat the manual backup](#band-a--beat-the-manual-backup-must-clear-all) ·
[Band B — match the Koni-Finance standard](#band-b--match-the-koni-finance-standard) ·
[Band C — close its residual gaps](#band-c--close-its-residual-gaps) ·
[Pass rule](#pass-rule)

---

## Band A — beat the manual backup (must clear ALL)

The 12 gaps of the backup corpus, each closed. Every box must be ticked.

- [ ] **Explicit TC IDs** — every case has a stable `TC-<EPIC>.<TYPE>-<n>` ([`traceability.md`](traceability.md)).
- [ ] **AC↔TC matrix** — present and complete; the mandatory artifact. (Complete = the
  **floor** — case *volume* is judged by the density sanity in
  [`qc-workflow.md`](qc-workflow.md) §3, not by this box.)
- [ ] **≥50% off-path** — not ~70% happy-path; at least half the cases are **off-path = negative (NEG) + boundary (BND) + edge (EDGE)** (the three off-path TYPEs in [`traceability.md`](traceability.md)). NFR types (SEC/PERF/A11Y/UI) and happy-path types (FUNC/SMK/E2E/API) do **not** count toward the 50%.
- [ ] **NFR present** — required [`nfr.md`](nfr.md) sections filled, not <5%.
- [ ] **UI-conformance case authored (if UI-bearing)** — every UI-bearing AC has a
  `TC-<EPIC>.UI-<n>` (or a folded `FUNC`/`A11Y`) whose pass condition is `/design-review`
  vs **DESIGN.md + the shadcn standard** ([`nfr.md`](nfr.md) §UI). Authoring item (the case
  exists); its *execution* (actually passing `/design-review`) is deferrable like the other
  execution items. `N/A` only if the suite has no UI surface.
- [ ] **Coverage % reported** — the *execution* coverage report: % **per US** (the unit — done stories with ≥1 covering TC ÷ done stories; see `test-organization.md` §0) and by AC/type, from a run (distinct from the authoring AC↔TC matrix above; this is an execution item, deferrable on an unrun suite — see the Author-mode carve-out).
- [ ] **Test-data strategy** — concrete, reusable values + named fixtures.
- [ ] **Entry / exit criteria** — written before authoring; checked at the gate.
- [ ] **Test lifecycle** — active / deprecated / archived states applied.
- [ ] **Risk-based order** — Critical/High/Medium/Low priority set by impact × likelihood.
- [ ] **Regression scope** — `RC-` set defined as the per-release regression scope.
- [ ] **Automation linkage** — `Covered-by` filled with one of the five fixed forms
  (`*.spec.ts::name` · `PROPOSED:<path>::name` · `— (manual)` · `OPS-DEPLOY:<runbook>` ·
  `DESIGN-REVIEW:<ref>`); `PROPOSED:` counts as filled-but-uncovered
  (see [`traceability.md`](traceability.md)).
- [ ] **Real execution reports** — koni-docs `test-report.md` filled, not empty, and
  meeting the [`report-quality.md`](report-quality.md) content bar.

---

## Band B — match the Koni-Finance standard

The production strengths to codify. Must demonstrably match.

- [ ] **Rich per-TC metadata** — the full canonical table (test-data · preconditions · action · expected · actual · status · perf · side-effects · covered-by).
- [ ] **Dedicated security suite** — SEC cases present; standalone `<feature>-security-test-cases.md` when ≥5.
- [ ] **Concrete reusable test data** — every TC carries a real, re-runnable value.
- [ ] **Execution instrumentation** — coverage % by AC/type, pass/fail/blocked, perf vs
  SLA. A bare `Pass` is the floor, not the target: an exemplar row carries the
  **captured actual response/behaviour + the timing** (the reporter already extracts
  `durationMs` + failure detail — surface them, don't drop them).

---

## Band C — close its residual gaps

What Koni-Finance lacked; koni-qc must exceed here.

- [ ] **Full AC↔TC matrix** — every AC mapped, no orphans (Koni-Finance had rich TCs but no matrix).
- [ ] **Env / fixtures playbook** — environment + fixtures defined and re-creatable.
- [ ] **A11y / i18n** — accessibility and internationalization sections covered when triggered.
- [ ] **Perf SLA** — explicit latency / throughput budgets asserted, not just measured.
- [ ] **Cadence** — when the suite (smoke / regression / full) runs is defined.

---

## Band D — density & exhaustiveness (the gate that stops the 10× gap recurring)

A suite can clear Bands A–C at ~3 cases/AC and still be **1/10 of real density** (the
ERP field finding: 100% of 431 enumerated cases resolved, while the exemplar carries
154 cases for ONE US — resolution and enumeration are orthogonal axes). Band D gates
the enumeration axis:

- [ ] **Cross-multiplication done** — [`test-design.md`](test-design.md) **step 9** ran:
  every shared class × every surface (the class and surface lists live in step 9, not here).
- [ ] **Matrix completeness = 100%** — every cell of the applicable
  [`layered-suites.md`](layered-suites.md) matrices (incl. field × validation and
  state-transition) is a TC-ID or an **explicit N/A** — never blank.
- [ ] **Full BVA per bounded field** — the step-9 discrete BVA rows present in the
  field × validation matrix (not one collapsed "edge" row).
- [ ] **Full error-code + status coverage** — every status/error an action can return
  has a TC.
- [ ] **One row per scenario** — no spec-level bundling (a test may assert N scenarios;
  the spec then carries N TC-IDs — [`traceability.md`](traceability.md)).
- [ ] **Density plausible** — cases/US in the neighborhood the surfaces imply
  (typically **40–150 for an API+UI US**; the ~30-case Self-review warn of
  [`qc-workflow.md`](qc-workflow.md) §3 cleared or explicitly justified).

---

## Pass rule

> **A suite passes only if it clears every item of Band A, every item of Band D, and
> demonstrably exceeds Band B and Band C.** Any unticked Band-A box is a hard fail —
> return to **Design**. **A suite that clears Band A but fails Band D is *thin*** —
> also return to Design and expand (100%-resolution must never masquerade as
> 100%-enumeration). A Band-B/C item that is merely matched, not exceeded, is a
> finding to raise in review.

**Author-mode vs Execute-mode bar.** Two Band-A items — **Real execution reports**
and **Coverage % reported** — depend on the suite having been *run*. An
**authoring** artifact (test cases written, not yet executed: every row `Not
Executed`) legitimately marks those two `N/A — deferred to Execute` rather than
failing them; it must clear every *other* Band-A item. The full Band-A bar
(including the two execution items) applies at the **Execute/Release** stage, once
the koni-docs `test-report.md` is filled. Do not tick an execution item on an
unrun suite — mark it deferred.

**The depth bar (applies to every koni-qc artifact).** *Creating a file is not
authoring it.* A `test-cases/EPIC-N/` spec with an empty matrix, an audit with
bullet-only findings, a one-sentence `STRATEGY.md`, or a stub story (title + a Goal
line + a few bullets) **fails the bar regardless of the bands** — it looks tracked
but carries no decision value. Ground each artifact in real files/commits, don't
fill a template with generic sentences, and **spot-check 3 random outputs** before
declaring a batch done. Full rule (incl. story-depth sections + the whole-project
Definition-of-Done): [`whole-project-qc.md`](whole-project-qc.md) §6.
