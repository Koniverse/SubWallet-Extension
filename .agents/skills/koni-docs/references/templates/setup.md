# SETUP.md + DEPLOY.md + .env.example — Template

> **File locations**:
> - `docs/SETUP.md` — local dev environment (clone → `npm run dev`)
> - `DEPLOY.md` — production runbook (repo root)
> - `.env.example` — env var template (repo root)
>
> **Use when**: User asks to add a new env var, document a setup step,
> or update a deploy procedure.
>
> **One rule above all others (RULE-11)**: a new env var lands in ALL
> THREE files in the same commit. Skipping one of them causes silent
> deploy failures and onboarding friction. Use the checklist in §3.

---

## 1. SETUP.md env block format

```markdown
# <Category name> (added in vX.Y.Z)
# <What it does — 1 line>
NEW_ENV_VAR=<example_value_or_instructions>
```

Group env vars by category in SETUP.md (e.g. "Supabase", "OAuth — GitHub",
"BYOK encryption"). Within a category, order by criticality (required → optional).

---

## 2. .env.example format

```bash
# <Category / Feature name> (added in vX.Y.Z)
# <One sentence: what this controls, where to get the value>
NEW_ENV_VAR=<placeholder_or_description>
```

`.env.example` is the single source of truth for "what env vars exist".
Every key in `.env.local` must have a corresponding line in `.env.example`
— with a placeholder, never a real value.

---

## 3. Env var update checklist (RULE-11)

```
[ ] docs/SETUP.md  — add to the .env.local example block + one-line description
[ ] DEPLOY.md      — add to the production env vars table
[ ] .env.example   — add the key with placeholder value
```

Reviewers reject env-var commits that miss any of these three files.

---

## 4. Filled example — SETUP.md env block

```markdown
# Master encryption key (BYOK feature — used for both LLM API keys
# and OAuth tokens since v0.20.0).
# Generate: openssl rand -base64 32
ANTHROPIC_KEY_ENCRYPTION_SECRET=<output_of_openssl>

# OAuth state HMAC secret (added v0.20.0). Signs the `state` param on
# the GitHub + Linear OAuth flows. Separate from SUPABASE_SERVICE_ROLE_KEY
# so a state-signing leak isn't a DB compromise. v0.20.0 falls back to
# SUPABASE_SERVICE_ROLE_KEY if unset (rotation window); v0.21+ will hard-
# require this. Generate: openssl rand -base64 32
OAUTH_STATE_SECRET=<output_of_openssl>
```

---

## 5. Filled example — .env.example

```bash
# BYOK encryption (added v0.20.0) — encrypts LLM keys + OAuth tokens at rest.
# Generate locally: `openssl rand -base64 32`
ANTHROPIC_KEY_ENCRYPTION_SECRET=

# OAuth state HMAC secret (added v0.20.0) — signs the `state` param.
OAUTH_STATE_SECRET=

# GitHub OAuth — only needed to test the connect flow locally.
# Create at https://github.com/settings/developers
# Callback URL: http://localhost:3000/api/oauth/github/callback
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
```

---

## 6. DEPLOY.md production env vars table

In `DEPLOY.md`, env vars live in a table that mirrors the production
secret store (Vercel / Fly.io / k8s Secret). Each row names where to
configure the value, not just what it is.

```markdown
| Env var | Required | Source | Notes |
|---|---|---|---|
| `ANTHROPIC_KEY_ENCRYPTION_SECRET` | Required | Generated once per env via `openssl rand -base64 32` | Rotation procedure §<N> below |
| `OAUTH_STATE_SECRET` | Required | Generated once per env via `openssl rand -base64 32` | Falls back to `SUPABASE_SERVICE_ROLE_KEY` if unset (v0.20.0 only) |
| `GITHUB_OAUTH_CLIENT_ID` | Required | GitHub → Settings → Developer → OAuth Apps | Callback `https://erp.koni.studio/api/oauth/github/callback` |
| `GITHUB_OAUTH_CLIENT_SECRET` | Required | Same place; rotate every 12 months | Vercel env: production only |
```
