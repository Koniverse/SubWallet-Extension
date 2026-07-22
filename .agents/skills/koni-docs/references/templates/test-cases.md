# Test Cases File — Full Template

> **File location**: `docs/tests/test-cases/EPIC-N.md` (one file per epic)
>
> **Use when**: User asks to create or update a test-cases file for an epic,
> or when a planning tool (BMad `bmad-testarch-test-design`, GStack `/qa`,
> Superpowers) produces a test-plan-shaped artifact that needs
> standardization into the koni-docs structure.
>
> **One rule above all others**: a test-cases file is the *epic-level*
> verification contract. It does NOT replace per-story Acceptance Criteria
> (those remain in `docs/sprints/stories/US-X.Y-<slug>.md`). It captures
> what AC cannot: end-to-end flows that span multiple stories, regression
> scenarios that guard cross-story invariants, smoke checks per release,
> and the execution log that tells reviewers when each scenario last passed.

---

## 1. What this file owns vs. what it does not

| Concern | Owner |
|---|---|
| Per-story acceptance contract (AC-1..N + Tasks) | Story file (`stories/US-X.Y-<slug>.md`) |
| Per-AC runnable verification command | Story file §11 Verification commands |
| End-to-end flow spanning ≥2 stories in the epic | **This file** |
| Regression scenarios protecting epic-level invariants | **This file** |
| Smoke check for the epic at release time | **This file** |
| Coverage matrix (AC → TC) | **This file** §Coverage matrix |
| Execution history (when/who/pass/fail) | `docs/tests/test-reports/runs/*.md` |
| Cross-story test infrastructure (fixtures, harness) | Epic file §13 Cross-story testing requirements |

**Iron rule**: if a scenario can be expressed as a single story's AC, it
belongs in the story file. Promote to a test-case here only when it
exercises ≥2 stories or guards an epic-level invariant.

---

## 2. Section index — what's required vs optional

| §   | Section                          | Small epic (≤5 stories) | Medium (6–12) | Large (13+) |
| --- | -------------------------------- | ----------------------- | ------------- | ----------- |
| 1   | Frontmatter                      | required                | required      | required    |
| 2   | Overview — Scope                 | required                | required      | required    |
| 3   | Overview — Stories in scope      | required                | required      | required    |
| 4   | Overview — Goals                 | recommended             | required      | required    |
| 5   | Overview — Environment & test data | optional              | required      | required    |
| 6   | Overview — Cadence & ownership   | optional                | recommended   | required    |
| 7   | Quick reference — scenarios summary | recommended          | required      | required    |
| 8   | Test scenarios (detail)          | required                | required      | required    |
| 9   | Coverage matrix                  | recommended             | required      | required    |
| 10  | Open / deferred scenarios        | optional                | recommended   | required    |

**Audience principle**: §2-§7 are written for the **tester / reviewer** scanning the file (≤2 min to understand scope + run sequence). §8 onwards is the executable detail for the person running the suite.

---

## 3. Full template skeleton

````markdown
---
id: EPIC-N-tests
epic: EPIC-N
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

## Overview

### Scope

<2-4 sentences naming the user flows + invariants this file covers, and
explicitly the ones it does NOT (those owned by sibling epics' test files
or deferred). Cross-link to the epic file [§Goal](../epics/EPIC-N.md) for
the product framing — do not repeat it.>

**Out of scope** (tested elsewhere):

- <Capability A> → see [EPIC-M tests](EPIC-M.md)
- <Capability B> → deferred to <phase / story>

### Stories in scope

<Every story this epic touches — both shipped and not — in one table so
a reviewer scans the surface area before diving into TCs. `Short name` is
a 2-5 word capability label (consistent across this file). `Status` uses
emojis so the table renders at a glance.>

| Story | Short name | Status |
|---|---|---|
| [US-X.Y](../../sprints/stories/US-X.Y-<slug>.md) | <2-5 word capability> | ✅ shipped |
| [US-X.Z](../../sprints/stories/US-X.Z-<slug>.md) | <2-5 word capability> | 🚧 in-progress |
| [US-X.W](../../sprints/stories/US-X.W-<slug>.md) | <2-5 word capability> | 📋 backlog |
| [US-X.V](../../sprints/stories/US-X.V-<slug>.md) | <2-5 word capability> | ⏸ out-of-scope (deferred / phase) |

> Status emoji set: `✅ shipped` · `✅ shipped (partial)` · `🚧 in-progress` · `📋 backlog` · `⏸ out-of-scope`.

