// Netherlands terrain GLB generator.
//
// Reads _build/geo/nl-provinces.geojson (12 provinces), uses MAP_DATA from
// nl-map-data.js for the geographic bbox, city coords, district clusters and
// lonLatToWorld, and writes webgl/models/map.glb with:
//   - terrain  : grid mesh over the NL bbox (triangles, mode 0), attrs
//                _MASK,_HEIGHT,POSITION,NORMAL,TEXCOORD_0,TEXCOORD_1,COLOR_0
//   - major    : coastline boundary curves (LINES, mode 1), attrs
//                _GRADIENT_EDGES,_DIST_THANECENTRALSOUTH,_DIST_WESTERN,POSITION
//   - minor    : internal province border curves (LINES, mode 1), same attrs
//   - 7 loc_*  : empty cube-anchor nodes, translation = cityCoords[city]
//
// The boundary attribute contract mirrors the site loader exactly:
//   _GRADIENT_EDGES          = SCALAR float per line vertex (fade along line:
//                              1 mid-run -> 0 at run ends)
//   _DIST_THANECENTRALSOUTH  = VEC3 [northGrad, centralGrad, southGrad]
//                              (x channel repurposed for the North district;
//                              the shader reads vThaneCentralSouth.x/.y/.z)
//   _DIST_WESTERN            = VEC3 [westGrad, 0, 0]
// Each gradient is 1 at its district centroid and -> 0 away (smoothstep
// falloff radius R). District centroids are the means of each district's
// city coordinates (world space).
//
// Terrain heights use the original map's world scale (POSITION.y ~0..39,
// higher inland, water below the shader's uWaterLevel=0).

'use strict';

const fs = require('fs');
const path = require('path');

const MAP_DATA = require('./nl-map-data.js');
const { writeGLB, addBufferView, addAccessor, meshNode, primitive, mesh } = require('./glb-writer.js');

const GEOJSON_PATH = path.join(__dirname, 'geo', 'nl-provinces.geojson');
const OUT_PATH = path.resolve(__dirname, '..', 'webgl', 'models', 'map.glb');

const { lonLatToWorld, bbox, districts, projects, cityCoords } = MAP_DATA;

// World-space extent (matches nl-map-data.js WORLD_X / WORLD_Z).
const WX = [-235, 345];
const WZ = [-395, 394];

// Grid resolution (320x240 = 76,800 verts, close to the original 88,677).
const U = 320;
const V = 240;

// Boundary resample step in world units (~0.5 -> ~20k total line vertices).
const STEP = 0.5;

// District-gradient falloff radius in world units.
const R = 120;

// Line elevation above the terrain plane (original major y ~15.2..19.7).
const LINE_Y = 16;

// Site palette base color for COLOR_0.
const COLOR = { r: 0x1c, g: 0x26, b: 0x34 };

// Water/land levels (fragment shader: water when POSITION.y < uWaterLevel=0).
const WATER_Y = -0.5;
const LAND_MIN = 0.5;
const LAND_MAX = 35;

function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// Ray-cast point-in-ring test.
function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Point in a polygon (first ring = outer boundary, rest = holes).
function pointInPolygon(lon, lat, rings) {
  if (!pointInRing(lon, lat, rings[0])) return false;
  for (let h = 1; h < rings.length; h++) {
    if (pointInRing(lon, lat, rings[h])) return false;
  }
  return true;
}

// Point anywhere in the country (union of all province polygons).
function pointInCountry(lon, lat, features) {
  for (const f of features) {
    const geom = f.geometry;
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
    for (const rings of polys) {
      if (pointInPolygon(lon, lat, rings)) return true;
    }
  }
  return false;
}

// ---- Load GeoJSON + build the mask grid -----------------------------------

const geo = JSON.parse(fs.readFileSync(GEOJSON_PATH, 'utf8'));
const features = geo.features;

const lon0 = bbox.lon[0], lon1 = bbox.lon[1];
const lat0 = bbox.lat[0], lat1 = bbox.lat[1];

function gridLon(i) { return lon0 + (i / (U - 1)) * (lon1 - lon0); }
function gridLat(j) { return lat0 + (j / (V - 1)) * (lat1 - lat0); }

