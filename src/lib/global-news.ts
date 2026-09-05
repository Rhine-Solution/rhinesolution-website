import { NEWS_FEEDS } from "./news-feeds";
import { parseRss } from "../../scripts/news-trends-core.mjs";

export type GlobalNewsItem = {
  slug: string;
  title: string;
  link: string;
  date: string;
  source: string;
  category: string;
  excerpt: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function getGlobalNews(): Promise<GlobalNewsItem[]> {
  const results = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        next: { revalidate: 7200 },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`feed ${feed.url} -> ${res.status}`);
      const xml = await res.text();
      return parseRss(xml).map((p) => ({
        ...p,
        source: feed.source,
        category: feed.category,
      }));
    })
  );

  const items: GlobalNewsItem[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const p of r.value) {
      if (!p.title || !p.link) continue;
      const slug = slugify(p.title);
      const key = slug || p.link;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        slug,
        title: p.title,
        link: p.link,
        date: p.date,
        source: p.source,
        category: p.category,
        excerpt: p.excerpt || "",
      });
    }
  }

  return items.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

export async function getGlobalNewsItem(slug: string): Promise<GlobalNewsItem | undefined> {
  const all = await getGlobalNews();
  return all.find((n) => n.slug === slug);
}

export async function getGlobalNewsPage(page: number, perPage = 10): Promise<{
  items: GlobalNewsItem[];
  total: number;
  pages: number;
}> {
  const all = await getGlobalNews();
  const pages = Math.max(1, Math.ceil(all.length / perPage));
  const current = Math.min(Math.max(1, page), pages);
  const items = all.slice((current - 1) * perPage, current * perPage);
  return { items, total: all.length, pages };
}