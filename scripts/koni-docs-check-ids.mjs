// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Every ID named anywhere in the doc surface must resolve — prose included.
//
// `npx koni-docs validate` only reads frontmatter, so an ID cited in a sentence
// can name a document that does not exist and nothing notices. That is how three
// files came to cite a deferred story by number that was never written.
// See AGENTS.md §7 rule 7.
//
// Usage: node scripts/koni-docs-check-ids.mjs   (exit 1 on any dangling ID)

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();
const DOCS = path.join(ROOT, 'docs');

// A dated file under notes/ is a snapshot of a moment — it correctly names the
// IDs that were true then (e.g. the renumber note records the pre-renumber IDs).
// superpowers/ holds planning artifacts from before the docs program. Both are
// archives: read-only history, not the live surface. Skipped, and reported.
const isArchive = (rel) =>
  /^docs\/notes\/\d{4}-\d{2}-\d{2}-/.test(rel) || rel.startsWith('docs/superpowers/');

function walk (dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);

    if (e.isDirectory()) return walk(p);

    return e.isFile() && e.name.endsWith('.md') ? [p] : [];
  });
}

const rel = (p) => path.relative(ROOT, p);

// ---- what exists -----------------------------------------------------------

const ls = (d, re) => fs.existsSync(d)
  ? fs.readdirSync(d).map((f) => (f.match(re) || [])[1]).filter(Boolean)
  : [];

const prd = fs.readFileSync(path.join(DOCS, 'PRD.md'), 'utf8');
const arch = fs.readFileSync(path.join(DOCS, 'ARCHITECTURE.md'), 'utf8');

// A row may be live (`| FR-7 |`) or a tombstone (`| ~~NFR-11~~ |`). A retired ID
// still exists — it is retired, never reused (rule 1) — so both count.
const rows = (src, kind) =>
  [...src.matchAll(new RegExp(`^\\|\\s*~{0,2}\\*{0,2}(${kind}-\\d+)`, 'gm'))].map((m) => m[1]);

const EXISTS = {
  AD: new Set(rows(arch, 'AD')),
  EPIC: new Set(ls(path.join(DOCS, 'sprints/epics'), /^(EPIC-\d+)\.md$/)),
  FR: new Set(rows(prd, 'FR')),
  NFR: new Set(rows(prd, 'NFR')),
  US: new Set(ls(path.join(DOCS, 'sprints/stories'), /^(US-\d+\.\d+)/)),
  sprint: new Set(ls(path.join(DOCS, 'sprints'), /^(sprint-\d{4}-[WM]\d{2})\.md$/))
};

// FR-\d+ also matches inside NFR-\d+, so NFR is tried first and FR excludes a
// preceding N.
const PATTERNS = [
  ['US', /\bUS-\d+\.\d+\b/g],
  ['EPIC', /\bEPIC-\d+\b/g],
  ['sprint', /\bsprint-\d{4}-[WM]\d{2}\b/g],
  ['NFR', /\bNFR-\d+\b/g],
  ['FR', /(?<!N)\bFR-\d+\b/g],
  ['AD', /\bAD-\d+\b/g]
];

// ---- what is named ---------------------------------------------------------

const targets = [...walk(DOCS), path.join(ROOT, 'AGENTS.md'), path.join(ROOT, 'CLAUDE.md')]
  .filter(fs.existsSync);
const dangling = new Map(); // id -> Set("file:line")
const archived = [];
let scanned = 0;

for (const file of targets) {
  const r = rel(file);

  if (isArchive(r)) {
    archived.push(r);
    continue;
  }

  scanned++;

  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const [kind, re] of PATTERNS) {
      for (const [id] of line.matchAll(re)) {
        if (EXISTS[kind].has(id)) {
          continue;
        }

        if (!dangling.has(id)) {
          dangling.set(id, new Set());
        }

        dangling.get(id).add(`${r}:${i + 1}`);
      }
    }
  });
}

