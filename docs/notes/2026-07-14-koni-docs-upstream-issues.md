# koni-docs upstream: three bugs, one root cause

**Status:** drafted 2026-07-14, **not yet filed.** Ready to paste.
**Target:** `@koniverse/koni-docs` (CLI `0.8.1`, current latest) and `Koniverse/Koni-Skills` (the vendored spec).
**Found by:** the EPIC-21 conformance program on `SubWallet-Extension` (174 → 177 stories, 21 epics).

---

## Why this is one issue and not three

All three bugs are the same mistake: **the tooling assumes every document is a story.**

`frontmatter-spec.md` defines **three** document types with **three different field sets**
(§3.1 story, §3.2 epic, §3.3 sprint). The code branches on `metadata.id` being present — which
is true for all three — and then reads the *story* field set from whichever one it got.

The symptoms differ; the fix is one idea: **branch on the document type.**

Impact on a real project: **120 of 174 stories were flagged**, of which **117 were false
positives**. That buried the 3 warnings that were real (two stories claiming `in-progress`
with no owner; one in `review` on no sprint). A warning view with a **39:1 noise ratio** is a
warning view the team has already learned to ignore — which is worse than having none.

---

## Bug 1 — `warnings.ts` requires `sprint`, but the spec says it is conditional

**`src/viewer/lib/warnings.ts:39`**

```ts
const NON_BACKLOG_REQUIRED: WarningField[] = ['priority', 'points', 'sprint', 'assignee'];
```

**`references/frontmatter-spec.md` §3.1** says:

| Field | Required? | Pattern | Notes |
|---|---|---|---|
| `sprint` | **conditional** | `^sprint-\d{4}-W\d{2}$` **or `''`** | Set when committed to a sprint. |

`''` is an explicitly listed valid value. The code treats it as a defect.

This bites hardest on a project that **adopts koni-docs on top of existing history** — exactly
the case the `backfill-*` commands exist to serve. 113 of our stories shipped between 2022 and
2026, **before any sprint existed**. They cannot have been "committed to a sprint".

**Either the spec is right or the code is — they cannot both be.** We think the code is closer
to right (work in flight *should* be locatable on a board), so we propose the reconciliation in
the patch below, and we changed our own vendored spec to match it. But **please decide upstream**,
because right now a reader of the spec and a reader of the warning view are told opposite things.

---

## Bug 2 — `warnings.ts` requires `version_shipped` on every `done` story

**`src/viewer/lib/warnings.ts:40`**

```ts
const DONE_REQUIRED: WarningField[] = [...NON_BACKLOG_REQUIRED, 'version_shipped', 'commit'];
```

A story in an epic that **materializes no requirement** (`prd_ref: []` — docs, tooling, infra)
**ships in no release**. Its delivery artifact is a commit. It can never have a
`version_shipped`, so under this rule it **can never leave `review`**.

That is not cosmetic. It forces `review` to mean two different things — *"awaiting a reviewer"*
and *"finished, but unrepresentable"* — and a kanban column that means two things is dead.

Our three docs-infrastructure stories sit exactly here. We resolved it locally by carving out
the case in the spec:

> `version_shipped` is MANDATORY when `status: done` **and the story's epic materializes a
> requirement**. A story in an epic with `prd_ref: []` is `done` on: every AC ticked + a real
> `commit` + `validate` green. `version_shipped` stays empty **on purpose**.

---

## Bug 3 — sprint and epic pages are rendered with the *story* field grid

**`src/viewer/pages/docs/[...file].astro:43-49`**

```jsx
{metadata.id && (                                  // ← true for stories, epics AND sprints
  <div>Story ID  {metadata.id}</div>               // a sprint is not a story
  <div>Epic      {metadata.epic     ?? '—'}</div>  // sprints have no `epic`
  <div>Sprint    {metadata.sprint   ?? '—'}</div>  // sprints have no `sprint`
  <div>Assignee  {metadata.assignee ?? '—'}</div>  // sprints have no `assignee`
  <div>Points    {metadata.points   ?? 0}</div>    // sprints have no `points` → renders "0"
```

Per §3.3 a sprint has **exactly five fields**: `id`, `status`, `start`, `end`, `goal`. None of
the four above. So every sprint page shows `Epic —`, `Sprint —`, `Assignee —`, labelled
**"Story ID"**.

