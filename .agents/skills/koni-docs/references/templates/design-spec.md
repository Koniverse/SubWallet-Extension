# DESIGN Spec for a Story — Template

> **File location**: `docs/design/US-X.Y-<slug>-design.md`
>
> **Use when**: A story has significant visual complexity or interaction
> nuance that warrants a dedicated design spec. Skip for stories that fit
> comfortably inside the story file's AC list.
>
> **Relationship to DESIGN.md (the design system)**: `DESIGN.md` at the
> repo root is the project-wide design system (typography, color, spacing,
> primitives). Per-story design specs live in `docs/design/` and
> *reference* the system. Always cite the §-section of DESIGN.md being
> applied — and document any deviation with rationale.

---

## 1. Template skeleton

```markdown
# US-X.Y — <Story title> — Design Spec

> **Status**: 📋 Backlog / 🚧 In Progress / ✅ Done (vX.Y.Z)
> **PRD ref**: [FR-N](../PRD.md), [§11 EPIC-X US-X.Y](../PRD.md)
> **Story**: [stories/US-X.Y-<slug>.md](../sprints/stories/US-X.Y-<slug>.md)
> **Epic**: [EPIC-X](../sprints/epics/EPIC-X.md)
> **DESIGN refs**: [§N <section name>](../../DESIGN.md)
> **LESSONS refs**: [§N <related trap>](../LESSONS.md)

## Context

<why this story warrants a design spec — 1 paragraph. State what's
visually or interactionally complex enough that the story file's AC
list cannot capture it.>

## Screens / states

<List every screen this story touches, and every state each screen
must handle. Empty / loading / populated / error are the default four;
add more (e.g. "expired token", "rate limited") if the story surfaces them.>

| Screen | State | Notes |
|---|---|---|
| <route or component name> | empty / loading / populated / error | <any constraint> |

## Layout decisions

<Which DESIGN.md sections apply (§X) and any deviations from them with
rationale. Reviewers reject deviations without a stated reason.>

- **DESIGN.md §N <section>**: applied to <surface>.
- **Deviation**: <what differs and why> — accepted because <reason>.

## Component inventory

<Every component this story uses. Mark new components vs reused. For
reused, cite the source path so reviewers can verify the variant.>

| Component | Source | Notes |
|---|---|---|
| `<Button>` | shadcn/ui primitive | — |
| `<ProjectShell>` | new (this story) | <responsibility> |

## Open questions

- [ ] <unresolved design choice — assign a decision owner if blocking>
- [ ] <tradeoff being evaluated>
```

---

## 2. Filled example (condensed)

```markdown
# US-3.7 — Per-pod project management view (Projects v2-style) — Design Spec

> **Status**: 📋 Backlog (V1 design approved 2026-05-02). Awaiting build.
> **PRD ref**: [FR-18](../PRD.md), [§7 EPIC-3 US-3.7](../PRD.md)
> **Story**: [stories/US-3.7-pod-project-management.md](../sprints/stories/US-3.7-pod-project-management.md)
> **DESIGN refs**: [§11.8 two-column shell](../../DESIGN.md), [§11.7 loading-transition](../../DESIGN.md)
> **LESSONS refs**: [§22 public route trust boundary](../LESSONS.md), [§29 unstable_cache + workspace-scoped key](../LESSONS.md)

## Context

The agile-MD convention (`Docs/sprints/` markdown parsed into Stories +
Epics + Sprints) already works for the Koni dev team. Hypothesis: any pod
team that follows the same convention should get the same agile UI
inside Koni without building a separate DB-backed tracker. V1 reads each
pod's connected GitHub repos via Octokit; no migration, no new storage.

## Screens / states

| Screen | State | Notes |
|---|---|---|
| `/dashboard/data-sources/pods/[slug]/project` | empty (no path configured) | CTA → Settings → Pod → Project path |
| `/dashboard/data-sources/pods/[slug]/project` | loading (initial fetch) | Skeleton table, nav progress bar (DESIGN §11.7) |
| `/dashboard/data-sources/pods/[slug]/project` | populated (Table) | Sortable, click-row → GitHub external link |
| `/dashboard/data-sources/pods/[slug]/project` | populated (Board) | Status columns; mobile stacks |
| `/dashboard/data-sources/pods/[slug]/project` | error (Octokit 401) | "Token expired — reconnect GitHub" + CTA |

## Layout decisions

- **DESIGN.md §11.8 two-column shell** applied: left sidebar = pod nav,
  right pane = view toolbar + table/board.
- **DESIGN.md §11.7 loading-transition** applied: `<NavProgressBar>` for
  view switches; `<PageTransition>` fade-in on first render.
- **Deviation**: Board view uses *full-width* kanban (not the standard
  §11.8 two-column inset) to fit 5 status columns on a 1440px viewport.

## Component inventory

| Component | Source | Notes |
|---|---|---|
| `<ProjectShell>` | new (this story) | View toolbar (Table | Board | Roadmap) |
| `<ProjectTableView>` | new | Wraps shadcn `<Table>` with sort + group-by |
| `<ProjectBoardView>` | new | DnD via react-dnd-kit (read-only V1) |
| `<StatusBadge>` | shared `src/components/ui/status-badge.tsx` | Per DESIGN.md §11.5 |

## Open questions

- [ ] Should sprint filter default to "current sprint" or "all"? Tracking telemetry needed.
- [ ] Drag-write back (commit to repo) — V2 or V3?
```
