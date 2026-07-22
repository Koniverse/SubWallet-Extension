---
name: koni-docs
description: >
  Manages all documentation artifacts in the koni-docs framework: SETUP,
  PRD, ARCHITECTURE, LESSONS, CHANGELOG, CONTEXT, DESIGN, and Sprints (epics /
  stories / sprint files / STATUS). Use when the user asks to update docs,
  create a story, record a decision, log a lesson, write a changelog entry,
  document system architecture, run the pre-commit doc checklist, or when any
  planning tool (BMad, GStack, Superpowers) produces artifacts that need
  standardization into the docs/ structure.
---
# koni-docs — Documentation Management

> **One rule above all others**: every code-shipping commit updates docs in
> the SAME commit. Never defer documentation to a follow-up.

---

## 0. Quick orientation — what lives where

```
docs/
├── README.md          ← doc hub + pre-commit checklist
├── SETUP.md           ← dev environment (clone → npm run dev)
├── BRIEF.md           ← product brief: executive summary, problem, solution, scope, vision
├── PRD.md             ← product spec: Epics / User Stories / Tasks
├── ARCHITECTURE.md    ← system architecture: tech stack, components, data, API, infra
├── CHANGELOG.md       ← full release history (every version)
├── CONTEXT.md         ← decision log (append-only, never rewrite)
├── LESSONS.md         ← recurring traps + patterns
├── design/            ← per-story design specs (US-X.Y-<slug>-design.md)
├── okr/               ← (optional) file-native quarterly OKR ledgers (YYYY-QN.md)
├── sprints/
│   ├── README.md      ← agile schema + workflow
│   ├── STATUS.md      ← AUTO-GENERATED kanban (never hand-edit)
│   ├── epics/         ← EPIC-N.md
│   ├── stories/       ← US-X.Y-<slug>.md (canonical task source)
│   ├── sprint-YYYY-WNN.md  ← active sprint
│   └── archive/       ← closed sprints
└── tests/
    ├── test-cases/    ← EPIC-N.md (epic-level scenarios: E2E + REG + SMK + matrix)
    │   └── README.md
    └── test-reports/  ← execution history (append-only)
        ├── README.md
        ├── runs/      ← YYYY-MM-DD-EPIC-N-runN.md (per-execution detail)
        └── releases/  ← vX.Y.Z.md (per-release aggregate)

DEPLOY.md              ← production runbook (repo root)
VERSION                ← current semver string (repo root)
DESIGN.md              ← design system (repo root)
.env.example           ← env var template (repo root)
```

---

## 1. Pipeline integration

Koni-docs is the **final stage** and **output standardizer** in the Koniverse product development pipeline:

```
BRAINSTORM → BRIEF → PRD → ARCH → EPIC/US → DESIGN → REVIEW → QA → IMPLEMENT → COMMIT/DOCS
   BMAD       BMAD    BMAD   BMAD     BMAD     GSTACK  GSTACK  GSTACK  SUPERPOWERS   KONI-DOCS
```

**Key principle**: Tools process content. Koni-docs standardizes output. When BMad, GStack, or Superpowers produce planning artifacts in their own directories (e.g., `_bmad-output/`), koni-docs maps them to the canonical `docs/` structure and ensures they follow Koniverse templates.

### Vietnamese counterpart convention (`*.vi.md`)

Some Koniverse projects (e.g. senti_quant) ship Vietnamese translations
of canonical docs as `*.vi.md` siblings — e.g. `docs/PRD.vi.md` next to
`docs/PRD.md`. **English is canonical** (per RULE-13): all sync scripts,
grep checks, and verification commands operate on `*.md` (no `.vi`
infix). The `.vi.md` files are:

- **Optional** — projects opt in per their team's language preference.
- **Never authoritative** — if `*.md` and `*.vi.md` disagree, `*.md` wins.
- **Skipped by sync scripts** — `npx koni-docs status` /
  `npx koni-docs sync` filter to `.md`-only files that DON'T match
  `*.vi.md`. Frontmatter parsing, AC counting, status propagation: all
  English-only.
- **Per-story discretion** — translate the stories that need broad
  cross-team review; leave engineering-detail stories English-only.

