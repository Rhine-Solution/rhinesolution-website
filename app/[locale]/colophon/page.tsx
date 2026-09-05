import { getContent } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ClosingCta from "@/components/ClosingCta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/colophon", {
    title: c.colophon.title,
    description: c.colophon.intro.slice(0, 160),
  });
}

const SECTIONS = [
  "principles",
  "stack",
  "typefaces",
  "how_we_work",
  "tools",
  "limits",
  "credits",
] as const;

export default async function ColophonPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const c = content.colophon;

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="about" />
      <main id="main" className="container page colophon-page">
        <header className="colophon-page-head">
          <p className="colophon-page-eyebrow">{c.eyebrow}</p>
          <h1 className="colophon-page-title">{c.title}</h1>
          <p className="colophon-page-intro">{c.intro}</p>
        </header>

        <div className="colophon-page-body">
          {SECTIONS.map((key, i) => {
            const section = c.sections[key];
            return (
              <section key={key} className="colophon-page-section">
                <h2 className="colophon-section-heading">
                  <span className="colophon-section-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{section.heading}</span>
                </h2>
                <ul className="colophon-section-list">
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </section>
            );
          })}
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
