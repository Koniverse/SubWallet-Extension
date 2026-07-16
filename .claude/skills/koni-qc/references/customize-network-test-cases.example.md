# Test Cases — Customize Network (koni-qc pilot)

> **Load when**: you want a concrete end-to-end example of an authored suite.
> **Worked example** produced by `koni-qc` from a feature's requirements, shown
> as one flat document for readability — a real adoption splits it per the
> `test-cases/EPIC-CN/` directory layout of `test-organization.md` §1 (`index.md`
> frame + per-US row files; the single-file `EPIC-CN.md` shape shown here is
> legacy-accepted). It demonstrates the standard and the uplift over the hand-made
> `koni-docs.backup` `customize-network` suite (58 manual cases, ~70% happy-path,
> no TC IDs, no AC↔TC matrix, <5% NFR). The content (rows, matrix, sections) is
> identical in either container; the product (SubWallet) is not in this repo.

---

**Contents**: [Overview](#overview) ·
[Quick reference — test scenarios summary](#quick-reference--test-scenarios-summary) ·
[Test scenarios](#test-scenarios) · [Coverage matrix (AC ↔ TC)](#coverage-matrix-ac--tc) ·
[Open / deferred scenarios](#open--deferred-scenarios) ·
[Self-grade vs `quality-bar.md`](#self-grade-vs-quality-barmd) ·
[Before / after delta](#before--after-delta-vs-the-manual-backup)

---

## Overview

### Scope

**In scope** — the *Customize Network* feature (extension + mobile): add a custom
RPC network manually, auto-detect chain metadata, edit, and delete.

**Out of scope** — the underlying chain connectivity library; built-in network
seeding; the provider-selector UI beyond "the new network appears" (its own suite).

### Acceptance criteria (derived from requirements)

- **AC-1** — Entering a reachable RPC URL auto-detects chain type (EVM/Substrate)
  and auto-fills name, native symbol, decimals, chain-id, block explorer.
- **AC-2** — The user can override any auto-filled field before saving.
- **AC-3** — Save persists the network; it then appears in the provider/selector.
- **AC-4** — An unreachable or invalid RPC is rejected with a clear error
  (*"Cannot connect to this provider"*); nothing is saved.
- **AC-5** — A network that already exists (same chain-id) is rejected as a
  duplicate.
- **AC-6** — A custom network can be edited and deleted; a built-in or
  currently-in-use network cannot be deleted.

### Goals — what running this suite proves

A user can safely add, override, persist, edit, and remove custom networks; bad
input fails closed; the form resists injection/SSRF; it degrades gracefully on
flaky networks; no duplicate or orphaned network state is created.

### Environment & test data

- **Env**: extension (Chrome/Firefox) + mobile (iOS/Android), staging build.
- **Fixtures** (reusable, seeded): `RPC_EVM_OK = https://rpc.evm-test.example`,
  `RPC_SUBSTRATE_OK = wss://rpc.dot-test.example`, `RPC_UNREACHABLE =
  https://10.255.255.1`, `RPC_MALFORMED = "ht!tp://nope"`, `NET_EXISTING` (a
  network already imported), `NAME_MAX` (64 chars), `NAME_OVER` (65 chars),
  `NAME_EMOJI = "Bố 🚀 net"`, `NAME_XSS = "<script>alert(1)</script>"`,
  `RPC_INTERNAL = http://169.254.169.254/latest/meta-data`.
- **Teardown**: delete any custom network a case created at end of run.

### Cadence & ownership

| Cadence | Test types | Owner |
|---|---|---|
| Per-PR | smoke (`SMK`) | dev on PR |
| Per-release | functional + regression (`RC-`) + security | QA |
| Nightly | performance (`PERF`) | CI |

## Quick reference — test scenarios summary

> The **AC** column lists the AC(s) each TC *touches*; for the slot role
> (positive / negative / boundary-or-edge / NFR) see the §Coverage matrix below.

| # | ID | Type | Priority | Short description | AC |
|---|---|---|---|---|---|
| 1 | TC-CN.SMK-1 | Smoke | Critical | Import a valid EVM RPC end-to-end | AC-1,3,5 |
| 2 | TC-CN.FUNC-1 | Functional | Critical | Auto-detect + auto-fill (EVM); valid RPC accepted | AC-1,4 |
| 3 | TC-CN.FUNC-2 | Functional | Critical | Auto-detect + auto-fill (Substrate) | AC-1 |
| 4 | TC-CN.FUNC-3 | Functional | High | Override an auto-filled field, then save | AC-2 |
| 5 | TC-CN.FUNC-4 | Functional | High | Saved network appears in selector | AC-3 |
| 6 | TC-CN.FUNC-5 | Functional | High | Edit a custom network | AC-6 |
| 7 | TC-CN.FUNC-6 | Functional | High | Delete a custom (not-in-use) network | AC-6 |
| 8 | TC-CN.NEG-1 | Negative | Critical | Unreachable RPC → clear error, nothing saved | AC-1,4 |
| 9 | TC-CN.NEG-2 | Negative | High | Malformed URL → validation error | AC-4 |
| 10 | TC-CN.NEG-3 | Negative | High | Duplicate network (same chain-id) rejected | AC-5 |
| 11 | TC-CN.NEG-4 | Negative | High | Cannot delete an in-use / built-in network | AC-6 |
| 12 | TC-CN.NEG-5 | Negative | High | Storage write fails on Save → no orphan network | AC-3 |
| 13 | TC-CN.NEG-6 | Negative | High | Override a field with an invalid type (non-numeric decimals) → rejected | AC-2 |
| 14 | TC-CN.BND-1 | Boundary | Medium | Name at 64 (ok) / 65 (rejected) chars | AC-2 |
| 15 | TC-CN.BND-2 | Boundary | Medium | Decimals 0 / max accepted; max+1 rejected | AC-2 |
| 16 | TC-CN.BND-3 | Boundary | Medium | Same name, different chain-id → accepted (not a dup) | AC-5 |
| 17 | TC-CN.BND-4 | Boundary | Medium | Rename a custom network onto an existing name → rejected | AC-6 |
| 18 | TC-CN.SEC-1 | Security | Critical | XSS in network name is neutralized | AC-2 |
| 19 | TC-CN.SEC-2 | Security | High | RPC URL sanitized (no SSRF to internal hosts) | AC-4 |
| 20 | TC-CN.EDGE-1 | Edge | Medium | Emoji / non-ASCII name persists correctly | AC-2 |
| 21 | TC-CN.EDGE-2 | Edge | High | Double-tap Save creates only one network | AC-3 |
| 22 | TC-CN.EDGE-3 | Edge | High | Network drops mid-detect → graceful timeout | AC-1,4 |
| 23 | TC-CN.PERF-1 | Performance | Medium | Detect completes within SLA (p95 ≤ 2.0s) | AC-1 |
| 24 | TC-CN.A11Y-1 | Accessibility | Medium | Import form is keyboard-navigable + labelled | AC-1,2 |
| 25 | TC-CN.REG-1 (`RC-1`) | Regression | Critical | Adding a custom network doesn't break built-ins | AC-3 |

## Test scenarios

Canonical rich-TC table (per koni-qc `traceability.md`).

| TC-ID | Name | Priority | Test data | Preconditions | Action/Request | Expected | Actual | Status | Perf | Side-effects | Covered-by |
|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-CN.SMK-1 | Import valid EVM RPC end-to-end | Critical | `RPC_EVM_OK` | No custom networks | Manage Network → + → paste RPC → Save | Detected EVM; fields auto-filled; saved; appears in selector | — | Not Executed | — | +1 network row | `e2e/customize-network.spec.ts::smoke` |
| TC-CN.FUNC-1 | Auto-detect + fill (EVM); valid RPC accepted | Critical | `RPC_EVM_OK` | On import screen | Paste RPC, wait for detect | Chain=EVM; name/symbol/decimals/chain-id/explorer populated, editable; Save enabled | — | Not Executed | — | None (pre-save) | — (manual) |
| TC-CN.FUNC-2 | Auto-detect + fill (Substrate) | Critical | `RPC_SUBSTRATE_OK` | On import screen | Paste WSS RPC | Chain=Substrate; fields populated | — | Not Executed | — | None | — (manual) |
| TC-CN.FUNC-3 | Override auto-filled name, then save | High | `RPC_EVM_OK`, name "My EVM" | Detect succeeded | Edit name → Save | Saved network uses the overridden name | — | Not Executed | — | +1 network | — (manual) |
| TC-CN.FUNC-4 | Saved network appears in selector | High | `RPC_EVM_OK` | Network saved (FUNC-1) | Open the provider/network selector | The new network is listed and selectable | — | Not Executed | — | None | `e2e/customize-network.spec.ts::appears` |
| TC-CN.FUNC-5 | Edit a custom network | High | custom `NET_X` | `NET_X` is custom | Edit → change explorer URL → Save | Change persists; selector reflects it | — | Not Executed | — | 1 row updated | — (manual) |
| TC-CN.FUNC-6 | Delete a custom (not-in-use) network | High | custom `NET_X`, not selected | `NET_X` custom + not active | Delete `NET_X` → confirm | Removed from list & store | — | Not Executed | — | −1 network row | — (manual) |
| TC-CN.NEG-1 | Unreachable RPC rejected | Critical | `RPC_UNREACHABLE` | On import screen | Paste → wait | Error "Cannot connect to this provider"; Save disabled; nothing saved | — | Not Executed | — | **None** (assert no row) | — (manual) |
| TC-CN.NEG-2 | Malformed URL rejected | High | `RPC_MALFORMED` | On import screen | Paste malformed | Inline validation error; no network call attempted | — | Not Executed | — | None | — (manual) |
| TC-CN.NEG-3 | Duplicate network (same chain-id) rejected | High | RPC of `NET_EXISTING` | `NET_EXISTING` imported | Paste same RPC → Save | Rejected "Network already exists"; count unchanged | — | Not Executed | — | None | — (manual) |
| TC-CN.NEG-4 | Cannot delete in-use / built-in | High | a built-in + the active network | A network is selected/in-use | Attempt delete | Delete blocked with explanation; network retained | — | Not Executed | — | None | — (manual) |
| TC-CN.NEG-5 | Storage write fails on Save → no orphan | High | `RPC_EVM_OK` + injected store-write failure | Detect succeeded; store write will fail | Save | Error surfaced; **no partial/orphan network** persisted; list unchanged | — | Not Executed | — | None (assert atomic) | — (manual) |
| TC-CN.NEG-6 | Override field with invalid type → rejected | High | decimals = `"abc"` (non-numeric) | Detect succeeded | Override decimals with a non-numeric value → Save | Rejected with a field-level validation error; nothing saved | — | Not Executed | — | None | — (manual) |
| TC-CN.BND-1 | Name length boundary | Medium | `NAME_MAX` (64), `NAME_OVER` (65) | Detect succeeded | Save with 64 then 65 chars | 64 → saved; 65 → validation error | — | Not Executed | — | +1 (valid only) | — (manual) |
| TC-CN.BND-2 | Decimals boundary | Medium | decimals 0, max, max+1 | Detect succeeded | Override decimals → Save | 0 & max accepted; max+1 rejected | — | Not Executed | — | +1 | — (manual) |
| TC-CN.BND-3 | Same name, different chain-id → accepted | Medium | name of `NET_EXISTING`, new chain-id | `NET_EXISTING` imported | Add: same name, different chain-id → Save | Accepted (uniqueness is chain-id, not name) | — | Not Executed | — | +1 network | — (manual) |
| TC-CN.BND-4 | Rename onto an existing name → rejected | Medium | custom `NET_X`, name of `NET_EXISTING` | both exist | Edit `NET_X` → set name = existing → Save | Rejected with a name-collision error; `NET_X` unchanged | — | Not Executed | — | None | — (manual) |
| TC-CN.SEC-1 | XSS in name neutralized | Critical | `NAME_XSS` | Detect succeeded | Set name = `<script>…` → Save → view in selector | Stored & rendered as inert text; no script executes | — | Not Executed | — | +1 (sanitized) | `e2e/customize-network.spec.ts::xss-name` |
| TC-CN.SEC-2 | RPC URL sanitized (no SSRF) | High | `RPC_INTERNAL`, `http://localhost:…` | On import screen | Paste internal-host URL | Blocked; not dialed to internal metadata / loopback | — | Not Executed | — | None | — (manual) |
| TC-CN.EDGE-1 | Emoji / non-ASCII name | Medium | `NAME_EMOJI` | Detect succeeded | Save emoji name → reopen | Persists & displays correctly (UTF-8); no mojibake | — | Not Executed | — | +1 | — (manual) |
| TC-CN.EDGE-2 | Double-tap Save idempotent | High | `RPC_EVM_OK` | Detect succeeded | Tap Save twice quickly | Exactly **one** network created; button locks after first | — | Not Executed | — | +1 (not +2) | — (manual) |
| TC-CN.EDGE-3 | Network flaky mid-detect | High | `RPC_EVM_OK` + throttle→offline | Detect in progress | Drop connection during detect | Graceful timeout + retryable error; no half-saved state | — | Not Executed | — | None | — (manual) |
| TC-CN.PERF-1 | Detect within SLA | Medium | `RPC_EVM_OK` | On import screen | Measure detect time | p95 ≤ **2.0 s** on staging | — | Not Executed | target 2.0s | None | `perf/detect.bench` |
| TC-CN.A11Y-1 | Form keyboard + labels | Medium | — | On import screen | Tab through form; screen-reader | Inputs reachable by keyboard, labelled, logical focus order, errors announced | — | Not Executed | — | None | — (manual) |
| TC-CN.REG-1 | Built-ins intact after add (`RC-1`) | Critical | `RPC_EVM_OK` | Built-in networks present | Add a custom network | All built-in networks still present & selectable | — | Not Executed | — | +1 | `e2e/customize-network.spec.ts::regress` |

## Coverage matrix (AC ↔ TC)

Every AC has ≥1 positive **and** ≥1 negative **and** ≥1 boundary-or-edge case,
each filled by a **distinct** TC (no double-counting) — the check the manual
backup suite lacked entirely. No orphan AC; no orphan TC.

> **Single-feature suite → one US block.** This worked example is a single
> customize-network feature, so the matrix collapses to one story block and omits
> the per-US **Story** column that [`traceability.md`](traceability.md) shows for a
> multi-story epic. In a real `EPIC-NN.md` the matrix has a leading `Story` column
> (one block per US) and every TC carries `maps_to.us` — coverage is then measured
> per US (`test-organization.md` §0). Here every TC `maps_to.us: US-CN` (the
> customize-network story).

| AC | AC description | Positive | Negative | Boundary / edge | NFR |
|---|---|---|---|---|---|
| AC-1 | Auto-detect + auto-fill | TC-CN.FUNC-1, FUNC-2, SMK-1 | TC-CN.NEG-1 | TC-CN.EDGE-3 | TC-CN.PERF-1, A11Y-1 |
| AC-2 | Override fields | TC-CN.FUNC-3 | TC-CN.NEG-6 | TC-CN.BND-1, BND-2, EDGE-1 | TC-CN.SEC-1, A11Y-1 |
| AC-3 | Persist + appears in selector | TC-CN.FUNC-4, SMK-1, REG-1 | TC-CN.NEG-5 | TC-CN.EDGE-2 | — |
| AC-4 | Reject invalid / unreachable RPC | TC-CN.FUNC-1 (valid accepted) | TC-CN.NEG-1, NEG-2 | TC-CN.EDGE-3 | TC-CN.SEC-2 |
| AC-5 | Reject duplicate | TC-CN.SMK-1 (new accepted) | TC-CN.NEG-3 | TC-CN.BND-3 | — |
| AC-6 | Edit / delete rules | TC-CN.FUNC-5, FUNC-6 | TC-CN.NEG-4 | TC-CN.BND-4 | — |

**Every AC row has a distinct positive, negative, and boundary-or-edge TC** (AC-1,
AC-3, AC-4 use an EDGE case for the third slot — explicitly allowed by the
[`traceability.md`](traceability.md) "boundary-or-edge" rule). Each TC in the
matrix exists as a row in §Test scenarios (no orphan TC); each AC is covered (no
orphan AC). Regression baseline = the `RC-` set: **RC-1** (TC-CN.REG-1), run
every release.

## Open / deferred scenarios

- App-kill mid-Save durability (process crash between detect and persist) —
  deferred to a dedicated resilience pass (related to NEG-5).
- i18n: RTL rendering of the network name — deferred (tracked in `nfr.md` §i18n).

## Self-grade vs `quality-bar.md`

**Band A — beat the manual backup (all must clear):**
- [x] Explicit TC IDs — `TC-CN.<TYPE>-<n>`
- [x] AC↔TC matrix — complete; every AC has a distinct pos + neg + boundary-or-edge; no orphans, no double-counting
- [x] ≥50% off-path — 6 NEG + 4 BND + 3 EDGE = 13 of 25 cases (52%) off-path
- [x] NFR present — SEC-1/2, PERF-1, A11Y-1
- [ ] Coverage % reported — **N/A for this authoring artifact** (execution item;
  satisfied at Execute when the run reports % by AC/type). The authoring AC↔TC
  matrix itself is the row above.
- [x] Test-data strategy — named reusable fixtures + teardown
- [x] Entry/exit criteria — `qc-workflow.md`; release gate on matrix + RC set
- [x] Test lifecycle — Open/deferred; deprecate-not-renumber per scheme
- [x] Risk-based order — Critical→Low priorities
- [x] Regression scope — `RC-1` baseline
- [x] Automation linkage — Covered-by column (`*.spec.ts` / `bench` handles)
- [ ] Real reports — **N/A for this authoring artifact** (all 25 rows are `Not
  Executed`); satisfied at the Execute stage when the koni-docs `test-report.md`
  is filled. Per `quality-bar.md`, the two execution-stage Band-A items (Real
  reports + Coverage % reported) are deferred-not-failed for an Author-mode suite.

**Band B — match the Koni-Finance standard:**
- [x] Rich per-TC metadata table (12 columns)
- [x] Dedicated security cases (SEC-1 XSS, SEC-2 SSRF; can emit a standalone `*-security-test-cases.md`)
- [x] Concrete reusable test data (fixtures block)
- [x] Execution instrumentation (Status + Perf + Side-effects + Covered-by)

**Band C — close its residual gaps:**
- [x] **Complete** AC↔TC matrix (Koni-Finance lacked this)
- [x] Env/fixtures playbook (Environment & test data)
- [x] a11y/i18n (A11Y-1, EDGE-1; i18n deferred-but-logged)
- [x] Perf SLA (PERF-1 p95 ≤ 2.0s — a target, not just a measurement)
- [x] Cadence (Cadence & ownership table)

**Pass rule** — clears all of Band A; demonstrably exceeds B and C. ✅ **PASS.**

---

## Before / after delta vs the manual backup

| Dimension | `koni-docs.backup` (manual) | This (koni-qc) |
|---|---|---|
| Test IDs | none (row # + name) | explicit `TC-CN.<TYPE>-<n>` |
| AC↔TC traceability | implicit (feature name) | **complete coverage matrix**, no orphans |
| Negative / boundary | ~25%, ad-hoc | NEG/BND/EDGE first-class (~50%) |
| Injection / security | absent | SEC-1 (XSS), SEC-2 (SSRF) |
| Concurrency / network-failure / durability | absent | EDGE-2 (double-save), EDGE-3 (flaky), NEG-5 (atomic save) |
| Non-functional | absent | PERF-1 (SLA), A11Y-1 |
| Test data | hardcoded, scattered | named reusable fixtures + teardown |
| Risk ordering | equal (row order) | Critical→Low |
| Regression scope | undefined | `RC-1` baseline |

58 shallow manual cases → **25 typed, traced, risk-ordered, edge/NFR/security-complete**
cases that pass koni-qc's own quality bar — the same feature, covered to a standard
the manual suite never reached, and to a completeness (full AC↔TC matrix) the
Koni-Finance production suite did not have either. A full production suite expands
each AC's partitions further per `test-design.md`; this pilot establishes the
shape and clears the bar.
