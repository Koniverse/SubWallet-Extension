---
id: US-1.3
title: "Online chain-list hot-update (release-free network/token/XCM delivery)"
epic: EPIC-1
status: backlog
priority: P0
points: 5
sprint:
version_shipped:
prd_ref: [FR-3]
arch_ref: [AD-25, AD-09]
depends_on: [US-1.2]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Deliver chain definitions — networks, tokens, logos and per-route XCM toggles —
from an online channel so the team can add a chain or disable a route **without
shipping a new extension release**, with a bundled fallback when the channel is
unreachable. This is the mechanism that lets the product respond to a new
parachain launch or a partner-chain incident in hours instead of a store-review
cycle.

## Background

Chain definitions live in `@subwallet/chain-list` (an external monorepo package);
the extension bundles a baseline copy and **auto-updates it online** to add new
chains, tokens and logos without a code release. The online copy is fronted by
SubWallet's cache / CDN proxy layer
([AD-25](../../ARCHITECTURE.md#architecture-decisions)): the `static-data` /
`static-cache` endpoints serve the chain-list and token/asset metadata with a
bundled JSON fallback, so an update is release-free and a fetch failure degrades
to the shipped baseline rather than breaking the wallet.

The same channel carries the **per-chain XCM route toggle**
([AD-09](../../ARCHITECTURE.md#architecture-decisions), NFR-15): individual XCM
route pairs can be disabled at runtime without a code release, which is what lets
the team respond to a partner-chain security incident (e.g. the Acala 2022
incident, issue #667) inside hours. This story owns only the *delivery mechanism*
for that toggle; the XCM transfer feature itself is owned by
[EPIC-13](../epics/EPIC-13.md), and the chain-management network registry / token
auto-update *feature* (FR-34) is owned by [EPIC-4](../epics/EPIC-4.md).

Materializes [FR-3](../../PRD.md#functional-requirements). This story is **retroactive** — online
chain-list hot-update already ships in the product; `commit` / `version_shipped`
are backfilled during version reconciliation. Builds on the monorepo and shared
`extension-base` from [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md).

## Acceptance criteria

- [ ] **AC-1** — **Given** a published chain-list update on the `static-data`
  channel, **When** the background refreshes, **Then** new networks / tokens /
  logos become available **without an extension release** (AD-25).
- [ ] **AC-2** — **Given** the online channel is unreachable, **When** the
  chain-list is needed, **Then** the wallet falls back to the **bundled
  `@subwallet/chain-list` baseline JSON** and remains usable (AD-25 fallback) —
  the network-failure unhappy path.
- [ ] **AC-3** — **Given** a per-chain XCM route disabled in the online
  chain-list, **When** the update is applied at runtime, **Then** that route is
  toggled off **without a code release** (AD-09, NFR-15).
- [ ] **AC-4** — **Given** a fetched chain-list payload, **When** it is applied,
  **Then** it is merged/validated before use so a malformed remote payload cannot
  corrupt the active network state (it falls back to the prior/baseline data).

## Tasks

- [ ] **TASK-1.3.1** — Wire the online chain-list fetch against the static-data channel (AC: 1)
  - [ ] Fetch + merge the `@subwallet/chain-list` update from `static-data` / `static-cache` (AD-25); refresh networks/tokens/logos in `extension-base`.
- [ ] **TASK-1.3.2** — Bundled-JSON fallback on fetch failure (AC: 2, 4)
  - [ ] On unreachable/malformed remote, fall back to the bundled `@subwallet/chain-list` baseline; validate payload before applying.
- [ ] **TASK-1.3.3** — Apply per-route XCM toggles from the channel (AC: 3)
  - [ ] Honor per-chain-pair XCM route enable/disable flags from the online chain-list at runtime (AD-09, NFR-15).
- [ ] **TASK-1.3.4** — Refresh cadence + cache (AC: 1)
  - [ ] Schedule/refresh the online update (cron/lifecycle hook) and cache the result for offline wakes.

## Dev notes

### Architecture constraints

- [AD-25](../../ARCHITECTURE.md#architecture-decisions) — chain-list + token/asset metadata served via the `static-data` / `static-cache` proxy with bundled JSON fallback. Only the static-data / chain-list slice of AD-25 is owned here; `api-cache` / `ipfs-files` slices belong to the engine epics.
- [AD-09](../../ARCHITECTURE.md#architecture-decisions) — per-chain XCM route toggle delivered release-free through this channel. This story owns delivery, not the XCM transfer feature ([EPIC-13](../epics/EPIC-13.md)).
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md) — fetch/merge logic lives in the shared `@subwallet/extension-base` core.
- Required by [EPIC-4](../epics/EPIC-4.md) (FR-34 chain auto-update feature) and [EPIC-13](../epics/EPIC-13.md) (per-route XCM toggle consumption) — both consume this delivery mechanism.
- Sibling [US-1.4](US-1.4-online-i18n-hot-update.md) — both ride the same AD-25 static-data hot-update pattern with bundled fallback; coordinate the fetch/fallback helper.

### References

- [Source: PRD FR-3](../../PRD.md#functional-requirements) — online chain-list hot-update
- [Source: PRD NFR-15](../../PRD.md#non-functional-requirements) — per-chain XCM route toggle (release-free)
- [Source: PRD NFR-21](../../PRD.md#non-functional-requirements) — data cache & CDN proxy layer (static-data / chain-list)
- [Source: ARCHITECTURE §Cross-chain support](../../ARCHITECTURE.md)
- [Source: ARCHITECTURE AD-25, AD-09](../../ARCHITECTURE.md#architecture-decisions) — issue #667 (Acala XCM incident)

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Publish a chain-list delta to the `static-data` channel; trigger refresh → new network/token appears without rebuilding the extension |
| AC-2 | Block the `static-data` host; reload → wallet still lists chains from the bundled `@subwallet/chain-list` baseline |
| AC-3 | Disable an XCM route in the online chain-list; confirm the route is unavailable at runtime with no code change |
| AC-4 | Serve a malformed chain-list payload; confirm it is rejected/validated and the prior/baseline data stays active |

## Changelog entry

### Added
- Online chain-list hot-update: fetch + merge networks / tokens / logos from the `static-data` channel without an extension release, with a bundled `@subwallet/chain-list` JSON fallback.
- Release-free per-chain XCM route toggle applied from the online chain-list at runtime.

**Commit**:

## Implementation notes

_Retroactive story — capability already shipped. Fill `commit`, `version_shipped`
and any refresh-cadence / validation caveats during version reconciliation._

## Cross-references

- [PRD FR-3](../../PRD.md#functional-requirements)
- [Epic EPIC-1](../epics/EPIC-1.md)
- [ARCHITECTURE AD-25 / AD-09](../../ARCHITECTURE.md#architecture-decisions)
- [US-1.2](US-1.2-yarn-3-monorepo-shared-across-extension-web-mobile.md)
- [US-1.4](US-1.4-online-i18n-hot-update.md)