**`Points ?? 0` is the worst of them.** `—` reads as *"absent"*. **`0` reads as *"present, and
equal to zero"*.** Our 21-point sprint renders `Points 0`. That is not a missing value — it is a
**fabricated** one, and a reader has no way to tell.

A maintainer looking at this reasonably concludes the data is incomplete and goes to "fix" it —
by inventing fields the spec forbids. The tool is actively teaching people to corrupt their docs.

---

## Bug 4 (bonus) — `validate` does not enforce the spec's own enums or ID patterns

Not in the three above, but the reason they survived. `validate` checks that references
*resolve*; it does not check that values are *legal*:

- Sprint `status` must be `planned | in-progress | closed` (§3.3). **We wrote `done`** — the
  *story* enum — and `validate` passed. Caught only when a human happened to open the file.
- Sprint IDs must match `^sprint-\d{4}-W\d{2}$` (§2). We tested `sprint-2022-M10`: **`validate`
  passes**, because nothing checks the pattern.

**A rule with no check is a rule nobody notices breaking.** These are three greps.

---

## Proposed patch — `src/viewer/lib/warnings.ts`

Requirements by status, not one list for everything. `sprint` is demanded of **work in flight**
(if you are doing it, it should be on a board) but not of **finished** work — because for a
`done` story, `version_shipped` + `commit` is **strictly stronger** evidence: it is provable
with `git merge-base --is-ancestor`, and a sprint label proves nothing.

```ts
const REQUIRED_BY_STATUS: Record<string, WarningField[]> = {
  'ready':       ['priority', 'points'],
  'in-progress': ['priority', 'points', 'sprint', 'assignee'],
  'review':      ['priority', 'points', 'sprint', 'assignee'],
  'blocked':     ['priority', 'points', 'sprint', 'assignee'],
  'done':        ['priority', 'points', 'assignee', 'commit'],
  'backlog':     [],
  'deprecated':  [],   // a dead story needs no owner and no board
};

export function findStoryWarnings(stories: StoryRow[], epics?: EpicRow[]): StoryWarning[] {
  const warnings: StoryWarning[] = [];
  const epicHasRequirement = (id: string) =>
    (epics?.find(e => e.id === id)?.prd_ref?.length ?? 0) > 0;

  for (const story of stories) {
    const required = [...(REQUIRED_BY_STATUS[story.status] ?? [])];

    // A done story only owes a version if its epic materializes a requirement.
    // Docs / tooling / infra epics (prd_ref: []) ship in no release.
    if (story.status === 'done' && epicHasRequirement(story.epic)) {
      required.push('version_shipped');
    }

    const missing = required.filter(f => isMissing(f, story));
    if (missing.length > 0) warnings.push({ ...story, missing });
  }
  return warnings;
}
```

On our corpus this takes **120 warnings → 3**, and all 3 are real defects.

## Proposed patch — `src/viewer/pages/docs/[...file].astro`

```jsx
{metadata.id?.startsWith('US-') && ( /* story: id, epic, sprint, assignee, points, status */ )}
{metadata.id?.startsWith('EPIC-') && ( /* epic: id, status, prd_ref, arch_ref */ )}
{metadata.id?.startsWith('sprint-') && ( /* sprint: id, status, start → end, goal */ )}
```

And **never `?? 0`** on a field the document type does not have. Absent is not zero.

---

## What we changed locally, and why it will be overwritten

- **Spec** (`.agents/skills/koni-docs/references/`) — reconciled to the code, `sprint` required
  once a story leaves `backlog`, plus an `M` (reconstructed month) cadence for pre-adoption
  history. **The next `chore: install koni-docs skill` overwrites this.**
- **Code** — not patched; **the next `npm i -g` would overwrite it.**

So the rules are duplicated into `AGENTS.md §7`, the only file nothing overwrites. That is a
workaround for a project, not a fix for the framework — hence this issue.

## References

- `SubWallet-Extension` — `docs/CONTEXT.md` D97 (the done-gate carve-out), D99 (the `M` cadence),
  D100 (a story is the unit of status), D101; `docs/LESSONS.md` §65, §66.
