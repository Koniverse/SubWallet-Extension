# unit-coverage — per-function unit tests (the layer below the AC↔TC matrix)

> **Load when**: writing or gating **unit tests** — the per-function/per-branch
> layer that proves each *function* in isolation, distinct from the AC↔TC matrix
> ([`traceability.md`](traceability.md)) which proves each *user story's* behaviour.
> koni-qc **owns this standard** (the per-function rule + the coverage bar);
> **Dev authors** the unit tests during Execute; **koni-harness enforces** the bar
> at Self-verify (see the loop's Execute + Self-verify stages). "koni-qc owns the
> bar; harness runs the gate" — one verb per actor.

**Contents**: [Two layers](#two-layers-unit-vs-actc) ·
[The per-function rule](#the-per-function-rule) · [TDD cycle](#the-tdd-cycle-red--green--refactor) ·
[The gate](#the-unit-coverage-gate) · [What to skip](#what-legitimately-needs-no-unit-test) ·
[Boundary](#composition-boundary)

## Two layers: unit vs AC↔TC

| Layer | Proves | Granularity | Owner | Where |
|---|---|---|---|---|
| **Unit** (this file) | each *function/method/branch* in isolation (mocked deps, no I/O) | per function | **koni-qc** owns the bar · **Dev** authors · **harness** enforces | `*.unit.test.ts` (Vitest/Jest/pytest) |
| **AC↔TC matrix** ([`traceability.md`](traceability.md)) | each *user story's* acceptance behaviour | per US (its ACs) | koni-qc | `test-cases/EPIC-N/US-x.y.md` + `.integration/.e2e/.smoke.spec` |

They are **complementary, not substitutes**: unit tests catch a broken branch a
story-level e2e would miss; the AC↔TC matrix catches a missing requirement no
amount of unit testing would surface. A feature needs **both** — unit tests for
its functions, and AC↔TC coverage for its story.

## The per-function rule

**Every non-trivial function/method gets unit tests that cover, at minimum:**

- the **happy path** (the primary expected input → output);
- **each branch / decision** (every `if`/`else`, `switch` arm, ternary, guard,
  early-return) — one test per outcome;
- **boundary inputs** (empty, zero, min/max, off-by-one — apply BVA from
  [`test-design.md`](test-design.md));
- **error / failure paths** (throws, rejects, invalid input handled) — assert the
  error, not just "no crash".

"Non-trivial" = it has logic: a branch, a computation, a transform, validation,
or an error path. Name unit tests by **function + behaviour** (`parseRpcUrl →
rejects a malformed scheme`), not by TC-ID — TC-IDs live at the AC↔TC spec layer,
units sit below it.

## The TDD cycle (RED → GREEN → REFACTOR)

This is the Execute-stage discipline made concrete, per function **and branch**:

1. **RED** — write the failing unit test first (it must fail for the right reason:
   run it, see it red).
2. **GREEN** — write the *minimal* implementation to pass it.
3. **REFACTOR** — clean up with the test green; add the next branch's test → repeat.

Write the test *before* the implementation — a test written after tends to assert
"what the code does", not "what it should do".

## The unit-coverage gate

Enforced at the loop's **Self-verify** stage (koni-harness) — a change does not
advance to Review until:

- **New/changed functions with logic have unit tests** (the per-function rule above)
  — no new branch ships untested.
- **Coverage of the changed unit meets the bar** — default **≥80% line-and-branch
  on new/changed code** (repos may raise it; never silently drop it). Measure with
  the repo's runner (`vitest run --coverage`, `jest --coverage`, `pytest --cov`);
  bootstrap the `test:cov` script + the CI workflow + the `passthrough` gate rows per
  [`test-automation.md`](test-automation.md) §4 (backed by koni-harness
  [`gate-catalog.md`](../../koni-harness/references/gate-catalog.md)).
- **All unit tests green** (already the Self-verify tests-green gate).

A repo with zero unit tests for a logic-bearing change fails Self-verify — "build
is green" is *not* sufficient.

## What legitimately needs no unit test

Don't chase 100% — these are exempt (state the exemption, don't silently skip):

- pure pass-throughs / thin getters / trivial DTO mappers with no logic;
- generated code, framework glue, config;
- code whose only behaviour is I/O (that's integration/e2e territory — cover it in
  the AC↔TC matrix, not here).

If a function *looks* trivial but has a branch, it isn't exempt.

## Composition boundary

koni-qc owns this **standard** (the per-function rule + the coverage bar). It does
**not** run the tests (the repo's unit runner does, via a koni-harness gate check)
and does **not** author them (Dev does, during Execute). This mirrors koni-qc
everywhere: it contributes the *methodology + the gate*, it never reproduces the
runner or writes the code's tests for it.