// ---- the two fields that name things OUTSIDE the docs ----------------------
//
// `version_shipped` names a release; `commit` names a commit. Both are identifiers,
// so rule 7 applies — but they can resolve to the *wrong kind of thing*, which is
// worse than not resolving at all:
//
//   - Six version numbers exist in BOTH lineages (0.2.1, 0.3.1, 0.4.1, 0.6.1,
//     0.7.1, 0.8.1 — LESSONS §66). `version_shipped` names a release of THIS
//     product (D101), so only the (Koni) lineage counts.
//   - A CI release-bump commit resolves fine and delivers nothing. `commit:`
//     promises "this is what made the capability true"; a version bump did not.

const changelog = fs.readFileSync(path.join(DOCS, 'CHANGELOG.md'), 'utf8');
const KONI_RELEASES = new Set(
  [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\][^\n]*\(Koni\)/gm)].map((m) => m[1])
);

// SubWallet's first commit. Anything the repo did before this, polkadot-js did.
const FORK = '2022-01-12';

const storyFm = (file) => {
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);

  return m ? Object.fromEntries([...m[1].matchAll(/^(\w+):[ \t]*(.*)$/gm)].map((x) => [x[1], x[2].trim()])) : {};
};

const badField = [];
const stories = fs.existsSync(path.join(DOCS, 'sprints/stories'))
  ? fs.readdirSync(path.join(DOCS, 'sprints/stories')).filter((f) => f.endsWith('.md'))
  : [];

for (const f of stories) {
  const d = storyFm(path.join(DOCS, 'sprints/stories', f));
  const id = d.id || f;
  const v = d.version_shipped;

  if (v && !KONI_RELEASES.has(v)) {
    badField.push(`${id}  version_shipped: ${v} — not a release of this product (no "(Koni)" row in CHANGELOG.md)`);
  }

  // The landmine: six version numbers exist in both lineages, and a git tag can point
  // at only one commit. `v0.7.1` is polkadot-js's, from 2019 — so verifying a SubWallet
  // 0.7.1 story against it compares against a different product's history.
  if (v && KONI_RELEASES.has(v)) {
    const t = spawnSync('git', ['log', '-1', '--format=%cs', `v${v}`], { encoding: 'utf8' });

    if (t.status === 0 && t.stdout.trim() < FORK) {
      badField.push(`${id}  version_shipped: ${v} — the tag v${v} is polkadot-js's (${t.stdout.trim()}), NOT this release. Do not use it as a merge-base anchor.`);
    }
  }

  for (const sha of (d.commit || '').split(',').map((s) => s.trim()).filter(Boolean)) {
    const r = spawnSync('git', ['log', '-1', '--format=%s', sha], { encoding: 'utf8' });

    if (r.status !== 0) {
      badField.push(`${id}  commit: ${sha} — no such commit`);
    } else if (/\[CI Skip\]/i.test(r.stdout)) {
      badField.push(`${id}  commit: ${sha} — a CI release bump ("${r.stdout.trim().slice(0, 40)}"), which delivered nothing`);
    }
  }
}

// ---- report ----------------------------------------------------------------

const n = (k) => EXISTS[k].size;

console.log(`koni-docs-check-ids — ${scanned} files scanned, ${archived.length} archives skipped\n`);
console.log(`  known: ${n('US')} US · ${n('EPIC')} epic · ${n('sprint')} sprint · ${n('FR')} FR · ${n('NFR')} NFR · ${n('AD')} AD`);
console.log(`         ${KONI_RELEASES.size} releases of this product (the "(Koni)" lineage — the CHANGELOG holds others)\n`);

if (badField.length) {
  console.log(`  ✗ ${badField.length} field(s) naming the wrong thing:\n`);
  badField.forEach((b) => console.log(`    ${b}`));
  console.log('');
}

if (!dangling.size && !badField.length) {
  console.log('  ✓ every ID named in the doc surface resolves');
  process.exit(0);
}

if (!dangling.size) {
  process.exit(1);
}

console.log(`  ✗ ${dangling.size} dangling ID(s) — named in prose, no such document:\n`);

for (const id of [...dangling.keys()].sort()) {
  console.log(`    ${id}`);
  [...dangling.get(id)].sort().forEach((w) => console.log(`      ${w}`));
}

console.log('\n  An ID that names nothing is a claim with no referent. Either write the');
console.log('  document, or describe the thing without minting an ID for it.');
process.exit(1);
