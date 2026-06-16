---
id: US-5.10
title: "Security audit & remediation hardening"
epic: EPIC-5
status: backlog
priority: P1
points: 5
sprint:
version_shipped:
prd_ref: []
arch_ref: [AD-04, AD-03, AD-19]
depends_on: [US-5.1, US-5.2]
assignee:
commit:
created: 2026-06-12
updated: 2026-06-12
---

## Goal

Close the security and UX-security findings surfaced by audit and by real-world
false-positive reports, and lock each one behind a regression guard — so the
defence surface this epic publishes (key/secret hygiene, web-hardening, phishing
accuracy) is not asserted once but kept from regressing as the codebase grows.
This story ships no new user-facing feature; its value is that audit-driven and
report-driven security fixes land *with* a test or lint/grep guard, and that
phishing protection stops flagging legitimate sites so users keep trusting the
warning when it is real.

## Background

This is the **bug / iteration (hardening) cluster** for EPIC-5 — it owns no FR.
A wallet's most important security work is not a feature; it is *closing the
findings audits and users surface*. SubWallet's third-party security review
(Verichains) and an internal **UX bounty audit** drove a stream of remediation
work; alongside it, secret-hygiene and web-hardening gaps plus phishing
false-positive reports were filed against the public tracker. This story is the
destination for that remediation work and the regression coverage that prevents
each finding from reappearing. It complements the project's open-source posture
(NFR-10) by adding *independent* and *user* review on top of community review.

The earlier draft of this story was named for the Verichains audit alone, but
no tracked issue carries that name; the concrete, anchorable findings are the
ones below, so the title is generalized to **security audit & remediation
hardening** (the Verichains audit is named in body as the original review that
seeded part of this work). Four grouped concerns anchor the story:

- **Audit remediation** — [#4471](https://github.com/Koniverse/SubWallet-Extension/issues/4471)
  is the tracker for UX improvements driven by the UX bounty audit (3 sub-items);
  each audit item is remediated and marked resolved.
- **Secret / key hygiene** — [#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929):
  API keys were shipped open in the bundle rather than sourced from `.env` /
  routed through the backend proxy ([AD-19](../../ARCHITECTURE.md#architecture-decisions));
  no provider secret may ship in the extension.
- **Web hardening** — [#4959](https://github.com/Koniverse/SubWallet-Extension/issues/4959):
  the WebApp must fix reverse tabnabbing (`rel="noopener noreferrer"` on external
  links / `window.open`) and implement a Content Security Policy (CSP).
- **Phishing false-positive accuracy** —
  [#4889](https://github.com/Koniverse/SubWallet-Extension/issues/4889) (the
  phishing-detection screen wrongly shown on common sites such as YouTube) and
  [#4998](https://github.com/Koniverse/SubWallet-Extension/issues/4998)
  (`chaindrop.app`, a legitimate testnet faucet, wrongly flagged): the phishing
  screen owned by [US-5.1](US-5.1-phishing-site-and-address-protection.md) must
  not false-positive on legitimate origins, or users learn to dismiss it.

This story is **retroactive / ongoing** — much remediation already shipped
incrementally; `commit` / `version_shipped` are backfilled during version
reconciliation, and the story stays open to absorb subsequent audit rounds and
false-positive reports. It builds on the phishing surface
([US-5.1](US-5.1-phishing-site-and-address-protection.md)) and the master-password /
key-at-rest surface ([US-5.2](US-5.2-master-password-and-strength-policy.md)) it
hardens, and reuses the backend-proxy substrate (AD-19) that keeps provider keys
out of the bundle.

## Acceptance criteria

- [ ] **AC-1** — **Given** the UX-bounty audit findings tracked in
  [#4471](https://github.com/Koniverse/SubWallet-Extension/issues/4471) (and the
  Verichains audit findings it accompanies), **When** each is remediated, **Then**
  the fix is landed and the finding is marked resolved with a reference to the
  remediation commit.
- [ ] **AC-2** — **Given** the secret-hygiene finding
  [#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929), **When**
  the shipped bundle is scanned, **Then** no third-party provider API key appears
  as a literal — every provider key is sourced from `.env` config or reached
  through the backend proxy ([AD-19](../../ARCHITECTURE.md#architecture-decisions))
  — verified by a regression / build-time scan, not by inspection alone.
- [ ] **AC-3** — **Given** the WebApp web-hardening finding
  [#4959](https://github.com/Koniverse/SubWallet-Extension/issues/4959), **When**
  the WebApp is built and loaded, **Then** every external link / `window.open`
  carries `rel="noopener noreferrer"` (no reverse tabnabbing) and a Content
  Security Policy header/meta is present and enforced — verified by a regression
  check.
- [ ] **AC-4** — **Given** the phishing-detection screen
  ([US-5.1](US-5.1-phishing-site-and-address-protection.md)), **When** a known
  legitimate origin is visited (e.g. `youtube.com`
  [#4889](https://github.com/Koniverse/SubWallet-Extension/issues/4889), the
  testnet faucet `chaindrop.app`
  [#4998](https://github.com/Koniverse/SubWallet-Extension/issues/4998)), **Then**
  the phishing warning is **not** shown — the false positive does not reproduce.
- [ ] **AC-5** *(unhappy path)* — **Given** the phishing screen after the
  false-positive fixes, **When** an actually-malicious phishing origin is visited,
  **Then** the warning is still shown — the accuracy fix did not blunt true-positive
  detection (no over-correction that disables protection).
- [ ] **AC-6** — **Given** any audit / report finding fixed under this story,
  **When** the fix lands, **Then** it is accompanied by a regression test or
  CI/lint guard in the same PR so the finding cannot silently reappear.

## Tasks

- [ ] **TASK-5.10.1** — Triage and track audit findings to remediation (AC: 1)
  — record each finding (UX-bounty tracker [#4471](https://github.com/Koniverse/SubWallet-Extension/issues/4471) 3 sub-items + Verichains items), severity, and remediation commit reference.
- [ ] **TASK-5.10.2** — Remove open API keys from the bundle (AC: 2) — move every provider key to `.env` config or behind the backend proxy ([AD-19](../../ARCHITECTURE.md#architecture-decisions)) per [#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929); add a build-time / CI secret-scan guard.
- [ ] **TASK-5.10.3** — WebApp web-hardening (AC: 3) — add `rel="noopener noreferrer"` to external links / `window.open` (reverse-tabnabbing fix) and implement a Content Security Policy per [#4959](https://github.com/Koniverse/SubWallet-Extension/issues/4959).
- [ ] **TASK-5.10.4** — Phishing false-positive fixes (AC: 4) — stop flagging legitimate origins (`youtube.com` [#4889](https://github.com/Koniverse/SubWallet-Extension/issues/4889), `chaindrop.app` [#4998](https://github.com/Koniverse/SubWallet-Extension/issues/4998)) on the US-5.1 phishing screen; add an allow-list / matching-logic correction.
- [ ] **TASK-5.10.5** — True-positive guard (AC: 5) — assert a known-malicious origin still triggers the warning so the accuracy fix does not over-correct.
- [ ] **TASK-5.10.6** — Pair every remediation with a regression test / CI guard (AC: 6) — secret-scan, tabnabbing/CSP check, phishing match-list regression cases.

## Dev notes

### Architecture constraints

- [AD-04](../../ARCHITECTURE.md#architecture-decisions) — keyring confined to the background; remediation must not relax this boundary (no key bytes to UI/inject).
- [AD-03](../../ARCHITECTURE.md#architecture-decisions) — message-bus isolation; web-hardening and CSP work must not open a path that surfaces privileged data to the UI/inject process.
- [AD-19](../../ARCHITECTURE.md#architecture-decisions) — backend proxy for third-party API keys; the #4929 secret-hygiene fix routes provider keys through the proxy / `.env` so none ships in the bundle.
- This story does NOT introduce new AD entries — it re-verifies the existing security ADs against audit and false-positive findings.

### Cross-story dependencies

- Builds on [US-5.1](US-5.1-phishing-site-and-address-protection.md) — the phishing-detection screen and its `@polkadot/phishing` + ChainPatrol match list; the false-positive fixes (#4889, #4998) correct that screen's matching without disabling it.
- Builds on [US-5.2](US-5.2-master-password-and-strength-policy.md) — re-verifies key/secret hygiene around the master-password / key-at-rest surface it establishes; the #4929 fix keeps provider secrets out of the bundle.

### What we explicitly did NOT do

- No new security *feature* work — those are the FR-backed stories (US-5.1…US-5.9). New capabilities get their own FR-backed story.
- No change to the phishing *provider* set (US-5.1) — only the false-positive matching is corrected, not the data sources.
- No performance-epic NFRs — this story is security-finding remediation only.

### Points justification

5 pts — a multi-area hardening story spanning four distinct concerns across five
issues: audit-tracker remediation (#4471, 3 sub-items), bundle secret-hygiene
(#4929, touches build config + AD-19 proxy routing), WebApp web-hardening
(#4959, tabnabbing + CSP — a separate surface), and phishing false-positive
accuracy (#4889, #4998, US-5.1 surface) — each paired with its own regression
guard. Per SKILL §3a-bis this calibrates above a focused single-area 3-pt
hardening story (cf. US-4.21) because it crosses multiple subsystems (build
config, WebApp, phishing engine) and integrates the backend-proxy substrate;
it stays at 5 rather than 8 because no single concern is itself large and the
work rides existing surfaces (US-5.1 phishing, US-5.2/AD-19 proxy) rather than
building new ones.

### References

- [Issue #4471](https://github.com/Koniverse/SubWallet-Extension/issues/4471) — UX improvements from the UX bounty audit (tracker, 3 sub-items) — audit-driven remediation
- [Issue #4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929) — security check: all API keys are open, not in `.env` config
- [Issue #4959](https://github.com/Koniverse/SubWallet-Extension/issues/4959) — [WebApp] fix reverse tabnabbing & implement Content Security Policy (CSP)
- [Issue #4889](https://github.com/Koniverse/SubWallet-Extension/issues/4889) — phishing-detection screen wrongly shown on common sites (e.g. YouTube) — false positive
- [Issue #4998](https://github.com/Koniverse/SubWallet-Extension/issues/4998) — false positive: `chaindrop.app` flagged as phishing (legitimate testnet faucet)
- [Source: ARCHITECTURE AD-04, AD-03, AD-19](../../ARCHITECTURE.md#architecture-decisions) — keyring + message-bus isolation; backend proxy for third-party API keys

## Verification commands

| AC | Command |
|---|---|
| AC-1 | Each audit finding (#4471 sub-items + Verichains items) has a tracked remediation commit reference (audit-tracking doc) |
| AC-2 | Bundle / source secret-scan finds no literal provider API key — every key is `.env`-sourced or proxy-routed (#4929, AD-19); CI secret-scan guard passes |
| AC-3 | WebApp build asserts `rel="noopener noreferrer"` on external links / `window.open` and a CSP header/meta is present (#4959) |
| AC-4 | Phishing match test: `youtube.com` and `chaindrop.app` are NOT flagged (#4889, #4998) — regression cases on the US-5.1 phishing screen |
| AC-5 | Phishing match test: a known-malicious origin IS still flagged (true-positive guard, no over-correction) |
| AC-6 | Each remediation PR includes a regression test or CI/lint guard |

## Changelog entry

### Security
- Remediated audit and false-positive findings, each paired with a regression
  guard: UX-bounty audit items (#4471); removed open API keys from the bundle —
  provider keys now `.env`-sourced / backend-proxy-routed (#4929, AD-19); WebApp
  reverse-tabnabbing fix and Content Security Policy (#4959); and phishing
  false-positive accuracy fixes so legitimate sites (`youtube.com` #4889,
  `chaindrop.app` #4998) are no longer flagged while true-positive detection is
  preserved.

**Commit**:

## Implementation notes

_Hardening cluster — retroactive / ongoing. Audit finding IDs, severities, and
`commit` / `version_shipped` are backfilled during version reconciliation as each
finding is remediated. Anchored on five tracked issues (#4471, #4929, #4959,
#4889, #4998); the Verichains audit named in Background seeded part of the
remediation. The story stays open to absorb subsequent audit rounds and
false-positive reports._

## Cross-references

- [Epic EPIC-5](../epics/EPIC-5.md)
- [ARCHITECTURE AD-04 / AD-03 / AD-19](../../ARCHITECTURE.md#architecture-decisions)
- [US-5.1](US-5.1-phishing-site-and-address-protection.md), [US-5.2](US-5.2-master-password-and-strength-policy.md)
- [Issue #4471](https://github.com/Koniverse/SubWallet-Extension/issues/4471) · [#4929](https://github.com/Koniverse/SubWallet-Extension/issues/4929) · [#4959](https://github.com/Koniverse/SubWallet-Extension/issues/4959) · [#4889](https://github.com/Koniverse/SubWallet-Extension/issues/4889) · [#4998](https://github.com/Koniverse/SubWallet-Extension/issues/4998)