| Pipeline Phase          | Tool                | What it produces                                               |
| ----------------------- | ------------------- | -------------------------------------------------------------- |
| Brainstorm              | BMad + GStack       | Raw ideas, problem framing                                     |
| Product Brief           | BMad                | Executive brief                                                |
| PRD                     | BMad                | Full PRD content                                               |
| Architecture            | BMad                | Architecture decisions                                         |
| EPIC/US Breakdown       | BMad                | Epics + User Stories                                           |
| Design Review           | GStack              | Design review, interaction states                              |
| Plan Review             | GStack              | Architecture review, edge cases, test plan                     |
| QA                      | GStack              | Systematic testing, bug reports                                |
| Implementation          | Superpowers         | Plan → code → tests                                          |
| **docs Finalize** | **Koni-docs** | **Standardized docs, rules enforced, CLAUDE.md updated** |

---

## 2. Core rules (summary)

These 12 rules apply to ALL Koniverse projects. Full enforcement details in `references/rules.md`.

| Rule    | Summary                                                       | Group      |
| ------- | ------------------------------------------------------------- | ---------- |
| RULE-1  | VERSION + CHANGELOG in same commit                            | Pre-commit |
| RULE-2  | CHANGELOG commit hash mandatory, never "pending"              | Pre-commit |
| RULE-5  | STATUS.md auto-generated, never hand-edit                     | Post-gen   |
| RULE-6  | Story id must match filename + PRD `Epics & User Stories`    | During     |
| RULE-7  | CONTEXT.md append-only, corrections via revision entry        | During     |
| RULE-10 | Mark tasks [x] as you complete them                           | During     |
| RULE-11 | New env var → SETUP + DEPLOY + .env.example in same commit   | Pre-commit |
| RULE-13 | English-only for code, comments, UI, errors, commits, docs    | During     |
| RULE-14 | Commit prefix: feat:/fix:/chore:/docs:/style:/refactor:/test: | Pre-commit |
| RULE-15 | `assignee:` is the GitHub login — never git user.name         | During     |
| RULE-16 | `version_shipped:` is bare semver — never `v`-prefixed        | During     |
| RULE-17 | Frontmatter ID fields = bare canonical IDs only, never prose  | During     |

**Technology-specific rules** (Supabase, Next.js) live in plugin skills. When a project declares `koni-docs-plugins: [supabase, nextjs]` in its CLAUDE.md, load those plugin skills for the additional rules.

---

## 3. Workflow — task lifecycle

### 3a. Before writing any code

