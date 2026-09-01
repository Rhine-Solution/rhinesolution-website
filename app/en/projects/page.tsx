import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import content from "../../../content/en.json";
import Link from "next/link";

export const metadata = { title: "Projects" };

export default function ProjectsEn() {
  const t = content.projects;
  const items = ["project_rhinesolution", "project_brain", "project_macmini", "project_music"]
    .map((k) => (content as Record<string, any>)[k]);
  return (
    <>
      <Nav locale="en" brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <h1>{t.title}</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{t.subtitle}</p>
        <div className="grid" style={{ marginTop: "var(--space-5)" }}>
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/en/projects/${p.slug}`}
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
      <Footer locale="en" backLabel={content.nav.back} socialHeading={content.footer.social_heading} />
    </>
  );
}
