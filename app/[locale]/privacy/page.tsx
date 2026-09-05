import { getContent } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ClosingCta from "@/components/ClosingCta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/privacy", {
    title: c.privacy.title,
    description: c.privacy.intro.slice(0, 160),
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const p = content.privacy;
  const lastUpdated = new Date().toISOString().slice(0, 10);

  const sections = [
    p.who_we_are,
    p.what_we_collect,
    p.why_we_collect,
    p.who_we_share_with,
    p.how_long,
    p.your_rights,
    p.changes,
  ];

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="about" />
      <main id="main" className="container page legal-page">
        <header className="legal-page-head">
          <p className="legal-page-eyebrow">{p.eyebrow}</p>
          <h1 className="legal-page-title">{p.title}</h1>
          <p className="legal-page-intro">{p.intro}</p>
          <p className="legal-page-updated">
            <span>{p.last_updated}:</span> <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>
        </header>

        <div className="legal-page-body">
          {sections.map((s, i) => (
            <section key={i} className="legal-page-section">
              <h2>
                <span className="legal-page-num">{String(i + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              <p>{s.body}</p>
            </section>
          ))}

          <section className="legal-page-section legal-page-contact">
            <h2>
              <span className="legal-page-num">{String(sections.length + 1).padStart(2, "0")}</span>
              {p.contact_label}
            </h2>
            <p>{p.contact_intro}</p>
            <ul className="legal-page-emails">
              <li>
                <a href="mailto:privacy@rhinesolution.com">privacy@rhinesolution.com</a>
              </li>
              <li>
                <a href="mailto:info@rhinesolution.com">info@rhinesolution.com</a>
              </li>
            </ul>
            <h3 className="legal-page-subhead">{p.complaint_label}</h3>
            <p>{p.complaint_body}</p>
            <p>
              <a
                href="https://autoriteitpersoonsgegevens.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-page-link"
              >
                autoriteitpersoonsgegevens.nl â†’
              </a>
            </p>
          </section>
        </div>
      </main>

      <ClosingCta locale={locale} labels={content.home.closing_cta} />

      <Footer
        locale={locale}
        brand={content.brand.name}
        tagline={content.footer_columns.brand_tagline}
        navLabels={content.nav}
        footerColumns={content.footer_columns}
        socials={[]}
      />
    </>
  );
}