// World -> grid cell (may be out of range; caller clamps).
function worldToGrid(x, z) {
  const c = ((x - WX[0]) / (WX[1] - WX[0])) * (U - 1);
  const r = ((z - WZ[0]) / (WZ[1] - WZ[0])) * (V - 1);
  return { c, r };
}

const mask = new Uint8Array(U * V);
for (let j = 0; j < V; j++) {
  for (let i = 0; i < U; i++) {
    if (pointInCountry(gridLon(i), gridLat(j), features)) mask[j * U + i] = 1;
  }
}

// ---- Distance-to-coast transform (grid BFS) --------------------------------
// dist[cell] = cells from the nearest coast cell (land touching water/outside).

const dist = new Int32Array(U * V).fill(-1);
const queue = [];
for (let j = 0; j < V; j++) {
  for (let i = 0; i < U; i++) {
    if (!mask[j * U + i]) continue;
    let coastal = false;
    for (let dj = -1; dj <= 1 && !coastal; dj++) {
      for (let di = -1; di <= 1; di++) {
        if (di === 0 && dj === 0) continue;
        const ci = i + di, cj = j + dj;
        if (ci < 0 || cj < 0 || ci >= U || cj >= V || !mask[cj * U + ci]) { coastal = true; break; }
      }
    }
    if (coastal) { dist[j * U + i] = 0; queue.push(j * U + i); }
  }
}
let head = 0;
while (head < queue.length) {
  const idx = queue[head++];
  const i = idx % U, j = (idx / U) | 0;
  const nd = dist[idx] + 1;
  for (let dj = -1; dj <= 1; dj++) {
    for (let di = -1; di <= 1; di++) {
      if (di === 0 && dj === 0) continue;
      const ci = i + di, cj = j + dj;
      if (ci < 0 || cj < 0 || ci >= U || cj >= V) continue;
      const nidx = cj * U + ci;
      if (mask[nidx] && dist[nidx] === -1) { dist[nidx] = nd; queue.push(nidx); }
    }
  }
}
let maxDist = 0;
for (let k = 0; k < dist.length; k++) if (dist[k] > maxDist) maxDist = dist[k];

// ---- Terrain vertex data ---------------------------------------------------

const tPos = new Float32Array(U * V * 3);
const tMask = new Float32Array(U * V);
const tHeight = new Float32Array(U * V);
const tNormal = new Float32Array(U * V * 3);
const tUv0 = new Float32Array(U * V * 2);
const tUv1 = new Float32Array(U * V * 2);
const tColor = new Uint16Array(U * V * 4);

const colorR = Math.round((COLOR.r / 255) * 65535);
const colorG = Math.round((COLOR.g / 255) * 65535);
const colorB = Math.round((COLOR.b / 255) * 65535);
const colorA = 65535;

for (let j = 0; j < V; j++) {
  for (let i = 0; i < U; i++) {
    const idx = j * U + i;
    const lon = gridLon(i), lat = gridLat(j);
    const [x, , z] = lonLatToWorld(lon, lat, bbox);
    const m = mask[idx];
    let h = 0;
    if (m) {
      const c = maxDist > 0 ? dist[idx] / maxDist : 0;
      h = LAND_MIN + (LAND_MAX - LAND_MIN) * Math.pow(c, 1.2);
    }
    tPos[idx * 3] = x;
    tPos[idx * 3 + 1] = m ? h : WATER_Y;
    tPos[idx * 3 + 2] = z;
    tMask[idx] = m;
    tHeight[idx] = h;
    tNormal[idx * 3 + 1] = 1;
    const u = i / (U - 1), v = j / (V - 1);
    tUv0[idx * 2] = u;
    tUv0[idx * 2 + 1] = v;
    tUv1[idx * 2] = u;
    tUv1[idx * 2 + 1] = v;
    tColor[idx * 4] = colorR;
    tColor[idx * 4 + 1] = colorG;
    tColor[idx * 4 + 2] = colorB;
    tColor[idx * 4 + 3] = colorA;
  }
}

const tIndex = new Uint32Array((U - 1) * (V - 1) * 6);
let ti = 0;
for (let j = 0; j < V - 1; j++) {
  for (let i = 0; i < U - 1; i++) {
    const a = j * U + i;
    const b = j * U + i + 1;
    const c = (j + 1) * U + i + 1;
    const d = (j + 1) * U + i;
    // +y up winding.
    tIndex[ti++] = a; tIndex[ti++] = c; tIndex[ti++] = b;
    tIndex[ti++] = a; tIndex[ti++] = d; tIndex[ti++] = c;
  }
}

