---
id: sprint-2022-M02
status: closed
start: 2022-02-01
end: 2022-02-28
goal: "Reconstructed window — SubWallet's first releases (0.2.1, 0.2.2, 0.2.5). 11 stories, incl. capabilities inherited from the polkadot-js fork. Derived from the CHANGELOG, not planned."
---

> ## 🕰️ Reconstructed window — **SubWallet's first month**, and this was never a planned sprint
>
> SubWallet's sprint system began **2026-07** ([sprint-2026-W28](sprint-2026-W28.md)). The
> stories below shipped **four years before it existed**. This file exists so that work past
> `backlog` is locatable in time, as the frontmatter spec requires — it is **not** a record
> of anything the team committed to.
>
> **This is the earliest window in the project, and that is now correct.** Four stories used
> to sit in windows dated **2019–2021** — before SubWallet existed — because their
> `version_shipped` pointed at **polkadot-js** releases inherited with the fork
> (`0.14.1`, `0.24.1`, `0.35.1`, `0.36.1`). Those capabilities reached a *SubWallet* user in
> **0.2.1**, and now say so ([CONTEXT D101](../CONTEXT.md), [LESSONS §66](../LESSONS.md)).
> Upstream provenance — author, release, commit — is recorded in each story.
>
> - **`goal` is derived, not planned** — read off the releases in the window, after the fact.
> - **Points are retroactive. Velocity here is meaningless — do not chart it.**
> - **The authority for "when did this ship" is `version_shipped` + `commit`**, which
>   `git merge-base --is-ancestor` can prove. This file cannot. See [CONTEXT D99](../CONTEXT.md).

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-2.5 | Balance detection & aggregation engine | EPIC-2 | P0 | 8 | ✅ done | — | [link](stories/US-2.5-balance-detection-and-aggregation-engine.md) |
| US-3.1 | Create a new wallet via seed phrase | EPIC-3 | P0 | 3 | ✅ done | — | [link](stories/US-3.1-create-a-new-wallet-via-seed-phrase.md) |
| US-3.7 | Account derivation: custom path & child accounts | EPIC-3 | P2 | 3 | ✅ done | — | [link](stories/US-3.7-account-derivation-custom-path-child-accounts.md) |
| US-5.1 | Phishing site & address protection | EPIC-5 | P0 | 5 | ✅ done | — | [link](stories/US-5.1-phishing-site-and-address-protection.md) |
| US-7.1 | Aggregate portfolio across accounts and chains | EPIC-7 | P1 | 5 | ✅ done | — | [link](stories/US-7.1-aggregate-portfolio-across-accounts-and-chains.md) |
| US-7.2 | Transferable vs locked/frozen balance calculation | EPIC-7 | P1 | 3 | ✅ done | — | [link](stories/US-7.2-transferable-vs-locked-balance-calculation.md) |
| US-8.2 | Receive (QR + copyable address) | EPIC-8 | P1 | 3 | ✅ done | — | [link](stories/US-8.2-receive-qr-and-copyable-address.md) |
| US-8.7 | Existential-deposit safety guard | EPIC-8 | P1 | 3 | ✅ done | — | [link](stories/US-8.7-existential-deposit-safety-guard.md) |
| US-10.2 | Substrate inject API (injectedWeb3) | EPIC-10 | P1 | 5 | ✅ done | — | [link](stories/US-10.2-substrate-inject-api-injectedweb3.md) |
| US-10.7 | dApp authorization UI (per-origin) | EPIC-10 | P1 | 3 | ✅ done | — | [link](stories/US-10.7-dapp-authorization-ui-per-origin.md) |
| US-10.8 | Arbitrary message signing | EPIC-10 | P1 | 3 | ✅ done | — | [link](stories/US-10.8-arbitrary-message-signing.md) |

**Releases in this window:** 0.2.1, 0.2.2, 0.2.5 · **Points (retroactive):** 44

## Per-Epic Retrospective

_None — this window was reconstructed from git in 2026. No retrospective was held, and
inventing one would be fiction._
