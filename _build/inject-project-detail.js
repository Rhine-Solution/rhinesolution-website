// Inject per-project detail into the projects page payload so the PDP modal
// (project detail popup) works fully offline.
//
// The client's usePdpModal runs a live Sanity GROQ query (cMe) keyed by slug and
// reads the result from the Nuxt payload cache under `sanity-<hash>`. That per-project
// query was never prerendered, so offline it 404s and the modal never opens.
//
// This module computes the exact payload cache key for each project slug and injects
// a synthesized detail object (built from the already-present list data + Rhine
// branding) into `projects/_payloadc9a0.json`, so `eQ(cMe,{slug})` resolves from cache.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- client hash scheme (mirrors the bundle) ---
// key = "sanity-" + base64url(SHA256("'" + query + JSON.stringify(params) + "'"))
function sanityKey(query, params) {
  const input = "'" + query + (params ? JSON.stringify(params) : '') + "'";
  return crypto.createHash('sha256').update(input).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Extract an `rs\`...\`` template literal value exactly as the bundle evaluates it.
function extractTemplateVar(src, varName) {
  const start = src.indexOf(varName + '=rs`');
  if (start === -1) return null;
  let i = start + varName.length + 4;
  let depth = 0, out = '';
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\\') { out += src[i] + (src[i + 1] || ''); i++; continue; }
    if (ch === '$' && src[i + 1] === '{') { depth++; out += ch + '{'; i++; continue; }
    if (ch === '}' && depth > 0) { depth--; out += ch; continue; }
    if (ch === '`' && depth === 0) break;
    out += ch;
  }
  return out;
}

// --- minimal Nuxt payload reviver (for reading the list out of the payload) ---
const dte = Symbol('dte');
function revive(payload, revivers) {
  const t = payload, i = Array(t.length);
  function r(s, o) {
    if (o) throw new Error('bad index');
    if (s in i) return i[s];
    const a = t[s];
    if (!a || typeof a !== 'object') i[s] = a;
    else if (Array.isArray(a)) {
      if (typeof a[0] === 'string') {
        const l = a[0], c = revivers?.[l];
        if (c) return i[s] = c(r(a[1]));
        if (l === 'Date') i[s] = new Date(a[1]);
        else if (l === 'Set') { const u = new Set; i[s] = u; for (let d = 1; d < a.length; d += 1) u.add(r(a[d])); }
        else if (l === 'Map') { const f = new Map; i[s] = f; for (let d = 1; d < a.length; d += 2) f.set(r(a[d]), r(a[d + 1])); }
        else if (l === 'RegExp') i[s] = new RegExp(a[1], a[2]);
        else if (l === 'Object') i[s] = Object(a[1]);
        else if (l === 'BigInt') i[s] = BigInt(a[1]);
        else if (l === 'null') { const h = Object.create(null); i[s] = h; for (let d = 1; d < a.length; d += 2) h[a[d]] = r(a[d + 1]); }
        else throw new Error('unknown type ' + l);
      } else {
        const l = new Array(a.length); i[s] = l;
        for (let c = 0; c < a.length; c++) { const u = a[c]; u !== dte && (l[c] = r(u)); }
      }
    } else {
      const l = {}; i[s] = l;
      for (const c in a) l[c] = r(a[c]);
    }
    return i[s];
  }
  return r(0);
}

const LIST_KEY = 'sanity-onNvxnDB8paO7TROOqQDtTStnLDv6SmIJhMGSA_DVDM';

// Per-project rich content (from the source content/en.json project_* blocks),
// keyed by the payload slug. Provides a real summary, tech stack and live link
// so the PDP modal / case cards are no longer generic filler.
const PROJECT_DETAILS = {
  plan2shift: {
    summary: 'A shift planning platform for workers and HR teams. Plan shifts, track your monthly earnings in real time, and send sick-leave or shift-change requests without the back-and-forth.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
    liveUrl: 'https://plan2shift.com/',
  },
  brain: {
    summary: 'Our living engineering knowledge base — architecture, security, deployment, and testing notes, published openly. Browse the thinking behind how we build.',
    stack: ['Obsidian', 'Markdown', 'Git'],
    liveUrl: '/projects/brain',
  },
  'music-trends-local': {
    summary: 'A cyber-themed music portal showcasing top songs, artists, and genres — 48 tracks across 8 electronic sub-genres with search, filters, and localStorage favorites.',
    stack: ['HTML5', 'CSS', 'Bootstrap', 'JavaScript', 'SVG', 'Next.js 15'],
    liveUrl: '/music',
  },
  'mac-mini-ai': {
    summary: "The Mac Mini that runs Rhine Solution's AI stack: Free Claude Code (Discord bot), 5 model fallbacks (NVIDIA NIM, Groq, Gemini, Mistral, OpenRouter), and the OpenCode agent that assists with daily work.",
    stack: ['macOS 26', 'Free Claude Code', 'OpenCode', '5 LLM providers', 'Tailscale'],
  },
  rhinesolution: {
    summary: 'This website. Next.js 15, TypeScript, pure CSS, deployed to Vercel with Cloudflare DNS.',
    stack: ['Next.js 15', 'TypeScript', 'Pure CSS', 'Vercel', 'Cloudflare'],
    liveUrl: '/',
  },
};

