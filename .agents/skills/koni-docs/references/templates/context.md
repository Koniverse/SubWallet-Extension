# CONTEXT.md — Decision Log Template

> **File location**: `docs/CONTEXT.md`
>
> **Use when**: User asks to record a product / architecture decision,
> revise an earlier decision, or log "why we picked X over Y".
>
> **One rule above all others**: CONTEXT.md is append-only (RULE-7). Never
> rewrite a past decision; record a revision entry that references the
> original by ID. Future-you reads this when wondering "why did we pick
> X over Y" — silently editing history breaks that contract.

---

## 1. Phase header

Group decisions chronologically by phase. Each phase gets a single header.

```markdown
---

## Phase N — <Phase name> (YYYY-MM-DD, shipped vX.Y.Z)
```

---

## 2. Decision entry template (D`<N>`)

```markdown
### D<N>. <Short decision title>

**Context**: <1-2 sentences: what problem triggered this decision>

**Decision**: <what was decided, specific and concrete>

**Rationale**: <why this option over alternatives — the "because" is mandatory>

**Alternatives considered** (optional):
- Option A — why rejected
- Option B — why rejected

**Impact**: <what this changes in the codebase or product>

**Date**: YYYY-MM-DD
**Version**: vX.Y.Z
```

### Finding the next D`<N>` number

```bash
grep -n "^### D[0-9]" docs/CONTEXT.md | tail -5
```

Increment by 1. Never reuse a number, even if a decision is deleted.

---

## 3. Revision entry template (revision of D`<M>`)

When a prior decision needs to change, add a NEW entry that points back
at the original. Never edit the body of the original.

```markdown
### D<N>. <Title> (revision of D<M>)

**What changed**: <what was wrong or outdated in D<M>>

**New decision**: <the corrected or updated decision>

**Rationale**: <why the revision was needed>

**Date**: YYYY-MM-DD
**Version**: vX.Y.Z
```

---

## 4. Anti-patterns (RULE-7)

| Wrong                                | Correct                               |
| ------------------------------------ | ------------------------------------- |
| Edit body of past entry D`<M>`       | Add new D`<N>` referencing D`<M>`     |
| Delete a wrong decision              | Add correction entry                  |
| Leave rationale blank ("we chose X") | Always include "because Y"            |
| One huge entry covering 10 decisions | One entry per decision                |

---

## 5. Filled example

```markdown
## Phase 0 — Brainstorm & PRD (2026-04-29 morning)

### D3. TAM expansion (IMPORTANT PIVOT)

**Context**: Initial brainstorm assumed TAM = companies with <30 employees
(very early stage). Founder pushed back during the /office-hours review.

**Decision**: TAM = companies <1000 employees, with a 2-tier persona model:
- **V1 (PLG)**: <100 employees, founder / Head of Engineering
- **V2 (sales-led)**: 100-1000 employees, Head of Data, mid-market

**Rationale**: companies under 1000 employees all hit the "data scattered
across many tools" problem, not just <30. Sub-1000 companies cannot afford
fully-integrated ERPs and end up running a SaaS combo, which fragments
their data. Targeting only <30 leaves the wedge customer intact while
expanding the addressable market 30×.

**Alternatives considered**:
- Stay at <30 employees — rejected: too narrow to defend a venture-scale outcome.
- Jump straight to enterprise — rejected: V1 product-market fit needs PLG motion first.

**Impact**: V2 requires compliance (SOC 2, regional data-residency), self-host
option, SSO. Ship V1 first, V2 follows. Updates `BRIEF §Who This Serves` and
PRD §5 Personas.

**Date**: 2026-04-29
**Version**: pre-v0.1.0
```
