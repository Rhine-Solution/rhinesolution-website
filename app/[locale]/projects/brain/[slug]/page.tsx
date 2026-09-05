import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BrainSidebar from "@/components/brain/BrainSidebar";
import BrainMarkdown from "@/components/brain/BrainMarkdown";
import { getContent, locales } from "@/lib/i18n";
import { getCompanySocials } from "@/lib/socials";
import { buildMetadata } from "@/lib/seo";
import { getBrainManifest, getNoteBySlug, getNoteMarkdown } from "@/lib/brain";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/brain/brain.module.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const manifest = getBrainManifest();
  return Object.values(manifest.notes).flatMap((n) =>
    locales.map((locale) => ({ locale, slug: n.slug })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return { title: "Not found" };
  return buildMetadata(locale, `/projects/brain/${slug}`, {
    title: note.title,
    description: note.excerpt,
  });
}

export default async function BrainNotePage({ params }: Props) {
  const { locale, slug } = await params;
  const content = getContent(locale);
  const note = getNoteBySlug(slug);
  if (!note) notFound();
  const manifest = getBrainManifest();
  const md = getNoteMarkdown(slug, locale);

  // Prev/next within the same folder (using the curated folder order).
  const folder = manifest.folders.find((f) => f.notes.includes(slug));
  const ordered = folder?.notes ?? [];
  const idx = ordered.indexOf(slug);
  const prevSlug = idx > 0 ? ordered[idx - 1] : undefined;
  const nextSlug = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : undefined;
  const prev = prevSlug ? manifest.notes[prevSlug] : undefined;
  const next = nextSlug ? manifest.notes[nextSlug] : undefined;

  // Related notes = outlinks that are themselves published.
  const related = (note.outlinks ?? [])
    .map((s) => manifest.notes[s])
    .filter((n): n is NonNullable<typeof n> => Boolean(n))
    .slice(0, 3);

  const pageUrl = `${"https://rhinesolution.com"}/${locale}/projects/brain/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: note.title,
    description: note.excerpt,
    dateModified: note.updated || undefined,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: content.nav.projects, item: `https://rhinesolution.com/${locale}/projects` },
        { "@type": "ListItem", position: 2, name: content.brain.title, item: `https://rhinesolution.com/${locale}/projects/brain` },
        { "@type": "ListItem", position: 3, name: note.title },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav locale={locale} brand={content.brand.name} labels={content.nav} navLabel={content.a11y.nav_label} current="projects" />
      <main id="main" className="container page">
        <div className={styles.explorer}>
          <BrainSidebar manifest={manifest} locale={locale} labels={content.brain.folders} active={slug} />
          <article className={styles.explorerMain}>
            <nav className={styles.crumbs} aria-label="Breadcrumb">
              <Link href={`/${locale}/projects`}>{content.nav.projects}</Link>
              <span aria-hidden="true"> / </span>
              <Link href={`/${locale}/projects/brain`}>{content.brain.title}</Link>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">{note.title}</span>
            </nav>
            <BrainMarkdown content={md} />
            {(prev || next) && (
              <nav className={styles.prevNext} aria-label="Notes in this folder">
                {prev ? <Link href={`/${locale}/projects/brain/${prev.slug}`}>← {prev.title}</Link> : <span />}
                {next ? <Link href={`/${locale}/projects/brain/${next.slug}`}>{next.title} →</Link> : <span />}
              </nav>
            )}
            {related.length > 0 && (
              <aside className={styles.related}>
                <h2>{content.brain.related}</h2>
                <ul>
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/${locale}/projects/brain/${r.slug}`}>{r.title}</Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
            <p className={styles.noteBack}>
              <Link href={`/${locale}/projects/brain`}>← {content.brain.back}</Link>
            </p>
          </article>
        </div>
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