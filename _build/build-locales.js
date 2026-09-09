// Generate the 6 locale sites (nl/de/fr/es/it/zh) from the English merged root.
//   - copies each EN page (html + payloads) into <locale>/<page>/
//   - translates content via reverse-index of rhinesolution-website content/*.json
//   - localizes the nav labels + rewrites page links to same-locale paths
//   - rewrites shared-asset refs to root-absolute, keeps payload data-src relative
//   - injects a locale switcher (en + 6)
// Strings not covered by the content JSON fall back to English.

const fs = require('fs');
const path = require('path');

const MERGED = path.resolve(__dirname, '..');
// Locales are removed — the site is English-only. Keep this script a no-op so
// the rebuild cycle (verify-nl-map assertion 6) still exits 0.
const LOCALES = [];
const CONTENT_BASE = 'C:/Users/teoal/Projects/projects/rhinesolution-website/content';

const PAGES = ['team', 'about', 'contact', 'news', 'privacy-policy', 'projects', 'terms-and-conditions'];

// ---- content reverse index: en value -> locale value ----
const content = {};
for (const loc of ['en', ...LOCALES]) content[loc] = require(path.join(CONTENT_BASE, loc + '.json'));

function leafPairs(en, loc, map) {
  for (const k of Object.keys(en)) {
    const ev = en[k];
    const lv = loc ? loc[k] : undefined;
    if (typeof ev === 'string') {
      if (typeof lv === 'string') map.set(ev, lv);
    } else if (ev && typeof ev === 'object' && lv && typeof lv === 'object') {
      leafPairs(ev, lv, map);
    }
  }
}

// ---- nav labels per locale (content.nav) ----
const NAV = {
  about: 'about', team: 'team', projects: 'projects', news: 'news', contact: 'contact',
};
const navLabel = (loc, key) => (content[loc].nav && content[loc].nav[key]) || content.en.nav[key];

// ---- locale switcher markup (self-inserting JS; survives Vue hydration) ----
function switcher() {
  return `<script>
(function(){
  var locs=['en','nl','de','fr','es','it','zh'];
  function build(){
    var parts=location.pathname.split('/').filter(Boolean);
    var cur=locs.indexOf(parts[0])>-1?parts[0]:'en';
    var rest=parts.slice(locs.indexOf(parts[0])>-1?1:0);
    if(rest[rest.length-1]==='index.html')rest.pop();
    var base=rest.join('/');
    var el=document.getElementById('rhine-locale-switch');
    if(!el){el=document.createElement('div');el.id='rhine-locale-switch';el.style.cssText='position:fixed;bottom:14px;right:14px;z-index:99999;display:flex;gap:4px;padding:5px 8px;background:rgba(10,15,30,.85);border:1px solid #223366;border-radius:6px;font-family:monospace;font-size:11px;letter-spacing:.08em;color:#d5e0ff';document.body.appendChild(el);}
    el.innerHTML='';
    locs.forEach(function(l){
      var a=document.createElement('a');
      a.href='/'+(l==='en'?'':l+'/')+base+(base?'/':'');
      a.textContent=l.toUpperCase();
      a.style.cssText='padding:2px 6px;border-radius:3px;text-decoration:none;color:#d5e0ff';
      if(l===cur)a.style.background='#2C6BFF';
      el.appendChild(a);
    });
  }
  build();
  setInterval(build,1500);
})();
</script>`;
}

// ---- build mappings per locale ----
function buildLocaleMappings(loc) {
  const enToLoc = new Map();
  leafPairs(content.en, content[loc], enToLoc);
  // exclude short nav words + anything <= 7 chars (handled by localizeNav, avoids over-replacing)
  const navWords = new Set(Object.values(content.en.nav || {}));
  const filtered = new Map();
  for (const [k, v] of enToLoc) {
    if (k === v) continue;
    if (navWords.has(k) || k.length <= 7) continue;
    filtered.set(k, v);
  }
  return filtered;
}

// ---- apply en->locale replacement to a file ----
function localize(text, map) {
  // longest-first for safety
  const pairs = [...map.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [en, lv] of pairs) {
    if (en === lv) continue;
    text = text.split(en).join(lv);
  }
  return text;
}

