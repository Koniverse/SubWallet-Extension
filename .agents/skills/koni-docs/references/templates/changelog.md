# CHANGELOG Entry — Template

> **File location**: `docs/CHANGELOG.md` (or `Docs/CHANGELOG.md` — match
> the project's existing casing).
>
> **Use when**: User asks to write a changelog entry, ship a version, or
> close a story.
>
> **One rule above all others**: every code-shipping commit bumps `VERSION`
> AND adds a new entry to CHANGELOG.md IN THE SAME COMMIT (RULE-1). The
> commit hash goes into the entry at pre-commit time — `pending` is never
> acceptable (RULE-2).

---

## 1. Template skeleton

```markdown
## [X.Y.Z] — YYYY-MM-DD — <short descriptive title> — vX.Y.Z

<1-3 sentence description: what shipped and why. Include root cause for bug fixes.>

### Added
- <Feature / component added>

### Changed
- <Behavior or API changed — old vs new>

### Fixed
- <Bug description + root cause in one sentence>

### Removed
- <What was dropped and why>

### Security
- <CVE or hardening detail>

**Commit**: <7-char or full SHA>
```

---

## 2. Rules

- Only include sections that have content. Omit empty sections.
- `**Commit**: pending` is NEVER acceptable (RULE-2). Use the full landing
  SHA, set at pre-commit.
- Entries in reverse-chronological order — newest at top.
- Never reorder or edit past entries.
- Version tag appears twice: `[X.Y.Z]` in header AND `— vX.Y.Z` inline —
  both required for `git log --grep`.

---

## 3. Safe CHANGELOG insertion

**WRONG** (eats previous version header):

```
oldString = "## [0.63.3] — ..."
newString = "## [0.63.4] ...\n\n## [0.63.3] — ..."
```

**CORRECT** — anchor on `[Unreleased]` section:

```
oldString = "## [Unreleased]\n\n(empty — track here while in dev but not yet shipped)\n\n---"
newString = "## [Unreleased]\n\n(empty...)\n\n---\n\n## [X.Y.Z] — ...\n\n...content..."
```

---

## 4. Filled example

```markdown
## [0.63.4] — 2026-01-15 — Add pod project management — v0.63.4

Shipped pod-based project grouping with drag-and-drop reordering. Users can now
organize projects into custom pods for better workspace navigation.

### Added
- Pod creation and deletion UI in workspace settings
- Drag-and-drop project-to-pod assignment
- Pod filter chips in project list

### Fixed
- Project list not updating after workspace switch (missing `revalidatePath` in
  workspace change handler)

**Commit**: a1b2c3d
```
