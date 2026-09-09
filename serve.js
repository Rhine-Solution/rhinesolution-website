// Rhine Solution merged site — offline static server.
// Serves the merged folder with clean URLs (/about -> about/index.html),
// correct MIME for GLB/KTX2/WASM/EXR, and a GA/GTM no-op stub for offline.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.map': 'application/json',
  '.wasm': 'application/wasm', '.glb': 'model/gltf-binary',
  '.ktx2': 'image/ktx2', '.exr': 'image/x-exr', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
  '.otf': 'font/otf', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.txt': 'text/plain; charset=utf-8',
  '.gif': 'image/gif', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

function safePath(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  // /faqs lives at faqs/faqs.html (no index.html) — alias /faqs and /faqs/ to it
  if (p === '/faqs' || p === '/faqs/') p = '/faqs/faqs.html';
  if (p === '/') p = '/index.html';
  if (p.endsWith('/')) p += 'index.html';
  // careers route now lives under /team (renamed); alias /careers and /careers/* to team
  if (p === '/careers' || p === '/careers/index.html') p = '/team/index.html';
  else if (p.startsWith('/careers/')) p = '/team/' + p.slice('/careers/'.length);
  // /projects/<slug> is a client-side SPA route (project detail modal) — serve the map page
  if (p.startsWith('/projects/') && !p.startsWith('/projects/images/')) {
    const tail = p.slice('/projects/'.length);
    if (tail !== 'index.html' && !path.extname(tail)) p = '/projects/index.html';
  }
  // clean route -> file: /about -> about/index.html, /nl/about -> nl/about/index.html
  const clean = p.replace(/^\//, '').replace(/\/$/, '');
  if (!path.extname(clean) && clean.length > 0) {
    const candidate = path.join(ROOT, clean, 'index.html');
    if (fs.existsSync(candidate)) return candidate;
  }
  const full = path.normalize(path.join(ROOT, clean || 'index.html'));
  if (!full.startsWith(ROOT)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  // Nuxt prerendered HTML uses a RELATIVE _payloadc9a0.json preload href, which only
  // resolves correctly when the page URL ends in '/'. Redirect clean routes to their
  // trailing-slash form (as any static host does) so hydration gets the right payload.
  // Slug routes (/projects/<slug>) are NOT redirected: their relative base is already
  // the projects dir, so their payload resolves correctly as-is.
  if (urlPath.length > 1 && !urlPath.endsWith('/') && !path.extname(urlPath) &&
      !urlPath.startsWith('/api/') && !urlPath.startsWith('/projects/')) {
    const candidate = path.join(ROOT, urlPath.slice(1), 'index.html');
    if (fs.existsSync(candidate)) {
      const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      res.writeHead(301, { Location: urlPath + '/' + qs });
      res.end();
      return;
    }
  }

  // offline stub: neutralize Google Analytics/Tag Manager
  if (urlPath === '/gtag-init.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.end('window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};');
    return;
  }

  // offline stub: contact form submit — accept any POST and confirm receipt
  if (urlPath === '/api/contact' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, message: 'Message received.' }));
    });
    return;
  }

  if (urlPath === '/api/contact') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, message: 'Method not allowed' }));
    return;
  }

  // offline stub: chat assistant — stream a canned reply (no Gemini key locally).
  // The Vercel deploy replaces this with api/chat.js (real Gemini proxy).
  if (urlPath === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      let q = 'the assistant';
      try { const b = JSON.parse(body); const ms = b.messages || []; const last = ms[ms.length - 1]; q = last && last.content ? last.content.slice(0, 60) : 'the assistant'; } catch (e) {}
      res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' });
      const parts = [
        `Offline preview: the live assistant runs on Gemini after deploy.`,
        `You asked: "${q}". Set GEMINI_API_KEY on the Vercel project to enable real answers.`,
      ];
      const chunk = parts.join(' ');
      const payload = { candidates: [{ content: { parts: [{ text: chunk }] } }] };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      res.end('data: [DONE]\n\n');
    });
    return;
  }

  if (urlPath === '/api/chat') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, message: 'Method not allowed' }));
    return;
  }

  // offline stub: Cloudflare Turnstile script
  if (urlPath === '/turnstile-api.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.end(fs.readFileSync(path.join(__dirname, 'turnstile-api.js'), 'utf8'));
    return;
  }

  // offline stub: auth session (Nitro endpoint) — return null session
  if (urlPath === '/api/_auth/session') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('null');
    return;
  }

  const file = safePath(urlPath);
  let target = file;
  if (!target || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    // SPA payload fetch uses /_payload.json but prerendered files are _payloadc9a0.json
    if (urlPath.endsWith('/_payload.json') || urlPath === '/_payload.json') {
      const alt = path.join(path.dirname(file || path.join(ROOT, urlPath)), '_payloadc9a0.json');
      if (fs.existsSync(alt)) target = alt;
    }
  }
  if (!target || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found: ' + urlPath);
    return;
  }
  const ext = path.extname(target).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
});

server.listen(PORT, () => {
  console.log('Rhine Solution merged site running at http://localhost:' + PORT + '/');
});