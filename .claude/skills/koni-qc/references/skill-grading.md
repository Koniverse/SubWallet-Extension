# skill-grading — QC for a *skill* artifact (not a product feature)

> **Load when**: the thing under test is a **skill** (a `SKILL.md` + its
> `references/` / `scripts/`), not a product feature. This is koni-qc's quality
> bar applied to skills. The koni-harness loop loads it in the **Review** stage
> whenever the deliverable being built is a skill.

**Contents**: [Why a separate bar](#why-a-separate-bar) ·
[The four dimensions](#the-four-dimensions) · [How to run each](#how-to-run-each-dimension) ·
[The method (non-negotiable)](#the-method-non-negotiable) ·
[Scorecard](#scorecard) · [Composes, never reproduces](#composes-never-reproduces)

A skill is a *deliverable* like any other, so it gets QC'd — but its failure modes
are not a product's. A skill can be correct prose yet **never trigger**, hold a
rule on paper yet **fold under pressure**, or read well yet **contradict its own
worked example**. `quality-bar.md` grades a feature's *test docs*; this grades the
*skill itself*.

## Why a separate bar

The core discipline is the same as everywhere in koni-qc: **independent
dimensions, an honest self-grade, and a hard numeric bar**. What changes is the
target and the tools. Grade across **four dimensions, each scored /25 (total
/100), each by a _separate_ agent** so the verdicts can't collude (no halo effect
from one grader liking the skill).

**The standard pass bar is ≥95/100 — non-negotiable for every skill in the
catalog.** A skill that scores below 95 does **not** pass review: fix the findings
and re-grade until it clears 95 (foundational / high-blast-radius skills may set a
higher bar, never lower). This is the Koniverse catalog standard, enforced by the
koni-harness Review stage (see [CONTEXT D19](../../../docs/CONTEXT.md)).

**Re-grade the *whole* skill, not just the diff.** After **any** change to a
skill that already passed — even a one-line edit — re-run **all four dimensions**
and confirm it still clears 95. A change can lower a dimension elsewhere (a new
reference drifts a rule; a description edit shifts triggering). Never infer
"still ≥95" from a passing review of the change alone — that is exactly how a
95-skill silently slips to ~91 (see [LESSONS §8](../../../docs/LESSONS.md)).

## The four dimensions

| # | Dimension (/25) | What it measures | Delegated tool |
|---|---|---|---|
| **D1** | Discoverability / triggering | Does the `description` fire on the queries it should and **stay silent on near-misses**? | **skill-creator** (description optimizer / trigger eval), or a blind-router subagent |
| **D2** | Rule-robustness under pressure | Do the skill's **hard rules hold** when an agent is pushed (deadline, authority, sunk cost) to violate them? | **writing-skills** — its `testing-skills-with-subagents.md` (the RED/GREEN pressure-scenario method) |
| **D3** | Content quality | Internal consistency, correctness, the worked example obeys the skill's **own** rules, no gaps a fresh agent would hit | **author-blind review** (`superpowers:code-reviewer` — an agent that did NOT write it) |
| **D4** | Best-practices conformance | Concise; **triggers-only** description (no workflow/ownership summary in frontmatter); progressive disclosure; TOCs on long references; degrees-of-freedom; one worked example | **Anthropic best-practices** — the `anthropic-best-practices.md` that ships *inside* the `writing-skills` skill (load it via that skill; never vendor a copy) |

## How to run each dimension

- **D1 — triggering.** Write ~16–20 realistic queries: 8–10 **should-trigger**
  (varied phrasings, some not naming the skill) + 8–10 tricky **should-NOT**
  near-misses (share keywords but belong to an adjacent skill). A **blind router**
  routes each query to one skill using *descriptions only*; score precision +
  recall for the skill under test. Where the `claude` CLI is available,
  `skill-creator`'s `scripts/run_loop.py` (and `improve_description.py`) automate
  this and optimize the description. **→ /25** (heuristic, use judgment — there's no
  validator): scale by precision × recall; a perfect route is 25, each missed
  should-trigger or false-positive near-miss costs a few points.
- **D2 — pressure.** Using `writing-skills`' `testing-skills-with-subagents.md`,
  give a subagent (that has the skill) a scenario engineered to make it violate
  each hard rule under pressure; the rule holds = GREEN. Optionally run a no-skill
  baseline to confirm the rule is non-obvious (RED). **→ /25**: 25 × (rules that
  held GREEN ÷ rules tested).
- **D3 — author-blind content.** Dispatch `superpowers:code-reviewer` on the skill
  directory; it verifies every load-bearing claim against the actual files and
  ranks findings. **→ /25**: take the reviewer's own score; if it doesn't emit one,
  map by severity as a guide (~8 per surviving Critical, ~4 per Important, ~1 per
  Minor off 25, floored at 0). Pass requires **no Critical/Important
  finding survives** regardless of the number.
- **D4 — best-practices.** Grade against the `anthropic-best-practices.md` inside
  the `writing-skills` skill (load it via that skill — don't vendor a copy).
  Because this is the most subjective dimension, **run it ≥2× and average** to
  cancel grader variance. **→ /25**: the averaged rubric score.

## The method (non-negotiable)

- **One agent per dimension.** Never let a single agent score all four — a grader
  that likes the skill inflates every axis.
- **Re-verify after every fix round.** A fix is new code → it needs a new test.
  Skill quality *converges*; expect 2–3 rounds, and **expect each fix to surface
  the next finding** (the worked example you add to lift D3 can contradict the
  config; the carve-out you add to make a self-grade honest can collide a name).
  See [LESSONS §8](../../../docs/LESSONS.md).
- **Average the subjective axis** (D4) over ≥2 runs.
- **Re-grade all four dimensions, not just the changed file** — after any edit to a
  passing skill, re-run the whole grade (a change can drop a dimension elsewhere).
- **Stop** when a full round yields only Suggestions (no Important/Critical) **and
  the total is ≥95**. If the total is <95, it has not passed — keep fixing.

## Scorecard

Emit one table; total and **PASS only if ≥95**.

| Dimension | Score /25 | Tool | Key findings |
|---|---|---|---|
| D1 Triggering | … | skill-creator / blind-router | … |
| D2 Rule-robustness | … | writing-skills | … |
| D3 Content (author-blind) | … | code-reviewer | … |
| D4 Best-practices | … | anthropic rubric (×2 avg) | … |
| **Total** | **…/100** | — | **PASS (≥95) / FAIL (<95)** |

## Composes, never reproduces

skill-grading contributes the **rubric + the multi-dimension method**; it
**delegates** every actual eval to the tool that owns it — `skill-creator`
(triggering), `writing-skills` (pressure-tests + the best-practices doc),
`superpowers:code-reviewer` (author-blind content). This is the same boundary
koni-qc keeps everywhere: it adds the *coverage intelligence*, it never re-implements
the engines. It is the skill-artifact analog of [`quality-bar.md`](quality-bar.md)
(which grades a feature's test docs) — same philosophy, different target.
