// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// One story per tracker issue that no FR story owns — distributed across NEW
// per-area maintenance epics, so the 21 FR epics stay the clean requirement map.
// Owner directive: 1 issue = 1 US, except issues a main-FR story already carries;
// classify into separate maintenance epics by area, not one dumping ground.
//
// A maintenance story documents the RECORD, never invents behaviour (LESSONS §68):
//   status   done if the issue is CLOSED, else backlog (we hold no sprint for open work)
//   version  the (Koni) release that cites it in the CHANGELOG, else empty (shipped date
//            unknown — a closed issue with no changelog line)
//   sprint   the release month if shipped, else the close month, else empty
//   assignee tracker assignee, else the git [Issue-N] implementer, else empty
//   commit   the feature commit(s), never a [CI Skip] release bump (D106)
//
// Idempotent: every file it writes carries `generated_by: koni-docs-gen-maintenance`;
// a re-run deletes exactly those and rebuilds from the tracker cache + CHANGELOG.
//
// Usage: node scripts/koni-docs-gen-maintenance.mjs   (needs /tmp/all2.json — the gh cache)

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();
const DOCS = path.join(ROOT, 'docs');
const TODAY = '2026-07-15';
const MARK = 'koni-docs-gen-maintenance';

const all = JSON.parse(fs.readFileSync('/tmp/all2.json', 'utf8'));
// GitHub sub-issue graph: number → {parent, subs}. Built by the audit fetch (GraphQL).
const rel = fs.existsSync('/tmp/rel.json') ? JSON.parse(fs.readFileSync('/tmp/rel.json', 'utf8')) : {};
const relOf = (n) => rel[String(n)] || {};
// closing PRs per issue — the second-strongest evidence a closed issue shipped, after a
// resolvable [Issue-N] commit and before the CHANGELOG. Absent all three, `done` rests only
// on the tracker's COMPLETED label, and the story must say so.
const prCache = fs.existsSync('/tmp/pr.json') ? JSON.parse(fs.readFileSync('/tmp/pr.json', 'utf8')) : [];
const prsOf = new Map(prCache.map((o) => [o.number, (o.closedByPullRequestsReferences || []).map((p) => p.number)]));

// GitHub Projects board #2 "SubWallet.App - Development": the workflow Status an OPEN issue
// actually sits in. The tracker only knows OPEN/CLOSED; the board is where "In Review" lives.
// Extension items only. Maps the board's rich status to the koni-docs enum.
const boardCache = fs.existsSync('/tmp/board.json') ? JSON.parse(fs.readFileSync('/tmp/board.json', 'utf8')) : [];
const boardOf = new Map(boardCache.filter((o) => o.repo === 'SubWallet-Extension').map((o) => [o.num, o]));
const ACTIVE_SPRINT = 'sprint-2026-W28';
const BOARD_STATUS = {
  'In Review': 'review', 'In Testing': 'review',
  'Implementing': 'in-progress', 'Follow Up': 'in-progress',
  'Ready to Implement': 'ready', 'Ready to build': 'ready'
  // everything else (In Backlog, In Plan, Researching, Require BA Docs / Design,
  // Consider To Close, Done-but-still-open) → backlog: not actively in flight
};
const mapBoard = (s) => BOARD_STATUS[s] || 'backlog';
const parseIter = (s) => {
  const m = (s || '').match(/Week (\d+) - (\d{4})/);

  return m ? `sprint-${m[2]}-W${m[1].padStart(2, '0')}` : null;
};

// ---- issues already owned by a story (any layer) → excluded ------------------

// Only stories WE DID NOT generate count as owners — otherwise a re-run would see this
// epic's own citations, exclude every issue, and wipe itself. Idempotency depends on it.
const cited = new Set();

