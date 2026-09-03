import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StatBlock from "@/components/StatBlock";
import { getContent } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/about", {
    title: c.nav.about,
    description: c.about.statement,
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const s = content.about;

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="about" />
      <main id="main" className="container page">
        <header className="page-head">
          <p className="section-eyebrow">{s.eyebrow}</p>
          <h1>{s.statement}</h1>
        </header>

        <section className="about-story" aria-label={s.statement}>
          {s.story.map((para) => (
            <p key={para}>{para}</p>
          ))}
        </section>

        <section className="stats-band" aria-label={s.stats_label}>
          {s.stats.map((st) => (
            <StatBlock key={st.label} value={st.value} suffix={st.suffix} label={st.label} />
          ))}
        </section>

        <section>
          <h2>{s.values_title}</h2>
          <div className="grid" style={{ marginTop: "var(--space-5)" }}>
            {s.values.map((v) => (
              <article className="card" key={v.title}>
                <h3 className="value-title">{v.title}</h3>
                <p style={{ marginBottom: 0 }}>{v.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-cta">
          <h2>{s.cta_head}</h2>
          <p style={{ color: "var(--color-text-muted)" }}>{s.cta_text}</p>
          <Link href={`/${locale}/projects`} className="btn btn-primary">
            {s.cta_link_label}
          </Link>
        </section>
      </main>
      <Footer
        locale={locale}
        brand={content.brand.name}
        tagline={content.footer_columns.brand_tagline}
        navLabels={content.nav}
        footerColumns={content.footer_columns}
        socials={getCompanySocials(content)}
        socialHeading={content.footer.social_heading}
      />
    </>
  );
}