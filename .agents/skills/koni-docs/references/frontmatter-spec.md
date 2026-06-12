# Frontmatter Reference Spec — single source of truth for ID fields

> **Audience**: every koni-docs consumer project (Koni-Skills, Koni-Finance-Final,
> Koni-ERP-02, future Koniverse projects). When a project's docs disagree with
> this spec, the spec wins.
>
> **Scope**: defines exactly what each frontmatter field on `stories/*.md`,
> `epics/*.md`, and `sprints/*.md` may contain — value format, parser
> behaviour, where prose belongs instead.
>
> **Why**: the koni-docs CLI (`sync`, `validate`, `backfill-fields`,
> `inject-tasks`) cross-references documents by ID. Prose or partial IDs in
> ID-typed fields break those cross-references silently — the script either
> looks up a non-existent row, or fans out a sentence into garbage tokens.

---

## 1. Iron Law

> **An ID-typed field contains ONLY canonical bare IDs. Prose, parenthetical
> notes, scope qualifiers, dependency narratives, and version ranges belong
> in the document body — never in frontmatter.**

If a value is supposed to identify a thing the script will look up, it MUST
match the canonical regex for that thing. Period. The "I'll add a small
clarifying note next to the ID" instinct is the bug — every such note
becomes a parser failure the moment the field gets split.

---

## 2. The four canonical ID spaces

The koni-docs framework distinguishes four ID namespaces. Each lives in
exactly one document and has exactly one canonical regex.

| Namespace | Lives in | Canonical regex | Example |
|---|---|---|---|
| **Functional Requirement** | `docs/PRD.md` → `## Functional Requirements` table, `ID` column | `^FR-\d+$` | `FR-12`, `FR-127` |
| **Non-Functional Requirement** | `docs/PRD.md` → `## Non-Functional Requirements` table, `ID` column | `^NFR-\d+$` | `NFR-3` |
| **Architecture Decision** | `docs/ARCHITECTURE.md` → `## Architecture decisions` table, `ID` column | `^AD-\d+$` | `AD-06`, `AD-33` |
| **User Story** | `docs/sprints/stories/US-X.Y-*.md` filename + frontmatter `id` | `^US-\d+\.\d+$` | `US-1.16`, `US-4.29` |

Plus three structural IDs used as container references:

| Namespace | Lives in | Canonical regex | Example |
|---|---|---|---|
| **Epic** | `docs/sprints/epics/EPIC-N.md` | `^EPIC-\d+$` | `EPIC-4` |
| **Sprint** | `docs/sprints/sprint-YYYY-WNN.md` | `^sprint-\d{4}-W\d{2}$` | `sprint-2026-W22` |
| **Version** | `VERSION` file + `CHANGELOG.md` headers | `^\d+\.\d+\.\d+$` (bare, no `v`) | `0.7.3` |

**Anything that is not one of these IDs does not belong in an ID-typed
frontmatter field.** Prose, partial IDs (`FR-X.1`, `FR-12..FR-15`),
qualifiers (`FR-10 (partial — accept path)`), and cross-doc narratives
(`extends US-1.3 (Better Auth org plugin) + US-1.17`) all go in the
document body — under Background, Cross-story dependencies, or
Implementation notes.

---

## 3. Per-document frontmatter contract

### 3.1 Story (`docs/sprints/stories/US-X.Y-*.md`)

| Field | Type | Required? | Pattern / Allowed values | Notes |
|---|---|---|---|---|
| `id` | scalar string | **YES** | `^US-\d+\.\d+$` | MUST match filename prefix (RULE-6). |
| `title` | scalar string | **YES** | free text, quoted if it contains `:` | One sentence. No trailing period. |
| `epic` | scalar string | **YES** | `^EPIC-\d+$` | MUST resolve to an existing `EPIC-N.md`. |
| `status` | enum | **YES** | `backlog \| ready \| in-progress \| review \| done \| blocked \| deprecated` | |
| `priority` | enum | recommended | `P0 \| P1 \| P2 \| P3` | |
| `points` | scalar | recommended | `1 \| 2 \| 3 \| 5 \| 8 \| 13 \| ''` (Fibonacci) | `''` = unsized. |
| `sprint` | scalar string | conditional | `^sprint-\d{4}-W\d{2}$` or `''` | Set when committed to a sprint. |
| `version_shipped` | scalar string | conditional | `^\d+\.\d+\.\d+$` (bare semver, no `v`) | MANDATORY when `status: done` (RULE-16). |
| `prd_ref` | **list of strings** | optional | every entry MUST match `^FR-\d+$` or `^NFR-\d+$` | FR rows synced by `koni-docs sync`. **Do not put AD-N here** — use `arch_ref`. |
| `arch_ref` | **list of strings** | optional | every entry MUST match `^AD-\d+$` | Architecture Decisions this story materializes. |
| `depends_on` | **list of strings** | optional | every entry MUST match `^US-\d+\.\d+$` | Stories whose artifacts this story consumes. |
| `assignee` | scalar string | **YES** when shipping | GitHub login (`saltict`), not display name | RULE-15. |
| `commit` | scalar string | **YES** when shipping | git SHA (7-char or full); CSV of SHAs for multi-commit stories | Never `pending` (RULE-2). |
| `created` | scalar string | recommended | `^\d{4}-\d{2}-\d{2}$` | |
| `updated` | scalar string | recommended | `^\d{4}-\d{2}-\d{2}$` | |
| `external_deps` | list of slugs | optional | `^[a-z0-9_-]+$` per entry | Third-party / legal-review waits — populates STATUS risk flag. |