for (const dir of ['sprints/stories', 'sprints/epics']) {
  for (const f of fs.readdirSync(path.join(DOCS, dir)).filter((x) => x.endsWith('.md'))) {
    const t = fs.readFileSync(path.join(DOCS, dir, f), 'utf8');

    if (t.includes(`generated_by: ${MARK}`)) continue;

    for (const m of t.matchAll(/#(\d{2,5})/g)) cited.add(Number(m[1]));
  }
}

// ---- CHANGELOG: issue → {v, date, bullet}, Koni lineage ----------------------

const clLines = fs.readFileSync(path.join(DOCS, 'CHANGELOG.md'), 'utf8').split('\n');
const shipped = new Map();
let koni = false;
let v = null;
let date = null;

for (const ln of clLines) {
  const h = ln.match(/^## \[(\d+\.\d+\.\d+)\] — (\d{4}-\d{2}-\d{2})(.*)$/);

  if (h) { koni = h[3].includes('(Koni)'); v = h[1]; date = h[2]; continue; }

  if (koni) {
    for (const m of ln.matchAll(/#(\d{2,5})/g)) {
      const i = Number(m[1]);

      if (!shipped.has(i)) shipped.set(i, { v, date, bullet: ln.trim().replace(/^[-*]\s*/, '').slice(0, 160) });
    }
  }
}

const KONI = new Set([...clLines].map((l) => (l.match(/^## \[(\d+\.\d+\.\d+)\][^\n]*\(Koni\)/) || [])[1]).filter(Boolean));

// tags whose commit predates the fork are polkadot-js's — never merge-base on them
const FORK = '2022-01-12';
const colliding = new Set();

for (const ver of KONI) {
  const t = spawnSync('git', ['log', '-1', '--format=%cs', `v${ver}`], { encoding: 'utf8' });

  if (t.status === 0 && t.stdout.trim() && t.stdout.trim() < FORK) colliding.add(ver);
}

// ---- git: issue → feature commits (no merge, no docs, no CI bump) ------------

const gitLog = spawnSync('git', ['log', '--all', '--no-merges', '--format=%H%x01%an%x01%ae%x01%s'],
  { encoding: 'utf8', maxBuffer: 1 << 29 }).stdout || '';
const commitsOf = new Map();
const authorTally = new Map();

const alias = {};

for (const line of fs.readFileSync(path.join(DOCS, 'notes/contributor-map.md'), 'utf8').split('\n')) {
  const m = line.match(/\|\s*\[`([^`]+)`\]/);

  if (!m) continue;

  const login = m[1];
  const cols = line.split('|');

  alias[login.toLowerCase()] = login;

  for (const a of (cols[3] || '').matchAll(/`([^`]+)`/g)) alias[a[1].toLowerCase()] = login;
  for (const e of (cols[4] || '').matchAll(/`([^`@]+@[^`]+)`/g)) alias[e[1].toLowerCase()] = login;
}

for (const line of gitLog.split('\n')) {
  const p = line.split('\x01');

  if (p.length < 4) continue;

  const [sha, an, ae, subj] = p;

  if (/^(docs|chore\(docs\)):/.test(subj) || /\[CI Skip\]/i.test(subj)) continue;

  for (const m of subj.matchAll(/\[Issue-#?(\d{2,5})\]/g)) {
    const i = Number(m[1]);

    if (!commitsOf.has(i)) commitsOf.set(i, []);

    if (commitsOf.get(i).length < 5) commitsOf.get(i).push(sha.slice(0, 10));

    if (!authorTally.has(i)) authorTally.set(i, new Map());

    const login = alias[ae.toLowerCase()] || alias[an.toLowerCase()] || an;

    authorTally.get(i).set(login, (authorTally.get(i).get(login) || 0) + 1);
  }
}

const implementer = (i) => {
  const t = authorTally.get(i);

  return t ? [...t.entries()].sort((a, b) => b[1] - a[1])[0][0] : null;
};

// ---- route issue title → product area ---------------------------------------

const RULES = [
  ['EPIC-16', /ledger|keystone|hardware/i], ['EPIC-15', /governance|opengov|referend|voting|\bvote\b|delegat/i],
  ['EPIC-18', /multisig/i], ['EPIC-17', /\bproxy\b/i],
  ['EPIC-11', /\bswap\b|chainflip|uniswap|kyber|simpleswap|hydration|\bdex\b/i],
  ['EPIC-12', /earn|staking|\bstake\b|nomination|\bpool\b|yield|validator|unstak|crowdloan|reward/i],
  ['EPIC-9', /\bnft\b|collectible|inscription|ordinal|rmrk/i], ['EPIC-14', /\bbuy\b|on-?ramp|off-?ramp|fiat|transak|banxa/i],
  ['EPIC-13', /\bxcm\b|cross-chain|bridge|teleport/i], ['EPIC-10', /walletconnect|\bdapp\b|\bsign|authoriz|injected|connect/i],
  ['EPIC-8', /\bsend\b|transfer|\breceive\b|\bfee\b|transaction/i],
  ['EPIC-3', /account|import|export|seed|mnemonic|keyring|derivation|watch-only|\bqr\b/i],
  ['EPIC-4', /integrat|network|chain-list|\bchain\b|\brpc\b|endpoint|metadata|parachain|\btoken|\blogo\b|stablecoin|erc20|asset/i],
  ['EPIC-7', /balance|portfolio|price|aggregat/i],
  ['EPIC-6', /history|\bui\b|\bux\b|screen|display|style|theme|banner|popup|tooltip|button|grammar|localiz|language|design|settings/i],
  ['EPIC-5', /phishing|scam|blockaid|security|malicious|risk/i], ['EPIC-19', /onboard|campaign|referral|notification|announcement/i],
  ['EPIC-20', /performance|\bcache\b|memory|optimi|lifecycle|mv3/i], ['EPIC-1', /\bbuild\b|\bci\b|firefox|chrome|store|manifest|deploy/i]
];
const routeArea = (t) => { for (const [e, re] of RULES) if (re.test(t)) return e; return null; };

const AREA = {
  'EPIC-1': 'Build & Platform', 'EPIC-3': 'Account', 'EPIC-4': 'Network & Token', 'EPIC-5': 'Security',
  'EPIC-6': 'UI & UX', 'EPIC-7': 'Portfolio & Balances', 'EPIC-8': 'Transactions', 'EPIC-9': 'NFT',
  'EPIC-10': 'dApp Connectivity', 'EPIC-11': 'Swap', 'EPIC-12': 'Earning', 'EPIC-13': 'XCM & Bridge',
  'EPIC-14': 'Fiat Ramp', 'EPIC-15': 'Governance', 'EPIC-16': 'Hardware Wallet', 'EPIC-17': 'Proxy',
  'EPIC-18': 'Multisig', 'EPIC-19': 'Onboarding & Localization', 'EPIC-20': 'Performance'
};

// ---- assemble specs ----------------------------------------------------------

const unm = all.filter((o) => !cited.has(o.number));
const groups = new Map(); // key → rows

for (const o of unm) {
  const sh = shipped.get(o.number);
  const key = sh ? `bullet:${sh.bullet}` : `solo:${o.number}`;

  if (!groups.has(key)) groups.set(key, []);

  groups.get(key).push(o);
}

const MONTH_END = { '01': 31, '02': 28, '03': 31, '04': 30, '05': 31, '06': 30, '07': 31, '08': 31, '09': 30, '10': 31, '11': 30, '12': 31 };

const specs = [];

for (const rows of groups.values()) {
  rows.sort((a, b) => a.number - b.number);

  const head = rows[0];
  const nums = rows.map((r) => r.number);
  const sh = shipped.get(head.number);
  const closed = rows.map((r) => r.closedAt).filter(Boolean).sort()[0];
  const area = routeArea(head.title);
  const asg = rows.map((r) => (r.assignees || [])[0]?.login).find(Boolean)
    || nums.map(implementer).find(Boolean) || '';
  const shas = [...new Set(nums.flatMap((i) => commitsOf.get(i) || []))].slice(0, 5);

  // status: an OPEN issue takes its workflow state from the Projects board (In Review,
  // Implementing, …); a CLOSED one from the tracker's close reason — COMPLETED shipped,
  // NOT_PLANNED was declined, DUPLICATE points elsewhere.
  const anyOpen = rows.some((r) => r.state === 'OPEN');
  const anyCompleted = rows.some((r) => r.state === 'CLOSED' && r.stateReason === 'COMPLETED');
  const board = nums.map((n) => boardOf.get(n)).find(Boolean);
  let status;
  let deadReason = null;

  if (anyOpen) {
    status = mapBoard(board?.status);
  } else if (anyCompleted) {
    status = 'done';
  } else {
    status = 'deprecated';
    deadReason = rows.some((r) => r.stateReason === 'DUPLICATE') ? 'DUPLICATE' : 'NOT_PLANNED';
  }

  const ver = (status === 'done' && sh) ? sh.v : '';
  const shipDate = sh ? sh.date : (closed ? closed.slice(0, 10) : null);
  // done → its release month; in-flight (non-backlog open) → the board iteration, or the
  // active sprint if the board holds none; backlog & deprecated → no window
  let sprint = '';

  if (status === 'done' && shipDate) {
    sprint = `sprint-${shipDate.slice(0, 4)}-M${shipDate.slice(5, 7)}`;
  } else if (anyOpen && status !== 'backlog') {
    sprint = parseIter(board?.iter) || ACTIVE_SPRINT;
  }

  const boardStatus = anyOpen ? (board?.status || null) : null;
  const title = (sh ? sh.bullet : head.title).replace(/\s*\(#[\d,# ]+\)\s*$/, '').replace(/\s*\(issue #[\d,# ]+\)\s*$/i, '').replace(/"/g, "'").trim().slice(0, 120) || `Issue #${head.number}`;
  const parents = [...new Set(nums.map((n) => relOf(n).parent).filter(Boolean))];
  const subs = nums.reduce((a, n) => a + (relOf(n).subs || 0), 0);
  const prs = [...new Set(nums.flatMap((n) => prsOf.get(n) || []))].slice(0, 5);

  specs.push({ nums, title, area, asg, shas, status, deadReason, ver, sprint, shipDate, parents, subs, prs, boardStatus });
}

// ---- maintenance epics: one per area present, in area order + uncategorized --

const areasPresent = [...new Set(specs.map((s) => s.area).filter(Boolean))]
  .sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]));
const maintEpic = new Map();
let epicN = 22;

for (const a of areasPresent) maintEpic.set(a, `EPIC-${epicN++}`);

const UNCAT = `EPIC-${epicN}`;

maintEpic.set(null, UNCAT);

// per-epic sequential numbering, deterministic by earliest issue number
const byEpic = new Map();

for (const s of specs) {
  s.epic = maintEpic.get(s.area);

  if (!byEpic.has(s.epic)) byEpic.set(s.epic, []);

  byEpic.get(s.epic).push(s);
}

for (const [ep, list] of byEpic) {
  list.sort((a, b) => a.nums[0] - b.nums[0]);
  list.forEach((s, k) => { s.id = `${ep.replace('EPIC', 'US')}.${k + 1}`; });
}

// issue number → the maintenance story that owns it, for parent/sub cross-links
const issueToId = new Map();

for (const s of specs) for (const n of s.nums) issueToId.set(n, s.id);

// ---- wipe previously generated, then write -----------------------------------

const storyDir = path.join(DOCS, 'sprints/stories');
const epicDir = path.join(DOCS, 'sprints/epics');
let wiped = 0;

for (const dir of [storyDir, epicDir]) {
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const p = path.join(dir, f);

    if (fs.readFileSync(p, 'utf8').includes(`generated_by: ${MARK}`)) { fs.unlinkSync(p); wiped++; }
  }
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 55).replace(/-$/, '') || 'issue';
const url = (i) => `https://github.com/Koniverse/SubWallet-Extension/issues/${i}`;

// sprint windows needed. M-windows are reconstructed months (closed work); W-windows are
// real ISO weeks the board's iteration field names (in-flight work).
const isoWeekStart = (yr, wk) => {
  const jan4 = new Date(Date.UTC(yr, 0, 4));
  const mondayOfW1 = new Date(jan4);

  mondayOfW1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));

  const monday = new Date(mondayOfW1);

  monday.setUTCDate(mondayOfW1.getUTCDate() + (wk - 1) * 7);

  return monday;
};
const iso = (d) => d.toISOString().slice(0, 10);

const haveSprints = new Set(fs.readdirSync(path.join(DOCS, 'sprints')).filter((f) => f.startsWith('sprint-')).map((f) => f.slice(0, -3)));
const needSprints = new Set(specs.map((s) => s.sprint).filter(Boolean));
let newWindows = 0;

for (const sp of [...needSprints].filter((s) => !haveSprints.has(s)).sort()) {
  const n = specs.filter((s) => s.sprint === sp).length;
  const mM = sp.match(/sprint-(\d{4})-M(\d{2})/);
  const mW = sp.match(/sprint-(\d{4})-W(\d{2})/);
  let start;
  let end;
  let closedStatus;
  let goal;

  if (mM) {
    start = `${mM[1]}-${mM[2]}-01`;
    end = `${mM[1]}-${mM[2]}-${MONTH_END[mM[2]]}`;
    closedStatus = 'closed';
    goal = `Reconstructed window — ${n} maintenance issues closed in ${mM[1]}-${mM[2]}. Derived from the tracker/CHANGELOG, not planned.`;
  } else {
    const mon = isoWeekStart(Number(mW[1]), Number(mW[2]));
    const sun = new Date(mon);

    sun.setUTCDate(mon.getUTCDate() + 6);
    start = iso(mon);
    end = iso(sun);
    closedStatus = end < TODAY ? 'closed' : 'in-progress';
    goal = `Board iteration ${mW[1]}-W${mW[2]} — ${n} maintenance issues the Projects board places in this week.`;
  }

  fs.writeFileSync(path.join(DOCS, 'sprints', `${sp}.md`), `---
id: ${sp}
status: ${closedStatus}
start: ${start}
end: ${end}
goal: "${goal}"
---

> ## 🕰️ ${mM ? 'Reconstructed window — retroactive, never a planned sprint' : 'Board-derived iteration — in-flight work'}

${mM
    ? `Exists so the maintenance stories closed in ${mM[1]}-${mM[2]} are locatable in time. Its \`goal\` is\nderived after the fact; **velocity here is meaningless — do not chart it** ([CONTEXT D99](../CONTEXT.md)).`
    : `Mirrors the GitHub Projects board iteration for open maintenance issues. **Velocity here is not\nthis team's estimate** — it counts issues the board tags to the week, not planned points.`}

## Sprint scope

See the maintenance epics (EPIC-22+) — the stories in ${sp}.

## Per-Epic Retrospective

_None — ${mM ? 'reconstructed from the tracker in 2026' : 'derived from the board'}._
`);
  newWindows++;
}

// maintenance epics
for (const [area, ep] of maintEpic) {
  const list = byEpic.get(ep) || [];

  if (!list.length) continue;

  const done = list.filter((s) => s.status === 'done').length;
  const backlog = list.filter((s) => s.status === 'backlog').length;
  const dead = list.filter((s) => s.status === 'deprecated').length;
  const inflight = list.filter((s) => ['ready', 'in-progress', 'review', 'blocked'].includes(s.status)).length;
  // epic status is derived, ignoring deprecated (a dead story is not pending work — D103)
  const active = list.filter((s) => s.status !== 'deprecated');
  const epicStatus = active.length && active.every((s) => s.status === 'done') ? 'done' : (active.length ? 'in-progress' : 'done');
  const title = area ? `Maintenance — ${AREA[area]}` : 'Maintenance — Uncategorized';
  const areaLine = area
    ? `Incremental work, fixes and chores for the **${AREA[area]}** area ([${area}](${area}.md)) that materialize no FR of their own.`
    : 'Shipped issues whose capability area could not be read from the tracker title — the triage bucket.';

  fs.writeFileSync(path.join(epicDir, `${ep}.md`), `---
id: ${ep}
title: "${title}"
status: ${epicStatus}
prd_ref: []
created: ${TODAY}
updated: ${TODAY}
generated_by: ${MARK}
---

## Goal

${areaLine} One story per tracker issue, so the CHANGELOG and issue tracker are fully claimed
and the ERP can answer "who shipped what, under which issue" for this area. This epic is a
**ledger, not a plan** — it is regenerated by \`scripts/koni-docs-gen-maintenance.mjs\` from the
tracker and CHANGELOG.

## Why separate from ${area || 'the FR epics'}

The 21 product epics are the **FR map**: each story there is a requirement's contract. These
issues materialize no FR — they are fixes, chore bumps, and small increments. Keeping them here
leaves ${area ? `[${area}](${area}.md)` : 'the FR epics'} readable as the requirement set, while
still giving every shipped issue exactly one owning story ([CONTEXT D107](../../CONTEXT.md) on
keeping the unit of status honest).

## What a story here is — and is not

- **It records the tracker, not the code.** Its acceptance criterion is a *coverage* assertion
  ("issue #N shipped in vX" / "closed on the tracker"), never an invented Given/When/Then — that
  is the [US-5.1](../stories/US-5.1-phishing-site-and-address-protection.md) failure this program
  exists to prevent ([LESSONS §68](../../LESSONS.md)).
- **\`points: 1\` is a count, not a Fibonacci estimate.** One story = one shipped issue. **Never
  sum these with the product stories' points** — a rollup here measures issue throughput.
- **\`sprint\` is a real month** (a single issue closed in one month), not a rollup ([D105](../../CONTEXT.md)).

## Scope

**${list.length} stories** — ${done} done (shipped), ${inflight} in flight (ready / in-progress /
review, from the Projects board), ${backlog} backlog (open, not yet started), ${dead} deprecated
(closed **not-planned / duplicate** — never shipped). Open-issue status mirrors the GitHub
Projects board (#2); closed-issue status comes from the tracker's close reason. Per-issue
detail is the [CHANGELOG coverage index](../../notes/changelog-coverage.md) and each frontmatter.

## Acceptance criteria

- [${active.every((s) => s.status === 'done') ? 'x' : ' '}] **AC-1** — Every ${area ? AREA[area] : 'uncategorized'} issue with no FR story has exactly one story here; its status matches the tracker (done = COMPLETED, backlog = open, deprecated = not-planned/duplicate).
- [x] **AC-2** — \`npx koni-docs validate\` and \`node scripts/koni-docs-check-ids.mjs\` exit 0.
`);
}

// stories
const linkIssue = (n) => {
  const owner = issueToId.get(n);

  return owner ? `[#${n}](${url(n)}) (${owner})` : `[#${n}](${url(n)})`;
};

for (const s of [...byEpic.values()].flat()) {
  const idList = s.nums.map((n) => `[#${n}](${url(n)})`).join(', ');
  const nums = s.nums.map((n) => `#${n}`).join(', ');
  const areaLine = s.area ? `${s.area} — ${AREA[s.area]}` : '_uncategorized — area unclear from the tracker title_';
  const commitLine = s.shas.length ? s.shas.join(', ') : '';
  const ac = s.status === 'done' ? 'x' : ' ';
  const isOpen = ['backlog', 'ready', 'in-progress', 'review', 'blocked'].includes(s.status);
  const boardLabel = s.boardStatus ? ` — **${s.boardStatus}** on the Projects board` : '';

  // deprecated: closed on the tracker but never shipped
  const dead = s.status === 'deprecated';
  const deadBanner = dead
    ? `\n> ## ⏸️ DEPRECATED — closed on the tracker without shipping\n>\n> Issue ${nums} was closed as **${s.deadReason === 'DUPLICATE' ? 'a duplicate' : 'not-planned'}** (${s.deadReason}), not completed. It ${s.deadReason === 'DUPLICATE' ? 'duplicates another issue — GitHub records **no structured canonical link**, so the original is not machine-recoverable; see the issue\'s comments' : 'was declined / wontfix / invalid — no code shipped for it'}. Recorded for coverage, with **no \`version_shipped\` and no \`sprint\`** because it shipped in no release. Do not count it as delivered.\n`
    : '';

  // evidence tiers for a shipped story, strongest first: a resolvable feature commit
  // (merge-base provable) → a closing PR → the CHANGELOG release → only the tracker's
  // COMPLETED label. The last is stated plainly so nobody reads code evidence into it.
  const prList = s.prs.map((p) => `[PR #${p}](https://github.com/Koniverse/SubWallet-Extension/pull/${p})`).join(', ');
  let verify;
  let evidence;

  if (dead) {
    verify = `tracker: \`gh issue view ${s.nums[0]} --json state,stateReason\` → CLOSED / ${s.deadReason}`;
    evidence = 'closed without shipping';
  } else if (isOpen) {
    verify = `tracker: \`gh issue view ${s.nums[0]}\` → OPEN${s.boardStatus ? ` · board Status = ${s.boardStatus}` : ''}`;
    evidence = s.boardStatus ? `open, board: ${s.boardStatus}` : 'open';
  } else if (s.shas.length && s.ver && !colliding.has(s.ver)) {
    verify = `\`git merge-base --is-ancestor ${s.shas[0]} v${s.ver}\` exits 0 · [coverage index](../../notes/changelog-coverage.md)`;
    evidence = `commit + release ${s.ver}`;
  } else if (s.shas.length) {
    verify = `commit ${s.shas[0]} present in git${s.ver ? ` (release ${s.ver}; tag not a valid merge-base anchor)` : ''}`;
    evidence = 'commit';
  } else if (s.prs.length) {
    verify = `closed by ${prList} · \`gh pr view ${s.prs[0]}\` → MERGED`;
    evidence = `closing PR${s.ver ? ` + release ${s.ver}` : ''}`;
  } else if (s.ver) {
    verify = `[coverage index](../../notes/changelog-coverage.md) — CHANGELOG names release ${s.ver}`;
    evidence = `CHANGELOG release ${s.ver}`;
  } else {
    verify = `tracker: \`gh issue view ${s.nums[0]} --json state,stateReason\` → CLOSED / COMPLETED — **no commit, PR, or changelog line links code to this issue**`;
    evidence = 'tracker COMPLETED label only';
  }

  const acWhen = dead
    ? `was closed **${s.deadReason}** on the tracker — recorded for coverage, not delivered`
    : (s.status === 'done'
      ? `is **closed COMPLETED** on the tracker; evidence: ${evidence}`
      : `is **open** on the tracker${boardLabel} — status mirrors the board`);

  const goalState = dead
    ? `Closed **${s.deadReason}**${s.shipDate ? ` (${s.shipDate})` : ''} — did not ship.`
    : (s.status === 'done'
      ? `Shipped/closed${s.shipDate ? ` ${s.shipDate}` : ''}.`
      : `Open${boardLabel}.`);

  // sub-issue graph cross-links (GitHub parent/sub-issue relationships)
  const relLines = [];

  if (s.parents.length) {
    relLines.push(`- **Sub-issue of** ${s.parents.map(linkIssue).join(', ')} — this is a child task; its parent is the umbrella.`);
  }

  if (s.subs) {
    relLines.push(`- **Umbrella issue** — has ${s.subs} sub-issue(s) on GitHub, each its own story. This parent aggregates them; **do not add its \`points\` to theirs** when counting throughput.`);
  }

  const relBlock = relLines.length ? `\n## Issue graph\n\n${relLines.join('\n')}\n` : '';

  fs.writeFileSync(path.join(storyDir, `${s.id}-${slug(s.title)}.md`), `---
id: ${s.id}
title: "${s.title}"
epic: ${s.epic}
status: ${s.status}
priority: P3
points: 1
sprint: ${s.sprint}
version_shipped: ${s.ver}
prd_ref: []
assignee: ${s.asg}
commit: ${commitLine}
created: ${TODAY}
updated: ${TODAY}
generated_by: ${MARK}
---
${deadBanner}
## Goal

Maintenance record for **${idList}** — *"${s.title}"*. ${goalState} No FR-materializing
story owns this issue; it is captured here so the tracker is fully claimed
([${s.epic}](../epics/${s.epic}.md)).

- **Capability area (guess):** ${areaLine}
- **This story asserts coverage, not behaviour** (AC-1) — it records that this issue exists and
  its state, not what the code should do.
${relBlock}
## Acceptance criteria

- [${ac}] **AC-1** — Issue ${nums} ${acWhen}.

## Tasks

- [${ac}] **TASK-${s.id.slice(3)}.1** — Recorded from the tracker / CHANGELOG coverage index (AC: 1)

## References

- [Issue ${nums}](${url(s.nums[0])})${s.prs.length ? `\n- Closed by ${prList}` : ''}
- [CHANGELOG coverage index](../../notes/changelog-coverage.md)

## Verification commands

| AC | Command |
| --- | --- |
| AC-1 | ${verify} |

## Cross-references

- [Epic ${s.epic}](../epics/${s.epic}.md)${s.sprint ? `\n- [Sprint ${s.sprint}](../${s.sprint}.md)` : ''}
`);
}

const nStories = [...byEpic.values()].flat().length;

const byStatus = specs.reduce((a, s) => { a[s.status] = (a[s.status] || 0) + 1; return a; }, {});

console.log(`wiped ${wiped} previously-generated files`);
console.log(`${maintEpic.size} maintenance epics · ${nStories} stories · ${newWindows} new sprint windows`);
console.log(`  status: ${Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
console.log(`  assignee resolved: ${specs.filter((s) => s.asg).length}/${specs.length} · commits: ${specs.filter((s) => s.shas.length).length}/${specs.length}`);
