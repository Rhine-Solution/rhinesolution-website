import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import { getContent, getProjects, sortProjects } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

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
  const items = sortProjects(getProjects(content, ["project_rhinesolution", "project_brain", "project_macmini", "project_music"]));

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="projects" />
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
          {items.map((p) => (
            <ProjectCard
              key={p.slug}
              project={p}
              locale={locale}
              featuredLabel={t.featured_label}
              readMoreLabel={t.read_more}
            />
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