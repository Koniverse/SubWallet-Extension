# CLAUDE.md + AGENTS.md + .active-context — Koni-Docs Integration Blocks

> **File locations** (project repo root):
> - `CLAUDE.md` — Claude Code agent instructions
> - `AGENTS.md` — agent-agnostic project guide (Codex / Cursor / Gemini)
> - `.active-context.md` (gitignored) — per-developer running snapshot
> - `.active-context.example.md` (committed) — template that contributors copy
>
> **Use when**: Setting up koni-docs in a new project, or refreshing the
> Active Context block after a sprint roll / story close.
>
> **Why both CLAUDE.md and AGENTS.md**: `CLAUDE.md` is consumed by Claude
> Code at session start; `AGENTS.md` is consumed by other tools. Many
> projects symlink one to the other so the same content drives both. The
> Koni-Docs blocks below differ slightly because the audiences differ.

---

## 0. Pick a pattern — inline vs. file-extracted

There are **two valid integration patterns** for the Active Context block.
Pick one per project; do not mix.

| Pattern | When to use | Active Context lives in |
|---|---|---|
| **A — Inline (legacy)** | Solo developer, one active branch, low merge volume | `CLAUDE.md` between `koni-docs:auto-update` markers |
| **B — File-extracted (recommended for teams)** | 2+ developers, parallel branches, frequent sprint churn | `.active-context.md` (gitignored) — `CLAUDE.md` keeps only a pointer |

**Why a separate file for teams:** the Active Context block changes on
every story start, close, sprint roll, decision, and lesson — many
times per week. When two developers update it in parallel on different
branches, the merge is always a conflict, always trivial, and always
annoying. The file-extracted pattern moves the volatile content into a
gitignored snapshot; the durable record stays in `docs/sprints/`,
`CHANGELOG.md`, `CONTEXT.md`, `LESSONS.md`. Conflicts go to zero.

> **Reference implementation**: Koni-Finance-Final adopted the
> file-extracted pattern in 2026-05; Koni-Skills adopted it in v0.2.0
> (sprint-2026-W22). Both treat `.active-context.md` as the single
> mutable session-start snapshot.

---

## 1. Pattern A — Inline CLAUDE.md Integration Block

### CLAUDE.md

```markdown
## Koni-Docs Integration

koni-docs:
  plugins: []                        # e.g. [supabase, nextjs]
  docs_path: docs/                   # where docs live
  active_sprint: sprint-YYYY-WNN     # current sprint ID
  version_file: VERSION              # path to semver file

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-YYYY-WNN
- Active Stories: 🟡 US-X.Y <title>
- Last Version: vX.Y.Z
- Recent Decisions: D<N>
- Recent Lessons: §N
<!-- /koni-docs:auto-update -->
```

The agent updates the block between the `<!-- koni-docs:auto-update -->`
and `<!-- /koni-docs:auto-update -->` markers using `Edit`.

---

## 2. Pattern B — File-extracted active-context (recommended for teams)

### Step 1 — `CLAUDE.md` keeps the config block + a pointer

```markdown
## Koni-Docs Integration

koni-docs:
  plugins: []
  docs_path: docs/
  active_sprint: sprint-YYYY-WNN
  version_file: VERSION

## Active Context

> **Moved to `.active-context.md`** — see [`.active-context.example.md`](./.active-context.example.md)
> for the template and the gitignored-on-purpose rationale. The auto-update block
> (sprint / active stories / decisions / lessons) and the per-developer block
> (GitHub login, git name/email, current branch, workspace path) both live there.
>
> When you start working in this repo, copy the example to `.active-context.md`
> and fill in your local-developer details. Koni-docs T1-T7 triggers update the
> sprint block inside `.active-context.md`, not here.
```

### Step 2 — Commit `.active-context.example.md` as the team template