1. **Read LESSONS.md** — skim all entry titles; full-read 2-4 entries matching your domain.
2. **Read DESIGN.md** if any UI is involved.
3. **Find or create the story** in `docs/sprints/stories/`:
   - Flip `status:` → `in-progress`
   - Set `sprint:` to the active sprint id
   - If no story exists, create a stub using the full story template (`references/templates/story.md`) before starting.
   - **Domain-skill consultation for sizing** (mandatory for non-engineering
     projects — growth / marketing / sales-ops / content workspaces): before
     assigning `points:`, invoke the domain-appropriate skill(s) to cross-check
     the estimate. Skipping this leads to systematic 30-40% undersizing,
     especially for work with external dependencies, multi-stakeholder review,
     or repeat-batch output (validated by the koni-growth calibration analysis
     2026-05-23 — see [§3a-bis](#3a-bis-story-sizing--calibration-scale)).
     Routing:
     - **B2B sales work** (proposals, sales kits, RFP/RFI, POC plans,
       enterprise onboarding, IB / partner programs, agency partner kits) →
       invoke `/sales-engineer`
     - **Marketing ops work** (email sequences, CRM tagging, landing CRO,
       content production, analytics tracking, paid ads, attribution) → invoke
       `/marketing-ops`
     - **Cross-domain** (e.g., payment integration + onboarding emails +
       tracking) → invoke both
     - **Pure engineering / product code / docs-only tooling** — skip
       (gut-feel + Fibonacci is fine for these; consultation overhead is not
       justified)
   - Apply the sizing calibration scale (see §3a-bis below).
4. **Update the sprint file** — ensure the story row exists in the active sprint scope table.

### 3a-bis. Story sizing — calibration scale

For 1 assignee / 1-week sprint, ~10-15 pt capacity baseline. Tune per-team
when actuals stabilize.

| Pts | Effort | Scope signal |
|---|---|---|
| 1 | ~½ day | Single doc, 1 stakeholder, no external dep |
| 2 | 1 day | Single template/file, internal review only |
| 3 | 2 days | Multi-doc bundle OR 1 internal integration |
| 5 | 3-4 days | Production deliverable (HTML / video / email seq) OR 1 external system integration |
| 8 | 1 week | Multi-system integration OR multi-asset sales kit OR content batch ≥3 items |
| 13 | Multi-week | Cross-product, legal/compliance loop, unknown scope — **split if possible** |

**Splitting rule** — if a story estimates > 8pt, split it. A 13pt single
story is a planning anti-pattern: it blocks a whole sprint, hides milestone
risk, and cannot be paused/handed-off mid-flight. Reference split pattern from
koni-growth (CONTEXT D15): the original "Ship payment + recurring billing"
(13pt) was split into US-1.1 "payment one-shot" (8pt) + US-1.6 "recurring +
dunning state machine" (5pt), sequenced — first story unblocks revenue, second
unblocks lifecycle automation.

**External-dependency rule** — if a story waits on a third-party system,
partner, or legal review, populate the `external_deps:` frontmatter field
(see [story template](references/templates/story.md) §1.frontmatter). These
stories are the most commonly undersized because dev-time excludes calendar
wait time. Example values: `[payment_gateway, resend_api, legal_review,
sales_navigator_license, partner_signature]`.

**Done-story recalibration rule** — sprint assignment of a done-story is
locked history (do not move done stories across sprints), but **points may be
recalibrated** to reflect actual effort after the fact. This is the only way
to build a real velocity baseline; leaving inflated-optimistic estimates in
place mis-calibrates every future story. Recalibration must be paired with a
CONTEXT.md decision entry naming the affected stories and reasoning.

### 3b. During implementation

- Mark tasks `[x]` in the story file **as you complete them**, not all at the end (RULE-10).
- If you make an architecture or scope decision, append a `CONTEXT.md` entry immediately (see `references/templates/context.md`).
- If you encounter a trap or discover a reusable pattern, append a `LESSONS.md` entry.

### 3c. Pre-commit checklist

Run through every item before committing:

```
[ ] VERSION bumped per semver rule
[ ] CHANGELOG.md — story's "Changelog entry" section copied in, commit SHA filled (RULE-1, RULE-2)
[ ] PRD.md story status updated if scope changed
[ ] BRIEF.md updated if product vision, scope, or success criteria changed
[ ] CONTEXT.md has new entry if a decision was made
[ ] SETUP.md + DEPLOY.md + .env.example updated if new env var (RULE-11)
[ ] LESSONS.md has new entry if a trap or pattern was discovered
[ ] Story file: status → done, version_shipped set, Tasks all [x]
[ ] npx koni-docs sync --docs-path docs/  (5-layer sync)
[ ] npx koni-docs status --docs-path docs/  (STATUS.md — RULE-5)
[ ] CLAUDE.md Active Context block updated (see §4)
```

---

## 4. CLAUDE.md/AGENTS.md auto-update

Every Koniverse project must have an active context block. Agent updates that block at specific trigger points (T1–T7 below).

There are **two valid patterns** for where the Active Context block lives. Pick one per project; do not mix. Full template + rationale lives in [`references/templates/integration.md`](references/templates/integration.md) §0.

| Pattern | When to use | Active Context lives in |
|---|---|---|
| **A — Inline** | Solo developer, one active branch, low merge volume | `CLAUDE.md` between `koni-docs:auto-update` markers |
| **B — File-extracted (recommended for teams)** | 2+ developers, parallel branches, frequent sprint churn | `.active-context.md` (gitignored) — `CLAUDE.md` keeps a pointer; `.active-context.example.md` committed as template |

**Why a separate file for teams**: the Active Context block changes on every story start, close, sprint roll, decision, and lesson — many times per week. Two devs editing it on parallel branches always merges as a conflict. Pattern B moves the volatile content into a gitignored snapshot; the durable record stays in `docs/sprints/`, `CHANGELOG.md`, `CONTEXT.md`, `LESSONS.md`. Conflicts go to zero.

### CLAUDE.md integration block (config — common to both patterns)

```markdown
## Koni-Docs Integration

koni-docs:
  plugins: []                        # e.g. [supabase, nextjs]
  docs_path: docs/
  active_sprint: sprint-YYYY-WNN
  version_file: VERSION
```

### Active Context — Pattern A (inline in CLAUDE.md)

```markdown
## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-YYYY-WNN
- Active Stories: 🟡 US-X.Y <title>
- Last Version: vX.Y.Z
- Recent Decisions: D<N>
- Recent Lessons: §N
<!-- /koni-docs:auto-update -->
```

### Active Context — Pattern B (file-extracted, recommended for teams)

`CLAUDE.md` keeps only a pointer:

```markdown
## Active Context

> **Moved to `.active-context.md`** — see [`.active-context.example.md`](./.active-context.example.md)
> for the template and the gitignored-on-purpose rationale.
```

`.active-context.md` (gitignored) holds the live snapshot — both a `Local developer` block (GitHub login, git name/email, workspace, current branch) and the auto-update `Project sprint context` block. `.active-context.example.md` is committed as the team template; contributors copy it on first checkout. Full template in [`references/templates/integration.md`](references/templates/integration.md) §2.

### Trigger points (same for both patterns)

| #  | Trigger                | Action                                               |
| -- | ---------------------- | ---------------------------------------------------- |
| T1 | Start a story          | Add `🟡 US-X.Y <title>` to Active Stories          |
| T2 | Close a story          | Change `🟡 → ✅`, update Last Version             |
| T3 | Start a sprint         | Update Sprint ID                                     |
| T4 | Add a LESSONS entry    | Append LESSONS.md + add §N to Recent Lessons        |
| T5 | Log a CONTEXT decision | Append CONTEXT.md + add D`<N>` to Recent Decisions |
| T6 | Add an env var         | Update SETUP + DEPLOY + .env.example (RULE-11)       |
| T7 | Pre-commit             | Run full checklist, verify all doc layers consistent |

**How to update**: Use the `Edit` tool targeting the block between `<!-- koni-docs:auto-update -->` and `<!-- /koni-docs:auto-update -->` markers. For Pattern A the markers live in `CLAUDE.md`; for Pattern B they live in `.active-context.md`. Either way, only the marker block changes — surrounding content stays untouched.

---

## 5. Activation — how to use this skill

Every document template lives in its own file under
[`references/templates/`](references/templates/). Load only the template
file matching the user's request.

| User request                                    | Action                                                                                    | Load                                       |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| "create a story for US-X.Y"                     | Verify US-X.Y exists in PRD `Epics & User Stories`, use full story template. For retroactive/codebase-discovered stories, set `assignee` from the commit AUTHOR (`git log -1 --format=%an <sha>`), never the session user | `templates/story.md` §1                    |
| "start story US-X.Y"                            | §3a flow: read LESSONS → DESIGN.md → flip `status: in-progress`                           | `rules.md` §RULE-6                         |
| "close / complete story US-X.Y"                 | §3c checklist + 5-layer check + run agile:status                                          | `sprint-system.md` §5-layer                |
| "log a decision" / "record architecture choice" | Find highest D`<N>`, append decision entry                                                | `templates/context.md`                     |
| "revise / correct decision D`<N>`"              | Append revision entry, never edit original (RULE-7)                                       | `templates/context.md` §Revision           |
| "add a lesson" / "log a lesson"                 | Find highest entry number, append LESSONS entry                                           | `templates/lessons.md`                     |
| "write changelog for vX.Y.Z"                    | Append CHANGELOG entry, bump VERSION simultaneously                                       | `templates/changelog.md`                   |
| "create / update architecture"                  | Create or update ARCHITECTURE.md with tech stack, components, data flow                   | `templates/architecture.md`                |
| "create brief" / "update brief" / "product brief" | Create or update BRIEF.md from BMad brainstorm/brief output                             | `templates/brief.md`                       |
| "update PRD for [feature]"                      | Update both FR table row AND §11 story entry                                              | `templates/prd.md`                         |
| "create design spec for US-X.Y"                 | Use design spec template                                                                  | `templates/design-spec.md`                 |
| "create an epic"                                | Use full epic template                                                                    | `templates/epic.md`                        |
| "create sprint file"                            | Use sprint template                                                                       | `templates/sprint.md`                      |
| "create / update test-cases for EPIC-N"         | Use test-cases template (10-section layout: Scope / Stories in scope / Goals / Env / Cadence / Quick reference / Detail / Coverage matrix / Open) | `templates/test-cases.md`                  |
| "record a test run for EPIC-N"                  | Use per-execution sub-template — write to `runs/YYYY-MM-DD-EPIC-N-runN.md`                | `templates/test-report.md` §A              |
| "create release test report for vX.Y.Z"         | Use per-release sub-template — write to `releases/vX.Y.Z.md`, link from CHANGELOG          | `templates/test-report.md` §B              |
| "update setup for new env var"                  | RULE-11: update SETUP + DEPLOY + .env.example in same commit                              | `templates/setup.md`                       |
| "create OKR ledger" / "set up quarterly OKRs"   | Use OKR template (file-native quarterly Markdown ledger)                                  | `templates/okr.md`                         |
| "wire koni-docs into project" / "refresh Active Context" | Update CLAUDE.md + AGENTS.md (+ `.active-context.md` for Pattern B) integration blocks | `templates/integration.md`        |
| "adopt active-context split" / "move active context out of CLAUDE.md" | Pattern B: create `.active-context.example.md` + `.active-context.md` + gitignore + CLAUDE.md pointer | `templates/integration.md` §2 |
| "make AGENTS.md canonical" / "slim CLAUDE.md" / "AGENTS-canonical convention" | Apply §3.1 convention: CLAUDE.md keeps only pointer + Koni-Docs Integration + Active Context; AGENTS.md absorbs project structure / docs links / conventions | `templates/integration.md` §3.1 |
| "what templates exist?"                         | Browse the index                                                                          | `templates.md` (thin index)                |
| "run doc checklist" / "pre-commit check"        | Walk §3c checklist item by item                                                           | `rules.md` + `sprint-system.md`            |
| "regenerate status"                             | `npx koni-docs status --docs-path docs/` → commit                                         | `sprint-system.md` §Scripts                |
| "sync stories to PRD"                           | `npx koni-docs sync --docs-path docs/`                                                    | `sprint-system.md` §5-layer                |
| "inject tasks from AC"                          | `npx koni-docs inject-tasks --docs-path docs/ --story US-X.Y`                             | `sprint-system.md` §Scripts                |
| "backfill changelog SHAs"                       | `npx koni-docs backfill-commits --docs-path docs/`                                        | `sprint-system.md` §Scripts                |
| "standardize output from [tool]"                | Map tool output to canonical docs/ structure                                              | §1 Pipeline                                |
| "fix prd_ref" / "what goes in prd_ref / arch_ref / depends_on" / "AD-N in story frontmatter" / "sync warns row not found" / "migrate frontmatter" | Apply the per-field contract; move AD-N to `arch_ref`, US-X.Y to `depends_on`, prose to body | `frontmatter-spec.md` + `rules.md` RULE-17 |

---

## 6. Reference files

Load these on demand based on user intent:

| File                                  | When to load                                                             | Contents                                                          |
| ------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `references/rules.md`                 | User asks about rules, pre-commit check, or rule violation surfaces      | 12 core rules with severity, compliance steps, grep checks        |
| `references/frontmatter-spec.md`      | Authoring / migrating story / epic / sprint frontmatter; debugging `sync` row-not-found warnings | Authoritative per-field contract for `prd_ref` / `arch_ref` / `depends_on` / etc. Per-namespace regex, anti-pattern catalog with real broken values, migration playbook for projects carrying prose-stuffed ref fields. Pair with RULE-17. |
| `references/templates.md`             | User asks "what templates exist?" or needs to navigate templates         | Thin index — names each template, when to use it, links to the canonical file. Also has quick frontmatter cheatsheet for Story/Epic/Sprint. |
| `references/templates/changelog.md`   | Writing changelog entry / shipping a version                             | CHANGELOG entry template, rules (RULE-1/RULE-2), safe-insertion pattern (anchor on `[Unreleased]`), filled example |
| `references/templates/context.md`     | Recording a decision or revision (append-only, RULE-7)                   | Phase header + decision entry + revision entry templates, anti-patterns table, filled example (D3 TAM pivot) |
| `references/templates/lessons.md`     | Codifying a recurring trap / pattern                                     | Entry template, maintenance rules, filled example (`next build` vs `tsc`) |
| `references/templates/brief.md`       | Creating/updating product brief (precedes PRD Executive Summary)         | 8-section template (Exec / Problem / Solution / Differentiator / Persona / Success / Scope / Vision), filled example (Koni ERP brief) |
| `references/templates/prd.md`         | Creating/updating PRD (label-only H2 sections, FR row, story entry, Epics & User Stories index) | Heading convention + full template skeleton, update procedure, FR row format, story-in-PRD entry, condensed filled snippet, legacy-numbered-PRD migration steps |
| `references/templates/architecture.md` | Documenting tech stack / components / data / AD-N summary table         | Full ARCHITECTURE template (overview / stack / components / data / API / security / deploy / integrations / ADs), filled example |
| `references/templates/design-spec.md` | A story has visual or interaction complexity warranting a dedicated spec | Header refs + screens/states + layout decisions + component inventory + open questions, filled example (US-3.7 pod project) |
| `references/templates/epic.md`        | Creating/updating an epic                                                | Full BMad-grade Epic template — per-section guidance, required-vs-optional matrix by epic size, Mermaid patterns for entity maps + happy-path sequence diagrams, filled mini-example |
| `references/templates/story.md`       | Creating/stubbing/updating a story                                       | Full BMad-grade Story template — per-section guidance, required-vs-optional matrix by story size (1-13 pts), AC numbering rules, verification-command table pattern, filled mini-example |
| `references/templates/sprint.md`      | Opening or closing a sprint                                              | Frontmatter + Sprint scope table + goal recap + phased plan + retrospective + cross-references, filled example (sprint-2026-W19) |
| `references/templates/setup.md`       | Adding an env var (RULE-11 — all three files in same commit)             | SETUP block format + .env.example format + DEPLOY env table + RULE-11 checklist, filled examples for all three |
| `references/templates/okr.md`         | Project adopts file-native OKRs in `docs/okr/YYYY-QN.md`                 | File-naming rule, YAML schema, KR formula rules (SELECT-only, end-exclusive boundaries), weekly notes, permissions, filled example (2026-Q2.md) |
| `references/templates/integration.md` | Wiring koni-docs into a new project, refreshing Active Context           | CLAUDE.md `Koni-Docs Integration` block + AGENTS.md reference block + 7 trigger points for Active Context updates, filled example |
| `references/templates/test-cases.md`  | Creating / updating per-epic test scenarios (`docs/tests/test-cases/EPIC-N.md`) | 10-section skeleton — Scope / Stories in scope (emoji status) / Goals / Env / Cadence / Quick reference summary / Detail (Gherkin) / Coverage matrix (with "AC description" column) / Open. Per-section guidance + filled EPIC-02 mini-example |
| `references/templates/test-report.md` | Recording a test run or release-level report (`docs/tests/test-reports/{runs,releases}/...`) | Two sub-templates: A) per-execution detail (one file per run, append-only) — B) per-release master (aggregate linked from CHANGELOG). Result symbols, append-only discipline, cross-link contract |
| `references/sprint-system.md`         | User asks about sprints, agile workflow, scripts, 5-layer consistency, or test artifacts | Naming conventions, scripts, consistency check, setup guide, **§Test artifacts** (10-section test-cases structure + reports lifecycle) |
| `references/migration-from-bmad.md`   | User asks to migrate from BMad to koni-docs                              | Architecture comparison, artifact mapping, step-by-step procedure |
| `references/bmad-template-analysis.md` | User asks about BMad template standards, or mapping BMad artifacts to koni-docs | Full BMad pipeline → koni-docs mapping, template differences, update recommendations |

