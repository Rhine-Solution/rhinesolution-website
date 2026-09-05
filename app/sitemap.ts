import type { MetadataRoute } from "next";
import { getBrainManifest } from "@/lib/brain";

const base = "https://rhinesolution.com";
const locales = ["en", "nl", "de", "fr", "es", "it", "zh"] as const;
const members = ["ragnarok", "zeromeister"] as const;
const projects = ["rhinesolution", "macmini", "music"] as const;
const localePaths = [
  "/team",
  "/projects",
  "/about",
  "/news",
  "/contact",
  "/privacy",
  "/colophon",
  "/dfir/cybercrime-report",
];

function languages(path: string) {
  const norm = path.replace(/\/+$/, "");
  return {
    "x-default": `${base}/en${norm}`,
    en: `${base}/en${norm}`,
    nl: `${base}/nl${norm}`,
    de: `${base}/de${norm}`,
    fr: `${base}/fr${norm}`,
    es: `${base}/es${norm}`,
    it: `${base}/it${norm}`,
    zh: `${base}/zh${norm}`,
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
    entries.push({
      url: `${base}/${locale}/projects/brain`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: languages("/projects/brain") },
    });
    for (const note of Object.values(getBrainManifest().notes)) {
      entries.push({
        url: `${base}/${locale}/projects/brain/${note.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: { languages: languages(`/projects/brain/${note.slug}`) },
      });
    }
  }

  return entries;
}
