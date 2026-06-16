---
id: US-5.8
title: "Blockaid tx/signature risk scanning"
epic: EPIC-5
status: backlog
priority: P0
points: 5
sprint:
version_shipped:
prd_ref: [FR-61]
arch_ref: [AD-19]
depends_on: [US-5.1]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
external_deps: [blockaid_api]
---

## Goal

Before a user signs an EVM transaction or an off-chain signature request, the
payload is scanned by Blockaid and a risk verdict (e.g. malicious / warning /
benign) is surfaced in the confirmation UI — so that a user about to approve a
drainer transaction, a malicious `approve`, or a deceptive signature is warned
*at the moment of signing*, not after funds are gone.

## Background

Phishing-site blocking ([US-5.1](US-5.1-phishing-site-and-address-protection.md))
stops the user reaching a known-bad origin, but the highest-loss attacks today are
*transaction-level*: a legitimate-looking site presents a malicious `setApprovalForAll`,
an unlimited `approve`, or a `Permit` / `eth_signTypedData` signature that drains
assets. These cannot be caught by origin reputation alone — the payload itself must
be simulated and classified. **Blockaid** is a transaction- and signature-risk API
that returns a verdict for an EVM payload; this story integrates it into the EVM
confirmation flow so the verdict gates (or at least loudly warns before) signing.

