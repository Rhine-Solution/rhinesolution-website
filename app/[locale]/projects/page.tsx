import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getContent, getProjects } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

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
  const items = getProjects(content, ["project_rhinesolution", "project_brain", "project_macmini", "project_music"]);

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <header className="page-head">
          <p className="section-eyebrow">{content.sections.featured_work}</p>
          <h1>{t.title}</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{t.subtitle}</p>
        </header>
        <div className="grid" style={{ marginTop: "var(--space-5)" }}>
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/${locale}/projects/${p.slug}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <h2>{p.title}</h2>
              <p>{p.summary}</p>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 0 }}>
                {p.stack.join(" · ")} · {p.year}
              </p>
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