**Plugin skills**: If the project's CLAUDE.md declares `koni-docs-plugins`, load those skills for technology-specific rules that extend the core rule set.

---

## 7. CLI tool — `@koniverse/koni-docs`

This skill ships with a companion CLI binary published as `@koniverse/koni-docs` (current: **v0.7.0**). Provides 7 subcommands for the doc-maintenance work this skill prescribes, plus a reusable lib for programmatic use.

> **Source of truth**: VERSION in this repo (`/Volumes/MacData/Workspace/AI/Koni-Skills/VERSION`) matches the latest npm version. When numbers diverge, the repo is the canonical pre-release; npm is the canonical published version.

### 7.1 Install

Pick the mode that fits the consumer repo:

| Mode | Command | When to use |
|---|---|---|
| **devDep (recommended)** | `npm install --save-dev @koniverse/koni-docs` | Most consumer repos. Pinned in `package.json`, reproducible CI. Invoke via `npx koni-docs <cmd>`. |
| **Global** | `npm install -g @koniverse/koni-docs` | Cross-project use, one-off audits, ad-hoc preview. Invoke via `koni-docs <cmd>` (no `npx`). |
| **Local-tarball (pre-publish)** | From this repo: `cd packages/koni-docs && npm run build && npm pack` then `npm install -g ./koniverse-koni-docs-0.7.0.tgz` | Testing an unpublished version end-to-end, dogfooding a release candidate. Matches the v0.6.x / v0.7.0 ship workflow. |
| **`npm link` (active development)** | From this repo: `cd packages/koni-docs && npm run build && npm link` | Iterating on the CLI itself with a global `koni-docs` bin that always tracks `dist/`. Re-run `npm run build` after each source edit. |

