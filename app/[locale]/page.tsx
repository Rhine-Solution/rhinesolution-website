import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StatementBand from "@/components/StatementBand";
import SectionDivider from "@/components/SectionDivider";
import ClosingCta from "@/components/ClosingCta";
import EntryGate from "@/components/EntryGate";
import ProjectCard from "@/components/ProjectCard";
import { getContent, getProjects, sortProjects } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "", {
    title: c.brand.name,
    description: c.brand.tagline,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const t = content.home;
  const projects = sortProjects(
    getProjects(content, [
      "project_rhinesolution",
      "project_brain",
      "project_macmini",
      "project_music",
      "project_plan2shift",
    ])
  );

  const renderLetters = (text: string, step: number) => {
    const words = text.split(" ");
    let idx = 0;
    return words.map((word, w) => (
      <span key={w} className="hero-word" aria-hidden="true">
        {word.split("").map((ch, ci) => {
          const delay = idx * step;
          idx += 1;
          return (
            <span key={`${w}-${ci}-${ch}`} className="hero-letter" style={{ animationDelay: `${delay}ms` }}>
              {ch}
            </span>
          );
        })}
      </span>
    ));
  };

  return (
    <>
      <EntryGate
        locale={locale}
        eyebrow={content.gate.eyebrow}
        title={content.gate.title}
        body={content.gate.body}
        verifiedLabel={content.gate.verified}
      />
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="home" />
      <main id="main">
        <section className="hero-section">
          <p className="hero-eyebrow">{t.hero_line_1}</p>
          <h1 className="hero-title" aria-label={t.hero_line_2}>
            {renderLetters(t.hero_line_2, 40)}
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
            {renderLetters(t.stage_b_title, 35)}
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
          eyebrow={content.sections.featured_work}
          text={content.sections.featured_work_text}
        />

        <section className="container featured">
          <p className="section-eyebrow">{content.sections.featured_work}</p>
          <h2>{t.featured_title}</h2>
          <p style={{ color: "var(--color-text-muted)" }}>{t.featured_text}</p>
          <div className="projects-grid" style={{ marginTop: "var(--space-5)" }}>
            {projects.map((p) => (
              <ProjectCard
                key={p.slug}
                project={p}
                locale={locale}
                featuredLabel={content.projects.featured_label}
                readMoreLabel={content.projects.read_more}
                headingLevel="h3"
              />
            ))}
          </div>
        </section>
      </main>

      <ClosingCta locale={locale} labels={t.closing_cta} />

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