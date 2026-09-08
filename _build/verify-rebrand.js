// verify-rebrand.js
// Regression gate for the Rhine Solution rebrand (Tasks 1-4). Verifies the merged
// static site contains only Rhine's real content: 7 projects, no hubtown slugs,
// no hubtown press sources in news, no /careers canonicals, no Mumbai district
// labels, and no dangling sanity cache refs in the projects payload.
//
// Exit 0 when every assertion PASSes; non-zero when any FAILs.
//
// Usage: node _build/verify-rebrand.js  (run from the merged site root, or pass
// the merged root as argv[2]).

const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || process.cwd();
const { revive } = require(path.join(__dirname, 'inject-project-detail.js'));

const RHINE_SLUGS = [
  'plan2shift', 'spendtracker', 'brain', 'music-trends-local',
  'mac-mini-ai', 'rhinesolution', 'cybercrime-report',
];

// The 56 hubtown slug patterns that must be ABSENT from the projects payload.
// `25-` is a prefix (so match slug boundaries), the rest are distinctive substrings.
const HUBTOWN_PATTERNS = ['akruti-', 'hubtown-', 'dlf-', 'ackruti-', 'sunstream', 'asmeeta'];
const HUBTOWN_PREFIX = '25-';

const PROJECTS_PAYLOAD = path.join(ROOT, 'projects', '_payloadc9a0.json');
const NEWS_PAYLOAD = path.join(ROOT, 'news', '_payloadc9a0.json');

let failures = 0;

