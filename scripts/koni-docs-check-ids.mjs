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

// ---- anchors: a link that lands nowhere on the page ------------------------
//
// Rule 7 catches an ID that names no document. It does not catch a link that
// names a real document and a heading that is not in it — `](CONTEXT.md#d97-…)`
// resolves as a file and dumps the reader at the top of a 2000-line log. Four of
// these survived here for weeks: D96, D97 and D99 were retitled and the links that
// cited their old slugs were never updated, because nothing looked.
//
// Slugs follow GitHub's rule: lowercase, drop everything that is not word/space/
// hyphen (so `**bold**` and backticks vanish), spaces to hyphens. An em dash is
// dropped rather than replaced, which is why a title containing " — " yields a
// double hyphen.

const slugify = (heading) =>
  heading
    .replace(/^#+\s*/, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s/g, '-');

const slugCache = new Map();

const slugsOf = (file) => {
  if (!slugCache.has(file)) {
    const set = new Set();

    if (fs.existsSync(file) && file.endsWith('.md')) {
      for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
        if (/^#{1,6} /.test(line)) {
          set.add(slugify(line));
        }
      }
    }

    slugCache.set(file, set);
  }

  return slugCache.get(file);
};

const badAnchor = [];

for (const file of targets) {
  const r = rel(file);

  if (isArchive(r)) {
    continue;
  }

  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const [, target, anchor] of line.matchAll(/\]\(([^)\s#]*)#([a-z0-9][\w-]*)\)/g)) {
      // external links carry their own anchors; we cannot see the page
      if (/^[a-z]+:/i.test(target)) {
        continue;
      }

      const dest = target ? path.resolve(path.dirname(file), target) : file;

      // a missing FILE is a different defect; only judge anchors we can read
      if (!fs.existsSync(dest) || !dest.endsWith('.md')) {
        continue;
      }

      if (!slugsOf(dest).has(anchor)) {
        badAnchor.push(`${r}:${i + 1} → ${target || path.basename(file)}#${anchor}`);
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

// ---- CONTEXT.md: a decision cannot ship in a release that predates it --------
//
// Fifty-one decisions were reconstructed in bulk (2026-06-04/09) by inferring them
// from other docs rather than recording them at the time. A recurring defect: the
// `**Version**` names a release that shipped BEFORE the decision date — which means
// the version was guessed from an issue number, not read off the CHANGELOG.
//
// EXCLUDES `docs-only` entries. Those write `docs-only (against v1.3.83)`, where the
// version is the product state the docs work was audited against — necessarily an
// ALREADY-RELEASED version, so "released before the date" is correct there, not a
// defect. Omitting this carve-out produces 10 false positives out of 18.

const badVersion = [];

{
  const ctx = fs.readFileSync(path.join(DOCS, 'CONTEXT.md'), 'utf8');
  const relDate = new Map(
    [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\][^\n]*?—\s*(\d{4}-\d{2}-\d{2})[^\n]*\(Koni\)/gm)]
      .map((m) => [m[1], m[2]])
  );

  for (const entry of ctx.split(/\n(?=### D\d+\.)/)) {
    const id = (entry.match(/^### (D\d+)\./) || [])[1];
    const date = (entry.match(/^\*\*Date\*\*:\s*(\d{4}-\d{2}-\d{2})/m) || [])[1];
    const verLine = (entry.match(/^\*\*Version\*\*:(.*)$/m) || [])[1];

    if (!id || !date || !verLine || /docs-only/.test(verLine)) {
      continue;
    }

    // Read the version from the line's CLAIM, not its footnote. A corrected entry
    // annotates in italics — `v1.1.49 *(corrected … v1.1.48 released before …)*` —
    // and that footnote quotes the OLD number precisely because it was wrong. Matching
    // the whole line re-flags every entry the moment it is fixed, which is how this
    // check first failed on D10.
    const claim = verLine.replace(/\*\([^)]*\)\*/g, '');
    const ver = (claim.match(/v?(\d+\.\d+\.\d+)/) || [])[1];

    if (!ver) {
      continue;
    }

    const rd = relDate.get(ver);

    if (rd && rd < date) {
      badVersion.push(`${id}: Version v${ver} released ${rd}, before its own Date ${date}`);
    }
  }
}

const storyFm = (file) => {
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);

  return m ? Object.fromEntries([...m[1].matchAll(/^(\w+):[ \t]*(.*)$/gm)].map((x) => [x[1], x[2].trim()])) : {};
};

const badField = [];
const stories = fs.existsSync(path.join(DOCS, 'sprints/stories'))
  ? fs.readdirSync(path.join(DOCS, 'sprints/stories')).filter((f) => f.endsWith('.md'))
  : [];

// git tags whose name is a Koni version but whose commit predates the fork: the tag is
// polkadot-js's, inherited. `version_shipped: 0.7.1` is still VALID — SubWallet shipped a
// 0.7.1 — but nothing may anchor a merge-base on `v0.7.1`, because that tag is the wrong
// product's history (D106). The hazard is the ANCHOR, not the field.
const collidingTags = new Set();

for (const ver of KONI_RELEASES) {
  const t = spawnSync('git', ['log', '-1', '--format=%cs', `v${ver}`], { encoding: 'utf8' });

  if (t.status === 0 && t.stdout.trim() && t.stdout.trim() < FORK) collidingTags.add(ver);
}

for (const f of stories) {
  const d = storyFm(path.join(DOCS, 'sprints/stories', f));
  const id = d.id || f;
  const v = d.version_shipped;

  if (v && !KONI_RELEASES.has(v)) {
    badField.push(`${id}  version_shipped: ${v} — not a release of this product (no "(Koni)" row in CHANGELOG.md)`);
  }

  for (const sha of (d.commit || '').split(',').map((s) => s.trim()).filter(Boolean)) {
    const r = spawnSync('git', ['log', '-1', '--format=%s', sha], { encoding: 'utf8' });

    if (r.status !== 0) {
      badField.push(`${id}  commit: ${sha} — no such commit`);
    } else if (/\[CI Skip\]/i.test(r.stdout)) {
      badField.push(`${id}  commit: ${sha} — a CI release bump ("${r.stdout.trim().slice(0, 40)}"), which delivered nothing`);
    }
  }

  // the real landmine: a merge-base anchored on an inherited tag
  const body = fs.readFileSync(path.join(DOCS, 'sprints/stories', f), 'utf8');

  for (const ver of collidingTags) {
    if (new RegExp(`merge-base[^\\n]*\\bv${ver.replace(/\./g, '\\.')}\\b`).test(body)) {
      badField.push(`${id}  anchors merge-base on v${ver} — that tag is polkadot-js's (pre-fork), not this release (D106). Verify against the release commit instead.`);
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

if (badVersion.length) {
  console.log(`  ✗ ${badVersion.length} decision(s) shipping in a release older than the decision:\n`);
  badVersion.forEach((b) => console.log(`    ${b}`));
  console.log('\n    A version that predates its own decision was inferred, not read off the');
  console.log('    CHANGELOG. Find the release that actually carried the work.\n');
}

if (badAnchor.length) {
  console.log(`  ✗ ${badAnchor.length} link(s) to a heading that does not exist:\n`);
  badAnchor.forEach((b) => console.log(`    ${b}`));
  console.log('\n    A link that resolves as a file but not as a heading drops the reader at');
  console.log('    the top of the page. Usually the heading was retitled and its slug moved.\n');
}

if (!dangling.size && !badField.length && !badAnchor.length && !badVersion.length) {
  console.log('  ✓ every ID named in the doc surface resolves');
  console.log('  ✓ every in-repo link lands on a heading that exists');
  console.log('  ✓ no decision ships in a release older than itself');
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