```markdown
# Active Context — example / template

> Copy this file to `.active-context.md` and fill in your own values.
> `.active-context.md` is **gitignored** — it captures *your local* development context
> (current user, current branch, in-flight work) and should not be committed.
>
> Source-of-truth doc artifacts (sprints, decisions, lessons) still live under `docs/`;
> this file is just the per-developer running snapshot the agent reads at the start of
> each session.

## Local developer

- **GitHub login**: <your-github-username>           <!-- `gh api user --jq .login` -->
- **Git name**: <Your Name>                          <!-- `git config user.name` -->
- **Git email**: <you@example.com>                   <!-- `git config user.email` -->
- **Workspace**: <absolute path to this repo on your machine>
- **Current branch**: <your-current-branch>          <!-- `git rev-parse --abbrev-ref HEAD` -->
- **Last updated**: YYYY-MM-DD

## Project sprint context <!-- koni-docs:auto-update -->

- **Sprint**: sprint-YYYY-WNN
- **Active Stories**: 🟡 US-X.Y <title>
- **Recently Shipped (main)**: ✅ US-A.B <title> (vX.Y.Z) — <one-line summary>
- **Last Version**: vX.Y.Z
- **Recent Decisions**: D<N> = <one-line summary>
- **Recent Lessons**: §N = <one-line summary>

<!-- /koni-docs:auto-update -->

## How this file is maintained

- The **Local developer** block is set once when you copy the example, refreshed only
  when your branch / git identity changes. Agents should not edit it unless asked.
- The **Project sprint context** block (between the `koni-docs:auto-update` markers) is
  updated by the agent on koni-docs T1-T7 triggers (story start/close, sprint start,
  CONTEXT decision, LESSONS entry, env-var change, pre-commit) — same as the old
  `CLAUDE.md` block, just relocated to this file.

## Why this file is gitignored

The sprint context block does contain repo-shared facts (active stories, last version,
recent decisions) — those are also captured durably in `docs/sprints/`, `CHANGELOG.md`,
`CONTEXT.md`, and `LESSONS.md`. The agent uses this file as a fast-access summary at
session start; the *authoritative* state lives under `docs/`. Keeping the snapshot
local avoids merge churn when multiple developers update active stories in parallel.
```

### Step 3 — Add `.active-context.md` to `.gitignore`

```
# Per-developer running snapshot of sprint + local identity context.
# `.active-context.example.md` is the committed template; copy it to
# `.active-context.md` and fill in your local values. Gitignoring the
# local copy avoids merge churn when multiple developers update active
# stories in parallel.
.active-context.md
```

### Step 4 — Each developer copies the example on first checkout

```bash
cp .active-context.example.md .active-context.md
# Edit `.active-context.md` and fill in the Local developer block:
#   gh api user --jq .login       → GitHub login
#   git config user.name           → Git name
#   git config user.email          → Git email
#   pwd                            → Workspace
#   git rev-parse --abbrev-ref HEAD → Current branch
```

After this, koni-docs T1–T7 triggers update the sprint block inside
`.active-context.md` — not in `CLAUDE.md`. `CLAUDE.md` becomes a stable,
team-shared file with minimal write churn.

---

## 3. AGENTS.md ⇄ CLAUDE.md — project file architecture

### 3.1 Convention: AGENTS.md is canonical, CLAUDE.md is pointer (recommended)

Koniverse projects use **`AGENTS.md` as the single source of truth for
all AI instructions** — project structure, conventions, skill catalog,
workflow guides, commit discipline, behavioral rules. **`CLAUDE.md` is
a thin pointer** that defers to AGENTS.md for everything except the
small surface area that is Claude-Code-specific OR session-volatile
(see exception list below).

The same idea: **agent-agnostic content goes in AGENTS.md** (Codex,
Cursor, Gemini, Copilot, Claude Code all read it); **Claude-Code-only
or session-bound content stays in CLAUDE.md**. Don't duplicate. When
duplicated content drifts, AGENTS.md wins by convention.