// ---- Province boundary curves ----------------------------------------------

// District centroids (world space), means of each district's cities.
const centroids = {};
for (const key of Object.keys(districts)) {
  let x = 0, z = 0;
  for (const c of districts[key].cities) { x += cityCoords[c][0]; z += cityCoords[c][2]; }
  centroids[key] = { x: x / districts[key].cities.length, z: z / districts[key].cities.length };
}

// Gather all province rings as world-space closed polylines.
function collectRings() {
  const rings = [];
  for (const f of features) {
    const geom = f.geometry;
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
    for (const poly of polys) {
      for (const ring of poly) {
        const pts = [];
        for (let i = 0; i < ring.length - 1; i++) {
          const [x, , z] = lonLatToWorld(ring[i][0], ring[i][1], bbox);
          pts.push([x, z]);
        }
        if (pts.length >= 3) rings.push(pts);
      }
    }
  }
  return rings;
}

// Resample a ring at uniform world-space step (removes source density bias).
function resample(ring) {
  const out = [];
  if (ring.length < 2) return out;
  let total = 0;
  const segs = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push(l);
    total += l;
  }
  const count = Math.max(4, Math.round(total / STEP));
  const dStep = total / count;
  let acc = 0, seg = 0, segAcc = 0;
  const a0 = ring[0];
  out.push([a0[0], a0[1]]);
  for (let k = 1; k < count; k++) {
    const target = k * dStep;
    while (seg < segs.length && segAcc + segs[seg] < target) {
      segAcc += segs[seg];
      seg++;
    }
    if (seg >= segs.length) break;
    const t = (target - segAcc) / segs[seg];
    const a = ring[seg], b = ring[(seg + 1) % ring.length];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

// Classify a boundary point as coast (major) vs internal (minor) via the mask
// grid: coast if water/outside within 1 cell.
function isCoast(x, z) {
  const { c, r } = worldToGrid(x, z);
  const c0 = Math.floor(c), r0 = Math.floor(r);
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const ci = c0 + dc, cj = r0 + dr;
      if (ci < 0 || cj < 0 || ci >= U || cj >= V) return true;
      if (!mask[cj * U + ci]) return true;
    }
  }
  return false;
}

// Split a resampled ring into runs of like-classified points. Each run is
// `closed:true` only when it spans the whole ring.
function splitRuns(ring) {
  const n = ring.length;
  const cls = ring.map(([x, z]) => isCoast(x, z) ? 1 : 0);
  const runs = [];
  let start = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || cls[i] !== cls[start]) {
      const pts = ring.slice(start, i);
      if (pts.length >= 2) runs.push({ coast: cls[start] === 1, pts, closed: false });
      start = i;
    }
  }
  // Merge a wrapped first/last run of the same class.
  if (runs.length >= 2) {
    const first = runs[0], last = runs[runs.length - 1];
    if (first.coast === last.coast && last.pts.length >= 2) {
      runs.pop();
      runs[0] = { coast: first.coast, pts: last.pts.concat(first.pts), closed: false };
    }
  }
  if (runs.length === 1 && runs[0].pts.length >= 4) runs[0].closed = true;
  return runs;
}

