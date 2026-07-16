# regression-learning — the QC harness loop (learn from real bugs, sweep real changes)

> **Load when**: a real bug escaped to prod/staging, a hotfix landed, a bug-bash
> wrapped, a run failed in a *new* way — or a QC round starts and you need to know
> what shipped since the last one ("did we miss cases?", "turn this bug into tests",
> "make the suite learn"). koni-qc is not a one-shot author: it runs as a **harness**
> — every cycle observes real-world signals, converts them into cases, and leaves the
> suite strictly stronger. This file owns that loop; the derivation machinery it
> reuses lives in [`test-design.md`](test-design.md) step 9.

**Contents**: [The loop](#the-loop-observe--capture--derive--generate--enforce) ·
[Every escaped bug becomes three things](#every-escaped-bug-becomes-three-things-the-learning-rule) ·
[The miss post-mortem](#the-miss-post-mortem-why-did-no-tc-catch-it) ·
[The change sweep](#the-change-sweep-changelog--git-log--mandatory-every-qc-round) ·
[Bug-bash intake](#bug-bash--suite-end-of-sprint) · [Ownership](#ownership)

---

## The loop (Observe → Capture → Derive → Generate → Enforce)

The coverage counterpart of koni-harness's execute loop:

1. **Observe** — the real-world signals: escaped bugs / prod incidents, `fix:`
   commits and hotfixes, bug-bash findings, broken handles and orphan IDs from the
   reporter ([`test-automation.md`](test-automation.md) §2), `/design-review`
   failures, newly-flaky tests, support tickets.
2. **Capture** — a `findings.md` entry (`F-n`): one-sentence root cause + the
   **class** it belongs to (an enumeration class, not a story name) + the layer that
   *should* have caught it.
3. **Derive** — the REG case + the generalization sweep (next section).
4. **Generate** — runnable tests per [`test-automation.md`](test-automation.md) §1;
   **test-first while the bug is still open** (the REG test is red against the bug,
   green after the fix — proof it actually reproduces it).
5. **Enforce** — REG cases join the **permanent regression scope** (`RC-` set,
   active every release by definition — [`qc-workflow.md`](qc-workflow.md)
   §Test lifecycle); broken = 0 stays the bar.

One cycle per signal batch; the loop has no terminal state — that is the point.

## Every escaped bug becomes THREE things (the learning rule)

1. **A `REG` TC that reproduces it** — `TC-<EPIC>.REG-<n>`, written red against the
   open bug, flipped green by the fix. **Never close a bug without its REG case** — a
   fix without a regression test is a fix that can silently unfix. When the fix
   already shipped (a change-sweep retro-fit), the reproduction proof is:
   **revert the fix locally (checkout the pre-fix commit or stash the patch) — the
   REG test must go RED there**; record that red run in the finding. Relabeling an
   adjacent passing test as REG proves nothing and fails this rule.
2. **A `findings.md` root-cause entry naming the class** — not "US-3.2 sync bug" but
   "unvalidated concurrent state transition". The class name is what makes step 3
   mechanical.
3. **A generalization sweep** — the bug is *evidence its whole class is
   under-enumerated*: re-run [`test-design.md`](test-design.md) step 9 for **that
   class × every sibling surface**. One cross-tenant leak on `sources` ⇒ re-probe
   every table's RLS; one `NaN` in a KR calculator ⇒ BVA every numeric aggregator;
   one unescaped name field ⇒ injection-probe every free-text input. The sweep emits
   ordinary TCs (`SEC`/`NEG`/`BND`/…) — `REG` marks only the reproduced instance.

## The miss post-mortem (why did no TC catch it?)

For every escaped bug, record which of the four failure modes let it through
(in the `findings.md` entry):

| Mode | It escaped because… | The fix targets |
|---|---|---|
| **Enumeration gap** | the class was never derived at all | the *derivation*: add the class to step 9's list for this suite; if the class is generic (not repo-specific), raise it as a koni-qc skill lesson so every future suite gets it |
| **Density gap** | class derived, this surface never multiplied | the generalization sweep above |
| **Wrong layer** | a case existed but as manual/e2e when a unit/integration probe would have run per-commit | re-layer the case ([`layered-suites.md`](layered-suites.md)) |
| **Execution gap** | the case existed and was automated but did not run where it mattered (broken handle, env-pending in the lane that shipped, CI hole) | the lane/CI wiring ([`test-automation.md`](test-automation.md) §4) |

The post-mortem targets the **class, never just the instance** — one bug fixed plus
one TC added is the floor, not the finish.

## The change sweep (CHANGELOG + git log — MANDATORY every QC round)

A suite silently rots when shipped changes outrun it. At the **start of every QC
round** (the Frame stage, [`qc-workflow.md`](qc-workflow.md) §1) — and at any
koni-harness doc-gate on a covered repo:

1. **Window** = last QC round → `HEAD` (the newest `test-reports/YYYY-MM-DD/` date;
   on a legacy epic-first repo, the newest `EPIC-*/MMDDYYYY/` run date; else the last
   change-ledger row below; none of the three → this is the first round, sweep from
   the coverage plan's baseline instead).
2. **Read BOTH** the CHANGELOG entries in the window **and**
   `git log --oneline <since>..HEAD`. The changelog says what was *declared*; the
   log says what actually *changed* — **diff them**: an undeclared change is itself
   a finding.
3. **Every feat/change entry** → does the touched US/surface have TCs covering the
   *new* behaviour? Missing → derive it (through the normal Design inputs,
   qc-workflow §1 — not ad-hoc).
4. **Every fix entry** → does a `REG` TC exist reproducing what it fixed? **A fix
   with no REG TC is a confirmed miss** (the bug itself proved the suite was blind
   there) → run the miss post-mortem, then apply the three-things rule
   retroactively.
5. **Record in the change-coverage ledger** — a standing table in `findings.md`:
   `window · commit/entry · US · verdict (covered / TC-added / miss → post-mortem) ·
   TC-IDs`. The ledger row is what makes the *next* window computable.

Never skip the sweep because the window is long: cap it at the top-20 riskiest
changes (Tier-1 first, per [`test-organization.md`](test-organization.md) §0) and
record the cut honestly in the ledger — a silently-truncated sweep reads as "swept
everything" when it didn't.

## Bug-bash → suite (end of sprint)

`bug-bash/sprint-YYYY-WNN.md` findings run the same pipeline: every **confirmed**
finding gets the three things; unconfirmed observations land in `findings.md` as
open questions with an owner. A bug-bash whose findings never became TCs was a
social event, not QC.

## Ownership

koni-qc owns the **loop + the ledger format**; `findings.md` / `bug-bash/` live in
the repo ([`test-organization.md`](test-organization.md) §1); **koni-harness** owns
lesson capture at its commit gate — a harness lesson that is a *coverage* lesson
lands here as a class entry, and this loop's step-9 class additions flow back as
skill lessons when generic; the **reporter** ([`test-automation.md`](test-automation.md)
§2) supplies the broken/orphan/env-pending signals the loop observes. gstack /
BMAD are delegates for reproduction and story updates, never replacements for the
REG case.
