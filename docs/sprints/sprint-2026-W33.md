---
id: sprint-2026-W33
status: in-progress
start: 2026-08-10
end: 2026-08-16
goal: "The live window. Land the EPIC-4 Bitcoin-API / RPC / Asset-Hub hardening cluster (#4451), the WalletConnect and submit-performance fixes in review (#4995, #4984), Trusted Stake (#4946), ParaSpell-version XCM hardening (#4424) and the two open security findings (#4889) — the eight stories the GitHub board carried forward from W31 — plus QC on the Gavun's Grid Miner dApp listing (#5050)."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-4.21 | Asset Hub migration hardening | EPIC-4 | P1 | 3 | review | ← W31 | [link](stories/US-4.21-asset-hub-migration-hardening.md) |
| US-4.22 | RPC & endpoint-management hardening | EPIC-4 | P1 | 3 | review | ← W31 | [link](stories/US-4.22-rpc-and-endpoint-management-hardening.md) |
| US-4.23 | Bitcoin-API path hardening | EPIC-4 | P1 | 3 | review | ← W31 | [link](stories/US-4.23-bitcoin-api-path-hardening.md) |
| US-5.10 | Security audit & remediation hardening | EPIC-5 | P1 | 5 | in-progress | ← W31 | [link](stories/US-5.10-verichains-audit-remediation-hardening.md) |
| US-10.11 | WalletConnect session & dashboard hardening | EPIC-10 | P1 | 3 | in-progress | ← W31 | [link](stories/US-10.11-walletconnect-session-and-dashboard-hardening.md) |
| US-12.11 | Trusted Stake (alpha index) | EPIC-12 | P3 | 5 | review | ← W31 | [link](stories/US-12.11-trusted-stake-alpha-index.md) |
| US-13.11 | XCM & bridge reliability hardening (runtime-upgrade & ParaSpell-version) | EPIC-13 | P2 | 5 | in-progress | ← W31 | [link](stories/US-13.11-xcm-runtime-upgrade-paraspell-version-hardening.md) |
| US-20.4 | Many-account submit performance | EPIC-20 | P1 | 5 | review | ← W31 | [link](stories/US-20.4-many-account-submit-performance.md) |
| US-42.13 | QC — Gavun's Grid Miner dApp added to SubWallet dApp list (#5050) | EPIC-42 | P3 | 3 | done | new | [link](stories/US-42.13-qc-issue-5050-gavuns-grid-miner-dapp.md) |

**9 stories · 35 points.** Eight carried from [W31](sprint-2026-W31.md) on board evidence
(below) and one new QC story. Four are in `review` and could close this week.

## Why these nine — the board, issue by issue

The GitHub Projects board (**SubWallet.App - Development**, project #2) has a `Week` iteration
field. Its **live iteration on 2026-08-10 is `Week 32 - 2026`, 2026-08-10 → 08-16** — this
window. (The board numbers its weeks **one behind ISO**; the docs use ISO. The *dates* match
one-for-one — board `Week 27 - 2026` starts 2026-07-06, exactly
[sprint-2026-W28](sprint-2026-W28.md). See [notes/2026-08-10.md §D](../notes/2026-08-10.md).)

Each carried story has an anchor issue in that live iteration:

| Board issue | Board status | Story | Why this story owns it |
| --- | --- | --- | --- |
| [#4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451) Bitcoin API Optimization | In Review | US-4.21, US-4.22, US-4.23 | All three derive their `review` status from this one issue — each carries the same board-sync note |
| [#4889](https://github.com/Koniverse/SubWallet-Extension/issues/4889) Phishing Detection screen on common websites | Follow Up | US-5.10 | Named by US-5.10's AC-4 |
| [#4995](https://github.com/Koniverse/SubWallet-Extension/issues/4995) EVM tx from dApp fails with misleading error | In Review | US-10.11 | Board-sync note; US-10.17 only carries it as a ledger row |
| [#4946](https://github.com/Koniverse/SubWallet-Extension/issues/4946) Auto-Rebalancing Index Strategies (Bittensor) | In Review | US-12.11 | US-12.11 is the parent of #4946; US-12.6 only cross-references it |
| [#4424](https://github.com/Koniverse/SubWallet-Extension/issues/4424) Critical Across update | Follow Up | US-13.11 | Board-sync note; US-13.5 / US-13.14 mention it in prose only |
| [#4984](https://github.com/Koniverse/SubWallet-Extension/issues/4984) Performance when submitting with many accounts | In Review | US-20.4 | Board-sync note |

> The board's live iteration holds **50 items — 29 of them Extension issues**. Only the six
> above resolve to a W31 story unambiguously. The rest either belong to `done` or `backlog`
> stories outside this sprint's scope, or map to several stories at once, and **no story was
> moved on an ambiguous mapping**. Four current-week Extension issues
> — [#1677](https://github.com/Koniverse/SubWallet-Extension/issues/1677) (Multisig),
> [#4567](https://github.com/Koniverse/SubWallet-Extension/issues/4567) (swap To-token filter),
> [#4791](https://github.com/Koniverse/SubWallet-Extension/issues/4791) (swap path algorithm),
> [#5051](https://github.com/Koniverse/SubWallet-Extension/issues/5051) (ParaSpell API v2) —
> are cited by **no story at all**. That is a coverage gap, recorded in
> [notes/2026-08-10.md §D](../notes/2026-08-10.md), not something this file invents a story for.

### One board/docs disagreement, left standing

[#4980](https://github.com/Koniverse/SubWallet-Extension/issues/4980) (*Recheck Ledger signing
on Bittensor*) is `Ready to build` in the board's live iteration, but
[US-16.4](stories/US-16.4-ledger-network-and-app-coverage.md) already records it `✅ done`.
One of the two is wrong. Not resolved here — flagged.
