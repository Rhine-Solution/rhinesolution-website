import test from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter, slugify, slugFromStem, parseNewsItem, sortNewsDesc, rssDate, escapeXml, buildFeedXml } from "./news-core.mjs";

test("slugify lowercases and hyphenates", () => {
  assert.equal(slugify("2026-08-01-Bilingual Site"), "2026-08-01-bilingual-site");
});

test("slugFromStem strips the leading date", () => {
  assert.equal(slugFromStem("2026-08-01-bilingual-site-structure"), "bilingual-site-structure");
  assert.equal(slugFromStem("no-date-here"), "no-date-here");
});

test("parseFrontmatter extracts key/values and body", () => {
  const md = "---\ndate: 2026-08-01\ntitle: Hello World\nexcerpt: Short\nexcerpt2: \"Quoted value\"\n---\n\nBody text here.";
  const { data, body } = parseFrontmatter(md);
  assert.equal(data.date, "2026-08-01");
  assert.equal(data.title, "Hello World");
  assert.equal(data.excerpt2, "Quoted value");
  assert.equal(body, "\nBody text here.");
});

test("parseNewsItem maps filename + frontmatter to a NewsItem", () => {
  const md = "---\ndate: 2026-08-01\ntitle: Bilingual site structure\nexcerpt: The site moved to locale routing.\ncategory: feature\n---\n\nFull body markdown.";
  const item = parseNewsItem("2026-08-01-bilingual-site-structure.md", md);
  assert.equal(item.slug, "bilingual-site-structure");
  assert.equal(item.date, "2026-08-01");
  assert.equal(item.title, "Bilingual site structure");
  assert.equal(item.excerpt, "The site moved to locale routing.");
  assert.equal(item.category, "feature");
  assert.equal(item.body, "Full body markdown.");
});

test("sortNewsDesc sorts newest first", () => {
  const items = [
    { date: "2026-07-01", title: "old" },
    { date: "2026-08-20", title: "new" },
    { date: "2026-08-01", title: "mid" },
  ];
  assert.deepEqual(sortNewsDesc(items).map((i) => i.title), ["new", "mid", "old"]);
});

test("rssDate formats YYYY-MM-DD as RFC 2822", () => {
  assert.equal(rssDate("2026-08-01"), new Date("2026-08-01T00:00:00Z").toUTCString());
  assert.ok(Number.isFinite(Date.parse(rssDate(""))));
});

test("escapeXml escapes XML specials", () => {
  assert.equal(escapeXml(`a & b < c > "d" 'e'`), "a &amp; b &lt; c &gt; &quot;d&quot; &apos;e&apos;");
});

test("buildFeedXml produces a valid RSS envelope", () => {
  const xml = buildFeedXml({
    channelTitle: "News & updates",
    description: "What's new.",
    language: "en",
    siteUrl: "https://rhinesolution.com/en",
    items: [{ slug: "hello-world", title: "Hello & goodbye", date: "2026-08-01", excerpt: "A story <with> tags" }],
  });
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<title>News &amp; updates<\/title>/);
  assert.match(xml, /<link>https:\/\/rhinesolution\.com\/en\/news\/hello-world<\/link>/);
  assert.match(xml, /<description>A story &lt;with&gt; tags<\/description>/);
  assert.match(xml, /<pubDate>/);
  assert.ok(!xml.includes("<item>Hello"));
});