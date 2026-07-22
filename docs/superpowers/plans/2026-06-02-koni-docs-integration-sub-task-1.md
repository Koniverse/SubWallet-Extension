# Koni-Docs Integration (Sub-task 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install the `koni-docs` skill from `Koniverse/Koni-Skills` into the SubWallet-Extension monorepo on branch `ai-development`, and add the minimal koni-convention files (AGENTS.md, CLAUDE.md, .active-context.example.md, VERSION) so all AI agents have a canonical project guide and the foundation for sub-tasks 2 and 3.

**Architecture:** This is config + docs work, not application code. No new runtime behavior, no tests in the conventional unit-test sense. Verification is procedural: file existence, content shape, lockfile re-install, build still passes. Each task produces one self-contained commit.

**Tech Stack:** `npx skills` (Anthropic skills CLI), `koni-docs` skill spec from `Koniverse/Koni-Skills`, Yarn 3 monorepo, Node 24 (current shell; `.nvmrc` says 12 for build).

**Spec:** `docs/superpowers/specs/2026-06-02-koni-docs-integration-design.md`

**Branch:** `ai-development` (already created from `subwallet-dev`).

---

## File Structure

Files this plan creates or modifies:

| Path | Op | Responsibility |
|---|---|---|
| `skills-lock.json` (root) | Create (auto) | Lockfile for `npx skills experimental_install` |
| `.agents/skills/koni-docs/` (root) | Create (auto) | Installed skill content |
| `VERSION` (root) | Create | Canonical semver — sync with root `package.json` |
| `.active-context.example.md` (root) | Create | Per-developer template (committed) |
| `.gitignore` | Modify | Ignore `.active-context.md` |
| `AGENTS.md` (root) | Create | Canonical AI agent guide |
| `CLAUDE.md` (root) | Create | Thin pointer + Koni-Docs Integration block |

No application code touched. No `packages/*` modified.

---

## Task 1: Run skill installer and commit installer output

**Files:**
- Create (by installer): `skills-lock.json`, `.agents/skills/koni-docs/`

- [ ] **Step 1: Verify clean working tree on branch ai-development**

Run:
```bash
git status
git rev-parse --abbrev-ref HEAD
```

Expected:
```
On branch ai-development
nothing to commit, working tree clean
ai-development
```

If not clean, stash or resolve before proceeding.

- [ ] **Step 2: Check GitHub auth (Koni-Skills may be private)**

Run:
```bash
gh auth status
```

Expected: shows logged-in user with `repo` scope. If not, run `gh auth login` and select `repo` scope.

- [ ] **Step 3: Run the installer**

Run from repo root:
```bash
npx skills add Koniverse/Koni-Skills --skill koni-docs
```

Expected output (illustrative — exact wording may differ):
```
Resolving Koniverse/Koni-Skills...
Installing skill: koni-docs
Wrote .agents/skills/koni-docs/...
Updated skills-lock.json
```

If the command fails:
- "command not found: skills" → upgrade Node or install via `npm i -g @anthropic/skills` (consult `Koni-Skills` README §Installation)
- Auth error → re-run `gh auth login`
- Network error → retry once; if persistent, document in CONTEXT and escalate

- [ ] **Step 4: Verify installer output**

Run:
```bash
ls -la skills-lock.json
ls -la .agents/skills/koni-docs/
du -sh .agents/
```

Expected:
- `skills-lock.json` exists, non-empty
- `.agents/skills/koni-docs/SKILL.md` exists
- `.agents/skills/koni-docs/references/` exists
- Total size of `.agents/` < 10 MB (if >10 MB, see Risk Mitigation at end of plan)

- [ ] **Step 5: Check installer didn't modify unexpected files**

Run:
```bash
git status
```

Expected: only `skills-lock.json` and `.agents/` show as new/modified. If anything in `packages/`, `scripts/`, or workflow files changed, STOP and investigate before committing.

- [ ] **Step 6: Stage and commit installer output**

Run:
```bash
git add skills-lock.json .agents/
git commit -m "chore: install koni-docs skill from Koniverse/Koni-Skills"
```

Expected: commit succeeds. If a pre-commit hook fails, fix the underlying issue (do NOT use `--no-verify`).

---

## Task 2: Create VERSION file

**Files:**
- Create: `VERSION`

- [ ] **Step 1: Confirm root version**

Run:
```bash
node -p "require('./package.json').version"
```

Expected: `1.3.79`