### Goals — what running this suite proves

<3-5 bullets stating the high-level invariants the tester confirms by
running every TC in this file. These are NOT individual TCs — they are
the *why*. Reviewers use this to judge whether the TC list below actually
covers the goals.>

1. <Outcome 1 — the user-facing invariant or product property>
2. <Outcome 2>
3. <Outcome 3>

### Environment & test data

<Name the environments scenarios run against (`local`, `staging`,
`production`) and the seed data they assume. If scenarios need MinIO
fixtures, broker sandbox accounts, or Discord webhooks, list them here so
a future executor can reproduce without spelunking.>

- **Environment(s):** `staging` (default), `local` for unit-level
- **Seed data:** `<path or script>`
- **External dependencies:** `<broker sandbox / vendor / mock server>`
- **Secrets/keys:** load from `.env.test` (never commit)

### Cadence & ownership

<Who runs what, when. Pre-PR for `smoke`, per-release for `e2e + regression`,
nightly for `performance`, etc.>

| Cadence | Test types | Owner |
|---|---|---|
| Per-PR | smoke | dev on PR |
| Per-release | e2e + regression | QA lead |
| Nightly | performance | CI |

## Quick reference — test scenarios summary

<Every TC in this file as a single-row scan. Tester reads top-down to know
exactly which scenarios + what they prove + which stories they touch before
diving into Gherkin. The `Stories` cell uses `US-X.Y <short name>` format
matching §Stories in scope; multiple stories use `<br>` line breaks.>

| # | ID | Type | Priority | Short description | Stories | Mode |
|---|----|------|----------|-------------------|---------|------|
| 1 | TC-N.E2E-1 | E2E | P0 | <one-line outcome the TC proves> | US-X.Y <short name><br>US-X.Z <short name> | manual |
| 2 | TC-N.REG-1 | Regression | P0 | <one-line outcome> | US-X.Y <short name> | automated |
| 3 | TC-N.SMK-1 | Smoke | P1 | <one-line outcome> | US-X.Z <short name> | automated |

