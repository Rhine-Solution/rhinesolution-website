import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getContent, getProject } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaMusic } from "react-icons/fa6";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return [
    { locale: "en", slug: "rhinesolution" },
    { locale: "en", slug: "macmini" },
    { locale: "en", slug: "music" },
    { locale: "nl", slug: "rhinesolution" },
    { locale: "nl", slug: "macmini" },
    { locale: "nl", slug: "music" },
  ];
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const content = getContent(locale);
  const p = getProject(content, slug);
  if (!p) return { title: "Not found" };
  return buildMetadata(locale, `/projects/${slug}`, {
    title: p.title,
    description: p.summary,
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const content = getContent(locale);
  const t = content.sections;
  const p = getProject(content, slug);
  if (!p) notFound();
  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} current="projects" />
      <main id="main" className="container page">
        <h1>{p.title}</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "1.1rem" }}>{p.summary}</p>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>{t.stack}</h2>
          <ul className="skills">
            {p.stack.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>{t.year}</h2>
          <p>{p.year}</p>
        </section>
        {p.team && (
          <section style={{ marginTop: "var(--space-5)" }}>
            <h2>{t.team}</h2>
            <p>{p.team}</p>
          </section>
        )}
        {p.live_url && (
          <section style={{ marginTop: "var(--space-6)" }}>
            <Link
              href={p.live_url}
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem", padding: "0.75rem 1.5rem" }}
            >
              <FaMusic size={16} aria-hidden="true" />
              {t.launch} {p.title}
            </Link>
          </section>
        )}
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