### 3.2 Epic (`docs/sprints/epics/EPIC-N.md`)

| Field | Type | Required? | Pattern / Allowed values | Notes |
|---|---|---|---|---|
| `id` | scalar string | **YES** | `^EPIC-\d+$` | MUST match filename. |
| `title` | scalar string | **YES** | free text | |
| `status` | enum | **YES** | `backlog \| in-progress \| done` | |
| `prd_ref` | **list of strings** | optional | every entry MUST match `^FR-\d+$` | FR rows this epic *owns* (not just touches). List every FR explicitly — **no `..` range syntax** (`FR-28 .. FR-45` is invalid). |
| `arch_ref` | **list of strings** | optional | every entry MUST match `^AD-\d+$` | ADs this epic anchors. |
| `created` | scalar string | recommended | `^\d{4}-\d{2}-\d{2}$` | |
| `updated` | scalar string | recommended | `^\d{4}-\d{2}-\d{2}$` | |

### 3.3 Sprint (`docs/sprints/sprint-YYYY-WNN.md`)

| Field | Type | Required? | Pattern / Allowed values | Notes |
|---|---|---|---|---|
| `id` | scalar string | **YES** | `^sprint-\d{4}-W\d{2}$` | MUST match filename. |
| `status` | enum | **YES** | `planned \| in-progress \| closed` | |
| `start` | scalar string | **YES** | `^\d{4}-\d{2}-\d{2}$` | Inclusive start date. |
| `end` | scalar string | **YES** | `^\d{4}-\d{2}-\d{2}$` | Inclusive end date. |
| `goal` | scalar string | **YES** | One sentence | The sprint's headline goal. |

Sprint frontmatter intentionally has no ID-list fields — sprint scope
lives in the body's `## Sprint scope` table.

---

## 4. YAML form — list vs CSV string

The script accepts **both** forms today:

```yaml
# Canonical — preferred
prd_ref:
  - FR-04
  - FR-10
  - FR-127

# Inline flow form — equally valid, shorter for ≤3 items
prd_ref: [FR-04, FR-10, FR-127]

# Comma-separated string — backwards-compatible
prd_ref: FR-04, FR-10, FR-127
```

**Use the list form.** The CSV string form is the legacy escape hatch that
*invites* prose contamination — once authors see a string, they start
appending parenthetical notes. The list form makes it visibly wrong to
write a sentence inside `[...]`.

---

## 5. Anti-patterns (real examples + the fix)

These are pulled from the Koni-Finance-Final / Koni-Skills corpora and
are the exact kinds of values that break `koni-docs sync`.

### 5.1 Prose-in-`prd_ref`

```yaml
# ❌ BROKEN — parser splits on comma, produces fake IDs
prd_ref: ARCH §External Services (Resend, MVP) — proposes AD-33 (Email service abstraction); supports FR-04 / FR-10 / FR-127 deferred to EPIC-2 / EPIC-7

# ✅ FIXED
prd_ref: [FR-04, FR-10, FR-127]
arch_ref: [AD-33]
# Move the prose ("proposes AD-33 — Email service abstraction; deferred to EPIC-2 / EPIC-7")
# into Background or Architecture constraints in the body.
```

### 5.2 Parenthetical qualifier dangling off the last ID

```yaml
# ❌ BROKEN — parser sees "FR-94 (shared with EPIC-5)" as a single ID
prd_ref: AD-04, AD-06, FR-09, FR-90, FR-91, FR-93, FR-94 (shared with EPIC-5)

# ✅ FIXED
prd_ref: [FR-09, FR-90, FR-91, FR-93, FR-94]
arch_ref: [AD-04, AD-06]
# The "(shared with EPIC-5)" qualifier moves into Background:
# > FR-94 is co-owned with EPIC-5 — see EPIC-5 for the consumer side.
```

### 5.3 Story-as-PRD-ref

