# BMad → Koni-Docs Template Standardization

> **Purpose**: Maps every stage of the BMad product development pipeline to the koni-docs `docs/` structure. Use this to update koni-docs templates to match BMad output standards.
>
> **Based on**: `examples/bmad-raw-sample/` — a complete PlantCare Pro example executed through the full BMad pipeline.
>
> **Date**: 2026-05-07

---

## 1. BMad Pipeline → Koni-Docs Mapping

```
BMAD STAGE          BMAD OUTPUT PATH                          KONI-DOCS TARGET              PRIORITY
──────────────────────────────────────────────────────────────────────────────────────────────────
Brainstorm          _bmad-output/brainstorming/               (NOT in docs/ — ephemeral)    🟡 Optional
                    brainstorming-session-{date}.md

Product Brief       _bmad-output/planning-artifacts/          (NOT in docs/ — reference     🟡 Optional
                    brief.md                                   only; extracts into PRD §1)

PRD                 _bmad-output/planning-artifacts/          docs/PRD.md                   🔴 Required
                    prd.md

Architecture        _bmad-output/planning-artifacts/          docs/ARCHITECTURE.md          🔴 Required
                    architecture.md

Epics & Stories     _bmad-output/planning-artifacts/          docs/sprints/epics/           🔴 Required
                    epics.md                                  EPIC-N.md (one per epic)
                                                              + docs/PRD.md §7 index

Individual Story    _bmad-output/implementation-artifacts/    docs/sprints/stories/         🔴 Required
                    stories/{N}-{M}-{slug}.md                 US-X.Y-{slug}.md

Sprint Status       _bmad-output/implementation-artifacts/    docs/sprints/STATUS.md        🔴 Required
                    sprint-status.yaml                        (auto-generated YAML → MD)

CHANGELOG           (embedded in story files)                 docs/CHANGELOG.md             🔴 Required

Decision Log        (not present in BMad raw — added by       docs/CONTEXT.md               🔴 Required
                    koni-docs as decisions are made)

Lessons Learned     (not present in BMad raw — added by       docs/LESSONS.md               🔴 Required
                    koni-docs as patterns emerge)
```

## 2. BMad Template Structure (Extracted from Raw Sample)

### 2a. PRD Structure (BMad Standard)

```
PRD.md
├── Frontmatter (YAML)
│   ├── stepsCompleted: []
│   ├── inputDocuments: []
│   └── workflowType: 'prd'
├── §1 Product Overview (2-3 paragraphs)
├── §2 User Personas (table)
├── §3 User Journey — Happy Path (numbered steps)
├── §4 Functional Requirements (table: ID | Req | Priority | Status | Epic)
├── §5 Non-Functional Requirements (table: ID | Req | Priority | Category)
├── §6 Technical Constraints (bullet list)
└── §7 Epics & Stories Index (per-epic story summary table)
```

### 2b. Architecture Structure (BMad Standard)

```
ARCHITECTURE.md
├── Frontmatter (YAML)
│   ├── stepsCompleted: []
│   └── inputDocuments: []
├── §1 Architecture Overview (diagram + description)
├── §2 Tech Stack (table: Layer | Technology | Version | Rationale)
├── §3 Core Data Models (per-entity: table with Column | Type | Notes)
├── §4 API Endpoints (table: Endpoint | Method | Auth | Purpose)
├── §5 Key Flows (sequence diagrams for critical paths)
├── §6 Architecture Decisions (table: Decision | Topic | Summary)
└── §7 Deployment Architecture (CI/CD pipeline diagram)
```

### 2c. Epics & Stories Structure (BMad Standard)

```
EPICS.md
├── Frontmatter (YAML)
│   ├── stepsCompleted: []
│   └── inputDocuments: [prd.md, architecture.md]
├── Overview (1 paragraph)
├── §1 Requirements Inventory
│   ├── Functional Requirements (FR1, FR2, ...)
│   ├── Non-Functional Requirements (NFR1, NFR2, ...)
│   ├── Additional Requirements (from Architecture)
│   └── UX Design Requirements (if UX doc exists)
├── §2 FR Coverage Map (FR1: Epic N - Description)
├── §3 Epic List (summary: name, goal, FRs covered)
└── §4 Epic Details (repeat per epic)
    └── Epic N: {Title}
        ├── Epic goal statement
        └── Story N.M: {Title}
            ├── As a / I want / So that
            └── Acceptance Criteria (Given/When/Then)
```

