import { NEWS_FEEDS } from "./news-feeds";
import { parseRss, pickTop } from "../../scripts/news-trends-core.mjs";

export type TrendItem = { title: string; link: string; date: string; source: string };

export async function getDevTrends(limit = 5): Promise<TrendItem[]> {
  const results = await Promise.allSettled(
    NEWS_FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, { next: { revalidate: 7200 } });
      if (!res.ok) throw new Error(`feed ${feed.url} -> ${res.status}`);
      const xml = await res.text();
      return parseRss(xml).map((p) => ({ ...p, source: feed.source }));
    })
  );
  const items: TrendItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") items.push(...r.value);
  }
  return pickTop(items, { limit, maxPerSource: 2 });
}