```yaml
# ❌ BROKEN — US-1.3 is not a PRD requirement, it's another story
prd_ref: extends US-1.3 (Better Auth org plugin) + US-1.17 (real-email invitation wiring); no dedicated FR

# ✅ FIXED
prd_ref: []                  # or omit the field entirely
depends_on: [US-1.3, US-1.17]
# Add a Cross-story dependencies section in the body explaining the relationship.
```

### 5.4 Slash-separated IDs

```yaml
# ❌ BROKEN — "FR-93 / FR-94" is one token, not two
prd_ref: AD-06 (pg-boss event bus), FR-93 / FR-94 (audit two-tier + redaction); follow-up to US-1.6

# ✅ FIXED
prd_ref: [FR-93, FR-94]
arch_ref: [AD-06]
depends_on: [US-1.6]
```

### 5.5 Range syntax in epic `prd_ref`

```yaml
# ❌ BROKEN — "FR-28 .. FR-45" is one literal string, matches no FR row
prd_ref: FR-28 .. FR-45, FR-82 .. FR-89, FR-114, FR-117 .. FR-120

# ✅ FIXED — enumerate explicitly
prd_ref:
  - FR-28
  - FR-29
  # ... every FR through FR-45
  - FR-82
  # ... through FR-89
  - FR-114
  - FR-117
  - FR-118
  - FR-119
  - FR-120
```

Yes, that's verbose. It's also accurate, greppable, and the only form the
script can validate. If the epic owns 30+ FRs and the list is unwieldy,
that's a signal the epic itself is too broad — split it.

---

## 6. Migration playbook (for a project carrying broken data)

1. **Audit**. Grep every story / epic for non-conformant `prd_ref` values:

   ```bash
   # In the project root:
   rg --no-heading -n '^prd_ref:' docs/sprints | \
     grep -vE '^[^:]+:\s*(\[[A-Z, -]+\]|[A-Z]+-[0-9]+(,\s*[A-Z]+-[0-9]+)*)$' | \
     head -50
   ```

   Anything that prints has prose / parens / slashes / ranges / wrong namespace.

2. **For each offender**, decide per-token:
   - Token matches `^FR-\d+$` → keep in `prd_ref`.
   - Token matches `^NFR-\d+$` → keep in `prd_ref` (NFR also lives in PRD).
   - Token matches `^AD-\d+$` → move to `arch_ref`.
   - Token matches `^US-\d+\.\d+$` → move to `depends_on`.
   - Token is prose → move to body (Background / Cross-story dependencies / Architecture constraints) and delete from frontmatter.
   - Token is a range (`FR-X .. FR-Y`) → enumerate every member.

3. **Convert all `prd_ref` to YAML list form** at the same time. The list
   syntax makes future prose contamination physically uglier to write.

4. **Run** `npx koni-docs sync --docs-path docs/ --dry-run` and
   `npx koni-docs validate --docs-path docs/`. Iterate until both are
   warning-free (modulo true data issues like a story citing a
   non-existent FR-99 — those are real bugs, not format problems).

5. **Commit per-epic** (one commit per epic's stories). Keeps the diff
   reviewable and the blame readable.

---

## 7. Parser behaviour (current koni-docs script)

For implementers / debuggers — exactly what `koni-docs sync` and
`validateFrRefs` do today (as of `koni-docs@0.7.3`):

- **Reading**: `frontmatter.prd_ref` is read as either a string or an
  array. String form is split on `,` and each fragment is trimmed.
- **Filtering** (sync): only entries matching `/^FR-/` are looked up in
  the PRD Functional Requirements table. Other entries (currently
  including `AD-N`) are silently skipped at the table-lookup step but
  surface as "row with ID … not found" warnings when fed to `updateCell`.
- **Filtering** (validate): same `/^FR-/` filter; the set of valid FR
  IDs is extracted from the PRD FR table's `ID` column.
- **No automatic awareness** of `arch_ref` / `depends_on` yet — these
  fields are read by humans / AI agents at planning time and validated
  by future tooling. Adopting them today is forward-compatible and gets
  prose out of `prd_ref` immediately.

A future `koni-docs` may tighten the parser to reject malformed entries
at sync time and to sync `arch_ref` into ARCHITECTURE.md's AD table.
Data that follows this spec keeps working unchanged when that lands.

---

## 8. Quick decision tree

```
Is the value a thing the script needs to LOOK UP in a table?
├── YES → it's an ID. It must match the canonical regex in §2.
│         No parens, no prose, no ranges, no slashes inside the ID.
│         Use list form. Wrong namespace? Move to the right field.
└── NO  → it's context. Put it in the body, not in frontmatter.
          (Background, Cross-story dependencies, Architecture constraints,
          Implementation notes — pick the section that fits.)
```

If you find yourself reaching for `(`, `;`, `/`, `..`, `and`, `extends`,
`supports`, `deferred`, `partial`, `shared with`, `follow-up to`, or any
free-text inside an ID-typed field — **stop**. That belongs in the body.
