// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Build docs/notes/changelog-coverage.md — every issue cited in a SubWallet
// (Koni) CHANGELOG release, mapped to the story/epic that owns it, plus the
// assignee, sprint, and release it shipped in. This is the ERP's data source:
// "who shipped what, in which release, under which issue."
//
// It is an INDEX, not a set of stories. It makes claims about the RECORD (this
// issue is cited in release X, closed by Y), never about the CODE — so it does
// not fabricate acceptance criteria (LESSONS §68). A capability that needs a
// real story is surfaced here as UNOWNED, and earns a story the normal way.
//
// Inputs, all in-repo except the tracker cache:
//   docs/CHANGELOG.md                 — issue → bullet, release, date (Koni only)
//   git log [Issue-N]                 — issue → implementer (commit author)
//   docs/notes/contributor-map.md     — git identity → GitHub login
//   docs/sprints/stories/*.md         — which issues a story already claims; sprint
//   /tmp/all2.json (gh cache)         — issue → tracker assignee, state (optional)
//
// Usage: node scripts/koni-docs-changelog-coverage.mjs
//        (writes the index; exits 0. --check exits 1 if the index is stale.)

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();
const DOCS = path.join(ROOT, 'docs');
const OUT = path.join(DOCS, 'notes/changelog-coverage.md');
const GH_CACHE = '/tmp/all2.json';

// ---- CHANGELOG: issue → {release, date, bullet}, Koni lineage only ----------

const clLines = fs.readFileSync(path.join(DOCS, 'CHANGELOG.md'), 'utf8').split('\n');
const rel = new Map(); // issue → {v, date}
const bullet = new Map(); // issue → first bullet text
const releaseOrder = []; // v in file order (newest first)
let koni = false;
let v = null;
let date = null;

