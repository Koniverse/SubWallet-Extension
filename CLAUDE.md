# CLAUDE.md

> This file is a thin pointer. **AGENTS.md is canonical.**
> On any conflict between AGENTS.md and CLAUDE.md, AGENTS.md wins.

See [AGENTS.md](AGENTS.md) for the full project guide.

## Koni-Docs Integration
koni-docs:
  plugins: []
  docs_path: docs/
  active_sprint: sprint-2026-W34
  version_file: VERSION

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-2026-W34 (2026-08-17 → 08-23) — **open**, 3 stories / 7 pts, deliberately small: US-13.18 + US-42.16 (ParaSpell v2, #5051/PR #5053) and US-42.15 (#5054 QC, queued in W33 and never run). W33 **closed 2026-08-18**: 3 of 13 stories, 7 of 43 pts, and everything that completed was written inside the window — nothing carried in from W31 closed.
- Active Stories (W34): US-13.18 (ParaSpell HTTP v2, `review`, PR #5053 open — **approved 08-10 but 4 of 7 commits landed after**, so the current head is unapproved) · US-42.16 (QC of that migration, `in-progress` — build exercised 08-18, **no verdict stated**, Swap-XCM section empty, fresh-install only) · US-42.15 (#5054 dApp-logo QC, `ready`, still unrun).
- **8 W33 stories were NOT carried into W34** — US-4.21/4.22/4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 (32 pts). Their 6 anchors were last touched 2025-11-18 → 2026-05-21 and moved in neither W31 nor W33. A third carry would assert active work the tracker contradicts. They keep `sprint: sprint-2026-W33`. **Second instance of the same open planning call** as the 12 W31 stories — that repetition is the signal.
- **The 6 carried anchors still have not moved** — re-checked 2026-08-18, all OPEN, none touched at any point in W33 (#4451 ~9 months stale, #4889/#4424 ~7, #4946 ~5, #4984 ~4, #4995 ~3). On 08-13 this was a caveat; a week on it is the finding.
- **The board cannot currently be re-read** — `projectV2` needs `read:project`; the available token has `gist, read:org, repo`. Resync from `gh issue view` / `gh pr view` / git instead, and claim no board column as current.
- **12 W31 stories are live work in a closed window** — they keep `sprint: sprint-2026-W31` with status `ready`/`in-progress`/`review`; no anchor of theirs is in the board's live iteration. `validate` passes, so nothing flags it. Open planning call: US-1.4, US-1.5, US-4.14, US-4.15, US-4.19, US-4.20, US-8.12, US-10.9, US-15.4, US-16.3, US-19.9, US-20.2.
- Umbrella issues belong to their **epic**, not a story (rule 10) — grep `epics/` as well as `stories/` before calling an issue uncovered.
- Board ↔ docs: the Projects board (#2) numbers its `Week` iterations **one behind ISO**; docs sprint IDs are ISO. Dates align 1:1 — board `Week 32 - 2026` **is** `sprint-2026-W33`, so `Week 33 - 2026` is `sprint-2026-W34`.
- Last Version: 1.3.87 (released 2026-08-12 from `master`, single issue #5055 — see [docs/notes/2026-08-13.md](docs/notes/2026-08-13.md)). **No release since**; `master` unchanged at `5f9a703b72` as of 2026-08-18, VERSION matches.
- New since 08-13: #5058 (biometric/passkey login, opened 08-13) → [US-5.16](docs/sprints/stories/US-5.16-biometric-passkey-login.md), `backlog`. The issue is a **title with an empty body**, so the story records open questions rather than invented ACs.
- **`check-ids` exits 1** on US-42.10 — `version_shipped: 1.2.44(532)b-v16` is a SubWallet-**Mobile** build, not a release of this product (rule 1b), and EPIC-42 is `prd_ref: []` so the field belongs empty (rule 4). Both sibling release-QC pages (US-42.6, US-42.9) already leave it blank. One-field fix, not yet applied.
- Recent Decisions: D105 (fork boundary is its own window) · D106 (`commit:` names what made the capability true) · D107 (a ticked AC is a claim about the code) · D108 (every tracker issue gets a story in a 20-epic maintenance layer; FR map stays clean) · D109 (the epic matrix's requirement column has five meanings — legend written once, epics link to it)
- Recent Lessons: §69 (a link an API hands you is a claim, not a fact — GitHub's closing-PR field was 41% wrong; verify against the developer's [Issue-N] title) · §70 (unrecoverable is a claim too — 367 blank versions sat one `git tag --contains` away; check git before declaring a gap) · §71 (import runs the unified-account migration inline at per-keypair cost; interrupting it leaves accounts that cannot sign)

See `.active-context.md` (gitignored, per-developer) for live snapshot;
copy from `.active-context.example.md` on first checkout.
