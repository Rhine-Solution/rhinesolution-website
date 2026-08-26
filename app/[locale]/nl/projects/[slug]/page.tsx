import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import content from "../../../../../content/nl.json";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return ["rhinesolution", "brain", "macmini"].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = (content as Record<string, any>)[`project_${slug}`];
  if (!p) return { title: "Not found" };
  return { title: p.title, description: p.summary };
}

export default async function ProjectDetailEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = `project_${slug}` as keyof typeof content;
  const p = (content as Record<string, any>)[`project_${slug}`];
  if (!p) notFound();
  return (
    <>
      <Nav locale="en" brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <h1>{p.title}</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{p.summary}</p>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>Stack</h2>
          <ul className="skills">
            {p.stack.map((s: string) => <li key={s}>{s}</li>)}
          </ul>
        </section>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>Year</h2>
          <p>{p.year}</p>
        </section>
      </main>
      <Footer locale="en" backLabel={content.nav.back} socialHeading={content.footer.social_heading} />
    </>
  );
}