// Per-run segment emission. Each run becomes a LINES strip; consecutive
// vertices are paired (mode 1). Adds closing segment for closed rings.
function buildBoundaryMesh(runFilter) {
  const pos = [];
  const edge = [];
  const tcs = [];
  const wst = [];
  const ind = [];
  for (const ring of collectRings()) {
    const res = resample(ring);
    for (const run of splitRuns(res)) {
      if (!runFilter(run.coast)) continue;
      const n = run.pts.length;
      const base = pos.length / 2;
      for (let i = 0; i < n; i++) {
        const [x, z] = run.pts[i];
        pos.push(x, z);
        // Fade gradient along the run: 0 at both ends -> 1 in the body.
        const fade = Math.max(2, Math.round(n * 0.05));
        edge.push(smoothstep(0, fade, Math.min(i, n - 1 - i)));
        const dNorth = Math.hypot(x - centroids.north.x, z - centroids.north.z);
        const dCentral = Math.hypot(x - centroids.central.x, z - centroids.central.z);
        const dSouth = Math.hypot(x - centroids.south.x, z - centroids.south.z);
        const dWest = Math.hypot(x - centroids.west.x, z - centroids.west.z);
        tcs.push(1 - smoothstep(0, R, dNorth), 1 - smoothstep(0, R, dCentral), 1 - smoothstep(0, R, dSouth));
        wst.push(1 - smoothstep(0, R, dWest), 0, 0);
      }
      for (let i = 0; i < n - 1; i++) { ind.push(base + i, base + i + 1); }
      if (run.closed) ind.push(base + n - 1, base);
    }
  }
  const verts = pos.length / 2;
  const posArr = new Float32Array(verts * 3);
  for (let i = 0; i < verts; i++) {
    posArr[i * 3] = pos[i * 2];
    posArr[i * 3 + 1] = LINE_Y;
    posArr[i * 3 + 2] = pos[i * 2 + 1];
  }
  return {
    vertices: verts,
    position: posArr,
    edge: new Float32Array(edge),
    tcs: new Float32Array(tcs),
    western: new Float32Array(wst),
    indices: new Uint16Array(ind),
  };
}

const major = buildBoundaryMesh((coast) => coast === true);
const minor = buildBoundaryMesh((coast) => coast === false);

// ---- GLB assembly ----------------------------------------------------------

const parts = [];
let binLen = 0;
function append(view) {
  const pad = (4 - (binLen & 3)) & 3;
  if (pad) { parts.push(new Uint8Array(pad)); binLen += pad; }
  const off = binLen;
  parts.push(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  binLen += view.byteLength;
  return off;
}

function addFloatAttr(scene, data, type, { min, max } = {}) {
  const byteOffset = append(data);
  const bv = addBufferView(scene, { byteOffset, byteLength: data.byteLength });
  return addAccessor(scene, { bufferView: bv, componentType: 5126, count: data.length / typeSize(type), type, min, max });
}
function typeSize(t) { return t === 'VEC3' ? 3 : t === 'VEC2' ? 2 : 1; }

const scene = {
  asset: { version: '2.0', generator: 'nl-terrain.js' },
  scene: 0,
  scenes: [{ name: 'Scene', nodes: [] }],
  nodes: [],
  meshes: [],
  accessors: [],
  bufferViews: [],
  buffers: [{ byteLength: 0 }],
};

// terrain
{
  const posOff = append(tPos);
  const maskOff = append(tMask);
  const heightOff = append(tHeight);
  const normOff = append(tNormal);
  const uv0Off = append(tUv0);
  const uv1Off = append(tUv1);
  const colOff = append(tColor);
  const idxOff = append(tIndex);

  const posMin = [Infinity, Infinity, Infinity];
  const posMax = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < U * V; i++) {
    for (let k = 0; k < 3; k++) {
      const v = tPos[i * 3 + k];
      if (v < posMin[k]) posMin[k] = v;
      if (v > posMax[k]) posMax[k] = v;
    }
  }

  const attrs = {
    _MASK: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: maskOff, byteLength: tMask.byteLength }), componentType: 5126, count: U * V, type: 'SCALAR' }),
    _HEIGHT: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: heightOff, byteLength: tHeight.byteLength }), componentType: 5126, count: U * V, type: 'SCALAR' }),
    POSITION: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: posOff, byteLength: tPos.byteLength }), componentType: 5126, count: U * V, type: 'VEC3', min: posMin, max: posMax }),
    NORMAL: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: normOff, byteLength: tNormal.byteLength }), componentType: 5126, count: U * V, type: 'VEC3' }),
    TEXCOORD_0: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: uv0Off, byteLength: tUv0.byteLength }), componentType: 5126, count: U * V, type: 'VEC2' }),
    TEXCOORD_1: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: uv1Off, byteLength: tUv1.byteLength }), componentType: 5126, count: U * V, type: 'VEC2' }),
    COLOR_0: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: colOff, byteLength: tColor.byteLength }), componentType: 5123, count: U * V, type: 'VEC4', normalized: true }),
  };
  const idxAcc = addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: idxOff, byteLength: tIndex.byteLength }), componentType: 5125, count: tIndex.length, type: 'SCALAR' });
  scene.meshes.push(mesh('terrain', [primitive(attrs, idxAcc, 0)]));
  scene.nodes.push(meshNode('terrain', 0));
}

