import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getContent, getProjects } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return { title: getContent(locale).projects.title };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  const content = getContent(locale);
  const t = content.projects;
  const items = getProjects(content, ["project_rhinesolution", "project_brain", "project_macmini", "project_music"]);

  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} themeLabels={content.footer} current="projects" />
      <main id="main" className="container page">
        <h1>{t.title}</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{t.subtitle}</p>
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
      <Footer locale={locale} backLabel={content.nav.back} brand={content.brand.name} tagline={content.brand.tagline} socialHeading={content.footer.social_heading} themeLabels={content.footer} socials={getCompanySocials(content)} />
    </>
  );
}