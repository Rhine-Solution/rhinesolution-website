import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://rhinesolution.com";
  const now = new Date();
  return [
    { url: `${base}/en`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/nl`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/en/team`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/en/team/ragnarok`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/en/team/zeromeister`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/en/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/en/projects/rhinesolution`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/en/projects/brain`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/en/projects/macmini`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