for (const ln of clLines) {
  const h = ln.match(/^## \[(\d+\.\d+\.\d+)\] — (\d{4}-\d{2}-\d{2})(.*)$/);

  if (h) {
    koni = h[3].includes('(Koni)');
    v = h[1];
    date = h[2];

    if (koni) releaseOrder.push(v);

    continue;
  }

  if (koni) {
    for (const m of ln.matchAll(/#(\d{2,5})/g)) {
      const i = Number(m[1]);

      if (!rel.has(i)) {
        rel.set(i, { date, v });
        bullet.set(i, ln.trim().replace(/^[-*]\s*/, '').slice(0, 160));
      }
    }
  }
}

const issues = [...rel.keys()].sort((a, b) => a - b);

// ---- git: issue → implementer login -----------------------------------------

const alias = {}; // lowercased git name/email → GitHub login

for (const line of fs.readFileSync(path.join(DOCS, 'notes/contributor-map.md'), 'utf8').split('\n')) {
  const m = line.match(/\|\s*\[`([^`]+)`\]/);

  if (!m) continue;

  const login = m[1];
  const cols = line.split('|');

  alias[login.toLowerCase()] = login;

  for (const a of (cols[3] || '').matchAll(/`([^`]+)`/g)) alias[a[1].toLowerCase()] = login;
  for (const e of (cols[4] || '').matchAll(/`([^`@]+@[^`]+)`/g)) alias[e[1].toLowerCase()] = login;
}

const gitLog = spawnSync('git', ['log', '--all', '--no-merges', '--format=%an%x01%ae%x01%s'],
  { encoding: 'utf8', maxBuffer: 1 << 28 }).stdout || '';
const tally = new Map(); // issue → Map(login → count)

for (const line of gitLog.split('\n')) {
  const p = line.split('\x01');

  if (p.length < 3) continue;

  const [an, ae, subj] = p;

  if (/^(docs|chore\(docs\)):/.test(subj)) continue;

  for (const m of subj.matchAll(/\[Issue-#?(\d{2,5})\]/g)) {
    const i = Number(m[1]);
    const login = alias[ae.toLowerCase()] || alias[an.toLowerCase()] || an;

    if (!tally.has(i)) tally.set(i, new Map());

    tally.get(i).set(login, (tally.get(i).get(login) || 0) + 1);
  }
}

const implementer = (i) => {
  const t = tally.get(i);

  if (!t) return null;

  return [...t.entries()].sort((a, b) => b[1] - a[1])[0][0];
};

// ---- tracker cache: issue → {assignee, state} -------------------------------

const tracker = new Map();

if (fs.existsSync(GH_CACHE)) {
  for (const o of JSON.parse(fs.readFileSync(GH_CACHE, 'utf8'))) {
    tracker.set(o.number, {
      assignee: (o.assignees || [])[0]?.login || null,
      open: o.state === 'OPEN'
    });
  }
}

// ---- existing stories: issue → claiming story --------------------------------
//
// Two ways a story owns an issue, and the index keeps them apart because they carry
// different confidence:
//   CITED   — the issue number appears in the story. Certain.
//   MATCHED — no story cites it, but a same-epic story shares a capability token
//             (provider/network/feature name). Inferred — a link to verify, not a fact.
// The point of MATCHED: EPIC-11 already has a story per swap provider, so "Add swap
// pairs for Chainflip" belongs to the Chainflip story — it was never a new capability,
// just an uncited increment. 91% of the routed bucket is this.

const STOP = new Set(('the and for with via some new add fix update support improve when not from into'
  + ' a an of on in to is are be extension webapp subwallet screen bug feature account network token'
  + ' user error page show display button content ui ux').split(' '));
const tokenize = (s) => new Set((s.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter((w) => !STOP.has(w)));

const claimedBy = new Map(); // issue → US id (CITED)
const epicStoryTokens = new Map(); // epic → [{id, tokens}]
const storyDir = path.join(DOCS, 'sprints/stories');

for (const f of fs.readdirSync(storyDir).filter((x) => x.endsWith('.md'))) {
  const t = fs.readFileSync(path.join(storyDir, f), 'utf8');
  const id = (t.match(/^id:\s*(US-[\d.]+)/m) || [])[1];

  if (!id) continue;

  const epic = (t.match(/^epic:\s*(EPIC-\d+)/m) || [])[1];
  const title = (t.match(/^title:\s*"?(.+?)"?\s*$/m) || [])[1] || '';

  if (epic) {
    if (!epicStoryTokens.has(epic)) epicStoryTokens.set(epic, []);

    epicStoryTokens.get(epic).push({ id, tokens: tokenize(`${title} ${t.slice(0, 2500)}`) });
  }

  for (const m of t.matchAll(/#(\d{2,5})/g)) {
    const i = Number(m[1]);

    if (rel.has(i) && !claimedBy.has(i)) claimedBy.set(i, id);
  }
}

// best same-epic story whose capability tokens the bullet shares (most overlap wins)
const matchStory = (epic, blurb) => {
  const bt = tokenize(blurb);
  let best = null;
  let bestN = 0;

  for (const s of epicStoryTokens.get(epic) || []) {
    const n = [...bt].filter((w) => s.tokens.has(w)).length;

    if (n > bestN) {
      bestN = n;
      best = s.id;
    }
  }

  return bestN >= 1 ? best : null;
};

// ---- owning epic: heuristic by bullet text (only when no story claims it) ----
// Routes an unclaimed issue to the epic whose theme it matches. Epic-level, not
// story-level: a guess at "which capability area", honest about being a guess.

// Order matters: the most specific capability wins, so it is tried first. A bare
// "fix/improve UI" only reaches EPIC-6 after every product area has had its say.
const EPIC_RULES = [
  ['EPIC-16', /ledger|keystone|hardware wallet|trezor/i],
  ['EPIC-15', /governance|opengov|referend|conviction|voting|\bvote\b|delegat/i],
  ['EPIC-18', /multisig|multi-sig/i],
  ['EPIC-17', /\bproxy\b/i],
  ['EPIC-11', /\bswap\b|chainflip|uniswap|kyber|simpleswap|hydradx|\bdex\b|kyberswap/i],
  ['EPIC-12', /earn|staking|\bstake\b|nomination|\bpool\b|yield|validator|unstake|unstaking|redeem|crowdloan|reward/i],
  ['EPIC-9', /\bnft\b|collectible|inscription|ordinal|rmrk/i],
  ['EPIC-14', /\bbuy\b|on-?ramp|off-?ramp|\bfiat\b|transak|banxa|coinbase|onramper|sell crypto/i],
  ['EPIC-13', /\bxcm\b|cross-chain|bridge|\bteleport\b/i],
  ['EPIC-10', /walletconnect|\bdapp\b|\bsign(ing)?\b|authoriz|injected|website access|connect/i],
  ['EPIC-8', /\bsend\b|transfer|\breceive\b|\bfee\b|transaction .*(confirm|submit)/i],
  ['EPIC-3', /account|import|export|seed|mnemonic|keyring|derivation|address book|watch-only|\bqr\b/i],
  ['EPIC-4', /integrat|\bnetwork\b|chain-list|\bchain\b|\brpc\b|endpoint|metadata|parachain|register|\btoken(s)?\b|\blogo\b|stable ?coin|erc20|erc-20|asset/i],
  ['EPIC-7', /balance|portfolio|price|aggregat|crypto .*value/i],
  ['EPIC-6', /history|explorer|\bui\b|\bux\b|screen|display|style|layout|theme|dark mode|banner|popup|tooltip|button|grammar|localiz|language|translation|design|feedback|experience|settings/i],
  ['EPIC-5', /phishing|scam|blockaid|security|malicious|risk/i],
  ['EPIC-19', /onboard|campaign|engagement|referral|notification|announcement/i],
  ['EPIC-20', /performance|\bcache\b|memory|data fetching|optimi|lifecycle|mv3/i],
  ['EPIC-1', /\bbuild\b|\bci\b|firefox|chrome|store|manifest|deploy|release|version bump/i]
];

const epicFor = (i) => {
  const b = bullet.get(i) || '';

  for (const [e, re] of EPIC_RULES) {
    if (re.test(b)) return e;
  }

  return null;
};

// ---- assemble ---------------------------------------------------------------

const row = (i) => {
  const { v, date } = rel.get(i);
  const b = bullet.get(i);
  const cited = claimedBy.get(i) || null;
  const epic = cited ? null : epicFor(i);
  const matched = cited ? null : (epic ? matchStory(epic, b) : null);
  const asg = tracker.get(i)?.assignee || implementer(i) || '—';
  const open = tracker.get(i)?.open;

  return { i, v, date, bullet: b, cited, matched, epic, asg, open };
};

const rows = issues.map(row);
const owned = rows.filter((r) => r.cited); // certain
const linked = rows.filter((r) => !r.cited && r.matched); // inferred to an existing story
const routed = rows.filter((r) => !r.cited && !r.matched && r.epic); // an area, no story
const unowned = rows.filter((r) => !r.cited && !r.matched && !r.epic); // needs triage

// ---- emit -------------------------------------------------------------------

const esc = (s) => (s || '').replace(/\|/g, '\\|');
const link = (i) => `[#${i}](https://github.com/Koniverse/SubWallet-Extension/issues/${i})`;
const cell = (r) => `| ${link(r.i)} | ${esc(r.bullet)} | ${r.v} | ${r.date} | ${r.asg}${r.open ? ' ⚠️open' : ''} |`;

const byEpic = new Map();

for (const r of routed) {
  if (!byEpic.has(r.epic)) byEpic.set(r.epic, []);

  byEpic.get(r.epic).push(r);
}

const out = [];

out.push('# CHANGELOG coverage index');
out.push('');
out.push('> **Generated — do not hand-edit.** `node scripts/koni-docs-changelog-coverage.mjs`.');
out.push('> This is the ERP data source: every issue cited in a SubWallet (Koni) CHANGELOG');
out.push('> release, the release it shipped in, and who implemented it. It indexes the');
out.push('> **record**, not the code — it makes no acceptance-criteria claim ([LESSONS §68](../LESSONS.md)).');
out.push('');
out.push('An issue is **cited** when a story names its number (certain); **linked** when no story');
out.push('cites it but a same-epic story shares its capability (inferred — a link to verify);');
out.push('**routed** when only the epic area is clear; **unowned** when even that is not. The last');
out.push('two buckets — **the residue** — are the only issues a genuinely-new story could be about.');
out.push('');
out.push(`- Issues cited in ${releaseOrder.length} Koni releases: **${rows.length}**`);
out.push(`- **Cited** by a story (certain): **${owned.length}**`);
out.push(`- **Linked** to an existing story (inferred by capability): **${linked.length}**`);
out.push(`- **Routed** to an epic, no story: **${routed.length}**`);
out.push(`- **Unowned** (needs triage): **${unowned.length}**`);
out.push(`- → residue that could warrant a new story: **${routed.length + unowned.length}**`);
out.push(`- Assignee resolved (tracker or git): **${rows.filter((r) => r.asg !== '—').length}/${rows.length}**`);
out.push('');

out.push('## Cited — issue number appears in a story');
out.push('');
out.push('| issue | shipped as | release | date | US |');
out.push('| --- | --- | --- | --- | --- |');

for (const r of owned.sort((a, b) => a.cited.localeCompare(b.cited) || a.i - b.i)) {
  out.push(`| ${link(r.i)} | ${esc(r.bullet)} | ${r.v} | ${r.date} | ${r.cited} |`);
}

out.push('');
out.push('## Linked — no citation, but an existing story owns the capability (inferred)');
out.push('');
out.push('> These need a citation added to the named story, not a new story. Verify the match');
out.push('> before relying on it — it is a shared-keyword inference, not a claim.');
out.push('');
out.push('| issue | shipped as | release | date | → likely US |');
out.push('| --- | --- | --- | --- | --- |');

for (const r of linked.sort((a, b) => a.matched.localeCompare(b.matched) || a.i - b.i)) {
  out.push(`| ${link(r.i)} | ${esc(r.bullet)} | ${r.v} | ${r.date} | ${r.matched} |`);
}

out.push('');
out.push('## Routed — residue: an area, but no story yet');
out.push('');

for (const e of [...byEpic.keys()].sort()) {
  const g = byEpic.get(e).sort((a, b) => a.i - b.i);

  out.push(`### ${e} — ${g.length} issue`);
  out.push('');
  out.push('| issue | bullet | release | date | assignee |');
  out.push('| --- | --- | --- | --- | --- |');
  g.forEach((r) => out.push(cell(r)));
  out.push('');
}

out.push('## Unowned — capability area unclear, needs triage');
out.push('');
out.push('| issue | bullet | release | date | assignee |');
out.push('| --- | --- | --- | --- | --- |');
unowned.sort((a, b) => a.i - b.i).forEach((r) => out.push(cell(r)));
out.push('');

const text = out.join('\n') + '\n';

if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';

  if (cur !== text) {
    console.error('changelog-coverage.md is stale — run: node scripts/koni-docs-changelog-coverage.mjs');
    process.exit(1);
  }

  console.log('changelog-coverage.md is up to date');
  process.exit(0);
}

fs.writeFileSync(OUT, text);
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(`  ${rows.length} issues · ${owned.length} owned · ${routed.length} routed · ${unowned.length} unowned`);
console.log(`  assignee resolved: ${rows.filter((r) => r.asg !== '—').length}/${rows.length}`);
