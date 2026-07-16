# layered-suites — author the suite by layer, to the exemplar bar

> **Load when**: authoring test cases for a US/epic that has an **API surface and/or a
> UI** — this is the structure standard that lifts a suite from "one flat table" to the
> exemplar bar (synthesized from the US-001.001 API + functional exemplar suites and the
> SubWallet checklist-round practice in `koni-docs.backup`). It builds ON the method
> refs: [`test-design.md`](test-design.md) derives the cases, [`traceability.md`](traceability.md)
> owns TC-IDs + the AC↔TC matrix — **this file owns how the suite document is layered,
> shaped, and cross-checked**.

**Contents**: [The two layers](#the-two-layers) ·
[API suite standard](#api-suite-standard) ·
[Functional suite standard](#functional-suite-standard) ·
[Orthogonal coverage matrices](#orthogonal-coverage-matrices) ·
[Named test-data registry](#named-test-data-registry) ·
[Open questions](#open-questions) ·
[Round-based bug-fix retest](#round-based-bug-fix-retest) · [Ownership](#ownership)

---

## The two layers

Split a mixed-surface US into **two sibling case files** with a mutual scope contract —
one flat table forces API detail and UI detail into the same columns and both suffer:

| Layer | File | Proves | Excludes (and says so) |
|---|---|---|---|
| **API** | `US-X.Y-api-test-cases.md` (or the epic file's §API) | endpoints, auth, RLS/permissions, events, audit, DB effects | UI interactions, visual feedback, client state |
| **Functional / UI** | `US-X.Y-functional-test-cases.md` (or §Functional) | UI flows, validation feedback, states, a11y, visual conformance | endpoint responses, DB records, event publishing |

Each file **opens with "What is tested" + "Out of scope (covered in <the other file>)"** —
the pair of scope blocks is the contract that nothing falls between the layers. Once the
suite has run, each file also carries a **per-doc execution summary** under its scope
block — the full counter set of [`test-automation.md`](test-automation.md) §2 (total ·
pass · fail · blocked · broken · env-pending · design · not-written · manual ·
ops-deploy, + %; buckets sum to total), written back from the run
(the exemplar docs each open with theirs; a suite doc with no summary after a run reads
as never-executed). Both
layers share one TC-ID space and one AC↔TC matrix (`maps_to.us` unchanged); the split is
*presentation + column shape*, not a second numbering scheme.

**Where the files live + when to split.** Under the per-US layout
([`test-organization.md`](test-organization.md) §1) the layered pair are siblings
**inside the epic dir**: `test-cases/EPIC-N/US-x.y-api.md` +
`US-x.y-functional.md`, linked from that story's `US-x.y.md` row file and indexed in
`index.md` (same placement rule as the `<feature>-security-test-cases.md` split in
[`quality-bar.md`](quality-bar.md) Band B, which composes with this one). Split into
files when a layer exceeds ~15 cases; below that, keep `§API` / `§Functional`
sections inside `US-x.y.md`. (Legacy single-file repos: siblings sit next to
`EPIC-NN.md` as before.) The reporter's spec-reconcile scan is **recursive over
`test-cases/`** ([`test-automation.md`](test-automation.md) §2), but an unlinked
stray file is still invisible to a *reader* — always index it. Distinct from these
**authoring** docs: the per-run `test-reports/YYYY-MM-DD/EPIC-N/US-x.y/
{api,functional}-test-cases.md` are **generated execution instantiations** of the
same suites (reporter-written, never hand-edited).

## API suite standard

Organize **by endpoint** — one section + one summary table per endpoint (`POST /api/v1/…`),
so a reader audits an endpoint's coverage at a glance.

- **Columns** (the canonical table reshaped for APIs — `Response Time (ms)` **is** the
  canonical `Perf` column and `DB Changes` **is** `Side-effects`, renamed; a quality-bar
  "full canonical table" check accepts these renames): `TC ID · Name · Priority ·
  Test Data · Preconditions · Request Headers · Request Payload · Expected Response ·
  Actual Response · Status · Response Time (ms) · DB Changes · Covered-by`.
  - **Actual Response is the real body** (actual JSON, truncated sensibly) — never a
    paraphrase and never a copy of Expected (see [`report-quality.md`](report-quality.md)
    §Honest actuals).
  - **DB Changes** names the tables/rows the call touched (`users, user_wallets` /
    `No changes`) — it is the side-effects column made concrete for APIs.
  - Worked row (one line, real values — keep payloads/bodies tight):

    | TC ID | Name | Priority | Test Data | Preconditions | Request Headers | Request Payload | Expected Response | Actual Response | Status | Response Time (ms) | DB Changes | Covered-by |
    |---|---|---|---|---|---|---|---|---|---|---|---|---|
    | TC-01.WS-5 | Create workspace — wallet not owned | High | wallet `0xffff…9999` (User C's) | authed as User A | `Authorization: Bearer <JWT>` | `{ name, primaryWalletAddress: "0xffff…" }` | HTTP 403 `WALLET_NOT_OWNED` | `{"statusCode":403,"error":"WALLET_NOT_OWNED","message":"Wallet address is not owned…"}` | Pass | 78 | No changes | `epic/EPIC-01/workspaces.integration.spec.ts::TC-01.WS-5` |
- **Endpoint-group prefixes live in the TYPE slot of the canonical ID** — the domain-prefix
  allowance of [`traceability.md`](traceability.md): `TC-01.WS-1`, `TC-01.JOIN-4`,
  `TC-01.RLS-7`. Everything machine-read — **generated test names, `Covered-by`,
  `maps_to`, the reporter** — carries **only** the canonical `TC-<EPIC>.<TYPE>-<n>` form
  (the parse rule of [`test-automation.md`](test-automation.md) §2 depends on it). A short
  display alias (`WS-001`) MAY be used inside the doc's endpoint tables for scannability,
  but then the suite MUST carry an **alias → canonical TC-ID mapping table** in its
  traceability section, and the alias never appears in code or reports — two live ID
  spaces with an informal map is exactly the ERP F-12 collision
  ([`test-organization.md`](test-organization.md) §3).
- **Required API coverage classes** — a US with an API surface is not covered without
  each of these sections (mark N/A explicitly if truly absent; these are *structure*
  slots — the case content inside them derives from [`nfr.md`](nfr.md) §Security +
  [`test-design.md`](test-design.md), stated once there):
  1. **Auth guard** — expired / missing / malformed / wrong-issuer token **× every
     protected endpoint** — the case count multiplies per endpoint (each endpoint's
     guard is a separate implementation risk; `test-design.md` step 9); only the
     *document placement* is shared (one Auth Guard section holding all the rows,
     not the prose duplicated per endpoint).
  2. **RLS / permission isolation** — per protected table: owner-scoped read, cross-user
     isolation (the *other* user's rows do NOT appear), and client write-rejection.
  3. **Events / messaging** — each domain event: emitted-on-trigger, payload shape,
     idempotency under rapid duplicates.
  4. **Audit / compliance** — the audit trail rows (who/when/IP/agent, failed attempts
     recorded with reason).

## Functional suite standard

- **Category prefix in every case name** — a **closed set of four**, mapped from the
  scenario (the TC-ID TYPE still classifies the case; they coexist):
  `[Happy Path]` = the primary success flow (FUNC/E2E/SMK/API positives) ·
  `[Error]` = a failure/rejection path (NEG, SEC rejections, network/server errors) ·
  `[Validation]` = an input-rule check incl. its boundaries (BND + form-validation NEG) ·
  `[Verification]` = a state/feedback/display assertion after an action (badges, toasts,
  persistence, disabled-during-submit, A11Y checks). Don't invent a fifth.
- **UI-component traceability** — the traceability table carries a `UI Component` column
  (Login page · Workspace switcher · Toast…), enabling the per-component rollup below.
- **Evidence per executed case** — a dedicated **Evidence/Note column** (NOT `Covered-by`,
  whose five fixed forms are [`traceability.md`](traceability.md)'s and must not be
  extended) links the runner spec `file:line` **and** the artifact (video/screenshot
  path) for every failure, so a fail is replayable without re-running
  (`e2e/us001.spec.ts:214; …/img/TC-….webm` — artifacts live in the run folder per
  [`report-quality.md`](report-quality.md) §Evidence rule).
- **State/feedback verification is first-class** — disabled-during-submit, loading
  states, toasts (success + error), empty states, keyboard/a11y — derived via
  [`test-design.md`](test-design.md) but *listed* so they aren't dropped as "polish".

## Orthogonal coverage matrices

The AC↔TC matrix proves *requirements* coverage; these matrices prove **surface**
coverage — cheap tables that catch whole missing classes the AC axis can't see. Include
the ones that apply; each is "enumerate the full set → map TCs → a set member with no TC
is a visible gap":

| Matrix | Enumerate | For |
|---|---|---|
| **Endpoint coverage** | every endpoint × its TC count | API |
| **HTTP status-code coverage** | every status the design can return (200/201/400/401/403/404/409/410/413/415/5xx) → the TCs that assert it | API |
| **Error-code coverage** | every error code in the design (`WALLET_NOT_OWNED`, …) → the TCs that assert it | API |
| **Field × validation coverage** | rows = input fields; cols = {empty · min−1 · min · max · max+1 · wrong-type · format · injection} — **every cell a TC-ID or an explicit N/A** | API + Functional |
| **State-transition coverage** | every legal transition AND every illegal attempt → its TC | API + Functional |
| **Page coverage** | every page/route → its TCs | Functional |
| **Component coverage** | every UI component touched → its TCs | Functional |
| **Validation + a11y coverage** | every validation rule; keyboard/screen-reader/focus | Functional |

A status/error code with zero TCs = an untested contract branch; a page with zero TCs =
an untested surface. These live in the suite's Traceability section next to the AC↔TC
matrix.

## Named test-data registry

One section registering every fixture **by name with a "Used In" back-reference**
(wallet/account/token/workspace → owner, state, the TCs that use it):

| Fixture | State | Used in |
|---|---|---|
| `0xabcd…2222` | owned, **unverified** | WS-006, JOIN-008 |
| `invite-expired-002` | expired | JOIN-004 |

The registry makes collisions visible (two TCs mutating one fixture), makes runs
reproducible, and is where **acquisition notes** live ("how to get a funded test account
on network X" — the backup's *Cách lấy data* guideline pattern). This implements
[`qc-workflow.md`](qc-workflow.md) §Test-data & fixtures strategy at the artifact level.

## Open questions

Every spec ambiguity the derivation surfaces becomes a **checkbox in an `## Open
Questions` section** of the suite — named, specific, and pointing at the doc that must
answer it ("GIF avatar support — TD only shows PNG/JPEG; confirm accepted MIME types").
The section also holds **recorded derivation-scope justifications** (e.g. why a small US
legitimately sits under the density sanity of [`qc-workflow.md`](qc-workflow.md) §3).
Never resolve an ambiguity silently inside a TC's Expected: the suite records the
assumption *and* the open question, and Frame routes it back as a PRD/story gap
([`qc-workflow.md`](qc-workflow.md) §1).

## Round-based bug-fix retest

The backup's matured practice for verifying fix batches (distinct from `RC-` regression
cases, which guard *shipped* invariants every release):

- A feature's bug-fix verification runs in **numbered rounds** (`[Round 1] <feature>`,
  `[Round 2] …`), each a checklist of the bugs found, re-verified against a **named
  build**.
- Each bug entry is an **Actual vs Expect pair + evidence** (screenshot/GIF/log link) —
  not a bare "broken" line — and links the design source (Figma/DESIGN.md) when visual.
- A bug re-opened in round N+1 stays on the list with its re-repro evidence; the round
  is clean only when every entry verifies. New rounds open until clean, then each
  surviving invariant graduates to a `TC-<EPIC>.REG-<n>` case tagged `RC-<n>` **citing
  the bug it guards** ([`traceability.md`](traceability.md)).
- **Where rounds live**: each round is a manual verification run → its checklist is the
  `report-manual.md` of a dated run folder
  (`test-reports/YYYY-MM-DD/EPIC-N/report-manual.md`, evidence in `img-manual/`), and
  any bug still open at round end is mirrored in `docs/tests/findings.md` until fixed
  ([`test-organization.md`](test-organization.md) §1).
- **The suite is living — every round bug feeds a spec case back.** Each bug found in a
  round adds (or sharpens) a case in `test-cases/` **before** graduation — the case that
  *would have caught it* — so the suite accretes with every round instead of staying a
  one-shot Design artifact. **The fed-back case IS normally the one that graduates**
  (it gains the `REG` type / `RC-` tag citing the bug) — don't author a second case for
  the same invariant. This is how the backup's checklists grew to their real density:
  bugs → cases, round after round.

## Ownership

This file owns the **suite structure + cross-check standard**. It composes, never
replaces: [`test-design.md`](test-design.md) (derivation), [`traceability.md`](traceability.md)
(TC-ID scheme, AC↔TC matrix, Covered-by forms), [`nfr.md`](nfr.md) (NFR + UI-conformance
criteria), [`test-organization.md`](test-organization.md) (where files live),
[`test-automation.md`](test-automation.md) (generation + reporter), koni-docs
`templates/test-cases.md` (the container). Report content is
[`report-quality.md`](report-quality.md).
