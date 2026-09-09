// Netherlands map data â€” single source of truth for the NL terrain rebuild.
//
// Exports MAP_DATA, consumed by _build/nl-terrain.js (map.glb generation),
// _build/nl-districts.js (district anchors) and _build/mappings.js (the `ev`
// chrome replacement): the 7 Rhine projects grouped into 4 NL districts, each
// project's world-space cube position, and lonLatToWorld â€” the mapping that
// turns NL lon/lat into the same world-space scale the original Mumbai terrain
// used (terrain bbox roughly x:[-235,345], z:[-395,394], centered near origin).
//
// The `ev` shape mirrors the bundle contract exactly:
//   { west:[{name,district,type,location:[x,y,z],status}], south:[...], ... }
// where `name` is the project slug (the `0_loc_<type>_<status>_<slug>` cube
// node's getProjectName round-trip target) and `location` equals that node's
// translation in map.glb.
//
// Task 3 must build the terrain GLB with the SAME geographic bbox used here
// (pass `bbox` to lonLatToWorld, or rely on its default) so the generated
// terrain lines up with the project locations computed below â€” recomputing a
// slightly different bbox from the GeoJSON would drift cube anchors off the
// terrain and break the Task 5 coords assertion.
//
// Known behavior (accepted for now): `brain` and `rhinesolution` are both
// anchored in Rotterdam, so their cubes share the exact same world position
// ([-49.516, 20, 60.879]) and may overlap/z-fight in the 3D scene. Both
// projects ARE in Rotterdam; this is correct data, not an error.

'use strict';

// World-space extent of the original (Mumbai) terrain, reused verbatim so
// camera framing, district rows and shader distances keep their proportions.
const WORLD_X = [-235, 345];
const WORLD_Z = [-395, 394];

// Cube-anchor height above the terrain plane (terrain y spans ~0..39).
const CUBE_Y = 20;

// Netherlands geographic bounding box (approximate; ~the 12-province extent).
const bbox = { lon: [3.2, 7.2], lat: [50.7, 53.6] };

// Map NL lon/lat into the original map's world space. `box` may override the
// NL bbox (shape { lon:[min,max], lat:[min,max] }). Returns [x, 0, z] on the
// terrain plane; callers needing a cube anchor height use CUBE_Y (see
// cityCoords below).
//
// Z orientation: the original Mumbai map put north at -z (south-mumbai at +z),
// and the site camera renders -z at the TOP of the screen. We mirror that here
// (higher lat -> lower z) so the NL map renders north-up like the original.
function lonLatToWorld(lon, lat, box) {
  const { lon: [lon0, lon1], lat: [lat0, lat1] } = box || bbox;
  const t = (lon - lon0) / (lon1 - lon0);
  const u = (lat - lat0) / (lat1 - lat0);
  const x = WORLD_X[0] + t * (WORLD_X[1] - WORLD_X[0]);
  const z = WORLD_Z[1] - u * (WORLD_Z[1] - WORLD_Z[0]);
  return [Math.round(x * 1000) / 1000, 0, Math.round(z * 1000) / 1000];
}

// Approximate city centres (lon, lat) used to place the 7 project cubes.
const CITY_LONLAT = {
  'Amsterdam': [4.9041, 52.3676],
  'The Hague': [4.3007, 52.0705],
  'Rotterdam': [4.4792, 51.9244],
  'Utrecht': [5.1214, 52.0907],
  'Delft': [4.3571, 51.9962],
  'Groningen': [6.5665, 53.2194],
};

// World-space position of each city's cube anchor: [x, CUBE_Y, z]. This is the
// value Task 3 writes as the loc_* node translation AND the ev `location`.
const cityCoords = {};
for (const city of Object.keys(CITY_LONLAT)) {
  const [x, , z] = lonLatToWorld(CITY_LONLAT[city][0], CITY_LONLAT[city][1]);
  cityCoords[city] = [x, CUBE_Y, z];
}

// The 7 Rhine projects (source of truth: the prior plan's payload â€” slugs,
// types and statuses confirmed against projects/_payloadc9a0.json).
const projects = [
  { slug: 'plan2shift', title: 'Plan2Shift', type: 'web-app', status: 'shipped', city: 'Utrecht', district: 'central' },
  { slug: 'spendtracker', title: 'Spendtracker', type: 'web-app', status: 'shipped', city: 'Amsterdam', district: 'west' },
  { slug: 'brain', title: 'The Brain', type: 'knowledge-base', status: 'shipped', city: 'Rotterdam', district: 'south' },
  { slug: 'music-trends-local', title: 'Music Trends Local', type: 'web-app', status: 'shipped', city: 'The Hague', district: 'west' },
  { slug: 'mac-mini-ai', title: 'Mac Mini AI Infrastructure', type: 'infrastructure', status: 'maintained', city: 'Delft', district: 'south' },
  { slug: 'rhinesolution', title: 'rhinesolution.com', type: 'website', status: 'shipped', city: 'Rotterdam', district: 'south' },
  { slug: 'cybercrime-report', title: 'Cybercrime & Cybersecurity Report', type: 'report', status: 'shipped', city: 'Groningen', district: 'north' },
];

// The 4 NL district rows. `label` is what the district-item row shows; `cities`
// are the cities that belong to the district. Key order (west/south/central/
// north) sets the ev serialization order Task 4 writes into the bundle.
const districts = {
  west: { label: 'West', cities: ['Amsterdam', 'The Hague'] },
  south: { label: 'South', cities: ['Rotterdam', 'Delft'] },
  central: { label: 'Central', cities: ['Utrecht'] },
  north: { label: 'North', cities: ['Groningen'] },
};

// The ev replacement object. Keys are seeded in district order so the compact
// JSON Task 4 serializes lands in the plan's stated west/south/central/north
// order; each district's array keeps the projects in PROJECTS order.
const ev = {};
for (const key of Object.keys(districts)) ev[key] = [];
for (const project of projects) {
  ev[project.district].push({
    name: project.slug,
    district: project.district,
    type: project.type,
    status: project.status,
    location: cityCoords[project.city].slice(),
  });
}

// Placeholder for the per-vertex district-gradient attributes the boundary
// shaders read (assigned from the generated geometry + district centroids by
// Task 3/4). Zero vec3s keep every downstream import safe until then. Channel
// layout mirrors the GLSL slots:
//   _DIST_THANECENTRALSOUTH = vec3 [thaneGrad, centralGrad, southGrad]
//   _DIST_WESTERN           = vec3 [westernGrad, 0, 0]
function gradientAttrs() {
  return { thaneCentralSouth: [0, 0, 0], western: [0, 0, 0] };
}

// Everything downstream needs. `bbox` is the geographic box all cityCoords were
// computed with â€” Task 3's terrain must use it too (see header note).
const MAP_DATA = { districts, projects, cityCoords, ev, gradientAttrs, lonLatToWorld, bbox };

module.exports = MAP_DATA;
