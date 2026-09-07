---
id: sprint-2026-W37
status: in-progress
start: 2026-09-07
end: 2026-09-13
goal: "Settle US-12.23 — a PR that has sat open and approved for three windows while its QC evidence ages against a branch nobody builds. The web-runner QC programme is the larger body of live work but is tester-owned and tracked in its own stories, so it is described here and not scoped. Opened 2026-09-07 from tracker, PR and git evidence."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-12.23 | Manual claim for Bittensor native staking | EPIC-12 | P2 | 5 | review | ← W36 | [link](stories/US-12.23-bittensor-manual-claim-native-staking.md) |

**1 story · 5 points.** Small, and honestly so: it is the only non-QC item in flight.

## US-12.23 — a third window, and the evidence is aging

Unchanged since [2026-09-03 §D](../notes/2026-09-03.md):

| | |
| --- | --- |
| Issue [#5064](https://github.com/Koniverse/SubWallet-Extension/issues/5064) | closed by hand 2026-08-26, **no commit attached** |
| PR [#5065](https://github.com/Koniverse/SubWallet-Extension/pull/5065) | **still open**, approved by `lw-cdm`, 4 commits |
| QC [US-42.23](stories/US-42.23-qc-issue-5064-bittensor-manual-claim.md) | 16/16 on the branch build, **2026-08-27** |
| v1.3.89 | dropped from scope |

That 16/16 is now **11 days old and describes a commit nobody is building.** The story has said since
2026-08-25 that leaving it open is the option that decays; three windows on, it has.
**Merge it or reschedule it.**

## The web-runner QC programme — described, not scoped

[US-42.24](stories/US-42.24-qc-web-runner-1-3-86.md) and its sub-tasks are **tester-owned**. Which
sprint they sit in is recorded by whoever runs them, so they are **not moved into this window** and
not counted in its points. They are the larger body of live work and are described here only so the
sprint record is not misleading by omission:

| | Sub-tasks | Points |
| --- | --- | --- |
| Done in [W36](sprint-2026-W36.md) | 4 — .1, .2, .14, .15 | 21 |
| In progress, still on W36 | 4 — parent, .4, .19, .20 | 29 |
| **`backlog`, no sprint** | **12** — .5 … .13, .16 … .18 | **88** |

**The untouched backlog is larger than every live sprint in the record put together.** Not a problem
with the programme — a 1.3.68 → 1.3.86 backfill is genuinely that big — but it means the finish date
is set by those twelve, and nothing currently schedules them.

## New this week, and not in scope

[#5072](https://github.com/Koniverse/SubWallet-Extension/issues/5072) *"Support sr25519 VRF signing
for dApp key derivation"* (2026-09-05) → [US-10.21](stories/US-10.21-sr25519-vrf-signing-dapp-key-derivation.md),
`backlog`, no sprint.

**The third empty-body issue in under a month**, after #5058 and #5064 — both of which were
eventually explained by their own PR rather than by the issue, and neither of which ever gained a
body. The story records open questions instead of invented acceptance criteria, and its EPIC-10
placement is marked **provisional**: a one-line title cannot settle whether this is dApp-facing
signing, keyring machinery, or derivation-path work.

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11, US-20.4 (**32 points**) stay on
`sprint-2026-W33`. Re-checked 2026-09-07: all six anchors OPEN, last-touched dates unchanged.
**Five consecutive windows sat out**, and the planning call from
[2026-08-10 §D](../notes/2026-08-10.md) is six weeks old.

## Caveat — the board still has not been read

`projectV2` needs `read:project`; the token carries `gist, read:org, repo`. Unchanged since
2026-08-13. Opened from `gh issue view`, `gh pr view` and git; **no board column is claimed as
current**.