### 2d. Individual Story File Structure (BMad Standard)

```
STORY {N}.{M}.md
├── Title: Story {N}.{M}: {title}
├── Status: ready-for-dev
├── Story (As a / I want / so that)
├── Acceptance Criteria (numbered list)
├── Tasks / Subtasks
│   ├── Task X (AC: #)
│   └── Subtask X.Y
├── Dev Notes
│   ├── Architecture patterns & constraints
│   ├── Project Structure Notes
│   └── References (links to PRD, Architecture, NFRs)
└── Dev Agent Record
    ├── Agent Model Used
    ├── Debug Log References
    ├── Completion Notes List
    └── File List
```

### 2e. Sprint Status Structure (BMad Standard)

```yaml
SPRINT-STATUS.YAML
├── Metadata (generated, project, project_key, tracking_system, story_location)
├── Status Definitions
│   ├── Epic: backlog | in-progress | done
│   ├── Story: backlog | ready-for-dev | in-progress | review | done
│   └── Retrospective: optional | done
└── development_status:
    ├── epic-N: {status}
    ├── N-M-{story-slug}: {status}
    └── epic-N-retrospective: optional
```

## 3. Key Differences: BMad vs Current Koni-Docs Templates

### 3a. Story Frontmatter

| Field | BMad | Current Koni-Docs | Action |
|-------|------|-------------------|--------|
| `id` | Implicit from filename (N.M) | Explicit `US-X.Y` | **Keep koni-docs format** (more machine-parseable) |
| `status` | `ready-for-dev` / `in-progress` / `review` / `done` | `backlog` / `ready` / `in-progress` / `review` / `done` / `blocked` | **Add `backlog` and `blocked`** to BMad status list |
| `priority` | Not in story file frontmatter | `P0`-`P3` | **Keep in koni-docs** (useful for sprint planning) |
| `points` | Not in story file frontmatter | Fibonacci 1/2/3/5/8/13 | **Keep in koni-docs** (useful for sprint capacity) |
| `sprint` | Tracked in sprint-status.yaml | In story frontmatter | **Keep koni-docs** (explicit link is better than implicit) |
| `version_shipped` | Not in BMad story | In koni-docs frontmatter | **Keep koni-docs** (needed for CHANGELOG) |
| `prd_ref` | Not in BMad (implicit via epic) | In koni-docs frontmatter | **Keep koni-docs** (explicit FR traceability) |
| `commit` | Not in BMad story | In koni-docs frontmatter | **Keep koni-docs** (needed by RULE-2) |
| `created` / `updated` | Not in BMad story | In koni-docs frontmatter | **Keep koni-docs** (useful for auditing) |

### 3b. Story Body

| Section | BMad | Current Koni-Docs | Action |
|---------|------|-------------------|--------|
| Goal | Not explicit (covered by "As a/I want/So that") | Separate §Goal | **Merge**: Make "So that" the goal statement |
| Background | Not in BMad story | §Background (2-3 paragraphs) | **Keep koni-docs** (valuable context for dev) |
| AC Format | Numbered list (from epics) | Checklist `- [ ] AC-N:` | **Adopt BMad Given/When/Then** format within AC |
| Tasks | Grouped with subtasks, AC cross-ref | Flat checklist with file paths | **Adopt BMad grouping** (Task → Subtask hierarchy) |
| Dev Notes | Architecture + structure + references | Implementation notes § | **Adopt BMad format** (structured, source-linked) |
| Changelog entry | Separate story section | Embed in story | **Keep koni-docs** (embedded changelog is RULE-1 requirement) |
| Files modified | In Dev Agent Record → File List | Separate §Files modified | **Keep koni-docs** (more explicit) |
| Cross-references | In Dev Notes → References | Separate §Cross-references | **Keep koni-docs** (more prominent) |

### 3c. Epic File

| Aspect | BMad | Current Koni-Docs | Action |
|--------|------|-------------------|--------|
| Location | All epics in one `epics.md` | One file per epic: `EPIC-N.md` | **Keep koni-docs** (one-per-file scales better) |
| Content | Stories inline with full AC | Summary table + link to story files | **Keep koni-docs** (stories in own files per koni rule) |
| FR Coverage | In epics.md overview | In frontmatter `prd_ref` + §FR coverage | **Add FR coverage section** to koni-docs epic template |

### 3d. Sprint File

