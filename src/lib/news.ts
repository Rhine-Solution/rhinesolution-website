import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseNewsItem, sortNewsDesc, buildFeedXml } from "../../scripts/news-core.mjs";

export type NewsItem = {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  category: string;
  body: string;
  dateLabel: string;
};

export function formatNewsDate(date: string, locale: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

// Simple in-memory cache: news files are read from disk on every call
// otherwise. News changes infrequently; a short TTL keeps it fresh while
// avoiding repeated reads during page renders / ISR revalidation.
const cache = new Map<string, { at: number; items: NewsItem[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function getNews(locale: string): NewsItem[] {
  const cached = cache.get(locale);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.items;

  const dir = join(process.cwd(), "content", "news", locale);
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  const items = files.map((f) => {
    const base = parseNewsItem(f, readFileSync(join(dir, f), "utf8"));
    return { ...base, dateLabel: formatNewsDate(base.date, locale) };
  });
  const sorted = sortNewsDesc(items);
  cache.set(locale, { at: Date.now(), items: sorted });
  return sorted;
}

export function getNewsItem(locale: string, slug: string): NewsItem | undefined {
  return getNews(locale).find((n) => n.slug === slug);
}

export function getNewsFeedXml(
  locale: string,
  opts: { title: string; description: string }
): string {
  const base = `https://rhinesolution.com/${locale}`;
  const items = getNews(locale).map(({ slug, title, date, excerpt }) => ({ slug, title, date, excerpt }));
  return buildFeedXml({
    channelTitle: opts.title,
    description: opts.description,
    language: locale,
    siteUrl: base,
    items,
  });
}