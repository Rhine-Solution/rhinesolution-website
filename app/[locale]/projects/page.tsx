import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getContent, getProjects } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import {
  LuBrain,
  LuGlobe,
  LuMusic,
  LuServer,
  LuArrowUpRight,
} from "react-icons/lu";

type Props = { params: Promise<{ locale: string }> };

const projectIcons: Record<string, typeof LuGlobe> = {
  globe: LuGlobe,
  brain: LuBrain,
  server: LuServer,
  music: LuMusic,
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const c = getContent(locale);
  return buildMetadata(locale, "/projects", {
    title: c.projects.title,
    description: c.projects.subtitle,
  });
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const t = content.projects;
  const items = getProjects(content, ["project_rhinesolution", "project_brain", "project_macmini", "project_music"])
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (b.featured && !a.featured) return 1;
      return Number(b.year) - Number(a.year);
    });

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <header className="page-head">
          <p className="section-eyebrow">{content.sections.featured_work}</p>
          <h1>{t.title}</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{t.subtitle}</p>
        </header>
        <div
          className="projects-grid"
          style={{ marginTop: "var(--space-5)" }}
        >
          {items.map((p) => {
            const Icon = projectIcons[p.icon ?? ""] ?? LuGlobe;
            return (
              <Link
                key={p.slug}
                href={`/${locale}/projects/${p.slug}`}
                className={`card project-card${p.featured ? " featured" : ""}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {p.featured && (
                  <span className="featured-tag">{t.featured_label}</span>
                )}
                <div className="project-card-head">
                  <span className="project-icon" aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <h2>{p.title}</h2>
                </div>
                <p className="project-summary">{p.summary}</p>
                <div className="project-card-foot">
                  <p className="project-meta">
                    {p.stack.join(" · ")} · {p.year}
                  </p>
                  <span className="read-more">
                    {t.read_more}
                    <LuArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
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