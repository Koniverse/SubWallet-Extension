---
id: sprint-2026-W33
status: closed
start: 2026-08-10
end: 2026-08-16
goal: "The live window. Land the EPIC-4 Bitcoin-API / RPC / Asset-Hub hardening cluster (#4451), the WalletConnect and submit-performance fixes in review (#4995, #4984), Trusted Stake (#4946), ParaSpell-version XCM hardening (#4424) and the two open security findings (#4889) — the eight stories the GitHub board carried forward from W31 — plus the work that arrived mid-window: the nominator fast-unbond fix shipped as v1.3.87 (#5055) and QC on the two dApp-list changes (#5050, #5054)."
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
| US-13.18 | ParaSpell HTTP API v2 migration | EPIC-13 | P2 | 2 | review | → W34 | [link](stories/US-13.18-paraspell-http-api-v2.md) |
| US-12.22 | Nominator fast-unbond duration (28d → 2d) | EPIC-12 | P1 | 2 | done | new | [link](stories/US-12.22-nominator-fast-unbond-duration.md) |
| US-20.4 | Many-account submit performance | EPIC-20 | P1 | 5 | review | ← W31 | [link](stories/US-20.4-many-account-submit-performance.md) |
| US-42.13 | QC — Gavun's Grid Miner dApp added to SubWallet dApp list (#5050) | EPIC-42 | P3 | 3 | done | new | [link](stories/US-42.13-qc-issue-5050-gavuns-grid-miner-dapp.md) |
| US-42.14 | QC — DOT nomination pool unstake period 28d → 2d (#5055) | EPIC-42 | P2 | 2 | done | new | [link](stories/US-42.14-qc-issue-5055-nominator-unstaking-eras-dot-2-days.md) |
| US-42.15 | QC — WUD Universe dApp logo in SubWallet dApp list (#5054) | EPIC-42 | P3 | 2 | ready | → W34 | [link](stories/US-42.15-qc-issue-5054-wud-universe-dapp-logo.md) |

**13 stories · 43 points.** Eight carried from [W31](sprint-2026-W31.md) on board evidence
(below), plus five written inside the window: [US-13.18](stories/US-13.18-paraspell-http-api-v2.md)
(2026-08-10, for #5051 — the one live board item nothing in the docs covered),
[US-12.22](stories/US-12.22-nominator-fast-unbond-duration.md) and three QC stories.

**The window shipped a release.** [v1.3.87](../CHANGELOG.md) went out 2026-08-12 carrying #5055
alone — the first release cut inside a sprint window since the docs layer caught up on 2026-08-10.
Six are in `review` and could still close this week; every one of the six carried anchors is
**still open and untouched on the tracker** (checked 2026-08-13, see below).

## Why these — the board, issue by issue

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
> moved on an ambiguous mapping**.

### Coverage of the current week — checked issue by issue

Every one of the 29 Extension issues in the live iteration resolves to a story **or** to an
epic-level umbrella. Umbrellas belong to the epic, not to a story
([AGENTS.md](../../AGENTS.md) rule 10), so "no story cites it" is the *correct* state for
one — searching only `stories/` makes a properly-owned umbrella look like a gap:

| Issue | Owned by | |
| --- | --- | --- |
| [#1677](https://github.com/Koniverse/SubWallet-Extension/issues/1677) Multisig | [EPIC-18](epics/EPIC-18.md) umbrella table | 4 children (#4696, #4697, #4698, #4744), matches the API exactly |
| [#4567](https://github.com/Koniverse/SubWallet-Extension/issues/4567) swap To-token filter | [EPIC-4](epics/EPIC-4.md) umbrella table | 1 child, `SubWallet-Monorepos#98`, correctly noted as out of area |
| [#4791](https://github.com/Koniverse/SubWallet-Extension/issues/4791) swap path algorithm | [EPIC-11](epics/EPIC-11.md) umbrella table | **corrected 2026-08-10** — 3 children, not 1; Phase 1 already shipped in `SubWallet-Monorepos` |
| [#5051](https://github.com/Koniverse/SubWallet-Extension/issues/5051) ParaSpell API v2 | **nothing — the only real gap** | Now [US-13.18](stories/US-13.18-paraspell-http-api-v2.md) |

### The board/docs disagreement that is not one

[#4980](https://github.com/Koniverse/SubWallet-Extension/issues/4980) (*Recheck Ledger signing
on Bittensor*) is `Ready to build` in the board's live iteration while
[US-16.4](stories/US-16.4-ledger-network-and-app-coverage.md) records it `✅ done`.
**US-16.4 is right.** The issue closed `COMPLETED` on 2026-05-18 and has no commit and no PR
because it is a **recheck, not a change** — the signing path was verified, it worked, nothing
was written. No merge event ever existed for the board card to react to, so the column stayed
where it was. Confirmed by the developer 2026-08-10; reasoning recorded on US-16.4.

## Mid-window resync — 2026-08-13

Three days into the window, checked against the tracker and git rather than the board (see the
caveat below). Full record in [notes/2026-08-13.md](../notes/2026-08-13.md).

### The six carried anchors have not moved

| Anchor | Tracker state on 2026-08-13 | Last touched |
| --- | --- | --- |
| [#4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451) Bitcoin API Optimization | OPEN | 2025-11-18 |
| [#4889](https://github.com/Koniverse/SubWallet-Extension/issues/4889) Phishing Detection screen | OPEN | 2026-01-19 |
| [#4995](https://github.com/Koniverse/SubWallet-Extension/issues/4995) EVM tx misleading error | OPEN | 2026-05-21 |
| [#4946](https://github.com/Koniverse/SubWallet-Extension/issues/4946) Auto-Rebalancing Index | OPEN | 2026-03-24 |
| [#4424](https://github.com/Koniverse/SubWallet-Extension/issues/4424) Critical Across update | OPEN | 2026-01-19 |
| [#4984](https://github.com/Koniverse/SubWallet-Extension/issues/4984) Many-account submit perf | OPEN | 2026-04-08 |

**No status changed**, so no carried story was moved. Every one of these was last touched *before*
the window opened — the six `review` / `in-progress` statuses in the scope table are carried
claims, not fresh evidence, and nothing this week has refreshed them.

[#5051](https://github.com/Koniverse/SubWallet-Extension/issues/5051) is also still OPEN and PR
[#5053](https://github.com/Koniverse/SubWallet-Extension/pull/5053) still unmerged, so
[US-13.18](stories/US-13.18-paraspell-http-api-v2.md) stays `review` with no ticked AC.

### What arrived mid-window

| Issue | Closed | Delivery | Now owned by |
| --- | --- | --- | --- |
| [#5055](https://github.com/Koniverse/SubWallet-Extension/issues/5055) Update nominator unstaking eras | 2026-08-12 | PR [#5056](https://github.com/Koniverse/SubWallet-Extension/pull/5056) → `d7e7d847e5` → **v1.3.87** | [US-12.22](stories/US-12.22-nominator-fast-unbond-duration.md) (code) + [US-42.14](stories/US-42.14-qc-issue-5055-nominator-unstaking-eras-dot-2-days.md) (QC) |
| [#5054](https://github.com/Koniverse/SubWallet-Extension/issues/5054) Update WUD Universe dApp logo | 2026-08-11 | none in this repo — remote dApp-list content | [US-42.15](stories/US-42.15-qc-issue-5054-wud-universe-dapp-logo.md), `ready` |

#5055 repeated the [2026-08-10 §B](../notes/2026-08-10.md) pattern exactly: the QC page
(US-42.14) was written the day the fix merged, and the **code had no owning feature story** until
US-12.22. A QC page records that something was *checked*; it does not record what was *built*.

### Caveat — the board was not re-read

The 2026-08-10 scope was derived from Projects board #2. That query **could not be repeated on
2026-08-13**: the available token carries `gist, read:org, repo` and `projectV2` needs
`read:project`. So this resync is built from `gh issue view`, `gh pr view` and git — evidence that
does not depend on the board — and **no board column is claimed as current**. If a card moved this
week, nothing here would show it.

---

## Closeout — 2026-08-18

The window ended **2026-08-16**. Closed two days later from `gh issue view` / `gh pr view` / git;
the board still could not be read (see the caveat above, unchanged).

### What the window actually delivered

**3 of 13 stories · 7 of 43 points.**

| Outcome | Stories | Pts | |
| --- | --- | --- | --- |
| **Done** | US-12.22, US-42.13, US-42.14 | 7 | One release (v1.3.87, #5055) and two dApp-list QC passes |
| **→ [W34](sprint-2026-W34.md)** | US-13.18, US-42.15 | 4 | The only two with a reason to move — see below |
| **Did not move** | US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 | 32 | Eight stories, six anchors, **zero tracker events all window** |

Everything that completed was written **inside** the window. **Nothing carried in from W31 closed.**

### The eight that did not move — and why they were not carried

Re-checked 2026-08-18. Every carried anchor is still OPEN, and **not one was touched at any point
during the window**:

| Anchor | State | Last touched | Stale by |
| --- | --- | --- | --- |
| [#4451](https://github.com/Koniverse/SubWallet-Extension/issues/4451) Bitcoin API Optimization | OPEN | 2025-11-18 | ~9 months |
| [#4995](https://github.com/Koniverse/SubWallet-Extension/issues/4995) EVM tx misleading error | OPEN | 2026-05-21 | ~3 months |
| [#4946](https://github.com/Koniverse/SubWallet-Extension/issues/4946) Auto-Rebalancing Index | OPEN | 2026-03-24 | ~5 months |
| [#4984](https://github.com/Koniverse/SubWallet-Extension/issues/4984) Many-account submit perf | OPEN | 2026-04-08 | ~4 months |
| [#4889](https://github.com/Koniverse/SubWallet-Extension/issues/4889) Phishing Detection screen | OPEN | 2026-01-19 | ~7 months |
| [#4424](https://github.com/Koniverse/SubWallet-Extension/issues/4424) Critical Across update | OPEN | 2026-01-19 | ~7 months |

**These eight were deliberately not rolled into [W34](sprint-2026-W34.md).** Rolling them would
assert they are active work in the new window, and the evidence says the opposite — they have been
carried from W31 to W33 already, and a second carry would turn a stale claim into a standing one.
[2026-08-13 §D](../notes/2026-08-13.md) named their `review` / `in-progress` statuses as *carried
claims, not fresh evidence*; a week later that is no longer a caveat, it is the finding.

They keep `sprint: sprint-2026-W33` and their existing statuses. **This is the same open planning
call as the 12 W31 stories** ([2026-08-10 §D](../notes/2026-08-10.md)) — now a second instance, and
that repetition is itself the signal: the carry-forward is where the docs and the work come apart.
Resolving it is a planning decision, not a documentation one.

### The two that moved, and why

| Story | Evidence |
| --- | --- |
| [US-13.18](stories/US-13.18-paraspell-http-api-v2.md) | #5051 commented **2026-08-18**, PR #5053 gained commits through 08-17, and QC started on a build. The only W33 anchor with *any* activity |
| [US-42.15](stories/US-42.15-qc-issue-5054-wud-universe-dapp-logo.md) | Real pending work, not stalled work — #5054 is closed and its QC has simply never been run. Unblocked and small |
