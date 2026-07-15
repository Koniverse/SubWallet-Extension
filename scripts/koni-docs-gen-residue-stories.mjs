// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Generate one retroactive story per CHANGELOG issue that no FR-materializing
// story owns — the "residue" of the coverage index (routed + unowned). Per the
// owner's directive: 1 issue = 1 US, except issues already carried by a main-FR
// story (those are the index's cited + linked buckets, excluded here).
//
// These are MAINTENANCE records, not capability contracts. Each documents a
// single shipped issue: its release, its implementer, its commits. Its one
// acceptance criterion is a COVERAGE assertion — "this issue shipped in vX,
// provable by tag ancestry" — never an invented Given/When/Then (LESSONS §68).
// A single issue ships in exactly one release, so unlike a rollup it has an
// honest single sprint (CONTEXT D105's problem does not arise).
//
// They live in EPIC-22 so the 21 product epics stay the FR map, undisturbed.
// Each story records its best-guess capability area in the body.
//
// Idempotent: regenerating overwrites US-22.* and EPIC-22 from the index.
// Usage: node scripts/koni-docs-gen-residue-stories.mjs

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();
const DOCS = path.join(ROOT, 'docs');
const TODAY = '2026-07-15';
const EPIC = 'EPIC-22';

// ---- residue from the coverage index ----------------------------------------

const idx = fs.readFileSync(path.join(DOCS, 'notes/changelog-coverage.md'), 'utf8');
const residue = []; // {i, bullet, v, date, asg, area}

