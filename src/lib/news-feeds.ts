export type NewsFeed = { source: string; url: string; category: string };

export const NEWS_FEEDS: NewsFeed[] = [
  { source: "Hacker News", url: "https://news.ycombinator.com/rss", category: "Community" },
  { source: "Next.js Blog", url: "https://nextjs.org/feed.xml", category: "Framework" },
  { source: "MDN Blog", url: "https://developer.mozilla.org/en-US/blog/rss.xml", category: "Web platform" },
  { source: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/", category: "Design" },
  { source: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", category: "AI" },
  { source: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", category: "AI" },
  { source: "JavaScript Weekly", url: "https://javascriptweekly.com/rss", category: "Programming" },
  { source: "Google Developers Blog", url: "https://developers.googleblog.com/feeds/posts/default", category: "Programming" },
];