# live-harness — standing up the live-stack test harness (integration + e2e)

> **Load when**: integration/e2e tests need a **real running stack** (live DB with
> RLS, a browser against a real build) and none exists yet — "how do I test RLS as a
> user?", "stand up the integration harness", "e2e can't log in", "supabase won't
> boot for tests". This was the single biggest automation blocker in the ERP
> 9.3%→100% drive; these are the proven recipes, stated as a **stack-neutral pattern**
> with the Koniverse default stack (Supabase + Next.js + Playwright) as the worked
> example. [`test-automation.md`](test-automation.md) owns *running + reporting*;
> this file owns *making the stack testable at all*.

**Contents**: [The pattern](#the-pattern-four-properties) ·
[Integration: test RLS as a real user](#integration-test-rls-as-a-real-user-the-2-credential-recipe) ·
[Per-test tenant isolation](#per-test-tenant-isolation-parallel-safe-seeding) ·
[e2e: self-seeding](#e2e-self-seeding-never-gate-on-hand-configured-secrets) ·
[Boot resilience](#boot-resilience) · [Safety rules](#safety-rules-non-negotiable) ·
[Ownership](#ownership)

---

## The pattern (four properties)

Whatever the stack, the harness must deliver:

1. **Authority split** — a privileged client for *seeding* + a user-scoped credential
   for *asserting* (permissions must be evaluated as the user, never as admin).
2. **Isolation per test** — each test seeds its own tenant/workspace so one shared
   local DB is parallel-safe.
3. **Self-sufficiency** — the suite creates everything it needs (users, data, env) in
   its own setup; it never depends on a hand-configured secret or a pre-clicked UI.
4. **Skip, don't error** — when the live env is absent (a DB-less CI lane, a fresh
   clone), the suite **skips with a message**, it does not fail the run. The inverse
   holds in the **designated live CI lane**: there, env-absent / all-live-suites-skipped
   is a **red** run ([`test-automation.md`](test-automation.md) §4) — otherwise a
   misconfigured env greens a gate that asserted nothing live.

## Integration: test RLS as a real user (the 2-credential recipe)

RLS/permission tests are meaningless through a service-role connection (it bypasses
policy). The recipe:

- `serviceClient()` — service-role key, **bypasses RLS — used ONLY for seeding and
  cleanup**, never inside an assertion.
- `userClient(userId)` — the anon key **plus a hand-minted HS256 JWT** signed with the
  local stack's known JWT secret, `sub = userId` — so every query evaluates policy
  **as that user**. This is what turns "RLS exists" into "RLS is asserted": owner-read,
  cross-tenant isolation (the other user's rows do NOT appear), and client
  write-rejection, per table ([`layered-suites.md`](layered-suites.md) required class 2).
- `hasIntegrationEnv` guard — no env → `describe.skip` with a reason (property 4).

## Per-test tenant isolation (parallel-safe seeding)

Create a **fresh auth user per test** via the admin API and let the app's own
provisioning path (e.g. a `handle_new_user` trigger) build the isolated
workspace/tenant — then seed rows into *that* tenant and clean up in `afterAll`. One
shared local DB, zero cross-test interference, and the provisioning path itself gets
exercised on every run. Never share a seeded tenant across test files.

## e2e: self-seeding (never gate on hand-configured secrets)

- **Create the e2e user in-workflow** (a `seed-e2e` script run in setup) — a suite that
  needs a human to pre-create an account is not automated.
- **Point the build at the local stack with a gitignored env override** (e.g.
  `.env.test.local` overriding `NEXT_PUBLIC_*`) — build, then `next start`. **Never
  edit the committed/prod `.env`** to do this.
- **Log in once, reuse the session** — a `setup` project performs the real login and
  persists `storageState`; the browser project reuses it (fast, and the login flow
  itself is still covered once per run).

## Boot resilience

Boot only what the tests need. Worked example (Supabase local):

```sh
supabase start -x edge-runtime -x vector -x imgproxy -x studio -x logflare
```

The non-essential containers — especially `edge-runtime` — can fail on unrelated
network fetches and **roll back the whole stack**; excluding them made boot
deterministic in the field. General rule: a flaky *optional* service must never be
able to kill the *required* stack.

## Safety rules (non-negotiable)

- Apply migrations to the **local** DB directly (`docker exec … psql` or the local
  migration command) — **never** a push command that targets the linked/prod project
  (`db push` class).
- **Never seed against an env that points at prod.** Check the URL before seeding;
  a guard in the seed script beats a memory.
- Secrets for the local stack are the stack's *known local* defaults or gitignored
  overrides — never prod credentials copied down.

## Ownership

koni-qc owns these **harness recipes** (the pattern + the worked Koniverse-stack
example). The repo owns its concrete `tests/integration/helpers.ts` / seed scripts;
[`test-automation.md`](test-automation.md) §4–§5 owns wiring the resulting suites into
CI (a job with services + self-seed — a container build can't host a DB/browser);
stack-specific depth beyond the default stack belongs in that stack's plugin skill.
