---
id: sprint-2026-W37
status: in-progress
start: 2026-09-07
end: 2026-09-13
goal: "Carry on the web-runner 1.3.86 QC. Four of the nineteen sub-tasks closed in W36 and thirteen bugs came out of them, so this window is about working through the versions that are left and getting the open bugs verified once they are fixed. Nothing new is planned: the scope is what W36 left running."
---

## Sprint scope

| US | Title | Epic | Pri | Points | Status | Carry | Story file |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-42.24 | QC — Update web-runner to 1.3.86 (#2057) | EPIC-42 | P2 | 0 | in-progress | ← W36 | [link](stories/US-42.24-qc-web-runner-1-3-86.md) |
| US-42.24.4 | QC — Web-runner 1.3.71 | EPIC-42 | P2 | 13 | done | ← W36 | [link](stories/US-42.24.4-qc-web-runner-1-3-71.md) |
| US-42.24.5 | QC — Web-runner 1.3.72 | EPIC-42 | P2 | 20 | in-progress | ← W36 | [link](stories/US-42.24.5-qc-web-runner-1-3-72.md) |
| US-42.24.19 | QC — Full regression on Mobile | EPIC-42 | P2 | 13 | in-progress | ← W36 | [link](stories/US-42.24.19-qc-web-runner-regression.md) |
| US-42.24.20 | QC — Verify the bugs found during the update | EPIC-42 | P2 | 8 | in-progress | ← W36 | [link](stories/US-42.24.20-qc-web-runner-verify-bugs.md) |

5 stories · 54 points, all carried from W36. The parent carries no points of its own; it tracks the sub-tasks.

Twelve sub-tasks are still `backlog` and stay out of the window until one is picked up: 1.3.73 to 1.3.80, and 1.3.84 to 1.3.86. They are not planned work yet, so listing them here would say more than is true.

## What W36 closed

Four version sub-tasks finished, all with every AC settled:

| Story | Version | Result |
| --- | --- | --- |
| US-42.24.1 | 1.3.68 | 11 pass, 3 skipped for Rari Chain, 3 settled on retest |
| US-42.24.2 | 1.3.69 | 18 pass, 1 skipped, 2 failed with bugs logged |
| US-42.24.14 | 1.3.82 | 6 / 6, no bugs |
| US-42.24.15 | 1.3.83 | 8 / 8, no bugs |

The 1.3.70 sub-task was dropped rather than closed. OpenGov phase 1 has not been built — it is the one item still unticked in [#2057](https://github.com/Koniverse/SubWallet-Mobile/issues/2057) — and the locked balance display that had been scheduled alongside it went back to 1.3.68 where it shipped. OpenGov gets a story of its own when it lands.

## US-42.24.4 — closed 2026-09-07

Both remaining halves ran on 09-07 and the story is done: 38 of 39 AC pass, AC-16 skipped on BUG-42.24.4-01. The AC for both halves were rewritten first, from the Trust Wallet checklist and from the developer's own test scope in [#4808](https://github.com/Koniverse/SubWallet-Extension/issues/4808), because the originals had been written from the issue titles.

## US-42.24.5 — started 2026-09-07

Proxy accounts, chain-list v0.2.123 and ParaSpell V5, written out to 43 AC from their real scope. AC-1 to AC-8 pass — seeing the proxy list, adding, removing, and a transfer signed by an Any proxy. AC-19 is skipped: Mobile has no governance screen. Six bugs came out of those screens, all display problems.

## US-42.24.20 — twenty bugs waiting on fixes

Twenty-three bugs have been logged across the update. Three are verified fixed with their AC rerun; one cannot be checked on this web-runner; nineteen are open and waiting.

The one to watch is BUG-42.24.2-04: XCM cannot fetch a fee, so no XCM transfer can be sent on any route — the chains added in this chain-list version and pairs that were already in the wallet. It fails AC-10 in US-42.24.2 and REG-20 in the regression story.

Two more reach past any single version: BUG-42.24.19-05 (substrate NFTs do not show on Mobile while the Extension shows them) and BUG-42.24.19-06 (the app loads forever after a long spell in the background). Neither belongs to a chain-list change.

## US-42.24.19 — regression running alongside

The full checklist is being ticked as the version sub-tasks reach the same screens, rather than as one separate pass. Seven REG lines have failed so far, each with a bug behind it. Ten bugs have come out of the regression pass; three of them, on the locked balance tooltip, the derived-account field and the Android back button, hold no REG line. The four combination AC stay open until the checklist is complete on each.
