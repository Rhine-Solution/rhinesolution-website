// news-placeholders.js — replace the Sanity-hashed news images with branded
// placeholder SVGs that fit each article. Rewrites the news SSR <img> srcset/src
// and the news payload imageUrl refs. Runs inside build-merged.js (after chrome).
'use strict';

const fs = require('fs');
const path = require('path');

const MERGED = path.resolve(__dirname, '..');

// alt (in the news SSR <img>) / payload imageUrl hash -> placeholder slug
const ARTICLES = {
  'Music Trends Local is live': 'music-trends-local',
  'Bilingual site structure': 'bilingual-site-structure',
  'Dependency cleanup': 'dependency-cleanup',
};

// payload imageUrl hash strings -> placeholder slug (both SSR variant + payload ref)
const HASH_TO_SLUG = {
  '99acb5d54a36dbf59e6190e676db4edc859043ed-5000x3333-jpg': 'dependency-cleanup',
  'eb866bbc4c43560187905950ec9c96b3922c6473-3000x4000-jpg': 'dependency-cleanup',
  '4212029da3d487c0111c1760959f5cd9b4bf6ab2-1104x858-png': 'bilingual-site-structure',
  '9787b9f294b61d6699dcf3ce0262c8cce1d51fd0-6000x4000-jpg': 'bilingual-site-structure',
  '0a2c23f904545b5e192513881f36f45b75f19062-1132x656-jpg': 'music-trends-local',
  '7f12184b74543cc3ff9dfa6ac930ec8154c6376a-985x754-png': 'music-trends-local',
};

// generate branded placeholders (dark-blue panel, corner accents, title)
const newsDir = path.join(MERGED, 'images', 'news');
fs.mkdirSync(newsDir, { recursive: true });
for (const [title, slug] of Object.entries(ARTICLES)) {
  const w = 1200, h = 800;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#020a19"/>
  <rect x="0" y="0" width="10" height="10" fill="#2C6BFF"/>
  <rect x="${w - 10}" y="0" width="10" height="10" fill="#2C6BFF"/>
  <rect x="0" y="${h - 10}" width="10" height="10" fill="#2C6BFF"/>
  <rect x="${w - 10}" y="${h - 10}" width="10" height="10" fill="#2C6BFF"/>
  <text x="${w / 2}" y="${h / 2 - 24}" text-anchor="middle" fill="#d5e0ff" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="52" letter-spacing="10" font-weight="700">RHINE SOLUTION</text>
  <text x="${w / 2}" y="${h / 2 + 46}" text-anchor="middle" fill="#7ea7ff" font-family="ui-monospace,SFMono-Regular,Menlo,monospace" font-size="30" letter-spacing="4">${title.toUpperCase()}</text>
</svg>
`;
  fs.writeFileSync(path.join(newsDir, slug + '.svg'), svg, 'utf8');
}

// rewrite news SSR <img> srcset/src by alt
const newsHtml = path.join(MERGED, 'news', 'index.html');
if (fs.existsSync(newsHtml)) {
  let html = fs.readFileSync(newsHtml, 'utf8');
  let replaced = 0;
  html = html.replace(/<img([^>]*)alt="([^"]*)"([^>]*)>/g, (m, pre, alt, post) => {
    const slug = ARTICLES[alt.trim()];
    if (!slug) return m;
    const src = `/images/news/${slug}.svg`;
    let out = m.replace(/srcset="[^"]*"/, `srcset="${src} 1x, ${src} 2x"`);
    out = out.replace(/src="[^"]*"/, `src="${src}"`);
    if (out === m) return m;
    replaced++;
    return out;
  });
  if (replaced) fs.writeFileSync(newsHtml, html, 'utf8');
  console.log('news-placeholders: rewrote', replaced, 'news <img> tags');
}

// rewrite news payload imageUrl refs
for (const f of fs.readdirSync(path.join(MERGED, 'news'))) {
  if (!/^_payload.*\.json$/.test(f)) continue;
  const fp = path.join(MERGED, 'news', f);
  let t = fs.readFileSync(fp, 'utf8');
  let ch = false;
  for (const [hash, slug] of Object.entries(HASH_TO_SLUG)) {
    if (t.includes(hash)) { t = t.split(hash).join(`/images/news/${slug}.svg`); ch = true; }
  }
  if (ch) fs.writeFileSync(fp, t, 'utf8');
}
console.log('news-placeholders: done');