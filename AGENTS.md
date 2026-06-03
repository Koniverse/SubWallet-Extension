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
ecosystem), EVM (Ethereum, Base, Arbitrum, …), Bitcoin, and TON. The
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
  (currently `1.3.79`). `packages/*` carry a per-monorepo internal version
  with `-N` suffix (currently `1.3.79-1`). The canonical user-facing
  version also lives in `VERSION` (repo root, per koni-docs §0).

## 7. Documentation

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

- Authoring `docs/BRIEF.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`,
  `docs/CONTEXT.md`, `docs/LESSONS.md`, `docs/SETUP.md`,
  `docs/CHANGELOG.md`, `docs/sprints/` — **sub-task 2**.
- Migrating GitHub issues to stories/epics — **sub-task 3**.
- Reconciling `packages/*` version suffix (`-N`) with root VERSION —
  **sub-task 2**.
