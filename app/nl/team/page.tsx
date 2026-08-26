import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import content from "../../../content/nl.json";
import Link from "next/link";

export const metadata = { title: "Team" };

export default function TeamEn() {
  const t = content.team;
  return (
    <>
      <Nav locale="en" brand={content.brand.name} labels={content.nav} current="team" />
      <main id="main" className="container page">
        <h1>{t.title}</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{t.subtitle}</p>
        <div className="grid" style={{ marginTop: "var(--space-5)" }}>
          <Link href="/nl/team/ragnarok" className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <h2>{content.ragnarok.name}</h2>
            <p style={{ color: "var(--color-accent)" }}>{content.ragnarok.role}</p>
            <p>{content.ragnarok.tagline}</p>
          </Link>
          <Link href="/nl/team/zeromeister" className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <h2>{content.zeromeister.name}</h2>
            <p style={{ color: "var(--color-accent)" }}>{content.zeromeister.role}</p>
            <p>{content.zeromeister.tagline}</p>
          </Link>
        </div>
      </main>
      <Footer locale="en" backLabel={content.nav.back} socialHeading={content.footer.social_heading} />
    </>
  );
}
