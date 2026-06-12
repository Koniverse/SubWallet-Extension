# OKR — File-Native Quarterly Ledger Template

> **File locations**:
> - `docs/okr/YYYY-QN.md` — one file per quarter
> - `docs/okr/README.md` — convention doc (this template's prose form)
>
> **Use when**: A project adopts the file-native OKR pattern (quarterly
> Markdown ledgers checked into the repo, parsed by a dashboard via the
> GitHub Contents API). Skip this template if the project tracks OKRs in
> a SaaS tool (Lattice, Mooncamp, etc.) instead.
>
> **Why file-native**: the repo is already the source of truth for code +
> specs + decisions. OKRs that live in the same repo get the same review,
> diff, and audit affordances. Permissions and check-in writes are
> managed via a small DB table (`okr_owners`), not by file-permission
> gymnastics.

---

## 1. File-naming rule

`YYYY-QN.md` exactly. Parser regex: `(\d{4})-Q([1-4])\.md$`. Examples:
`2026-Q1.md`, `2026-Q2.md`, `2027-Q3.md`. Other filenames are ignored.

---

## 2. YAML schema (per quarter file)

Each MD file contains one or more fenced ` ```yaml ... ``` ` code
blocks. Top-level keys are `team_<slug>`. Required fields:

```yaml
team_<slug>:
  function: <string>            # required — sales / marketing / engineering
  owner: <string>               # required — IS the SQL `WHERE owner = '..'` literal
  description: <string>         # optional
  KR_<slug>:                    # ≥1 KR per team
    target: <number>            # required
    unit: <string>              # required — USD / % / count / days / hours / NPS
    measure: |                  # required — SELECT-only SQL against `data_tables.<table>`
      SELECT ...
    source: <string>            # required — `data_tables.<table>` validation hint
    description: <string>       # optional
    threshold: <number>         # optional — yellow-zone boundary
    stretch: <number>           # optional — 10× / aspirational target
```

---

## 3. KR formula rules

- **SELECT-only.** `INSERT / UPDATE / DELETE / DROP / CREATE / ALTER`
  fail at parse time AND at the RPC level (belt + braces).
- **Single statement.** No semicolon-separated multi-statements.
- **End-exclusive boundaries.** Use `closed_at >= '2026-04-01' AND
  closed_at < '2026-07-01'` for Q2 — half-open intervals avoid
  double-counting on July 1.
- **Owner string matches YAML `owner`.** `WHERE owner = 'salesperson_1'`
  expects the same literal as the team's `owner:` key.
- **Qualify `data_tables.<table>` in `source:`** so the validator can
  look up the schema. Bare `data_tables` (no table) is rejected.

---

## 4. Weekly notes

The MD file ends with a single `## Weekly notes` H2. The check-in
Server Action appends new notes BENEATH this heading, chronological
(newest at bottom), never edits prior notes.

Per-note format:

```markdown
### YYYY-WNN / <owner_slug>
_Posted YYYY-MM-DDTHH:MM:SSZ by <Display Name> (<auth-user-uuid>)_

<note body, free prose, max 5000 chars>
```

ISO-8601 week numbering. Timestamps stored in UTC.

---

## 5. Permissions (`okr_owners` table)

Replaces any in-repo `owners.json` static file. Maps auth user UUID →
`<owner_slug>` string per workspace. Managed under
`/dashboard/settings/okr` (Owner + Admin only). RLS exposes each Member
their own row so the check-in form can resolve their identity at
submit time.

---

## 6. Filled example — `docs/okr/2026-Q2.md`

````markdown
# 2026-Q2 OKRs

```yaml
team_sales_a:
  function: sales
  owner: salesperson_1
  description: Enterprise pipeline, US East coast
  KR_pipeline_value:
    target: 500000
    unit: USD
    threshold: 350000
    stretch: 1000000
    source: data_tables.deals
    description: Sum of `amount` on `stage IN ('proposal','negotiation','closed_won')`
    measure: |
      SELECT COALESCE(SUM(amount), 0) AS actual
      FROM data_tables.deals
      WHERE owner = 'salesperson_1'
        AND closed_at >= '2026-04-01'
        AND closed_at <  '2026-07-01'
        AND stage IN ('proposal','negotiation','closed_won');
  KR_logos_closed_won:
    target: 6
    unit: count
    source: data_tables.deals
    measure: |
      SELECT COUNT(*) AS actual
      FROM data_tables.deals
      WHERE owner = 'salesperson_1'
        AND stage = 'closed_won'
        AND closed_at >= '2026-04-01'
        AND closed_at <  '2026-07-01';
```

## Weekly notes

### 2026-W18 / salesperson_1
_Posted 2026-05-04T10:30:00Z by Hieu Dao (00000000-0000-0000-0000-000000000001)_

Closed Acme ($85k) on Friday; two stalled deals re-engaged after the
pricing-page refresh shipped Wed. Next week: push Beta Corp through
procurement, expect close 2026-W19.
````

---

## 7. Cross-references

- Settings UI: `/dashboard/settings/okr` lets workspaces choose the
  repo + folder (`docs/okr/` by default).
- Dashboard: `/dashboard/okr/<year>/q/<N>` renders target-vs-actual
  per KR with weekly check-in timeline.
- LESSONS entry recommended whenever a parser quirk bites — e.g. YAML
  multi-line `measure:` indentation, end-exclusive boundary off-by-one.
