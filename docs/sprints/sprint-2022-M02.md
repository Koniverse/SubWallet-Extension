---
id: sprint-2022-M02
status: closed
start: 2022-02-01
end: 2022-02-28
goal: "Reconstructed window — the first work SubWallet actually did (0.2.2, 0.2.5): multi-chain balance detection and portfolio aggregation, receive, and the existential-deposit guard. 5 stories. Derived from the CHANGELOG, not planned."
---

> ## 🕰️ Reconstructed window — **the first month of SubWallet's own work**
>
> SubWallet's sprint system began **2026-07** ([sprint-2026-W28](sprint-2026-W28.md)). The
> stories below shipped **four years before it existed**. This file exists so that work past
> `backlog` is locatable in time, as the frontmatter spec requires — it is **not** a record
> of anything the team committed to.
>
> **What is here is what the team built.** The six capabilities it *inherited* — seed-phrase
> creation, derivation, `injectedWeb3`, dApp authorization, message signing, phishing
> protection — used to sit in this table, which read as though SubWallet shipped eleven
> stories in its first month. It shipped five. The inherited six moved to
> [sprint-2022-M01](sprint-2022-M01.md), the fork boundary ([CONTEXT D105](../CONTEXT.md)).
>
> What remains is the answer to *what did forking polkadot-js actually buy, and what did
> SubWallet have to build itself?* It had to build **multi-chain**: balance detection across
> chains, portfolio aggregation, the transferable-vs-locked split, and the existential-deposit
> guard. The fork gave it a **single-chain wallet**; the product is the multi-chain part.
>
> - **`goal` is derived, not planned** — read off the releases in the window, after the fact.
> - **Points are retroactive. Velocity here is meaningless — do not chart it.**
> - **The authority for "when did this ship" is `version_shipped` + `commit`**, which
>   `git merge-base --is-ancestor` can prove. This file cannot. See [CONTEXT D99](../CONTEXT.md).

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-2.5 | Balance detection & aggregation engine | EPIC-2 | P0 | 8 | ✅ done | — | [link](stories/US-2.5-balance-detection-and-aggregation-engine.md) |
| US-7.1 | Aggregate portfolio across accounts and chains | EPIC-7 | P1 | 5 | ✅ done | — | [link](stories/US-7.1-aggregate-portfolio-across-accounts-and-chains.md) |
| US-7.2 | Transferable vs locked/frozen balance calculation | EPIC-7 | P1 | 3 | ✅ done | — | [link](stories/US-7.2-transferable-vs-locked-balance-calculation.md) |
| US-8.2 | Receive (QR + copyable address) | EPIC-8 | P1 | 3 | ✅ done | — | [link](stories/US-8.2-receive-qr-and-copyable-address.md) |
| US-8.7 | Existential-deposit safety guard | EPIC-8 | P1 | 3 | ✅ done | — | [link](stories/US-8.7-existential-deposit-safety-guard.md) |

**Releases in this window:** 0.2.1, 0.2.2, 0.2.3, 0.2.5 — four, though only two are claimed
above. **0.2.1** (2022-02-10) is SubWallet's first release, and it shipped the *inherited*
capabilities: they are real, they reached a user this month, and they belong to
[sprint-2022-M01](sprint-2022-M01.md) because that is where the **work** happened.
**0.2.3** is claimed by no story — an unclosed gap, not a clean sheet.
· **Points (retroactive):** 22

## Per-Epic Retrospective

_None — this window was reconstructed from git in 2026. No retrospective was held, and
inventing one would be fiction._
