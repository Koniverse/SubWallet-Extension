# CLAUDE.md

> This file is a thin pointer. **AGENTS.md is canonical.**
> On any conflict between AGENTS.md and CLAUDE.md, AGENTS.md wins.

See [AGENTS.md](AGENTS.md) for the full project guide.

## Koni-Docs Integration
koni-docs:
  plugins: []
  docs_path: docs/
  active_sprint: sprint-2026-W33
  version_file: VERSION

## Active Context <!-- koni-docs:auto-update -->
- Sprint: sprint-2026-W33 (2026-08-10 → 08-16) — **open**, 9 stories / 35 pts. 8 carried from W31 on GitHub-board evidence, 1 QC story done. W29/W30/W31 closed retroactively on 2026-08-10.
- Active Stories: US-4.21 · US-4.22 · US-4.23 (all three on #4451 Bitcoin-API, `review`) · US-5.10 (security findings) · US-10.11 (WalletConnect) · US-12.11 (Trusted Stake, `review`) · US-13.11 (XCM/ParaSpell) · US-20.4 (submit performance, `review`). **12 further W31 stories did not carry and were not reassigned** — no anchor of theirs is in the board's live iteration; deciding where they belong is an open planning call.
- Board ↔ docs: the Projects board (#2) numbers its `Week` iterations **one behind ISO**; docs sprint IDs are ISO. Dates align 1:1 — board `Week 32 - 2026` **is** `sprint-2026-W33`.
- Last Version: 1.3.86 (merged from `subwallet-dev` on 2026-08-10 — see [docs/notes/2026-08-10.md](docs/notes/2026-08-10.md))
- Recent Decisions: D105 (fork boundary is its own window) · D106 (`commit:` names what made the capability true) · D107 (a ticked AC is a claim about the code) · D108 (every tracker issue gets a story in a 20-epic maintenance layer; FR map stays clean) · D109 (the epic matrix's requirement column has five meanings — legend written once, epics link to it)
- Recent Lessons: §69 (a link an API hands you is a claim, not a fact — GitHub's closing-PR field was 41% wrong; verify against the developer's [Issue-N] title) · §70 (unrecoverable is a claim too — 367 blank versions sat one `git tag --contains` away; check git before declaring a gap) · §71 (import runs the unified-account migration inline at per-keypair cost; interrupting it leaves accounts that cannot sign)

See `.active-context.md` (gitignored, per-developer) for live snapshot;
copy from `.active-context.example.md` on first checkout.
