// verify-nl-map.js
// Regression gate for the Netherlands map rebuild (Tasks 1-5). Verifies the
// generated NL map artifacts against _build/nl-map-data.js (the single source
// of truth): the 7 loc_* cube anchors in webgl/models/map.glb, the 4 dist_*
// anchors in webgl/models/map-districts.glb, and the `ev` object baked into
// the _nuxt/u1ipQrxM.js bundle. Then runs the full rebuild cycle to prove the
// whole thing regenerates cleanly.
//
// Exit 0 when every assertion PASSes; non-zero when any FAILs.
//
// Usage: node _build/verify-nl-map.js  (run from the merged site root, or pass
// the merged root as argv[2]).
//
// Manual check (not automatable headless â€” the 3D map scene does not run its
// projection loop under headless Chrome, so the district pins never get screen
// positions and the pointer-position-driven interaction can't fire):
//   1. `node serve.js` then open http://localhost:8080/
//   2. Wait for the loader ("Ready to Explore") to clear.
//   3. Move the pointer over a district pin/label (e.g. "SOUTH") on the map.
//      The district's roads should glow (district road highlight) and the
//      cursor becomes a pointer. No console errors may appear.
//   4. Move the pointer away â€” the glow should fade. Repeat for each district.
//   5. On a touch device (or DevTools mobile emulation), tapping a district
//      row must trigger the same glow (`map:district:touchclick`).
// The controller already exercised this once interactively; assertion 7 below
// is a static wiring canary that the district-glow handler chain is intact in
// the rebuilt bundle (it can't prove the runtime glow, only that the wiring
// survived regeneration).

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(process.argv[2] || process.cwd());
const MAP_DATA = require(path.join(__dirname, 'nl-map-data.js'));

const MAP_GLB = path.join(ROOT, 'webgl', 'models', 'map.glb');
const DISTRICTS_GLB = path.join(ROOT, 'webgl', 'models', 'map-districts.glb');
const BUNDLE = path.join(ROOT, '_nuxt', 'u1ipQrxM.js');

// The bundle's cube<->project name link (mirrors the one in nl-terrain.js and
// the site bundle): `0_loc_<type>_<status>_<slug>` -> slug.
const getProjectName = (e) => e.split('_').slice(4).join('-').toLowerCase();

const LEGACY_NEEDLES = ['hubtown', 'akruti', 'sunstream', '25-', 'asmeeta'];
const EXPECTED_DISTRICT_NODES = ['dist_west', 'dist_south', 'dist_central', 'dist_north'];

let failures = 0;

// Run the rebuild cycle FIRST so every artifact assertion below tests the
// freshly regenerated output (build-merged regenerates both GLBs + the bundle;
// build-locales regenerates the locale pages). Result is reported last, in the
// brief's numbered order (assertion 6).
let rebuildResult = null;

