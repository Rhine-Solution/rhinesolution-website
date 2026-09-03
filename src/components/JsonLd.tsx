const SITE = "https://rhinesolution.com";

type LdObject = Record<string, unknown>;

/**
 * Renders a JSON-LD structured-data script block for search-engine
 * rich results. Rendered server-side with React's dangerouslySetInnerHTML
 * so the JSON is injected exactly as-is (no escaping that would break it).
 */
export default function JsonLd({ data }: { data: LdObject | LdObject[] }) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/**
 * Organization + WebSite schema for the whole site (root layout).
 * Gives Google authoritative entity info: name, logo, founding,
 * contact points, and the sitewide search-url pattern.
 */
export function siteJsonLd(): LdObject[] {
  const org: LdObject = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: "Rhine Solution",
    url: SITE,
    logo: `${SITE}/favicon.svg`,
    description: "Custom web development, portfolios, and digital experiences.",
    foundingDate: "2024",
    email: "info@rhinesolution.com",
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "info@rhinesolution.com",
        contactType: "customer support",
        availableLanguage: ["English", "Dutch"],
      },
    ],
    sameAs: [],
  };

  const website: LdObject = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: SITE,
    name: "Rhine Solution",
    publisher: { "@id": `${SITE}/#organization` },
    inLanguage: ["en", "nl"],
  };

  return [org, website];
}

/**
 * BreadcrumbList schema for a localized page, e.g.
 * Home > Projects. Pass the trail as [label, url] pairs (root-first).
 */
export function breadcrumbJsonLd(
  locale: string,
  trail: { name: string; path: string }[]
): LdObject {
  const items = trail.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: `${SITE}${c.path}`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
