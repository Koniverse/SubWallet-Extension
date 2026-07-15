---
id: US-1.5
title: "Build, CI, packaging & supply-chain hardening"
epic: EPIC-1
status: ready
priority: P2
points: 8
sprint: sprint-2026-W28
version_shipped:
prd_ref: [NFR-19, NFR-9, NFR-8]
arch_ref: [AD-05, AD-06, AD-08, AD-25]
depends_on: [US-1.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-07-15
---

## Status refresh — 2026-07-15

> Synced from GitHub Projects board #2 ("SubWallet.App – Development"): issue #3904 is **Ready to Implement** there, so this story moves `backlog` → `ready` (sprint `sprint-2026-W28`). Only status/sprint changed; Goal, AC and reasoning below are untouched. The board is the live source for workflow state.

## Goal

Keep the build, CI and cross-browser packaging substrate honest over time: one
webpack/build pipeline that produces a shippable artifact for every supported
browser, a Firefox build that survives the MV3 transition, packaging that installs
and uninstalls cleanly across Chromium-family browsers, a test/build environment
that can construct the Substrate API, an online-resource channel that refreshes
its fallback rather than going stale, and graceful build-time error UX. This story
has no user-facing feature — its value is that EPIC-1's build/packaging surface
(FR-1 MV3 background, FR-2 monorepo/packaging) stays releasable as the codebase
grows, so downstream epics get to stop worrying about whether a green build is a
shippable one on every target. It also keeps the dependency tree auditable: the
Yarn 3 lockfile is committed and integrity-checked, core-wallet deps resolve from
the public npm registry, and CI fails closed on a drifted lockfile or a flagged
advisory (NFR-19).

## Background

This is the **bug / iteration (hardening) cluster** for EPIC-1's build/packaging
surface, not a feature story — it owns no FR. Per the project's
*feature→story · bug/iteration→hardening* triage model, the open build/CI and
cross-browser packaging issues are homed here as a single story because they are
the **same logic — build and packaging — viewed across browsers and across the
build/test/release pipeline**. Splitting per-browser would fragment one pipeline
into near-duplicate stories; keeping one story keeps the webpack/MV3/packaging
fixes coordinated under a shared regression suite.

Unlike the feature stories in this epic (US-1.1–US-1.4), this story carries no new
FR. Its `prd_ref` points at the NFRs it actually defends — NFR-19 (supply chain), NFR-9 (Firefox chunk limit), NFR-8 (MV3). It **defends the FR-1 (MV3 service-worker background) and FR-2 (monorepo /
cross-target packaging) build surface** against real-world drift across the
supported browsers. The real issues anchoring it group into seven themes:

1. **Build / webpack process.**
   [#3904](https://github.com/Koniverse/SubWallet-Extension/issues/3904) — review
   the webpack config and build process for SubWallet. The build pipeline
   ([AD-06](../../ARCHITECTURE.md#architecture-decisions): Webpack 5 bundle
   splitting) is audited so the config that emits Firefox-safe chunks stays
   correct and maintainable.
2. **Firefox MV3 build.**
   [#4115](https://github.com/Koniverse/SubWallet-Extension/issues/4115) — research
   how to build on Firefox after the MV3 update; and
   [#3360](https://github.com/Koniverse/SubWallet-Extension/issues/3360) —
   Extension[Firefox] follow-bug error page. Firefox's MV3 packaging
   ([AD-08](../../ARCHITECTURE.md#architecture-decisions): MV3 service-worker
   background) diverges from Chrome's; the Firefox build must produce a loadable
   artifact and not regress into the follow-bug error page.
3. **Cross-browser packaging.**
   [#2942](https://github.com/Koniverse/SubWallet-Extension/issues/2942) — errors
   automatically removing the extension on Brave. Install/uninstall packaging must
   behave across the Chromium family, not just stock Chrome.
4. **Build / test environment.**
   [#2577](https://github.com/Koniverse/SubWallet-Extension/issues/2577) — cannot
   create a Substrate API in the Jest environment. The test/build environment must
   be able to construct the same API the runtime does, or CI guards built on it are
   unreliable.
5. **Online-resource fallback.**
   [#2461](https://github.com/Koniverse/SubWallet-Extension/issues/2461) — update
   the fallback for online resources periodically; and
   [#4664](https://github.com/Koniverse/SubWallet-Extension/issues/4664) — cannot
   update online resources. The bundled fallback for the online-resource channel
   ([AD-25](../../ARCHITECTURE.md#architecture-decisions): CDN proxy layer with JSON
   fallback) must refresh on a build cadence so it does not silently go stale, and
   the update path must not break.
6. **Build-time error UX.**
   [#1270](https://github.com/Koniverse/SubWallet-Extension/issues/1270) — style
   error when importing an invalid JSON file. The packaged build must degrade
   gracefully on malformed input rather than emitting a broken/unstyled error
   surface.
7. **Supply-chain hygiene (NFR-19).**
   [#4197](https://github.com/Koniverse/SubWallet-Extension/issues/4197) (umbrella;
   no dedicated issue anchor — NFR-19 standing policy). The Yarn 3 lockfile
   ([AD-05](../../ARCHITECTURE.md#architecture-decisions)) and bundle-splitting
   ([AD-06](../../ARCHITECTURE.md#architecture-decisions)) determine the shipped
   bytes; the committed `yarn.lock` + npm-only registry posture (partly already in
   place — retroactive) is turned into a CI gate that fails closed on a drifted
   lockfile, a private/untrusted registry, duplicate/untrusted deps, or a flagged
   advisory.

This story builds on [US-1.1](US-1.1-mv3-service-worker-background.md): the
Firefox MV3 build (#4115/#3360) hardens the same MV3 service-worker background that
story establishes, on the Firefox target. It is **retroactive / ongoing** — much
of this hardening ships incrementally as each build/packaging bug is resolved;
`commit` / `version_shipped` are backfilled during version reconciliation, and the
story stays open to absorb new build/packaging bug clusters.

## Acceptance criteria

- [ ] **AC-1** — **Given** the SubWallet webpack config and build process
  (#3904, AD-06), **When** CI builds every supported target, **Then** each target
  produces a shippable artifact and the build config remains documented/auditable —
  no chunk crosses Firefox's ~4 MB per-file cap.
- [ ] **AC-2** — **Given** the Firefox target after the MV3 update (#4115, #3360,
  AD-08), **When** the Firefox build runs and the extension loads, **Then** it
  produces a loadable MV3 artifact and does not regress into the follow-bug error
  page.
- [ ] **AC-3** — **Given** a Chromium-family browser such as Brave (#2942), **When**
  the extension is installed and then automatically removed, **Then** uninstall
  completes cleanly with no error.
- [ ] **AC-4** — **Given** the Jest test/build environment (#2577), **When** a test
  constructs the Substrate API, **Then** the API is created successfully so
  build-time guards and tests run reliably.
- [ ] **AC-5** — **Given** the online-resource channel and its bundled fallback
  (#2461, #4664, AD-25), **When** the build runs, **Then** the bundled fallback is
  refreshed on the build cadence and the online-resource update path succeeds — the
  fallback does not silently go stale.
- [ ] **AC-6** *(unhappy path)* — **Given** an invalid JSON file imported into the
  packaged build (#1270), **When** the error surface renders, **Then** it degrades
  gracefully with correct styling — no broken/unstyled error page.
- [ ] **AC-7** — **Given** any build/packaging bug fixed under this story, **When**
  the regression suite runs, **Then** the previously reported symptom no longer
  reproduces.
- [ ] **AC-8** — **Given** the repository, **When** CI runs, **Then** it fails if
  `yarn.lock` is missing, out-of-sync with `package.json`, or modified by an install
  (lockfile integrity / `--immutable`) (NFR-19). *(Committed lockfile: retroactive;
  the CI gate: forward.)*
- [ ] **AC-9** — **Given** the dependency set, **When** it is resolved, **Then**
  every core-wallet dependency comes from the public npm registry — no
  private/untrusted registry sources (NFR-19). *(npm-only set: retroactive; the
  assertion: forward.)*
- [ ] **AC-10** — **Given** the dependency tree, **When** it is audited, **Then**
  there are no untrusted dependencies and duplicate dependencies are flagged/deduped,
  asserted in CI (NFR-19).
- [ ] **AC-11** — **Given** a known-vulnerable advisory in the tree, **When** CI runs
  the audit gate, **Then** it fails on a flagged advisory (above an agreed severity
  threshold) (NFR-19).

## Tasks

- [ ] **TASK-1.5.1** — Review and harden the webpack config / build process (#3904) so every target emits a shippable, Firefox-safe artifact (AD-06) (AC: 1)
  - [ ] Audit `packages/extension-koni/webpack.config.cjs` chunk-splitting against the ~4 MB Firefox per-file cap.
- [ ] **TASK-1.5.2** — Fix the Firefox MV3 build (#4115, #3360) so the Firefox target loads and does not hit the follow-bug error page (AD-08) (AC: 2)
- [ ] **TASK-1.5.3** — Fix cross-browser uninstall packaging on the Chromium family (Brave, #2942) (AC: 3)
- [ ] **TASK-1.5.4** — Make the Jest test/build environment able to construct the Substrate API (#2577) so CI guards are reliable (AC: 4)
- [ ] **TASK-1.5.5** — Refresh the online-resource bundled fallback on the build cadence and fix the online-resource update path (#2461, #4664) (AD-25) (AC: 5)
- [ ] **TASK-1.5.6** — Fix the invalid-JSON-import error styling so the build-time error surface degrades gracefully (#1270) (AC: 6)
- [ ] **TASK-1.5.7** — Land regression coverage (test or CI guard) for each fixed build/packaging bug so none can silently reappear (AC: 7)
- [ ] **TASK-1.5.8** — CI lockfile-integrity gate: `yarn install --immutable` (or equivalent) fails on a drifted/out-of-sync `yarn.lock` (NFR-19) (AC: 8)
- [ ] **TASK-1.5.9** — Registry assertion: verify all core-wallet deps resolve from the public npm registry; no private/untrusted registry entries in resolution config (NFR-19) (AC: 9)
- [ ] **TASK-1.5.10** — Duplicate/untrusted-dependency check (dedupe report + allowlist) in CI (NFR-19) (AC: 10)
- [ ] **TASK-1.5.11** — Advisory audit gate (severity-thresholded) that fails CI on a flagged advisory (NFR-19) (AC: 11)
- [ ] **TASK-1.5.12** — Regression: the lockfile/audit gate is a standing CI step; document the severity threshold and the retroactive-vs-forward split (NFR-19) (AC: 8, 11)

## Dev notes

### Architecture constraints

- [AD-05](../../ARCHITECTURE.md#architecture-decisions) — Yarn 3 monorepo package boundaries; the committed lockfile pins the whole workspace (supply-chain hygiene rides this).
- [AD-06](../../ARCHITECTURE.md#architecture-decisions) — Webpack 5 bundle splitting for the Firefox per-file limit; this story audits/hardens the build config (#3904) that keeps every emitted chunk under the cap.
- [AD-08](../../ARCHITECTURE.md#architecture-decisions) — MV3 service-worker background; the Firefox MV3 build (#4115/#3360) must produce a loadable artifact under MV3, matching the contract US-1.1 establishes on the extension target.
- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — CDN proxy layer with bundled JSON fallback; the online-resource fallback refresh (#2461/#4664) keeps the build-time bundled fallback from going stale.
- This story does NOT introduce new AD entries — it hardens existing ones.

### Cross-story dependencies

- Builds on [US-1.1](US-1.1-mv3-service-worker-background.md) — the Firefox MV3 build (#4115/#3360) hardens the same MV3 service-worker background contract, on the Firefox target.
- Sibling [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md) — both touch the webpack/packaging surface; US-1.2 sets the cross-target packaging and chunk-size budget, this story defends it across browsers. Coordinate review on `webpack.config.cjs`.

### What we explicitly did NOT do

- No new feature work — this is a build/CI/packaging bug/iteration cluster only. New build-infra *capabilities* get their own FR-backed story.
- No iOS-storage work — there is no iOS issue in triage; the earlier draft's "iOS-storage" theme was invented and has been removed.
- No per-browser story split — the supported browsers share one webpack/MV3/packaging pipeline; splitting would duplicate near-identical hardening across stories and fragment the shared regression suite.
- No runtime chain/i18n hot-update feature work — that is owned by US-1.3 / US-1.4; this story only refreshes the *bundled fallback* on the build cadence.
- No dependency-version *upgrades* — this story is about auditability + gating, not bumping versions; a flagged advisory triggers separate remediation.

### Points justification

8 pts — a build/CI/packaging hardening **cluster** spanning six distinct
build-infra subsystems: the webpack/build config (#3904), the Firefox MV3 build
and its error-page regression (#4115/#3360), cross-browser uninstall packaging
(#2942), the Jest test/build environment (#2577), the online-resource fallback
refresh (#2461/#4664), and build-time error UX (#1270). It now also absorbs the
3-pt supply-chain CI gate (NFR-19) — immutable lockfile integrity, npm-only
registry assertion, dedupe/untrusted check, and the advisory audit gate — which
rides the same Yarn-3-monorepo / Webpack / CI build surface (AD-05/AD-06) this
story already hardens. Per SKILL §3a-bis the original six-theme cluster sat above
a single-area focused hardening story (which calibrates at 3 — cf.
[US-4.21](US-4.21-asset-hub-migration-hardening.md), a single-facet 3-pointer);
folding in the supply-chain cluster pushes it to a full multi-system
build/packaging + CI-gate bundle plus a shared regression task. It carries no FR.

### References

- [Issue #3904](https://github.com/Koniverse/SubWallet-Extension/issues/3904) — Review webpack config and build process for SubWallet (build/webpack, AD-06)
- [Issue #4115](https://github.com/Koniverse/SubWallet-Extension/issues/4115) — Research how to build on Firefox after MV3 update (Firefox MV3 build, AD-08)
- [Issue #3360](https://github.com/Koniverse/SubWallet-Extension/issues/3360) — Extension[Firefox] follow bug error page (Firefox MV3 build, AD-08)
- [Issue #2942](https://github.com/Koniverse/SubWallet-Extension/issues/2942) — Errors in automatically removing extension on Brave (cross-browser packaging)
- [Issue #2577](https://github.com/Koniverse/SubWallet-Extension/issues/2577) — Cannot create Substrate API on Jest environment (build/test env)
- [Issue #2461](https://github.com/Koniverse/SubWallet-Extension/issues/2461) — Update fallback for online resources periodically (online-resource fallback, AD-25)
- [Issue #4664](https://github.com/Koniverse/SubWallet-Extension/issues/4664) — Cannot update online resources (online-resource fallback, AD-25)
- [Issue #1270](https://github.com/Koniverse/SubWallet-Extension/issues/1270) — Style error when importing invalid JSON file (build-time error UX)
- [Issue #4197](https://github.com/Koniverse/SubWallet-Extension/issues/4197) — umbrella performance/quality program (supply-chain facet; NFR-19 standing policy)
- [Source: PRD FR-1](../../PRD.md#functional-requirements) — MV3 service-worker background (build surface defended)
- [Source: PRD NFR-9 / NFR-8 / NFR-19](../../PRD.md#non-functional-requirements) — Firefox chunk limit, MV3 compatibility, dependency auditability
- [Source: PRD FR-2](../../PRD.md#functional-requirements) — Yarn 3 monorepo (code reuse across platforms — NOT the cross-browser packaging this story hardens; build surface defended)
- [Source: PRD NFR-19](../../PRD.md#non-functional-requirements) — dependency auditability / supply-chain hygiene (defended)
- [Source: ARCHITECTURE AD-05, AD-06, AD-08, AD-25](../../ARCHITECTURE.md#architecture-decisions)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | CI runs `yarn webpack:build:extension` (and the web app / web-runner builds) → all green; no emitted file ≥ ~4 MB; webpack config audited per #3904 |
| AC-2 | Build the Firefox target → load the unpacked MV3 extension in Firefox → it loads and does not show the follow-bug error page (#4115/#3360) |
| AC-3 | Install then automatically remove the extension on Brave → uninstall completes with no error (#2942) |
| AC-4 | Run the Jest suite that constructs the Substrate API → API created successfully, no environment failure (#2577) |
| AC-5 | Run the build → bundled online-resource fallback is refreshed; exercise the online-resource update path → it succeeds (#2461/#4664) |
| AC-6 | In the packaged build, import an invalid JSON file → error surface renders with correct styling, not a broken/unstyled page (#1270) |
| AC-7 | Each fixed build/packaging issue has an accompanying regression test/CI guard in the same PR |
| AC-8 | CI: `yarn install --immutable` fails on a drifted/out-of-sync `yarn.lock` (lockfile integrity, NFR-19) |
| AC-9 | CI: registry assertion shows all core-wallet deps resolve from the public npm registry; no private/untrusted registry entries (NFR-19) |
| AC-10 | CI: dedupe / untrusted-dependency check passes (or flags) per the allowlist (NFR-19) |
| AC-11 | CI: advisory audit gate fails on a flagged advisory above the agreed severity threshold (NFR-19) |

## Changelog entry

### Added
- CI supply-chain gate: immutable `yarn.lock` integrity check, npm-only registry assertion, duplicate/untrusted-dependency check, and a severity-thresholded advisory audit gate that fails closed on regression (NFR-19).

### Fixed
- Webpack config / build-process review so every supported target emits a shippable, Firefox-safe artifact (#3904).
- Firefox MV3 build after the MV3 update, including the follow-bug error page regression (#4115, #3360).
- Cross-browser uninstall packaging error on Brave (#2942).
- Jest test/build environment could not construct the Substrate API (#2577).
- Online-resource bundled fallback now refreshes on the build cadence; online-resource update path fixed (#2461, #4664).
- Invalid-JSON-import error styling — build-time error surface degrades gracefully (#1270).

**Commit**:

## Implementation notes

_Hardening cluster — retroactive / ongoing. Issue IDs and `commit` /
`version_shipped` are backfilled during version reconciliation as each
build/packaging bug is resolved. One story by design: the supported browsers share
one webpack/MV3/packaging pipeline, so these fixes stay coordinated under a shared
regression suite rather than fragmenting per browser._

## Cross-references

- [Epic EPIC-1](../epics/EPIC-1.md)
- [ARCHITECTURE AD-06 / AD-08 / AD-25](../../ARCHITECTURE.md#architecture-decisions)
- [US-1.1](US-1.1-mv3-service-worker-background.md) · [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md)
- Issues: [#3904](https://github.com/Koniverse/SubWallet-Extension/issues/3904) · [#4115](https://github.com/Koniverse/SubWallet-Extension/issues/4115) · [#3360](https://github.com/Koniverse/SubWallet-Extension/issues/3360) · [#2942](https://github.com/Koniverse/SubWallet-Extension/issues/2942) · [#2577](https://github.com/Koniverse/SubWallet-Extension/issues/2577) · [#2461](https://github.com/Koniverse/SubWallet-Extension/issues/2461) · [#4664](https://github.com/Koniverse/SubWallet-Extension/issues/4664) · [#1270](https://github.com/Koniverse/SubWallet-Extension/issues/1270)
