---
id: sprint-2026-W31
status: closed
start: 2026-07-27
end: 2026-08-02
goal: "Land the in-flight platform work — EPIC-4 network & RPC hardening (Asset Hub, endpoints, Bitcoin API, Midnight & Flow), OpenGov Phase 2, additional hardware wallets, the dApp createTransaction API, request-economy & submit performance, and the security audit."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-1.4 | Online i18n hot-update (runtime remote translations) | EPIC-1 | P0 | 3 | ready | new | [link](stories/US-1.4-online-i18n-hot-update.md) |
| US-1.5 | Build, CI, packaging & supply-chain hardening | EPIC-1 | P2 | 8 | ready | new | [link](stories/US-1.5-build-ci-and-cross-browser-packaging-hardening.md) |
| US-4.14 | Midnight network support | EPIC-4 | P1 | 5 | in-progress | new | [link](stories/US-4.14-midnight-network-support.md) |
| US-4.15 | Flow network support (Cadence & EVM) | EPIC-4 | P1 | 5 | in-progress | new | [link](stories/US-4.15-flow-network-support.md) |
| US-4.19 | Account-abstraction standards (ERC-4337 / EIP-7702 / EIP-7683) | EPIC-4 | P2 | 8 | in-progress | new | [link](stories/US-4.19-account-abstraction-standards.md) |
| US-4.20 | AI / DeFAI features | EPIC-4 | P2 | 8 | in-progress | new | [link](stories/US-4.20-ai-defai-features.md) |
| US-4.21 | Asset Hub migration hardening | EPIC-4 | P1 | 3 | review | → W33 | [link](stories/US-4.21-asset-hub-migration-hardening.md) |
| US-4.22 | RPC & endpoint-management hardening | EPIC-4 | P1 | 3 | review | → W33 | [link](stories/US-4.22-rpc-and-endpoint-management-hardening.md) |
| US-4.23 | Bitcoin-API path hardening | EPIC-4 | P1 | 3 | review | → W33 | [link](stories/US-4.23-bitcoin-api-path-hardening.md) |
| US-5.10 | Security audit & remediation hardening | EPIC-5 | P1 | 5 | in-progress | → W33 | [link](stories/US-5.10-verichains-audit-remediation-hardening.md) |
| US-8.12 | Fee/BigInt & gas-estimation hardening | EPIC-8 | P1 | 5 | ready | new | [link](stories/US-8.12-fee-bigint-and-gas-estimation-hardening.md) |
| US-10.9 | dApp createTransaction API (RFC #6213) | EPIC-10 | P1 | 3 | review | new | [link](stories/US-10.9-dapp-createtransaction-api-rfc-6213.md) |
| US-10.11 | WalletConnect session & dashboard hardening | EPIC-10 | P1 | 3 | in-progress | → W33 | [link](stories/US-10.11-walletconnect-session-and-dashboard-hardening.md) |
| US-12.11 | Trusted Stake (alpha index) | EPIC-12 | P3 | 5 | review | → W33 | [link](stories/US-12.11-trusted-stake-alpha-index.md) |
| US-13.11 | XCM & bridge reliability hardening (runtime-upgrade & ParaSpell-version) | EPIC-13 | P2 | 5 | in-progress | → W33 | [link](stories/US-13.11-xcm-runtime-upgrade-paraspell-version-hardening.md) |
| US-15.4 | OpenGov Phase 2: delegation & tracks | EPIC-15 | P2 | 5 | in-progress | new | [link](stories/US-15.4-opengov-delegation-and-governance-tracks.md) |
| US-16.3 | Additional hardware wallets (Trezor, Tangem, D'Cent, Keystone 3 Pro) | EPIC-16 | P3 | 8 | ready | new | [link](stories/US-16.3-additional-hardware-wallets.md) |
| US-19.9 | Notification reliability & spam control (improvement on US-19.8) | EPIC-19 | P3 | 1 | in-progress | new | [link](stories/US-19.9-notification-reliability-and-spam-control.md) |
| US-20.2 | Request economy — in-flight dedup, app-wide cap, notification-fetch flood | EPIC-20 | P1 | 5 | in-progress | new | [link](stories/US-20.2-api-call-optimization.md) |
| US-20.4 | Many-account submit performance | EPIC-20 | P1 | 5 | review | → W33 | [link](stories/US-20.4-many-account-submit-performance.md) |

**20 stories · 96 points.** The active product-development sprint (weekly cadence, following W30). EPIC-4's network & RPC hardening cluster is the bulk; the remaining stories span onboarding/build (EPIC-1), dApp (EPIC-10), earning (EPIC-12), XCM (EPIC-13), governance (EPIC-15), hardware (EPIC-16), performance (EPIC-20), notifications (EPIC-19) and security (EPIC-5).

## Closed

> **Closed retroactively on 2026-08-10.** The window ended 2026-08-02; the GitHub Projects
> board (#2) has since advanced two iterations, and its live iteration is now `Week 32 - 2026`
> = [sprint-2026-W33](sprint-2026-W33.md). A sprint cannot stay `in-progress` a week after the
> board stopped pointing at it.
>
> **8 of the 20 stories carried to [W33](sprint-2026-W33.md)** — marked `→ W33` in the Carry
> column. Each was moved on board evidence, not on a guess: an anchor issue of that story sits
> in the board's live iteration. #4451 (US-4.21 / US-4.22 / US-4.23), #4889 (US-5.10),
> #4995 (US-10.11), #4946 (US-12.11), #4424 (US-13.11), #4984 (US-20.4).
>
> **The other 12 did not carry, and were not reassigned.** No anchor of theirs appears in the
> board's live iteration — their issues sit at `In Backlog`, `Follow Up`, `Researching` or
> `Require BA Docs / Design` with **no** `Week` value at all. They keep `sprint: sprint-2026-W31`
> so the record of what W31 scoped survives; their `status` is untouched, so STATUS.md still
> shows them as `ready` / `in-progress` / `review`. **This is a record of unfinished scope, not
> a claim that the work stopped** — deciding where those 12 belong is a planning call this sync
> did not make. See [notes/2026-08-10.md §D](../notes/2026-08-10.md).
