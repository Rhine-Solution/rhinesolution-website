import type { MetadataRoute } from "next";

const base = "https://rhinesolution.com";
const locales = ["en", "nl"] as const;
const members = ["ragnarok", "zeromeister"] as const;
const projects = ["rhinesolution", "brain", "macmini", "music"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/music`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  for (const locale of locales) {
    entries.push({ url: `${base}/${locale}`, lastModified: now, changeFrequency: "weekly", priority: 0.9 });
    for (const member of members) {
      entries.push({ url: `${base}/${locale}/team/${member}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
    }
    entries.push({ url: `${base}/${locale}/team`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    entries.push({ url: `${base}/${locale}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
    for (const slug of projects) {
      entries.push({ url: `${base}/${locale}/projects/${slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.5 });
    }
  }

  return entries;
}