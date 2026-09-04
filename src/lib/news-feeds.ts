export type NewsFeed = { source: string; url: string };

export const NEWS_FEEDS: NewsFeed[] = [
  { source: "Hacker News", url: "https://news.ycombinator.com/rss" },
  { source: "Next.js Blog", url: "https://nextjs.org/feed.xml" },
  { source: "MDN Blog", url: "https://developer.mozilla.org/en-US/blog/rss.xml" },
  { source: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/" },
];