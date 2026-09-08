// Build the merged Rhine site from the pristine hubtown mirror.
//   1. Copies mirror -> merged root (assets + pages)
//   2. Applies global chrome mapping (every page HTML + main bundle + payloads)
//   3. Applies per-page mappings (page HTML + its payload + its route chunk)
// Output is fully regenerable: rerun after editing _build/mappings.js.

const fs = require('fs');
const path = require('path');

const MERGED = path.resolve(__dirname, '..');
const MIRROR = path.join(MERGED, 'hubtown-mirror', 'hubtown.co.in');
const MAPPINGS = require('./mappings.js');

// ---------------------------------------------------------------------------
// swap helpers
// ---------------------------------------------------------------------------
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

function buildReplacements(pairs) {
  const reps = [];
  for (const [a, b] of pairs) {
    reps.push([a, b]);
    if (esc(a) !== a) reps.push([esc(a), esc(b)]);
    const ra = a.replace(/'/g, '\u2019');
    if (ra !== a) reps.push([ra, b.replace(/'/g, '\u2019')]);
    const ea = esc(a).replace(/&#39;/g, '\u2019');
    if (ea !== a && ea !== esc(a)) reps.push([ea, esc(b).replace(/&#39;/g, '\u2019')]);
  }
  reps.sort((x, y) => y[0].length - x[0].length);
  return reps;
}

function apply(text, pairs, label, log) {
  const reps = buildReplacements(pairs);
  let changed = 0;
  for (const [from, to] of reps) {
    const n = text.split(from).length - 1;
    if (n > 0) {
      text = text.split(from).join(to);
      changed += n;
      if (log) console.log(`    [${label}] ${n}x ${JSON.stringify(from.slice(0, 55))}${from.length > 55 ? '\u2026' : ''}`);
    }
  }
  return text;
}

const LOGO_SVG = /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" fill="none" viewBox="0 0 186 20"[^>]*>.*?<\/svg>/g;
const LOGO_SPAN = '<span class="hidden sm:block text-off-blue whitespace-nowrap" style="font-weight:700;letter-spacing:0.22em;text-transform:uppercase;font-size:1.25rem;line-height:1;">Rhine Solution</span>';

function swapLogo(text) {
  const n = (text.match(LOGO_SVG) || []).length;
  if (n > 0) return [text.replace(LOGO_SVG, LOGO_SPAN), n];
  return [text, 0];
}

// bundle logo component swap (client-rendered nav logo) — anchor-based string surgery
const BUNDLE_LOGO_START = 'function uTe(n,e){return De(),mt("svg",cTe,';
const BUNDLE_LOGO_END = 'const vV={render:uTe}';
const BUNDLE_LOGO_REPL = 'const vV={render:function(){return De(),mt("span",{class:"hidden sm:block text-off-blue whitespace-nowrap",style:"font-weight:700;letter-spacing:0.22em;text-transform:uppercase;font-size:1.25rem;line-height:1;"},"Rhine Solution")}}';

function swapBundleLogo(text) {
  const s = text.indexOf(BUNDLE_LOGO_START);
  if (s === -1) return [text, 0];
  const e = text.indexOf(BUNDLE_LOGO_END, s);
  if (e === -1) return [text, 0];
  const replaced = text.slice(0, s) + BUNDLE_LOGO_REPL + text.slice(e + BUNDLE_LOGO_END.length);
  return [replaced, 1];
}

// ---------------------------------------------------------------------------
// 1. copy mirror -> merged root
// ---------------------------------------------------------------------------
console.log('== 1. copy mirror -> merged root ==');
const COPY_DIRS = ['.netlify', '@theatre', 'about', 'approvals', 'audio', 'basis', 'builds', 'careers', 'contact', 'data', 'draco', 'faqs', 'fonts', 'images', 'investor-relations', 'news', 'privacy-policy', 'projects', 'regulation-policy', 'terms-and-conditions', 'webgl', '_nuxt'];
const COPY_FILES = ['index.html', 'gtag-init.js', '_payloadc9a0.json', 'scene-viewer.html'];

function copyTree(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyTree(s, d);
    else fs.copyFileSync(s, d);
  }
}

// clean previous page outputs (keep infra + mirror)
fs.rmSync(path.join(MERGED, 'team'), { recursive: true, force: true });
for (const name of COPY_DIRS) {
  const dst = path.join(MERGED, name);
  fs.rmSync(dst, { recursive: true, force: true });
}
for (const name of COPY_FILES) {
  fs.rmSync(path.join(MERGED, name), { force: true });
}
for (const name of COPY_DIRS) copyTree(path.join(MIRROR, name), path.join(MERGED, name));
for (const name of COPY_FILES) fs.copyFileSync(path.join(MIRROR, name), path.join(MERGED, name));
console.log('  copied', COPY_DIRS.length + COPY_FILES.length, 'top-level items');

// vendored faqs assets (Bootstrap + Montserrat, downloaded offline) -> faqs dir
const FAQS_ASSETS = path.join(__dirname, 'faqs-assets');
if (fs.existsSync(FAQS_ASSETS)) {
  fs.mkdirSync(path.join(MERGED, 'faqs'), { recursive: true });
  for (const e of fs.readdirSync(FAQS_ASSETS)) {
    fs.copyFileSync(path.join(FAQS_ASSETS, e), path.join(MERGED, 'faqs', e));
  }
  console.log('  vendored', fs.readdirSync(FAQS_ASSETS).length, 'faqs assets');
}

// vendored news images (Sanity CDN -> local) -> news-images/
const NEWS_IMAGES = path.join(__dirname, 'news-images');
if (fs.existsSync(NEWS_IMAGES)) {
  copyTree(NEWS_IMAGES, path.join(MERGED, 'news-images'));
  console.log('  vendored news-images');
}

// vendored site images (e.g. minimap-grid) -> images/
const SITE_IMAGES = path.join(__dirname, 'site-images');
if (fs.existsSync(SITE_IMAGES)) {
  copyTree(SITE_IMAGES, path.join(MERGED, 'images'));
  console.log('  vendored site-images');
}

// missing route CSS chunk (referenced in the vite map but never emitted)
const SLUG_CSS = path.join(MERGED, '_nuxt', '_slug_.DNg8CGcY.css');
if (!fs.existsSync(SLUG_CSS)) {
  fs.writeFileSync(SLUG_CSS, '/* empty */', 'utf8');
  console.log('  created empty _slug_.DNg8CGcY.css');
}

// post-copy: rename careers -> team, drop the hubtown regulatory/filing pages
fs.renameSync(path.join(MERGED, 'careers'), path.join(MERGED, 'team'));
const REMOVE_DIRS = ['investor-relations', 'regulation-policy', 'approvals'];
for (const d of REMOVE_DIRS) fs.rmSync(path.join(MERGED, d), { recursive: true, force: true });
console.log('  careers -> team; removed', REMOVE_DIRS.join(', '));

// remove HTTrack 404-stub artifacts (harmless decoys; pollute the pages list)
const STUB_HTML = [
  'builds/latest.json.html', 'contact/p.html', '@theatre/core.html',
  'basis/index.html', 'data/index.html', 'draco/index.html',
];
for (const rel of STUB_HTML) {
  const fp = path.join(MERGED, rel);
  if (fs.existsSync(fp)) { fs.rmSync(fp); console.log('  removed stub', rel); }
}
// malformed HTTrack dir projects/' (contains a 404-stub html)
const BAD_PROJECTS_DIR = path.join(MERGED, 'projects', "'");
if (fs.existsSync(BAD_PROJECTS_DIR)) {
  fs.rmSync(BAD_PROJECTS_DIR, { recursive: true, force: true });
  console.log('  removed malformed projects dir');
}

// ---------------------------------------------------------------------------
// collect pages
// ---------------------------------------------------------------------------
const pages = [];
for (const dir of COPY_DIRS) {
  // careers was renamed to team above; resolve the live directory name
  const live = dir === 'careers' ? 'team' : dir;
  const idx = path.join(MERGED, live, 'index.html');
  if (fs.existsSync(idx)) pages.push(live);
}
if (fs.existsSync(path.join(MERGED, 'index.html'))) pages.push(''); // root home
console.log('  pages:', pages.length, '->', pages.map(p => p || '/').join(', '));

// route chunk per page (from bundle route map): name -> chunk file
const CHUNKS = {
  about: 'Cd0rH1_E.js',
  '': 'DFx-XpBD.js', // home index
  contact: 'CvQchuBp.js',
  careers: 'DRfxYBn4.js', // team page
  projects: 'BJMCwerj.js', // projects-slug route chunk
};

// ---------------------------------------------------------------------------
// 2. per-page mappings
// ---------------------------------------------------------------------------
console.log('== 2. per-page mappings ==');
for (const page of Object.keys(MAPPINGS).filter(k => k !== 'chrome')) {
  const pairs = MAPPINGS[page];
  if (!Array.isArray(pairs)) continue;
  const p = page === 'home' ? '' : page === 'careers' ? 'team' : page;
  const base = p ? path.join(MERGED, p) : MERGED;
  if (!fs.existsSync(base)) { console.log(`  [${page}] -> SKIP (no dir)`); continue; }
  const files = [path.join(base, 'index.html')];
  for (const e of fs.readdirSync(base)) if (/^_payload.*\.json$/.test(e)) files.push(path.join(base, e));
  const chunk = CHUNKS[p] || CHUNKS[page];
  if (chunk) files.push(path.join(MERGED, '_nuxt', chunk));
  console.log(`  [${page}] -> ${p || '/'}`);
  for (const f of files) {
    if (!fs.existsSync(f)) { console.log(`    SKIP missing ${f}`); continue; }
    let text = fs.readFileSync(f, 'utf8');
    text = apply(text, pairs, path.basename(f), true);
    fs.writeFileSync(f, text, 'utf8');
  }
}

// ---------------------------------------------------------------------------
// 3. chrome mapping on every page html + payloads (AFTER per-page so page
//    content strings win over shared rail/values label collisions)
// ---------------------------------------------------------------------------
console.log('== 3. chrome mapping ==');
const chromePairs = MAPPINGS.chrome;
let htmlFiles = [];
for (const p of pages) {
  const f = p ? path.join(MERGED, p, 'index.html') : path.join(MERGED, 'index.html');
  htmlFiles.push(f);
}
// all payload json files
for (const dir of [''].concat(pages)) {
  const base = dir ? path.join(MERGED, dir) : MERGED;
  for (const e of fs.readdirSync(base)) if (/^_payload.*\.json$/.test(e)) htmlFiles.push(path.join(base, e));
}
// extra standalone files that should be chromed too
for (const rel of ['scene-viewer.html', 'images/favicon/site.webmanifest']) {
  const fp = path.join(MERGED, rel);
  if (fs.existsSync(fp)) htmlFiles.push(fp);
}
for (const f of htmlFiles) {
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace(/<!-- Mirrored from .*? by HTTrack .*? -->/g, '');
  // strip hubtown's external analytics (Google Tag Manager) for full offline
  text = text.replace(/<script src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]*"[^>]*><\/script>/g, '');
  let [t2, logos] = swapLogo(text);
  text = t2;
  text = apply(text, chromePairs, path.relative(MERGED, f).replace(/\\/g, '/'), false);
  if (logos) console.log(`  ${path.relative(MERGED, f).replace(/\\/g, '/')}: logo x${logos}`);
  fs.writeFileSync(f, text, 'utf8');
}
console.log('  chrome applied to', htmlFiles.length, 'html/payload files');

// Fix stale /careers canonical URLs (route renamed to /team) on the EN pages
// after chrome. Locale copies pick this up when build-locales.js regenerates.
const { fixCanonical } = require('./fix-canonical.js');
const fixCanon = fixCanonical(MERGED, true);
if (fixCanon.fixed) console.log('  fix-canonical: rewrote', fixCanon.fixed, 'URLs to /team');

// Absolute page links: SSR nav/footer use relative `X/index.html` (root) or `../X/index.html`
// (depth-1 relative). On a deep client-side route like /projects/<slug> those resolve to the
// WRONG place (e.g. /projects/about/index.html -> 404). Rewrite all page links to root-absolute
// so they work from any depth. Applies to EN pages (locales are handled in build-locales.js).
const PAGE_LINK_RE = /href="(?:\.\.\/)*(about|team|projects|contact|news|privacy-policy|terms-and-conditions)\/index\.html"/g;
const HOME_LINK_RE = /href="(?:\.\.\/)*index\.html"/g;
let absLinks = 0;
for (const p of pages) {
  const f = p ? path.join(MERGED, p, 'index.html') : path.join(MERGED, 'index.html');
  if (!fs.existsSync(f)) continue;
  let text = fs.readFileSync(f, 'utf8');
  const n1 = (text.match(PAGE_LINK_RE) || []).length;
  const n2 = (text.match(HOME_LINK_RE) || []).length;
  text = text.replace(PAGE_LINK_RE, (m, page) => `href="/${page}"`);
  text = text.replace(HOME_LINK_RE, 'href="/"');
  if (n1 + n2) { fs.writeFileSync(f, text, 'utf8'); absLinks += n1 + n2; }
}
if (absLinks) console.log('  rewrote', absLinks, 'page links to absolute');

// Payload preload hrefs AND __NUXT_DATA__ data-src: Nuxt emits these as relative
// `_payloadc9a0.json?HASH`. On a no-trailing-slash URL they resolve against the WRONG base
// (root), so hydration fetches the root payload and the page fails to render. Rewrite both to
// absolute per-page URLs so they resolve correctly from any depth and URL shape. Root page
// keeps /_payloadc9a0.json.
const PAYLOAD_HREF_RE = /((?:href|data-src)=")(?:\.\.\/)*(_payloadc9a0\.json\?[^"]+")/g;
let absPayload = 0;
for (const p of ['', ...pages]) {
  const f = p ? path.join(MERGED, p, 'index.html') : path.join(MERGED, 'index.html');
  if (!fs.existsSync(f)) continue;
  let text = fs.readFileSync(f, 'utf8');
  const n = (text.match(PAYLOAD_HREF_RE) || []).length;
  if (n) {
    text = text.replace(PAYLOAD_HREF_RE, (m, q, rest) => `${q}/${p ? p + '/' : ''}${rest}`);
    fs.writeFileSync(f, text, 'utf8');
    absPayload += n;
  }
}
if (absPayload) console.log('  rewrote', absPayload, 'payload hrefs/data-src to absolute');

// rebrand the SSR district stats on home + projects (after chrome + absolute links)
const { rebrandHome } = require('./rebrand-home.js');
rebrandHome(MERGED, true);

// inject per-project detail into projects payload so the PDP modal works offline
const { injectProjectDetails } = require('./inject-project-detail.js');
injectProjectDetails(MERGED, true);

// rebrand projects payload to Rhine's real 7-project portfolio
const { rebrandProjects } = require('./rebrand-projects.js');
const rebrand = rebrandProjects(MERGED, true);
if (rebrand) console.log('  rebrand-projects:', JSON.stringify(rebrand));

// drop hubtown press articles from the news payload
const { rebrandNews } = require('./rebrand-news.js');
rebrandNews(MERGED, true);

// payload alias: Nuxt's client-side SPA navigation fetches `<route>/_payload.json`,
// but the prerendered payload files are named `_payloadc9a0.json`. Emit a `_payload.json`
// copy next to each hashed payload so SPA nav works on ANY static host (no server rewrite).
let payloadAliases = 0;
for (const dir of [''].concat(pages)) {
  const base = dir ? path.join(MERGED, dir) : MERGED;
  for (const e of fs.readdirSync(base)) {
    if (/^_payloadc9a0\.json$/.test(e)) {
      fs.copyFileSync(path.join(base, e), path.join(base, '_payload.json'));
      payloadAliases++;
    }
  }
}
if (payloadAliases) console.log('  emitted', payloadAliases, '_payload.json aliases');

// bundle: chrome + logo
const bundlePath = path.join(MERGED, '_nuxt', 'u1ipQrxM.js');
let bundle = fs.readFileSync(bundlePath, 'utf8');
let [b2, logos] = swapBundleLogo(bundle);
bundle = b2;
if (logos) console.log('  bundle: logo component x' + logos);
bundle = apply(bundle, chromePairs, 'bundle', false);
fs.writeFileSync(bundlePath, bundle, 'utf8');

// route chunks: apply chrome too (socials, emails, brand domains live in these files)
let chunkCount = 0;
for (const e of fs.readdirSync(path.join(MERGED, '_nuxt'))) {
  if (!e.endsWith('.js') || e === 'u1ipQrxM.js') continue;
  const fp = path.join(MERGED, '_nuxt', e);
  let text = fs.readFileSync(fp, 'utf8');
  const out = apply(text, chromePairs, '_nuxt/' + e, false);
  if (out !== text) { fs.writeFileSync(fp, out, 'utf8'); chunkCount++; }
}
console.log('  chrome applied to', chunkCount, 'route chunks');

// ---------------------------------------------------------------------------
// faqs page: standalone Bootstrap page — localize externals, strip HTTrack,
// swap hubtown Q&A content for Rhine Q&A (whitespace-tolerant), chrome.
// ---------------------------------------------------------------------------
const faqsPath = path.join(MERGED, 'faqs', 'faqs-hubtown.html');
if (fs.existsSync(faqsPath)) {
  // style for the text-based Rhine logo (replaces hubtown-logo.png)
  const faqsCss = path.join(MERGED, 'faqs', 'faqs.css');
  if (fs.existsSync(faqsCss)) {
    let css = fs.readFileSync(faqsCss, 'utf8');
    if (!css.includes('faq-logo-text')) {
      css += '\n.faq-logo-text{display:inline-block;font-family:\'Montserrat\',sans-serif;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#d5e0ff;font-size:1.25rem;padding:.4rem 0;}\n';
      fs.writeFileSync(faqsCss, css, 'utf8');
      console.log('  faqs.css: added .faq-logo-text');
    }
  }
  let f = fs.readFileSync(faqsPath, 'utf8');
  f = f.replace(/<!-- Mirrored from .*? by HTTrack .*? -->/g, '');
  f = f.replace(/<!-- Added by HTTrack --><meta http-equiv="content-type" content="text\/html;charset=UTF-8" \/><!-- \/Added by HTTrack -->/g, '');
  f = f.replace(/<!-- Added by HTTrack -->.*?<!-- \/Added by HTTrack -->/g, '');
  // localize externals
  f = f.replace('https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css', 'bootstrap.min.css');
  f = f.replace('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap', 'montserrat.css');
  f = f.replace('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&amp;display=swap', 'montserrat.css');
  f = f.replace('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css', 'bootstrap-icons.css');
  f = f.replace('https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/js/bootstrap.bundle.min.js', 'bootstrap.bundle.min.js');
  // head / meta
  f = f.replace('<title>Hubtown FAQs | Answers About Hubtown Projects, Locations & Real Estate Services</title>',
    '<title>Rhine Solution FAQs | Custom web development, portfolios, and digital experiences</title>');
  f = f.replace(/<meta name="description"\s+content="[^"]*">/,
    '<meta name="description" content="Frequently asked questions about Rhine Solution, a two-person studio for custom web development, portfolios, portals, and digital experiences.">');
  f = f.replace(/<meta name="keywords"\s+content="[^"]*">/,
    '<meta name="keywords" content="Rhine Solution FAQs, Custom Web Development, Portfolio Websites, Web Applications, Digital Products">');
  f = f.replace('content="Hubtown"', 'content="Rhine Solution"');
  f = f.split('property="og:title" content="Hubtown FAQs | Answers About Hubtown Projects, Locations & Real Estate Services"').join('property="og:title" content="Rhine Solution FAQs | Custom web development, portfolios, and digital experiences"');
  f = f.split('property="og:image:alt" content="Hubtown Limited FAQ page background"').join('property="og:image:alt" content="Rhine Solution FAQ page background"');
  f = f.split('property="og:site_name" content="Hubtown"').join('property="og:site_name" content="Rhine Solution"');
  f = f.split('twitter:title"         content="Hubtown FAQs | Answers About Hubtown Projects, Locations & Real Estate Services"').join('twitter:title"         content="Rhine Solution FAQs | Custom web development, portfolios, and digital experiences"');
  f = f.split('twitter:title"\n        content="Hubtown FAQs | Answers About Hubtown Projects, Locations & Real Estate Services"').join('twitter:title"\n        content="Rhine Solution FAQs | Custom web development, portfolios, and digital experiences"');
  f = f.split('twitter:image:alt" content="Hubtown Limited FAQ page background"').join('twitter:image:alt" content="Rhine Solution FAQ page background"');
  f = f.split('twitter:url" content="../hubtown-faqs.html"').join('twitter:url" content="faqs-hubtown.html"');
  f = f.split('og:image" content="../faq-background.webp.html"').join('og:image" content="faq-background.webp"');
  f = f.split('twitter:image" content="../faq-background.webp.html"').join('twitter:image" content="faq-background.webp"');
  f = f.split('href="../hubtown-faqs.html"').join('href="faqs-hubtown.html"');
  f = f.split('content="../hubtown-faqs.html"').join('content="faqs-hubtown.html"');
  // JSON-LD
  f = f.split('"name": "Hubtown FAQs | Answers About Hubtown Projects, Locations & Real Estate Services"').join('"name": "Rhine Solution FAQs | Custom web development, portfolios, and digital experiences"');
  f = f.split('"url": "https://hubtown.co.in/hubtown-faqs.html"').join('"url": "https://www.rhinesolution.com/faqs/faqs-hubtown.html"');
  f = f.split('"description": "Find answers to frequently asked questions about Hubtown, residential and commercial projects, locations, amenities, investment opportunities, possession timelines, RERA information, and more."').join('"description": "Frequently asked questions about Rhine Solution, a two-person studio for custom web development, portfolios, portals, and digital experiences."');
  f = f.split('"name": "Hubtown Limited"').join('"name": "Rhine Solution"');
  f = f.split('"@type": "RealEstateDeveloper"').join('"@type": "Organization"');
  f = f.split('"inLanguage": "en-IN"').join('"inLanguage": "en-NL"');
  // body chrome
  f = f.replace('aria-label="Hubtown Limited frequently asked questions"', 'aria-label="Rhine Solution frequently asked questions"');
  f = f.split('<img src="hubtown-logo.png" alt="Hubtown Logo">').join('<span class="faq-logo-text">Rhine Solution</span>');
  f = f.split('<img src="hubtown-logo.png" alt="Rhine Solution Logo">').join('<span class="faq-logo-text">Rhine Solution</span>');
  f = f.split('<h1 class="title-counter" data-value="HUBTOWN">').join('<h1 class="title-counter" data-value="RHINE">');
  // Rhine FAQ content: swap hubtown Q&A -> Rhine Q&A, tolerant of internal whitespace
  const collapseWS = s => s.replace(/\s+/g, ' ').trim();
  const FAQS = require('./faqs-content-mapping.js');
  for (const entry of FAQS) {
    // question: appears in <button> and JSON-LD "name"
    const qFlat = collapseWS(entry.q);
    const qrFlat = entry.qr;
    // JSON-LD name (single-line) exact replace
    f = f.split(entry.q).join(entry.qr);
    // accordion button text may span lines: collapse each occurrence
    f = f.replace(new RegExp(collapseWS(entry.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), qrFlat);
    // answer: appears in <div class="accordion-body"> and JSON-LD "text"
    f = f.split(entry.a).join(entry.ar);
    f = f.replace(new RegExp(collapseWS(entry.a).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), entry.ar);
  }
  // remaining hubtown references -> neutral (logo file stays; title/HUBTOWN done)
  f = f.split('Hubtown Limited').join('Rhine Solution');
  f = f.split('Hubtown').join('Rhine Solution');
  f = f.split('HUBTOWN').join('RHINE');
  f = f.split('hubtown-logo.png').join('hubtown-logo.png'); // keep asset filename
  // hubtown references
  f = apply(f, chromePairs, 'faqs', true);
  fs.writeFileSync(faqsPath, f, 'utf8');
  console.log('  faqs page localized (remaining hubtown refs:', (f.toLowerCase().split('hubtown').length - 1) + ')');
}

console.log('\nBuild complete.');