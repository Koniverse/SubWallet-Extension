---
id: sprint-2022-M02
status: closed
start: 2022-02-01
end: 2022-02-28
goal: "Reconstructed window — 7 story/stories shipped in releases 0.2.1, 0.2.2, 0.2.5 (EPIC-2, EPIC-3, EPIC-7, EPIC-8, EPIC-10). Derived from the CHANGELOG, not planned."
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
| US-2.5 | Balance detection & aggregation engine | EPIC-2 | P0 | 8 | ✅ done | — | [link](stories/US-2.5-balance-detection-and-aggregation-engine.md) |
| US-3.1 | Create a new wallet via seed phrase | EPIC-3 | P0 | 3 | ✅ done | — | [link](stories/US-3.1-create-a-new-wallet-via-seed-phrase.md) |
| US-7.1 | Aggregate portfolio across accounts and chains | EPIC-7 | P1 | 5 | ✅ done | — | [link](stories/US-7.1-aggregate-portfolio-across-accounts-and-chains.md) |
| US-7.2 | Transferable vs locked/frozen balance calculation | EPIC-7 | P1 | 3 | ✅ done | — | [link](stories/US-7.2-transferable-vs-locked-balance-calculation.md) |
| US-8.2 | Receive (QR + copyable address) | EPIC-8 | P1 | 3 | ✅ done | — | [link](stories/US-8.2-receive-qr-and-copyable-address.md) |
| US-8.7 | Existential-deposit safety guard | EPIC-8 | P1 | 3 | ✅ done | — | [link](stories/US-8.7-existential-deposit-safety-guard.md) |
| US-10.2 | Substrate inject API (injectedWeb3) | EPIC-10 | P1 | 5 | ✅ done | — | [link](stories/US-10.2-substrate-inject-api-injectedweb3.md) |

**Releases in this window:** 0.2.1, 0.2.2, 0.2.5 · **Points (retroactive):** 30

## Per-Epic Retrospective

_None — this window was reconstructed from git in 2026. No retrospective was held, and
inventing one would be fiction._