(If it differs, use whatever the command prints — that is the canonical value.)

- [ ] **Step 2: Write VERSION**

Create file `VERSION` at repo root with exactly this content (with trailing newline):

```
1.3.79
```

- [ ] **Step 3: Verify VERSION**

Run:
```bash
cat VERSION
wc -c VERSION
```

Expected:
- `cat VERSION` outputs `1.3.79`
- `wc -c VERSION` shows 7 bytes (`1.3.79` = 6 chars + 1 newline)

Do NOT commit yet — Task 3 groups VERSION with `.gitignore`.

---

## Task 3: Update .gitignore for active-context and commit with VERSION

**Files:**
- Modify: `.gitignore`
- Already-created (uncommitted): `VERSION`

- [ ] **Step 1: Read current .gitignore tail**

Run:
```bash
tail -20 .gitignore
```

Note whether the file ends with a blank line. Append rules below accordingly.

- [ ] **Step 2: Append koni-docs entries to .gitignore**

Append the following block at the end of `.gitignore`:

```

# Koni-docs Active Context (per-developer, Pattern B)
.active-context.md
```

(Leading blank line for visual separation from the existing tail. Do NOT include `.agents/.cache/` yet — only add it if Task 1 produced such a directory.)

- [ ] **Step 3: Check if .agents/.cache/ exists from Task 1**

Run:
```bash
ls -la .agents/ | grep -E "cache|tmp" || echo "no cache dir"
```

If output shows a `.cache` or `.tmp` directory inside `.agents/`, append to `.gitignore`:

```
.agents/.cache/
```

If output is `no cache dir`, skip this step.

- [ ] **Step 4: Verify .gitignore is valid and active-context.md is ignored**

Run:
```bash
touch .active-context.md
git check-ignore .active-context.md
```

Expected: prints `.active-context.md` (meaning it IS ignored).

Then clean up:
```bash
rm .active-context.md
```

- [ ] **Step 5: Stage and commit VERSION + .gitignore together**

Run:
```bash
git add VERSION .gitignore
git status
```

Expected: `git status` shows exactly these two files staged.

Run:
```bash
git commit -m "chore: add VERSION file and gitignore active-context"
```

---

## Task 4: Create .active-context.example.md

**Files:**
- Create: `.active-context.example.md`

- [ ] **Step 1: Fetch koni-docs reference template**

Run from repo root:
```bash
cat .agents/skills/koni-docs/references/templates/integration.md 2>/dev/null | head -100
```

If the file does not exist at that path, look in `.agents/skills/koni-docs/references/` for any `active-context*` or `integration*` template file and use that.

- [ ] **Step 2: Write the example template**

Create `.active-context.example.md` at repo root with this content:

```markdown
# Active Context (Example Template)

> **Per-developer file.** Copy this to `.active-context.md` (gitignored) on
> first checkout and update as you work. This `.example.md` version is the
> committed template — keep it minimal and generic.

## Sprint
<!-- Active sprint id, e.g. sprint-2026-W23 — leave empty until sub-task 2 starts sprints -->
Sprint:

## Active Stories
<!-- One bullet per story you're actively working on (US-X.Y-slug) -->
-

## Last Version Shipped
<!-- Bare semver, no v-prefix (per RULE-16) -->
Last Version: 1.3.79

## Recent Decisions
<!-- Pointer to recent CONTEXT.md entries you authored or rely on -->
-

## Recent Lessons
<!-- Pointer to recent LESSONS.md entries relevant to current work -->
-

## Personal Notes
<!-- Free-form scratch space; not consumed by koni-docs sync -->
```

- [ ] **Step 3: Verify the file**

Run:
```bash
cat .active-context.example.md | head -5
git status .active-context.example.md
```

Expected:
- First 5 lines show the heading and intro.
- `git status` shows `.active-context.example.md` as untracked.

- [ ] **Step 4: Commit**

Run:
```bash
git add .active-context.example.md
git commit -m "docs: add active-context example template (koni Pattern B)"
```

---

## Task 5: Generate monorepo layout data for AGENTS.md

**Files:**
- Read-only: `packages/*/package.json`
- No commit in this task — output is consumed by Task 6.

- [ ] **Step 1: Extract name, description, top dependencies per package**

