---
id: US-8.13
title: "Payload decode error handling — graceful degradation instead of crash"
epic: EPIC-8
status: done
priority: P1
points: 2
sprint:
version_shipped: 1.3.80
prd_ref: []
arch_ref: []
depends_on: []
assignee:
commit: d68259d1ca
created: 2026-07-09
updated: 2026-07-09
---

## Goal

Show a user-facing error message instead of crashing the app when a transaction payload cannot be decoded, so the wallet remains usable even with unexpected or malformed data.

## Background

When the wallet receives a transaction payload that cannot be decoded (malformed data, unsupported format, cross-version drift), the app would crash rather than displaying a graceful error. This story adds catch-and-display error handling at the payload decode boundary, giving the user a clear message and keeping the wallet functional.

## Acceptance criteria

- [ ] **AC-1** — **Given** a malformed transaction payload, **When** the decode path is invoked, **Then** the app shows a user-facing error message instead of crashing.
- [ ] **AC-2** — **Given** an error from the decode path, **When** the error is caught, **Then** the error context is logged for debugging.

## Tasks

- [ ] Identify the payload decode entry points in the transaction flow
- [ ] Add try/catch around decode operations
- [ ] Wire the catch handler to a user-facing error display
- [ ] Add error logging for debugging

## Dev notes — References

- Source: Issue #4989 — commit `d68259d1ca`

## Verification commands

```bash
git log --oneline | grep "4989"
```

## Changelog entry

- Fixed crash on payload decode — graceful error instead of crash (US-8.13)
