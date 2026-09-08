// Re-serialize a Nuxt-indexed payload array, emitting only the entries that are
// reachable from the root (index 0) plus, transitively, anything those reference.
// Unreachable (orphaned) entries are garbage-collected: they simply vanish.
//
// Emission mirrors the client revive() walker's index semantics exactly:
//   - memoized by old index (each old index emitted once)
//   - primitives deduped by `typeof:value` so equal strings/numbers share an index
//   - wrapped-type arrays (["ShallowReactive",2] etc.) vs plain index arrays are
//     distinguished by whether element 0 is a string
//   - objects emitted once per old index, children re-pointed to new indices
//
// `options`:
//   removed  -> Set of old indices to skip when emitting a plain index array
//   sourceMapReplacer -> (wrapperIdx) => plainObj | null; when it returns a
//     plain JS object for an object node carrying a `sourceMap` field, that
//     sourceMap is replaced with the freshly built object instead of being
//     re-pointed at the old one.

function reserializePayload(pp, options = {}) {
  const removed = options.removed || new Set();
  const sourceMapReplacer = options.sourceMapReplacer || null;

  const memo = new Map(); // old payload index -> new payload index
  const primitives = new Map(); // typeof:value -> new index
  const out = [];
  const alloc = v => { out.push(v); return out.length - 1; };

  // Emit a freshly built (plain JS) sourceMap object as a normal payload node.
  function emitObject(obj) {
    const i = alloc(null);
    const o = {};
    for (const k in obj) o[k] = emitValue(obj[k]);
    out[i] = o;
    return i;
  }
  function emitValue(v) {
    if (v === null) return alloc(null);
    if (Array.isArray(v)) {
      const i = alloc(null);
      const arr = [];
      for (const c of v) arr.push(emitValue(c));
      out[i] = arr;
      return i;
    }
    if (typeof v === 'object') return emitObject(v);
    const key = typeof v + ':' + String(v);
    if (primitives.has(key)) return primitives.get(key);
    const i = alloc(v);
    primitives.set(key, i);
    return i;
  }

  function emit(idx) {
    if (memo.has(idx)) return memo.get(idx);
    const node = pp[idx];

    if (node === null) {
      const i = alloc(null);
      memo.set(idx, i);
      return i;
    }

    if (typeof node !== 'object') {
      const key = typeof node + ':' + String(node);
      if (primitives.has(key)) {
        memo.set(idx, primitives.get(key));
        return primitives.get(key);
      }
      const i = alloc(node);
      primitives.set(key, i);
      memo.set(idx, i);
      return i;
    }

    if (Array.isArray(node)) {
      const i = alloc(null);
      memo.set(idx, i);
      if (node.length && typeof node[0] === 'string') {
        // wrapped type array, e.g. ["ShallowReactive", 2]
        const arr = [node[0]];
        for (let k = 1; k < node.length; k++) arr.push(emit(node[k]));
        out[i] = arr;
      } else {
        // plain index array; drop removed indices
        const arr = [];
        for (const c of node) {
          if (removed.has(c)) continue;
          arr.push(emit(c));
        }
        out[i] = arr;
      }
      return i;
    }

    // plain object whose values are indices
    const i = alloc(null);
    memo.set(idx, i);
    const o = {};
    for (const k in node) {
      if (k === 'sourceMap' && sourceMapReplacer) {
        const repl = sourceMapReplacer(idx);
        if (repl) { o.sourceMap = emitObject(repl); continue; }
      }
      o[k] = emit(node[k]);
    }
    out[i] = o;
    return i;
  }

  emit(0);
  return out;
}

module.exports = { reserializePayload };