> **Read this table first.** Passing every row = epic still works at
> release time. Drill into [§Test scenarios](#test-scenarios) for full
> Gherkin detail.

## Test scenarios

<Every scenario is an H3 subsection with a YAML metadata block + Gherkin
body. Number TCs within the epic using `TC-N.<TYPE>-<num>`:
- `TC-02.E2E-1` — end-to-end flow
- `TC-02.REG-1` — regression
- `TC-02.SMK-1` — smoke
- `TC-02.PRF-1` — performance
- `TC-02.SEC-1` — security
- `TC-02.INT-1` — integration

NEVER renumber TCs after creation. Even if one is removed, the number stays
deprecated so cross-references (in test-reports, lessons, PRs) survive.>

### TC-N.E2E-1 — <Short scenario title>

```yaml
id: TC-N.E2E-1
type: e2e                   # smoke | regression | e2e | integration | unit | performance | security
mode: manual                # manual | automated | hybrid
priority: P0                # P0 | P1 | P2 | P3
maps_to:
  fr: [FR-N, FR-M]
  ac: [US-X.Y/AC-1, US-X.Y/AC-3, US-X.Z/AC-2]
  ad: [AD-N]
  rule: [RULE-N]            # optional — security/compliance rules from CLAUDE.md
```

**Preconditions:**
- <state of the system before the scenario starts>
- <user / data prerequisites>

**Scenario:**
```gherkin
Given <preconditions>
And   <additional context>
When  <user / system action>
Then  <observable outcome>
And   <invariant that must hold>
```

**Test data:**
- `<account / fixture / file>`

**Notes:**
- <known flakiness, branch coverage, links to bug tickets>

### TC-N.REG-<num> — <Regression title>

<Same structure. Regression scenarios should explicitly cite the
LESSONS.md entry or CONTEXT.md decision they guard against re-regression.>

## Coverage matrix

<Roll-up: which TC covers which AC in which story. Reviewers use this to
spot AC gaps. The Story column inlines the short name from §Stories in
scope (gives a tester scanning a single row enough context to know what
the AC is about). AC description is a ≤80-char distillation of the
story's AC text — never copy paste the full AC. Generate by hand at first;
later phases may auto-fill via `agile-sync-tests.mjs`.>

| Story | AC | AC description | Covered by | Type |
|---|---|---|---|---|
| [US-X.Y — <short name>](../../sprints/stories/US-X.Y-<slug>.md) | AC-1 | <≤80-char summary of what the AC asserts> | TC-N.E2E-1, TC-N.SMK-1 | e2e, smoke |
| [US-X.Y — <short name>](../../sprints/stories/US-X.Y-<slug>.md) | AC-2 | <summary> | TC-N.REG-1 | regression |
| [US-X.Z — <short name>](../../sprints/stories/US-X.Z-<slug>.md) | AC-3 | <summary> | — | **gap** |
| [US-X.W — <short name>](../../sprints/stories/US-X.W-<slug>.md) | — | <story-level purpose if AC list not relevant> | — | **gap (entire story)** |

> **Gap rule:** any AC row with `—` in "Covered by" must appear in
> §Open / deferred scenarios with an owner and a target date.
>
> **Short name consistency:** use the exact same `<short name>` value as
> in §Stories in scope. Cross-file consistency (same US-X.Y → same short
> name across every test-cases file in the project) is enforced by the
> agent maintaining the docs.
>
> **AC description sourcing:** distill from the story file's `## Acceptance
> criteria` section:
> ```bash
> sed -n '/^## Acceptance criteria/,/^## [A-Z]/p' docs/sprints/stories/US-X.Y-*.md
> ```
> Compress to ≤80 chars while preserving technical terms (function names,
> env vars, HTTP codes). For ACs still in `[ ]` status in the story file,
> include them in the matrix with `Covered by = —` and `Type =
> **gap (deferred)**`.

## Open / deferred scenarios

<Scenarios that should exist but do not yet. Each item names the owner +
the trigger (date / event) that will close the gap.>

- **<Scenario title>** — covers `US-X.Z/AC-3` (currently no TC).
  Owner: `<name>`. Target: `<sprint id or release tag>`.
- **<Scenario title>** — performance baseline for `<operation>`,
  deferred until [EPIC-N performance budget](../epics/EPIC-N.md#performance-budgets--invariants)
  is published.
````

---

## 4. Per-section guidance

### §1 Frontmatter

- `id` matches the filename's epic ID: `EPIC-02.md` → `id: EPIC-02-tests`.
- `epic` links back to the canonical epic file (1-to-1).
- `created` / `updated` follow the same convention as story frontmatter.
- Do NOT add `status:` to the file frontmatter — status lives **inside
  each TC's metadata block** (because a single file can have a mix of
  ready + draft + executed + deprecated scenarios).

### §2 Scope

- 2–4 sentences. Name the user flows + invariants covered, and the ones
  explicitly NOT covered (cross-link to sibling epic test files when
  passing the baton).
- If this file leaves a major area uncovered on purpose (e.g. "load
  testing deferred to EPIC-08"), state it here — reviewers should not
  have to guess.
- The "Out of scope" bullet list is mandatory when the epic has sibling
  test files. Reviewers must not have to guess which epic test file owns
  a flow they expected to find here.

### §3 Stories in scope

- One row per story the epic touches, including stories that have no
  TC coverage in this file (mark them `📋 backlog` or `⏸ out-of-scope`).
  A missing row is worse than a row with status `⏸` — it makes the
  reviewer wonder if the story was forgotten.
- `Short name` is a 2-5 word capability label (≤25 chars). The same value
  must be reused in:
  - §Quick reference summary (Stories cell, as `US-X.Y <short name>`)
  - §Coverage matrix (Story cell, as `[US-X.Y — <short name>](...)`)
  This 3-place consistency is non-negotiable; the agent that maintains
  the file enforces it.
- Status emoji set is fixed: `✅ shipped` · `✅ shipped (partial)` ·
  `🚧 in-progress` · `📋 backlog` · `⏸ out-of-scope`. No free-form text.

### §4 Goals — what running this suite proves

- 3–5 bullets. Each bullet names a *user-facing invariant* or *product
  property* the suite confirms. These are NOT TC IDs.
- Goals are the bridge between "what the epic claims to do" (PRD / epic
  file) and "what we actually test" (TCs below). If a goal has no TC
  backing, it belongs in §Open / deferred with an owner.
- Reviewers check: do the goals here cover the FRs `prd_ref` in the epic
  frontmatter? If a goal is absent for a covered FR, the file is
  incomplete.

### §5 Environment & test data

- Required for medium / large epics. Without it, a future executor
  cannot reproduce the scenarios.
- List ALL external dependencies (broker sandbox, MinIO bucket, Discord
  webhook, mock server) — each one is a potential flake source.
- Never commit secrets. Reference `.env.test` or a sealed vault.

### §6 Cadence & ownership

- Required for large epics. The "who runs what when" matrix prevents
  scenarios from rotting unowned.
- Cadence values: `per-PR`, `per-release`, `per-sprint`, `nightly`,
  `on-demand`. Match these to the `trigger` field if you extend the YAML
  metadata block in phase 2.

### §7 Quick reference — scenarios summary

- One row per TC in the file, ordered to match §Test scenarios (detail)
  section order. A reader who only opens this section must learn enough
  to know which TCs to run, in what order, and what each proves.
- `Short description` (≤80 chars) is a distilled version of the TC's H3
  title. Avoid mechanics ("calls function X") — name the *outcome*.
- `Stories` cell mirrors §Stories in scope short names. Multiple stories
  separate with `<br>` for a vertical stack inside the cell.
- `Mode` matches the YAML metadata block (`manual` / `automated` / `hybrid`).
- This table is regenerated when scenarios are added/removed/renumbered.
  It is NOT a separate source of truth — the detail section §8 is.

### §8 Test scenarios — TC structure

- Every TC needs the YAML metadata block + Gherkin scenario block.
  Gherkin is mandatory even for `unit`/`integration` types — the
  Given/When/Then framing forces precondition + observable clarity.
- `maps_to.ac` is the single most-important field for traceability.
  Every TC must map to at least one AC; a TC that maps to zero AC is
  either testing something that's not specified (gap in PRD/story) or
  is dead weight.
- For automated TCs, include a Notes line linking to the test file:
  `Notes: implemented at e2e-tests/tests/<file>.spec.ts::<test name>`.
- Separate consecutive TCs with `---` horizontal rule for visual scan.

### §9 Coverage matrix

- Required for medium / large epics. Reviewers use this to spot AC
  gaps before signing off the epic.
- A row per `(story, AC)` pair, not per story. A story with 5 ACs
  produces 5 rows.
- **Story column** inlines the short name from §Stories in scope:
  `[US-X.Y — <short name>](../../sprints/stories/US-X.Y-<slug>.md)`. The
  short name is repeated on every row for the same story — markdown has
  no `rowspan`, and the repetition helps tester scan a single row
  without going back to look up the story.
- **AC description column** (≤80 chars) distills the story's AC text.
  Extract with:
  ```bash
  sed -n '/^## Acceptance criteria/,/^## [A-Z]/p' docs/sprints/stories/US-X.Y-*.md
  ```
  Compress while preserving technical terms. For ACs still `[ ]` in the
  story (not shipped), include the row with `Covered by = —` and `Type =
  **gap (deferred)**` — never silently drop the AC.
- "**gap**" entries MUST appear in §10 Open / deferred scenarios with
  an owner and a target.
- For stories with no AC tracked (entire-story gaps, out-of-scope),
  represent as a single row: `| [US-X.Y — <name>](...) | — | <story
  purpose> | — | **gap (entire story)** |`.

### §10 Open / deferred scenarios

- Append-only — when a deferred scenario is implemented, move it to
  §8 Test scenarios but leave a one-line note here pointing to the new
  TC ID. This preserves history of why a gap existed.

---

## 5. Conventions

### TC ID format

`TC-<EPIC>.<TYPE>-<num>` where TYPE is uppercase 3-letter mnemonic:

| Type | Mnemonic | Meaning |
|---|---|---|
| `smoke` | `SMK` | Quick post-deploy sanity check (≤2 min) |
| `regression` | `REG` | Guards a previously-fixed bug or invariant |
| `e2e` | `E2E` | End-to-end flow spanning ≥2 stories |
| `integration` | `INT` | Service-to-service contract test |
| `unit` | `UNT` | Logic-level test (rarely promoted here — usually lives in story AC) |
| `performance` | `PRF` | Latency / throughput / size budget |
| `security` | `SEC` | Auth / authz / data-exposure check |

### Status (implicit in TC body, not frontmatter)

A TC is implicitly `draft` until its Coverage matrix row is filled.
Once `maps_to.ac` is non-empty AND a runnable Notes line or manual steps
exist, treat it as `ready`. Use test-reports (`runs/*.md`) to track
`executed` state — never duplicate execution status into the test-cases
file itself.

### Deprecation

When a scenario is no longer relevant (story removed, FR deprecated):

1. Replace the TC body with: `**Deprecated YYYY-MM-DD** — <one-line reason>. See [CONTEXT D<N>](../../CONTEXT.md).`
2. Keep the H3 heading + ID so cross-references survive.

---

## 6. Filled mini-example (condensed)

````markdown
---
id: EPIC-02-tests
epic: EPIC-02
created: 2026-05-15
updated: 2026-05-15
---

## Overview

### Scope

EPIC-02 (MT5 account linking + terminal provisioning) end-to-end flows,
credential-vault security regression, and per-release smoke.

**Out of scope** (tested elsewhere):

- Slot enforcement → see [EPIC-04 tests](EPIC-04.md)
- Partner verification → see [EPIC-06 tests](EPIC-06.md)

### Stories in scope

| Story | Short name | Status |
|---|---|---|
| [US-2.1](../../sprints/stories/US-2.1-link-mt5-account-with-encryption.md) | Link MT5 + vault | ✅ shipped |
| [US-2.6](../../sprints/stories/US-2.6-mt5-credential-verification.md) | Credential verify | ✅ shipped |
| [US-2.7](../../sprints/stories/US-2.7-terminal-provisioning.md) | Terminal provision | ✅ shipped |
| [US-2.8](../../sprints/stories/US-2.8-mt5-account-health-status.md) | Health status | ✅ shipped |
| [US-2.9](../../sprints/stories/US-2.9-unlink-mt5-account.md) | Unlink + decommission | 📋 backlog |

### Goals — what running this suite proves

1. A user can link an MT5 account with credentials encrypted at rest and never leaked in API/log.
2. The platform auto-provisions a terminal on an ONLINE node and surfaces health within 60s.
3. Credential vault is regression-safe — no code path returns plaintext.
4. The linked-accounts dashboard renders post-deploy (smoke).

### Environment & test data

- **Environment(s):** `staging` for e2e, `local` for security regression
- **Seed data:** `e2e-tests/fixtures/mt5-sandbox-accounts.json`
- **External dependencies:** Exness MT5 sandbox (`mt5-sandbox.exness.com:443`), Node Manager LAN endpoint, MinIO `ea-binaries` bucket
- **Secrets:** `.env.test` — `CREDENTIAL_ENCRYPTION_KEY`, `SERVICE_JWT_SECRET`

### Cadence & ownership

| Cadence | Test types | Owner |
|---|---|---|
| Per-PR | TC-02.SMK-* | dev on PR |
| Per-release | TC-02.E2E-*, TC-02.REG-* | QA |
| Nightly (post-MVP) | TC-02.PRF-* | CI |

## Quick reference — test scenarios summary

| # | ID | Type | Priority | Short description | Stories | Mode |
|---|----|------|----------|-------------------|---------|------|
| 1 | TC-02.E2E-1 | E2E | P0 | Link MT5 account → encrypted vault → terminal provision → health badge | US-2.1 Link MT5 + vault<br>US-2.6 Credential verify<br>US-2.7 Terminal provision<br>US-2.8 Health status | manual |
| 2 | TC-02.REG-1 | Regression | P0 | Credential vault never returns plaintext on any code path | US-2.1 Link MT5 + vault | hybrid |
| 3 | TC-02.SMK-1 | Smoke | P1 | Linked accounts list renders on dashboard | US-2.8 Health status | automated |

## Test scenarios

### TC-02.E2E-1 — Link MT5 account, provision terminal, verify health badge

```yaml
id: TC-02.E2E-1
type: e2e
mode: manual
priority: P0
maps_to:
  fr: [FR11, FR12, FR13, FR15]
  ac: [US-2.1/AC-1, US-2.1/AC-3, US-2.6/AC-1, US-2.7/AC-1, US-2.8/AC-1]
  ad: [AD-10]
```

**Preconditions:**
- Authenticated user with at least 1 free slot.
- Exness MT5 sandbox credentials available (`fixtures/mt5-sandbox-accounts.json`).
- At least 1 `NodeInstance` with `status=ONLINE` and free capacity.

**Scenario:**
```gherkin
Given the user is on the MT5 accounts page
And   they have 0 linked accounts and 2 free slots
When  they submit valid sandbox credentials (login + password + server)
Then  Mt5Account row is created with non-null encryptedPassword
And   no API response or log line contains the plaintext password
And   selectAvailableNode picks an ONLINE node with free capacity
And   the terminal_manager.ex5 boots on the assigned port within 15s
And   the account appears in the dashboard with terminalStatus=ACTIVE within 60s
```

**Test data:** `mt5-sandbox-accounts.json` → `account_a_demo`

**Notes:**
- Last run 2026-05-14 — pass (link to runs/2026-05-14-EPIC-02-run1.md).
- Manual phase 1; will be automated in `e2e-tests/tests/mt5-link-flow.spec.ts` (TBD US-19.X).

### TC-02.REG-1 — Credential vault never returns plaintext (security regression)

```yaml
id: TC-02.REG-1
type: regression
mode: hybrid
priority: P0
maps_to:
  fr: [FR11]
  ac: [US-2.1/AC-2, US-2.1/AC-4]
  rule: [SECURITY-1, SECURITY-2]
```

**Preconditions:**
- 1 linked Mt5Account in the DB with a known plaintext password.

**Scenario:**
```gherkin
Given an Mt5Account exists with login=8000123 and a known plaintext password
When  any OpenSaaS query, action, or REST endpoint returns the account
Then  no response field contains the plaintext password
And   no structured log line emitted during the action contains the plaintext password
And   the response shape is { login, serverAddress, accountType, terminalStatus } with no password-shaped field
```

**Notes:**
- Implemented at `app/src/mt5/__security__/credential-leak.test.ts` (planned).
- Guards CLAUDE.md security rule #1 + #2.

### TC-02.SMK-1 — Linked accounts list renders on dashboard

```yaml
id: TC-02.SMK-1
type: smoke
mode: automated
priority: P1
maps_to:
  fr: [FR15]
  ac: [US-2.8/AC-1]
```

**Scenario:**
```gherkin
Given an authenticated user with ≥1 linked Mt5Account
When  they navigate to /mt5/accounts
Then  the linked accounts table renders within 2s
And   each row shows login, broker, terminalStatus badge
```

**Notes:**
- Implemented at `e2e-tests/tests/mt5-accounts-smoke.spec.ts` (planned).

## Coverage matrix

| Story | AC | AC description | Covered by | Type |
|---|---|---|---|---|
| [US-2.1 — Link MT5 + vault](../../sprints/stories/US-2.1-link-mt5-account-with-encryption.md) | AC-1 | Submit valid credentials → Mt5Account row created with encryptedPassword | TC-02.E2E-1 | e2e |
| [US-2.1 — Link MT5 + vault](../../sprints/stories/US-2.1-link-mt5-account-with-encryption.md) | AC-2 | No API response or log contains plaintext password | TC-02.REG-1 | regression |
| [US-2.1 — Link MT5 + vault](../../sprints/stories/US-2.1-link-mt5-account-with-encryption.md) | AC-3 | Account routed to ONLINE node via selectAvailableNode | TC-02.E2E-1 | e2e |
| [US-2.1 — Link MT5 + vault](../../sprints/stories/US-2.1-link-mt5-account-with-encryption.md) | AC-4 | Vault uses AES-256-GCM, key from CREDENTIAL_ENCRYPTION_KEY | TC-02.REG-1 | regression |
| [US-2.1 — Link MT5 + vault](../../sprints/stories/US-2.1-link-mt5-account-with-encryption.md) | AC-5 | Duplicate-login advisory when same MT5 login used twice | — | **gap** |
| [US-2.6 — Credential verify](../../sprints/stories/US-2.6-mt5-credential-verification.md) | AC-1 | Node Manager validates credentials before persisting Mt5Account | TC-02.E2E-1 | e2e |
| [US-2.8 — Health status](../../sprints/stories/US-2.8-mt5-account-health-status.md) | AC-1 | terminalStatus=ACTIVE surfaced within 60s of provision | TC-02.E2E-1, TC-02.SMK-1 | e2e, smoke |
| [US-2.9 — Unlink + decommission](../../sprints/stories/US-2.9-unlink-mt5-account.md) | — | Soft-delete Mt5Account + decommission terminal cleanly | — | **gap (entire story)** |

## Open / deferred scenarios

- **Duplicate-login advisory check** — covers `US-2.1/AC-5`. Owner: `@qa-lead`. Target: sprint-2026-W21.
- **Unlink + decommission flow** — covers all `US-2.9` ACs. Owner: `@qa-lead`. Target: sprint-2026-W21.
- **TC-02.PRF-1 link p95 latency** — deferred until EPIC-02 publishes a perf budget (currently undefined).
````

---

## 7. Cross-references

- [Story template](story.md) — §11 Verification commands stays the
  source of truth for per-AC runnable checks.
- [Epic template](epic.md) — §13 Cross-story testing requirements
  declares shared fixtures + harnesses that test-cases scenarios import.
- [Test report template](test-report.md) — execution log for these
  scenarios (per-run + per-release).
- [Sprint system](../sprint-system.md) — where test-cases fit in the
  agile flow (Test artifacts section).