// ---- nav link localization (href + title + sr-only + visible label) ----
function localizeNav(html, loc) {
  const map = {
    about: navLabel(loc, 'about'), team: navLabel(loc, 'team'),
    projects: navLabel(loc, 'projects'), news: navLabel(loc, 'news'),
    contact: navLabel(loc, 'contact'),
  };
  // match absolute (/about) and relative (about/index.html, ../about/index.html) nav links
  return html.replace(/<a href="(?:\/(about|team|projects|contact|news)|\/?\.\.\/(about|team|projects|contact|news)\/index\.html)" class="font-mono text-off-blue" title="[^"]*"><span class="sr-only">[^<]*<\/span><span class="relative[^"]*" style="[^"]*" aria-hidden="true"><span class="invisible inline-block" aria-hidden="true"><!--\[-->([^<]*)<!--\]--><\/span>/g,
    (m, absPage, relPage) => {
      const page = absPage || relPage;
      const label = map[page];
      return `<a href="/${loc}/${page}" class="font-mono text-off-blue" title="${label}"><span class="sr-only">${label}</span><span class="relative whitespace-nowrap" style="display:inline-block;" aria-hidden="true"><span class="invisible inline-block" aria-hidden="true"><!--[--> ${label} <!--]--></span>`;
    });
}

// ---- rewrite relative refs: page links -> same-locale, assets -> root-absolute ----
const PAGE_RE = /^(index\.html|(?:about|team|contact|news|privacy-policy|projects|terms-and-conditions)\/index\.html)$/;
function rewritePaths(html, loc) {
  return html.replace(/(href|src)=(["'])([^"']+)\2/g, (m, attr, q, val) => {
    if (/^(#|https?:|data:|blob:|mailto:|tel:)/.test(val)) return m;
    // already locale-prefixed (/nl/about) -> leave as-is
    if (new RegExp('^/' + loc + '/').test(val) || (loc && val === '/' + loc)) return m;
    // root-absolute page links (/about) -> same-locale absolute
    const absPage = val.match(/^\/(about|team|projects|contact|news|privacy-policy|terms-and-conditions)$/);
    if (absPage) return `${attr}=${q}/${loc}/${absPage[1]}${q}`;
    // root-absolute payload preload (/projects/_payloadc9a0.json?hash) -> same-locale absolute
    const absPayload = val.match(/^\/(about|team|projects|contact|news|privacy-policy|terms-and-conditions)\/(_payloadc9a0\.json\?[^"]+)$/);
    if (absPayload) return `${attr}=${q}/${loc}/${absPayload[1]}/${absPayload[2]}${q}`;
    // root payload preload (/_payloadc9a0.json?hash) -> locale root
    if (/^\/_payloadc9a0\.json\?/.test(val)) return `${attr}=${q}/${loc}/${val.slice(1)}${q}`;
    // other root-absolute refs (/turnstile-api.js, /_nuxt/...) -> leave as-is
    if (/^\//.test(val)) return m;
    // relative page links (with or without ../ prefix) -> same-locale absolute
    const clean = val.replace(/^(?:\.\.\/)+/, '');
    if (PAGE_RE.test(clean)) return `${attr}=${q}/${loc}/${clean}${q}`;
    // other relative refs (assets, faqs) -> root-absolute (stay in locale)
    return `${attr}=${q}/${val.replace(/^(?:\.\.\/)+/, '')}${q}`;
  });
}

// ---- main ----
for (const loc of LOCALES) {
  const locRoot = path.join(MERGED, loc);
  const map = buildLocaleMappings(loc);
  // pages
  for (const page of PAGES) {
    const srcDir = path.join(MERGED, page);
    const dstDir = path.join(locRoot, page);
    fs.mkdirSync(dstDir, { recursive: true });
    const files = ['index.html', ...fs.readdirSync(srcDir).filter(f => /^_payload.*\.json$/.test(f))];
    for (const f of files) {
      let t = fs.readFileSync(path.join(srcDir, f), 'utf8');
      t = localize(t, map);
      if (f === 'index.html') {
        t = localizeNav(t, loc);
        t = rewritePaths(t, loc);
        t = t.replace('</body>', switcher() + '</body>');
      }
      fs.writeFileSync(path.join(dstDir, f), t, 'utf8');
    }
  }
  // home
  {
    const dstDir = locRoot;
    fs.mkdirSync(dstDir, { recursive: true });
    let t = fs.readFileSync(path.join(MERGED, 'index.html'), 'utf8');
    t = localize(t, map);
    t = localizeNav(t, loc);
    t = rewritePaths(t, loc);
    t = t.replace('</body>', switcher() + '</body>');
    fs.writeFileSync(path.join(dstDir, 'index.html'), t, 'utf8');
    // home payload
    for (const f of fs.readdirSync(MERGED).filter(f => /^_payload.*\.json$/.test(f))) {
      let p = fs.readFileSync(path.join(MERGED, f), 'utf8');
      p = localize(p, map);
      fs.writeFileSync(path.join(dstDir, f), p, 'utf8');
    }
  }
  console.log('generated locale:', loc);
}
// inject the switcher into the EN root pages too
// (locale switcher removed with the languages — English only)
console.log('locales: disabled (English-only site)');
console.log('done');