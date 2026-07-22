# EPIC-38 (Maintenance — Multisig) merged into EPIC-18 — 2026-07-22

`EPIC-38` is gone. Its 20 tracker issues now live inside the EPIC-18 capability stories they
belong to, each as a row in that story's own incremental-work table. This is the same treatment
[EPIC-29 → EPIC-9](2026-07-17-epic-9-consolidation.md) received on 2026-07-17, and it is the
fifth of nineteen maintenance epics to be dissolved — after
[EPIC-25 → EPIC-5](2026-07-21-epic-5-consolidation.md),
[EPIC-37 → EPIC-17](2026-07-22-epic-17-consolidation.md) and
[EPIC-22 → EPIC-1](2026-07-22-epic-1-consolidation.md).

**Why.** One issue per story made the multisig area unreadable: 20 stubs, each asserting only
"this issue exists", sitting beside the 3 stories that actually describe what a multisig *is*. A
reader could not tell which was the requirement and which was the ledger entry. A capability is
now **one story** carrying its requirement *and* its full history.

**What did not change.** No issue lost its record. Status, shipped release, assignee and commit
came across unchanged; nothing was upgraded to `done` or given a version it did not have without
the evidence recorded below. Retired `US-38.x` ids are never reused
([AGENTS.md](../../AGENTS.md) rule 1) and are recorded below — this file is the forwarding table.

## The routing rule used here

The multisig tracker is a **five-level sub-issue tree**, deeper than any area folded so far. The
rule applied is mechanical and re-checkable:

> **An issue that has sub-issues is an umbrella → owned by the epic.
> A leaf issue → a row in the story that owns its capability.**

Re-derive it with `gh api repos/Koniverse/SubWallet-Extension/issues/<N>/sub_issues`. This is the
same rule EPIC-38 and EPIC-18 already applied to four umbrellas; applying it to *all* of them
moved **#4856** out of the leaf set, where a title heuristic had put it.

```
#1677 Support Multisig account ......................... OPEN      umbrella
├── #4696 Extension support ............................ OPEN      umbrella
│   ├── #4838 Phase 1: Core Multisig Management ........ COMPLETED umbrella
│   │   ├── #4855 [Phase 1] UI ........................ COMPLETED umbrella  ← the 1.3.74 CHANGELOG line
│   │   │   ├── #4869 Create Multisig account
│   │   │   ├── #4871 Implement History screen
│   │   │   ├── #4872 Implement Account detail
│   │   │   ├── #4874 Implement Notification screen
│   │   │   └── #4875 Implement Transfer using Multisig account
│   │   └── #4856 [Phase 1] Background ................ COMPLETED umbrella
│   │       ├── #4841 Multisig Account Management
│   │       ├── #4842 Pending Transaction Detection
│   │       ├── #4843 Implement Multisig Actions
│   │       ├── #4870 Experiments and Init Core Service
│   │       ├── #4913 Handle mechanism to trigger multisig notifications
│   │       ├── #4921 Classify and handle data for all multisig types
│   │       └── #4938 Handle Init Multisig Transaction
│   └── #4839 Phase 2: Detection and Optimization ...... OPEN      umbrella
│       ├── #4844 [Phase 2] Multisig Account Detection
│       ├── #4845 [Phase 2] Optimize Multisig Feature UX/UI
│       └── #4927 [Phase 2] Improve display Multisig detail by type
├── #4697 Mobile support
├── #4698 WebApp support
└── #4744 Multisig Technical Research

#1426 Support multisig features ........................ COMPLETED  standalone, superseded by #1677
#4963 Extension - Improve Multisig account feature ..... COMPLETED  standalone, shipped 1.3.77
```

> **One sub-issue link on #4856 is a tracker error, not a fact.** The API also returns **#43**
> — *"Support Hardware Wallet"*, closed 2022-06-01, long predating multisig. It is already owned
> by US-16.1 through the [CHANGELOG coverage index](changelog-coverage.md) and is **not** modelled
> as multisig work here. Recorded so nobody later "fixes" the docs to match the board.

## Where each issue went

