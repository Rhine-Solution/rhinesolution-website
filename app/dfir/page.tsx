import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getContent, defaultLocale } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";

export const metadata: Metadata = {
  title: "DFIR — Digital Forensics Cases",
  description:
    "Digital forensics case studies from Rhine Solution: examinations of media, devices and infrastructure.",
};

const cases = [
  {
    ref: "LAB041",
    slug: "lab041",
    title: "Oude MP3-speler",
    date: "02-09-2026",
    classification: "Vertrouwelijk",
    summary:
      "Forensic examination of an old MP3 player in a suspected copyright-infringement case. Traced illegally downloaded music via ID3 metadata, slack space and carved files from unallocated space.",
    tags: ["File carving", "ID3 metadata", "Slack space"],
  },
];

export default function DfirIndexPage() {
  const content = getContent(defaultLocale);
  return (
    <>
      <Nav locale="en" brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <header className="page-head">
          <p className="section-eyebrow">ZeroMeister · Digital Forensics</p>
          <h1>DFIR Cases</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>
            Digital Forensics &amp; Incident Response — selected examinations, documented as court-ready reports.
          </p>
        </header>
        <div className="grid" style={{ marginTop: "var(--space-5)" }}>
          {cases.map((c) => (
            <Link
              key={c.slug}
              href={`/dfir/${c.slug}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <p className="section-eyebrow" style={{ marginBottom: "var(--space-2)" }}>{c.ref}</p>
              <h2>{c.title}</h2>
              <p>{c.summary}</p>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 0 }}>
                {c.date} · {c.classification}
              </p>
              <p style={{ color: "var(--color-blue-soft)", fontSize: "0.8rem", marginTop: "var(--space-2)", marginBottom: 0 }}>
                {c.tags.join(" · ")}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <Footer locale="en" brand={content.brand.name} tagline={content.footer_columns.brand_tagline} navLabels={content.nav} footerColumns={content.footer_columns} socials={getCompanySocials(content)} socialHeading={content.footer.social_heading} />
    </>
  );
}