This is a **new, planned** capability (FR-61 — `📋 planned`). Blockaid is a keyed
third-party provider, so per AD-19 it is reached through the SubWallet backend
proxy and its key never ships in the bundle ([NFR-16](../../PRD.md#non-functional-requirements)). Scanning is
**EVM-scoped** (the provider's coverage). It must **degrade gracefully**: a slow or
unreachable provider must not block the user from transacting indefinitely — the
flow surfaces an "unable to scan" state and lets the user proceed with an explicit
acknowledgement, rather than hard-failing or, worse, silently passing a payload as
safe. The scan adds latency on the confirmation path, so it runs against a budget
and shows a scanning state while in flight.

Materializes [FR-61](../../PRD.md#functional-requirements). This is a planned integration; it ships fresh
(not retroactive). It is a sibling of the Merkle Science address screen
([US-5.9](US-5.9-anti-scam-address-screening.md)) — both are inbound-threat screens
on the backend proxy.

Tracked by [#4661](https://github.com/Koniverse/SubWallet-Extension/issues/4661) —
Support blockaid for EVM transaction or signature request.

## Acceptance criteria

- [ ] **AC-1** — **Given** an EVM transaction in the confirmation UI, **When** the
  user is about to sign, **Then** the payload is scanned by Blockaid (via the
  backend proxy) and the risk verdict is shown before the user can approve.
- [ ] **AC-2** — **Given** an EVM off-chain signature request
  (`eth_signTypedData` / `personal_sign` / `Permit`), **When** it is presented,
  **Then** it is scanned and a risk verdict is surfaced (FR-61).
- [ ] **AC-3** — **Given** a payload classified as **malicious**, **When** it is
  shown, **Then** the confirmation UI presents a prominent blocking-style warning
  and requires an explicit acknowledgement before approval is possible (no
  one-click approve of a flagged payload).
- [ ] **AC-4** — **Given** the Blockaid proxy is unreachable or exceeds the
  latency budget, **When** a scan is requested, **Then** the flow shows an
  "unable to scan" state and lets the user proceed with explicit acknowledgement
  (fail-open with disclosure) — it never silently labels an unscanned payload
  "safe", and no provider API key is exposed in the client (AD-19, NFR-16).
- [ ] **AC-5** — **Given** a non-EVM transaction (Substrate / Bitcoin / TON /
  Cardano), **When** it is confirmed, **Then** the Blockaid scan is skipped
  cleanly (EVM-scoped) without error.

## Tasks

- [ ] **TASK-5.8.1** — Backend-proxy Blockaid client (AC: 1, 2) — request/response types; key stays server-side (AD-19)
  - [ ] Wire the proxy call so no Blockaid key is present in the extension bundle.
- [ ] **TASK-5.8.2** — Scan EVM transactions in the confirmation flow + render verdict (AC: 1)
- [ ] **TASK-5.8.3** — Scan EVM signature requests (`signTypedData` / `personal_sign` / `Permit`) (AC: 2)
- [ ] **TASK-5.8.4** — Malicious-verdict blocking warning + explicit-acknowledgement gate (AC: 3)
- [ ] **TASK-5.8.5** — Latency budget + fail-open-with-disclosure degradation (AC: 4) — "unable to scan" state, never silent-safe
- [ ] **TASK-5.8.6** — EVM-only scoping; clean skip for non-EVM payloads (AC: 5)

## Dev notes

### Architecture constraints

- [AD-19](../../ARCHITECTURE.md#architecture-decisions) — Blockaid is a keyed provider; calls go through the SubWallet backend proxy so the key is never in the shipped bundle ([NFR-16](../../PRD.md#non-functional-requirements)).
- Scanning is **EVM-scoped** — it integrates into the EVM confirmation path only; other ecosystems skip the scan.
- Degradation is **fail-open with disclosure**: the user is never blocked indefinitely, but an unscanned payload is never presented as "safe".
- This story does NOT introduce new AD entries.

### Cross-story dependencies

- Builds on [US-5.1](US-5.1-phishing-site-and-address-protection.md) — reuses the backend-proxy client + fail-safe-degradation pattern established for ChainPatrol.
- Sibling [US-5.9](US-5.9-anti-scam-address-screening.md) — both are inbound-threat screens on the proxy; coordinate the shared proxy-client and graceful-degradation pattern.
- Consumes the EVM confirmation surface owned by [EPIC-8](../epics/EPIC-8.md) / [EPIC-10](../epics/EPIC-10.md) (dApp request approval); the scan result is rendered alongside the existing confirmation.

### Performance budget

- Scan adds latency on the signing-confirmation hot path: the confirmation must show a scanning state and resolve or time-out within the budget, then fall back per AC-4. Story PR must state the chosen p95 budget and that it is met.

### What we explicitly did NOT do

- No non-EVM scanning — Blockaid coverage is EVM. Trigger to revisit: provider adds Substrate/Bitcoin coverage or a second provider fills the gap.
- No auto-reject of malicious payloads — the user is warned and must explicitly acknowledge; we do not unilaterally block a self-custodial user's transaction. Trigger to revisit: regulatory or product decision to hard-block.

### References

- [Source: PRD FR-61](../../PRD.md#functional-requirements) — Blockaid transaction & signature risk scanning (EVM)
- [Source: PRD NFR-16](../../PRD.md#non-functional-requirements) — third-party API-key protection via backend proxy
- [Source: ARCHITECTURE AD-19](../../ARCHITECTURE.md#architecture-decisions) — backend proxy for third-party API keys
- [Source: US-5.1](US-5.1-phishing-site-and-address-protection.md) — backend-proxy client + fail-safe-degradation precedent
- [Roadmap: #4661](https://github.com/Koniverse/SubWallet-Extension/issues/4661) — Support blockaid for EVM transaction or signature request

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Manual: submit an EVM tx → verdict shown before approve is enabled |
| AC-2 | Manual: trigger an `eth_signTypedData` request → verdict shown |
| AC-3 | Manual: scan a known-malicious payload → blocking warning + acknowledgement required |
| AC-4 | Disable proxy reachability → "unable to scan" state; user can proceed with acknowledgement; grep bundle for Blockaid key returns nothing |
| AC-5 | Manual: confirm a Substrate/BTC/TON/Cardano tx → no scan, no error |

## Changelog entry

### Added
- Blockaid risk scanning for EVM transactions and signature requests, surfaced in
  the confirmation UI with a blocking warning + explicit acknowledgement for
  malicious payloads; provider proxied (key never shipped) with fail-open
  "unable to scan" degradation and clean EVM-only scoping.

**Commit**:

## Implementation notes

_Planned integration — not yet shipped. Fill `commit`, `version_shipped`, the
chosen latency budget, and provider/coverage caveats on delivery._

## Cross-references

- [PRD FR-61](../../PRD.md#functional-requirements)
- [Epic EPIC-5](../epics/EPIC-5.md)
- [US-5.1](US-5.1-phishing-site-and-address-protection.md), [US-5.9](US-5.9-anti-scam-address-screening.md)
- [#4661](https://github.com/Koniverse/SubWallet-Extension/issues/4661)