| Issue | Title | Status | Shipped | Retired id | Now lives in |
|---|---|---|---|---|---|
| [#1426](https://github.com/Koniverse/SubWallet-Extension/issues/1426) | Support multisig features *(scoping, superseded)* | ✅ done | — | `US-38.1` | EPIC-18 (umbrella) |
| [#1677](https://github.com/Koniverse/SubWallet-Extension/issues/1677) | [Multisig] Support Multisig account *(umbrella)* | 📋 backlog | — | `US-38.2` | EPIC-18 (umbrella) |
| [#4696](https://github.com/Koniverse/SubWallet-Extension/issues/4696) | [Multisig] Extension support *(umbrella)* | 📋 backlog | — | `US-38.3` | EPIC-18 (umbrella) |
| [#4697](https://github.com/Koniverse/SubWallet-Extension/issues/4697) | [Multisig] Mobile support | 📋 backlog | — | `US-38.4` | US-18.4 |
| [#4698](https://github.com/Koniverse/SubWallet-Extension/issues/4698) | [Multisig] WebApp support | 📋 backlog | — | `US-38.5` | US-18.4 |
| [#4744](https://github.com/Koniverse/SubWallet-Extension/issues/4744) | [Multisig][Reseach] Multisig Technical Research | ✅ done | — | `US-38.6` | US-18.1 |
| [#4838](https://github.com/Koniverse/SubWallet-Extension/issues/4838) | Phase 1: Core Multisig Management *(umbrella)* | ✅ done | — | `US-38.7` | EPIC-18 (umbrella) |
| [#4841](https://github.com/Koniverse/SubWallet-Extension/issues/4841) | [Phase 1] Multisig Account Management | ✅ done | 1.3.74 | `US-38.8` | US-18.1 |
| [#4842](https://github.com/Koniverse/SubWallet-Extension/issues/4842) | [Phase 1] Pending Transaction Detection | ✅ done | 1.3.74 | `US-38.9` | US-18.2 |
| [#4843](https://github.com/Koniverse/SubWallet-Extension/issues/4843) | [Phase 1] Implement Multisig Actions | ✅ done | 1.3.74 | `US-38.10` | US-18.2 |
| [#4844](https://github.com/Koniverse/SubWallet-Extension/issues/4844) | [Phase 2] Multisig Account Detection | 📋 backlog | — | `US-38.11` | US-18.3 |
| [#4856](https://github.com/Koniverse/SubWallet-Extension/issues/4856) | [Phase 1] Background *(umbrella)* | ✅ done | 1.3.74 | `US-38.12` | EPIC-18 (umbrella) |
| [#4869](https://github.com/Koniverse/SubWallet-Extension/issues/4869) | [Phase 1] Create Multisig account | ✅ done | 1.3.74 | `US-38.13` | US-18.1 |
| [#4870](https://github.com/Koniverse/SubWallet-Extension/issues/4870) | [Phase 1] Experiments and Init Core Service | ✅ done | 1.3.74 | `US-38.14` | US-18.1 |
| [#4871](https://github.com/Koniverse/SubWallet-Extension/issues/4871) | [Phase 1] Implement History screen | ✅ done | 1.3.74 | `US-38.15` | US-18.2 |
| [#4874](https://github.com/Koniverse/SubWallet-Extension/issues/4874) | [Phase 1] Implement Notification screen | ✅ done | 1.3.74 | `US-38.16` | US-18.2 |
| [#4913](https://github.com/Koniverse/SubWallet-Extension/issues/4913) | [Phase 1] Handle mechanism to trigger multisig notifications | ✅ done | 1.3.74 | `US-38.17` | US-18.2 |
| [#4921](https://github.com/Koniverse/SubWallet-Extension/issues/4921) | [Phase 1] Classify and handle data for all multisig types | ✅ done | 1.3.74 | `US-38.18` | US-18.1 |
| [#4927](https://github.com/Koniverse/SubWallet-Extension/issues/4927) | [Phase 2] Improve display Multisig detail by type | 📋 backlog | — | `US-38.19` | US-18.3 |
| [#4938](https://github.com/Koniverse/SubWallet-Extension/issues/4938) | [Phase 1] Handle Init Multisig Transaction | ✅ done | 1.3.74 | `US-38.20` | US-18.2 |

**5 → EPIC-18 umbrellas** · **5 → US-18.1** · **6 → US-18.2** · **2 → US-18.3** · **2 → US-18.4 (new)**.

## Six issues the ledger never had

The tracker has **26** multisig issues. EPIC-38 held 20. The six below were folded in during the
same pass, because a consolidation whose whole purpose is "the tracker is fully claimed" cannot
ship with a known gap in it — a story with no row for an issue reads as *that issue does not
exist*, which is worse than no story at all.

| Issue | Title | State | Shipped | Now lives in | Why it was missing |
|---|---|---|---|---|---|
| [#4839](https://github.com/Koniverse/SubWallet-Extension/issues/4839) | Phase 2: Multisig Account Detection and Optimization | OPEN | — | EPIC-18 (umbrella) | named only in US-18.3's prose |
| [#4845](https://github.com/Koniverse/SubWallet-Extension/issues/4845) | [Phase 2] Optimize Multisig Feature UX/UI | OPEN | — | US-18.3 | named only in US-18.3's prose |
| [#4855](https://github.com/Koniverse/SubWallet-Extension/issues/4855) | [Phase 1] UI | CLOSED | 1.3.74 | EPIC-18 (umbrella) | claimed only by the coverage index |
| [#4872](https://github.com/Koniverse/SubWallet-Extension/issues/4872) | [Phase 1] Implement Account detail | **OPEN** | 1.3.74 | US-18.1 | **absent from every doc** |
| [#4875](https://github.com/Koniverse/SubWallet-Extension/issues/4875) | [Phase 1] Implement Transfer using Multisig account | **OPEN** | 1.3.74 | US-18.2 | **absent from every doc** |
| [#4963](https://github.com/Koniverse/SubWallet-Extension/issues/4963) | Extension - Improve Multisig account feature | CLOSED | 1.3.77 | US-18.1 | claimed only by the coverage index |

`#4855` is the issue the CHANGELOG itself names for the whole Phase-1 delivery
(*"Support Multisig Account Phase 1 (#4855)"*, 1.3.74) — the ledger generated from that CHANGELOG
did not carry it because the coverage index had already mapped it to US-18.1.

## Two issues are open on the tracker and shipped in the code

**#4872** and **#4875** are still `OPEN`, last touched 2026-01-19, yet both capabilities are in
`dev` and in the **v1.3.74** tag. They are recorded as `✅ done | 1.3.74` here because
[D107](../CONTEXT.md#d107-a-ticked-ac-is-a-claim-about-the-code--four-of-us-51s-were-false-and-one-was-a-p0-security-claim)
makes the code the authority over the board, and the board is provably stale:

| Issue | Code evidence | First containing tag |
|---|---|---|
| #4872 — Account detail | `MULTISIG_INFO` tab + `multisigMembers` signatory list in `packages/extension-koni-ui/src/Popup/Account/AccountDetail/index.tsx`, added by `5fcc109aee` (2025-12-26) | `v1.3.74` |
| #4875 — Transfer using multisig | 69 commits on `koni/dev/issue-4875`, from `7b95ffe198` *"add step select multisig signer"* (2026-01-07) to `4d353b26f2` (2026-02-11) | `v1.3.74` |

Reproduce with `git tag --contains <sha> | sort -V | head -1`. **The tracker rows want closing** —
that is a board action for the owner, not a docs action ([AGENTS.md](../../AGENTS.md) rule 3).

## Four UI issues whose delivering commit names a sibling

The Phase-1 UI issues were built on shared branches, so the `[Issue-N]` tag on the delivering
commit is frequently *not* the issue that describes the work — the exact case
[D106](../CONTEXT.md#d106-commit-names-what-made-the-capability-true--a-release-bump-made-nothing-true)
covers. All four are ancestors of `v1.3.74`, so the version claim is unaffected:

| Issue | Delivering commit | Message tag | What it actually does |
|---|---|---|---|
| #4869 Create Multisig account | `c46af768ec` | `[Issue-4856]` | *"Implement UI for multisig feature"* |
| #4871 History screen | `896468e399` | `[Issue-4884]` | *"update ui for multisig"* — #4884 is an **NFT** issue |
| #4872 Account detail | `5fcc109aee` | `[Issue-4884]` | *"add account details for multisig"* |
| #4874 Notification screen | `9de73c2393` | `[Issue-#4855]` | *"handle opening details for multisig notification"* |

The three commits tagged `[Issue-4872]` (`24c8446d6d`, `b2661e8309`, `eb3a70a3ab`) go the other
way: they are the **pending-tx detection service**, not the account-detail screen, and are already
cited by [US-18.2](../sprints/stories/US-18.2-pending-transaction-detection-and-approval.md).

## Issue → commits, as recorded

Carried over from the retired ledger stories, plus the commits found for the six issues it never
had. `—` means no commit message names the issue; where that is so and the work still shipped, the
delivering commit is in the table above.

| Issue | Commits recorded | First containing tag |
|---|---|---|
| #1426 | — | — |
| #1677 | `826ac59777` | — (not in any release tag) |
| #4696 | — | — |
| #4697 | — | — |
| #4698 | — | — |
| #4744 | — *(research; no code)* | — |
| #4838 | — | — |
| #4839 | — | — |
| #4841 | `406091c219, 04721e9f44, eff2997c47, 5495924efd` | `v1.3.74` |
| #4842 | `ad935aa533, 9c7dff8206, 7fb9624959, 0eea9dabd0, e65ce73c98` | `v1.3.74` |
| #4843 | `f536ddfae3, 92eb016b28, 0f536790d7, 3e683779ef` | `v1.3.74` |
| #4844 | — | — |
| #4845 | — | — |
| #4855 | 70 commits; `5965d872cf, 61311e68fe, a861347ef7, 9122ffaea1` | `v1.3.74` |
| #4856 | `25e7d6294d, 9005bcf3b2, 7c25579cf9, f569db9b8b, 7bdbebb19f` *(47 total)* | `v1.3.74` |
| #4869 | `c46af768ec` *(tagged `[Issue-4856]`)* | `v1.3.74` |
| #4870 | `b3350ddf98, 94fd155188, d9a9df98ea, f0d41c0f33, 5ac3846862` | `v1.3.74` |
| #4871 | `896468e399` *(tagged `[Issue-4884]`)* | `v1.3.74` |
| #4872 | `24c8446d6d, b2661e8309, eb3a70a3ab` · screen: `5fcc109aee` | `v1.3.74` |
| #4874 | `9de73c2393` *(tagged `[Issue-#4855]`)* | `v1.3.74` |
| #4875 | 69 commits; `7b95ffe198, 2b8bdc1bb6, cf0d3d41a8, 4d353b26f2` | `v1.3.74` |
| #4913 | `ef03f69e86, 594afd842f, 848fe2c55e, 33f5cbcb1f, b0b547a4d2` | `v1.3.74` |
| #4921 | `92b1bf4d3a, f536ddfae3` | `v1.3.74` |
| #4927 | — | — |
| #4938 | `3aa24efaff, d941d884b5, a3811ec274, 7e03dd42e0, 1f828fd87d` | `v1.3.74` |
| #4963 | `dd2eb7cdf1, 35f2f560f2, 2d0e6677dc, 0baac8b749, 378a23e5da` *(11 total)* | `v1.3.77` |

## The destinations, and why

**[US-18.1] Multisig account creation & management — 7 issues.** The FR-149 contract plus
everything that built the account model: the technical research that produced it (#4744), the core
service (#4870), account management (#4841), the create flow (#4869), the account-detail /
signatory-members screen (#4872), the multisig-type classification (#4921), and the 1.3.77
improvement round (#4963).

**[US-18.2] Pending-tx detection + approval — 7 issues.** The FR-150 contract plus the whole
spend path: detection (#4842), the actions (#4843), transaction initiation (#4938), transfer using
a multisig account (#4875), and the three surfaces that expose it — history (#4871), notifications
(#4874) and the mechanism that triggers them (#4913).

**[US-18.3] Phase-2 auto-detection + indexer history — 3 issues.** The three leaves of the #4839
Phase-2 umbrella: account detection (#4844), UX/UI optimization (#4845) and per-type detail display
(#4927). The story's prose previously named **#4839 and #4845** as its cluster; #4839 is the
umbrella, so the cluster is now stated as its leaves. All open, nothing shipped.

**[US-18.4] Multisig on mobile & web — 2 issues, new story.** #4697 and #4698 port multisig to
the other two platforms. They are deliberately **not** rows in US-18.1/US-18.2: those are `done` at
1.3.74 and describe the extension, and folding unshipped work into a shipped story is how a `done`
story comes to carry an unticked AC — the split the owner directed after the NFT consolidation. It
carries **no FR**: an FR is earned when the capability is specified, not when someone files a
request ([D104](../CONTEXT.md#d104-an-id-is-a-promise-that-a-document-exists--do-not-mint-one-for-an-intention)).

**Umbrellas → the epic.** #1426, #1677, #4696, #4838, #4839, #4855 and #4856 are
feature/phase-level. [EPIC-18](../sprints/epics/EPIC-18.md) already owned four of them; the same
rule now covers all seven, so no umbrella is double-claimed by a story that also lists its children
([D108](../CONTEXT.md#d108-every-tracker-issue-gets-a-story--in-a-maintenance-epic-layer-so-the-fr-map-stays-the-fr-map)).

## Verification

- `node scripts/koni-docs-check-ids.mjs` — exit 0; every ID and link resolves.
- `npx koni-docs validate --docs-path docs/` — exit 0.
- No `US-38.` token remains on the live doc surface; this dated note is the only place they
  appear, which is what `check-ids` exempts a dated archive for.
- Issue count closes: 7 umbrellas + 7 + 7 + 3 + 2 = **26**, the tracker's full multisig set.
