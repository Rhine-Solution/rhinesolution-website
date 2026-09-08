// Rebrand the news payload: keep all articles but strip the hubtown press
// branding. The two leftover hubtown articles (whose resolved source title is
// a Times of India / ET Now / Gudi Padwa string) have their `source` field
// rewritten to a null primitive so the press strings disappear from the
// serialized payload, while the articles themselves (including the EN variants
// of "Bilingual site structure" and "Music Trends Local is live") stay in the
// list.
//
// The news payload is a Nuxt-indexed array (see inject-project-detail.js's
// revive() for the walker). This module:
//   1. Revives the payload to find the offending articles.
//   2. Rewrites each offending article's raw `source` field to a null
//      primitive index.
//   3. Re-serializes the whole payload from the raw indexed array with fresh
//      indices, with NO pruning, rebuilding the news sourceMap (paths +
//      mappings) so it stays consistent with all articles — a `source`
//      path/mapping is emitted only for articles that still carry a source.
//
// Runs AFTER injectProjectDetails/rebrandProjects in the merge pipeline.

const fs = require('fs');
const path = require('path');
const { revive } = require('./inject-project-detail.js');

// Any string carrying hubtown press branding marks its article as a leftover.
const HUBTOWN_RE = /Times of India|ET Now|Gudi Padwa/i;

function isHubtownArticle(article) {
  if (!article || typeof article !== 'object') return false;
  const title = article.title;
  const srcTitle = article.source && article.source.title;
  return (typeof title === 'string' && HUBTOWN_RE.test(title)) ||
         (typeof srcTitle === 'string' && HUBTOWN_RE.test(srcTitle));
}

// Extract the Sanity _key for each article position, in array order, from the
// news sourceMap paths. paths look like:
//   "$['articles'][?(@._key=='<key>')]['title']"
function articleKeysFromPaths(paths) {
  const keys = [];
  let cur = null;
  for (const p of paths) {
    const m = /_key=='([^']+)'/.exec(p);
    if (!m) continue;
    if (m[1] !== cur) {
      keys.push(m[1]);
      cur = m[1];
    }
  }
  return keys;
}

// Field -> path segment for a news article object (mirrors the original
// sourceMap paths; imageUrl maps to the nested asset ref path).
const FIELD_PATH = {
  imageUrl: "['image']['asset']['_ref']",
  link: "['link']",
  publishedDate: "['publishedDate']",
  source: "['source']",
  title: "['title']",
};

const ARTICLE_FIELD_ORDER = ['imageUrl', 'link', 'publishedDate', 'source', 'title'];
const PAGE_FIELDS = ['metaDescription', 'metaTitle', 'title'];

function rebuildNewsSourceMap(survivingArticles, articleKeys) {
  const documents = [{ _id: 'news', _type: 'news' }];
  const paths = [];
  const mappings = {};

  survivingArticles.forEach((article, i) => {
    const key = articleKeys[i];
    for (const field of ARTICLE_FIELD_ORDER) {
      // Only emit a path for fields the article actually has; `source` is
      // skipped when the article has no source object.
      if (field === 'source' && !article.source) continue;
      if (article[field] === undefined) continue;
      const pathStr = `$['articles'][?(@._key=='${key}')]${FIELD_PATH[field]}`;
      const pathIdx = paths.length;
      paths.push(pathStr);
      mappings[`$['articles'][${i}]['${field}']`] = {
        source: { document: 0, path: pathIdx, type: 'documentValue' },
        type: 'value',
      };
    }
  });

  for (const field of PAGE_FIELDS) {
    const pathIdx = paths.length;
    paths.push(`$['${field}']`);
    mappings[`$['${field}']`] = {
      source: { document: 0, path: pathIdx, type: 'documentValue' },
      type: 'value',
    };
  }

  return { documents, paths, mappings };
}