#### What stays in `CLAUDE.md`

1. **One-line pointer** at the top stating AGENTS.md is canonical.
2. **`## Koni-Docs Integration` config block** — `plugins`, `docs_path`,
   `active_sprint`, `version_file`. Agents read these at session start
   to know where docs live, before they've opened any file.
3. **`## Active Context`** — either inline (Pattern A from §1) or a
   pointer to `.active-context.md` (Pattern B from §2). This is
   session-volatile by design and changes many times per week.
4. **Claude-Code-specific routing/behavioral blocks** if your project
   uses them (e.g. agentcohort, custom slash-command routing).
   Anything that ONLY applies to Claude Code, not to other agents.

Everything else — project purpose, structure, conventions, skill
catalog, quick-reference table, docs/ links — lives in `AGENTS.md`.

#### What goes in `AGENTS.md`

1. **Canonical preamble** at the top reminding readers AGENTS.md is
   the single source of truth.
2. **Project purpose / structure / conventions** — the durable content.
3. **`## Koni-Docs` section** — short reference block pointing at
   `docs/README.md` and the koni-docs skill (template in §3.2 below).
4. **Documentation links** — direct pointers to BRIEF, PRD,
   ARCHITECTURE, CONTEXT, LESSONS, SETUP, sprints/STATUS, VERSION,
   CHANGELOG. Live in AGENTS.md, NOT CLAUDE.md.
5. **Skill catalog tables** (Current skills + Installed helper skills).
6. **Quick reference / common tasks**.

#### Why this hierarchy

- **Multi-agent reach.** Cursor, Gemini, Codex CLI, Copilot CLI all read
  `AGENTS.md` natively. Claude Code reads BOTH `AGENTS.md` and
  `CLAUDE.md`. Putting durable content in AGENTS.md means every agent
  gets it; putting it in CLAUDE.md means only Claude Code does.
- **Single source of truth.** When the project structure changes, you
  update AGENTS.md and CLAUDE.md still works (because it points at
  AGENTS.md). Drift between two copies of the same content is the
  recurring papercut this convention prevents.
- **Smaller CLAUDE.md = less merge churn.** With Active Context already
  moved to `.active-context.md` (Pattern B from §2), CLAUDE.md becomes
  near-static. Fewer parallel-branch edits = fewer conflicts.

#### Filled example — `CLAUDE.md` thin pointer

```markdown
# CLAUDE.md — <Project Name>

This project uses **[AGENTS.md](AGENTS.md)** as the single source of truth
for all AI instructions — project structure, conventions, skill catalog,
documentation map, and behavioral guidelines.

## Koni-Docs Integration

koni-docs:
  plugins: []
  docs_path: docs/
  active_sprint: sprint-YYYY-WNN
  version_file: VERSION

## Active Context

> **Moved to `.active-context.md`** — see [`.active-context.example.md`](./.active-context.example.md).
```

That's the whole file. Optionally add Claude-Code-only routing blocks
below if the project uses agentcohort, custom slash commands, etc.

#### Filled example — `AGENTS.md` preamble

```markdown
# AGENTS.md — <Project Name>

> **This file is the single source of truth for all AI agent instructions
> in this project.** Cursor, Gemini, Codex CLI, Copilot CLI, and Claude
> Code all read it. `CLAUDE.md` is a thin pointer back to this file plus
> a Claude-Code-specific Koni-Docs Integration block; on any conflict,
> AGENTS.md wins.

## Project purpose
...

## Documentation
- [BRIEF.md](docs/BRIEF.md) · [PRD.md](docs/PRD.md) · [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [CONTEXT.md](docs/CONTEXT.md) · [LESSONS.md](docs/LESSONS.md) · [SETUP.md](docs/SETUP.md)
- [sprints/](docs/sprints/) (with [STATUS.md](docs/sprints/STATUS.md) auto-generated kanban)
- [VERSION](VERSION) + [CHANGELOG.md](CHANGELOG.md) — semver + release history

## Koni-Docs
This project uses koni-docs for documentation management ... (see §3.2 below for full block).
```

