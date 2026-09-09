// verify-cleanup.js
// Regression gate for the hubtown-leftover cleanup and production polish:
//   - chat widget panel can actually close ([hidden] beats display:flex)
//   - no dead route chunks / CSS linger in _nuxt
//   - no leftover hubtown dirs, files, or copy (three-lib, @theatre, builds,
//     data, faqs/hubtown-logo.png, dead chunk files)
//   - news placeholder images live in the provider folder as bare refs
//   - robots.txt / sitemap.xml / 404.html present
//   - project payload _ids are deterministic (slug-derived UUID v5)
//   - build-locales.js is self-contained (no source-repo require)
//
// Exit 0 when every assertion PASSes; non-zero when any FAILs.
//
// Usage: node _build/verify-cleanup.js  (run from the merged site root, or pass
// the merged root as argv[2]).

const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || process.cwd();
const { revive } = require(path.join(__dirname, 'inject-project-detail.js'));
const { uuidFromSlug, LIST_KEY } = require(path.join(__dirname, 'rebrand-projects.js'));

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

// ---- assertion 1: chat widget has the [hidden] close fix, on source AND a page ----
(function () {
  let pass = false, detail = '';
  try {
    const src = fs.readFileSync(path.join(__dirname, 'chat-widget.js'), 'utf8');
    if (!src.includes('.rh-chat-panel[hidden]{display:none}')) {
      detail = 'chat-widget.js missing .rh-chat-panel[hidden]{display:none}';
    } else {
      const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
      if (!home.includes('.rh-chat-panel[hidden]{display:none}')) {
        detail = 'built index.html missing the [hidden] CSS';
      } else {
        pass = true;
      }
    }
  } catch (e) { detail = e.message; }
  report('chat widget closes (panel [hidden] CSS present in build)', pass, detail);
})();

// ---- assertion 2: no dead route chunks/CSS in _nuxt ----
(function () {
  let pass = true, detail = '';
  const dead = ['CpaEcUvd.js', 'BFZNzW8j.js', 'BDj03KXH.js', 'DEcvTONw.js', 'regulation-policy.Bv0JUJH1.css'];
  for (const f of dead) {
    if (fs.existsSync(path.join(ROOT, '_nuxt', f))) {
      pass = false; detail += `dead file present: ${f}; `;
    }
  }
  if (detail) detail = detail.trim();
  report('no dead route chunks/CSS in _nuxt', pass, detail);
})();

// ---- assertion 3: no leftover hubtown dirs/files ----
(function () {
  let pass = true, detail = '';
  for (const rel of ['three-lib', '@theatre', 'builds', 'data', 'faqs/hubtown-logo.png']) {
    if (fs.existsSync(path.join(ROOT, rel))) {
      pass = false; detail += `leftover present: ${rel}; `;
    }
  }
  if (detail) detail = detail.trim();
  report('no leftover hubtown dirs/files', pass, detail);
})();

// ---- assertion 4: news placeholders live in the provider folder as bare refs ----
(function () {
  let pass = false, detail = '';
  try {
    const dir = path.join(ROOT, 'news-images', '7m7t0x6z', 'production');
    const files = fs.readdirSync(dir).filter(f => /^rhine-.+\.svg$/.test(f));
    const leftovers = fs.readdirSync(dir).filter(f => !/^rhine-.+\.svg$/.test(f));
    if (files.length !== 3) {
      detail = `expected 3 rhine-*.svg placeholders, got ${files.length}`;
    } else if (leftovers.length) {
      detail = `old hash files remain: ${leftovers.join(', ')}`;
    } else {
      const payload = fs.readFileSync(path.join(ROOT, 'news', '_payloadc9a0.json'), 'utf8');
      if (payload.includes('/images/news/') || payload.includes('image-image-rhine')) {
        detail = 'news payload has stale/duplicated image refs (image-image-rhine or /images/news)';
      } else if (!payload.includes('image-rhine-music-trends-local-svg') || !payload.includes('image-rhine-bilingual-site-structure-svg') || !payload.includes('image-rhine-dependency-cleanup-svg')) {
        detail = 'news payload missing one or more image-rhine-* refs';
      } else {
        pass = true;
      }
    }
  } catch (e) { detail = e.message; }
  report('news placeholders as bare refs in provider folder', pass, detail);
})();

// ---- assertion 5: robots.txt, sitemap.xml, 404.html present ----
(function () {
  let pass = true, detail = '';
  for (const rel of ['robots.txt', 'sitemap.xml', '404.html']) {
    if (!fs.existsSync(path.join(ROOT, rel))) {
      pass = false; detail += `missing ${rel}; `;
    }
  }
  if (detail) detail = detail.trim();
  report('seo/404 files present (robots/sitemap/404)', pass, detail);
})();

// ---- assertion 6: project payload _ids are deterministic (slug-derived UUID v5) ----
(function () {
  let pass = false, detail = '';
  try {
    const pp = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', '_payloadc9a0.json'), 'utf8'));
    const revived = revive(pp, { ShallowReactive: v => ({ ...v }) });
    const list = revived.data && revived.data[LIST_KEY] && revived.data[LIST_KEY].data;
    if (!Array.isArray(list) || list.length === 0) {
      detail = 'projects list not found in payload';
    } else {
      const bad = list
        .filter(x => x && x.slug)
        .filter(x => !x._id || x._id !== uuidFromSlug(x.slug))
        .map(x => `${x.slug}:${x._id}`);
      if (bad.length) {
        detail = `non-deterministic _id: ${bad.join(', ')}`;
      } else {
        pass = true;
      }
    }
  } catch (e) { detail = e.message; }
  report('project _ids deterministic (slug UUID v5)', pass, detail);
})();

// ---- assertion 7: build-locales.js is self-contained ----
(function () {
  let pass = false, detail = '';
  try {
    const src = fs.readFileSync(path.join(__dirname, 'build-locales.js'), 'utf8');
    const contentBase = src.includes('CONTENT_BASE');
    const guarded = src.includes('if (LOCALES.length)');
    if (contentBase && !guarded) {
      detail = 'CONTENT_BASE require not guarded by LOCALES.length';
    } else if (!guarded) {
      detail = 'build-locales.js has no LOCALES.length guard';
    } else {
      pass = true;
    }
  } catch (e) { detail = e.message; }
  report('build-locales.js self-contained (no source-repo load)', pass, detail);
})();

// ---- assertion 8: no Hubtown/HUBTOWN text in any built index.html ----
(function () {
  let pass = true, detail = '';
  const hits = [];
  for (const f of allIndexHtml(ROOT)) {
    const s = fs.readFileSync(f, 'utf8');
    if (s.includes('Hubtown') || s.includes('HUBTOWN') || s.includes('hubtown')) {
      hits.push(path.relative(ROOT, f));
    }
  }
  if (hits.length) { pass = false; detail = hits.join(', '); }
  report('no hubtown text in built pages', pass, detail);
})();

// ---- summary ----
console.log('');
if (failures === 0) {
  console.log('SUMMARY: ALL 8 ASSERTIONS PASS');
  process.exit(0);
} else {
  console.log(`SUMMARY: ${failures} ASSERTION(S) FAILED`);
  process.exit(1);
}