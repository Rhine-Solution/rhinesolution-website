// Rebrand the news payload: keep all articles but strip the original press
// branding. Any article whose resolved source title is a Times of India / ET
// Now / Gudi Padwa string has its `source` field rewritten to a null primitive
// so the press strings disappear from the serialized payload, while the
// articles themselves (including the EN variants of "Bilingual site structure"
// and "Music Trends Local is live") stay in the list.
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
const { reserializePayload } = require('./payload-reserialize.js');

// Any string carrying the original press branding marks its article as a leftover.
const LEGACY_PRESS_RE = /Times of India|ET Now|Gudi Padwa/i;

function isLegacyArticle(article) {
  if (!article || typeof article !== 'object') return false;
  const title = article.title;
  const srcTitle = article.source && article.source.title;
  return (typeof title === 'string' && LEGACY_PRESS_RE.test(title)) ||
         (typeof srcTitle === 'string' && LEGACY_PRESS_RE.test(srcTitle));
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

// Does the payload node at `dataIdx` resolve (one level) to an object that
// carries an `articles` array? That marks the news data object.
function isNewsData(ppArr, dataIdx) {
  const data = ppArr[dataIdx];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  return data.articles != null;
}

// Re-serialize the raw indexed payload with fresh indices (see the shared
// payload-reserialize walker): no pruning, but the news wrapper's sourceMap is
// swapped for the freshly built one so dropped source objects stay unreachable.
function reserialize(pp, removedArticleIdxs, newNewsSourceMap) {
  return reserializePayload(pp, {
    removed: removedArticleIdxs,
    sourceMapReplacer: (idx) => {
      const node = pp[idx];
      if (node && node.data != null && isNewsData(pp, node.data)) {
        return newNewsSourceMap;
      }
      return null;
    },
  });
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

  // Original articles (raw indices) and which carry the press branding.
  const origArticles = newsData.articles;
  const nulledPositions = [];
  origArticles.forEach((a, i) => {
    if (isLegacyArticle(a)) nulledPositions.push(i);
  });
  if (!nulledPositions.length) {
    if (log) console.log('  rebrand-news: no press source attributions to null');
    return { nulled: 0 };
  }

  // Rewrite the RAW `source` field of each offending article to a null
  // primitive index, so the press strings are dropped from the
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
  if (log) console.log('  rebrand-news: nulled', nulledPositions.length, 'press source attribution(s)');
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