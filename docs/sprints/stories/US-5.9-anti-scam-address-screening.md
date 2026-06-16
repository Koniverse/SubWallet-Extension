---
id: US-5.9
title: "Anti-scam address screening"
epic: EPIC-5
status: backlog
priority: P0
points: 5
sprint:
version_shipped:
prd_ref: [FR-62]
arch_ref: [AD-19]
depends_on: [US-5.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
external_deps: [merkle_science_api]
---

## Goal

When a user is about to send funds to a recipient address, that address is
screened against Merkle Science's scam / illicit-activity data and a risk verdict
is surfaced in the send flow — so that a user about to pay a known scam,
sanctioned, or fraud-associated address is warned *before* they sign the transfer.

## Background

Phishing-origin blocking ([US-5.1](US-5.1-phishing-site-and-address-protection.md))
and Blockaid transaction scanning ([US-5.8](US-5.8-blockaid-transaction-risk-scanning.md))
catch malicious *sites* and *EVM payloads*, but a large class of loss is a benign
payload sent to a **bad address**: a fake support agent, an address-poisoning
look-alike, or a sanctioned/fraud-associated wallet pasted by the user. **Merkle
Science** is an address-intelligence provider that classifies a recipient address
against scam / illicit-activity datasets; this story screens the recipient at
transfer time and surfaces the verdict in the send flow.

This is a **new, planned** capability (FR-62 — `📋 planned`). Merkle Science is a
keyed third-party provider, so per AD-19 it is reached through the SubWallet
backend proxy and its key never ships in the bundle ([NFR-16](../../PRD.md#non-functional-requirements)).
Unlike Blockaid (EVM payloads), address screening is **address-centric** and so
can apply across ecosystems where the provider has coverage. It must **degrade
gracefully**: an unreachable provider surfaces an "unable to screen" state and
lets the user proceed with explicit acknowledgement — it never silently labels an
unscreened address "clean". Because the same recipient is often reused, verdicts
are cached within a session to keep the send-flow responsive.

Materializes [FR-62](../../PRD.md#functional-requirements). This is a planned integration; it ships fresh
(not retroactive). It is a sibling of the Blockaid transaction screen
([US-5.8](US-5.8-blockaid-transaction-risk-scanning.md)) — both are inbound-threat
screens on the backend proxy.

Tracked by [#1481](https://github.com/Koniverse/SubWallet-Extension/issues/1481) —
Integrate Merkle Science's original API for anti-scam adresses, and
[#3410](https://github.com/Koniverse/SubWallet-Extension/issues/3410) — Integrate
Merkle Science API.

## Acceptance criteria

- [ ] **AC-1** — **Given** a recipient address entered in a transfer, **When** the
  send flow validates it, **Then** the address is screened against Merkle Science
  (via the backend proxy) and the risk verdict is surfaced before the user signs.
- [ ] **AC-2** — **Given** an address classified as scam / illicit, **When** it is
  shown, **Then** the send flow presents a prominent blocking-style warning and
  requires an explicit acknowledgement before the transfer can proceed (no
  one-tap send to a flagged address).
- [ ] **AC-3** — **Given** the Merkle Science proxy is unreachable or exceeds the
  latency budget, **When** screening is requested, **Then** the flow shows an
  "unable to screen" state and lets the user proceed with explicit
  acknowledgement (fail-open with disclosure) — it never silently labels an
  unscreened address "clean", and no provider API key is exposed in the client
  (AD-19, NFR-16).
- [ ] **AC-4** — **Given** a clean (non-flagged) recipient address, **When** it is
  screened, **Then** the send flow proceeds normally without a false-positive
  warning on a legitimate address.
- [ ] **AC-5** — **Given** the same recipient is used repeatedly within a session,
  **When** screening runs, **Then** the verdict is served from cache rather than
  re-querying on every keystroke / re-entry, keeping the send flow responsive.

## Tasks

- [ ] **TASK-5.9.1** — Backend-proxy Merkle Science client (AC: 1) — request/response types; key stays server-side (AD-19)
  - [ ] Wire the proxy call so no Merkle Science key is present in the extension bundle.
- [ ] **TASK-5.9.2** — Screen recipient address in the send-flow validation step + render verdict (AC: 1)
- [ ] **TASK-5.9.3** — Scam/illicit-verdict blocking warning + explicit-acknowledgement gate (AC: 2)
- [ ] **TASK-5.9.4** — Latency budget + fail-open-with-disclosure degradation (AC: 3) — "unable to screen" state, never silent-clean
- [ ] **TASK-5.9.5** — False-positive regression coverage on legitimate addresses (AC: 4)
- [ ] **TASK-5.9.6** — Per-session verdict cache to debounce repeated screening (AC: 5)

## Dev notes

### Architecture constraints

- [AD-19](../../ARCHITECTURE.md#architecture-decisions) — Merkle Science is a keyed provider; calls go through the SubWallet backend proxy so the key is never in the shipped bundle ([NFR-16](../../PRD.md#non-functional-requirements)).
- Screening is **address-centric** (not payload-centric like Blockaid), so it applies across ecosystems where the provider has coverage; out-of-coverage chains skip the screen cleanly.
- Degradation is **fail-open with disclosure**: never block the user indefinitely, never present an unscreened address as "clean".
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-5.1](US-5.1-phishing-site-and-address-protection.md) — reuses the backend-proxy client + fail-safe-degradation pattern.
- Sibling [US-5.8](US-5.8-blockaid-transaction-risk-scanning.md) — both are inbound-threat screens on the proxy; coordinate the shared proxy-client and graceful-degradation pattern. Address screening (this story) complements payload screening (US-5.8).
- Consumes the transfer/send surface owned by [EPIC-8](../epics/EPIC-8.md); the screen runs at recipient-validation time.

### Performance budget

- Screening runs on the send-flow recipient-validation path: it must not block input, must debounce/cache (AC-5), and must resolve or time-out within the budget then fall back per AC-3. Story PR must state the chosen p95 budget and that it is met.

### What we explicitly did NOT do

- No on-chain auto-block — the user is warned and must explicitly acknowledge; we do not unilaterally prevent a self-custodial user's transfer. Trigger to revisit: regulatory or product decision to hard-block.
- No screening of *own* / address-book entries beyond the active recipient. Trigger to revisit: address-book bulk-screening request.

### References

- [Source: PRD FR-62](../../PRD.md#functional-requirements) — anti-scam address screening (Merkle Science)
- [Source: PRD NFR-16](../../PRD.md#non-functional-requirements) — third-party API-key protection via backend proxy
- [Source: ARCHITECTURE AD-19](../../ARCHITECTURE.md#architecture-decisions) — backend proxy for third-party API keys
- [Source: US-5.1](US-5.1-phishing-site-and-address-protection.md) — backend-proxy client + fail-safe-degradation precedent
- [Roadmap: #1481](https://github.com/Koniverse/SubWallet-Extension/issues/1481) — Integrate Merkle Science's original API for anti-scam adresses
- [Roadmap: #3410](https://github.com/Koniverse/SubWallet-Extension/issues/3410) — Integrate Merkle Science API

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: enter a recipient in transfer → verdict surfaced before signing |
| AC-2 | Manual: enter a known scam address → blocking warning + acknowledgement required |
| AC-3 | Disable proxy reachability → "unable to screen" state; user proceeds with acknowledgement; grep bundle for Merkle key returns nothing |
| AC-4 | Manual: enter a clean address → send proceeds, no false-positive warning |
| AC-5 | Manual: re-enter the same recipient → verdict served from cache (no re-query per keystroke) |

## Changelog entry

### Added
- Anti-scam recipient-address screening via Merkle Science in the send flow,
  surfacing a risk verdict with a blocking warning + explicit acknowledgement for
  flagged addresses; provider proxied (key never shipped), with fail-open
  "unable to screen" degradation and per-session verdict caching.

**Commit**:

## Implementation notes

_Planned integration — not yet shipped. Fill `commit`, `version_shipped`, the
chosen latency budget, and provider/coverage caveats on delivery._

## Cross-references

- [PRD FR-62](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [US-5.1](US-5.1-phishing-site-and-address-protection.md), [US-5.8](US-5.8-blockaid-transaction-risk-scanning.md)
- [#1481](https://github.com/Koniverse/SubWallet-Extension/issues/1481)
- [#3410](https://github.com/Koniverse/SubWallet-Extension/issues/3410)