function addLineMesh(name, data) {
  const { position, edge, tcs, western, indices, vertices } = data;
  const posOff = append(position);
  const edgeOff = append(edge);
  const tcsOff = append(tcs);
  const wstOff = append(western);
  const idxOff = append(indices);

  const posMin = [Infinity, Infinity, Infinity];
  const posMax = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < vertices; i++) {
    for (let k = 0; k < 3; k++) {
      const v = position[i * 3 + k];
      if (v < posMin[k]) posMin[k] = v;
      if (v > posMax[k]) posMax[k] = v;
    }
  }

  const attrs = {
    _GRADIENT_EDGES: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: edgeOff, byteLength: edge.byteLength }), componentType: 5126, count: vertices, type: 'SCALAR' }),
    _DIST_THANECENTRALSOUTH: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: tcsOff, byteLength: tcs.byteLength }), componentType: 5126, count: vertices, type: 'VEC3' }),
    _DIST_WESTERN: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: wstOff, byteLength: western.byteLength }), componentType: 5126, count: vertices, type: 'VEC3' }),
    POSITION: addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: posOff, byteLength: position.byteLength }), componentType: 5126, count: vertices, type: 'VEC3', min: posMin, max: posMax }),
  };
  const idxAcc = addAccessor(scene, { bufferView: addBufferView(scene, { byteOffset: idxOff, byteLength: indices.byteLength }), componentType: 5123, count: indices.length, type: 'SCALAR' });
  scene.meshes.push(mesh(name, [primitive(attrs, idxAcc, 1)]));
  scene.nodes.push(meshNode(name, scene.meshes.length - 1));
}

addLineMesh('major', major);
addLineMesh('minor', minor);

// loc_* cube anchors (no mesh).
for (const p of projects) {
  const name = '0_loc_' + p.type + '_' + p.status + '_' + p.slug;
  scene.nodes.push(meshNode(name, undefined, cityCoords[p.city].slice()));
}

scene.scenes[0].nodes = scene.nodes.map((_, i) => i);

const bin = Buffer.concat(parts);
scene.buffers[0].byteLength = bin.length;
const glb = writeGLB(scene, bin);
fs.writeFileSync(OUT_PATH, glb);

// ---- Summary ---------------------------------------------------------------

const getProjectName = (e) => e.split('_').slice(4).join('-').toLowerCase();
const locNodes = scene.nodes.filter((n) => n.name && n.name.includes('loc'));
let locOk = true;
for (const n of locNodes) {
  const proj = projects.find((p) => '0_loc_' + p.type + '_' + p.status + '_' + p.slug === n.name);
  if (!proj || getProjectName(n.name) !== proj.slug) locOk = false;
}

console.log(`terrain : ${U}x${V} = ${U * V} verts, ${tIndex.length} indices`);
console.log(`major   : ${major.vertices} verts, ${major.indices.length / 2} segments`);
console.log(`minor   : ${minor.vertices} verts, ${minor.indices.length / 2} segments`);
console.log(`loc_*   : ${locNodes.length} nodes`);
for (const n of locNodes) console.log(`  ${n.name} -> ${getProjectName(n.name)} @ ${JSON.stringify(n.translation)}`);
console.log(`wrote ${OUT_PATH} (${glb.length} bytes)`);

const tPosMin = [Infinity, Infinity, Infinity];
const tPosMax = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < U * V; i++) {
  for (let k = 0; k < 3; k++) {
    const v = tPos[i * 3 + k];
    if (v < tPosMin[k]) tPosMin[k] = v;
    if (v > tPosMax[k]) tPosMax[k] = v;
  }
}
let hMin = Infinity, hMax = -Infinity;
for (let i = 0; i < tHeight.length; i++) { if (tHeight[i] < hMin) hMin = tHeight[i]; if (tHeight[i] > hMax) hMax = tHeight[i]; }
console.log(`POSITION bbox x[${tPosMin[0].toFixed(2)},${tPosMax[0].toFixed(2)}] y[${tPosMin[1].toFixed(2)},${tPosMax[1].toFixed(2)}] z[${tPosMin[2].toFixed(2)},${tPosMax[2].toFixed(2)}]`);
console.log(`_HEIGHT range [${hMin.toFixed(3)}, ${hMax.toFixed(3)}]`);