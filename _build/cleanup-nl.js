// cleanup-nl.js â€” NL content surgery that string-pairs can't do cleanly.
// Runs AFTER the chrome step in build-merged.js so it sees chromed files.
//   SSR (all pages): login button -> plan2shift anchor; district-strip labels/counts.
//   projects page:   'mumbai' map-nav label, seo-headings block, map__nav-overlay div.
//   contact page:    phone country default IN -> NL (native select + display + autocomplete).
//   bundles:         BJMCwerj.js (mumbai filter surgery, seo/overlay removal),
//                    u1ipQrxM.js (login handler -> plan2shift, strip dead routes),
//                    JFwdWLci.js (country default NL).
'use strict';

const fs = require('fs');
const path = require('path');

const MERGED = path.resolve(__dirname, '..');

const PAGES = ['', 'about', 'team', 'news', 'projects', 'contact', 'privacy-policy', 'terms-and-conditions'];
const htmlOf = (p) => (p ? path.join(MERGED, p, 'index.html') : path.join(MERGED, 'index.html'));

// ---------------------------------------------------------------------------
// 1. SSR: loader wordmark (original pixel squares -> RHINE SOLUTION text)
//    + login button -> external plan2shift anchor (all pages)
// ---------------------------------------------------------------------------
const LOADER_SVG_RE = /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 352 40"[^>]*>.*?<\/svg>/g;
const LOADER_WORDMARK = '<span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;font-size:1.25rem;line-height:1;color:#d5e0ff;white-space:nowrap;display:inline-block;">RHINE SOLUTION</span>';

const LOGIN_RE = /<button class="m-0 p-0 bg-none border-none focus:outline-none" data-v-acc11dbd><!--\[--><div class="beveled-box" data-v-acc11dbd data-v-9317ace3>[\s\S]*?<!--\]--><\/button>/g;
const LOGIN_ANCHOR = '<a href="https://plan2shift.com/login" target="_blank" rel="noopener noreferrer" class="m-0 p-0 bg-none border-none focus:outline-none" data-v-acc11dbd>';
function swapLogin(h) {
  let n = 0;
  h = h.replace(LOGIN_RE, (m) => {
    n++;
    return m.replace('<button class="m-0 p-0 bg-none border-none focus:outline-none" data-v-acc11dbd>', LOGIN_ANCHOR).replace('</button>', '</a>');
  });
  return { h, n };
}

// ---------------------------------------------------------------------------
// 2. SSR: district strip labels + per-district counts (all pages)
// ---------------------------------------------------------------------------
const DISTRICT = {
  west: { count: '02 PROJECTS', label: 'West' },
  south: { count: '02 PROJECTS', label: 'South' },
  central: { count: '01 PROJECTS', label: 'Central' },
  north: { count: '01 PROJECTS', label: 'North' },
};

function fixDistrictStrip(html) {
  let out = html;
  for (const key of Object.keys(DISTRICT)) {
    const id = `id="district-item-${key}"`;
    const p = out.indexOf(id);
    if (p === -1) continue;
    const win = out.slice(p, p + 4000);
    const cm = win.match(/(<!--\[-->)\d+ PROJECTS(<!--\]-->)/);
    if (cm && cm.index !== undefined) {
      const abs = p + cm.index;
      out = out.slice(0, abs) + cm[1] + DISTRICT[key].count + cm[2] + out.slice(abs + cm[0].length);
    }
    const labelRe = /<!--\[-->([^<]*?)<!--\]-->/g;
    let found = 0, labAbs = -1, labFull = '';
    let m;
    const win2 = out.slice(p, p + 4000);
    while ((m = labelRe.exec(win2)) !== null) {
      found++;
      if (found === 2) { labAbs = p + m.index; labFull = m[0]; break; }
    }
    if (labAbs !== -1) {
      out = out.slice(0, labAbs) + `<!--[-->${DISTRICT[key].label}<!--]-->` + out.slice(labAbs + labFull.length);
    }
  }
  return out;
}

let loginOpenFixed = 0;
for (const page of PAGES) {
  const f = htmlOf(page);
  if (!fs.existsSync(f)) continue;
  let h = fs.readFileSync(f, 'utf8');
  let changed = false;

  // loader wordmark
  const nSvg = (h.match(LOADER_SVG_RE) || []).length;
  if (nSvg) { h = h.replace(LOADER_SVG_RE, LOADER_WORDMARK); changed = true; }

  // "Let's build something" backslash: the mapping keeps `Let\'s` (JS-escaped)
  // so the home chunk parses; the SSR HTML must show a plain apostrophe.
  if (page === '') {
    const nb = h.split('Let\\\'s').length - 1;
    if (nb) { h = h.split('Let\\\'s').join('Let\'s'); changed = true; }
  }

  // login anchor
  const lr = swapLogin(h);
  if (lr.n) { h = lr.h; changed = true; loginOpenFixed += lr.n; }

  // district strip
  const stripped = fixDistrictStrip(h);
  if (stripped !== h) { h = stripped; changed = true; }

  // projects page: mumbai map-nav label, seo-headings (div + css), map__nav-overlay
  if (page === 'projects') {
    const n1 = h.split('<!--[-->mumbai<!--]-->').length - 1;
    if (n1) { h = h.split('<!--[-->mumbai<!--]-->').join('<!--[-->Netherlands<!--]-->'); changed = true; }
    const n2 = h.split('<div class="map__nav-overlay sm:hidden absolute w-full h-[36%] z-[-1] pointer-events-none bg-error bottom-0 left-0"></div>').length - 1;
    if (n2) { h = h.split('<div class="map__nav-overlay sm:hidden absolute w-full h-[36%] z-[-1] pointer-events-none bg-error bottom-0 left-0"></div>').join(''); changed = true; }
    const n3 = h.split('.map__nav-overlay{').length - 1;
    if (n3) { h = h.replace(/\.map__nav-overlay\{[^}]*\}/g, ''); changed = true; }
    const n4 = h.split('.seo-headings{').length - 1;
    if (n4) { h = h.replace(/\.seo-headings\{[^}]*\}/g, ''); changed = true; }
    const n5 = h.split('<div class="seo-headings">').length - 1;
    if (n5) { h = h.replace(/<div class="seo-headings"><!--\[--><h1>Selected work<\/h1><p>.*?<\/p><!--\]--><\/div>/g, ''); changed = true; }
  }

  if (changed) fs.writeFileSync(f, h, 'utf8');
}

