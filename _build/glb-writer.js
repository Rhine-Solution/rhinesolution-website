// Minimal glTF 2.0 binary (GLB) writer with no external dependencies.
//
// A GLB file is a 12-byte header followed by two chunks:
//   header  : magic 0x46546C67 ("glTF"), version 2, total length
//   JSON    : chunk type 0x4E4F534A ("JSON"), 4-byte-aligned, space padded
//   BIN     : chunk type 0x004E4942 ("BIN\0"), 4-byte-aligned, zero padded
//
// The writer never lays out buffer bytes for you: you build the glTF root
// JSON (buffers/accessors/bufferViews/nodes/meshes/scenes/asset) and the BIN
// chunk yourself, then package them. The helpers below keep that assembly
// terse and give every mesh/attribute exactly the shape the site shaders
// read (see _build/nl-terrain.js for the mesh-level layout).
//
// Example
//   const scene = {
//     asset: { version: '2.0' },
//     scene: 0,
//     scenes: [{ name: 'Scene', nodes: [] }],
//     nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [],
//   };
//   // ... lay data into a bin Buffer, recording ranges as you go:
//   const bin = Buffer.concat(chunks);                // length % 4 === 0
//   const glb = writeGLB(scene, bin);

'use strict';

const GLB_MAGIC = 0x46546c67; // "glTF"
const GLB_VERSION = 2;
const JSON_CHUNK_TYPE = 0x4e4f534a; // "JSON"
const BIN_CHUNK_TYPE = 0x004e4942;  // "BIN\0"

// Number of padding bytes needed to push `n` up to a 4-byte boundary.
function padLength(n) {
  return (4 - (n & 3)) & 3;
}

// Serialize a complete glTF 2.0 root object plus an optional BIN chunk into a
// single GLB Buffer. `sceneJson` is the glTF JSON document (the exact keys it
// carries are preserved; an `asset` is defaulted in only when missing).
// `binBuffer` may be a Buffer/Uint8Array or null — when empty/absent the BIN
// chunk is omitted entirely (valid GLB, e.g. map-districts.glb).
function writeGLB(sceneJson, binBuffer) {
  if (!sceneJson || typeof sceneJson !== 'object' || Array.isArray(sceneJson)) {
    throw new TypeError('writeGLB: sceneJson must be a glTF root object');
  }
  const root = sceneJson;
  if (!root.asset || typeof root.asset !== 'object') {
    root.asset = { version: '2.0' };
  }

  const jsonData = Buffer.from(JSON.stringify(root), 'utf8');
  const jsonPad = padLength(jsonData.length);

  let bin = null;
  let binPad = 0;
  if (binBuffer && binBuffer.length > 0) {
    bin = Buffer.isBuffer(binBuffer) ? binBuffer : Buffer.from(binBuffer);
    binPad = padLength(bin.length);
  }

  const hasBin = bin !== null;
  const jsonChunkLength = jsonData.length + jsonPad;
  const binChunkLength = hasBin ? bin.length + binPad : 0;
  const totalLength = 12 + 8 + jsonChunkLength + (hasBin ? 8 + binChunkLength : 0);

  const out = Buffer.alloc(totalLength);
  out.writeUInt32LE(GLB_MAGIC, 0);
  out.writeUInt32LE(GLB_VERSION, 4);
  out.writeUInt32LE(totalLength, 8);

  // JSON chunk: header then data padded with 0x20 spaces (per glTF spec).
  out.writeUInt32LE(jsonChunkLength, 12);
  out.writeUInt32LE(JSON_CHUNK_TYPE, 16);
  jsonData.copy(out, 20);
  out.fill(0x20, 20 + jsonData.length, 20 + jsonChunkLength);

  // BIN chunk: header then data padded with 0x00 (Buffer.alloc already zeroed).
  if (hasBin) {
    const binHeader = 20 + jsonChunkLength;
    out.writeUInt32LE(binChunkLength, binHeader);
    out.writeUInt32LE(BIN_CHUNK_TYPE, binHeader + 4);
    bin.copy(out, binHeader + 8);
  }

  return out;
}

// Record a bufferView over the GLB BIN chunk (buffer index 0). Returns its
// index into sceneJson.bufferViews. Caller is responsible for the underlying
// byte layout: `byteOffset` is relative to the start of the BIN chunk and
// must be 4-byte aligned.
function addBufferView(sceneJson, { byteOffset, byteLength, target } = {}) {
  if (!Number.isInteger(byteOffset) || !Number.isInteger(byteLength)) {
    throw new TypeError('addBufferView: byteOffset and byteLength are required integers');
  }
  const views = (sceneJson.bufferViews = sceneJson.bufferViews || []);
  const view = { buffer: 0, byteOffset, byteLength };
  if (Number.isInteger(target)) view.target = target;
  views.push(view);
  return views.length - 1;
}

// Record an accessor over an existing bufferView. Returns its index into
// sceneJson.accessors. `min`/`max` are optional but required by the spec for
// POSITION accessors used by renderers; `normalized` is emitted when truthy
// (required for integer COLOR_0 accessors, which glTF interprets as floats
// otherwise).
function addAccessor(sceneJson, { bufferView, componentType, count, type, min, max, normalized } = {}) {
  if (!Number.isInteger(bufferView) || !Number.isInteger(componentType) || !Number.isInteger(count) || !type) {
    throw new TypeError('addAccessor: bufferView, componentType, count and type are required');
  }
  const accessors = (sceneJson.accessors = sceneJson.accessors || []);
  const accessor = { bufferView, componentType, count, type };
  if (Array.isArray(min)) accessor.min = min;
  if (Array.isArray(max)) accessor.max = max;
  if (normalized) accessor.normalized = true;
  accessors.push(accessor);
  return accessors.length - 1;
}

// Build a node. With a meshIndex this is a drawn mesh instance; without one it
// is an empty anchor node (e.g. dist_* rows). `translation` is optional.
function meshNode(name, meshIndex, translation) {
  const node = { name };
  if (Number.isInteger(meshIndex)) node.mesh = meshIndex;
  if (Array.isArray(translation)) node.translation = translation;
  return node;
}

// Build a glTF primitive: attribute accessor indices, optional indices
// accessor, and a draw mode (0 = triangles / POINTS territory, 1 = LINES).
function primitive(attributes, indicesAccessor, mode) {
  const prim = { attributes };
  if (Number.isInteger(indicesAccessor)) prim.indices = indicesAccessor;
  prim.mode = mode;
  return prim;
}

// Build a named mesh from its primitives.
function mesh(name, primitives) {
  return { name, primitives };
}

module.exports = { writeGLB, addBufferView, addAccessor, meshNode, primitive, mesh };
