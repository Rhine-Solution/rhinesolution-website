export function slugify(name) {
  return name
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugFromStem(stem) {
  const s = slugify(stem);
  return s.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

export function parseFrontmatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(md);
  if (!m) return { data: {}, body: md };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line.trim());
    if (kv) data[kv[1]] = kv[2].replace(/^"|"$/g, "").trim();
  }
  return { data, body: md.slice(m[0].length) };
}

export function parseNewsItem(filename, text) {
  const { data, body } = parseFrontmatter(text);
  return {
    slug: slugFromStem(filename),
    date: String(data.date || "").trim(),
    title: String(data.title || "").trim(),
    excerpt: String(data.excerpt || "").trim(),
    category: String(data.category || "update").trim(),
    body: body.trim(),
  };
}

export function sortNewsDesc(items) {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function rssDate(dateStr) {
  if (!dateStr) return new Date().toUTCString();
  const d = new Date(`${dateStr}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

export function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildFeedXml({ channelTitle, description, language, siteUrl, items }) {
  const itemXml = items
    .map((it) => {
      const url = `${siteUrl}/news/${it.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(it.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid>${escapeXml(url)}</guid>`,
        `      <pubDate>${rssDate(it.date)}</pubDate>`,
        `      <description>${escapeXml(it.excerpt)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(channelTitle)}</title>`,
    `    <link>${escapeXml(siteUrl)}/news</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>${escapeXml(language)}</language>`,
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    itemXml,
    "  </channel>",
    "</rss>",
  ].join("\n");
}