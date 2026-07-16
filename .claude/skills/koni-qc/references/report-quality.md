# report-quality — the execution-report content bar

> **Load when**: producing or grading a test **execution report** (auto `report.md` or
> manual `report-manual.md`). The reporter contract ([`test-automation.md`](test-automation.md)
> §2) defines the *mechanics* (path, status fold, write-back); koni-docs
> `templates/test-report.md` owns the *container*; **this file owns what a report must
> CONTAIN to be decision-grade** — the bar the US-001.001 exemplar reports set. A report
> that only lists pass/fail rows is a tally, not a report: it can't answer "what do we do
> next?".

**Contents**: [Honest actuals](#honest-actuals-the-one-rule-above-others) ·
[Required sections](#required-sections) · [Evidence rule](#evidence-rule) ·
[Applies to auto + manual](#applies-to-auto--manual) · [Ownership](#ownership)

---

## Honest actuals (the one rule above others)

**`Actual` is the real observed output — never a paraphrase, never a copy of Expected.**
A passing API case shows the actual response body (truncated sensibly); a failing UI case
shows the actual failure text verbatim (`Test timeout of 30000ms exceeded`,
`expect(locator).toBeVisible() failed — element(s) not found`). Copy-of-expected actuals
are how a suite reads green while proving nothing — treat one as a review finding. This
is what makes a failure diagnosable from the report alone.

## Required sections

An execution report is decision-grade when it carries all of these (N/A allowed only
where the class genuinely doesn't apply):

1. **Execution overview — with the denominator named** — totals with percentages: total
   · executed · passed · failed · skipped · blocked · not-executed, plus date /
   environment / runner / build under test. Percentages, not just counts — and **any
   "100%" must name its denominator and what the number does NOT measure in the same
   sentence** ("100% of 431 *enumerated* cases resolved — this measures resolution, not
   enumeration density"). The ERP field lesson: an operator drove 431/431 = 100% and
   presented it as completeness while the suite was 1/10 of reference density —
   resolution and enumeration are orthogonal axes and the report must say which one a
   number is on.
2. **Results by group** — one row per endpoint / page / suite group with its own
   pass-rate, so the weak area is visible (not one global number).
3. **Skipped + blocked, each with Reason AND Action Required** — every non-executed case
   is a row: *why* it didn't run and *what unblocks it*. A bare "Skipped" hides scope
   silently. The two words are distinct states with distinct sources: **blocked** = a
   precondition/dependency was unmet at run time (the reporter's fold emits it —
   [`test-automation.md`](test-automation.md) §2; "needs Docker", "needs wallet
   extension"); **skipped** = a *deliberate scope-out for this round*, recorded by the QC
   driver in the notes/manual report, never emitted by the reporter ("deferred to
   integration testing"). Feature-unbuilt cases are `impl-gap` (spec flag), not either.
4. **Failed-by-category with root cause** — group the failures by their real cause
   ("frontend page not implemented" ≠ "regression in implemented flow"); the two demand
   different next actions and must not be summed into one failure count.
5. **Contract-coverage verification** (API runs) — the status-code + error-code matrices
   from [`layered-suites.md`](layered-suites.md), re-checked against what the run
   actually exercised.
6. **Perf statistics** — response-time min / max / avg per group (the canonical table's
   `Perf` column aggregated), vs SLA where one exists ([`nfr.md`](nfr.md)).
7. **Implementation-status table** (when failures trace to unbuilt surface) — page/
   component → Implemented / Partial / Not implemented → coverage % — turning a wall of
   red into an honest "the suite is ahead of the build" statement.
8. **Recommendations / next steps** — numbered, specific, actionable ("implement
   `/onboarding/workspace` — unblocks 6 TCs"), not "fix the failures".
9. **Command reference** — the exact commands to reproduce the run (env vars included),
   so the next person reruns it without archaeology.
10. **Density telemetry** — cases/US distribution (and cases/AC where computable), with
   any US below the Self-review density warn flagged — so 100%-resolution can never
   masquerade as 100%-enumeration again. The reference reporter
   ([`test-automation.md`](test-automation.md) §2) emits this table.

## Evidence rule

Every **failure and blocker** links its artifacts: the runner spec `file:line`, and the
video / screenshot / log path the run produced. Every **manual/visual verification**
(UI conformance, bug-fix rounds) attaches the screenshot or GIF. A failure without
evidence is a claim; with evidence it is replayable. (Store artifacts under the run
folder — `test-reports/YYYY-MM-DD/EPIC-N/img/` for automated runs, `img-manual/` for
manual ones, per [`test-organization.md`](test-organization.md).)

## Applies to auto + manual

- The **auto `report.md`** stays the **reporter's exclusive artifact** (its rows +
  the rollups it computes — sections 1–4 and 6 from run data; section 5's
  contract matrices additionally need the suite's status/error-code enumerations,
  which the reconcile step already reads from the spec). Scope honestly: the shipped
  reference ([`../scripts/qc-report.mjs`](../scripts/qc-report.mjs)) implements the
  **parse + classify + enforce + density core** (§1's denominator line, the case rows
  with timing + failure detail, broken/orphan lists, item 10's density table); the
  per-group / failed-by-category / perf rollups here are **adapt-on-copy** — the repo's
  copy adds them, they are not free.
- **Driver-authored sections live in `report-notes.md`** — a named sibling in the
  same run folder for sections the reporter cannot know (7 implementation status,
  8 recommendations, 9 command reference, and any skipped-scope decisions). This
  preserves the "reporter is the ONLY writer of `report.md`" invariant
  ([`test-organization.md`](test-organization.md) §1) — the QC driver **never**
  appends to or edits `report.md` itself.
- The **manual `report-manual.md`** (browser QA, `/design-review` passes, bug-fix
  rounds) carries the same bar in one file — an exemplar manual report reads exactly
  like an exemplar auto one, plus its screenshots.

## Ownership

koni-qc owns this **content bar** (and `report-notes.md` is free-form under it — no
koni-docs template needed); koni-docs owns the `report.md`/`report-manual.md`
**template/container**;
[`test-automation.md`](test-automation.md) owns the reporter **mechanics** (path
validator, status fold, story write-back). [`quality-bar.md`](quality-bar.md)'s
"Real execution reports" Band-A item is graded against this bar.
