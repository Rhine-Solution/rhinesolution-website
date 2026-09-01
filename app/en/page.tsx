import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import content from "../../content/en.json";
import Link from "next/link";

export const metadata = { title: "Rhine Solution" };

export default function HomeEn() {
  const t = content.home;
  const brand = content.brand.name;
  const projects = ["project_rhinesolution", "project_brain", "project_macmini"]
    .map((k) => (content as Record<string, any>)[k]);

  return (
    <>
      <Nav locale="en" brand={brand} labels={content.nav} current="home" />
      <main id="main" className="page">
        <section className="container hero">
          <h1>{t.hero_title}</h1>
          <p>{t.hero_subtitle}</p>
          <div className="ctas">
            <Link href="/en/team" className="btn btn-primary">{t.cta_team}</Link>
            <Link href="/en/projects" className="btn btn-secondary">{t.cta_projects}</Link>
          </div>
        </section>
        <section className="container" style={{ marginTop: "var(--space-7)" }}>
          <h2>{t.section_projects_title}</h2>
          <p style={{ color: "var(--color-text-muted)" }}>{t.section_projects_text}</p>
          <div className="grid" style={{ marginTop: "var(--space-4)" }}>
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`/en/projects/${p.slug}`}
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
            <Link href="/en/team/ragnarok" className="card" style={{ textDecoration: "none", color: "inherit" }}>
              <h3>{content.ragnarok.name}</h3>
              <p style={{ color: "var(--color-accent)", marginBottom: "var(--space-2)" }}>{content.ragnarok.role}</p>
              <p style={{ marginBottom: 0 }}>{content.ragnarok.tagline}</p>
            </Link>
            <Link href="/en/team/zeromeister" className="card" style={{ textDecoration: "none", color: "inherit" }}>
              <h3>{content.zeromeister.name}</h3>
              <p style={{ color: "var(--color-accent)", marginBottom: "var(--space-2)" }}>{content.zeromeister.role}</p>
              <p style={{ marginBottom: 0 }}>{content.zeromeister.tagline}</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer
        locale="en"
        backLabel={content.nav.back}
        socialHeading={content.footer.social_heading}
        socials={[
          { href: content.ragnarok.social.github, label: "GitHub" },
          { href: content.ragnarok.social.x, label: "X" },
          { href: content.ragnarok.social.linkedin, label: "LinkedIn" },
          { href: content.ragnarok.social.youtube, label: "YouTube" },
          { href: content.ragnarok.social.tiktok, label: "TikTok" },
          { href: content.ragnarok.social.reddit, label: "Reddit" },
          { href: content.ragnarok.social.pinterest, label: "Pinterest" },
        ]}
      />
    </>
  );
}
