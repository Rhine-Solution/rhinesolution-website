import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import content from "../../../../content/nl.json";

export const metadata = { title: "ZeroMeister — CTO" };

export default function ZeromeisterEn() {
  const p = content.zeromeister;
  return (
    <>
      <Nav locale="en" brand={content.brand.name} labels={content.nav} current="team" />
      <main id="main" className="container page">
        <header className="portfolio-header">
          <h1>{p.name}</h1>
          <p className="role">{p.role}</p>
          <p className="tagline">{p.tagline}</p>
        </header>
        <section>
          <h2>About</h2>
          <p>{p.bio}</p>
        </section>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>Skills</h2>
          <ul className="skills">
            {p.skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>Find me online</h2>
          <div className="socials">
            {Object.entries(p.social).map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noopener noreferrer">{k}</a>
            ))}
          </div>
        </section>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>Featured work</h2>
          <p style={{ color: "var(--color-text-muted)" }}>Selected projects ZeroMeister built or maintained.</p>
        </section>
      </main>
      <Footer locale="en" backLabel={content.nav.back} socialHeading={content.footer.social_heading} />
    </>
  );
}
