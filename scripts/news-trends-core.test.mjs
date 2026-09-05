import test from "node:test";
import assert from "node:assert/strict";
import { parseRss, pickTop, excerptFrom, truncate } from "./news-trends-core.mjs";

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>Test</title>
  <item><title>Third item</title><link>https://example.com/3</link><pubDate>Mon, 01 Sep 2026 00:00:00 GMT</pubDate><description>Plain text summary &amp; more.</description></item>
  <item><title>First item</title><link>https://example.com/1</link><pubDate>Fri, 04 Sep 2026 00:00:00 GMT</pubDate><description><![CDATA[<p>Hello <strong>world</strong>, this is a longer excerpt with <a href="x">links</a>.</p>]]></description></item>
  <item><title>Second item</title><link>https://example.com/2</link><pubDate>Wed, 02 Sep 2026 00:00:00 GMT</pubDate><description><![CDATA[<a href="https://news.ycombinator.com/item?id=1">Comments</a>]]></description></item>
</channel></rss>`;

const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Test</title>
  <link href="https://example.com/atom" rel="self" type="application/rss+xml"/>
  <entry><title>Atom newest</title><link href="https://example.com/a1"/><updated>2026-09-04T00:00:00.000Z</updated></entry>
  <entry><title>Atom older</title><link href="https://example.com/a2"/><updated>2026-09-02T00:00:00.000Z</updated></entry>
</feed>`;

test("parseRss extracts title/link/date and skips empty items", () => {
  const items = parseRss(rss);
  assert.equal(items.length, 3);
  assert.equal(items[0].title, "Third item");
  assert.equal(items[0].link, "https://example.com/3");
  assert.equal(items[0].date, "Mon, 01 Sep 2026 00:00:00 GMT");
});

test("parseRss extracts clean HTML-free excerpts", () => {
  const items = parseRss(rss);
  assert.equal(items[1].excerpt, "Hello world, this is a longer excerpt with links.");
  assert.equal(items[0].excerpt, "Plain text summary & more.");
  assert.equal(items[2].excerpt, "");
});

test("excerptFrom strips tags and truncates with ellipsis", () => {
  assert.equal(excerptFrom("<p><b>Hi</b> there</p>"), "Hi there");
  const long = "a ".repeat(200);
  const out = excerptFrom(long);
  assert.ok(out.length <= 180 + 1);
  assert.ok(out.endsWith("…"));
});

test("truncate keeps short text and cuts long text on a word boundary", () => {
  assert.equal(truncate("short", 180), "short");
  assert.equal(truncate("one two three four", 8), "one two…");
});

test("pickTop carries the excerpt through", () => {
  const items = [
    { title: "A story", link: "l", date: "2026-09-04T00:00:00Z", source: "X", excerpt: "Some detail." },
  ];
  const top = pickTop(items);
  assert.equal(top[0].excerpt, "Some detail.");
});

test("parseRss handles Atom feeds", () => {
  const items = parseRss(atom);
  assert.equal(items.length, 2);
  assert.equal(items[0].title, "Atom newest");
  assert.equal(items[0].link, "https://example.com/a1");
});

test("pickTop sorts by date, dedupes, and caps per source", () => {
  const items = [
    { title: "HN b", link: "h1", date: "2026-09-04T00:00:00Z", source: "Hacker News" },
    { title: "HN a", link: "h2", date: "2026-09-03T00:00:00Z", source: "Hacker News" },
    { title: "HN c", link: "h3", date: "2026-09-02T00:00:00Z", source: "Hacker News" },
    { title: "Next latest", link: "n1", date: "2026-09-04T10:00:00Z", source: "Next.js Blog" },
    { title: "MDN thing", link: "m1", date: "2026-09-01T00:00:00Z", source: "MDN Blog" },
  ];
  const top = pickTop(items, { limit: 4, maxPerSource: 2 });
  assert.deepEqual(top.map((t) => t.title), ["Next latest", "HN b", "HN a", "MDN thing"]);
});

test("pickTop dedupes identical titles", () => {
  const items = [
    { title: "Same story", link: "x", date: "2026-09-04T00:00:00Z", source: "A" },
    { title: "Same story", link: "y", date: "2026-09-04T01:00:00Z", source: "B" },
  ];
  assert.equal(pickTop(items).length, 1);
});

test("pickTop returns fewer when there is not enough variety", () => {
  const items = [
    { title: "Only one", link: "z", date: "2026-09-04T00:00:00Z", source: "A" },
  ];
  const top = pickTop(items);
  assert.equal(top.length, 1);
});