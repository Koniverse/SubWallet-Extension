---
id: sprint-2022-M01
status: closed
start: 2019-05-20
end: 2022-01-11
goal: "Inheritance boundary — the polkadot-js capabilities SubWallet forked. No work by this team: the 6 stories here were built upstream over 32 months and reached a SubWallet user in 0.2.1."
---

> ## 🧬 This is not a sprint. It is the inheritance boundary.
>
> **No SubWallet engineer worked in this window.** The repository's first commit is
> **2019-05-20** — *"Initial commit aka code from heaven"*, by Jaco Greeff, on
> **polkadot-js/extension**. SubWallet's first commit is **2022-01-12**. Everything
> between those two dates is code the team **inherited**, not code it wrote.
>
> The six stories below are that inheritance: seed-phrase wallet creation, account
> derivation, the `injectedWeb3` dApp API, per-origin authorization, arbitrary message
> signing, and phishing protection. They are the polkadot-js extension. They existed
> before line one of SubWallet.
>
> ### Why `sprint` and `version_shipped` disagree here — and must
>
> These stories say `sprint: sprint-2022-M01` and `version_shipped: 0.2.1`, and **0.2.1
> shipped 2022-02-10 — a month *after* this window closes.** That is not an error. The two
> fields answer **different questions**, and for inherited code the answers are **three years
> apart**:
>
> | Field | Question | Answer here |
> | --- | --- | --- |
> | `sprint` | *When was the work done?* | **2019-05 → 2022-01, upstream** — this window |
> | `version_shipped` | *When did a **SubWallet** user get it?* | **0.2.1** (2022-02-10) — [D101](../CONTEXT.md) |
>
> For every other story in this project the two collapse into the same month, and the
> distinction is invisible. Here it is the whole point. Do not "fix" the gap by moving these
> into February — that would re-assert that the team built them, which is the claim this
> window exists to retract ([CONTEXT D105](../CONTEXT.md)).
>
> ### Read nothing else into this file
>
> - **The window is 32 months long.** Its `id` names the month it *ends* — January 2022, when
>   the team took the wheel. It is the earliest window on the board, and it is the only one
>   that is not a month.
> - **Points here are not velocity — they are not even work.** 22 points that this team never
>   spent. **Never chart this window.** Never sum it with another.
> - **Upstream provenance** — author, upstream release, upstream commit — is recorded in each
>   story's notes. A semver field cannot carry it ([D101](../CONTEXT.md)); prose can.
> - **`0.2.1` collides.** polkadot-js also released a `0.2.1`, in **2019-07-12**. Six version
>   numbers do ([LESSONS §66](../LESSONS.md)). Resolving `version → date` from the CHANGELOG
>   takes the **newest** match, which is why these stories date to 2022, not 2019.

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-3.1 | Create a new wallet via seed phrase | EPIC-3 | P0 | 3 | ✅ done | — | [link](stories/US-3.1-create-a-new-wallet-via-seed-phrase.md) |
| US-3.7 | Account derivation: custom path & child accounts | EPIC-3 | P2 | 3 | ✅ done | — | [link](stories/US-3.7-account-derivation-custom-path-child-accounts.md) |
| US-5.1 | Phishing site & address protection | EPIC-5 | P0 | 5 | ✅ done | — | [link](stories/US-5.1-phishing-site-and-address-protection.md) |
| US-10.2 | Substrate inject API (injectedWeb3) | EPIC-10 | P1 | 5 | ✅ done | — | [link](stories/US-10.2-substrate-inject-api-injectedweb3.md) |
| US-10.7 | dApp authorization UI (per-origin) | EPIC-10 | P1 | 3 | ✅ done | — | [link](stories/US-10.7-dapp-authorization-ui-per-origin.md) |
| US-10.8 | Arbitrary message signing | EPIC-10 | P1 | 3 | ✅ done | — | [link](stories/US-10.8-arbitrary-message-signing.md) |

**Releases in this window:** none — this window ships nothing. These capabilities reached a
SubWallet user in **0.2.1**, in [sprint-2022-M02](sprint-2022-M02.md)'s month.
· **Points (inherited, not spent):** 22

## Per-Epic Retrospective

_None, and not because the record was lost. **There is nothing to retrospect** — this team
did not do this work. A retrospective here would be a team reflecting on someone else's
engineering, which is not a retrospective; it is a book review._
