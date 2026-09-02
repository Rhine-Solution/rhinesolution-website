import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StatementBand from "@/components/StatementBand";
import SectionDivider from "@/components/SectionDivider";
import { getContent, getProjects } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const t = content.home;
  const projects = getProjects(content, [
    "project_rhinesolution",
    "project_brain",
    "project_macmini",
    "project_music",
  ]);

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="home" />
      <main id="main">
        <section className="hero-section">
          <p className="hero-eyebrow">{t.hero_line_1}</p>
          <h1 className="hero-title" aria-label={t.hero_line_2}>
            {t.hero_line_2.split("").map((ch, i) => (
              <span key={i} className="hero-letter" style={{ animationDelay: `${i * 40}ms` }} aria-hidden="true">
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h1>
          <p className="hero-sub">{t.hero_subtitle}</p>
          <div className="hero-ctas">
            <Link href={`/${locale}/projects`} className="btn btn-primary">
              {t.cta_projects}
            </Link>
            <Link href={`/${locale}/about`} className="btn btn-secondary">
              {t.cta_about}
            </Link>
          </div>
        </section>

        <section className="hero-section">
          <p className="stage-eyebrow">{t.stage_b_eyebrow}</p>
          <h2 className="stage-title" aria-label={t.stage_b_title}>
            {t.stage_b_title.split("").map((ch, i) => (
              <span key={i} className="hero-letter" style={{ animationDelay: `${i * 35}ms` }} aria-hidden="true">
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </h2>
          <p className="stage-sub">{t.stage_b_text}</p>
          <div className="stage-ctas">
            <Link href={`/${locale}/projects`} className="btn btn-primary">
              {t.stage_b_link}
            </Link>
          </div>
        </section>

        {t.statements.map((s, i) => (
          <StatementBand
            key={s.heading}
            locale={locale}
            index={i}
            eyebrow={s.eyebrow}
            heading={s.heading}
            body={s.body}
            linkLabel={s.link_label}
            href={s.href}
          />
        ))}

        <SectionDivider
          number="02"
          eyebrow="Selected work"
          text="Built and shipped."
        />

        <section className="container featured">
          <p className="section-eyebrow">{content.sections.featured_work}</p>
          <h2>{t.featured_title}</h2>
          <p style={{ color: "var(--color-text-muted)" }}>{t.featured_text}</p>
          <div className="grid" style={{ marginTop: "var(--space-5)" }}>
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`/${locale}/projects/${p.slug}`}
                className="project-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="project-card-content">
                  <h3>{p.title}</h3>
                  <p style={{ marginBottom: "var(--space-2)" }}>{p.summary}</p>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", marginBottom: 0 }}>
                    {p.stack.join(" · ")} · {p.year}
                  </p>
                </div>
                <div className="project-card-preview" aria-hidden="true">
                  <div className="project-card-preview-stack">
                    {p.stack.slice(0, 4).map((tech) => (
                      <span key={tech} className="project-card-tech">{tech}</span>
                    ))}
                  </div>
                  <span className="project-card-arrow">View project →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer locale={locale} backLabel={content.nav.back} brand={content.brand.name} tagline={content.brand.tagline} showBack={false} socialHeading={content.footer.social_heading} socials={getCompanySocials(content)} />
    </>
  );
}