---
id: US-4.18
title: "Chain-abstraction SDK (developer-facing)"
epic: EPIC-4
status: backlog
priority: P2
points: 8
sprint:
version_shipped:
prd_ref: [FR-49]
arch_ref: [AD-02, AD-24]
depends_on: [US-4.4, US-4.5]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
external_deps: [services_sdk_backend]
---

## Goal

External dApp teams can build on SubWallet's multi-chain engine through a
developer-facing chain-abstraction SDK, so the same per-chain API-object model and
backend data aggregation the wallet uses internally become a reusable platform
rather than wallet-private code.

## Background

EPIC-4 absorbed the chain-abstraction roadmap because, once the wallet models many
chains uniformly behind `ChainService`
([AD-02](../../ARCHITECTURE.md#architecture-decisions)) and aggregates multi-chain
data through the backend Services SDK
([AD-24](../../ARCHITECTURE.md#architecture-decisions)), the natural next step is to
**package that capability for external developers**. This story ships a
developer-facing SDK that exposes chain discovery, balance/fee/asset reads, and
transaction-construction primitives across all supported ecosystems behind one
stable API, so an external dApp does not reimplement per-chain plumbing.

This is a **platform** story, not a single-ecosystem one: it abstracts over every
ecosystem this epic registers (Substrate / EVM / Bitcoin / TON / Cardano and the
roadmap chains), which is why it is larger and depends on the registry
([US-4.4](US-4.4-substrate-parachain-registry.md)) and at least one mature
ecosystem path ([US-4.5](US-4.5-evm-network-support.md)) being in place. It also
relies on the Services SDK backend (`services_sdk_backend`) for the aggregation
endpoints it surfaces.

This story is **forward-looking** — FR-49 is `📋 planned`.

Tracked by [#4191](https://github.com/Koniverse/SubWallet-Extension/issues/4191) —
Implementing Chain Abstraction, and
[#4338](https://github.com/Koniverse/SubWallet-Extension/issues/4338) — DeFAI and
Chain Abstraction to reduce the complexity of cross-chain operations.

Materializes [FR-49](../../PRD.md#epic-4--chain-management).

## Acceptance criteria

- [ ] **AC-1** — **Given** the published SDK package, **When** an external developer
  imports it, **Then** it exposes a stable, documented API for chain discovery and
  per-chain read operations (balances, fees, assets) across supported ecosystems
  (AD-02, AD-24).
- [ ] **AC-2** — **Given** the SDK, **When** a consumer requests a multi-chain
  operation (e.g. aggregated balances), **Then** it is served through the backend
  Services SDK aggregation layer (AD-24), not by re-implementing per-chain RPC in
  the consumer.
- [ ] **AC-3** — **Given** the SDK, **When** a consumer constructs a transaction for
  a supported ecosystem, **Then** the SDK returns an ecosystem-correct unsigned
  payload (signing stays with the consumer/wallet, keys never leave the wallet
  boundary).
- [ ] **AC-4** — **Given** an unsupported chain or a backend outage, **When** the
  SDK is called, **Then** it returns a typed, documented error rather than throwing
  an opaque failure.
- [ ] **AC-5** — The SDK ships with versioned public API documentation and a
  semantic-version contract, so consumers can pin a version.

## Tasks

- [ ] **TASK-4.18.1** — Define the public SDK surface (chain discovery + read ops + tx-build primitives) over `ChainService` (AC: 1, 3)
- [ ] **TASK-4.18.2** — Wire multi-chain reads through the backend Services SDK aggregation (AD-24) (AC: 2)
- [ ] **TASK-4.18.3** — Ecosystem-correct unsigned-payload construction; keep signing outside the SDK (AC: 3)
- [ ] **TASK-4.18.4** — Typed error model (unsupported chain, backend outage) (AC: 4)
- [ ] **TASK-4.18.5** — Versioned API docs + semver contract + published package (AC: 5)

## Dev notes

### Architecture constraints

- [AD-02](../../ARCHITECTURE.md#architecture-decisions) — the SDK abstracts over the per-chain API-object model; it does not bypass `ChainService`.
- [AD-24](../../ARCHITECTURE.md#architecture-decisions) — multi-chain aggregation is served by the backend Services SDK, not re-implemented client-side; the chain-abstraction SDK is a developer-facing surface on top.
- Keys never cross the wallet boundary — the SDK constructs unsigned payloads only (consistent with AD-04, owned by EPIC-2/keyring).
- This is a platform story; if it introduces a new public-API decision, append a CONTEXT entry at implementation time.

### Cross-story dependencies

- Builds on [US-4.4](US-4.4-substrate-parachain-registry.md) (registry/discovery) and [US-4.5](US-4.5-evm-network-support.md) (a mature ecosystem path to abstract over).
- Related to [US-4.19](US-4.19-account-abstraction-standards.md) and [US-4.20](US-4.20-ai-defai-features.md) — both can consume this SDK as their lower layer.

### What we explicitly did NOT do

- No in-SDK signing or key custody — signing stays in the wallet/consumer. Trigger to revisit: never (key-boundary invariant).
- No bespoke per-partner endpoints — the SDK is one stable surface; partner-specific needs go through the same versioned API.

### Dev notes — points

8 pts — a developer-facing chain-abstraction SDK: a multi-system platform
deliverable abstracting over every ecosystem plus the backend aggregation layer,
with a public API + versioning + docs. Per SKILL §3a-bis this is multi-system
integration (8); it also carries an external dependency on the Services SDK backend
(`external_deps`), a common undersizing trap. Forward-looking (FR-49 planned).

### References

- [Source: PRD FR-49](../../PRD.md#epic-4--chain-management) — chain-abstraction SDK for external dApp teams
- [Source: ARCHITECTURE AD-02](../../ARCHITECTURE.md#architecture-decisions) — ChainService per-chain API objects
- [Source: ARCHITECTURE AD-24](../../ARCHITECTURE.md#architecture-decisions) — backend Services SDK for multi-chain data aggregation
- [Roadmap: #4191](https://github.com/Koniverse/SubWallet-Extension/issues/4191) — Implementing Chain Abstraction
- [Roadmap: #4338](https://github.com/Koniverse/SubWallet-Extension/issues/4338) — DeFAI and Chain Abstraction to reduce the complexity of cross-chain operations

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Consumer test: SDK exposes chain discovery + read ops across ≥2 ecosystems |
| AC-2 | Consumer test: aggregated balances served via the Services SDK backend |
| AC-3 | Consumer test: tx-build returns an ecosystem-correct unsigned payload; no key access |
| AC-4 | Consumer test: unsupported chain / backend outage → typed error |
| AC-5 | Manual: published package has versioned API docs + semver tag |

## Changelog entry

### Added
- Developer-facing chain-abstraction SDK exposing multi-chain discovery, reads and unsigned-tx construction over `ChainService` + the backend Services SDK.

**Commit**:

## Implementation notes

_Forward-looking (FR-49 planned). Fill on implementation._

## Cross-references

- [PRD FR-49](../../PRD.md#epic-4--chain-management) · [Epic EPIC-4](../epics/EPIC-4.md) · [US-4.19](US-4.19-account-abstraction-standards.md) · [US-4.20](US-4.20-ai-defai-features.md) · [#4191](https://github.com/Koniverse/SubWallet-Extension/issues/4191) · [#4338](https://github.com/Koniverse/SubWallet-Extension/issues/4338)
