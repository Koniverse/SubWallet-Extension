# ARCHITECTURE.md — System Architecture Template

> **File location**: `docs/ARCHITECTURE.md`
>
> **Use when**: User asks to create/update system architecture, document
> tech stack, record component architecture, or after BMad produces
> architecture artifacts that need standardization.
>
> **Relationship to CONTEXT.md**: ARCHITECTURE.md is the *synthesized*
> structured reference — updated in-place. CONTEXT.md is the *append-only*
> decision log. Individual architecture decisions are recorded in
> CONTEXT.md (with rationale); ARCHITECTURE.md gets the AD-N summary row
> + the architectural state-of-the-world they describe.

---

## 1. Template skeleton

````markdown
# ARCHITECTURE — <Project Name>

> Last updated: YYYY-MM-DD (vX.Y.Z)
> Maintainer: <team or lead>

## System overview

<3-5 sentence executive summary: what the system does at a high level,
the primary architectural style (monolith, microservices, serverless, etc.),
and the key architectural drivers (scale, latency, compliance, cost).>

## Tech stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Runtime | Node.js / Python / Go | X.Y | <one sentence why> |
| Framework | Next.js / FastAPI / etc. | X.Y | <one sentence why> |
| Database | PostgreSQL / etc. | X.Y | <one sentence why> |
| Cache | Redis / etc. | X.Y | <one sentence why> |
| Queue | — | — | — |
| Hosting | Vercel / Fly.io / AWS | — | <one sentence why> |
| Auth | NextAuth.js / Clerk / etc. | X.Y | <one sentence why> |
| Monitoring | Sentry / Datadog / etc. | — | <one sentence why> |

## Component architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Web App    │────▶│   API Layer  │────▶│   Database   │
│  (Next.js)   │     │  (tRPC/REST) │     │ (PostgreSQL) │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │
       ▼                     ▼
┌──────────────┐     ┌──────────────┐
│    Auth      │     │    Queue     │
│ (NextAuth)   │     │  (optional)  │
└──────────────┘     └──────────────┘
```

| Component | Responsibility | Tech | Key files |
|-----------|---------------|------|-----------|
| Web App | UI rendering, client state, routing | Next.js 14 (App Router) | `app/`, `components/` |
| API Layer | Business logic, validation, DB queries | tRPC / REST | `server/api/`, `app/api/` |
| Database | Persistent storage, migrations | PostgreSQL + Prisma | `prisma/schema.prisma` |
| Auth | Session management, OAuth flows | NextAuth.js | `server/auth.ts` |

## Data architecture

### Core models

| Model | Table | Key fields | Indexes |
|-------|-------|------------|---------|
| User | `users` | id, email, name, created_at | `email (unique)` |
| Task | `tasks` | id, user_id, title, status, priority, created_at | `user_id`, `status` |

### Data flow

```
Client (browser)
  │  POST /api/tasks  { title, description }
  ▼
API Route (Next.js Route Handler)
  │  validate input (zod)
  │  check auth (getServerSession)
  ▼
Prisma Client
  │  INSERT INTO tasks ...
  ▼
PostgreSQL
  │  returns new row
  ▼
API Route
  │  return JSON response
  ▼
Client (optimistic update + revalidate)
```

## API architecture

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/tasks` | GET | Required | List user's tasks |
| `/api/tasks` | POST | Required | Create task |
| `/api/tasks/[id]` | PATCH | Required | Update task |
| `/api/tasks/[id]` | DELETE | Required | Delete task |

### Error response format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "field": "title"
  }
}
```

## Security architecture

| Concern          | Approach                 | Detail                                                 |
| ---------------- | ------------------------ | ------------------------------------------------------ |
| Authentication   | NextAuth.js JWT sessions | HttpOnly cookie, 30-day expiry                         |
| Authorization    | Row-level ownership      | All queries filter by `user_id = session.user.id`    |
| Input validation | Zod schemas              | Every API input validated at the boundary              |
| CSRF             | NextAuth built-in        | Double-submit cookie pattern                           |
| Secrets          | Environment variables    | `.env.local` (never committed), validated at startup |

## Deployment architecture

```
GitHub (main branch)
  │  git push
  ▼
GitHub Actions (CI)
  │  lint → typecheck → test → build
  ▼
Vercel (hosting)
  ├── Production (main)     → app.koni.app
  └── Preview (PR branches) → *.vercel.app
  │
  ▼
Supabase (PostgreSQL)
  └── Production database
