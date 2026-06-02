# LESSONS.md — Lessons Learned Template

> **File location**: `docs/LESSONS.md`
>
> **Use when**: A bug required a revert, a library had a non-obvious quirk,
> a pattern emerged that will recur, or something would save someone 30
> minutes.
>
> **One rule above all others**: a lesson earns its keep if it saves the
> *next contributor* time. Delete entries that are no longer true (library
> upgraded, framework behavior changed) — stale advice is worse than no
> advice.

---

## 1. Entry template

```markdown
## <N>. <Short title — pattern or trap name>

**What happened (vX.Y.Z → vX.Y+1.Z)**: <concrete incident — 2-4 sentences>

**Why**: <root cause explanation — the mechanism, not just the symptom>

**How to avoid**:
- Rule 1
- Rule 2
- Rule 3

**Pattern** (optional):
```code example if useful```

See [CONTEXT.md D<N>](CONTEXT.md) — link to the related decision entry if applicable.
```

### Finding the next entry number

```bash
grep -n "^## [0-9]" docs/LESSONS.md | tail -5
```

---

## 2. Maintenance rules

- Number sequentially. Never reuse a number even if an entry is deleted.
- Delete entries only when the library was upgraded or behavior fundamentally
  changed. Don't delete for stylistic reasons.
- Reference from commit messages: "Per LESSONS §N".
- Cross-reference from CONTEXT.md and CHANGELOG where relevant.
- A LESSONS entry that needs to *change* should be deleted + re-added with
  a new number, not edited in place — preserves the citation contract.

---

## 3. Filled example

```markdown
## 1. `next build` catches what `tsc --noEmit` cannot

**What happened (v0.19.1 → v0.19.2)**: Added `formatSessionTitle` to
`src/lib/sessions.ts` and imported it from a Client Component
(`chat-layout.tsx`). Local `tsc --noEmit` passed. Vercel's `next build`
errored: `next/headers` cannot be imported from a Client Component. Lost
~10 minutes of debug + a hotfix release.

**Why**: TypeScript validates *types*. It does not enforce the React Server
Components / Client Components boundary or care about webpack's bundle
topology. Only `next build` does both.

**How to avoid**:
- For any change that touches a module imported across the RSC/Client line,
  run `next build` (not just `tsc --noEmit`) before pushing.
- If a Client Component needs a helper that lives next to server code,
  move the helper to its own pure module (no `next/headers`, no
  `getServerSupabase`). Re-export from the original module if needed for
  backward compat with server callers.
- Sniff test: would `grep -r "next/headers"` traverse this import? If yes,
  it can't go in a Client Component bundle.

**Pattern**: see `src/lib/session-title.ts` — pure helpers isolated;
`src/lib/sessions.ts` re-exports for server callers.

See [CONTEXT D45](CONTEXT.md) — the decision to add `next build` to the
pre-commit checklist on the back of this incident.
```
