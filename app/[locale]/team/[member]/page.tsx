import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SocialIcon from "@/components/SocialIcon";
import { getContent, getMember } from "@/lib/i18n";
import { getCompanySocials, socialLabel } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ locale: string; member: string }> };

export async function generateStaticParams() {
  return [
    { locale: "en", member: "ragnarok" },
    { locale: "en", member: "zeromeister" },
    { locale: "nl", member: "ragnarok" },
    { locale: "nl", member: "zeromeister" },
  ];
}

export async function generateMetadata({ params }: Props) {
  const { locale, member } = await params;
  const content = getContent(locale);
  const p = getMember(content, member);
  if (!p) return { title: "Not found" };
  return buildMetadata(locale, `/team/${member}`, {
    title: `${p.name} â€” ${p.role}`,
    description: p.tagline,
  });
}

export default async function MemberPage({ params }: Props) {
  const { locale, member } = await params;
  const content = getContent(locale);
  const t = content.sections;
  const p = getMember(content, member);
  if (!p) notFound();
  return (
    <>
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="team" />
      <main id="main" className="container page">
        <header className="portfolio-header">
          <h1>{p.name}</h1>
          <p className="role">{p.role}</p>
          <p className="tagline">{p.tagline}</p>
        </header>
        <section>
          <h2>{t.about}</h2>
          <p>{p.bio}</p>
        </section>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>{t.skills}</h2>
          <ul className="skills">
            {p.skills.map((s) => <li key={s}>{s}</li>)}
          </ul>
        </section>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>{t.social}</h2>
          <div className="socials">
            {Object.entries(p.social).map(([name, href]) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={socialLabel(name)}>
                <SocialIcon name={name} size={20} />
                <span>{socialLabel(name)}</span>
              </a>
            ))}
          </div>
        </section>
        <section style={{ marginTop: "var(--space-5)" }}>
          <h2>{t.featured_work}</h2>
          {p.featured && p.featured.length > 0 ? (
            <>
              <p style={{ color: "var(--color-text-muted)" }}>{t.featured_work_text}</p>
              <div className="grid" style={{ marginTop: "var(--space-3)" }}>
                {p.featured.map((f) => (
                  <Link
                    key={f.href}
                    href={localizeHref(f.href, locale)}
                    className="card"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <h3>{f.title}</h3>
                    {f.meta && (
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{f.meta}</p>
                    )}
                    {f.summary && <p>{f.summary}</p>}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: "var(--color-text-muted)" }}>{t.featured_work_text}</p>
          )}
        </section>
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

// Featured-work hrefs in content may carry a hardcoded locale prefix (e.g.
// "/en/dfir/cybercrime-report"). Rewrite it to the visitor's locale so the
// link always lands on the matching localized page. Locale-agnostic paths
// (e.g. "/dfir/lab041") are left untouched.
function localizeHref(href: string, locale: string): string {
  const locales = ["en", "nl", "de", "fr", "es", "it", "zh"];
  const first = href.split("/").filter(Boolean)[0] ?? "";
  if (locales.includes(first)) {
    return `/${locale}/${href.split("/").slice(2).join("/")}`;
  }
  return href;
}