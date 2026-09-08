// Netherlands district-anchor GLB generator.
//
// Replaces the original Mumbai webgl/models/map-districts.glb (4 `dist_*`
// nodes named after Mumbai districts) with 4 empty anchor nodes for the NL
// districts. The site loader (bundle `buildMapDistricts`) traverses
// map-districts.glb, takes any node whose name starts with `dist`, extracts
// the district key via `Z1e(name) = name.split("_")[1]`, and creates a
// district row bound to `ev[key]` at the node's translation. So each node
// here MUST be named `dist_<key>` with `<key>` matching an `ev` key exactly:
//
//   dist_west    -> ev.west    (uniform uWesternMix drives the west glow)
//   dist_south   -> ev.south   (uSouthMix)
//   dist_central -> ev.central (uCentralMix)
//   dist_north   -> ev.north   (the "thane" uniform uThaneMix carries north —
//                               see the cross-task wiring note in nl-map-data.js)
//
// There is no "thane" district in NL data; the shader's 4th channel (the
// `vThaneCentralSouth.x` uniform `uThaneMix`) is repurposed to carry the
// NORTH district. The gradient attributes written by Task 3 already encode
// this mapping, so no shader change is needed — this file only has to place
// the anchors at the NL district centroids.
//
// Each node is an empty anchor (no mesh) at `[centroid.x, 4, centroid.z]`,
// where the centroid is the mean of the district's `cityCoords` (world
// space), y fixed at 4 to match the original Mumbai anchors' height band.

'use strict';

const fs = require('fs');
const path = require('path');

const MAP_DATA = require('./nl-map-data.js');
const { writeGLB, meshNode } = require('./glb-writer.js');

const OUT_PATH = path.resolve(__dirname, '..', 'webgl', 'models', 'map-districts.glb');

const { districts, cityCoords } = MAP_DATA;

// District centroids (world space): mean of each district's city anchors.
const centroids = {};
for (const key of Object.keys(districts)) {
  let x = 0, z = 0;
  for (const c of districts[key].cities) { x += cityCoords[c][0]; z += cityCoords[c][2]; }
  centroids[key] = { x: x / districts[key].cities.length, z: z / districts[key].cities.length };
}

// Anchor height above the terrain plane, matching the original anchors' band.
const ANCHOR_Y = 4;

const scene = {
  asset: { version: '2.0', generator: 'nl-districts.js' },
  scene: 0,
  scenes: [{ name: 'Scene', nodes: [] }],
  nodes: [],
};

for (const key of Object.keys(districts)) {
  scene.nodes.push(meshNode('dist_' + key, undefined, [centroids[key].x, ANCHOR_Y, centroids[key].z]));
}

scene.scenes[0].nodes = scene.nodes.map((_, i) => i);

const glb = writeGLB(scene, null);
fs.writeFileSync(OUT_PATH, glb);

console.log('districts: ' + scene.nodes.length + ' nodes');
for (const n of scene.nodes) console.log('  ' + n.name + ' -> ' + JSON.stringify(n.translation));
console.log('wrote ' + OUT_PATH + ' (' + glb.length + ' bytes)');
