import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false });

export function parseRss(xml) {
  const doc = parser.parse(xml);
  const rssItems = doc?.rss?.channel?.item;
  const atomEntries = doc?.feed?.entry;
  const raw = Array.isArray(rssItems) ? rssItems : rssItems ? [rssItems] : [];
  const rawAtom = Array.isArray(atomEntries) ? atomEntries : atomEntries ? [atomEntries] : [];
  const items = [];
  for (const it of raw) {
    items.push({
      title: String(it.title || "").trim(),
      link: String(it.link || "").trim(),
      date: String(it.pubDate || "").trim(),
    });
  }
  for (const it of rawAtom) {
    let link = "";
    if (Array.isArray(it.link)) {
      const self = it.link.find((l) => l?.["@_rel"] === "self");
      const nonSelf = it.link.find((l) => l?.["@_rel"] !== "self");
      link = String((nonSelf ?? self)?.["@_href"] || "").trim();
    } else if (typeof it.link === "object" && it.link) {
      link = String(it.link["@_href"] || "").trim();
    } else {
      link = String(it.link || "").trim();
    }
    items.push({
      title: String(it.title || "").trim(),
      link,
      date: String(it.updated || it.published || "").trim(),
    });
  }
  return items.filter((i) => i.title && i.link);
}

export function pickTop(items, { limit = 5, maxPerSource = 2 } = {}) {
  const seen = new Set();
  const counts = new Map();
  const sorted = [...items]
    .map((it, i) => ({ ...it, _sort: Date.parse(it.date) || i }))
    .sort((a, b) => b._sort - a._sort);
  const out = [];
  for (const it of sorted) {
    const key = it.title.toLowerCase();
    if (seen.has(key)) continue;
    const src = it.source || "unknown";
    if (counts.get(src) >= maxPerSource) continue;
    seen.add(key);
    counts.set(src, (counts.get(src) || 0) + 1);
    out.push({ title: it.title, link: it.link, date: it.date, source: src });
    if (out.length >= limit) break;
  }
  return out;
}