---
id: EPIC-20
title: "Performance & Lifecycle"
status: in-progress
prd_ref: []
arch_ref:
  - AD-07
  - AD-08
  - AD-20
  - AD-23
  - AD-24
  - AD-25
created: 2026-06-12
updated: 2026-07-14
---

> **⚠️ Corrected 2026-07-13 — AD-07's mechanism does not exist.** Wherever this file says
> reads ride a *"lightweight WsProvider"* and that a full `ApiPromise` is deferred to
> extrinsic construction, that is inherited from [AD-07](../../ARCHITECTURE.md#architecture-decisions),
> which was **decided in 2022 and never implemented**: `SubstrateApi` builds a full
> `ApiPromise` eagerly per enabled chain and the read path reads off it. Every memory figure
> here (~72 MB / ~264 MB) is a 2022 MV2-era claim with **no probe behind it**. **NFR-11 has
> since been retired and [US-20.3](../stories/US-20.3-read-path-memory-budget.md) deprecated** — memory
> is no longer a stated requirement ([CONTEXT D95](../../CONTEXT.md) / D96). Treat every
> memory sentence in this file as historical. If a memory complaint appears: **measure
> first** ([LESSONS §64](../../LESSONS.md)).


## Goal

EPIC-20 owns the wallet's **cross-cutting performance and lifecycle program** —
the concerns that span every feature epic and have no single feature home: how
fast the background wakes and how little it does while idle, how few API requests
the client fans out, how much memory the read path holds, how it behaves under
many accounts, how quickly lists and screens render, and how the WebApp and web-runner
web surfaces perform. This epic ships
**no end-user feature of its own**; its deliverable is that every other epic gets
to stop re-litigating "is this fast enough and lightweight enough", because the
budgets, lifecycle phases, and request/memory invariants are owned and defended
here. It materializes the performance non-functional requirements (NFR-8, NFR-12,
NFR-17, NFR-20, NFR-21 — **NFR-11 was retired 2026-07-13, see [CONTEXT D96](../../CONTEXT.md)**) and absorbs the cross-cutting
performance-program tracked by umbrella issue
[#4197](https://github.com/Koniverse/SubWallet-Extension/issues/4197).

## Overview

### Business context

Before this epic the performance work is real but homeless. SubWallet has an
active, multi-phase performance program on GitHub — umbrella issue
[#4197](https://github.com/Koniverse/SubWallet-Extension/issues/4197) ("Evaluate
and update the performance of the extension") indexes the performance sub-issues,
and the lifecycle tracker
[#4427](https://github.com/Koniverse/SubWallet-Extension/issues/4427) ("Improve
SubWallet Lifecycle") is a comprehensive core-architecture refactor with phased
sub-issues P1/P2/P3. These are **not** feature-local hardening; they are a genuine
cross-cutting architectural program that touches the engine, the service layer,
the background lifecycle, the request layer, the UI render path, and the web surfaces.
Left as footnotes inside feature epics, this program
fragments and drifts.

EPIC-20 gives that program a home. It owns the **how-fast / how-much** dimension
of the whole product: the core-structure and phased MV3 background lifecycle (Init
→ Start → StartFull → idle, AD-20) that minimizes idle CPU/memory/API while the
worker is backgrounded; the elimination of redundant and runaway API fan-out
(including the notification-fetch flood that today can suspend every other request
and block opening the extension); the read-path memory budget (≤72 MB, AD-07) that
must hold even with many chains; the many-account submit/close behaviour that must
not freeze the screen; the list/render performance across the heavy selection and
collection screens; and the WebApp and web-runner web-surface performance.

The architectural distinction this epic preserves is a boundary, not a feature:
EPIC-20 optimizes **how fast and how cheaply** an operation runs and **how the
client talks to the backend** — it never changes **what** the operation does. The
balance read it makes memory-bounded is still authored by EPIC-7; the earning list
it keeps responsive is still owned by EPIC-12; the swap routing it must not flood
is still EPIC-11's. EPIC-20 publishes the budgets and the lifecycle/request/memory
invariants; the feature epics keep their feature behavior.

This is also a deliberately **distributed** model. Feature-local performance stays
where the feature lives: each feature epic keeps its own hardening story
([US-7.7](../stories/US-7.7-balance-cache-invalidation-hardening.md) balance-cache,
[US-12.14](../stories/US-12.14-earning-performance-and-cache-hardening.md)
earning performance, etc.). EPIC-20 owns only the *cross-cutting* program — the
concerns that no single feature epic can own because they span all of them. The
boundary is drawn explicitly in Out of scope.

### Feature pillars

| # | Pillar | Stories | Purpose |
|---|---|---|---|
| 1 | **Core structure & lifecycle** | ✅ [US-20.7](../stories/US-20.7-mv3-wake-depth-split.md) · 📋 [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) | **Shipped (1.3.42):** wake *depth* — `pub(` starts the core only, `pri(`/`mobile(` also starts the 11 data services. **Not started:** wake *granularity* (every wake still calls `resumeAllNetworks()`), ZK-Asset/MantaPay removal, cron/subscription → services |
| 2 | **Request economy** | ✅ [US-20.8](../stories/US-20.8-api-request-strategy-v2.md) · ✅ [US-20.9](../stories/US-20.9-aggregated-data-via-services-sdk.md) · 📋 [US-20.2](../stories/US-20.2-api-call-optimization.md) | **Shipped:** response cache + group cancellation + adaptive backoff (1.3.47), aggregate reads via the Services SDK (1.3.52). **Not started:** in-flight dedup, an *app-wide* cap, and the unbounded notification-fetch loop (#4021) that is still live |
| 3 | **Memory & scale** | [US-20.3](../stories/US-20.3-read-path-memory-budget.md), [US-20.4](../stories/US-20.4-many-account-submit-performance.md) | ~~Hold the ≤72 MB read-path budget~~ — **NFR-11 retired, US-20.3 deprecated** ([D96](../../CONTEXT.md)); what remains is NFR-23: stop the many-account submit / history-popup freeze |
| 4 | **Render performance** | [US-20.5](../stories/US-20.5-list-rendering-performance.md), [US-20.6](../stories/US-20.6-webapp-and-web-runner-performance.md) | List/render performance across heavy screens; WebApp animation + pagination and web-runner cross-tab rendering |

### Out of scope

- **Feature-local performance hardening clusters** — owned by their feature epics, not by EPIC-20. Balance-cache freshness lives in [EPIC-7](EPIC-7.md) ([US-7.7](../stories/US-7.7-balance-cache-invalidation-hardening.md)); earning-surface performance lives in [EPIC-12](EPIC-12.md) ([US-12.14](../stories/US-12.14-earning-performance-and-cache-hardening.md)); swap-routing robustness lives in [EPIC-11](EPIC-11.md) ([US-11.8](../stories/US-11.8-cross-chain-swap-routing.md)). EPIC-20 publishes the shared budgets those stories must meet; it does not re-own the per-feature defending work.
- **The actual feature behavior being optimized** — owned by the feature epic. The portfolio aggregate is [EPIC-7](EPIC-7.md); the earning list is [EPIC-12](EPIC-12.md); the NFT collection is [EPIC-9](EPIC-9.md); the transaction-history surface is [EPIC-8](EPIC-8.md). EPIC-20 optimizes the *how-fast / how-much-memory* of these surfaces, never the *what* — it adds no new feature behavior to any of them.
- **The MV3 service-worker substrate itself** — the decision to run the background as an MV3 service worker (AD-08) is owned by [EPIC-1](EPIC-1.md). EPIC-20 owns the *lifecycle phasing and idle behavior* (AD-20) that rides on top of that substrate, not the substrate decision.
- **The Services SDK and cache/CDN proxy engines** — the backend aggregation layer (AD-24) and the `api-cache` / `static-data` / `ipfs-files` proxy layer (AD-25) are built in [EPIC-2](EPIC-2.md) and consumed across the read epics. EPIC-20 enforces that the client *routes through* them instead of fanning out redundantly; it does not build the backend.
- **Functional correctness of the data being made faster** — accuracy of balances, APY, fees, routing remains owned by the engine epics ([EPIC-2](EPIC-2.md)) and the feature epics. EPIC-20 never trades correctness for speed.

## Shipped state (audited 2026-07-13)

> EPIC-20 was written as a roadmap epic and every story sat at `backlog`. **That was
> wrong.** Four pieces of this program are in the product and no story recorded them:
>
> | Shipped | Release | Story it belongs to |
> | --- | --- | --- |
> | `#4428` MV3 lifecycle **P1** — wake-depth split (`pub(` → partial wake, `pri(` → full wake) | **1.3.42** | [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) |
> | `#4478` fix for the regression #4428 introduced (`isFullActive` never reset → Home/Earning failed to load after the first sleep) | **1.3.43** | [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) |
> | `#4448` `api-request-strategy-v2` — md5-keyed 60 s response cache + group cancellation (**the changelog mislabelled this `#4458`**) | **1.3.47** | [US-20.2](../stories/US-20.2-api-call-optimization.md) |
> | `#4465` aggregated data routed through the external Services SDK (18 call sites) — what actually satisfies NFR-20 / AD-24 | **1.3.52** | [US-20.2](../stories/US-20.2-api-call-optimization.md) |
>
> US-20.1 and US-20.2 are now `in-progress` — **stalled, not active** (last commits 2025).
> US-20.3 / US-20.4 / US-20.5 / US-20.6 remain `backlog`: every issue they cite (#4197,
> #4427, #4445, #4446, #4021, #4447, #2245, #2549, #2248, #2337) has **zero commits**.
> US-20.4's `#4984` has real work but on an **unmerged branch**, in no release.
>
> The audit also exposed that **AD-07 / NFR-11's invariant was never held by the code** —
> the substrate read path uses the full `ApiPromise`, not a lightweight WsProvider. Rather
> than build a refactor to satisfy a doc, **NFR-11 was retired and [US-20.3](../stories/US-20.3-read-path-memory-budget.md)
> deprecated** ([CONTEXT D96](../../CONTEXT.md)): the only memory incident in 302 releases is
> from 2022 (MV2), and MV3's idle `sleep()` is the de-facto control. Memory is no longer a
> stated requirement — if a complaint appears, **measure first**.

## AD Coverage

| AD | Title | Story |
|----|-------|-------|
| AD-20 | Four-state MV3 background lifecycle with heartbeat | [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) |
| AD-08 | Manifest V3 migration with service worker background | [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md), [US-20.3](../stories/US-20.3-read-path-memory-budget.md) |
| AD-24 | Backend Services SDK for multi-chain data aggregation | [US-20.2](../stories/US-20.2-api-call-optimization.md) |
| AD-25 | Cache / CDN proxy layer for market data, metadata and NFT media | [US-20.2](../stories/US-20.2-api-call-optimization.md) |
| AD-07 | Lightweight WsProvider for balance queries; full ApiPromise deferred | [US-20.3](../stories/US-20.3-read-path-memory-budget.md), [US-20.4](../stories/US-20.4-many-account-submit-performance.md) |
| AD-23 | Static-data caching generated by a headless web-runner cron | [US-20.5](../stories/US-20.5-list-rendering-performance.md), [US-20.6](../stories/US-20.6-webapp-and-web-runner-performance.md) |

> AD-08 (MV3 substrate) and **AD-20 (four-state background lifecycle)**, AD-24
> (Services SDK) and AD-25 (cache/CDN proxy) are *referenced* here — EPIC-20's
> invariants ride on them; their primary implementations live in
> [EPIC-1](EPIC-1.md) (AD-08, AD-20) and [EPIC-2](EPIC-2.md) (AD-24, AD-25).
> EPIC-20 refactors/optimizes the lifecycle, request and memory paths on top of
> them rather than owning them — US-20.1 restructures the lifecycle for
> performance, but the four-state contract itself is AD-20, owned by EPIC-1
> (US-1.1).

## NFR Coverage

> EPIC-20 owns **no FR** — it is NFR-driven, so `prd_ref` is empty by design and
> the validator's FR-reachability check does not apply. This table replaces the
> FR Coverage table: it maps the performance NFRs this epic materializes to the
> story that defends each. The NFRs themselves are cited in story bodies, not in
> frontmatter.

| NFR | Concern | Story |
|-----|---------|-------|
| [NFR-8](../../PRD.md#non-functional-requirements) | MV3 service-worker shutdown/wake state persistence | ✅ [US-20.7](../stories/US-20.7-mv3-wake-depth-split.md) (wake depth, 1.3.42) · 📋 [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) (idle heartbeat, chain granularity) |
| [NFR-12](../../PRD.md#non-functional-requirements) | Cold-start: cached-first paint, progressive refresh | 📋 [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) — **not met**: 9 `Skeleton` refs app-wide, none on the Tokens home screen, no ≤300 ms instrumentation |
| [NFR-20](../../PRD.md#non-functional-requirements) | Services SDK aggregation; reduce per-chain RPC fan-out | ✅ [US-20.9](../stories/US-20.9-aggregated-data-via-services-sdk.md) (1.3.52) · 📋 [US-20.2](../stories/US-20.2-api-call-optimization.md) (in-flight dedup, app-wide cap) |
| [NFR-21](../../PRD.md#non-functional-requirements) | Cache / CDN proxy layer for market/metadata/media | ✅ [US-20.8](../stories/US-20.8-api-request-strategy-v2.md) (1.3.47) · 📋 [US-20.2](../stories/US-20.2-api-call-optimization.md) (stale-on-error fallback) |
| ~~NFR-11~~ **retired** ([D96](../../CONTEXT.md)) | ~~Read-path memory ≤72 MB~~ — never measured, mechanism never built | [US-20.3](../stories/US-20.3-read-path-memory-budget.md) |
| [NFR-23](../../PRD.md#non-functional-requirements) | Many-account submit/close must not block the main thread | [US-20.4](../stories/US-20.4-many-account-submit-performance.md) |
| [NFR-21](../../PRD.md#non-functional-requirements) + [NFR-23](../../PRD.md#non-functional-requirements) | List screens read slow-changing config from the static-data cache, not a per-render sweep (NFR-21); the render cost itself is now covered by **NFR-23** ([D98](../../CONTEXT.md) — it was a PRD gap until 2026-07-13) | [US-20.5](../stories/US-20.5-list-rendering-performance.md) |
| [NFR-17](../../PRD.md#non-functional-requirements) (shared) | Web-surface portability/performance (webapp / web-runner) | [US-20.6](../stories/US-20.6-webapp-and-web-runner-performance.md) |

## Stories

| ID | Title | Goal | Status | Version |
|---|---|---|---|---|
| [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) | Core-structure & lifecycle refactor | Phase the MV3 background into Init/Start/StartFull + background-idle, remove deprecated features, refactor cron/subscription into services, and refine the data-processing architecture | 🚧 in-progress | — |
| [US-20.2](../stories/US-20.2-api-call-optimization.md) | API-call optimization | Remove redundant API fan-out, cap per-window requests, and fix the notification-fetch flood that suspends other requests and blocks opening the extension | 🚧 in-progress | — |
| [US-20.3](../stories/US-20.3-read-path-memory-budget.md) | Read-path memory budget | Hold the ≤72 MB balance/read-path budget regardless of chain count via the lightweight WsProvider path | ⏸️ deprecated | — |
| [US-20.4](../stories/US-20.4-many-account-submit-performance.md) | Many-account submit performance | Stop the freeze when, with many accounts, a user submits a tx then closes the history popup | 📋 backlog | — |
| [US-20.7](../stories/US-20.7-mv3-wake-depth-split.md) | MV3 wake-depth split | `pub(` wakes the core only; `pri(`/`mobile(` additionally starts the 11 data services (#4428 + #4478 fix) | ✅ done | 1.3.42 |
| [US-20.8](../stories/US-20.8-api-request-strategy-v2.md) | API request strategy v2 | md5-keyed 60 s response cache, group cancellation, per-window cap, adaptive backoff (#4448) | ✅ done | 1.3.47 |
| [US-20.9](../stories/US-20.9-aggregated-data-via-services-sdk.md) | Aggregated data via Services SDK | 18 aggregate call sites routed off-device; in-repo SDK deleted (#4465) | ✅ done | 1.3.52 |
| [US-20.5](../stories/US-20.5-list-rendering-performance.md) | List rendering performance | Make heavy lists/screens (NFT / Receive / customization / select token / select network) render fast | 📋 backlog | — |
| [US-20.6](../stories/US-20.6-webapp-and-web-runner-performance.md) | WebApp & web-runner performance | WebApp animations + list pagination and a web-runner shared worker across tabs | 📋 backlog | — |

> Every EPIC-20 story owns **no FR** (cf. the
> [US-12.13](../stories/US-12.13-earning-reward-and-apy-accuracy-hardening.md) /
> [US-7.7](../stories/US-7.7-balance-cache-invalidation-hardening.md) FR-less
> defending-story pattern): each defends one or more performance NFRs and absorbs
> the cross-cutting performance-program issues, rather than materializing a
> functional requirement. US-20.1's P1 phase (#4428) is already shipped
> (retroactive); its P2/P3 phases (#4445/#4446) are forward and may split into
> their own stories when scheduled.

## Object map & user-story interactions

### US ↔ entity / subsystem matrix

| US | Primary entity / subsystem | FR |
|---|---|---|
| [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) | `KoniState` background lifecycle — `ServiceStatus` machine + `wakeup`/`_startFull`/`sleep`; `cronAndSubscription` services | — |
| [US-20.2](../stories/US-20.2-api-call-optimization.md) | Request layer — Services SDK / `api-cache`·`static-data`·`ipfs-files` proxy routing + `InappNotificationService` fetch class | — |
| [US-20.3](../stories/US-20.3-read-path-memory-budget.md) | `SubstrateApi` read path — lightweight `WsProvider`; full `ApiPromise` deferred to extrinsic construction | — |
| [US-20.4](../stories/US-20.4-many-account-submit-performance.md) | Submit/close path — per-account subscription teardown + history-popup reconciliation off the main thread | — |
| [US-20.5](../stories/US-20.5-list-rendering-performance.md) | `extension-koni-ui` heavy lists (NFT / Receive / customization-network / Select Token / Select Network) reading `fetchStaticData` | — |
| [US-20.6](../stories/US-20.6-webapp-and-web-runner-performance.md) | `webapp` Dapps/Mission-Pools lists + `web-runner` shared-worker model | — |

> Every EPIC-20 story owns **no FR** (the epic is NFR-driven; `prd_ref` is empty by
> design — see [NFR Coverage](#nfr-coverage)), so the FR column is `—` throughout.
> Each row's subsystem is the real code surface the story optimizes; EPIC-20 changes
> *how fast / how cheaply / how few requests*, never *what* the surface does.

HAPPY-PATH: N/A — performance/lifecycle epic; optimizations are cross-cutting, no single user flow.

## Cross-cutting invariants

- ~~**Read path stays memory-bounded (NFR-11, AD-07)**~~ — **INVARIANT RETIRED 2026-07-13** ([CONTEXT D96](../../CONTEXT.md)); it was never true. Formerly: every balance/token read rides the lightweight WsProvider path; a full `@polkadot/api` ApiPromise is instantiated only for extrinsic construction, never for a read. The ≤72 MB budget MUST hold regardless of chain count. Enforced by [US-20.3](../stories/US-20.3-read-path-memory-budget.md); upheld by every read epic (EPIC-7, EPIC-9, EPIC-12).
- **Many accounts never block the main thread ([NFR-23](../../PRD.md#non-functional-requirements)):** per-account work on submit, close, and refresh is bounded and off the critical UI path; the screen never freezes because the account count is large. This was a **PRD gap until 2026-07-13** — the invariant was being defended by a story with no requirement behind it ([D98](../../CONTEXT.md)). Enforced by [US-20.4](../stories/US-20.4-many-account-submit-performance.md).
- **Cached-first paint, progressive refresh ([NFR-12](../../PRD.md#non-functional-requirements)):** on popup open the background serves last-known cached state immediately and refreshes progressively with visible skeletons; a blank wait while data loads is a defect. Owned cross-cutting by [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md); each read surface implements it (US-7.1, US-12.14).
- **API calls go through optimization / proxy, not redundant fan-out ([NFR-20](../../PRD.md#non-functional-requirements), [NFR-21](../../PRD.md#non-functional-requirements), AD-24, AD-25):** aggregated multi-chain data is fetched through the Services SDK and market/metadata/media through the cache/CDN proxies; the client never re-issues a request another in-flight request already covers, and no request class may flood out the others (the #4021 notification case). Enforced by [US-20.2](../stories/US-20.2-api-call-optimization.md).
- **Idle background is quiet ([NFR-8](../../PRD.md#non-functional-requirements), AD-20):** a backgrounded MV3 worker performs no avoidable polling, chain connections, or API calls; `pub(…)` wakes it partially, `pri(…)`/`mobile(…)` fully, and last-disconnect sleeps it. Enforced by [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md).

## Cross-story testing requirements

| Pattern | Stories that apply | Shared infra |
|---|---|---|
| **Lifecycle-phase assertion harness** | [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) | A test that drives the `ServiceStatus` machine through Init → Start → StartFull → Sleep and asserts no full-chain start on a partial wake |
| **Request-count budget harness** | [US-20.2](../stories/US-20.2-api-call-optimization.md), [US-20.4](../stories/US-20.4-many-account-submit-performance.md) | An instrumented fetch/RPC counter that asserts no duplicate in-flight request and a per-window request cap (reused for the notification-flood regression and the many-account submit path) |
| **Memory-budget probe** | [US-20.3](../stories/US-20.3-read-path-memory-budget.md) | A read-path memory probe asserting ≤72 MB across a many-chain fixture |
| **Render-cost benchmark** | [US-20.5](../stories/US-20.5-list-rendering-performance.md), [US-20.6](../stories/US-20.6-webapp-and-web-runner-performance.md) | A list-render benchmark (virtualization + pagination) across the heavy selection/collection screens and the WebApp lists |

> The request-count budget harness set up by US-20.2 is reused by US-20.4 for the
> many-account submit path. These are *standing* performance tests, in the spirit
> of [US-12.13](../stories/US-12.13-earning-reward-and-apy-accuracy-hardening.md)'s
> regression-coverage task tying issues to standing tests.

## Performance budgets & invariants

| Concern | Budget | Story | Rationale |
|---|---|---|---|
| **Idle background work** | No avoidable polling / chain connect / API call while backgrounded; partial wake never starts all chains | [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) | MV3 evicts idle workers (~5 min); idle CPU/memory/API is pure waste and drains the host |
| **Cold-start first paint** | Cached state visible ≤ 300 ms on popup open (NFR-12) | [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md) | The popup is the most-opened surface; a blank wait reads as "wallet broken" |
| **Redundant requests** | Zero duplicate in-flight requests; per-window request cap; no request class starves others | [US-20.2](../stories/US-20.2-api-call-optimization.md) | Notification fetch today floods and suspends all other requests so the extension can't open (#4021); fan-out also raises backend infra pressure (#4447) |
| ~~**Read-path memory**~~ **retired** | ~~≤ 72 MB regardless of chain count~~ — no memory budget is stated any more ([D96](../../CONTEXT.md)) | [US-20.3](../stories/US-20.3-read-path-memory-budget.md) | Full ApiPromise across 20 chains hits ~264 MB; the read path MUST stay on the lightweight WsProvider path |
| **Many-account submit** | Submit + history-popup close never blocks the main thread; per-account work bounded | [US-20.4](../stories/US-20.4-many-account-submit-performance.md) | With many accounts, submit-then-close-history freezes the screen today (#4984) |
| **List render** | Heavy lists virtualized + paginated; no synchronous full-list render on the heavy selection/collection screens | [US-20.5](../stories/US-20.5-list-rendering-performance.md) | NFT / Receive Token / customization-network / select-token / select-network screens jank on large lists (#2245) |
| **Web-surface render** | WebApp lists paginated with animations; web-runner shares one worker across tabs | [US-20.6](../stories/US-20.6-webapp-and-web-runner-performance.md) | WebApp Dapps/Mission-Pools lists lack animations and load all at once (#2248); each tab spawns its own runner without a shared worker (#2337) |

## Acceptance criteria (propagated from stories)

- [ ] The MV3 background phases through Init → Start → StartFull → idle, removes deprecated features, refactors cron/subscription into services, does no avoidable idle work, and serves cached state on cold start — [US-20.1](../stories/US-20.1-core-structure-and-lifecycle-refactor.md)
- [ ] No duplicate in-flight API requests, a per-window request cap holds, and the notification fetch can no longer suspend other requests or block opening the extension — [US-20.2](../stories/US-20.2-api-call-optimization.md)
- [ ] The read-path memory budget (≤72 MB) holds regardless of chain count on the lightweight WsProvider path — [US-20.3](../stories/US-20.3-read-path-memory-budget.md)
- [ ] With many accounts, submitting a transaction then closing the history popup no longer freezes the screen — [US-20.4](../stories/US-20.4-many-account-submit-performance.md)
- [ ] The heavy lists/screens (NFT / Receive / customization / select token / select network) stay responsive on large datasets — [US-20.5](../stories/US-20.5-list-rendering-performance.md)
- [ ] The WebApp lists animate + paginate and the web-runner shares one worker across tabs — [US-20.6](../stories/US-20.6-webapp-and-web-runner-performance.md)

## References

- [Issue #4197 — umbrella program tracker](https://github.com/Koniverse/SubWallet-Extension/issues/4197) — "Evaluate and update the performance of the extension"; indexes the performance sub-issues this epic absorbs.
- [Issue #4427 — lifecycle tracker](https://github.com/Koniverse/SubWallet-Extension/issues/4427) — "Improve SubWallet Lifecycle"; the phased core-architecture refactor materialized by US-20.1.
- [Source: PRD §Non-Functional Requirements NFR-8, NFR-12, NFR-17, NFR-20, NFR-21](../../PRD.md#non-functional-requirements)
- [Source: ARCHITECTURE AD-07, AD-08, AD-20, AD-23, AD-24, AD-25](../../ARCHITECTURE.md#architecture-decisions)
