import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Music Trends Local — Rhine Solution",
  description: "A cyber-themed music portal showcasing top songs, artists, and genres — 48 tracks across 8 electronic sub-genres.",
};

export default function MusicProjectPage() {
  return (
    <>
      <Nav locale="en" brand="Rhine Solution" labels={{ home: "Home", team: "Team", projects: "Projects" }} current="projects" />
      <main id="main" className="container page">
        <article style={{ maxWidth: "60rem", margin: "0 auto" }}>
          <header style={{ marginBottom: "var(--space-5)" }}>
            <p style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: "var(--space-2)",
            }}>
              PROJECT · 2026 · RAGNAROK + ZeroMeister
            </p>
            <h1 style={{ marginBottom: "var(--space-3)" }}>Music Trends Local</h1>
            <p style={{ fontSize: "1.15rem", color: "var(--color-text-muted)" }}>
              A cyber-themed music portal showcasing top songs, artists, and genres — 48 tracks across 8 electronic sub-genres with search, filters, and localStorage favorites.
            </p>
          </header>

          <section style={{ marginBottom: "var(--space-5)" }}>
            <h2>Stack</h2>
            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.95rem" }}>
              HTML5 · CSS · Bootstrap · JavaScript · SVG · Next.js 15 · Local JSON · localStorage
            </p>
          </section>

          <section style={{ marginBottom: "var(--space-5)" }}>
            <h2>What it does</h2>
            <ul style={{ paddingLeft: "1.5rem" }}>
              <li>Browse <strong>48 songs</strong> across <strong>8 electronic genres</strong> (synthwave, cyberpunk, techno, dark synth, vaporwave, industrial, EBM, retrowave)</li>
              <li>Discover <strong>18 fictional artists</strong> with bios and top tracks</li>
              <li>Search by title or artist (instant filter)</li>
              <li>Sort by popularity, title, or year</li>
              <li>Filter by genre</li>
              <li>Save favorites (persisted in localStorage across sessions)</li>
              <li>Click any card for a detail modal with bio + stats</li>
              <li>Responsive — works on phone, tablet, desktop</li>
            </ul>
          </section>

          <section style={{ marginBottom: "var(--space-5)" }}>
            <h2>Design</h2>
            <p>
              Cyberpunk-inspired aesthetic: pure black background with animated star pixel field (two twinkling layers in cyan and magenta), monospace headings, neon glow on cards, glitch animation on the H1. Per-genre accent colors throughout.
            </p>
          </section>

          <section style={{ marginBottom: "var(--space-5)" }}>
            <h2>Technical notes</h2>
            <ul style={{ paddingLeft: "1.5rem" }}>
              <li>Data loaded from a local <code>music.json</code> (no external API)</li>
              <li>Interactive components (filter/sort/search/favorites) are React client components</li>
              <li>Album covers are procedurally-generated SVGs (no external image dependencies)</li>
              <li>SEO: per-page <code>&lt;title&gt;</code> and <code>&lt;meta description&gt;</code>, semantic HTML5, sitemap entries</li>
            </ul>
          </section>

          <section style={{
            marginTop: "var(--space-6)",
            padding: "var(--space-5)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
            textAlign: "center",
          }}>
            <h2 style={{ marginBottom: "var(--space-3)" }}>Try it</h2>
            <p style={{ marginBottom: "var(--space-4)" }}>
              The music portal lives at <code>/music</code> on this site. Click below to enter the cyber grid.
            </p>
            <Link
              href="/music"
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "1rem",
                padding: "0.75rem 1.5rem",
              }}
            >
              ♫ Launch Music Portal
            </Link>
          </section>
        </article>
      </main>
      <Footer locale="en" backLabel="← Back to Rhine Solution" socialHeading="Find us elsewhere" />
    </>
  );
}