// Re-serialize the raw indexed payload with fresh indices, pruning the given
// article object indices from every array that references them and swapping
// the news wrapper's sourceMap for the freshly built one.
function reserialize(pp, removedArticleIdxs, newNewsSourceMap) {
  const memo = new Map(); // old payload index -> new payload index
  const primitives = new Map(); // typeof:value -> new index
  const out = [];
  const alloc = v => { out.push(v); return out.length - 1; };

  // Plain wrapper reference cache used to rebuild the news sourceMap in place.
  function emit(idx) {
    if (memo.has(idx)) return memo.get(idx);
    const node = pp[idx];

    if (node === null) {
      const i = alloc(null);
      memo.set(idx, i);
      return i;
    }

    if (typeof node !== 'object') {
      // primitive: dedup by value so equal strings/numbers share an index
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
        // plain index array; prune removed articles
        const arr = [];
        for (const c of node) {
          if (removedArticleIdxs.has(c)) continue;
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
      if (k === 'sourceMap' && node.data != null && isNewsData(pp, node.data)) {
        // replace the news wrapper's sourceMap with the rebuilt one
        o.sourceMap = emitObject(newNewsSourceMap);
      } else {
        o[k] = emit(node[k]);
      }
    }
    out[i] = o;
    return i;
  }

  // Emit a freshly built (plain JS) sourceMap object as a normal payload node.
  function emitObject(obj) {
    const i = alloc(null);
    const o = {};
    for (const k in obj) {
      o[k] = emitValue(obj[k]);
    }
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
    // primitive
    const key = typeof v + ':' + String(v);
    if (primitives.has(key)) return primitives.get(key);
    const i = alloc(v);
    primitives.set(key, i);
    return i;
  }

  // Does the payload node at `dataIdx` resolve (one level) to an object that
  // carries an `articles` array? That marks the news data object.
  function isNewsData(ppArr, dataIdx) {
    const data = ppArr[dataIdx];
    if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
    return data.articles != null;
  }

  const rootIdx = emit(0);
  return out;
}

function rebrandNews(mergedRoot, log) {
  const payloadPath = path.join(mergedRoot, 'news', '_payloadc9a0.json');
  if (!fs.existsSync(payloadPath)) {
    if (log) console.log('  rebrand-news: SKIP (missing news payload)');
    return { nulled: 0 };
  }

  const pp = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  const revived = revive(pp, { ShallowReactive: v => ({ ...v }) });

  // Locate the news data object (the wrapper whose data has `articles`).
  const dataMap = revived.data;
  let newsWrapper = null;
  let newsData = null;
  let newsSourceMap = null;
  for (const k in dataMap) {
    const w = dataMap[k];
    if (w && w.data && Array.isArray(w.data.articles)) {
      newsWrapper = w;
      newsData = w.data;
      newsSourceMap = w.sourceMap;
      break;
    }
  }
  if (!newsData) {
    if (log) console.log('  rebrand-news: SKIP (news list not in payload)');
    return { nulled: 0 };
  }

  // Original articles (raw indices) and which carry hubtown press branding.
  const origArticles = newsData.articles;
  const nulledPositions = [];
  origArticles.forEach((a, i) => {
    if (isHubtownArticle(a)) nulledPositions.push(i);
  });
  if (!nulledPositions.length) {
    if (log) console.log('  rebrand-news: no hubtown source attributions to null');
    return { nulled: 0 };
  }

  // Rewrite the RAW `source` field of each offending article to a null
  // primitive index, so the hubtown press strings are dropped from the
  // serialized payload (their source objects become unreachable).
  const articlesRawIdx = findArticlesRawIdx(pp);
  const nullPrimitiveIdx = findNullPrimitiveIdx(pp);
  for (const pos of nulledPositions) {
    const rawArticle = pp[pp[articlesRawIdx][pos]];
    if (rawArticle && typeof rawArticle === 'object' && !Array.isArray(rawArticle) &&
        typeof rawArticle.source === 'number') {
      rawArticle.source = nullPrimitiveIdx;
    }
  }

  // All articles survive. Null the source on the revived copies so the
  // sourceMap rebuild skips a `source` path/mapping for them.
  const surviving = origArticles.map(a => ({ ...a }));
  for (const pos of nulledPositions) surviving[pos].source = null;
  const survivingKeys = articleKeysFromPaths(newsSourceMap && newsSourceMap.paths || []);
  const newSourceMap = rebuildNewsSourceMap(surviving, survivingKeys);

  const newPp = reserialize(pp, new Set(), newSourceMap);
  fs.writeFileSync(payloadPath, JSON.stringify(newPp), 'utf8');
  if (log) console.log('  rebrand-news: nulled', nulledPositions.length, 'hubtown source attribution(s)');
  return { nulled: nulledPositions.length };
}

// Find the raw payload index of a null primitive, appending one if needed.
function findNullPrimitiveIdx(pp) {
  for (let i = 0; i < pp.length; i++) {
    if (pp[i] === null) return i;
  }
  pp.push(null);
  return pp.length - 1;
}

// Find the raw payload index of the `articles` array by locating the raw data
// object that carries an `articles` field (a numeric index into the payload).
function findArticlesRawIdx(pp) {
  for (let i = 0; i < pp.length; i++) {
    const n = pp[i];
    if (n && typeof n === 'object' && !Array.isArray(n) &&
        typeof n.articles === 'number') {
      return n.articles;
    }
  }
  throw new Error('rebrand-news: could not locate raw articles array');
}

module.exports = { rebrandNews };