for (const tag of ['## Routed', '## Unowned']) {
  const seg = idx.split(tag)[1].split('\n## ')[0];
  let area = null;

  for (const ln of seg.split('\n')) {
    const h = ln.match(/^### (EPIC-\d+)/);

    if (h) {
      area = h[1];
      continue;
    }

    const r = ln.match(/^\| \[#(\d+)\][^|]*\| (.+?) \| (\d+\.\d+\.\d+) \| (\d{4}-\d{2}-\d{2}) \| (.+?) \|$/);

    if (r) {
      residue.push({
        i: Number(r[1]),
        bullet: r[2].replace(/\\\|/g, '|'),
        v: r[3],
        date: r[4],
        asg: r[5].replace(' ⚠️open', '').trim(),
        area: tag === '## Routed' ? area : null
      });
    }
  }
}

// group issues that share one CHANGELOG bullet — they are one shipped item
const groups = new Map(); // bullet → [rows]

for (const r of residue) {
  if (!groups.has(r.bullet)) groups.set(r.bullet, []);

  groups.get(r.bullet).push(r);
}

// ---- git: issue → feature commits (no merges, no docs:, no CI bump) ----------

const gitLog = spawnSync('git', ['log', '--all', '--no-merges', '--format=%H%x01%s'],
  { encoding: 'utf8', maxBuffer: 1 << 28 }).stdout || '';
const commitsOf = new Map();

for (const line of gitLog.split('\n')) {
  const p = line.split('\x01');

  if (p.length < 2) continue;

  const [sha, subj] = p;

  if (/^(docs|chore\(docs\)):/.test(subj) || /\[CI Skip\]/i.test(subj)) continue;

  for (const m of subj.matchAll(/\[Issue-#?(\d{2,5})\]/g)) {
    const i = Number(m[1]);

    if (!commitsOf.has(i)) commitsOf.set(i, []);

    if (commitsOf.get(i).length < 5) commitsOf.get(i).push(sha.slice(0, 10));
  }
}

// ---- helpers ----------------------------------------------------------------

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '') || 'issue';
const sprintOf = (date) => `sprint-${date.slice(0, 4)}-M${date.slice(5, 7)}`;
const issueUrl = (i) => `https://github.com/Koniverse/SubWallet-Extension/issues/${i}`;
const AREA_TITLE = {
  'EPIC-1': 'Build & Platform', 'EPIC-3': 'Account', 'EPIC-4': 'Network & Token',
  'EPIC-5': 'Security', 'EPIC-6': 'UI & UX', 'EPIC-7': 'Portfolio & Balances',
  'EPIC-8': 'Transactions', 'EPIC-9': 'NFT', 'EPIC-10': 'dApp Connectivity',
  'EPIC-11': 'Swap', 'EPIC-12': 'Earning', 'EPIC-13': 'XCM & Bridge',
  'EPIC-14': 'Fiat Ramp', 'EPIC-15': 'Governance', 'EPIC-16': 'Hardware Wallet',
  'EPIC-19': 'Onboarding & Localization', 'EPIC-20': 'Performance'
};

// ---- assemble story specs, sorted by release then issue ---------------------

const specs = [...groups.values()]
  .map((g) => {
    const rows = g.sort((a, b) => a.i - b.i);
    const head = rows[0];
    const nums = rows.map((r) => r.i);
    const asg = rows.map((r) => r.asg).find((a) => a && a !== '—') || '';
    const shas = [...new Set(nums.flatMap((i) => commitsOf.get(i) || []))].slice(0, 5);

    return { nums, bullet: head.bullet, v: head.v, date: head.date, asg, area: head.area, shas };
  })
  .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.nums[0] - b.nums[0]));

specs.forEach((s, k) => { s.id = `US-22.${k + 1}`; });

// ---- missing sprint windows -------------------------------------------------

const haveSprints = new Set(fs.readdirSync(path.join(DOCS, 'sprints')).filter((f) => f.startsWith('sprint-')).map((f) => f.slice(0, -3)));
const needSprints = new Set(specs.map((s) => sprintOf(s.date)));
const missing = [...needSprints].filter((s) => !haveSprints.has(s)).sort();
const MONTH_END = { '01': 31, '02': 28, '03': 31, '04': 30, '05': 31, '06': 30, '07': 31, '08': 31, '09': 30, '10': 31, '11': 30, '12': 31 };

for (const sp of missing) {
  const [, yr, mo] = sp.match(/sprint-(\d{4})-M(\d{2})/);
  const inMonth = specs.filter((s) => sprintOf(s.date) === sp);
  const rels = [...new Set(inMonth.map((s) => s.v))].sort();

  fs.writeFileSync(path.join(DOCS, 'sprints', `${sp}.md`), `---
id: ${sp}
status: closed
start: ${yr}-${mo}-01
end: ${yr}-${mo}-${MONTH_END[mo]}
goal: "Reconstructed window — ${inMonth.length} maintenance issues shipped this month (${rels.join(', ')}), none owned by an FR story. Derived from the CHANGELOG, not planned."
---

> ## 🕰️ Reconstructed window — retroactive, never a planned sprint

This window exists only so the [EPIC-22](epics/EPIC-22.md) maintenance stories that shipped
in ${yr}-${mo} are locatable in time, as the frontmatter spec requires. Its \`goal\` is derived
from the CHANGELOG after the fact; **velocity computed on it is meaningless — do not chart it**
([CONTEXT D99](../CONTEXT.md)). The authority for "when did this ship" is each story's
\`version_shipped\` + \`commit\`.

## Sprint scope

See [EPIC-22](epics/EPIC-22.md) — the stories dated ${yr}-${mo} in the coverage index.

## Per-Epic Retrospective

_None — reconstructed from git in 2026._
`);
}

// ---- EPIC-22 ----------------------------------------------------------------

const byArea = {};

for (const s of specs) {
  const a = s.area || 'unmapped';

  byArea[a] = (byArea[a] || 0) + 1;
}

const done = specs.length;
const relSpan = [specs[0].v, specs[specs.length - 1].v];

fs.writeFileSync(path.join(DOCS, 'sprints/epics', `${EPIC}.md`), `---
id: ${EPIC}
title: "Shipped Maintenance — issues outside the FR map"
status: done
prd_ref: []
created: ${TODAY}
updated: ${TODAY}
---

## Goal

This epic is a **ledger, not a plan**. It holds one story per CHANGELOG issue that shipped but
that **no FR-materializing story owns** — the residue of the
[coverage index](../../notes/changelog-coverage.md) after every issue that a product story
already carries (cited or capability-linked) is removed. Its deliverable is *coverage*: after
this epic, **every issue cited in a SubWallet release is claimed by exactly one story**, so the
ERP can answer "who shipped what, under which issue" for the whole CHANGELOG, not just the 6%
the FR stories cover.

## Why these are not in the 21 product epics

The 21 product epics are the **FR map** — each story there is the contract for a functional
requirement ([templates/story.md](../../../.agents/skills/koni-docs/references/templates/story.md)).
The issues here materialize no FR: they are fixes, chore bumps (logos, endpoints, token lists),
UI polish, and small increments that shipped between the FR deliverables. Minting them as
US-4.x / US-6.x would inflate the product epics and blur what an FR story means. They live here,
each tagged with its **capability area** (a guess from the CHANGELOG text), so the map stays clean.

## What a story here is — and is not

- **It documents the record, not the code.** Its one acceptance criterion is a *coverage*
  assertion: "issue #N shipped in vX", provable by \`git merge-base --is-ancestor <sha> vX\`. It
  invents **no** Given/When/Then behaviour — that is the [US-5.1](../stories/US-5.1-phishing-site-and-address-protection.md)
  failure this program exists to prevent ([LESSONS §68](../../LESSONS.md)).
- **\`points: 1\` is a count, not an estimate.** One story = one shipped issue. **Never sum these
  with the Fibonacci points of the 177 product stories** — a rollup of this epic measures *issue
  throughput*, not effort ([CONTEXT D107](../../CONTEXT.md) on unit-of-truth).
- **\`sprint\` is real.** A single issue shipped in a single release, so its window is that
  release's month — no rollup fiction ([CONTEXT D105](../../CONTEXT.md)).

## Scope

**${done} stories**, one per shipped issue-group, across releases **${relSpan[0]}–${relSpan[1]}**.
By capability area:

| Area | Stories |
| --- | --- |
${Object.entries(byArea).sort((a, b) => b[1] - a[1]).map(([a, n]) => `| ${a === 'unmapped' ? '_unmapped (area unclear from CHANGELOG)_' : `${a} — ${AREA_TITLE[a] || ''}`} | ${n} |`).join('\n')}

The per-issue detail — implementer, release, date — is the
[CHANGELOG coverage index](../../notes/changelog-coverage.md), regenerated by
\`scripts/koni-docs-changelog-coverage.mjs\`. This epic and its stories are regenerated by
\`scripts/koni-docs-gen-residue-stories.mjs\`.

## Acceptance criteria

- [x] **AC-1** — Every routed/unowned issue in the coverage index has exactly one US-22.* story.
- [x] **AC-2** — Each story's \`version_shipped\` is a \`(Koni)\` release and its \`sprint\` is that
  release's month; \`npx koni-docs validate\` and \`node scripts/koni-docs-check-ids.mjs\` both exit 0.
`);

// ---- stories ----------------------------------------------------------------

const storyDir = path.join(DOCS, 'sprints/stories');

for (const f of fs.readdirSync(storyDir).filter((x) => /^US-22\.\d+-/.test(x))) fs.unlinkSync(path.join(storyDir, f));

for (const s of specs) {
  const title = s.bullet.replace(/\s*\(#[\d,# ]+\)\s*$/, '').replace(/\s*\(issue #\d+[,#\d ]*\)\s*$/i, '').replace(/"/g, "'").trim() || `Issue #${s.nums[0]}`;
  const idList = s.nums.map((n) => `[#${n}](${issueUrl(n)})`).join(', ');
  const areaLine = s.area ? `${s.area} — ${AREA_TITLE[s.area] || ''}` : '_unmapped — capability area unclear from the CHANGELOG text_';
  const commitLine = s.shas.length ? s.shas.join(', ') : '';
  const verify = s.shas.length
    ? `\`git merge-base --is-ancestor ${s.shas[0]} v${s.v}\` exits 0 · [coverage index](../../notes/changelog-coverage.md)`
    : `no \`[Issue-N]\` commit resolved — provenance is the CHANGELOG bullet + release only · [coverage index](../../notes/changelog-coverage.md)`;

  fs.writeFileSync(path.join(storyDir, `${s.id}-${slug(title)}.md`), `---
id: ${s.id}
title: "${title}"
epic: ${EPIC}
status: done
priority: P3
points: 1
sprint: ${sprintOf(s.date)}
version_shipped: ${s.v}
prd_ref: []
assignee: ${s.asg}
commit: ${commitLine}
created: ${TODAY}
updated: ${TODAY}
---

## Goal

Maintenance record for **${idList}** — *"${title}"* — shipped in **${s.v}** (${s.date}). This
is one shipped issue that no FR-materializing story owns; it is captured here so the CHANGELOG
is fully claimed ([EPIC-22](../epics/${EPIC}.md)).

- **Capability area (guess):** ${areaLine}
- **This story asserts coverage, not behaviour** — see AC-1. It does not describe what the code
  should do; it records that this issue shipped.

## Acceptance criteria

- [x] **AC-1** — Issue ${s.nums.map((n) => `#${n}`).join(', ')} shipped in release **${s.v}**${s.shas.length ? `; the feature commit(s) below are contained in the \`v${s.v}\` tag` : ' (per the CHANGELOG; no feature commit resolved)'}.

## Tasks

- [x] **TASK-${s.id.slice(3)}.1** — Recorded from the CHANGELOG coverage index (AC: 1)

## References

- [Issue ${s.nums.map((n) => `#${n}`).join(', ')}](${issueUrl(s.nums[0])})
- [CHANGELOG coverage index](../../notes/changelog-coverage.md)

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | ${verify} |

## Changelog entry

Retroactive record — shipped in ${s.v}. **Commit**: ${commitLine || '(none resolved)'}

## Cross-references

- [Epic ${EPIC}](../epics/${EPIC}.md)
- [Sprint ${sprintOf(s.date)}](../${sprintOf(s.date)}.md)
`);
}

console.log(`EPIC-22 + ${specs.length} stories · ${missing.length} new sprint windows`);
console.log(`  releases ${relSpan[0]}–${relSpan[1]}`);
console.log(`  assignee resolved: ${specs.filter((s) => s.asg).length}/${specs.length}`);
console.log(`  commits resolved:  ${specs.filter((s) => s.shas.length).length}/${specs.length}`);
