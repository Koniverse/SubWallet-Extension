# AGENTS.md — SubWallet-Extension

> **This file is the single source of truth for all AI agent instructions in this project.**
> Cursor, Gemini, Codex CLI, Copilot CLI, and Claude Code all read it.
> [CLAUDE.md](./CLAUDE.md) is a thin pointer back to this file plus the
> Koni-Docs Integration block and an Active Context pointer.
> On any conflict between AGENTS.md and CLAUDE.md, AGENTS.md wins.

## 1. AI coding behavior guidelines

### 1.1 Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 1.2 Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 1.3 Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 1.4 Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```text
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 2. Project purpose

SubWallet-Extension is a non-custodial multi-chain wallet delivered as a
browser extension and web app. It supports Substrate (Polkadot / Kusama
ecosystem), EVM (Ethereum, Base, Arbitrum, …), Bitcoin, TON, and Cardano. The
codebase is a Yarn 3 monorepo of TypeScript packages: background services
(account / balance / chain / earning / NFT / staking / transaction), a
React UI (extension popup + full-page web app), and shared message bus
layer between them.

## 3. Monorepo layout

| Package | Purpose | Top dependencies |
| --- | --- | --- |
| `@subwallet/extension-base` | Functions, classes and other utilities used in @subwallet/extension | @acala-network/api, @apollo/client, @azns/resolver-core |
| `@subwallet/extension-chains` | Definitions for all known chains as exposed by the extension. | @babel/runtime, @polkadot/networks, @polkadot/util |
| `@subwallet/extension-compat-metamask` | Metamask compatibility layer | @babel/runtime, @metamask/detect-provider, @polkadot/types |
| `@subwallet/extension-dapp` | Provides an interfaces around the injected globals for ease of access by dapp developers. | @babel/runtime, @polkadot/util, @polkadot/util-crypto |
| `@subwallet/extension-inject` | A generic injector (usable to any extension), that populates the base exposed interfaces to be used by dapps. | @babel/runtime, @polkadot/rpc-provider, @polkadot/types |
| `@subwallet/extension-koni-ui` | A sample signer extension for the @polkadot/api | @babel/runtime, @coinbase/cbpay-js, @fortawesome/fontawesome-svg-core |
| `@subwallet/extension-koni` | A sample signer extension for the @polkadot/api | @babel/runtime, @emurgo/cardano-serialization-lib-browser, @subwallet/extension-base |
| `@subwallet/extension-mocks` | Definitions for all known chains as exposed by the extension. | @babel/runtime, sinon-chrome |
| `@subwallet/extension-web-ui` | A sample signer extension for the @polkadot/api | @babel/runtime, @coinbase/cbpay-js, @fortawesome/fontawesome-svg-core |
| `@subwallet/subsquare-api-sdk` | Subsquare API SDK for Subwallet | @polkadot/util, axios |
| `@subwallet/web-runner` | A web runner simulate background.js can be use on mobile or environment support web view | @babel/runtime, @emurgo/cardano-serialization-lib-browser, @subwallet/extension-base |
| `@subwallet/webapp` | A web runner simulate background.js can be use on mobile or environment support web view | @babel/runtime, @emurgo/cardano-serialization-lib-browser, @subwallet/extension-base |

For full details, see each package's `README.md` (where present) and
`package.json`.

## 4. Tech stack

- **Node:** `.nvmrc` → 12 (build target). Local shell may be newer (Node 18+ recommended for dev).
- **Package manager:** Yarn 3 (berry), workspaces. Never use npm install.
- **Language:** TypeScript (strict mode in most packages).
- **UI:** React 18, styled-components, react-router.
- **Blockchain libs:** `@polkadot/api`, `@polkadot/keyring`, `ethers`, `web3`, `@ton/core`, `bitcoinjs-lib`.
- **Storage:** IndexedDB via `dexie`.
- **Build:** Webpack 5 for extension; separate build for web-runner and webapp.
- **Lint / format:** ESLint (config: `.eslintrc.js`), Prettier (`.prettierrc.cjs`).
- **CI:** GitHub Actions (`.github/workflows/`).

## 5. Build / dev commands

| Goal | Command |
| --- | --- |
| Install dependencies | `yarn install` |
| Build all packages | `yarn build` |
| Build extension UI | `yarn build:ui` |
| Start webapp dev server | `yarn webapp:dev` |
| Start web-runner dev server | `yarn web-runner:dev` |
| Build web-runner | `yarn web-runner:build` |
| Build extension only | `yarn webpack:build:extension` |
| Watch extension during dev | `yarn watch-dev` |
| Start web app dev server | `yarn webpack:dev:webapp` |
| Build webapp | `yarn webapp:build` |
| Run lint | `yarn lint` |
| Run tests | `yarn test` |

See `package.json` (root) `scripts` for the full list, and `CONTRIBUTING.md`
for the contributor workflow.

