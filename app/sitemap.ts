import type { MetadataRoute } from "next";

const base = "https://rhinesolution.com";
const locales = ["en", "nl"] as const;
const members = ["ragnarok", "zeromeister"] as const;
const projects = ["rhinesolution", "brain", "macmini", "music"] as const;
const localePaths = [
  "/team",
  "/projects",
  "/about",
  "/news",
  "/contact",
  "/privacy",
  "/colophon",
];

function languages(path: string) {
  const norm = path.replace(/\/+$/, "");
  return {
    "x-default": `${base}/en${norm}`,
    en: `${base}/en${norm}`,
    nl: `${base}/nl${norm}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0, alternates: { languages: languages("") } },
    { url: `${base}/music`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  for (const locale of locales) {
    entries.push({
      url: `${base}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: { languages: languages("") },
    });
    for (const path of localePaths) {
      entries.push({
        url: `${base}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "/team" || path === "/news" ? "monthly" : "weekly",
        priority: 0.7,
        alternates: { languages: languages(path) },
      });
    }
    for (const member of members) {
      entries.push({
        url: `${base}/${locale}/team/${member}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: languages(`/team/${member}`) },
      });
    }
    for (const slug of projects) {
      entries.push({
        url: `${base}/${locale}/projects/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: { languages: languages(`/projects/${slug}`) },
      });
    }
  }

  return entries;
}
