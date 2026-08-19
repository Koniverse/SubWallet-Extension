---
id: sprint-2026-W34
status: in-progress
start: 2026-08-17
end: 2026-08-23
goal: "A deliberately small window. Land and verify the ParaSpell HTTP API v2 migration (#5051 / PR #5053) — the only piece of W33 work with live tracker evidence — and run the one QC pass W33 queued and never executed (#5054). Opened 2026-08-18 from tracker and git evidence; the eight stalled W33 stories were NOT rolled in, and that is a decision on the record, not an oversight."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-13.18 | ParaSpell HTTP API v2 migration | EPIC-13 | P2 | 2 | review | ← W33 | [link](stories/US-13.18-paraspell-http-api-v2.md) |
| US-42.17 | QC — Update ParaSpell API integration to v2 on Extension (#5051) | EPIC-42 | P2 | 5 | done | new | [link](stories/US-42.17-qc-issue-5051-paraspell-api-v2.md) |
| US-42.16 | QC — Chainlist update: PRDCTR chain (#708) + TUSDT symbol (#707) | EPIC-42 | P3 | 3 | done | new | [link](stories/US-42.16-qc-chainlist-update-prdctr-chain-and-tusdt-symbol.md) |
| US-42.18 | QC — Remove XCM routes dropped in ParaSpell XCM API v2 (#705) | EPIC-42 | P2 | 5 | done | new | [link](stories/US-42.18-qc-issue-705-remove-dropped-xcm-routes.md) |
| US-42.19 | QC — Release SubWallet Extension v1.3.88 | EPIC-42 | P2 | 8 | done | new | [link](stories/US-42.19-qc-release-extension-v1-3-88.md) |

**5 stories · 23 points.** One carried from [W33](sprint-2026-W33.md), four written in-window.

The window opened on 2026-08-18 planned as three stories and 7 points. Two things changed that. The
v1.3.88 release landed inside it, so the three QC stories that release needed — US-42.16, US-42.18
and the US-42.19 release gate — were written and closed in-window rather than planned up front. And
US-42.15, planned here as a carry, turned out to have been QC'd on 2026-08-13, inside W33; it is
counted there instead.

It was still a **small window on purpose.** Everything in it is work that actually moved — one
migration and the QC around a single release; padding it with the eight stalled W33 stories would
make the sprint look busy and tell nobody anything true.

## Why these stories

### US-13.18 + US-42.17 — the one thing actually moving

[#5051](https://github.com/Koniverse/SubWallet-Extension/issues/5051) was the **only** W33 anchor
with tracker activity during or after the window. State on 2026-08-18:

| | |
| --- | --- |
| Issue | OPEN, commented **2026-08-18** by `MaiThuongNinni` — a test build with QC evidence |
| PR [#5053](https://github.com/Koniverse/SubWallet-Extension/pull/5053) | **open**, `koni/dev/issue-5051` → `subwallet-dev`, 7 commits, +110 / −64 |
| Last commit | `a58890eefa`, 2026-08-17 |
| Reviews | 2 × APPROVED by `lw-cdm`, both **2026-08-10** |

The code story and the QC story are **separate on purpose** — the split
[2026-08-13 §B](../notes/2026-08-13.md) had to correct twice (#5042, then #5055), where a QC page
existed and nothing recorded what was built. Here both exist before the merge instead of after.

**Two things to watch this window:**

1. **The approvals are older than the code.** Both landed 2026-08-10; four of the seven commits came
   after, the last on 08-17. Nobody has approved the current head, so "approved" is not a merge gate
   that has actually been met.
2. **QC now has a verdict.** When this window opened the evidence was screenshots and recordings
   with no pass/fail written, the "Swap XCM" section was empty, and only the fresh-install path had
   been exercised — on a *backend migration*, which is the change shape that breaks on upgrade, not
   on fresh install. That gap is closed: [US-42.17](stories/US-42.17-qc-issue-5051-paraspell-api-v2.md)
   is `done` on 2026-08-18, and the release gate [US-42.19](stories/US-42.19-qc-release-extension-v1-3-88.md)
   re-ran the same content on both fresh install and upgrade from v1.3.87.

### US-42.15 — planned as a carry, but it had already run

[#5054](https://github.com/Koniverse/SubWallet-Extension/issues/5054) closed 2026-08-11 and its QC
story was written 08-13. This window was opened on the reading that the story was still `ready` with
every box unticked, so it was pulled in as a carry. That reading was wrong: the QC ran on 08-13, the
same day the page was written, and passed 8 / 8 on Web App and Mobile across dev and production.
The result was simply never written down until 2026-08-19.

So US-42.15 belongs to [W33](sprint-2026-W33.md), not here. It is out of this window's scope table
and counted under W33's **Done**.

## Not in this window — the eight stalled W33 stories

US-4.21, US-4.22, US-4.23, US-5.10, US-10.11, US-12.11, US-13.11 and US-20.4 (**32 points**) stay
on `sprint-2026-W33` with their existing statuses. Their six anchors were last touched between
**2025-11-18 and 2026-05-21** — none of them during W31 or W33, the two windows they have now been
carried through. Full table in [W33 § Closeout](sprint-2026-W33.md).

Carrying them a third time would state, in the scope table of a live window, that eight stories are
in `review` / `in-progress` when nothing on the tracker has moved in months. **That is a claim, and
the docs cannot support it.** Whether the work is deprioritised, blocked, or simply dead is a
planning answer, and it is the same unanswered question as the 12 W31 stories
([2026-08-10 §D](../notes/2026-08-10.md)) — now recurring, which makes it worth answering rather
than carrying again.

## Backlog touched this window

[US-5.16](stories/US-5.16-biometric-passkey-login.md) — biometric / passkey login
([#5058](https://github.com/Koniverse/SubWallet-Extension/issues/5058), opened 2026-08-13). It has
**no sprint** and stays `backlog`: the issue is a title with an empty body, so the story records the
open questions instead of inventing acceptance criteria. Listed here only so the new issue is
visible, not because it is in scope.

## Caveat — the board still has not been read

Unchanged from [2026-08-13 §D](../notes/2026-08-13.md): `projectV2` needs `read:project` and the
available token carries `gist, read:org, repo`. This window was opened from `gh issue view`,
`gh pr view` and git alone. **No board column is claimed as current**, and if a card moved, nothing
here would show it.
