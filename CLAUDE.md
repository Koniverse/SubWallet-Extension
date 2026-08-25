# CLAUDE.md

> This file is a thin pointer. **AGENTS.md is canonical.**
> On any conflict between AGENTS.md and CLAUDE.md, AGENTS.md wins.

See [AGENTS.md](AGENTS.md) for the full project guide.

## Koni-Docs Integration
koni-docs:
  plugins: []
  docs_path: docs/
  active_sprint: sprint-2026-W35
  version_file: VERSION

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-2026-W35 (2026-08-24 → 08-30) — **open**, 3 stories / 18 pts, **all three open PRs, nothing `done`**: US-13.19 (**P0**, #5062/PR #5063), US-5.16 (#5058/PR #5061), US-12.23 (#5064/PR #5065). W34 **closed 2026-08-25 at 5 of 5 stories, 23 of 23 pts — the first 100% window in the record**, and the reason was scope honesty, not velocity.
- **Pattern across all three W35 PRs: one review between them, and two of the three ship no test.** #5063 (P0, funds already lost) 1 review / no test · #5061 0 reviews / 2 spec files · #5065 0 reviews / no test.
- **P0 — #5062 has already cost a user 72,614 USDT.** The KAH-native `statemine-LOCAL-USDt` is offered an XCM route to Polkadot AH it cannot cross; funds land trapped. **The fix has two halves and only one is in this repo**: PR #5063 adds *validation logic* (`xcm/utils.ts` +162, approved 08-24), while the 4 chainlist data edits the issue prescribes have **no issue and no PR** in SubWallet-ChainList. Merging #5063 closes #5062 and leaves the bad route live in production data.
- US-5.16: PR #5061 answered what the empty issue never did — `wrapWalletPassword()` AES-GCM-encrypts the master password under a WebAuthn-**PRF**-derived key. It **wraps, does not replace**, so EPIC-5's non-recoverable-by-design decision stands. A 4th commit (`4b7698b5b4`) extended it to the **dApp confirmation surface** — the one US-5.15 hardened after #5042 — hence AC-8. Watch the no-passkey fallback (AC-3).
- US-12.23: PR #5065 is **root-network TAO only** (`claimReward: true` in `tao.ts`, **false** in `dtao.ts`), so no overlap with US-12.6's subnet path. Unanswered: whether it replaces or revives the root claim type **removed in v1.3.86** (#5045). Two silent-failure risks with no test — `RootClaimableThreshold` is a fixed-point `I96F32` needing a `2^32` scale, and the `500000` rao fallback when the query is absent.
- **8 W33 stories still not carried** — US-4.21/4.22/4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 (32 pts). Re-checked 2026-08-25: all 6 anchors OPEN with last-touched dates **byte-identical to the 08-18 check** (#4451 2025-11-18 · #4889/#4424 2026-01-19 · #4946 2026-03-24 · #4984 2026-04-08 · #4995 2026-05-21). They have now sat out **three windows** (W31, W33, W34). Open planning call, a month old.
- **The board cannot be re-read** — `projectV2` needs `read:project`; the available token has `gist, read:org, repo`. Resync from `gh issue view` / `gh pr view` / git, and claim no board column as current.
- **12 W31 stories are live work in a closed window** — they keep `sprint: sprint-2026-W31` with status `ready`/`in-progress`/`review`. `validate` passes, so nothing flags it. Open planning call: US-1.4, US-1.5, US-4.14, US-4.15, US-4.19, US-4.20, US-8.12, US-10.9, US-15.4, US-16.3, US-19.9, US-20.2.
- Umbrella issues belong to their **epic**, not a story (rule 10) — grep `epics/` as well as `stories/` before calling an issue uncovered.
- Board ↔ docs: the Projects board (#2) numbers its `Week` iterations **one behind ISO**; docs sprint IDs are ISO. Dates align 1:1 — board `Week 32 - 2026` **is** `sprint-2026-W33`, so `Week 34 - 2026` is `sprint-2026-W35`.
- Last Version: **1.3.88** (released 2026-08-19 from `master`, `93734db9cb` — ParaSpell v2 #5051 + chainlist PRDCTR/TUSDT + dropped-XCM-route removal; see [docs/notes/2026-08-25.md](docs/notes/2026-08-25.md)). Lineage verified: `da2207be1b` is an ancestor and `git tag --contains` returns exactly `v1.3.88`.
- **Two empty-body issues in a month (#5058, #5064), both later explained by their own PR** — #5058 took a week, #5064 a day. Neither issue has since gained a body; their `updatedAt` moves come from linked-PR activity, not comments. Write stories from the diff, and say so.
- **PR #5053 merged without a re-review of its final head** — both approvals dated 2026-08-10, five of eight commits landed after. Flagged before the merge (2026-08-18), never closed; it shipped and QC passed 10/10. Process point, recorded not dropped.
- **`check-ids` exits 1** on US-42.10 — `version_shipped: 1.2.44(532)b-v16` is a SubWallet-**Mobile** build, not a release of this product (rule 1b), and EPIC-42 is `prd_ref: []` so the field belongs empty (rule 4). Sibling pages US-42.6 / US-42.9 leave it blank. One-field fix; **applied 2026-08-13, reverted, still outstanding.**
- Recent Decisions: D105 (fork boundary is its own window) · D106 (`commit:` names what made the capability true) · D107 (a ticked AC is a claim about the code) · D108 (every tracker issue gets a story in a 20-epic maintenance layer; FR map stays clean) · D109 (the epic matrix's requirement column has five meanings — legend written once, epics link to it)
- Recent Lessons: §69 (a link an API hands you is a claim, not a fact — GitHub's closing-PR field was 41% wrong; verify against the developer's [Issue-N] title) · §70 (unrecoverable is a claim too — 367 blank versions sat one `git tag --contains` away; check git before declaring a gap) · §71 (import runs the unified-account migration inline at per-keypair cost; interrupting it leaves accounts that cannot sign)

See `.active-context.md` (gitignored, per-developer) for live snapshot;
copy from `.active-context.example.md` on first checkout.