Run from repo root:
```bash
for f in packages/*/package.json; do
  python3 -c "
import json
d = json.load(open('$f'))
name = d.get('name', '?')
desc = d.get('description', '') or '(no description in package.json)'
deps = list((d.get('dependencies') or {}).keys())[:3]
print(f'| \`{name}\` | {desc} | {\", \".join(deps) if deps else \"—\"} |')
"
done
```

Expected: one markdown table row per package, like:
```
| `@subwallet/extension-base` | Base library for SubWallet extension | @polkadot/api, @subwallet/keyring, dexie |
| `@subwallet/extension-koni` | Background script for SubWallet | ... |
...
```

- [ ] **Step 2: Save the output for Task 6**

Copy the output. You will paste it into AGENTS.md §Monorepo layout in Task 6.

If a package has empty description, leave the description column as `(no description in package.json — confirm in sub-task 2)`. Do not fabricate descriptions.

---

## Task 6: Write AGENTS.md

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Compose the file**

Create `AGENTS.md` at repo root with this content. Replace `<MONOREPO_TABLE_ROWS>` with the table rows from Task 5 Step 1.

```markdown
# AGENTS.md — SubWallet-Extension

> **This file is the single source of truth for all AI agent instructions in this project.**
> Cursor, Gemini, Codex CLI, Copilot CLI, and Claude Code all read it.
> [`CLAUDE.md`](CLAUDE.md) is a thin pointer back to this file plus the
> Koni-Docs Integration block and an Active Context pointer.
> On any conflict between AGENTS.md and CLAUDE.md, AGENTS.md wins.

## 1. Project purpose

SubWallet-Extension is a non-custodial multi-chain wallet delivered as a
browser extension and web app. It supports Substrate (Polkadot / Kusama
ecosystem), EVM (Ethereum, Base, Arbitrum, …), Bitcoin, and TON. The
codebase is a Yarn 3 monorepo of TypeScript packages: background services
(account / balance / chain / earning / NFT / staking / transaction), a
React UI (extension popup + full-page web app), and shared message bus
layer between them.

## 2. Monorepo layout

| Package | Purpose | Top dependencies |
|---|---|---|
<MONOREPO_TABLE_ROWS>

For full details, see each package's `README.md` (where present) and
`package.json`.

## 3. Tech stack

- **Node:** `.nvmrc` → 12 (build target). Local shell may be newer (Node 18+ recommended for dev).
- **Package manager:** Yarn 3 (berry), workspaces. Never use npm install.
- **Language:** TypeScript (strict mode in most packages).
- **UI:** React 18, styled-components, react-router.
- **Blockchain libs:** `@polkadot/api`, `@polkadot/keyring`, `ethers`, `web3`, `@ton/core`, `bitcoinjs-lib`.
- **Storage:** IndexedDB via `dexie`.
- **Build:** Webpack 5 for extension; separate build for web-runner and webapp.
- **Lint / format:** ESLint (config: `.eslintrc.js`), Prettier (`.prettierrc.cjs`).
- **CI:** GitHub Actions (`.github/workflows/`).

## 4. Build / dev commands

| Goal | Command |
|---|---|
| Install dependencies | `yarn install` |
| Build all packages | `yarn build` |
| Build extension only | `yarn webpack:build:extension` |
| Watch extension during dev | `yarn webpack:watch:extension` |
| Start web app dev server | `yarn webpack:dev:webapp` |
| Build webapp | `yarn webpack:build:webapp` |
| Run lint | `yarn lint` |
| Run tests | `yarn test` |

See `package.json` (root) `scripts` for the full list, and `CONTRIBUTING.md`
for the contributor workflow.

## 5. Conventions

- **Branch naming:** `koni/dev/issue-<number>` for feature/bug branches
  tied to GitHub issues; `koni/dev/<short-slug>` for branches without a
  ticket. AI-driven branches use `ai-development` or `ai-<scope>`.
- **Commit prefix (RULE-14):** `feat:` / `fix:` / `chore:` / `docs:` /
  `style:` / `refactor:` / `test:`. Subject in imperative mood, English.
- **Language (RULE-13):** All code, comments, UI strings, error messages,
  commit messages, and docs are English. Localization happens via
  `public/locales/` translation bundles, not inline.
- **PR template:** `.github/PULL_REQUEST_TEMPLATE/resolve-issue.md` — fill
  every section, link the issue, attach screenshots for UI changes.
- **Versioning:** Root `package.json` carries the user-facing semver
  (currently `1.3.79`). `packages/*` carry a per-monorepo internal version
  with `-N` suffix (currently `1.3.79-1`). The canonical user-facing
  version also lives in `VERSION` (repo root, per koni-docs §0).

## 6. Documentation

Current docs at the repo root:

- `README.md` — quickstart + feature overview
- `CONTRIBUTING.md` — contributor workflow
- `CHANGELOG.md` — release history
- `BOUNTIES.md` — open bounties for contributors
- `LICENSE` — Apache-2.0
- `VERSION` — canonical semver (= root `package.json` version)

Canonical `docs/` content per koni-docs spec (BRIEF, PRD, ARCHITECTURE,
CONTEXT, LESSONS, SETUP, sprints/, CHANGELOG) is **pending sub-task 2**.
Until then, koni-docs `RULE-1` / `RULE-2` (VERSION + CHANGELOG in same
commit) enforcement is deferred for this repo.

GitHub issue → story/epic migration is **pending sub-task 3**.

## 7. Koniverse pipeline

This repo follows the Koniverse product development pipeline:

```
BRAINSTORM → BRIEF → PRD → ARCH → EPIC/US → DESIGN → REVIEW → QA → IMPLEMENT → COMMIT/DOCS
   BMAD       BMAD    BMAD   BMAD     BMAD     GSTACK  GSTACK  GSTACK  SUPERPOWERS   KONI-DOCS
```

Koni-docs is the **final standardization stage**: it maps planning
artifacts produced by upstream tools into the canonical `docs/` structure
and enforces the 12 core rules.

## 8. Active context pattern (Pattern B — file-extracted)

Live per-developer state lives in `.active-context.md` (gitignored). The
committed template is `.active-context.example.md`. On first checkout:

```bash
cp .active-context.example.md .active-context.md
```

Update `.active-context.md` as you work — sprint, active stories, recent
decisions, recent lessons. It is consumed by koni-docs status / sync
commands.

## 9. Skill quick reference

| Skill | Triggers on |
|---|---|
| `koni-docs` | Update docs, create story, record decision, log lesson, write changelog entry, document architecture, run pre-commit doc checklist |

Additional skills (e.g. `koni-api`, plugin skills for Supabase / Next.js)
may be added to `skills-lock.json` over time.

## 10. Out of scope for sub-task 1

The following are tracked in separate sub-tasks and **not** part of this
branch (`ai-development`):

- Authoring `docs/BRIEF.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`,
  `docs/CONTEXT.md`, `docs/LESSONS.md`, `docs/SETUP.md`,
  `docs/CHANGELOG.md`, `docs/sprints/` — **sub-task 2**.
- Migrating GitHub issues to stories/epics — **sub-task 3**.
- Reconciling `packages/*` version suffix (`-N`) with root VERSION —
  **sub-task 2**.
```

- [ ] **Step 2: Verify AGENTS.md has no unresolved placeholders**

Run:
```bash
grep -nE "<MONOREPO_TABLE_ROWS>|<TBD>|<TODO>|\?\?\?" AGENTS.md
```

Expected: no output (all placeholders resolved).

If `<MONOREPO_TABLE_ROWS>` still appears, re-run Task 5 and substitute properly.

- [ ] **Step 3: Verify table renders correctly**

Run:
```bash
grep -E "^\| " AGENTS.md | wc -l
```

Expected: ≥ (number of packages) + table headers. (Roughly 15+ for SubWallet's ~12 packages.)

- [ ] **Step 4: Commit**

Run:
```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md (canonical AI agent guide for SubWallet)"
```

---

## Task 7: Write CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Compose the file**

Create `CLAUDE.md` at repo root with this exact content:

```markdown
# CLAUDE.md

> This file is a thin pointer. **AGENTS.md is canonical.**
> On any conflict between AGENTS.md and CLAUDE.md, AGENTS.md wins.

See [AGENTS.md](AGENTS.md) for the full project guide.

## Koni-Docs Integration
koni-docs:
  plugins: []
  docs_path: docs/
  active_sprint: <TBD-after-sub-task-2>
  version_file: VERSION

## Active Context <!-- koni-docs:auto-update -->
- Sprint: (not started — pending sub-task 2)
- Active Stories:
- Last Version: 1.3.79
- Recent Decisions:
- Recent Lessons:
<!-- /koni-docs:auto-update -->

See `.active-context.md` (gitignored, per-developer) for live snapshot;
copy from `.active-context.example.md` on first checkout.
```

Note: `<TBD-after-sub-task-2>` is intentional literal placeholder content for the `active_sprint:` field — it indicates to readers and to the koni-docs CLI that no sprint is active yet. Do NOT replace it.

- [ ] **Step 2: Verify YAML indent of integration block**

Run:
```bash
sed -n '/^## Koni-Docs Integration/,/^## /p' CLAUDE.md | head -10
```

Expected: lines under `koni-docs:` are indented with exactly 2 spaces (not tabs, not 4 spaces).

- [ ] **Step 3: Commit**

Run:
```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md pointer with koni-docs integration block"
```

---

## Task 8: Verification suite

**Files:** Read-only checks across all created files.

- [ ] **Step 1: Re-run skill installer from lockfile (round-trip test)**

Move the installed skill aside temporarily and re-install from lockfile:

```bash
mv .agents .agents.bak
npx skills experimental_install
```

Expected:
- `.agents/skills/koni-docs/` is recreated
- `skills-lock.json` content unchanged (verify with `git diff skills-lock.json` → no output)

Then verify and restore:
```bash
diff -r .agents .agents.bak >/dev/null && echo "MATCH" || echo "MISMATCH"
rm -rf .agents.bak
```

Expected: `MATCH`. If `MISMATCH`, the lockfile is non-deterministic — document in CONTEXT and escalate.

- [ ] **Step 2: Confirm .active-context.md remains ignored**

Run:
```bash
touch .active-context.md
git status --short .active-context.md
```

Expected: empty output (file is ignored, not shown). Then:
```bash
rm .active-context.md
```

- [ ] **Step 3: Grep for placeholder leakage**

Run:
```bash
grep -rEn "<MONOREPO_TABLE_ROWS>|<TODO>|XXX-FIXME|\\bfill in\\b" AGENTS.md CLAUDE.md .active-context.example.md VERSION 2>/dev/null
```

Expected: no output. (Note: `<TBD-after-sub-task-2>` in CLAUDE.md is intentional and is NOT in this grep pattern.)

- [ ] **Step 4: Verify yarn install still works**

Run:
```bash
yarn install --immutable
```

Expected: exits 0. If `--immutable` flag is rejected by this Yarn version, run `yarn install --frozen-lockfile`.

- [ ] **Step 5: Build one small package end-to-end**

Run:
```bash
yarn workspace @subwallet/extension-base run build 2>&1 | tail -20
```

Expected: build completes successfully. If the workspace command differs, run from the package dir directly:
```bash
cd packages/extension-base && yarn build && cd ../..
```

If the build fails with errors unrelated to our changes (pre-existing build break), document in PR body and proceed.

- [ ] **Step 6: Verify CLAUDE.md YAML block parses**

Run:
```bash
python3 -c "
import re, yaml
content = open('CLAUDE.md').read()
m = re.search(r'## Koni-Docs Integration\n(.+?)\n## ', content, re.DOTALL)
assert m, 'integration block not found'
block = m.group(1)
parsed = yaml.safe_load(block)
assert 'koni-docs' in parsed, f'koni-docs key missing: {parsed}'
print('OK:', parsed)
"
```

Expected: prints `OK: {'koni-docs': {'plugins': [], 'docs_path': 'docs/', 'active_sprint': '<TBD-after-sub-task-2>', 'version_file': 'VERSION'}}`.

If `pyyaml` is not installed: `python3 -m pip install --user pyyaml` then re-run.

- [ ] **Step 7: Print git log summary**

Run:
```bash
git log --oneline subwallet-dev..HEAD
```

Expected output (in reverse chronological order — your task commits):
```
<hash> docs: add CLAUDE.md pointer with koni-docs integration block
<hash> docs: add AGENTS.md (canonical AI agent guide for SubWallet)
<hash> docs: add active-context example template (koni Pattern B)
<hash> chore: add VERSION file and gitignore active-context
<hash> chore: install koni-docs skill from Koniverse/Koni-Skills
<hash> docs: add koni-docs integration design spec (sub-task 1)
```

(6 commits total, including the spec commit from brainstorming.)

If any commit is missing or out of order, do NOT rewrite history — proceed to Task 9 and flag in PR body.

---

## Task 9: Push branch and open PR

**Files:** None — git/GitHub only.

- [ ] **Step 1: Push branch**

Run:
```bash
git push -u origin ai-development
```

Expected: branch pushed, upstream set. If push is rejected (already exists with different history), STOP and consult user before forcing.

- [ ] **Step 2: Compose PR body**

Use this template — fill in the actual file sizes and commit hashes:

```markdown
## Summary
- Install `koni-docs` skill from `Koniverse/Koni-Skills` into the monorepo.
- Add `AGENTS.md` (canonical AI agent guide) and `CLAUDE.md` (thin pointer + integration block).
- Add `VERSION` file (`1.3.79`, synced with root `package.json`).
- Add `.active-context.example.md` (Pattern B template); ignore `.active-context.md` per-developer.

This is **sub-task 1 of 3** on the `ai-development` umbrella. Out of scope (separate PRs):
- Sub-task 2: standardize `docs/` content (BRIEF / PRD / ARCH / CONTEXT / LESSONS / SETUP / sprints / CHANGELOG)
- Sub-task 3: migrate GitHub issues to stories/epics

## Spec
- Design: `docs/superpowers/specs/2026-06-02-koni-docs-integration-design.md`
- Plan: `docs/superpowers/plans/2026-06-02-koni-docs-integration-sub-task-1.md`

## Test plan
- [x] `npx skills experimental_install` reproduces `.agents/skills/koni-docs/` from `skills-lock.json` (round-trip MATCH)
- [x] `.active-context.md` is gitignored (touch + `git check-ignore` confirms)
- [x] No placeholder leakage in AGENTS.md / VERSION / .active-context.example.md
- [x] `yarn install --immutable` succeeds
- [x] `yarn workspace @subwallet/extension-base run build` succeeds
- [x] CLAUDE.md integration block parses as valid YAML

## Known deferred items
- `koni-docs` RULE-1 / RULE-2 (VERSION + CHANGELOG same commit) enforcement is **deferred** until sub-task 2 creates `docs/CHANGELOG.md`.
- `packages/*` use version `1.3.79-1` (with `-1` suffix); VERSION uses `1.3.79` (root). Reconciliation deferred to sub-task 2.
- `active_sprint:` in CLAUDE.md is `<TBD-after-sub-task-2>` — no active sprint until sub-task 2 starts one.
```

- [ ] **Step 3: Create the PR**

Run:
```bash
gh pr create \
  --base subwallet-dev \
  --title "chore: integrate koni-docs skill + AGENTS/CLAUDE.md (sub-task 1)" \
  --body "$(cat <<'EOF'
[PASTE THE BODY FROM STEP 2 HERE]
EOF
)"
```

Expected: PR URL printed.

- [ ] **Step 4: Return PR URL to user**

Print the PR URL so the user can review.

---

## Risk mitigation (cross-cutting)

| Risk | Trigger | Action |
|---|---|---|
| `npx skills add` requires GitHub auth | Task 1 Step 3 fails with 401/403 | Run `gh auth login`, ensure `repo` scope, retry |
| Installer pulls > 10 MB into `.agents/` | Task 1 Step 4 `du -sh` > 10M | Append `.agents/` to `.gitignore`, only commit `skills-lock.json`. Document in CONTEXT and update Task 1 Step 6 to skip `.agents/` from the commit. Re-test Task 8 Step 1 round-trip |
| AGENTS.md / CLAUDE.md conflicts existing AI instructions | Should not happen (SubWallet has neither) | If unexpectedly present, STOP and consult user |
| Pre-commit hook fails | Any `git commit` step | Fix the underlying issue (lint, format) — do NOT use `--no-verify` |
| `yarn build` breaks on `extension-base` | Task 8 Step 5 | Try a different smaller package (`extension-chains`, `extension-mocks`). If pre-existing failure unrelated to our changes, document in PR body |
| Push rejected (branch exists) | Task 9 Step 1 | Do NOT force-push. Consult user — may need to rename branch |

---

## Self-review notes

- **Spec coverage:** All 8 sections of the spec are addressed across Tasks 1-9 (skill install: T1; VERSION: T2; .active-context: T4; AGENTS.md sections 1-10: T5+T6; CLAUDE.md: T7; .gitignore: T3; verification: T8; PR: T9).
- **Placeholders:** Plan contains no `TBD/TODO/fill in/similar to Task N` — every step shows the exact content or command. The `<TBD-after-sub-task-2>` string in CLAUDE.md is itself literal content, flagged twice as intentional.
- **Type consistency:** Filenames consistent across tasks (AGENTS.md, CLAUDE.md, VERSION, .active-context.example.md, .gitignore). Commit message prefixes match RULE-14 throughout.