---

### 3.2 AGENTS.md — Koni-Docs Reference Block

For agent-agnostic project guides, a minimal pointer is enough. Keep it
short — agents read AGENTS.md for orientation, not for full reference.

```markdown
## Koni-Docs

This project uses koni-docs for documentation management. All docs follow the
structure defined in `docs/README.md`. See the koni-docs skill for templates,
rules, and workflows.
```

The AGENTS.md block is the same for both Active Context patterns A and
B — agents that read AGENTS.md discover the project's koni-docs adoption
via the pointer; they then read `.active-context.md` (Pattern B) or the
inline CLAUDE.md block (Pattern A) for the live snapshot.

---

## 4. Trigger points (when to update Active Context)

Same triggers for both patterns. Only the *file* the agent writes to differs.

| #  | Trigger                | Action                                               |
| -- | ---------------------- | ---------------------------------------------------- |
| T1 | Start a story          | Add `🟡 US-X.Y <title>` to Active Stories            |
| T2 | Close a story          | Change `🟡 → ✅`, update Last Version                |
| T3 | Start a sprint         | Update Sprint ID                                     |
| T4 | Add a LESSONS entry    | Append LESSONS.md + add §N to Recent Lessons         |
| T5 | Log a CONTEXT decision | Append CONTEXT.md + add D`<N>` to Recent Decisions   |
| T6 | Add an env var         | Update SETUP + DEPLOY + .env.example (RULE-11)       |
| T7 | Pre-commit             | Run full checklist, verify all doc layers consistent |

**How to update**:
- **Pattern A**: target the block in `CLAUDE.md` between the
  `<!-- koni-docs:auto-update -->` markers with `Edit`.
- **Pattern B**: target the same marker block inside `.active-context.md`.
  The markers keep updates precise without touching surrounding content.

---

## 5. Filled example — `.active-context.md` (Pattern B, recommended)

```markdown
# Active Context — local

## Local developer

- **GitHub login**: saltict
- **Git name**: AnhMTV
- **Git email**: maithachvietanh@gmail.com
- **Workspace**: /Volumes/MacData/Workspace/AI/Koni-Skills
- **Current branch**: feat/us-2-2-wire-integration
- **Last updated**: 2026-05-27

## Project sprint context <!-- koni-docs:auto-update -->

- **Sprint**: sprint-2026-W22
- **Active Stories**: 🟡 US-1.2 Active-context split · 🟡 US-2.1 Bootstrap docs · 🟡 US-2.2 Wire integration · 🟡 US-2.3 VERSION+CHANGELOG seed
- **Recently Shipped (main)**: ✅ US-1.1 Koni-docs initial release (v0.1.0)
- **Last Version**: v0.1.0
- **Recent Decisions**: D7 (active-context split), D6 (dogfood koni-docs), D4 (template split)
- **Recent Lessons**: §4 (`version_shipped` bare semver), §3 (fresh clone needs experimental_install), §1 (sync-script word boundaries)

<!-- /koni-docs:auto-update -->
```

---

## 6. Filled example — `CLAUDE.md` Active Context (Pattern A, legacy)

```markdown
## Koni-Docs Integration

koni-docs:
  plugins: [supabase, nextjs]
  docs_path: docs/
  active_sprint: sprint-2026-W19
  version_file: VERSION

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-2026-W19
- Active Stories: ✅ US-3.7 Per-pod project view · ✅ US-3.8 Pod doc tabs · 🟡 US-1.8 Invitation email
- Last Version: v0.76.0
- Recent Decisions: D60 (per-pod read-only project view), D59 (BMAD-agile activation)
- Recent Lessons: §29 (unstable_cache + workspace-scoped key), §28 (key= unmounts nested layouts)
<!-- /koni-docs:auto-update -->
```
