---
id: US-4.20
title: "AI / DeFAI features"
epic: EPIC-4
status: in-progress
priority: P2
points: 8
sprint: sprint-2026-W28
version_shipped:
prd_ref: [FR-51]
arch_ref: [AD-24]
depends_on: [US-4.18]
assignee: saltict
commit:
created: 2026-06-12
updated: 2026-07-15
external_deps: [ai_provider, services_sdk_backend]
---

## Status refresh — 2026-07-15

> Synced from GitHub Projects board #2 ("SubWallet.App – Development"): issue #4158 is **Implementing** there, so this story moves `backlog` → `in-progress` (sprint `sprint-2026-W28`). Only status/sprint changed; Goal, AC and reasoning below are untouched. The board is the live source for workflow state.

## Goal

A user can drive wallet actions through an AI agent — AI-assisted swap, earn and
transfer, plus chain-abstraction UX that hides per-chain mechanics — so common
multi-chain operations become conversational/intent-driven rather than manual.

## Background

DeFAI (DeFi + AI) is the top of the chain-abstraction platform stack: once the
wallet abstracts chains uniformly ([US-4.18](US-4.18-chain-abstraction-sdk.md)) and
aggregates data through the backend Services SDK
([AD-24](../../ARCHITECTURE.md#architecture-decisions)), an AI agent can plan and
propose multi-chain operations (swap / earn / transfer) on the user's behalf, and a
chain-abstraction UX layer can resolve "do X with token Y" into the right chain,
route and standard without the user choosing networks manually. The agent only
*proposes* actions; execution still flows through the existing approval + signing
path so keys never leave the wallet boundary (AD-04, EPIC-2) and every action is
user-confirmed.

This story is **forward-looking** — FR-51 is `📋 planned`. It is intentionally the
last story in the epic's chain-abstraction pillar because it consumes the SDK
(US-4.18), the AA standards (US-4.19), swap (EPIC-11) and earning (EPIC-12). It
carries external dependencies on an AI provider (`ai_provider`) and the Services
SDK backend (`services_sdk_backend`).

Tracked by [#4158](https://github.com/Koniverse/SubWallet-Extension/issues/4158) —
Deploy AI-related features, [#4152](https://github.com/Koniverse/SubWallet-Extension/issues/4152)
— AI Agent Support, and
[#4153](https://github.com/Koniverse/SubWallet-Extension/issues/4153) — DeFAI feature:
Swap, Earning, Transfer,....

Materializes [FR-51](../../PRD.md#epic-4--chain-management).

## Acceptance criteria

- [ ] **AC-1** — **Given** the AI agent, **When** the user states an intent in
  natural language (e.g. "swap X for Y", "earn on Z"), **Then** the agent proposes a
  concrete plan (route, chain, fees) using the chain-abstraction SDK + Services SDK
  (AD-24).
- [ ] **AC-2** — **Given** a proposed AI plan, **When** the user reviews it,
  **Then** every action is shown explicitly and nothing executes until the user
  confirms through the normal approval/signing flow (keys never leave the wallet).
- [ ] **AC-3** — **Given** a chain-abstraction request, **When** the user does not
  specify a network, **Then** the UX resolves the appropriate chain/route/standard
  automatically and surfaces the choice for confirmation.
- [ ] **AC-4** — **Given** the AI provider or backend is unavailable, or the agent
  produces an unactionable/ambiguous plan, **When** the user invokes it, **Then** a
  clear fallback/error is shown and the user can proceed manually — the wallet's
  core flows are never blocked by AI unavailability.

## Tasks

- [ ] **TASK-4.20.1** — AI agent intent layer: NL intent → concrete plan via the chain-abstraction SDK + Services SDK (AC: 1)
- [ ] **TASK-4.20.2** — Plan-review surface: explicit action list, execution only through the existing approval/signing flow (AC: 2)
- [ ] **TASK-4.20.3** — Chain-abstraction UX: auto-resolve chain/route/standard from an under-specified request (AC: 3)
- [ ] **TASK-4.20.4** — AI-assisted swap / earn / transfer wiring (consume EPIC-11 / EPIC-12 surfaces) (AC: 1, 2)
- [ ] **TASK-4.20.5** — Provider/backend-unavailable + ambiguous-plan fallback to manual (AC: 4)

## Dev notes

### Architecture constraints

- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — AI plans are grounded in the backend Services SDK aggregation; the agent does not bypass it for multi-chain data.
- Keys never leave the wallet (AD-04, EPIC-2): the agent proposes, the user approves, the existing signing path executes — no autonomous signing.
- This story may introduce a new AD entry for the AI-agent/DeFAI architecture — append a CONTEXT decision at implementation time.

### Cross-story dependencies

- Builds on [US-4.18](US-4.18-chain-abstraction-sdk.md) — the SDK is the agent's execution substrate; and on [US-4.19](US-4.19-account-abstraction-standards.md) for intent/AA-backed actions.
- Consumes swap ([EPIC-11](../epics/EPIC-11.md)) and earning ([EPIC-12](../epics/EPIC-12.md)) for AI-assisted swap/earn.

### What we explicitly did NOT do

- No autonomous/unattended execution — every AI-proposed action is user-confirmed. Trigger to revisit: never (key-boundary + approval invariant).
- No on-device LLM in this story — uses an external AI provider via the backend; on-device is a separate future consideration.

### Dev notes — points

8 pts — an AI-agent + DeFAI feature spanning intent planning, chain-abstraction UX,
and AI-assisted swap/earn/transfer, with external dependencies on an AI provider
and the Services SDK backend — multi-system integration per SKILL §3a-bis (8), and
the `external_deps` flag guards against the common AI/partner undersizing trap.
Forward-looking (FR-51 planned).

### References

- [Source: PRD FR-51](../../PRD.md#epic-4--chain-management) — AI / DeFAI features (AI agent; AI-assisted swap/earn/transfer; chain-abstraction UX)
- [Source: ARCHITECTURE AD-24](../../ARCHITECTURE.md#architecture-decisions) — backend Services SDK for multi-chain data aggregation
- [Roadmap: #4158](https://github.com/Koniverse/SubWallet-Extension/issues/4158) — Deploy AI-related features
- [Roadmap: #4152](https://github.com/Koniverse/SubWallet-Extension/issues/4152) — AI Agent Support
- [Roadmap: #4153](https://github.com/Koniverse/SubWallet-Extension/issues/4153) — DeFAI feature: Swap, Earning, Transfer,...

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: state an NL intent → agent proposes a concrete plan |
| AC-2 | Manual: plan shows explicit actions; nothing executes pre-confirmation |
| AC-3 | Manual: under-specified request → chain/route auto-resolved + surfaced |
| AC-4 | Manual: block the AI provider/backend → fallback to manual, core flows unblocked |

## Changelog entry

### Added
- AI / DeFAI: an AI agent for AI-assisted swap / earn / transfer with chain-abstraction UX; all actions user-confirmed through the existing approval/signing flow.

**Commit**:

## Implementation notes

_Forward-looking (FR-51 planned). Fill on implementation._

## Cross-references

- [PRD FR-51](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.18](US-4.18-chain-abstraction-sdk.md) · [US-4.19](US-4.19-account-abstraction-standards.md) · [#4158](https://github.com/Koniverse/SubWallet-Extension/issues/4158) · [#4152](https://github.com/Koniverse/SubWallet-Extension/issues/4152) · [#4153](https://github.com/Koniverse/SubWallet-Extension/issues/4153)
