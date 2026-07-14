---
id: sprint-2023-M03
status: closed
start: 2023-03-01
end: 2023-03-31
goal: "Reconstructed window — 8 story/stories shipped in release 1.0.1 (EPIC-2, EPIC-3, EPIC-4, EPIC-6, EPIC-12). Derived from the CHANGELOG, not planned."
---

> ## 🕰️ Reconstructed window — this was never a planned sprint
>
> SubWallet's sprint system began **2026-07** ([sprint-2026-W28](sprint-2026-W28.md)). The
> stories below shipped **years before it existed**. This file exists so that work past
> `backlog` is locatable in time, as the frontmatter spec requires — it is **not** a record
> of anything the team committed to.
>
> - **`goal` is derived, not planned** — read off the releases in the window, after the fact.
> - **Points are retroactive. Velocity here is meaningless — do not chart it.** The numbers
>   were assigned in 2026 by whoever wrote the story, not estimated by the team at the time.
> - **The authority for "when did this ship" is `version_shipped` + `commit`**, which
>   `git merge-base --is-ancestor` can prove. This file cannot. See
>   [CONTEXT D99](../CONTEXT.md).
>
> Month (`M`) cadence, not week (`W`) — a weekly bucket would imply a planning rhythm that
> never happened.

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-2.2 | ChainService — live API object per chain | EPIC-2 | P0 | 8 | ✅ done | — | [link](stories/US-2.2-chainservice-live-api-per-chain.md) |
| US-2.7 | RequestService approval queue | EPIC-2 | P0 | 8 | ✅ done | — | [link](stories/US-2.7-requestservice-approval-queue.md) |
| US-2.8 | Transaction lifecycle engine | EPIC-2 | P0 | 8 | ✅ done | — | [link](stories/US-2.8-transaction-lifecycle-engine.md) |
| US-3.4 | Export keys & multi-account management | EPIC-3 | P1 | 3 | ✅ done | — | [link](stories/US-3.4-export-keys-multi-account-management.md) |
| US-4.4 | Substrate parachain registry (200+) | EPIC-4 | P1 | 3 | ✅ done | — | [link](stories/US-4.4-substrate-parachain-registry.md) |
| US-4.12 | Token registry enable/disable | EPIC-4 | P1 | 2 | ✅ done | — | [link](stories/US-4.12-token-registry-enable-disable.md) |
| US-6.1 | Dark-only responsive UI: popup and full-page expand view | EPIC-6 | P2 | 3 | ✅ done | — | [link](stories/US-6.1-dark-only-responsive-popup-and-expand-view.md) |
| US-12.2 | Nomination pool staking | EPIC-12 | P1 | 3 | ✅ done | — | [link](stories/US-12.2-nomination-pool-staking.md) |

**Releases in this window:** 1.0.1 · **Points (retroactive):** 38

## Per-Epic Retrospective

_None — this window was reconstructed from git in 2026. No retrospective was held, and
inventing one would be fiction._
