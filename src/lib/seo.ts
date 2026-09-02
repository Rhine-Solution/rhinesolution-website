import type { Metadata } from "next";

const SITE = "https://rhinesolution.com";

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
  }
): Metadata {
  const normPath = path.replace(/\/+$/, "");
  const url = `${SITE}/${locale}${normPath}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE}/en${normPath}`,
        nl: `${SITE}/nl${normPath}`,
        "x-default": `${SITE}/en${normPath}`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "nl" ? "nl_NL" : "en_US",
      url,
      siteName: "Rhine Solution",
      title: opts.title,
      description: opts.description,
      images: [
        {
          url: "/og-image.svg",
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
      images: ["/og-image.svg"],
    },
  };
}
