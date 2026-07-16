# traceability — the AC↔TC matrix, TC-ID scheme, and the canonical table

> **Load when**: you are recording derived cases and proving the suite complete
> (the **Design** + **Self-review** stages of [`qc-workflow.md`](qc-workflow.md)).
> This is the spine of koni-qc — the one artifact **neither** corpus had. The
> backup left AC↔TC traceability implicit; Koni-Finance had rich per-TC tables
> but no full coverage matrix. koni-qc makes the matrix mandatory and the gate.

Traceability answers two questions a reviewer must be able to answer in seconds:
*"is every requirement tested?"* (no orphan AC) and *"does every test trace to a
requirement?"* (no orphan TC). Without it, a 250-case suite can still leave a
critical AC untested and nobody notices. With it, coverage is provable.

**Contents**: [TC-ID scheme](#tc-id-scheme) ·
[The canonical test-case table](#the-canonical-test-case-table) ·
[AC↔TC coverage matrix](#actc-coverage-matrix) ·
[Risk-based priority & regression](#risk-based-priority--regression) ·
[koni conventions preserved](#koni-conventions-preserved)

---

## TC-ID scheme

Every test case carries a stable ID: `TC-<EPIC>.<TYPE>-<n>`.

- `<EPIC>` — the epic number (`02`) or a short domain slug for a feature suite
  (`CN` for customize-network). Domain prefixes (Koni-Finance style — `NONCE-`,
  `RLS-`, `SEC-A01-`) are allowed *inside* a suite for sub-areas.
- `<TYPE>` — one of:

  | TYPE | Meaning |
  |---|---|
  | `E2E` | end-to-end flow spanning ≥2 stories |
  | `FUNC` | functional behaviour of a single capability |
  | `API` | request/response contract at a service boundary |
  | `REG` | regression — guards a previously-fixed bug or invariant |
  | `SMK` | smoke — fast post-deploy sanity |
  | `SEC` | security — authn/authz, injection, data isolation |
  | `PERF` | performance — latency/throughput vs an SLA |
  | `A11Y` | accessibility — keyboard, screen-reader, contrast |
  | `UI` | visual conformance to `DESIGN.md` **+ the shadcn standard** (via gstack `/design-review`; criteria in [`nfr.md`](nfr.md) §UI) |
  | `NEG` | negative — invalid/error input is rejected cleanly |
  | `BND` | boundary — at/just-past a limit (min/max/zero/overflow) |
  | `EDGE` | edge — concurrency, network-failure, encoding, state races |

  `FUNC`/`SMK`/`E2E`/`API` carry happy-path coverage; `NEG`/`BND`/`EDGE` carry the
  off-path coverage the matrix demands; `SEC`/`PERF`/`A11Y` carry the
  non-functional axes. The TYPE code names the *category*; the matrix's
  *Types covered* column records the positive/negative/boundary *classification*
  independently (a `TC-CN.SEC-1` XSS case is category SEC, classification negative).

- `<n>` — sequential within (epic, type), starting at `1`.

**Never renumber.** A removed TC keeps its number (marked deprecated) so
cross-references in test-reports, lessons, and PRs survive. This matches the
koni-docs `test-cases/EPIC-N.md` convention exactly — koni-qc adds the extra
TYPEs (FUNC/API/SEC/PERF/A11Y/UI/NEG/BND/EDGE) on top of koni-docs' core set, it
does not replace the scheme.

> **The TC-ID's `<EPIC>` is an ID namespace, not the coverage unit** — coverage is
> measured per **US** (see [`test-organization.md`](test-organization.md) §0). Every
> case carries a mandatory **`maps_to`** linking it to the story it covers, e.g.:
>
> ```yaml
> # in docs/tests/test-cases/EPIC-N/US-x.y.md, per TC
> TC-02.LINK-1:
>   maps_to: { us: US-2.1, fr: FR-12, ac: AC-1 }   # us is mandatory
> ```
> A case may map to several ACs (`ac: [AC-1, AC-3]`); a story is "covered" once
> ≥1 TC's `maps_to.us` points at it.

---

## The canonical test-case table

The rich per-TC table, adopted verbatim from the Koni-Finance production
standard. Every functional/edge case is one row. The columns are fixed:

`TC-ID | Name | Priority | Test data | Preconditions | Action/Request | Expected | Actual | Status | Perf | Side-effects | Covered-by`

| TC-ID | Name | Priority | Test data | Preconditions | Action/Request | Expected | Actual | Status | Perf | Side-effects | Covered-by |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-XX.FUNC-1 | Add reachable EVM network | Critical | `https://rpc.ankr.com/eth` | Manage Network open, network not present | + → paste RPC → auto-detect → Save | EVM detected; name/symbol/decimals/chainId auto-filled; network appears in selector | — | Not Executed | detect < 2.0s | 1 row added to custom-network store | — (manual) |
| TC-XX.SEC-1 | Reject script in network name | Critical | name `<script>alert(1)</script>` | Manage Network open | enter name → Save | name stored escaped; rendered as literal text; no script executes | — | Not Executed | n/a | no DOM injection in selector | `epic/EPIC-CN/customize-network.e2e.spec.ts::TC-XX.SEC-1` |

> These two rows use placeholder IDs (`TC-XX.*`) so they don't collide with a real
> suite's IDs. The **`Covered-by`** handle has **five** fixed forms:
> 1. `<path>.spec.ts::<name>` — **covered** (the automated test exists and ran). The
>    path is relative to the test root (`epic/EPIC-NN/…` is fine; the `<app>/tests/`
>    prefix may be omitted), and `<name>` may be abbreviated to the test's leading
>    TC-ID token (`…spec.ts::TC-01.WS-5`) since that token is the reporter's parse key;
> 2. `PROPOSED:<path>::<name>` — **planned automation**: the test is intended at that
>    path/name but the file does **not exist yet** (dominant on a fresh adoption). It
>    records author intent so the target survives in the spec, but it counts as
>    **uncovered** for coverage % until it becomes form 1 — the reporter treats it as
>    `not-written` ([`test-automation.md`](test-automation.md) §2);
> 3. `— (manual)` — **manual-only**, never automated.
> 4. `OPS-DEPLOY:<runbook-ref>` — **deploy-verified**: the case checks infra-migration /
>    deploy-topology / one-time external-integration setup (prod parity, real object
>    store, multi-replica, credential config, one-shot backfill) that is **not
>    CI-reproducible**. It counts as *covered* — verified by the referenced deploy
>    runbook — tracked in **its own column**, never lumped with `manual` and never
>    claimed as CI-automated. **Hard rule: exhaust the locally-testable core first** —
>    a TC is ops-deploy only for the irreducibly-prod remainder (ERP pulled 4 such TCs
>    back into real unit tests before tagging the rest).
>
> 5. `DESIGN-REVIEW:<route-or-page>` — **design-verified**: a visual/design-conformance
>    case (typically `TC-<EPIC>.UI-<n>`) whose execution mechanism is gstack
>    **`/design-review`** against `DESIGN.md` + the shadcn standard
>    ([`nfr.md`](nfr.md) §UI) **plus** the repo's static design lint where present —
>    not a unit/e2e assertion. It counts as *covered* in **its own `design` column**
>    (🎨), never lumped with `manual` (the ERP 100% drive tracked 22 such cases).
>    Only for what a runner genuinely cannot assert — a badge state a jsdom test CAN
>    check is automated-form, not design-form.
>
> Do **not** invent a sixth form — these five are the closed set (they replace ad-hoc
> notes like the ERP-02 free-text markers; the reporter flags any other cell as a
> broken handle). Legacy free-text cells containing `design-review` are read as form 5 **only when
> the cell matches no fixed form and is not an automated `::` handle** (a
> `PROPOSED:` cell or a test file merely *named* design-review stays uncovered /
> enforced — no laundering); normalize them to `DESIGN-REVIEW:<ref>` when touched.
>
> **N scenarios may share one test**: a single automated test MAY assert several
> scenarios, but the spec still carries **N distinct TC-IDs**, each `Covered-by`
> pointing at that same `file::name` handle — bundling at the *spec* layer is what
> hides missing sub-scenarios; bundling at the *test* layer is fine.

Column contract:
- **Priority** — `Critical / High / Medium / Low`, derived from risk (see §Risk-based priority). (Matches the Koni-Finance production standard.)
- **Test data** — a concrete, reusable value, never "some valid input".
- **Preconditions** — the system state before the action (the Gherkin *Given*).
- **Action/Request** — the user action or the API request (the *When*).
- **Expected** — the observable outcome + invariant (the *Then*).
- **Actual / Status** — filled at execution; `Not Executed / Pass / Fail /
  Blocked / Skipped` (Koni-Finance vocabulary). Execution *history* lives in
  koni-docs `test-report.md`, not here — this column is only the current state.
- **Perf** — measured time **or** the SLA target the case asserts (see
  [`nfr.md`](nfr.md) §Performance).
- **Side-effects** — DB writes, store mutations, events, files — the things a
  reviewer can't see in the UI.
- **Covered-by** — the automation handle (`*.spec.ts::name`), `PROPOSED:<path>::name`
  (planned, still uncovered), `— (manual)`, `OPS-DEPLOY:<runbook-ref>`, or
  `DESIGN-REVIEW:<ref>` (see the five fixed forms above).

> The koni-docs `test-cases/EPIC-N.md` container also supports a Gherkin
> Given/When/Then block per scenario. Use the canonical table for the dense
> per-case grid; promote a flow to a full Gherkin H3 when it spans ≥2 stories.
> koni-qc supplies the columns; koni-docs supplies the file structure — do not
> duplicate the koni-docs template here, fill it.

---

## AC↔TC coverage matrix

**The mandatory artifact. The gate. The thing both corpora lacked.**

Every story's acceptance criteria are listed, each mapped to the TCs that cover
it and the case *types* those TCs span. **The matrix is anchored per user story
(`US-X.Y`), not per epic** — the story is the unit of coverage (see
[`test-organization.md`](test-organization.md) §0). Each TC therefore carries a
mandatory **`maps_to.us`** (plus `fr`/`ac`); **coverage % is computed per US** —
(done stories with ≥1 covering TC) ÷ (done stories) — never "epics tested".

| Story | AC | AC description | Positive | Negative | Boundary/edge |
|---|---|---|---|---|---|
| US-X.Y | AC-1 | Add a reachable network → appears in selector | TC-XX.FUNC-1 | TC-XX.NEG-1 | TC-XX.EDGE-3 |
| US-X.Y | AC-2 | Reject duplicate network | TC-XX.SMK-1 | TC-XX.NEG-3 | TC-XX.BND-3 |

**The completeness rule (non-negotiable):**

> Every AC has **≥1 positive AND ≥1 negative AND ≥1 boundary-or-edge** TC
> (a `BND` *or* an `EDGE` case satisfies the third slot). **No orphan AC** (an AC
> with no TC). **No orphan TC** (a TC that maps to no AC). **Every UI-bearing AC also
> has a UI-conformance TC** (a `UI` case — or folded `FUNC`/`A11Y` — asserting
> `/design-review` vs DESIGN.md + the shadcn standard, [`nfr.md`](nfr.md) §UI). If any
> holds, the suite is incomplete and does not pass the gate.
>
> **No double-counting**: a single TC satisfies **at most one** of the
> positive / negative / boundary-or-edge slots for a given AC. If an AC's only
> negative is also its only boundary case, it is missing one class — add a
> distinct case.
>
> **BND vs NEG (the one classification rule that keeps the slots distinct):** a
> `BND` case is a min/max±1 *boundary probe* that asserts **both** the just-valid
> accept and the just-invalid reject at an edge (one case, the boundary slot). A
> `NEG` case rejects a value from a **wrong partition** — wrong type, malformed,
> missing, unauthorized — *not* a value one step past a numeric edge. So
> "decimals = 19" is `BND`; "decimals = `abc`" is `NEG`. (See the BVA worked
> example in [`test-design.md`](test-design.md).)
>
> **Prefer a value-boundary for the third slot**: when the AC has an ordered/sized
> input, fill the boundary slot with a real `BND` case that probes both sides of
> the edge; fall back to an `EDGE` case (concurrency, network-failure, encoding)
> only when the AC has no natural value boundary. For a **non-ordinal predicate**
> (uniqueness, membership, a name collision — no numeric min/max), a `BND` case
> may probe a single side of the equivalence-class edge (the just-inside-accept
> *or* the just-outside-reject), since there is no two-sided numeric edge to assert.

A **rejection-style AC** (e.g. *"reject an invalid RPC"*) still gets all three:
its *positive* is the valid-input-accepted case (the inverse the rule protects),
its *negative* is the rejection case(s), its *boundary* is the just-valid /
just-invalid edge. There is no "where applicable" escape — if a class seems
impossible, the AC is usually under-specified; re-read it via
[`test-design.md`](test-design.md) before declaring a class N/A, and if truly
N/A, log it in *Open / deferred* with the reason (never silently blank).

How it is enforced:
- An AC missing any of positive/negative/boundary → return to
  [`test-design.md`](test-design.md) and derive the missing class (boundary via
  boundary-value analysis, negative via partitioning + the
  [`edge-coverage.md`](edge-coverage.md) taxonomy).
- An orphan TC → either it tests an unwritten requirement (raise it as a
  PRD/story gap) or it is dead weight (remove it).
- An orphan AC → write the cases; until then it is logged in *Open / deferred*
  with an owner and target.

This matrix is checked in **Self-review** against
[`quality-bar.md`](quality-bar.md) (Band-A) and again by the author-blind review.
It is the single most important difference between a koni-qc suite and the backup.

> **The AC↔TC matrix proves *requirements* coverage; the orthogonal matrices prove
> *surface* coverage.** For an API/UI suite, pair it with the endpoint /
> HTTP-status-code / error-code (API) and pages / components / validation+a11y
> (functional) matrices from [`layered-suites.md`](layered-suites.md) — a status code
> or page with zero TCs is a whole untested class the AC axis cannot see.
>
> **And the 3-slot rule is a FLOOR, not a stopping criterion.** A matrix can be green
> at ~3 cases/AC while the suite is 10× under-derived — the volume comes from
> [`test-design.md`](test-design.md) **step 9** (cross-multiply shared classes ×
> surfaces; exemplar density ~150 cases/US), checked by the Self-review density
> sanity ([`qc-workflow.md`](qc-workflow.md) §3).

---

## Risk-based priority & regression

**Priority = impact × likelihood.** Impact = blast radius if it breaks (data
loss, fund loss, auth bypass = high). Likelihood = how often the path runs ×
how fragile it is. The product sets the priority in the canonical table:

| | High impact | Med impact | Low impact |
|---|---|---|---|
| **High likelihood** | Critical | Critical | High |
| **Med likelihood** | Critical | High | Medium |
| **Low likelihood** | High | Medium | Low |

**Run-order under time pressure**: Critical first (release-blockers), then High;
Medium/Low only if time remains. The order is the value of the priority column —
a suite that can't all run still runs the cases that matter.

**Regression tagging (`RC-`)**: cases that guard the per-release baseline — a
fixed bug must never return, a cross-story invariant must hold — are tagged
`RC-<n>` in addition to their TC-ID and collected into the release regression
set. This is the "undefined regression scope" gap from the backup, closed: the
`RC-` set *is* the regression scope, run every release.

---

## koni conventions preserved

koni-qc adds rigor on top of the existing koni conventions — it does not discard
them:

- **Platform-variant columns** — a case that differs by surface keeps the
  `[extension]` / `[mobile]` / `[webapp]` / `[telegram]` variant tag; one row may
  fan out per platform (pairwise, see [`test-design.md`](test-design.md)).
- **L1/L2/L3 sub-case hierarchy** — a parent case may have indented sub-cases for
  step-level detail; the parent TC-ID owns the matrix entry.
- **Explicit preconditions** — the Preconditions column is mandatory, never
  blank, never "logged in" alone — name the exact state.
- **Issue-tracker links** — a case born from a bug links the issue in its
  `Covered-by` cell; an `RC-` regression cites the bug it guards.
- **Native-language steps** — Vietnamese (or other) step text is allowed in
  internal suites; the canonical docs (koni-docs templates) remain English-only
  per RULE-13.