function report(name, pass, detail) {
  if (pass) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? ': ' + detail : ''}`);
  }
}

function allIndexHtml(root) {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'hubtown-mirror') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === 'index.html') out.push(p);
    }
  };
  walk(root);
  return out;
}

// ---- assertion 1: projects list decodes to exactly 7 Rhine projects ----
(function () {
  let pass = false, detail = '';
  try {
    const pp = JSON.parse(fs.readFileSync(PROJECTS_PAYLOAD, 'utf8'));
    const revived = revive(pp, { ShallowReactive: v => ({ ...v }) });
    const LIST_KEY = 'sanity-onNvxnDB8paO7TROOqQDtTStnLDv6SmIJhMGSA_DVDM';
    const listWrapper = revived.data && revived.data[LIST_KEY];
    const list = listWrapper && listWrapper.data;
    if (Array.isArray(list) && list.length === 7) {
      const slugs = list.map(x => x && x.slug);
      const missing = RHINE_SLUGS.filter(s => !slugs.includes(s));
      if (missing.length === 0) {
        pass = true;
      } else {
        detail = `missing slugs: ${missing.join(', ')}; got ${slugs.join(', ')}`;
      }
    } else {
      detail = `list length ${list ? list.length : 'n/a'}, expected 7`;
    }
  } catch (e) { detail = e.message; }
  report('projects list = 7 Rhine projects', pass, detail);
})();

// ---- assertion 2: no hubtown slugs in decoded content NOR in the raw file ----
(function () {
  let pass = false, detail = '';
  try {
    const rawText = fs.readFileSync(PROJECTS_PAYLOAD, 'utf8');
    const pp = JSON.parse(rawText);
    const revived = revive(pp, { ShallowReactive: v => ({ ...v }) });
    const revivedJson = JSON.stringify(revived);

    // 0) RAW file must be clean of hubtown slug strings too (dead data gate).
    //    `25-` is a slug PREFIX, not a substring — it appears inside UUIDs like
    //    4525-9fb9 — so it is NOT checked here; the distinctive patterns below
    //    are sufficient to catch every hubtown/orphaned slug at the byte level.
    for (const pat of HUBTOWN_PATTERNS) {
      if (rawText.includes(pat)) {
        detail = `raw projects payload contains hubtown slug pattern "${pat}" (orphaned data)`;
        return report('no hubtown slugs in projects payload', false, detail);
      }
    }

    // 1) the bare token `hubtown` must not appear anywhere in decoded content
    if (revivedJson.includes('hubtown')) {
      detail = 'string "hubtown" present in decoded projects content';
      return report('no hubtown slugs in projects payload', false, detail);
    }

    // 2) other distinctive hubtown slug substrings must be absent
    for (const pat of HUBTOWN_PATTERNS) {
      if (revivedJson.includes(pat)) {
        detail = `hubtown slug pattern "${pat}" present in decoded content`;
        return report('no hubtown slugs in projects payload', false, detail);
      }
    }

    // 3) `25-` is a prefix: reject any project slug starting with it (avoid
    //    UUID/date substrings that legitimately contain "25-")
    const slugs = [];
    const collect = (v) => {
      if (!v || typeof v !== 'object') return;
      if (v.slug) slugs.push(v.slug);
      for (const k of Object.keys(v)) {
        const child = v[k];
        if (child && typeof child === 'object') collect(child);
      }
      if (Array.isArray(v)) for (const c of v) if (c && typeof c === 'object') collect(c);
    };
    collect(revived);
    const bad = slugs.filter(s => typeof s === 'string' && s.startsWith(HUBTOWN_PREFIX));
    if (bad.length) {
      detail = `slug(s) matching "${HUBTOWN_PREFIX}" prefix: ${bad.join(', ')}`;
      return report('no hubtown slugs in projects payload', false, detail);
    }

    pass = true;
  } catch (e) { detail = e.message; }
  report('no hubtown slugs in projects payload', pass, detail);
})();

// ---- assertion 3: news payload free of hubtown press sources ----
(function () {
  let pass = true, detail = '';
  const bad = [];
  for (const needle of ['Times of India', 'ET Now', 'Gudi Padwa']) {
    if (fs.readFileSync(NEWS_PAYLOAD, 'utf8').includes(needle)) bad.push(needle);
  }
  if (bad.length) { pass = false; detail = 'found: ' + bad.join(', '); }
  report('news payload has no hubtown press sources', pass, detail);
})();

// ---- assertion 4: no /careers canonical in any index.html under merged root ----
(function () {
  let pass = true, detail = '';
  const hits = [];
  for (const f of allIndexHtml(ROOT)) {
    const s = fs.readFileSync(f, 'utf8');
    const canon = s.match(/rel="canonical"[^>]*href="([^"]*)"/gi) || [];
    for (const c of canon) {
      if (/careers/i.test(c)) hits.push(`${path.relative(ROOT, f)} -> ${c}`);
    }
  }
  if (hits.length) { pass = false; detail = hits.join('; '); }
  report('no rhinesolution.com/careers canonical (EN + locales)', pass, detail);
})();

// ---- assertion 5: no Mumbai district labels in EN index / projects ----
(function () {
  let pass = true, detail = '';
  const files = [path.join(ROOT, 'index.html'), path.join(ROOT, 'projects', 'index.html')];
  const labels = ['Suburbs', 'South Mumbai', 'Thane'];
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    for (const label of labels) {
      if (s.includes(label)) { pass = false; detail += `${path.relative(ROOT, f)} contains "${label}"; `; }
    }
  }
  if (detail) detail = detail.trim();
  report('no Mumbai district labels (EN home + projects)', pass, detail);
})();

// ---- assertion 6: every sanity-* key in the projects data map resolves ----
(function () {
  let pass = true, detail = '';
  try {
    const pp = JSON.parse(fs.readFileSync(PROJECTS_PAYLOAD, 'utf8'));
    const dataMap = pp[2];
    const revivers = { ShallowReactive: v => ({ ...v }) };
    const keys = Object.keys(dataMap).filter(k => k.startsWith('sanity-'));
    const bad = [];
    for (const k of keys) {
      try {
        const val = revive(pp, revivers).data[k];
        if (!val || typeof val !== 'object') bad.push(k + '(not an object)');
      } catch (e) {
        bad.push(k + '(' + e.message + ')');
      }
    }
    if (bad.length) { pass = false; detail = bad.join('; '); }
  } catch (e) { pass = false; detail = e.message; }
  report('all sanity-* cache keys resolve', pass, detail);
})();

// ---- summary ----
console.log('');
if (failures === 0) {
  console.log(`SUMMARY: ALL ${6} ASSERTIONS PASS`);
  process.exit(0);
} else {
  console.log(`SUMMARY: ${failures} ASSERTION(S) FAILED`);
  process.exit(1);
}