> If a project's CLAUDE.md / AGENTS.md says the CLI is installed in a specific way (e.g. devDep with `npm run agile:status` aliases), match that — don't switch modes silently.

### 7.2 Update

| Install mode | Update command |
|---|---|
| devDep | `npm install --save-dev @koniverse/koni-docs@latest` (or pin a specific version) |
| Global | `npm install -g @koniverse/koni-docs@latest` |
| Local-tarball | Re-pack from this repo and re-install: `npm uninstall -g @koniverse/koni-docs && npm install -g ./koniverse-koni-docs-<v>.tgz` |
| npm link | `git pull && npm run build` from `packages/koni-docs/` — the linked bin picks up the new `dist/`. |

After upgrading, verify:

```bash
koni-docs --version        # global mode
npx koni-docs --version    # devDep mode
```

Should report the version you just installed. If `--version` shows an older number, the install didn't take — re-run install and re-check.

### 7.3 Global flags (every subcommand accepts these)

- `--docs-path <path>` — override the default `docs/` root (useful for monorepos)
- `--dry-run` — preview changes without writing files
- `--json` — machine-readable output (pipe to `jq`)
- `--verbose` — extra logging

### 7.4 Subcommand inventory

| Subcommand | Since | Purpose | Example |
|---|---|---|---|
| `status` | v0.4 | Regenerate `STATUS.md` kanban from story frontmatter (RULE-5) | `koni-docs status` |
| `sync` | v0.4 | Propagate story status through doc layers (Epic / PRD `Functional Requirements` / Sprint / STATUS); column-by-NAME addressing (W23 BLOCKER fix); PRD section lookup uses label (`## Functional Requirements`) with legacy `## 8.` fallback (v0.7.2) | `koni-docs sync --story US-X.Y` |
| `inject-tasks` | v0.4 | Regenerate `## Tasks` checklist from `## Acceptance criteria` items in a story | `koni-docs inject-tasks --story US-X.Y` |
| `backfill-fields` | v0.4 | Add missing standard frontmatter keys to story files via `STORY_DEFAULTS` | `koni-docs backfill-fields` |
| `backfill-commits` | v0.4 | Replace `pending` commit SHAs in CHANGELOG with real SHAs from `git log` | `koni-docs backfill-commits` |
| `preview` | v0.6.0 | Launch the Astro SSR docs viewer (dashboard / per-doc / `/project` tracker). `--watch` enables chokidar + SSE live-reload (v0.7.0). | `koni-docs preview docs --port 4321 --watch` |
| `validate` | v0.7.0 | L3 ID-graph integrity check + FR-ref reachability (each story's `prd_ref` resolves to a real FR row in PRD `Functional Requirements`). Exits non-zero on any error. | `koni-docs validate --json` |

### 7.5 Real-world usage — the four common loops

**(A) After editing a story file** (start, close, change AC):

```bash
koni-docs sync --story US-X.Y    # propagate status across 5 doc layers
koni-docs status                  # regen STATUS.md (RULE-5)
```

**(B) Pre-commit checklist** (full §3c sweep):

```bash
koni-docs inject-tasks --story US-X.Y   # only if AC changed
koni-docs sync --story US-X.Y
koni-docs status
koni-docs validate                       # fails CI on broken refs
git add docs/ && git commit -m "..."     # CHANGELOG SHA still "pending"
koni-docs backfill-commits               # backfill SHA → write change
git add docs/CHANGELOG.md && git commit -m "docs: backfill ..."
```

**(C) Doc audit on a new repo or after a long pause**:

```bash
koni-docs validate --include-warnings --json | jq        # find broken refs
koni-docs backfill-fields --dry-run                       # see what's missing
koni-docs backfill-fields                                 # fill defaults
koni-docs status                                          # regen kanban
```

**(D) Browse the docs visually** (dashboard + per-doc + project tracker + live-reload):

```bash
koni-docs preview docs --watch     # opens http://localhost:4321/
# /              dashboard (KPIs + epic grid)
# /docs/<slug>   any markdown doc rendered with shiki + mermaid
# /project       full story tracker (filter/group; needs v0.7.0+)
```

`--watch` watches `docs/**/*.md` (chokidar) and pushes SSE events to the browser; edit a story file and the open tab reloads automatically.

### 7.6 When to use which subcommand (mapping from user intent)

| User says... | Run |
|---|---|
| "regenerate STATUS" / "refresh kanban" | `koni-docs status` |
| "sync US-X.Y" / "propagate story X status" | `koni-docs sync --story US-X.Y` |
| "rebuild tasks for US-X.Y" | `koni-docs inject-tasks --story US-X.Y` |
| "story X is missing fields" / "fix story frontmatter" | `koni-docs backfill-fields` (add `--dry-run` first to preview) |
| "fill in commit SHAs" / "backfill changelog" | `koni-docs backfill-commits` |
| "show me the docs in a browser" / "open docs viewer" | `koni-docs preview docs --watch` |
| "check docs integrity" / "find broken refs" / "ID graph audit" | `koni-docs validate` |
| "run doc checklist before commit" | full loop (B) above |
| "audit this new repo's docs" | full loop (C) above |

### 7.7 Library API for programmatic use

Other Koniverse products can import the typed lib without the CLI. v0.7.0 surface:

```ts
// Corpus + I/O
import {
  loadCorpus, readDoc, writeDoc, parseDoc, serializeDoc, updateFrontmatter,
  getStories, getEpics, getSprints, getActiveSprint, resolveById,
} from '@koniverse/koni-docs/lib';

// Markdown primitives
import {
  findSection, findSectionStartingWith,    // ← prefix matcher (v0.7.0)
  replaceSection, appendToSection, removeSection,
  findTable, parseTable, findRow, updateCell, appendRow, removeRow,
  parseCheckboxes, setCheckboxState, appendCheckbox, replaceCheckboxes,
} from '@koniverse/koni-docs/lib';

// Schemas
import { Schemas } from '@koniverse/koni-docs/lib';
// → Schemas.storySchema, Schemas.epicSchema, Schemas.sprintSchema, Schemas.changelogEntrySchema

// Validators
import {
  validateRefs,        // L3 ID graph (story→epic, story→sprint, story→PRD Epics & User Stories)
  validateFrRefs,      // ← prd_ref reachability into PRD Functional Requirements (v0.7.0)
} from '@koniverse/koni-docs/lib';

// Changelog + git
import {
  parseChangelog, findEntryByVersion, formatVersionHeader, updateCommitSha,
  isGitRepo, findCommitForVersion, findCommitByTag, listVersionBumps,
} from '@koniverse/koni-docs/lib';
```

Subpath exports: `@koniverse/koni-docs/lib`, `@koniverse/koni-docs/lib/markdown`, `@koniverse/koni-docs/lib/schemas`.

The lib has zero CLI dependencies. Composes `gray-matter` (frontmatter) + `unified` / `remark-parse` / `remark-stringify` / `remark-gfm` (markdown AST) + `zod` (schemas). **Mutation contract**: every export is pure — functions starting with `update*` return a new value, never mutate inputs. Sole exception: `parseTable(...).node` returns a reference to the underlying mdast Table node (intentional, documented at call site).

### 7.8 Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `koni-docs --version` reports an older number than `package.json` | Build/install drift after editing source | `cd packages/koni-docs && npm run build && npm pack && npm install -g ./koniverse-koni-docs-<v>.tgz` |
| `sync` warns `PRD Functional Requirements FR <id>: section "## Functional Requirements" not found` | PRD has no `## Functional Requirements` heading and no legacy `## 8.` heading either | Rename the H2 to `## Functional Requirements` (canonical label form). Legacy numbered headings (`## 8. Functional Requirements`, with or without `(FR)` suffix) are still matched by the v0.7.2 fallback, but new PRDs should use the label form |
| `validate` exits non-zero with `(not_found)` warnings | Story references a sprint / epic file that doesn't exist | Either create the missing file or fix the story's `sprint:` / `epic:` frontmatter |
| `preview` shows 500 SyntaxError on `/` | Stale `dist/` shipped with v0.6.0 shebang leak | Upgrade to v0.6.1+ — `npm install -g @koniverse/koni-docs@latest` |
| `preview --watch` browser doesn't auto-reload | Browser cached page from before `--watch` was passed | Open DevTools, disable cache, reload once; afterwards SSE works |
| `writeDoc` adds/removes quotes in git diff | gray-matter normalization (fixed in v0.7.0 — preserves the original quote style per key) | Upgrade to v0.7.0+ |

### 7.9 Skill ↔ CLI relationship

This skill (the `SKILL.md` you are reading) and the `koni-docs` CLI evolve together. **When the SKILL.md says "run X"**, X is one of the subcommands above. **When the CLI gains a new subcommand**, this §7 inventory is the authoritative reference — `references/sprint-system.md` mirrors only the agile-related subset (`status`, `sync`, `inject-tasks`, `backfill-fields`, `backfill-commits`).

Skill files at `skills/koni-docs/` in this repo are the canonical source. Consumer projects link to this skill (preferred: symlink each agent's `.<agent>/skills/koni-docs/` → `../../skills/koni-docs`); the `skills-lock.json` `sourceType: "github"` mechanism is for projects that can't or won't host the file locally.