## 6. Conventions

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
  (`1.3.83` on `master`). `packages/*` carry a per-monorepo internal version
  with a `-N` suffix (`1.3.83-0`). The canonical user-facing version also
  lives in `VERSION` (repo root, per koni-docs §0). A feature branch's
  `package.json` lags `master` until the release commit is merged — **`VERSION`
  and `docs/CHANGELOG.md`, not the branch's `package.json`, are what the docs
  layer tracks.**

## 7. Documentation

Current docs at the repo root:

- `README.md` — quickstart + feature overview
- `CONTRIBUTING.md` — contributor workflow
- `CHANGELOG.md` — legacy release history, kept for CI only (see below)
- `BOUNTIES.md` — open bounties for contributors
- `LICENSE` — Apache-2.0
- `VERSION` — canonical semver (= root `package.json` version)

Canonical `docs/` content per koni-docs spec (BRIEF, PRD, ARCHITECTURE,
CONTEXT, LESSONS, SETUP, sprints/, CHANGELOG) is **authored**.

### How the docs are allowed to change — five standing rules

These are not EPIC-21's rules; they are the project's. Each was paid for by a defect
that reached the owner before it reached a check. Full reasoning in `docs/CONTEXT.md`.

**These six live here on purpose.** The koni-docs spec is vendored from
`Koniverse/Koni-Skills` and the CLI ships from npm — the next skill install or
`npm i -g` overwrites both. `AGENTS.md` is the only copy nothing overwrites.

**1. An ID is an identity, not a position.** FR / NFR / US numbers are permanent. The
single gapless renumber of 2026-07-13 was a **one-time exception and will not recur**
([D94](docs/CONTEXT.md)). New FRs **append at the end**; the **Epic column is the
authoritative grouping**, never the number range — which is why FR-160 belongs to
EPIC-12 (FR-114…125) and must not be "fixed". A retired number is retired, never
reused (NFR-11).

**1b. Every identifier space in this repo has a stowaway.** The repo is a polkadot-js fork,
so it inherited that project's numbering: **51 of the 303 releases in `docs/CHANGELOG.md`
predate 2022 and are not this product**, and six version numbers (`0.2.1`, `0.3.1`, `0.4.1`,
`0.6.1`, `0.7.1`, `0.8.1`) appear **twice** — once as SubWallet, once as polkadot-js. Issue
numbers collide the same way. So: resolving `version → date` from the CHANGELOG takes the
**newest** match (the file is newest-first); grepping git for an issue number is **date-windowed**.
A duplicate identifier is a **signal you crossed a lineage boundary**, not a nuisance
([LESSONS §62/§63/§66](docs/LESSONS.md)).

**2. A requirement needs pain, a check, and an owner.** Before an FR or NFR enters
`docs/PRD.md`: *(a)* evidence someone felt the pain, *(b)* a way to check it, *(c)* a
story that defends it, named in the row. NFR-11 was **retired** for failing all three —
a ≤72 MB budget, unmeasured across 302 releases, guarding a mechanism that was never
built ([D96](docs/CONTEXT.md)). **An unmeasured, unenforced requirement is folklore, and
folklore in a PRD is worse than a blank line, because it reads as a commitment.**

**3. A docs epic changes the map, never the territory.** It *may* correct any doc the
code proves wrong — delete a story describing work that never existed, mark an FR
unshipped, add an FR for a capability that demonstrably shipped without one. It *may
not* decide what the product **should** do: every product decision **escalates to the
owner and lands in `docs/CONTEXT.md` as a dated `D` entry** ([D97](docs/CONTEXT.md)).
That seam is checkable — *an FR or NFR whose status a docs epic changed, with no `D`
entry to cite, is a violation.*

**4. The done-gate has two branches.** A story that materializes a requirement is `done`
only with `version_shipped` (RULE-16) + a CHANGELOG entry + every AC ticked. A story in
an epic that materializes no requirement (`prd_ref: []` at the epic — docs, tooling,
infra) **ships in no release**: it is `done` when every AC is ticked, `commit` names a
real SHA, and `validate` exits zero. Its `version_shipped` is empty **on purpose**.
Corollary: **a `done` story may not carry an unticked AC** — forward scope must *leave*
the story into its own (this is how FR-23 came to be marked shipped though never built).

**5. Every story past `backlog` sits in a sprint window — `W` planned, `M` reconstructed.**
`sprint` is **required** once a story leaves `backlog`: work in flight must be locatable in
time. Two cadences (`^sprint-\d{4}-[WM]\d{2}$`): **`W`** = a real ISO week the team
committed to. **`M`** = a **reconstructed** calendar month, for the 113 stories that shipped
before the sprint system existed (2022-02 → 2026-07). A reconstructed window states so in
its own body: its `goal` is derived from the CHANGELOG *after the fact*, its points are
retroactive, and **velocity computed on it is meaningless — never chart it**
([D99](docs/CONTEXT.md)). The authority for *"when did this ship"* is `version_shipped` +
`commit`, provable with `git merge-base --is-ancestor`; **a sprint label proves nothing** —
it is a locator, not evidence.

