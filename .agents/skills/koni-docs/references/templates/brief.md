# BRIEF.md — Product Brief Template

> **File location**: `docs/BRIEF.md`
>
> **Use when**: User asks to create/update product brief, executive brief,
> or after BMad brainstorm produces a brief that needs standardization.
>
> **Source**: Maps directly from BMad `brief.md` (planning artifact). The
> Brief is the executive-facing document that defines the product vision
> *before* detailed requirements are written. PRD §1 Executive Summary
> derives from this file.

---

## 1. Template skeleton

```markdown
# Product Brief: {Product Name}

## Executive Summary

[2-3 paragraph narrative: What is this? What problem does it solve?
Why does it matter? Why now? This should be compelling enough to stand
alone — if someone reads only this section, they should understand the
vision.]

## The Problem

[What pain exists? Who feels it? How are they coping today? What's the
cost of the status quo? Be specific — real scenarios, real frustrations,
real consequences.]

## The Solution

[What are we building? How does it solve the problem?
Focus on the experience and outcome, not the implementation.]

## What Makes This Different

[Key differentiators vs alternatives. Why this approach? What's the
unfair advantage? Be honest — if the moat is execution speed, say so.]

| Competitor | What They Do | Our Advantage |
|-----------|-------------|---------------|
| {name} | {description} | {why we're better} |

## Who This Serves

**Primary user: {persona name}**
- {demographics, context, behavior}
- {core need they're trying to satisfy}

**Secondary user: {persona name}** (if applicable)
- {demographics, context, behavior}

## Success Criteria

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| {metric 1} | {target} | {target} |
| {metric 2} | {target} | {target} |

## Scope

### In Scope (MVP)
- {feature / capability included in first release}

### Out of Scope (v1.0)
- {feature explicitly deferred to future versions}

## Vision

[Where does this go if it succeeds? What does it become in 2-3 years?
Inspiring but grounded — 1 paragraph.]
```

---

## 2. Updating BRIEF.md

- **When**: During initial product definition, or after BMad brainstorm → brief
  pipeline produces output.
- **How**: Write the full brief. On major pivots, update in-place and record
  the change in CONTEXT.md.
- **Cross-reference**: PRD §1 Executive summary derives from BRIEF.md. Link
  to BRIEF.md from the PRD header.

---

## 3. Filled example (condensed)

```markdown
# Product Brief: Koni ERP

## Executive Summary

Koni ERP is a self-serve AI data layer for tech teams under 1000 employees
— a chat box that answers business questions in plain English, drawing
data from the SaaS tools the team already uses (GitHub, Linear, Stripe).
The wedge V1 is GitHub + Linear for founders and Heads of Engineering,
with multi-tenant Row-Level Security from day one.

The opportunity: companies <1000 employees can't afford fully-integrated
ERPs and end up running a SaaS combo, which fragments their data.
Glean-style products solve adjacent problems but require an 8-week
procurement cycle. We ship self-serve, BYOK, and self-host-friendly
from day one.

## The Problem

A founder running 5 SaaS tools (GitHub, Linear, Stripe, HubSpot, Notion)
cannot answer "how many PRs did we merge last week and what % shipped
features customers paid for". Each tool has its own dashboard; none of
them speaks to the others; a SQL-fluent analyst is still 18 months of
headcount away. The status quo is "open 5 tabs and eyeball it" — which
means most teams never ask the question.

## The Solution

A chat box at `erp.koni.studio`. Connect tools via OAuth (5-click
self-serve), the system ingests into a multi-tenant Postgres with RLS,
and natural-language questions get answered by an NL→SQL pipeline with
the SQL preview shown for power users. BYOK so workspace owners bring
their own Anthropic / OpenAI / Gemini / Qwen key.

## What Makes This Different

| Competitor | What They Do | Our Advantage |
|-----------|-------------|---------------|
| Glean | Enterprise search + AI assistant | Self-serve, no 8-week procurement |
| Looker / Metabase | BI on warehoused data | No ETL — direct connector ingest |
| ChatGPT + custom GPT | LLM Q&A | Multi-tenant RLS + BYOK + connector framework |

## Who This Serves

**Primary user: technical founder (V1 PLG)**
- 10-100 employees, tech-comfortable, already running GitHub + Linear
- Wants weekly insight cadence without hiring a data team

**Secondary user: Head of Data (V2 sales-led)**
- 100-1000 employees, needs SOC 2 + self-host + SSO
- Today running a Looker / Metabase stack against ETL'd warehouses

## Success Criteria

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| Active workspaces | 100 | 1000 |
| Weekly query volume / workspace | 30 | 100 |
| Self-serve OAuth completion rate | 60% | 80% |

## Scope

### In Scope (MVP)
- GitHub + Linear connectors
- NL→SQL with confidence badge + editable preview
- BYOK Anthropic / OpenAI / Gemini / Qwen

### Out of Scope (v1.0)
- Stripe connector (triggers connector-abstraction refactor, rule-of-three)
- Self-host / on-prem (V2 sales-led tier)
- Custom dashboards (chart-pinning ships in a later release)

## Vision

In 24 months: every tech company under 1000 employees has a Koni ERP
workspace as their default "ask the business a question" surface. The
connector framework supports 20+ SaaS tools, and a small but defensible
enterprise tier ships self-host + SSO for the V2 segment.
```