// Build the synthesized per-project detail object from list fields.
function synthesizeDetail(listProject) {
  const statusLabel = listProject.status || (listProject.soldOut ? 'shipped' : '');
  const detail = PROJECT_DETAILS[listProject.slug];
  const summary = detail
    ? detail.summary
    : (listProject.title || 'A Rhine Solution project') +
      ' — a custom web experience built by Rhine Solution. Small team, high standard, shipped work.';
  return {
    _id: listProject._id,
    _updatedAt: '2026-01-01T00:00:00Z',
    title: listProject.title,
    slug: listProject.slug,
    metaTitle: (listProject.title || 'Rhine Solution project') + ' | Rhine Solution',
    metaDescription: summary,
    // Sanity Portable Text body rendering for the PDP modal
    content: [{
      _type: 'block',
      style: 'normal',
      _key: 'rh-intro',
      children: [{ _type: 'span', text: summary, _key: 'rh-span0' }],
      markDefs: [],
    }],
    stack: [], // NOTE: array-of-strings breaks the Nuxt reviver; client query omits it anyway
    liveUrl: detail ? detail.liveUrl || null : null,
    type: listProject.type,
    status: statusLabel,
    location: listProject.location,
    city: listProject.city,
    soldOut: listProject.soldOut,
    year: listProject.year == null ? null : String(listProject.year),
    coordinates: listProject.coordinates,
  };
}

// Main entry: inject into projects/_payloadc9a0.json
function injectProjectDetails(mergedRoot, log) {
  const payloadPath = path.join(mergedRoot, 'projects', '_payloadc9a0.json');
  const bundlePath = path.join(mergedRoot, '_nuxt', 'u1ipQrxM.js');
  if (!fs.existsSync(payloadPath) || !fs.existsSync(bundlePath)) {
    if (log) console.log('  project-detail inject: SKIP (missing payload/bundle)');
    return 0;
  }
  const bundle = fs.readFileSync(bundlePath, 'utf8');
  const cMe = extractTemplateVar(bundle, 'cMe');
  if (!cMe) { if (log) console.log('  project-detail inject: SKIP (cMe query not found)'); return 0; }

  const pp = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  const revived = revive(pp, { ShallowReactive: v => ({ ...v }) });
  const listWrapper = revived.data && revived.data[LIST_KEY];
  if (!listWrapper || !Array.isArray(listWrapper.data)) {
    if (log) console.log('  project-detail inject: SKIP (list not in payload)');
    return 0;
  }

  const dataMap = pp[2]; // the real data map object (["ShallowReactive",2] wraps index 2)
  let added = 0, updated = 0;
  for (const proj of listWrapper.data) {
    if (!proj || !proj.slug) continue;
    const key = 'sanity-' + sanityKey(cMe, { slug: proj.slug });
    const detail = synthesizeDetail(proj);
    // append primitives -> refs, (then object, then wrapper for new entries)
    const refs = {};
    for (const [k, v] of Object.entries(detail)) {
      const idx = pp.length;
      pp.push(v);
      refs[k] = idx;
    }
    if (key in dataMap) {
      // update the existing entry's refs in place so re-runs pick up new content
      const wrapperIdx = dataMap[key];
      const wrapper = pp[wrapperIdx];
      const objIdx = wrapper && wrapper.data;
      const obj = pp[objIdx];
      if (obj) { for (const k of Object.keys(refs)) obj[k] = refs[k]; updated++; continue; }
    }
    const objIdx = pp.length;
    pp.push(refs);
    const wrapperIdx = pp.length;
    pp.push({ data: objIdx, sourceMap: null });
    dataMap[key] = wrapperIdx;
    added++;
  }
  if (added || updated) {
    fs.writeFileSync(payloadPath, JSON.stringify(pp), 'utf8');
    if (log) console.log('  project-detail inject: added', added, 'and updated', updated, 'entries');
  }
  return added + updated;
}

module.exports = { injectProjectDetails, sanityKey, extractTemplateVar, synthesizeDetail, revive };