**6. Write a rule as a boundary of authority, never as a prediction.** EPIC-21's charter
said it *"never changes the PRD's functional requirements"* — a **fact about scope**, and
a fact about scope expires the moment scope moves. It was violated on day one, because an
epic that checks docs against code must be able to fix what it proves wrong. A rule that
cannot be checked is a rule nobody notices breaking ([LESSONS §65](docs/LESSONS.md)).

### The two change logs

`docs/CHANGELOG.md` is the **canonical** release history, in koni-docs format.
The root `CHANGELOG.md` is the same history in the old format, retained solely
because [`scripts/koni-ci-ghact-build.mjs`](scripts/koni-ci-ghact-build.mjs)
reads it to gate GitHub releases — it greps for a bare `## <version>` heading,
which the koni-docs `## [<version>] — …` heading does not match.

**Until the CI script is migrated, a release must be written to both files.**

Retiring the root file: delete it, point that `readFileSync` at
`docs/CHANGELOG.md`, and change the grep to `## [${version}]`.

koni-docs `RULE-1` / `RULE-2` (VERSION + CHANGELOG in the same commit, real
commit SHA — never `pending`) apply to `docs/CHANGELOG.md`, which is where
`npx koni-docs backfill-commits` looks by default.

GitHub issue → story/epic migration is **pending sub-task 3**.

### The two version spaces (extension vs web app)

One repo, **two products, two release lineages that share a version-number series
but are not the same product**:

| | Branches | Released as | Now at | Changelog |
| --- | --- | --- | --- | --- |
| **extension** | `master`, `subwallet-dev` | git tags `vX.Y.Z` | 1.3.83 | `docs/CHANGELOG.md` (canonical) |
| **web app** | `webapp`, `webapp-dev` | **untagged** — `[CI Skip] release/stable X.Y.Z` commits on `origin/webapp` | 1.3.56 | `CHANGELOG.md` *on the `webapp` branch* |

`origin/master` is **not** an ancestor of `origin/webapp` (hundreds of commits
diverge). **Extension v1.3.56 and web-app 1.3.56 are different releases.** Never
compare a version number across the two without saying which space it is in.

So a story's `version_shipped` is meaningless on its own. Stories default to the
extension space; a story that shipped in the web app declares it:

```yaml
version_shipped: 1.3.56     # bare semver, RULE-16 — unchanged
version_space: webapp       # omit for extension (the default)
```

Proving a version in each space:

```bash
# extension — the tag is the anchor
git merge-base --is-ancestor <sha> v1.3.56

# web app — there is no tag; the release COMMIT is the anchor
git log --format='%H %s' origin/webapp --grep='^\[CI Skip\] release/stable'
git merge-base --is-ancestor <sha> <that-release-sha>
```

**Containment is necessary, not sufficient.** A commit can sit in a release whose
tree no longer renders the feature (see
[US-19.6](docs/sprints/stories/US-19.6-nft-mint-campaigns.md): the mint commits are
ancestors of every tag from v1.1.36, but the surface was deleted before that tag and
the build never injects `NFT_MINTING_HOST`). When containment and the shipped tree
disagree, **the tree wins** — check `git ls-tree <release> <path>` and the build's
env injection before calling a capability shipped.

## 8. Koniverse pipeline

This repo follows the Koniverse product development pipeline:

```text
BRAINSTORM → BRIEF → PRD → ARCH → EPIC/US → DESIGN → REVIEW → QA → IMPLEMENT → COMMIT/DOCS
   BMAD       BMAD    BMAD   BMAD     BMAD     GSTACK  GSTACK  GSTACK  SUPERPOWERS   KONI-DOCS
```

Koni-docs is the **final standardization stage**: it maps planning
artifacts produced by upstream tools into the canonical `docs/` structure
and enforces the 12 core rules.

## 9. Active context pattern (Pattern B — file-extracted)

Live per-developer state lives in `.active-context.md` (gitignored). The
committed template is `.active-context.example.md`. On first checkout:

```bash
cp .active-context.example.md .active-context.md
```

Update `.active-context.md` as you work — sprint, active stories, recent
decisions, recent lessons. It is consumed by koni-docs status / sync
commands.

## 10. Skill quick reference

| Skill | Triggers on |
| --- | --- |
| `koni-docs` | Update docs, create story, record decision, log lesson, write changelog entry, document architecture, run pre-commit doc checklist |

Additional skills (e.g. `koni-api`, plugin skills for Supabase / Next.js)
may be added to `skills-lock.json` over time.

## 11. Out of scope for sub-task 1

The following are tracked in separate sub-tasks and **not** part of this
branch (`ai-development`):

- Migrating GitHub issues to stories/epics — **sub-task 3**.
- Reconciling `packages/*` version suffix (`-N`) with root VERSION —
  **sub-task 2**.