// ---------------------------------------------------------------------------
// 3. contact page: phone country default India -> Netherlands
// ---------------------------------------------------------------------------
{
  const f = htmlOf('contact');
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    let ch = false;
    const a = '<option value="IN" selected>India (+91)</option>';
    if (c.includes(a)) { c = c.split(a).join('<option value="NL" selected>Netherlands (+31)</option>'); ch = true; }
    const b = '<span class="text-16 leading-1.4 -tracking-2 font-light w-full">India (+91)</span>';
    if (c.includes(b)) { c = c.split(b).join('<span class="text-16 leading-1.4 -tracking-2 font-light w-full">Netherlands (+31)</span>'); ch = true; }
    const d = '<!--[-->India (+91) <!--]-->';
    if (c.includes(d)) { c = c.split(d).join('<!--[-->Netherlands (+31) <!--]-->'); ch = true; }
    if (ch) fs.writeFileSync(f, c, 'utf8');
  }
}

// ---------------------------------------------------------------------------
// 4. bundle BJMCwerj.js â€” mumbai filter surgery + seo/overlay render removal
// ---------------------------------------------------------------------------
{
  const p = path.join(MERGED, '_nuxt', 'BJMCwerj.js');
  let bj = fs.readFileSync(p, 'utf8');
  const before = bj;
  bj = bj.split('i.filters.includes("mumbai")&&(v=[...v,...i.projects.filter(F=>j.projectDataArray.findIndex(te=>te.name===F.slug)!==-1||F.city.toLowerCase().includes("mumbai"))])')
    .join('i.filters.includes("netherlands")&&(v=[...v,...i.projects])');
  bj = bj.split('!F.city.toLowerCase().includes("mumbai")').join('!F.city.toLowerCase().includes("netherlands")');
  bj = bj.split('=["mumbai"]').join('=["netherlands"]');
  bj = bj.split('ie("mumbai")').join('ie("netherlands")');
  bj = bj.split('a(i).filters.includes("mumbai")').join('a(i).filters.includes("netherlands")');
  bj = bj.split('B=t(["mumbai"])').join('B=t(["netherlands"])');
  bj = bj.split('e("span",{class:"px-14"},"Mumbai",-1)').join('e("span",{class:"px-14"},"Netherlands",-1)');
  bj = bj.split('.Mumbai`').join('`');
  bj = bj.split('p(fe,{key:1},[S[0]||(S[0]=e("h1",null,"Selected work",-1)),e("p",null,k(Ne))],64)').join('U("",!0)');
  bj = bj.split('S[1]||(S[1]=e("div",{class:"map__nav-overlay sm:hidden absolute w-full h-[36%] z-[-1] pointer-events-none bg-error bottom-0 left-0"},null,-1))').join('U("",!0)');
  if (bj !== before) fs.writeFileSync(p, bj, 'utf8');
}

// ---------------------------------------------------------------------------
// 5. bundle u1ipQrxM.js â€” login handler -> plan2shift, strip dead routes
// ---------------------------------------------------------------------------
{
  const p = path.join(MERGED, '_nuxt', 'u1ipQrxM.js');
  let u = fs.readFileSync(p, 'utf8');
  const before = u;
  // loader wordmark (original squares -> RHINE SOLUTION text)
  const nSvg = (u.match(LOADER_SVG_RE) || []).length;
  if (nSvg) u = u.replace(LOADER_SVG_RE, LOADER_WORDMARK);
  u = u.split('"on-login-click":K(s)').join('"on-login-click":()=>window.open("https://plan2shift.com/login","_blank","noopener")');
  u = u.replace(/\{name:"(?:investor-relations|regulation-policy|approvals|registration)",path:"[^"]*",component:\(\)=>Yr\(\(\)=>import\("\.\/[A-Za-z0-9_\-]+\.js"\),__vite__mapDeps\(\[[0-9,]+\]\),import\.meta\.url\)\},?/g, '');
  // dead CSS chunk name for the removed regulation-policy route (vite deps map) â€”
  // empty the string, keep the array length so index references stay valid
  u = u.split('"./regulation-policy.Bv0JUJH1.css"').join('""');
  if (u !== before) fs.writeFileSync(p, u, 'utf8');
}

// ---------------------------------------------------------------------------
// 6. bundle JFwdWLci.js â€” phone country default NL
// ---------------------------------------------------------------------------
{
  const p = path.join(MERGED, '_nuxt', 'JFwdWLci.js');
  let jf = fs.readFileSync(p, 'utf8');
  const before = jf;
  jf = jf.split('r.code==="IN"').join('r.code==="NL"');
  if (jf !== before) fs.writeFileSync(p, jf, 'utf8');
}

console.log('cleanup-nl: login buttons fixed:', loginOpenFixed);
console.log('cleanup-nl: done');