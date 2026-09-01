import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getContent, getMembers } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return { title: getContent(locale).team.title };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const t = content.team;
  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} themeLabels={content.footer} current="team" />
      <main id="main" className="container page">
        <h1>{t.title}</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{t.subtitle}</p>
        <div className="grid" style={{ marginTop: "var(--space-5)" }}>
          {getMembers(content).map((m) => (
            <Link
              key={m.slug}
              href={`/${locale}/team/${m.slug}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <h2>{m.name}</h2>
              <p style={{ color: "var(--color-accent)" }}>{m.role}</p>
              <p>{m.tagline}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer locale={locale} backLabel={content.nav.back} brand={content.brand.name} tagline={content.brand.tagline} socialHeading={content.footer.social_heading} themeLabels={content.footer} socials={getCompanySocials(content)} />
    </>
  );
}