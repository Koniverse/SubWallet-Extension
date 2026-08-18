// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Keep docs/notes/changelog-coverage.md honest about its own central claim.
//
// That file's "Cited" table asserts, for every issue in docs/CHANGELOG.md, the story
// that names it — and its header calls the bucket "certain". Nothing ever checked it.
// On 2026-08-10 a check found 24 rows whose named story does not contain the issue
// number at all, and 7 more pointing at a story that had since been renumbered or split
// (one pointed at `EPIC-11`, which is not a story). See docs/notes/2026-08-10.md §E.
//
// The original generator was a one-off kept outside the repo and is lost. This is its
// replacement, and it lives here so that cannot happen twice.
//
// Attribution is deliberately NOT re-derived. 26 of the previous file's rows disagree
// with every mechanical rule tried against them — the mapping is curated, and curation
// beats a heuristic. This tool only checks whether each recorded attribution is still
// true, and reports the ones that are not.
//
// Usage:
//   node scripts/koni-docs-changelog-coverage.mjs          report drift (exit 1 if any)
//   node scripts/koni-docs-changelog-coverage.mjs --quiet   exit code only

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CHANGELOG = path.join(ROOT, 'docs/CHANGELOG.md');
const COVERAGE = path.join(ROOT, 'docs/notes/changelog-coverage.md');
const STORIES = path.join(ROOT, 'docs/sprints/stories');

// Changelog bullets that cite the PR number where the real issue is different.
// Carried from the previous file's hand-written annotations; the changelog text is wrong.
const MISNUMBERED = { 1384: '1280', 1950: '1949', 2590: '2588', 3902: '2902' };
// "address index #0", "Update Tinkernet (#1)" — prose, not issue references.
const DENY = new Set(['0', '1']);

const quiet = process.argv.includes('--quiet');
const say = (...a) => { if (!quiet) console.log(...a); };

// A number written as an explicit link to a different Koniverse repo belongs to that
// repo (SubWallet-ChainList #699 et al), not to this one.
const FOREIGN = /\[[^\]]*#(\d+)\]\(https:\/\/github\.com\/Koniverse\/(?!SubWallet-Extension\/)[^)]*\)/g;

function parseChangelog () {
  const txt = fs.readFileSync(CHANGELOG, 'utf8');
  const parts = txt.split(/^## \[([^\]]+)\][^\n]*?—\s*(\d{4}-\d{2}-\d{2})/m);
  const out = new Map();
  const releases = new Set();

  for (let i = 1; i < parts.length; i += 3) {
    const [ver, , body] = [parts[i], parts[i + 1], parts[i + 2]];

    for (const raw of body.split('\n')) {
      const line = raw.trim();

      if (!line || line.startsWith('#') || line.startsWith('**Commit**') || line.startsWith('>')) continue;

      const foreign = new Set([...line.matchAll(FOREIGN)].map((m) => m[1]));
      const text = line.replace(/^[-*]\s+/, '');

      for (const m of text.matchAll(/#(\d{1,5})\b/g)) {
        let n = m[1];

        if (DENY.has(n) || foreign.has(n)) continue;
        n = MISNUMBERED[n] || n;
        releases.add(ver);
        if (!out.has(n)) out.set(n, { text, ver, date: parts[i + 1] });
      }
    }
  }

  return { issues: out, releaseSections: (parts.length - 1) / 3, releasesCiting: releases.size };
}

function storyIndex () {
  const idx = new Map();

  for (const f of fs.readdirSync(STORIES).filter((f) => f.endsWith('.md'))) {
    const t = fs.readFileSync(path.join(STORIES, f), 'utf8');
    const id = t.match(/^id:\s*(\S+)/m);

    if (!id) continue;
    const nums = new Set([
      ...[...t.matchAll(/#(\d{1,5})\b/g)].map((m) => m[1]),
      ...[...t.matchAll(/issues\/(\d+)/g)].map((m) => m[1])
    ]);

    for (const n of nums) {
      if (!idx.has(n)) idx.set(n, new Set());
      idx.get(n).add(id[1]);
    }
  }

  return idx;
}

function coverageRows () {
  const txt = fs.readFileSync(COVERAGE, 'utf8');
  const rows = new Map();
  const re = /^\| \[#(\d+)\]\([^)]*\) \| (.*?) \| ([^|]*?) \| ([^|]*?) \| ([^|]*?) \|$/gm;

  for (const m of txt.matchAll(re)) rows.set(m[1], { us: m[5].trim(), release: m[3].trim() });

  // Rows below the "## Linked" heading are inferences, not citation claims.
  const linkedAt = txt.indexOf('## Linked');
  const linked = new Set([...txt.slice(linkedAt).matchAll(/^\| \[#(\d+)\]/gm)].map((m) => m[1]));

  return { rows, linked };
}

const { issues, releaseSections, releasesCiting } = parseChangelog();
const idx = storyIndex();
const { rows, linked } = coverageRows();

const missing = [...issues.keys()].filter((n) => !rows.has(n));
const stale = [];
const orphan = [];

for (const [n, { us }] of rows) {
  if (linked.has(n)) continue; // an inference, by construction unverified
  const owners = idx.get(n) || new Set();
  const named = us.split('/').map((s) => s.trim());

  if (named.some((u) => owners.has(u))) continue;
  (owners.size ? stale : orphan).push({ n, us, now: [...owners].sort().join(' / ') });
}

say(`changelog:   ${issues.size} issues across ${releasesCiting} of ${releaseSections} release sections`);
say(`coverage:    ${rows.size} rows (${rows.size - linked.size} cited, ${linked.size} linked)`);
say('');

if (missing.length) {
  say(`✗ ${missing.length} issue(s) in the CHANGELOG with no coverage row — a release was added without regenerating:`);
  for (const n of missing) say(`    #${n}  ${issues.get(n).ver}  ${issues.get(n).text.slice(0, 80)}`);
  say('');
}

if (stale.length) {
  say(`✗ ${stale.length} row(s) name a story that no longer contains the issue number:`);
  for (const s of stale) say(`    #${s.n}  says ${s.us}  →  actually in ${s.now}`);
  say('');
}

if (orphan.length) {
  say(`✗ ${orphan.length} row(s) in "Cited" that no story contains — these belong under "Linked":`);
  for (const s of orphan) say(`    #${s.n}  says ${s.us}`);
  say('');
}

const bad = missing.length + stale.length + orphan.length;

if (!bad) say('✓ every cited row names a story that contains its issue number');
process.exit(bad ? 1 : 0);