```

| Environment | URL                 | Branch    | DB               |
| ----------- | ------------------- | --------- | ---------------- |
| Production  | app.koni.app        | main      | Supabase prod    |
| Preview     | `<pr>.vercel.app` | feature/* | Supabase staging |

## Integration architecture

| External service   | Purpose            | Auth method     | Fallback                   |
| ------------------ | ------------------ | --------------- | -------------------------- |
| `<Service name>` | `<what it does>` | API key / OAuth | `<graceful degradation>` |

## Architecture decisions

<BMad standard: each architecture decision gets an AD-N identifier.
Summary table here; full rationale in CONTEXT.md D<N> entries.
Use AD-N IDs in story Dev Notes to reference which decisions apply.>

| ID  | Topic       | Summary                        | Version | CONTEXT Ref      |
| --- | ----------- | ------------------------------ | ------- | ---------------- |
| AD-1 | `<title>` | <one sentence summary>         | vX.Y.Z  | [D1](CONTEXT.md) |
| AD-2 | `<title>` | <one sentence summary>         | vX.Y.Z  | [D2](CONTEXT.md) |

Individual decisions that shaped this architecture are recorded in [CONTEXT.md](CONTEXT.md).
Link new architecture decisions from CONTEXT.md here as they are recorded.

## Open architecture questions

- [ ] <unresolved architecture question>
- [ ] <tradeoff being evaluated>
````

---

## 2. Updating ARCHITECTURE.md

- **When**: After any architecture decision (CONTEXT.md entry), tech stack
  change, or new integration.
- **How**: Edit the relevant section in-place. Update the `Last updated`
  date and version.
- **Cross-reference**: Always link the relevant CONTEXT.md entry in the
  AD table.
- **Omit empty sections**: If a section (e.g., Queue, Integration) has no
  content, remove it. Add it back when needed.

---

## 3. Filled example (condensed)

> Full ARCHITECTURE files run 600–1000 lines. The snippet below shows the
> shape of `System overview` + `Tech stack` + `Architecture decisions` —
> the three sections most often consulted by reviewers.

```markdown
# ARCHITECTURE — Koni-ERP-02

> Last updated: 2026-05-07 (v0.76.0)
> Maintainer: founder / @jindo9986

## System overview

Koni-ERP-02 is a single Next.js App Router monolith deployed on Vercel,
with Supabase for Postgres + Auth + RLS, Inngest for scheduled syncs +
event-driven jobs, and per-workspace BYOK LLM providers (Anthropic /
OpenAI / Gemini / Qwen) for the NL→SQL pipeline. Multi-tenant from day
one via row-level security (every table carries `workspace_id`, every
policy filters by `user_workspaces()`). Architectural drivers: self-serve
onboarding (10-minute time-to-first-answer), self-host friendliness,
sub-1s NL→SQL latency on warm cache.

## Tech stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Runtime | Node.js | ≥20 LTS | Vercel + Inngest both target Node |
| Framework | Next.js | 15 (App Router) | RSC + Server Actions; OAuth + chat fit cleanly |
| Database | PostgreSQL via Supabase | 15 | RLS upfront cost <2 days; rebuild past 5 tenants takes weeks |
| Auth | Supabase Auth | 2.x | Email + OAuth; SSR cookie helper |
| Jobs | Inngest | 3.x | Cron 6h + event-driven; local dev server |
| LLM | Anthropic Claude (default) | claude-sonnet-4-6 | BYOK lets workspaces swap providers |
| Hosting | Vercel | — | Edge + CDN; preview deploys on PR |

## Architecture decisions

| ID  | Topic | Summary | Version | CONTEXT Ref |
| --- | ----- | ------- | ------- | ----------- |
| AD-1 | Multi-tenant RLS from day 1 | Every table `workspace_id NOT NULL`; policy `workspace_id IN (SELECT user_workspaces())` | v0.1.0 | [D4](CONTEXT.md) |
| AD-2 | Hardcoded connectors → abstract after Stripe (rule-of-three) | GitHub = #1, Linear = #2, Stripe = #3 will trigger refactor | v0.1.0 | [D4](CONTEXT.md) |
| AD-3 | Editable SQL preview UX | Confidence badge + SQL collapsed but editable; revised in v0.7.0 to auto-run | v0.7.0 | [D4](CONTEXT.md) |
| AD-4 | BYOK key encryption via AES-256-GCM | Master encryption key in env; same scheme reused for OAuth tokens (v0.20.0) | v0.20.0 | [D38](CONTEXT.md) |

Individual decisions are recorded in [CONTEXT.md](CONTEXT.md).
```
