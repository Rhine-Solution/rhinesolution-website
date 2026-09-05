import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getContent, getMembers } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/team", {
    title: c.team.title,
    description: c.team.subtitle,
  });
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const t = content.team;
  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="team" />
      <main id="main" className="container page">
        <header className="page-head">
          <p className="section-eyebrow">{t.title}</p>
          <h1>{t.subtitle}</h1>
        </header>
        <div className="grid" style={{ marginTop: "var(--space-5)" }}>
          {getMembers(content).map((m) => (
            <Link
              key={m.slug}
              href={`/${locale}/team/${m.slug}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <h2>{m.name}</h2>
              <p style={{ color: "var(--color-blue-soft)" }}>{m.role}</p>
              <p>{m.tagline}</p>
            </Link>
          ))}
        </div>
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