function report(name, pass, detail) {
  if (pass) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? ': ' + detail : ''}`);
  }
}

// ---- GLB JSON-chunk reader (header + chunks, no deps) ----
function readGlbJson(glbPath) {
  const b = fs.readFileSync(glbPath);
  if (b.length < 12 || b.readUInt32LE(0) !== 0x46546c67 || b.readUInt32LE(4) !== 2) {
    throw new Error('not a glTF 2.0 binary');
  }
  let off = 12;
  while (off + 8 <= b.length) {
    const len = b.readUInt32LE(off);
    const type = b.readUInt32LE(off + 4);
    const data = b.slice(off + 8, off + 8 + len);
    if (type === 0x4e4f534a) return JSON.parse(data.toString('utf8')); // "JSON"
    off += 8 + len + ((4 - (len & 3)) & 3);
  }
  throw new Error('no JSON chunk in GLB');
}

function deepEq3(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === 3 &&
    a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function allEvProjects() {
  return Object.values(MAP_DATA.ev).flat();
}

// Map a loc node to its ground-truth project + expected anchor position.
// Returns null when the node cannot be resolved.
function projectForLocNode(node) {
  const slug = getProjectName(node.name);
  const proj = MAP_DATA.projects.find((p) => p.slug === slug);
  if (!proj) return null;
  const evEntry = allEvProjects().find((e) => e.name === slug);
  return {
    slug,
    proj,
    evEntry,
    expected: MAP_DATA.applyNudge(MAP_DATA.cityCoords[proj.city], proj.nudge),
  };
}

// ---- assertion 6 (runs first): rebuild cycle exits clean ----
(function () {
  const steps = ['build-merged.js', 'build-locales.js'];
  let pass = true, detail = '';
  for (const step of steps) {
    const script = path.join(__dirname, step);
    const r = spawnSync(process.execPath, [script], { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
    if (r.status !== 0) {
      pass = false;
      detail += `${step} exited ${r.status === null ? 'null(timeout/signal)' : r.status}: ` +
        `${(r.stderr || r.stdout || 'no output').trim().split('\n').slice(0, 5).join(' | ')}; `;
    }
  }
  if (detail) detail = detail.trim();
  rebuildResult = { pass, detail };
})();

// ---- assertion 1: map.glb has exactly 7 loc_* nodes at cityCoords ----
(function () {
  let pass = false, detail = '';
  try {
    const scene = readGlbJson(MAP_GLB);
    const locNodes = (scene.nodes || []).filter((n) => n.name && n.name.includes('loc'));
    if (locNodes.length !== 7) {
      detail = `found ${locNodes.length} loc_* nodes, expected 7`;
    } else {
      const bad = [];
      for (const n of locNodes) {
        const resolved = projectForLocNode(n);
        if (!resolved) { bad.push(`${n.name}: unknown project`); continue; }
        if (!Array.isArray(n.translation) || n.translation.length !== 3) {
          bad.push(`${n.name}: translation not a 3-number array (${JSON.stringify(n.translation)})`);
          continue;
        }
        if (!deepEq3(n.translation, resolved.expected)) {
          bad.push(`${n.name} @ ${JSON.stringify(n.translation)} != cityCoords[${resolved.proj.city}] ${JSON.stringify(resolved.expected)}`);
          continue;
        }
        if (resolved.evEntry && !deepEq3(n.translation, resolved.evEntry.location)) {
          bad.push(`${n.name} @ ${JSON.stringify(n.translation)} != ev.location ${JSON.stringify(resolved.evEntry.location)}`);
        }
      }
      if (bad.length) detail = bad.join('; ');
      else pass = true;
    }
  } catch (e) { detail = e.message; }
  report('map.glb: exactly 7 loc_* nodes at their cityCoords anchors', pass, detail);
})();

// ---- assertion 2: getProjectName(slug) exists in MAP_DATA.ev for every loc node ----
(function () {
  let pass = false, detail = '';
  try {
    const scene = readGlbJson(MAP_GLB);
    const locNodes = (scene.nodes || []).filter((n) => n.name && n.name.includes('loc'));
    const evNames = new Set(allEvProjects().map((e) => e.name));
    const missing = [];
    for (const n of locNodes) {
      const slug = getProjectName(n.name);
      if (!evNames.has(slug)) missing.push(`${n.name} -> ${slug}`);
    }
    if (missing.length) detail = 'no ev entry for: ' + missing.join('; ');
    else pass = true;
  } catch (e) { detail = e.message; }
  report('getProjectName(node) slug resolves in MAP_DATA.ev for every loc node', pass, detail);
})();

// ---- assertion 3: map-districts.glb has exactly the 4 dist_* anchors ----
(function () {
  let pass = false, detail = '';
  try {
    const scene = readGlbJson(DISTRICTS_GLB);
    const nodes = (scene.nodes || []).map((n) => n.name);
    const expected = [...EXPECTED_DISTRICT_NODES].sort();
    const got = [...nodes].sort();
    if (got.length !== expected.length) {
      detail = `found ${got.length} nodes (${got.join(', ')}), expected ${expected.length} (${expected.join(', ')})`;
    } else if (got.join('|') !== expected.join('|')) {
      detail = `node names mismatch: got ${got.join(', ')}`;
    } else {
      pass = true;
    }
  } catch (e) { detail = e.message; }
  report('map-districts.glb: exactly 4 dist_west/south/central/north anchors', pass, detail);
})();

// ---- assertion 4: bundle ev decodes to 4 keys / 7 projects, no legacy strings, valid locations ----
(function () {
  let pass = false, detail = '';
  try {
    const bundle = fs.readFileSync(BUNDLE, 'utf8');
    const evStart = bundle.indexOf('const ev=');
    const evEnd = bundle.indexOf('};class exe', evStart);
    if (evStart === -1 || evEnd === -1) throw new Error('const ev={...};class exe span not found in bundle');
    const evText = bundle.slice(evStart + 'const ev='.length, evEnd + 1);
    const ev = JSON.parse(evText);

    const keys = Object.keys(ev);
    if (keys.join(',') !== 'west,south,central,north') {
      throw new Error(`unexpected ev keys: ${keys.join(',')}`);
    }
    const projects = allEvProjectsFrom(ev);
    if (projects.length !== 7) throw new Error(`ev has ${projects.length} projects, expected 7`);

    const leaks = [];
    for (const needle of LEGACY_NEEDLES) {
      if (evText.includes(needle)) leaks.push(`"${needle}"`);
    }
    if (leaks.length) throw new Error('legacy strings present in ev: ' + leaks.join(', '));

    const badLoc = [];
    for (const p of projects) {
      const loc = p.location;
      if (!Array.isArray(loc) || loc.length !== 3 || !loc.every((v) => Number.isFinite(v))) {
        badLoc.push(`${p.name}: location=${JSON.stringify(loc)}`);
      }
    }
    if (badLoc.length) throw new Error('invalid location: ' + badLoc.join('; '));

    const evNames = projects.map((p) => p.name).sort();
    const dataNames = MAP_DATA.projects.map((p) => p.slug).sort();
    if (evNames.join('|') !== dataNames.join('|')) {
      throw new Error(`ev names ${evNames.join(',')} != MAP_DATA.projects ${dataNames.join(',')}`);
    }

    pass = true;
  } catch (e) { detail = e.message; }
  report('bundle ev: 4 keys, 7 projects, no legacy strings, valid locations', pass, detail);
})();

function allEvProjectsFrom(ev) {
  return Object.keys(ev).reduce((acc, k) => acc.concat(ev[k]), []);
}

// ---- assertion 5: bundle still contains `};class exe` after the ev object ----
(function () {
  let pass = false, detail = '';
  try {
    const bundle = fs.readFileSync(BUNDLE, 'utf8');
    const evStart = bundle.indexOf('const ev=');
    const terminator = bundle.indexOf('};class exe', evStart);
    if (evStart === -1) detail = '"const ev=" not found';
    else if (terminator === -1) detail = '"};class exe" not found after ev object';
    else if (terminator < evStart) detail = 'terminator precedes ev object';
    else pass = true;
  } catch (e) { detail = e.message; }
  report('bundle: `};class exe` intact after ev object (bundle not broken)', pass, detail);
})();

// ---- assertion 7: district-glow interaction wiring is intact in the bundle ----
// Static canary for the district-glow interaction (hover/click a district row
// -> `map:district:enter` -> setSelectedDistrictRoads -> uSelectionMix tween).
// Headless browsers don't run the 3D projection loop that positions the
// district pins, so the runtime glow can't be asserted headless â€” see the
// manual check in the header. If any of these wiring anchors vanish from the
// regenerated bundle, the interaction is broken and this FAILs.
(function () {
  let pass = false, detail = '';
  try {
    const bundle = fs.readFileSync(BUNDLE, 'utf8');
    const anchors = ['map:district:enter', 'map:district:leave', 'setSelectedDistrictRoads', 'uSelectionMix'];
    const missing = anchors.filter((a) => !bundle.includes(a));
    if (missing.length) detail = 'missing from bundle: ' + missing.join(', ');
    else pass = true;
  } catch (e) { detail = e.message; }
  report('bundle: district-glow wiring anchors present (map:district:enter/leave, setSelectedDistrictRoads, uSelectionMix)', pass, detail);
})();

// ---- assertion 8: map is north-up (north city at LOWER z than south city) ----
// Regression gate for the vertical-flip fix: the original Mumbai map put north
// at -z and the site camera renders -z at the TOP of the screen. Groningen
// (northernmost) must sit at a smaller z than Rotterdam (southernmost), in both
// cityCoords and the regenerated map.glb loc_* anchors.
(function () {
  let pass = false, detail = '';
  try {
    const gron = MAP_DATA.cityCoords['Groningen'];
    const rot = MAP_DATA.cityCoords['Rotterdam'];
    if (!gron || !rot) throw new Error('missing cityCoords for Groningen/Rotterdam');
    if (!(gron[2] < rot[2])) {
      throw new Error(`cityCoords not north-up: Groningen z=${gron[2]} !< Rotterdam z=${rot[2]}`);
    }
    const scene = readGlbJson(MAP_GLB);
    const bySlug = {};
    for (const n of (scene.nodes || [])) {
      if (n.name && n.name.includes('loc')) bySlug[getProjectName(n.name)] = n.translation;
    }
    // north city (Groningen) -> cybercrime-report; south city (Rotterdam) -> brain
    const g = bySlug['cybercrime-report'];
    const r = bySlug['brain'];
    if (!g || !r) throw new Error('map.glb missing cybercrime-report/brain loc nodes');
    if (!(g[2] < r[2])) {
      throw new Error(`map.glb not north-up: groningen z=${g[2]} !< rotterdam z=${r[2]}`);
    }
    pass = true;
  } catch (e) { detail = e.message; }
  report('orientation: Groningen (north) z < Rotterdam (south) z in cityCoords + map.glb', pass, detail);
})();

// ---- summary ----
console.log('');
report('rebuild cycle: build-merged.js + build-locales.js exit 0', rebuildResult.pass, rebuildResult.detail);
if (failures === 0) {
  console.log(`SUMMARY: ALL 8 ASSERTIONS PASS`);
  process.exit(0);
} else {
  console.log(`SUMMARY: ${failures} ASSERTION(S) FAILED`);
  process.exit(1);
}