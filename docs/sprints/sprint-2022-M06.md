---
id: sprint-2022-M06
status: closed
start: 2022-06-01
end: 2022-06-30
goal: "Reconstructed window — 2 story/stories shipped in releases 0.4.4, 0.4.7 (EPIC-12, EPIC-13). Derived from the CHANGELOG, not planned."
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
| US-12.1 | Native nomination staking (relay + parachains) | EPIC-12 | P1 | 5 | ✅ done | — | [link](stories/US-12.1-native-nomination-staking-relay-and-parachains.md) |
| US-13.1 | XCM cross-chain parachain transfers (fee estimation + per-route toggle) | EPIC-13 | P1 | 8 | ✅ done | — | [link](stories/US-13.1-xcm-parachain-transfers.md) |

**Releases in this window:** 0.4.4, 0.4.7 · **Points (retroactive):** 13

## Per-Epic Retrospective

_None — this window was reconstructed from git in 2026. No retrospective was held, and
inventing one would be fiction._
