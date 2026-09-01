import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import content from "../../../content/en.json";
import Link from "next/link";

export const metadata = { title: "Projects" };

export default function ProjectsEn() {
  const t = content.projects;
  const items = ["project_rhinesolution", "project_brain", "project_macmini"].map((k) => (content as Record<string, any>)[k]);
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
          <Link
            href="/music"
            className="card"
            style={{
              textDecoration: "none",
              color: "inherit",
              borderColor: "var(--accent-cyan)",
              background: "linear-gradient(135deg, rgba(0,255,255,0.05), rgba(255,0,255,0.05))",
            }}
          >
            <div style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "var(--accent-cyan)",
              letterSpacing: "0.2em",
              marginBottom: "0.5rem",
            }}>
              TEAM PROJECT
            </div>
            <h2>Music Trends Local</h2>
            <p>Cyber-themed music portal — browse top songs, artists, and genres. 48 tracks across 8 electronic sub-genres.</p>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: 0 }}>
              HTML5 · CSS · Bootstrap · JavaScript · SVG · RAGNAROK + ZeroMeister · 2026
            </p>
          </Link>
        </div>
      </main>
      <Footer locale="en" backLabel={content.nav.back} socialHeading={content.footer.social_heading} />
    </>
  );
}