| Aspect | BMad | Current Koni-Docs | Action |
|--------|------|-------------------|--------|
| Format | YAML (`sprint-status.yaml`) | Markdown (`sprint-YYYY-WNN.md`) | **Keep koni-docs** (YAML auto-gen, MD sprint file complementary) |
| Scope table | Not in YAML (implicit from status) | Explicit scope table in MD | **Keep koni-docs sprint MD** for human-readable scope |
| Retrospective | Per-epic retrospective flag | In sprint file on close | **Adopt BMad retro pattern** — per-epic retro optional flag |
| Sprint goal | Not in YAML | In sprint MD frontmatter + recap | **Keep koni-docs** |

## 4. Template Update Recommendations

### 4a. PRD Template — Add §7 Epics & Stories Index

Current koni-docs PRD template has §4 (FR table with EPIC-N column) but lacks a §7 index. Add:

```markdown
## §7. Epics & Stories Index

### EPIC-1 — {Epic Title}
| Story | Title | Status | Version |
|-------|-------|--------|---------|
| US-1.1 | {title} | {status} | — |
```

### 4b. Story Template — Enhancements

1. **Add BMad-style AC format option**: Support Given/When/Then alongside declarative ACs
2. **Add Tasks grouping**: Allow `TASK-X.Y.Z` with subtask indentation and AC cross-reference
3. **Add structured Dev Notes**: Include `Project Structure Notes` and `References` sub-sections
4. **Keep koni-docs frontmatter**: The koni-docs frontmatter is richer — keep all fields
5. **Keep koni-docs Changelog entry section**: This is critical for RULE-1 (same-commit docs)

### 4c. Epic Template — Add FR Coverage

Add to current koni-docs epic template:

```markdown
## FR Coverage
| FR | Story | Status |
|----|-------|--------|
| FR-N | US-X.Y | {status} |
```

### 4d. Architecture Template — Add Architecture Decisions Table

Current koni-docs ARCHITECTURE template links to CONTEXT.md for decisions. Add a summary table:

```markdown
## Architecture decisions
| Decision | Topic | Date | Version | CONTEXT Ref |
|----------|-------|------|---------|-------------|
| AD-1 | {topic} | YYYY-MM-DD | vX.Y.Z | D{N} |
```

## 5. BMad Naming Convention → Koni-Docs Mapping

| BMad Convention | Koni-Docs Convention | Mapping Rule |
|----------------|---------------------|--------------|
| `Epic N` | `EPIC-N` | Same numbering, UPPERCASE in koni-docs |
| `Story N.M` | `US-X.Y` | N.M → X.Y (same numbering; X=epic, Y=story) |
| `{N}-{M}-{slug}` | `US-{X}.{Y}-{slug}` | Prefix with `US-` |
| `epic-N: {status}` | `EPIC-N.md` frontmatter `status:` | YAML → Markdown frontmatter |
| `development_status:` | `STATUS.md` (auto-generated) | YAML → kanban table |
| `sprint-status.yaml` | `sprint-YYYY-WNN.md` + `STATUS.md` | Complementary: YAML machine, MD human |

## 6. Complete BMad → Koni-Docs Workflow

```
INPUT                                PROCESS                      OUTPUT
───────────────────────────────────────────────────────────────────────────────
BMad brainstorm session              → koni-docs extract          → (discard or archive)
BMad brief.md                        → koni-docs extract §1,§2   → docs/PRD.md §1
BMad prd.md                          → koni-docs standardize      → docs/PRD.md (full)
BMad architecture.md                 → koni-docs standardize      → docs/ARCHITECTURE.md
BMad epics.md (all epics+stories)    → koni-docs split+standardize → docs/sprints/epics/EPIC-N.md
                                                                  → docs/PRD.md §7 index
                                                                  → docs/sprints/stories/US-X.Y-slug.md
BMad story files (per-story)         → koni-docs add frontmatter  → docs/sprints/stories/US-X.Y-slug.md
BMad sprint-status.yaml              → koni-docs auto-generate     → docs/sprints/STATUS.md
                                     → koni-docs manual            → docs/sprints/sprint-YYYY-WNN.md
```

## 7. NOTES

- BMad's `planning_artifacts` path = `_bmad-output/planning-artifacts/`
- BMad's `implementation_artifacts` path = `_bmad-output/implementation-artifacts/`
- Koni-docs canonical path = `docs/`
- The `references/migration-from-bmad.md` file already covers the migration procedure — this analysis provides the **template-level structural mapping** to complement that file.
