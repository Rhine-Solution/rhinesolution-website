// Rebrand the projects payload: swap hubtown's 56 Mumbai real-estate projects
// for Rhine Solution's real 7-project portfolio.
//
// The client reads the projects list from the Nuxt payload cache under the list
// query key (`vRe` -> `sanity-onNv...`), and opens a per-project detail modal by
// querying the same cache under `sanity-<hash-of-cMe({slug})>`. This module:
//   1. Replaces the list array (56 entries) with 7 Rhine projects.
//   2. Deletes every stale per-project detail key except the list key, the shared
//      siteSettings key, and the 7 freshly-appended detail keys.
//   3. Appends 7 detail wrappers (exact same append-primitive-then-ref pattern as
//      injectProjectDetails) so the PDP modal resolves offline for each new slug.
//
// Runs AFTER injectProjectDetails in the merge pipeline.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { sanityKey, extractTemplateVar, synthesizeDetail, revive } = require('./inject-project-detail.js');

const LIST_KEY = 'sanity-onNvxnDB8paO7TROOqQDtTStnLDv6SmIJhMGSA_DVDM';
const SITE_SETTINGS_KEY = 'sanity-RXp6fvBEHhAm7cPW_PXkzJe4MLPxGM93lTtTMD1wfIk';

// The 7 real Rhine projects (source of truth: rhinesolution-website/content/en.json).
const PROJECTS = [
  { title: 'Plan2Shift', slug: 'plan2shift', type: 'web-app', status: 'shipped', location: 'Utrecht, Netherlands', city: 'utrecht', coordinates: '52.09 N. 5.12 E' },
  { title: 'Spendtracker', slug: 'spendtracker', type: 'web-app', status: 'shipped', location: 'Amsterdam, Netherlands', city: 'amsterdam', coordinates: '52.37 N. 4.90 E' },
  { title: 'The Brain', slug: 'brain', type: 'knowledge-base', status: 'shipped', location: 'Rotterdam, Netherlands', city: 'rotterdam', coordinates: '51.92 N. 4.48 E' },
  { title: 'Music Trends Local', slug: 'music-trends-local', type: 'web-app', status: 'shipped', location: 'The Hague, Netherlands', city: 'the-hague', coordinates: '52.07 N. 4.31 E' },
  { title: 'Mac Mini AI Infrastructure', slug: 'mac-mini-ai', type: 'infrastructure', status: 'maintained', location: 'Delft, Netherlands', city: 'delft', coordinates: '52.01 N. 4.36 E' },
  { title: 'rhinesolution.com', slug: 'rhinesolution', type: 'website', status: 'shipped', location: 'Rotterdam, Netherlands', city: 'rotterdam', coordinates: '51.92 N. 4.48 E' },
  { title: 'Cybercrime & Cybersecurity Report', slug: 'cybercrime-report', type: 'report', status: 'shipped', location: 'Groningen, Netherlands', city: 'groningen', coordinates: '53.22 N. 6.57 E' },
];

function newUuid() {
  return crypto.randomUUID();
}

// Append one value to the payload array, returning its index.
function appendPrimitive(pp, v) {
  const idx = pp.length;
  pp.push(v);
  return idx;
}

// Build a list item object with numeric index refs for its primitive fields.
function buildListItem(pp, proj) {
  const refs = {};
  for (const [k, v] of Object.entries({
    _id: newUuid(),
    city: proj.city,
    coordinates: proj.coordinates,
    location: proj.location,
    slug: proj.slug,
    soldOut: false,
    status: proj.status,
    title: proj.title,
    type: proj.type,
    year: '2026',
  })) {
    refs[k] = appendPrimitive(pp, v);
  }
  return appendPrimitive(pp, refs);
}

// Append a full detail wrapper ({ data: <obj>, sourceMap: null }) and return its key.
function appendDetail(pp, dataMap, cMe, proj, listItemIdx) {
  const key = 'sanity-' + sanityKey(cMe, { slug: proj.slug });
  if (key in dataMap) return key; // already present
  const listProject = revive(pp, { ShallowReactive: v => ({ ...v }) });
  const detail = synthesizeDetail({
    _id: pp[pp[listItemIdx]._id],
    title: proj.title,
    slug: proj.slug,
    type: proj.type,
    status: proj.status,
    location: proj.location,
    city: proj.city,
    soldOut: false,
    year: '2026',
    coordinates: proj.coordinates,
  });
  const refs = {};
  for (const [k, v] of Object.entries(detail)) {
    refs[k] = appendPrimitive(pp, v);
  }
  const objIdx = appendPrimitive(pp, refs);
  const wrapperIdx = appendPrimitive(pp, { data: objIdx, sourceMap: null });
  dataMap[key] = wrapperIdx;
  return key;
}

function rebrandProjects(mergedRoot, log) {
  const payloadPath = path.join(mergedRoot, 'projects', '_payloadc9a0.json');
  const bundlePath = path.join(mergedRoot, '_nuxt', 'u1ipQrxM.js');
  if (!fs.existsSync(payloadPath) || !fs.existsSync(bundlePath)) {
    if (log) console.log('  rebrand-projects: SKIP (missing payload/bundle)');
    return null;
  }
  const bundle = fs.readFileSync(bundlePath, 'utf8');
  const cMe = extractTemplateVar(bundle, 'cMe');
  if (!cMe) { if (log) console.log('  rebrand-projects: SKIP (cMe query not found)'); return null; }

  const pp = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  const dataMap = pp[2];
  if (!dataMap || typeof dataMap !== 'object') {
    if (log) console.log('  rebrand-projects: SKIP (data map not found)');
    return null;
  }

  // --- 1. replace the list array with 7 Rhine projects ---
  const listWrapperIdx = dataMap[LIST_KEY];
  const listDataIdx = pp[listWrapperIdx] && pp[listWrapperIdx].data;
  if (typeof listWrapperIdx !== 'number' || !Array.isArray(pp[listDataIdx])) {
    if (log) console.log('  rebrand-projects: SKIP (list not in payload)');
    return null;
  }
  const newList = [];
  const listItemIdxs = [];
  for (const proj of PROJECTS) {
    const itemIdx = buildListItem(pp, proj);
    listItemIdxs.push(itemIdx);
    newList.push(itemIdx);
  }
  pp[listDataIdx] = newList;

  // --- 2. delete stale detail keys (keep list + siteSettings + new details) ---
  const newDetailKeys = PROJECTS.map(p => 'sanity-' + sanityKey(cMe, { slug: p.slug }));
  const keep = new Set([LIST_KEY, SITE_SETTINGS_KEY, ...newDetailKeys]);
  let deleted = 0;
  for (const k of Object.keys(dataMap)) {
    if (k.startsWith('sanity-') && !keep.has(k)) { delete dataMap[k]; deleted++; }
  }

  // --- 3. append the 7 detail wrappers ---
  for (let i = 0; i < PROJECTS.length; i++) {
    appendDetail(pp, dataMap, cMe, PROJECTS[i], listItemIdxs[i]);
  }

  fs.writeFileSync(payloadPath, JSON.stringify(pp), 'utf8');
  if (log) console.log('  rebrand-projects: replaced list, deleted', deleted, 'stale detail keys');
  return { listItems: newList.length, detailKeys: newDetailKeys.length };
}

module.exports = { rebrandProjects, LIST_KEY, PROJECTS };
