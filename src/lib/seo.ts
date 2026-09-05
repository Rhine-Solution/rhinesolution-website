import type { Metadata } from "next";

const SITE = "https://rhinesolution.com";

const LOCALES = ["en", "nl", "de", "fr", "es", "it", "zh"] as const;

const OG_LOCALE: Record<(typeof LOCALES)[number], string> = {
  en: "en_US",
  nl: "nl_NL",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
  it: "it_IT",
  zh: "zh_CN",
};

/**
 * Returns standard SEO metadata for a localized page.
 * Combines page-specific title + description with OG, Twitter,
 * language alternates, and a canonical URL.
 */
export function buildMetadata(
  locale: string,
  path: string,
  opts: {
    title: string;
    description: string;
    feedUrl?: string;
  }
): Metadata {
  const normPath = path.replace(/\/+$/, "");
  const url = `${SITE}/${locale}${normPath}`;
  const languages: Record<string, string> = { "x-default": `${SITE}/en${normPath}` };
  for (const l of LOCALES) languages[l] = `${SITE}/${l}${normPath}`;

  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      types: opts.feedUrl ? { "application/rss+xml": opts.feedUrl } : undefined,
      languages,
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale as (typeof LOCALES)[number]] ?? "en_US",
      url,
      siteName: "Rhine Solution",
      title: opts.title,
      description: opts.description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Rhine Solution",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: ["/og-image.png"],
    },
  };
}
