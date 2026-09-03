# CLAUDE.md

> This file is a thin pointer. **AGENTS.md is canonical.**
> On any conflict between AGENTS.md and CLAUDE.md, AGENTS.md wins.

See [AGENTS.md](AGENTS.md) for the full project guide.

## Koni-Docs Integration
koni-docs:
  plugins: []
  docs_path: docs/
  active_sprint: sprint-2026-W36
  version_file: VERSION

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-2026-W36 (2026-08-31 → 09-06) — **open**, 2 stories / 13 pts, **both carried, nothing new in-window**: US-42.21 (v1.3.89 release gate, `in-progress`) and US-12.23 (#5064, `review`, PR #5065 unmerged). No new tracker issue since #5064 on 2026-08-24 — ten days, the longest quiet stretch in the record.
- W35 **closed 2026-09-03 at 5 of 7 stories, 28 of 41 pts**, and shipped v1.3.89. Its mid-window text said "no extension code has shipped"; two days later two PRs had merged and released — date claims, do not state them flat.
- **The v1.3.89 release gate is still open, six days after production.** US-42.21: dev stage passed (AC-1a/1b/2); **master, draft and production stages — 10 of 13 checks — unticked**. Content was QC'd individually before merge (14/14, 15/15), so this is the *shipped artefact* that is unverified, not the change. **Run AC-9 first** — master password still unlocks with the passkey on and off; it is the only check between a passkey regression and a locked-out user.
- **#5064 has four states that do not line up**: issue **closed by hand** 08-26 (no commit), PR #5065 **open** (4 commits, approved), QC **16/16** on the branch build, and **dropped from the v1.3.89 scope**. Its only verification is one manual pass on an unmerged branch with no test — merge it or reschedule it; leaving it open is the option that decays.
- **US-13.19 shipped with AC-6 unticked** — the P0 has **no regression test**. Both halves are in production; nothing executable defends the route.
- **Passkey unlock needs a new FR.** US-5.16 shipped a capability FR-55 does not cover, `prd_ref: []` on purpose (FR markers track shipped capability; writing one from a story back-doors the map). Decision for whoever owns the PRD.
- **8 W33 stories still not carried** — US-4.21/4.22/4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 (32 pts). Re-checked 2026-08-25: all 6 anchors OPEN with last-touched dates **byte-identical to the 08-18 check** (#4451 2025-11-18 · #4889/#4424 2026-01-19 · #4946 2026-03-24 · #4984 2026-04-08 · #4995 2026-05-21). They have now sat out **three windows** (W31, W33, W34). Open planning call, a month old.
- **The board cannot be re-read** — `projectV2` needs `read:project`; the available token has `gist, read:org, repo`. Resync from `gh issue view` / `gh pr view` / git, and claim no board column as current.
- **12 W31 stories are live work in a closed window** — they keep `sprint: sprint-2026-W31` with status `ready`/`in-progress`/`review`. `validate` passes, so nothing flags it. Open planning call: US-1.4, US-1.5, US-4.14, US-4.15, US-4.19, US-4.20, US-8.12, US-10.9, US-15.4, US-16.3, US-19.9, US-20.2.
- Umbrella issues belong to their **epic**, not a story (rule 10) — grep `epics/` as well as `stories/` before calling an issue uncovered.
- Board ↔ docs: the Projects board (#2) numbers its `Week` iterations **one behind ISO**; docs sprint IDs are ISO. Dates align 1:1 — board `Week 32 - 2026` **is** `sprint-2026-W33`, so `Week 34 - 2026` is `sprint-2026-W35`.
- Last Version: **1.3.89** (released 2026-08-28 from `master`, `b9363157d0` — #5058 passkey unlock + #5062 KAH↔PAH USDt XCM repoint; see [docs/notes/2026-09-03.md](docs/notes/2026-09-03.md)). Lineage verified per item: both merges are ancestors and `git tag --contains` returns exactly `v1.3.89`.
- **The root `CHANGELOG.md` is behind `master`** — it has no 1.3.89 section, because the merge that reached `dev` came from `subwallet-dev`, not `master`. Left alone on purpose: that file is the untouched legacy copy and it will arrive when `master` does. Not a miss.
- **LESSONS §69 has now appeared in three shapes in one month** — the closing-PR field, then the issue *state*, then an **empty search result**. On 2026-08-25 I claimed #5062's chainlist half had "no issue and no PR"; [ChainList PR #709](https://github.com/Koniverse/SubWallet-ChainList/pull/709) had merged 08-24. The query looked for issues, not PRs, in a repo where the PR is titled with the *Extension* number. **A negative finding needs the same corroboration as a positive one**, and cross-repo work needs both repos searched for PRs as well as issues.
- **Two empty-body issues in a month (#5058, #5064), both later explained by their own PR** — #5058 took a week, #5064 a day. Neither issue has since gained a body; their `updatedAt` moves come from linked-PR activity, not comments. Write stories from the diff, and say so.
- **PR #5053 merged without a re-review of its final head** — both approvals dated 2026-08-10, five of eight commits landed after. Flagged before the merge (2026-08-18), never closed; it shipped and QC passed 10/10. Process point, recorded not dropped.
- **`check-ids` exits 1** on US-42.10 — `version_shipped: 1.2.44(532)b-v16` is a SubWallet-**Mobile** build, not a release of this product (rule 1b), and EPIC-42 is `prd_ref: []` so the field belongs empty (rule 4). Sibling pages US-42.6 / US-42.9 leave it blank. One-field fix; **applied 2026-08-13, reverted, still outstanding.**
- Recent Decisions: D105 (fork boundary is its own window) · D106 (`commit:` names what made the capability true) · D107 (a ticked AC is a claim about the code) · D108 (every tracker issue gets a story in a 20-epic maintenance layer; FR map stays clean) · D109 (the epic matrix's requirement column has five meanings — legend written once, epics link to it)
- Recent Lessons: §69 (a link an API hands you is a claim, not a fact — GitHub's closing-PR field was 41% wrong; verify against the developer's [Issue-N] title) · §70 (unrecoverable is a claim too — 367 blank versions sat one `git tag --contains` away; check git before declaring a gap) · §71 (import runs the unified-account migration inline at per-keypair cost; interrupting it leaves accounts that cannot sign)

See `.active-context.md` (gitignored, per-developer) for live snapshot;
copy from `.active-context.example.md` on first checkout.
