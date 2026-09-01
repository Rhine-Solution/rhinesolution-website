import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getContent, getProjects, getMembers } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const t = content.home;
  const brand = content.brand.name;
  const projects = getProjects(content, ["project_rhinesolution", "project_brain", "project_macmini"]);

  return (
    <>
      <Nav locale={locale} brand={brand} labels={content.nav} themeLabels={content.footer} current="home" />
      <main id="main" className="page">
        <section className="container hero">
          <h1>{t.hero_title}</h1>
          <p>{t.hero_subtitle}</p>
          <div className="ctas">
            <Link href={`/${locale}/team`} className="btn btn-primary">{t.cta_team}</Link>
            <Link href={`/${locale}/projects`} className="btn btn-secondary">{t.cta_projects}</Link>
          </div>
        </section>
        <section className="container" style={{ marginTop: "var(--space-7)" }}>
          <h2>{t.section_projects_title}</h2>
          <p style={{ color: "var(--color-text-muted)" }}>{t.section_projects_text}</p>
          <div className="grid" style={{ marginTop: "var(--space-4)" }}>
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`/${locale}/projects/${p.slug}`}
                className="card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <h3>{p.title}</h3>
                <p style={{ marginBottom: "var(--space-2)" }}>{p.summary}</p>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 0 }}>
                  {p.stack.join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <section className="container" style={{ marginTop: "var(--space-6)" }}>
          <h2>{t.section_team_title}</h2>
          <p style={{ color: "var(--color-text-muted)" }}>{t.section_team_text}</p>
          <div className="grid" style={{ marginTop: "var(--space-4)" }}>
            {getMembers(content).map((m) => (
              <Link
                key={m.slug}
                href={`/${locale}/team/${m.slug}`}
                className="card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <h3>{m.name}</h3>
                <p style={{ color: "var(--color-accent)", marginBottom: "var(--space-2)" }}>{m.role}</p>
                <p style={{ marginBottom: 0 }}>{m.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer locale={locale} backLabel={content.nav.back} brand={content.brand.name} tagline={content.brand.tagline} showBack={false} socialHeading={content.footer.social_heading} themeLabels={content.footer} socials={getCompanySocials(content)} />
    </>
  );
}